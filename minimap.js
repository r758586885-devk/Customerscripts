var module_MiniMap = new Module("MiniMap", true, true, ModuleCategory.MISC);

var colorSetting = new ModeSetting("Color", ["Client", "Orange", "Red", "Pink", "Purple", "Blue", "Green", "Aqua"]);
var shapeSetting = new ModeSetting("Shape", ["Square", "Circle"]);
var sizeSetting = new SliderSetting("Size", [120, 80, 250, 10]);
var zoomSetting = new SliderSetting("Zoom", [4, 1, 20, 0.5]);
var showPlayersSetting = new StateSetting("ShowPlayers", true);
var showNamesSetting = new StateSetting("ShowNames", true);
var backgroundColorSetting = new SliderSetting("BgAlpha", [180, 0, 255, 5]);
var borderSetting = new StateSetting("Border", true);
var updateSpeedSetting = new SliderSetting("UpdateSpeed", [20, 1, 60, 1]);
var antibotMode = new ModeSetting("AntiBot", ["BreadixSWBW", "BreadixDuels", "Off"]);
var lookPositionSetting = new StateSetting("LookPosition", false);
var miniMapPosition = { x: -1, y: -1 };
var lastTouchTime = 0;

module_MiniMap.addSettings([
    colorSetting,
    shapeSetting,
    sizeSetting,
    zoomSetting,
    showPlayersSetting,
    showNamesSetting,
    backgroundColorSetting,
    borderSetting,
    updateSpeedSetting,
    antibotMode,
    lookPositionSetting
]);

function getColor() {
    var mode = colorSetting.getCurrentMode();
    if (mode == "Client") return android.graphics.Color.parseColor("#127A9D");
    if (mode == "Orange") return android.graphics.Color.parseColor("#FFA500");
    if (mode == "Red") return android.graphics.Color.parseColor("#FF0000");
    if (mode == "Pink") return android.graphics.Color.parseColor("#FFD1DC");
    if (mode == "Purple") return android.graphics.Color.parseColor("#FF00FF");
    if (mode == "Blue") return android.graphics.Color.parseColor("#008CF0");
    if (mode == "Green") return android.graphics.Color.parseColor("#00FF00");
    if (mode == "Aqua") return android.graphics.Color.parseColor("#00FFFF");
    return android.graphics.Color.parseColor("#FF00FF");
}

var miniMapPopup = null;
var miniMapLayout = null;
var context = null;
var updateHandler = null;
var lastPositions = {};
var isDragging = false;
var dragStartX = 0;
var dragStartY = 0;
var popupStartX = 0;
var popupStartY = 0;

function dip2px(px) {
    return px * getContext().getResources().getDisplayMetrics().density;
}

function isValidTarget(id) {
    if (!Player.isInWorld(id)) return false;
    if (Player.isLocalPlayer(id)) return false;
    if (!Player.isAlive(id)) return false;
    
    var antibot = antibotMode.getCurrentMode();
    
    if (antibot === "Off") {
        return true;
    }
    
    if (antibot === "BreadixDuels") {
        if (Player.getHealth(id) < 0) return false;
        if (!Player.canShowNameTag(id)) return false;
        if (Player.isImmobile(id)) return false;
        if (Player.isInWall(id)) return false;
        if (Player.isInCreativeMode(id)) return false;
        if (Player.getStatusFlag(id, 8)) return false;
        if (Player.getStatusFlag(id, 16)) return false;
        if (Player.getStatusFlag(id, 18)) return false;
        if (Player.getStatusFlag(id, 2)) return false;
        if (!hasMoved(id)) return false;
        return true;
    }
    
    if (antibot === "BreadixSWBW") {
        if (!Player.getStatusFlag(id, 8)) return false;
        if (Player.getStatusFlag(id, 16)) return false;
        if (Player.getStatusFlag(id, 25)) return false;
        if (Player.getStatusFlag(id, 18)) return false;
        return true;
    }
    
    return true;
}

