var module_InventoryOpener = new Module("InventoryOpener", true, true, ModuleCategory.PLAYER);

var isInventoryOpen = false;
var isInGame = false;

function onScriptEnabled() {
    ModuleManager.addModule(module_InventoryOpener);
}

function onScriptDisabled() {
    if (getScreenName() === "survival_inventory_screen") {
        LocalPlayer.closeScreen();
    }
    isInventoryOpen = false;
    ModuleManager.removeModule(module_InventoryOpener);
}

function onLevelTick() {
    isInGame = LocalPlayer.isInGame();
    
    if (module_InventoryOpener.isActive()) {
        if (isInGame && !isInventoryOpen) {
            try {
                LocalPlayer.openInventory();
                isInventoryOpen = true;
            } catch (e) {
            }
        }
    } else {
        if (isInventoryOpen || getScreenName() === "survival_inventory_screen") {
            try {
                LocalPlayer.closeScreen();
                isInventoryOpen = false;
            } catch (e) {
            }
        }
    }
}

function onScreenChange(screen) {
    if (screen === "survival_inventory_screen") {
        isInventoryOpen = true;
    } else {
        isInventoryOpen = false;
    }
}

module_InventoryOpener.setOnToggleListener(function(view, active) {
    if (!active) {
        if (getScreenName() === "survival_inventory_screen") {
            LocalPlayer.closeScreen();
            isInventoryOpen = false;
        }
    }
});