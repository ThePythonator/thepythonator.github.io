import * as THREE from "../Common/three.js-r170/build/three.module.js";

import * as Constants from "./constants.js";
import { Ship } from "./ship.js";
import { PolyModel } from "./poly_model.js";
import { ParticleManager } from './particles.js';
import { engine_exhaust, fire_trail, laser_projectile } from "./particle_generators.js";
import { AudioSamples } from "./audio.js";

export class Player extends Ship {
    constructor(terrain, keyboard, audio, level_number) {
        super(terrain, Constants.COBRA, Constants.PLAYER_ICON);

        this._keyboard = keyboard;
        this._audio = audio;

        this._has_control = true;
        this._playing = false;

        // Set position to be centre of map, just above the terrain
        this.pos.x = Constants.WIDTH / 2;
        this.pos.z = Constants.LENGTH / 2;
        this.pos.y = Constants.PLAYER_SPAWN_HEIGHT + terrain.get_terrain_height(this.pos.x, this.pos.z);

        // Physics information
        this.vel_angle = 0; // y axis turning speed

        // Create headlight
        // We need to create a dummy target object so that we can control the direction of the spotlight
        const target = new THREE.Object3D();
        target.castShadow = true;
        target.receiveShadow = true;
        target.position.set(0, 0, 1);
        this.headlight = new THREE.SpotLight(0xFFFFFF, Constants.PLAYER_HEADLIGHT_INTENSITY, Constants.COBRA.size * 32, Math.PI / 3, 0.2);
        this.headlight.target = target;
        this.headlight.castShadow = true;
        this.headlight.receiveShadow = true;
        this.headlight.add(target);
        this.headlight.position.set(0, 0, 1);

        // this.mesh.add(new THREE.SpotLightHelper(this.headlight));
        this.mesh.add(this.headlight);

        // Create engines
        this.engines = new PolyModel(Constants.COBRA.vertices, Constants.COBRA.engines, Constants.COBRA.scale, false);
        this.mesh.add(this.engines.mesh);
        
        this.engine_offsets = [];
        for (let i = 0; i < Constants.COBRA.engine_centres.length; i++) {
            const [x, y, z] = Constants.COBRA.engine_centres[i];
            this.engine_offsets.push(new THREE.Vector3(x, y, z).multiplyScalar(Constants.COBRA.scale));
        }

        this.projectiles = [];
        this.ammo = Constants.PLAYER_AMMO;
        this.gun_timer = 0.0;
        this.fuel = Constants.PLAYER_FUEL_BASE + Constants.PLAYER_FUEL_INCREASE_PER_LEVEL * level_number;
        this.shots_fired = 0;
    }

    lose_control = () => {
        // Cause the ship to crash into terrain
        // TODO: Maybe make an explosion?
        // ParticleManager.get_instance().add_particles(ship_explosion(this.pos), Constants.EXPLOSION.count);
        this._has_control = false;
    }

    update = (dt) => {
        if (!this._playing) {
            this._playing = this._keyboard.up;
        }

        if (this._alive) {
            const angle_sp = 5;
            const angle_other_damp = 0.02; // temp: dampening when turning key is down
            const angle_damp = 0.07; // temp: dampening

            let dx, dy, dz;
            dx = dy = dz = 0;

            if (this._has_control && this._playing && this.fuel > 0) {
                // Rotation
                this.vel_angle -= this.vel_angle * (this._keyboard.left || this._keyboard.right ? angle_other_damp : angle_damp);
                this.vel_angle += this._keyboard.left ? angle_sp * dt : 0;
                this.vel_angle += this._keyboard.right ? -angle_sp * dt : 0;
                
                // Only dampen if in control
                const xz_damp = 0.005;
                const y_damp = 0.001;

                // Speed
                this.vel.x -= this.vel.x * xz_damp;
                this.vel.y -= this.vel.y * y_damp;
                this.vel.z -= this.vel.z * xz_damp;


                // Only have control while alive
                dy = this._keyboard.up ? Constants.PLAYER_ACCELERATION.vertical * dt : 0;
                dz = this._keyboard.forward ? Constants.PLAYER_ACCELERATION.horizontal * dt : 0;
                if (this._keyboard.up || this._keyboard.forward) {
                    this.fuel -= dt; // Fuel is used up
                }

                // Limit player's speed as they near the height limit
                this.vel.y = Math.min(this.vel.y, 128 * (1 - this.pos.y / Constants.MAX_HEIGHT))
            }
            
            // Ammo doesn't require fuel
            if (this._has_control && this._playing) {
                // Reload ammo
                if (this.gun_timer <= 0.0) {
                    this.ammo = Math.min(Constants.PLAYER_AMMO, this.ammo + Constants.PLAYER_AMMO_RELOAD_RATE * dt);
                }
                this.gun_timer -= dt;
            }

            this.rot += this.vel_angle * dt;

            if (this._playing) dy -= Constants.GRAVITY * dt;

            // Apply the deltas in the direction specified by this.rot
            this.vel.add(this._temp_vector.set(dx, dy, dz).applyAxisAngle(Constants.Y_AXIS, this.rot));

            if (this._has_control && this._playing && this._keyboard.fire && this.ammo >= 1 && this.gun_timer <= 0.0) {
                // Fire lasers!
                this.ammo--;
                this.shots_fired++;
                this.gun_timer = Constants.PLAYER_FIRE_RATE;
                
                this._audio.play_sound(AudioSamples.FIRE_WEAPON);
                
                var pos = new THREE.Vector3(0, 0, 1).applyAxisAngle(Constants.Y_AXIS, this.rot).add(this.pos);
                this.projectiles.push(...ParticleManager.get_instance().add_particles(laser_projectile(pos, this.vel, this.rot), 1));
            }

            if (this._has_control && this._playing && this.fuel > 0 && (this._keyboard.forward || this._keyboard.up)) {
                // Engine particles
                var position = this.engine_offsets[Math.floor((Math.random()*this.engine_offsets.length))].clone().applyAxisAngle(Constants.Y_AXIS, this.rot).add(this.pos);
                ParticleManager.get_instance().add_particles(engine_exhaust(position, this.vel, this.rot), 1);
            }
        }
        else if (this._just_died) {
            this.vel.x = this.vel.y = this.vel.z = 0;
            this.vel_angle = 0;
            this._audio.play_sound(AudioSamples.PLAYER_EXPLOSION);

            // temp
            // this.headlight.visible = false;
            this.headlight.intensity = 0; // This seems less laggy?
        }

        // if (this._keyboard.down) this._has_control = false; // for testing

        if (!this._has_control || !this._alive) {
            // Create fire particles
            
            // Explode the ship by creating some particles!
            ParticleManager.get_instance().add_particles(fire_trail(this.pos, this.vel, this.rot), 1);
        }

        // Refresh object position
        super.update(dt);

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            // Slightly hacky way of checking if projectile hasn't been destroyed
            if (!this.projectiles[i].parent) {
                // Projectile has been removed
                this.projectiles.splice(i, 1);
            }
        }
    }
}