function hasMoved(id) {
    if (!lastPositions[id]) {
        lastPositions[id] = {
            x: Player.getPositionX(id),
            y: Player.getPositionY(id),
            z: Player.getPositionZ(id)
        };
        return false;
    }
    
    var x = Player.getPositionX(id);
    var y = Player.getPositionY(id);
    var z = Player.getPositionZ(id);
    
    var moved = (x !== lastPositions[id].x || 
                 y !== lastPositions[id].y || 
                 z !== lastPositions[id].z);
    
    lastPositions[id] = { x: x, y: y, z: z };
    return moved;
}

function getValidPlayers() {
    if (!LocalPlayer.isInGame()) return [];
    
    var players = Level.getAllPlayers();
    var result = [];
    
    for (var i = 0; i < players.length; i++) {
        var id = players[i];
        if (isValidTarget(id)) {
            result.push(id);
        }
    }
    
    return result;
}

function handleTouchEvent(view, event) {
    if (!lookPositionSetting.isActive()) return false;
    
    var action = event.getAction();
    var touchX = event.getRawX();
    var touchY = event.getRawY();
    
    if (action === android.view.MotionEvent.ACTION_DOWN) {
        var popupView = miniMapPopup.getContentView();
        var popupX = popupView.getLeft();
        var popupY = popupView.getTop();
        var popupWidth = popupView.getWidth();
        var popupHeight = popupView.getHeight();
        
        if (touchX >= popupX && touchX <= popupX + popupWidth &&
            touchY >= popupY && touchY <= popupY + popupHeight) {
            isDragging = true;
            dragStartX = touchX;
            dragStartY = touchY;
            popupStartX = popupX;
            popupStartY = popupY;
            return true;
        }
    }
    else if (action === android.view.MotionEvent.ACTION_MOVE && isDragging) {
        var dx = touchX - dragStartX;
        var dy = touchY - dragStartY;
        
        var newX = popupStartX + dx;
        var newY = popupStartY + dy;
        
        var screenWidth = context.getResources().getDisplayMetrics().widthPixels;
        var screenHeight = context.getResources().getDisplayMetrics().heightPixels;
        var sizePx = dip2px(sizeSetting.getCurrentValue());
        
        newX = Math.max(0, Math.min(screenWidth - sizePx, newX));
        newY = Math.max(0, Math.min(screenHeight - sizePx, newY));
        
        miniMapPosition.x = newX;
        miniMapPosition.y = newY;
        
        miniMapPopup.update(newX, newY, -1, -1);
        
        return true;
    }
    else if (action === android.view.MotionEvent.ACTION_UP || 
             action === android.view.MotionEvent.ACTION_CANCEL) {
        isDragging = false;
        return true;
    }
    
    return false;
}

function createMiniMap() {
    context = getContext();
    if (!context) return;
    
    context.runOnUiThread(new java.lang.Runnable({
        run: function() {
            try {
                if (miniMapPopup != null) return;
                
                miniMapLayout = new android.widget.FrameLayout(context);
                
                var size = sizeSetting.getCurrentValue();
                var sizePx = dip2px(size);
                
                var screenWidth = context.getResources().getDisplayMetrics().widthPixels;
                var margin = dip2px(10);
                
                var xPos = margin;
                var yPos = margin;
                
                if (miniMapPosition.x !== -1 && miniMapPosition.y !== -1) {
                    xPos = Math.max(0, Math.min(screenWidth - sizePx, miniMapPosition.x));
                    yPos = Math.max(0, Math.min(screenWidth - sizePx, miniMapPosition.y));
                } else {
                    xPos = screenWidth - sizePx - margin;
                    yPos = margin;
                }
                
                miniMapPopup = new android.widget.PopupWindow(
                    miniMapLayout,
                    sizePx,
                    sizePx,
                    false
                );
                
                miniMapPopup.setBackgroundDrawable(new android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT));
                miniMapPopup.setTouchable(true);
                miniMapPopup.setOutsideTouchable(false);
                miniMapPopup.setFocusable(false);
                miniMapPopup.setClippingEnabled(false);
                
                var touchListener = new android.view.View.OnTouchListener({
                    onTouch: function(view, event) {
                        return handleTouchEvent(view, event);
                    }
                });
                
                miniMapLayout.setOnTouchListener(touchListener);
                
                miniMapPopup.showAtLocation(
                    context.getWindow().getDecorView(),
                    android.view.Gravity.TOP | android.view.Gravity.LEFT,
                    xPos,
                    yPos
                );
                
                startUpdateLoop();
                
            } catch(e) {
                print("MiniMap create error: " + e);
            }
        }
    }));
}

