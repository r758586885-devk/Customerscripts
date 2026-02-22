const module_Sounds = new Module("ClientSounds", true, false, ModuleCategory.OTHER);

const moduleSound = new ModeSetting("ModueleSounds", ["None", "DripWater", "popup"]);
const hitSound = new ModeSetting("HitSounds", ["None", "Click2", "Click3", "Click"]);
const enableSound = new StateSetting("Enable Sound", true);
const disableSound = new StateSetting("Disable Sound", true);
const music = new StateSetting("Music", false);
const musicSelect = new ModeSetting("Music Select", ["Music1", "Music2", "Music3", "Music4", "Music5", "Random"]);
const musicVolume = new SliderSetting("MusicVolume", [0.5, 0.0, 1.0, 0.1]);

let playdelay = 0
let currentRandomMusic = "Music1";

module_Sounds.addSettings([moduleSound, enableSound, disableSound, hitSound, music, musicSelect, musicVolume]);

const SOUNDS_FOLDER = "/storage/emulated/0/games/breadixhack/scripts/sounds/";
const HITSOUNDS_FOLDER = "/storage/emulated/0/games/breadixhack/scripts/hitsounds/";
const MUSIC_FOLDER = "/storage/emulated/0/games/breadixhack/scripts/Music/";

let moduleStates = {};
let musicPlayer = null;
let isMusicPlaying = false;

function playSound(soundFile) {
    try {
        const fullPath = SOUNDS_FOLDER + soundFile;
        const file = new java.io.File(fullPath);

        const mediaPlayer = new android.media.MediaPlayer();
        mediaPlayer.setDataSource(fullPath);
        mediaPlayer.setVolume(1.0, 1.0);
        mediaPlayer.prepare();
        mediaPlayer.start();

        mediaPlayer.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
            onCompletion: function(mp) {
                mp.release();
            }
        }));
        
    } catch (e) {}
}

function playhitSound(soundFile) {
    try {
        const fullPath2 = HITSOUNDS_FOLDER + soundFile;
        const file = new java.io.File(fullPath2);

        const mediaPlayer = new android.media.MediaPlayer();
        mediaPlayer.setDataSource(fullPath2);
        mediaPlayer.setVolume(1.0, 1.0);
        mediaPlayer.prepare();
        mediaPlayer.start();

        mediaPlayer.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
            onCompletion: function(mp) {
                mp.release();
            }
        }));
        
    } catch (e) {}
}

function getRandomMusic() {
    const random = Math.floor(Math.random() * 5) + 1;
    return "Music" + random;
}

function getMusicFileName() {
    const selected = musicSelect.getCurrentMode();
    if (selected === "Random") {
        currentRandomMusic = getRandomMusic();
        return currentRandomMusic + ".mp3";
    }
    return selected + ".mp3";
}

function startMusic() {
    if (!music.isActive() || musicPlayer !== null) return;
    
    try {
        const musicFileName = getMusicFileName();
        const musicFilePath = MUSIC_FOLDER + musicFileName;
        const musicFile = new java.io.File(musicFilePath);
        
        if (!musicFile.exists()) return;
        
        musicPlayer = new android.media.MediaPlayer();
        musicPlayer.setDataSource(musicFilePath);
        musicPlayer.setVolume(musicVolume.getCurrentValue(), musicVolume.getCurrentValue());
        musicPlayer.setLooping(false);
        musicPlayer.prepare();
        musicPlayer.start();
        isMusicPlaying = true;
        
        musicPlayer.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
            onCompletion: function(mp) {
                mp.release();
                musicPlayer = null;
                isMusicPlaying = false;
                
                if (music.isActive() && module_Sounds.isActive()) {
                    if (musicSelect.getCurrentMode() === "Random") {
                        startMusic();
                    }
                }
            }
        }));
        
    } catch (e) {
        if (musicPlayer !== null) {
            try {
                musicPlayer.release();
            } catch (e2) {}
            musicPlayer = null;
            isMusicPlaying = false;
        }
    }
}

function stopMusic() {
    if (musicPlayer !== null) {
        try {
            musicPlayer.stop();
            musicPlayer.release();
        } catch (e) {}
        musicPlayer = null;
        isMusicPlaying = false;
    }
}

function updateMusicVolume() {
    if (musicPlayer !== null && isMusicPlaying) {
        try {
            const volume = musicVolume.getCurrentValue();
            musicPlayer.setVolume(volume, volume);
        } catch (e) {}
    }
}

function restartMusic() {
    stopMusic();
    if (music.isActive() && module_Sounds.isActive()) {
        startMusic();
    }
}

function checkModuleStates() {
    if (!module_Sounds.isActive()) return;
    
    const allModules = ModuleManager.getModuleNames();
    
    allModules.forEach(function(moduleName) {
        if (moduleName === "ClientSounds") return;
        
        const isActive = Module.isActive(moduleName);
        const wasActive = moduleStates[moduleName];

        if (wasActive !== undefined && wasActive !== isActive) {
            if (isActive && enableSound.isActive()) {
                playSelectedSound();
            } else if (!isActive && disableSound.isActive()) {
                playSelectedSound();
            }
        }
        moduleStates[moduleName] = isActive;
    });
}

function playSelectedSound() {
    const selectedSound = moduleSound.getCurrentMode();
    if (selectedSound === "DripWater") {
        playSound("water.mp3");
    } else if (selectedSound === "popup") {
        playSound("popup.mp3");
    }
}

function hitselectsound() {
    const selectedSound = hitSound.getCurrentMode();
    if (selectedSound === "Click2") {
        playhitSound("click2.mp3");
    } else if (selectedSound === "Click3") {
        playhitSound("click3.mp3");
    } else if (selectedSound === "Click") {
        playhitSound("click.mp3");
    } 
}

function onLevelTick() {
if (module_Sounds.isActive()) {
playdelay++

}
}

function onAttack() {
if (module_Sounds.isActive() && playdelay >= 10) {
hitselectsound()
playdelay = 0
}
}

function onFastTick() {
    checkModuleStates();
    
    if (module_Sounds.isActive()) {
        if (music.isActive() && !isMusicPlaying) {
            startMusic();
        } else if (!music.isActive() && isMusicPlaying) {
            stopMusic();
        }
        
        if (isMusicPlaying) {
            updateMusicVolume();
        }
    }
}

module_Sounds.setOnToggleListener(function(view, active) {
    if (active) {
        const allModules = ModuleManager.getModuleNames();
        allModules.forEach(function(moduleName) {
            if (moduleName !== "Sounds") {
                moduleStates[moduleName] = Module.isActive(moduleName);
            }
        });
        
        if (music.isActive()) {
            startMusic();
        }
    } else {
        moduleStates = {};
        stopMusic();
    }
});

music.setOnStateToggleListener(function(view, state) {
    if (state && module_Sounds.isActive()) {
        startMusic();
    } else {
        stopMusic();
    }
});

musicVolume.setOnCurrentValueChangedListener(function(value) {
    if (module_Sounds.isActive() && isMusicPlaying) {
        updateMusicVolume();
    }
});

musicSelect.setOnModeSelectedListener(function(view, mode) {
    if (mode === "Random") {
        currentRandomMusic = getRandomMusic();
    }
    if (module_Sounds.isActive() && music.isActive()) {
        restartMusic();
    }
});

function onScriptEnabled() {
    ModuleManager.addModule(module_Sounds);
}

function onScriptDisabled() {
    ModuleManager.removeModule(module_Sounds);
    stopMusic();
}