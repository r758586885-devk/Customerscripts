var module_Killaura = new Module("KillAura", true, true, ModuleCategory.COMBAT);

var radius = new SliderSetting("Radius", [4.5, 1, 10, 0.1]);
var cps = new SliderSetting("CPS", [6, 1, 30, 1]);
var swing = new StateSetting("NoSwing", false);
var swordOnly = new StateSetting("SwordOnly", true);
var rotation = new StateSetting("Rotation", true);
var rotSpeed = new SliderSetting("RotSpeed", [10, 1, 200, 10]);
var bypass = new ModeSetting("Bypass", ["Off", "Duels", "SW"]);

module_Killaura.addSettings([radius, cps, swing, swordOnly, rotation, rotSpeed, bypass]);

var lastAttackTime = 0;

function isValidTarget(id) {
    if (id === LocalPlayer.getUniqueID()) return false;
    
    try {
        var name = Player.getNameTag(id);
        if (!name || name.toLowerCase().includes(LocalPlayer.getNameTag().toLowerCase())) return false;
        
        if (!Player.isAlive(id)) return false;
        if (!Player.canShowNameTag(id)) return false;
        
        var bypassMode = bypass.getCurrentMode();
        
        if (bypassMode === "Duels") {
            if (Player.isInCreativeMode(id)) return false;
            if (Player.isInWall(id)) return false;
            if (Player.isImmobile(id)) return false;
            if (Player.getStatusFlag(id, 8)) return false;
            if (Player.getStatusFlag(id, 16)) return false;
        }
        
        if (bypassMode === "SW") {
            if (!Player.getStatusFlag(id, 8)) return false;
            if (Player.getStatusFlag(id, 16)) return false;
            if (Player.getStatusFlag(id, 25)) return false;
        }
        
        return true;
    } catch(e) {
        return false;
    }
}

function getDistance(id) {
    try {
        var px = LocalPlayer.getPositionX();
        var py = LocalPlayer.getPositionY();
        var pz = LocalPlayer.getPositionZ();
        
        var tx = Player.getPositionX(id);
        var ty = Player.getPositionY(id);
        var tz = Player.getPositionZ(id);
        
        var dx = tx - px;
        var dy = ty - py;
        var dz = tz - pz;
        
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    } catch(e) {
        return 999;
    }
}

function lookAtTarget(id) {
    if (!rotation.isActive()) return;
    
    try {
        var px = LocalPlayer.getPositionX();
        var py = LocalPlayer.getPositionY() + 1.62;
        var pz = LocalPlayer.getPositionZ();
        
        var tx = Player.getPositionX(id);
        var ty = Player.getPositionY(id) + 1.62;
        var tz = Player.getPositionZ(id);
        
        var dx = tx - px;
        var dy = ty - py;
        var dz = tz - pz;
        
        var distXZ = Math.sqrt(dx * dx + dz * dz);
        
        var yaw = Math.atan2(-dx, dz) * (180 / Math.PI);
        var pitch = Math.atan2(-dy, distXZ) * (180 / Math.PI);
        
        while (yaw <= -180) yaw += 360;
        while (yaw > 180) yaw -= 360;
        
        var currentYaw = LocalPlayer.getYaw();
        var currentPitch = LocalPlayer.getPitch();
        
        var speed = rotSpeed.getCurrentValue() * 0.05;
        
        var diffYaw = yaw - currentYaw;
        while (diffYaw <= -180) diffYaw += 360;
        while (diffYaw > 180) diffYaw -= 360;
        
        var diffPitch = pitch - currentPitch;
        
        var smoothYaw = currentYaw + diffYaw * speed;
        var smoothPitch = currentPitch + diffPitch * speed;
        
        LocalPlayer.setRot(smoothYaw, smoothPitch);
    } catch(e) {}
}

function findSwordSlot() {
    if (!swordOnly.isActive()) return Inventory.getSelectedSlot();
    
    for (var i = 0; i < 9; i++) {
        var itemID = Item.getID(i);
        if (itemID === 276 || itemID === 267 || itemID === 272 || itemID === 268 || itemID === 283) {
            return i;
        }
    }
    return Inventory.getSelectedSlot();
}

function onLevelTick() {
    if (!module_Killaura.isActive()) return;
    
    try {
        var currentCPS = cps.getCurrentValue();
        var attackDelay = 1000 / currentCPS;
        var now = Date.now();
        
        if (now - lastAttackTime < attackDelay) return;
        
        var players = Level.getAllPlayers();
        var nearestID = -1;
        var minDist = radius.getCurrentValue() + 1;
        
        for (var i = 0; i < players.length; i++) {
            var id = players[i];
            
            if (!isValidTarget(id)) continue;
            
            var dist = getDistance(id);
            if (dist < minDist && dist <= radius.getCurrentValue()) {
                minDist = dist;
                nearestID = id;
            }
        }
        
        if (nearestID !== -1) {
            lookAtTarget(nearestID);
            
            if (swordOnly.isActive()) {
                var swordSlot = findSwordSlot();
                if (swordSlot !== -1) {
                    Inventory.setSelectedSlot(swordSlot);
                }
            }
            
            LocalPlayer.attack(nearestID);
            lastAttackTime = now;
            
            if (swing.isActive()) {
                LocalPlayer.addEffect(3, 2, 77, false);
                LocalPlayer.addEffect(4, 2, 10, false);
            }
        }
    } catch(e) {}
}

function onScriptEnabled() {
    ModuleManager.addModule(module_Killaura);
}

function onScriptDisabled() {
    ModuleManager.removeModule(module_Killaura);
}