function drawMiniMap() {
    if (!miniMapLayout || !module_MiniMap.isActive() || !LocalPlayer.isInGame()) return;
    
    context.runOnUiThread(new java.lang.Runnable({
        run: function() {
            try {
                if (!miniMapLayout || !LocalPlayer.isInGame()) return;
                
                miniMapLayout.removeAllViews();
                
                var width = miniMapLayout.getWidth();
                var height = miniMapLayout.getHeight();
                
                if (width <= 0 || height <= 0) return;
                
                var centerX = width / 2;
                var centerY = height / 2;
                
                var bgAlpha = backgroundColorSetting.getCurrentValue();
                var bgColor = android.graphics.Color.argb(bgAlpha, 0, 0, 0);
                
                var bgView = new android.view.View(context);
                
                var shape = shapeSetting.getCurrentMode();
                if (shape === "Circle") {
                    var bgDrawable = new android.graphics.drawable.GradientDrawable();
                    bgDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
                    bgDrawable.setColor(bgColor);
                    bgView.setBackground(bgDrawable);
                } else {
                    bgView.setBackgroundColor(bgColor);
                }
                
                var bgParams = new android.widget.FrameLayout.LayoutParams(
                    width,
                    height
                );
                miniMapLayout.addView(bgView, bgParams);
                
                if (borderSetting.isActive()) {
                    var borderColor = getColor();
                    
                    if (shape === "Circle") {
                        var borderDrawable = new android.graphics.drawable.GradientDrawable();
                        borderDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
                        borderDrawable.setStroke(dip2px(2), borderColor);
                        borderDrawable.setColor(android.graphics.Color.TRANSPARENT);
                        
                        var borderView = new android.view.View(context);
                        borderView.setBackground(borderDrawable);
                        
                        var borderSize = dip2px(4);
                        var borderParams = new android.widget.FrameLayout.LayoutParams(
                            width + borderSize,
                            height + borderSize
                        );
                        borderParams.leftMargin = -borderSize/2;
                        borderParams.topMargin = -borderSize/2;
                        miniMapLayout.addView(borderView, borderParams);
                    } else {
                        var borderView = new android.view.View(context);
                        borderView.setBackgroundColor(borderColor);
                        
                        var borderParams = new android.widget.FrameLayout.LayoutParams(
                            width,
                            dip2px(1)
                        );
                        miniMapLayout.addView(borderView, borderParams);
                        
                        var borderBottomView = new android.view.View(context);
                        borderBottomView.setBackgroundColor(borderColor);
                        
                        var borderBottomParams = new android.widget.FrameLayout.LayoutParams(
                            width,
                            dip2px(1)
                        );
                        borderBottomParams.gravity = android.view.Gravity.BOTTOM;
                        miniMapLayout.addView(borderBottomView, borderBottomParams);
                        
                        var borderLeftView = new android.view.View(context);
                        borderLeftView.setBackgroundColor(borderColor);
                        
                        var borderLeftParams = new android.widget.FrameLayout.LayoutParams(
                            dip2px(1),
                            height
                        );
                        miniMapLayout.addView(borderLeftView, borderLeftParams);
                        
                        var borderRightView = new android.view.View(context);
                        borderRightView.setBackgroundColor(borderColor);
                        
                        var borderRightParams = new android.widget.FrameLayout.LayoutParams(
                            dip2px(1),
                            height
                        );
                        borderRightParams.gravity = android.view.Gravity.RIGHT;
                        miniMapLayout.addView(borderRightView, borderRightParams);
                    }
                }
                
                if (showPlayersSetting.isActive()) {
                    drawPlayersOnMap(width, height, centerX, centerY);
                }
                
                drawLocalPlayerOnMap(centerX, centerY);
                
            } catch(e) {
                print("MiniMap draw error: " + e);
            }
        }
    }));
}

