import * as THREE from "../Common/three.js-r170/build/three.module.js";

export const AudioSamples = Object.freeze({
    CLICK: 0,
    FIRE_WEAPON: 1,
    THARGOID_EXPLOSION: 2,
    PLAYER_EXPLOSION: 3,
    ALERT: 4,

    TOTAL_AUDIO_SAMPLES: 5
});

const AUDIO_PATHS = [
    "../Assets/click.ogg",
    "../Assets/shoot.ogg",
    "../Assets/explosion.ogg",
    "../Assets/player_explosion.ogg",
    "../Assets/alarm.ogg",
];

export class Audio {
    constructor() {
        this.listener = new THREE.AudioListener();

        const audio_loader = new THREE.AudioLoader();
        
        this.sounds = [];
        for (let i = 0; i < AudioSamples.TOTAL_AUDIO_SAMPLES; i++) {
            // Add a space for the sound - loader may run out of order so we can't just push
            // to this.sounds from within the loader since the order then is undefined
            this.sounds.push(null);
            audio_loader.load(AUDIO_PATHS[i], function(buffer) {
                const sound = new THREE.Audio(this.listener);
                sound.setBuffer(buffer);
                sound.setLoop(false);
                sound.setVolume(0.5);
                this.sounds[i] = sound;
            }.bind(this));
        }
    }

    play_sound = (idx) => {
        if (!this.sounds[idx].isPlaying) this.sounds[idx].play();
    }
}
