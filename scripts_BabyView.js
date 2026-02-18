const baby = new Module("BabyView", true, true, ModuleCategory.MISC);
function onLevelTick() {
    if (baby.isActive()) {
        LocalPlayer.setStatusFlag(30, true);
    } else {
        LocalPlayer.setStatusFlag(30, false);
    }
}

function onScriptEnabled() {
    ModuleManager.addModule(baby);
}

function onScriptDisabled() {
    ModuleManager.removeModule(baby);
}