function drawPlayersOnMap(width, height, centerX, centerY) {
    var players = getValidPlayers();
    var zoom = zoomSetting.getCurrentValue();
    var halfSize = Math.min(width, height) / 2;
    var scale = halfSize / (zoom * 10);
    
    var localYaw = LocalPlayer.getYaw() * Math.PI / 180;
    var cosYaw = Math.cos(-localYaw);
    var sinYaw = Math.sin(-localYaw);
    
    var enemyColor = android.graphics.Color.RED;
    
    for (var i = 0; i < players.length; i++) {
        var playerID = players[i];
        
        var px = Player.getPositionX(playerID);
        var pz = Player.getPositionZ(playerID);
        
        var lx = LocalPlayer.getPositionX();
        var lz = LocalPlayer.getPositionZ();
        
        var dx = px - lx;
        var dz = pz - lz;
        
        var rotatedX = dx * cosYaw - dz * sinYaw;
        var rotatedZ = dx * sinYaw + dz * cosYaw;
        
        var screenX = centerX + rotatedX * scale;
        var screenY = centerY + rotatedZ * scale;
        
        var shape = shapeSetting.getCurrentMode();
        var playerSize = dip2px(6);
        
        var playerView = new android.view.View(context);
        
        if (shape === "Circle") {
            var playerDrawable = new android.graphics.drawable.GradientDrawable();
            playerDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
            playerDrawable.setColor(enemyColor);
            playerView.setBackground(playerDrawable);
        } else {
            playerView.setBackgroundColor(enemyColor);
        }
        
        var playerParams = new android.widget.FrameLayout.LayoutParams(
            playerSize,
            playerSize
        );
        playerParams.leftMargin = screenX - playerSize / 2;
        playerParams.topMargin = screenY - playerSize / 2;
        miniMapLayout.addView(playerView, playerParams);
        
        if (showNamesSetting.isActive()) {
            var name = Player.getNameTag(playerID);
            if (name) {
                var cleanName = name.replace(/§[0-9a-fk-or]/gi, "");
                
                var nameView = new android.widget.TextView(context);
                nameView.setText(cleanName);
                nameView.setTextColor(android.graphics.Color.WHITE);
                nameView.setTextSize(8);
                nameView.setTypeface(android.graphics.Typeface.MONOSPACE);
                nameView.setBackgroundColor(android.graphics.Color.argb(150, 0, 0, 0));
                
                var nameParams = new android.widget.FrameLayout.LayoutParams(
                    android.widget.FrameLayout.LayoutParams.WRAP_CONTENT,
                    android.widget.FrameLayout.LayoutParams.WRAP_CONTENT
                );
                nameParams.leftMargin = screenX - dip2px(20);
                nameParams.topMargin = screenY - playerSize - dip2px(10);
                miniMapLayout.addView(nameView, nameParams);
            }
        }
    }
}

function drawLocalPlayerOnMap(centerX, centerY) {
    var localPlayerColor = android.graphics.Color.GREEN;
    var shape = shapeSetting.getCurrentMode();
    var playerSize = dip2px(8);
    
    var localPlayerView = new android.view.View(context);
    
    if (shape === "Circle") {
        var playerDrawable = new android.graphics.drawable.GradientDrawable();
        playerDrawable.setShape(android.graphics.drawable.GradientDrawable.OVAL);
        playerDrawable.setColor(localPlayerColor);
        localPlayerView.setBackground(playerDrawable);
    } else {
        localPlayerView.setBackgroundColor(localPlayerColor);
    }
    
    var localParams = new android.widget.FrameLayout.LayoutParams(
        playerSize,
        playerSize
    );
    localParams.leftMargin = centerX - playerSize / 2;
    localParams.topMargin = centerY - playerSize / 2;
    miniMapLayout.addView(localPlayerView, localParams);
    
    var directionLength = dip2px(10);
    var localYaw = LocalPlayer.getYaw() * Math.PI / 180;
    var directionX = centerX + Math.sin(localYaw) * directionLength;
    var directionY = centerY - Math.cos(localYaw) * directionLength;
    
    var directionView = new android.view.View(context);
    directionView.setBackgroundColor(localPlayerColor);
    
    var directionSize = dip2px(4);
    var directionParams = new android.widget.FrameLayout.LayoutParams(
        directionSize,
        directionSize
    );
    directionParams.leftMargin = directionX - directionSize / 2;
    directionParams.topMargin = directionY - directionSize / 2;
    miniMapLayout.addView(directionView, directionParams);
}

