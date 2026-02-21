var module_RGBModuleList = new Module("RGBModuleList", true, true, ModuleCategory.MISC);

var rgbEnabled = new StateSetting("Enabled", true);
var rgbSpeed = new SliderSetting("Speed", [2.0, 0.5, 10.0, 0.1]);
var rgbMode = new ModeSetting("Effect", ["Rainbow", "RGB Flow", "Static RGB", "Pulse"]);

module_RGBModuleList.addSettings([
    rgbEnabled,
    rgbSpeed,
    rgbMode
]);

var ctx = getContext();
var rgb_popup = null;
var rgb_layout = null;
var rgb_offset = 0;
var last_rgb_update = 0;

function dip2px(px) {
    return ctx.getResources().getDisplayMetrics().density * px;
}

function getRGBColor(index, time) {
    var mode = rgbMode.getCurrentMode();
    var speed = rgbSpeed.getCurrentValue();
    var currentTime = java.lang.System.currentTimeMillis();
    
    if (mode === "Rainbow") {
        var hue = ((currentTime * speed * 0.001 + index * 0.1) % 360) / 360;
        return android.graphics.Color.HSVToColor([hue * 360, 1.0, 1.0]);
    }
    
    else if (mode === "RGB Flow") {
        var phase = ((currentTime * speed * 0.001 + index * 0.2) % 3);
        if (phase < 1) {
            return android.graphics.Color.rgb(255, Math.floor(phase * 255), 0);
        } else if (phase < 2) {
            return android.graphics.Color.rgb(255 - Math.floor((phase - 1) * 255), 255, 0);
        } else {
            return android.graphics.Color.rgb(0, 255, Math.floor((phase - 2) * 255));
        }
    }
    
    else if (mode === "Static RGB") {
        var colors = [
            android.graphics.Color.RED,
            android.graphics.Color.GREEN,
            android.graphics.Color.BLUE,
            android.graphics.Color.YELLOW,
            android.graphics.Color.CYAN,
            android.graphics.Color.MAGENTA
        ];
        return colors[index % colors.length];
    }
    
    else if (mode === "Pulse") {
        var pulse = (Math.sin(currentTime * speed * 0.001 + index * 0.3) + 1) * 0.5;
        return android.graphics.Color.rgb(
            Math.floor(255 * pulse),
            Math.floor(128 * pulse),
            Math.floor(255 * (1 - pulse))
        );
    }
    
    return android.graphics.Color.WHITE;
}

function createModuleView(moduleName, index) {
    var textView = new android.widget.TextView(ctx);
    textView.setId(2000 + index);
    textView.setText(moduleName + " ▏");
    textView.setTypeface(android.graphics.Typeface.MONOSPACE);
    textView.setTextSize(8);
    textView.setGravity(android.view.Gravity.CENTER_VERTICAL | android.view.Gravity.RIGHT);
    textView.setPadding(dip2px(6), dip2px(2), dip2px(4), dip2px(2));
    
    var params = new android.widget.RelativeLayout.LayoutParams(
        android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT,
        android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT
    );
    params.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
    params.setMargins(0, dip2px(16) * index, dip2px(10), 0);
    textView.setLayoutParams(params);
    
    var bg = new android.graphics.drawable.GradientDrawable();
    bg.setShape(android.graphics.drawable.GradientDrawable.RECTANGLE);
    bg.setColor(android.graphics.Color.parseColor("#80000000"));
    bg.setCornerRadius(dip2px(4));
    textView.setBackground(bg);
    
    return textView;
}

function refreshRGBModules() {
    try {
        if (!rgb_layout) return;
        
        var currentModules = [];
        ModuleManager.getModuleNames().forEach(function(name) {
            if (Module.isActive(name) && name !== "RGBModuleList") {
                currentModules.push(name);
            }
        });
        
        currentModules.sort(function(a, b) {
            return b.length - a.length;
        });
        
        if (rgb_layout.getChildCount() !== currentModules.length) {
            rgb_layout.removeAllViews();
            
            currentModules.forEach(function(moduleName, index) {
                var view = createModuleView(moduleName, index);
                rgb_layout.addView(view);
            });
        }
        
        for (var i = 0; i < rgb_layout.getChildCount(); i++) {
            var view = rgb_layout.getChildAt(i);
            if (view instanceof android.widget.TextView) {
                view.setTextColor(getRGBColor(i, java.lang.System.currentTimeMillis()));
            }
        }
        
    } catch(e) {
        print("RGB refresh error: " + e);
    }
}

function createRGBList() {
    ctx.runOnUiThread(new java.lang.Runnable({
        run: function() {
            try {
                if (rgb_popup) return;
                
                rgb_layout = new android.widget.RelativeLayout(ctx);
                rgb_popup = new android.widget.PopupWindow(
                    rgb_layout,
                    android.widget.RelativeLayout.LayoutParams.WRAP_CONTENT,
                    android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
                );
                rgb_popup.setTouchable(false);
                rgb_popup.setFocusable(false);
                
                rgb_popup.showAtLocation(
                    ctx.getWindow().getDecorView(),
                    android.view.Gravity.RIGHT | android.view.Gravity.TOP,
                    dip2px(-10),
                    dip2px(40)
                );
                
                var rgbHandler = new android.os.Handler();
                var rgbRunnable = new java.lang.Runnable({
                    run: function() {
                        if (module_RGBModuleList.isActive() && rgbEnabled.isActive()) {
                            refreshRGBModules();
                            rgbHandler.postDelayed(this, 50);
                        }
                    }
                });
                rgbHandler.post(rgbRunnable);
                
            } catch(e) {
                print("RGB create error: " + e);
            }
        }
    }));
}

function destroyRGBList() {
    ctx.runOnUiThread(new java.lang.Runnable({
        run: function() {
            try {
                if (rgb_popup) {
                    rgb_popup.dismiss();
                    rgb_popup = null;
                    rgb_layout = null;
                }
            } catch(e) {
                print("RGB destroy error: " + e);
            }
        }
    }));
}

function onFastTick() {
    if (module_RGBModuleList.isActive() && rgbEnabled.isActive()) {
        rgb_offset += rgbSpeed.getCurrentValue() * 0.001;
        if (rgb_offset > 360) rgb_offset = 0;
    }
}

function onLevelTick() {
    if (module_RGBModuleList.isActive() && rgbEnabled.isActive()) {
        if (!rgb_popup) {
            createRGBList();
        }
    } else {
        if (rgb_popup) {
            destroyRGBList();
        }
    }
}

module_RGBModuleList.setOnToggleListener(function(view, state) {
    if (state) {
        createRGBList();
        print("RGB ModuleList activated");
    } else {
        destroyRGBList();
    }
});

function onScriptEnabled() {
    ModuleManager.addModule(module_RGBModuleList);
}

function onScriptDisabled() {
    ModuleManager.removeModule(module_RGBModuleList);
    destroyRGBList();
}