function startUpdateLoop() {
    if (updateHandler) {
        updateHandler.removeCallbacksAndMessages(null);
    }
    
    updateHandler = new android.os.Handler();
    var updateRunnable = new java.lang.Runnable({
        run: function() {
            try {
                if (module_MiniMap.isActive() && miniMapLayout && LocalPlayer.isInGame()) {
                    drawMiniMap();
                    
                    var delay = Math.floor(1000 / updateSpeedSetting.getCurrentValue());
                    if (delay < 50) delay = 50;
                    updateHandler.postDelayed(this, delay);
                }
            } catch(e) {
                print("MiniMap update loop error: " + e);
            }
        }
    });
    
    var initialDelay = Math.floor(1000 / updateSpeedSetting.getCurrentValue());
    if (initialDelay < 50) initialDelay = 50;
    updateHandler.postDelayed(updateRunnable, initialDelay);
}

function destroyMiniMap() {
    if (updateHandler) {
        try {
            updateHandler.removeCallbacksAndMessages(null);
        } catch(e) {}
        updateHandler = null;
    }
    
    isDragging = false;
    
    if (!context) {
        try {
            context = getContext();
        } catch(e) {
            miniMapPopup = null;
            miniMapLayout = null;
            return;
        }
    }
    
    if (!context) {
        miniMapPopup = null;
        miniMapLayout = null;
        return;
    }
    
    context.runOnUiThread(new java.lang.Runnable({
        run: function() {
            try {
                if (miniMapPopup) {
                    if (miniMapPopup.isShowing()) {
                        miniMapPopup.dismiss();
                    }
                    miniMapPopup = null;
                }
                miniMapLayout = null;
                lastPositions = {};
            } catch(e) {
                miniMapPopup = null;
                miniMapLayout = null;
            }
        }
    }));
}

function onLevelTick() {
    if (module_MiniMap.isActive() && LocalPlayer.isInGame()) {
        if (!miniMapPopup) {
            createMiniMap();
        }
    } else {
        if (miniMapPopup) {
            destroyMiniMap();
        }
    }
}

function onServerDisconnect() {
    destroyMiniMap();
    miniMapPosition.x = -1;
    miniMapPosition.y = -1;
}

function onScreenChange(screen) {
    if (!LocalPlayer.isInGame()) {
        destroyMiniMap();
    }
}

sizeSetting.setOnCurrentValueChangedListener(function(currentValue) {
    if (miniMapPopup) {
        destroyMiniMap();
        if (module_MiniMap.isActive() && LocalPlayer.isInGame()) {
            createMiniMap();
        }
    }
});

shapeSetting.setOnModeSelectedListener(function(mode) {
    if (miniMapPopup && module_MiniMap.isActive() && LocalPlayer.isInGame()) {
        drawMiniMap();
    }
});

lookPositionSetting.setOnStateToggleListener(function(view, state) {
    if (miniMapLayout && miniMapPopup) {
        context.runOnUiThread(new java.lang.Runnable({
            run: function() {
                if (state) {
                    miniMapLayout.setOnTouchListener(new android.view.View.OnTouchListener({
                        onTouch: function(view, event) {
                            return handleTouchEvent(view, event);
                        }
                    }));
                } else {
                    miniMapLayout.setOnTouchListener(null);
                    isDragging = false;
                }
            }
        }));
    }
});

function onScriptEnabled() {
    ModuleManager.addModule(module_MiniMap);
}

function onScriptDisabled() {
    ModuleManager.removeModule(module_MiniMap);
    destroyMiniMap();
    miniMapPosition.x = -1;
    miniMapPosition.y = -1;
    isDragging = false;
}