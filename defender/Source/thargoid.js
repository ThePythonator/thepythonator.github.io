import * as THREE from "../Common/three.js-r170/build/three.module.js";

import * as Constants from "./constants.js";
import { Ship } from "./ship.js";

const ThargoidStates = Object.freeze({
    LANDED: 0,
    IDLE: 1,
    CHASE: 2,
});

export class Thargoid extends Ship {
    constructor(terrain, player, x, z) {
        super(terrain, Constants.THARGOID, Constants.ENEMY_ICON);

        // Hold a reference to the player for information such as position
        this._player = player;

        // Set position to be centre of map, just above the terrain
        // TODO: change to be random?
        this.pos.x = x;
        this.pos.y = 3 + terrain.get_terrain_height(x, z); // TODO: move height offset into constants
        this.pos.z = z;

        // Physics information
        this.vel_angle = 0; // y axis turning speed

        // State information
        this.state = ThargoidStates.LANDED;
    }

    update (dt) {
        // TODO: smooth angle using angle vel instead of setting angle directly
        if (this._alive) {
            // Uses a simple state machine AI
            if (this.state == ThargoidStates.LANDED)  {
                // If player gets close, change to idle state
                const distance = this._temp_vector.copy(this._player.pos).sub(this.pos).length();
                if (distance < 50) { // TODO: make a constant
                    this.state = ThargoidStates.IDLE;
                }
                this.rot = Math.PI / 2 - Math.atan2(this._player.pos.z - this.pos.z, this._player.pos.x - this.pos.x); // TODO
            }
            else if (this.state == ThargoidStates.IDLE) {
                // If player gets close, chase them
                const distance = this._temp_vector.copy(this._player.pos).sub(this.pos).length();
                if (distance < 30 && this._player._alive) { // TODO: make a constant
                    this.state = ThargoidStates.CHASE;
                }

                // TODO: just bob around spreading the infection or something
                const ysp = 25;
                // this.vel.normalize().multiplyScalar(sp);
                this.vel.multiplyScalar(0.99);
                if (this.pos.y < 5 + this._terrain.get_terrain_height(this.pos.x, this.pos.z)) {
                    this.vel.y += ysp * dt;
                }
                // Gravity (temp)
                // this.vel.y -= Constants.GRAVITY * dt;
                this.rot = Math.PI / 2 - Math.atan2(this._player.pos.z - this.pos.z, this._player.pos.x - this.pos.x); // TODO
                // this.rot = Math.PI / 2 - Math.atan2(this.vel.z, this.vel.x); // TODO: maybe look at player all the time?
            }
            else if (this.state == ThargoidStates.CHASE) {
                // If player gets away, stop chasing them
                const distance = this._temp_vector.copy(this._player.pos).sub(this.pos).length();
                if (distance > 40 || !this._player._alive) { // TODO: make a constant, larger than chase dist
                    this.state = ThargoidStates.IDLE;
                }

                // TODO: chase the player
                // Temp
                // this.vel.multiplyScalar(0.99);
                const sp = 40;
                const max_sp = 50;
                // this._temp_vector.copy(this._player.pos).sub(this.pos).normalize().multiplyScalar(sp * dt);
                this.vel.copy(this._player.pos).sub(this.pos).normalize().multiplyScalar(max_sp * (distance / 70 + 0.3));
                // this.vel.add(this._temp_vector);
                // this.vel.min(this._temp_vector.set(1,1,1).normalize().multiplyScalar(max_sp)).max(this._temp_vector.set(-1,-1,-1).normalize().multiplyScalar(max_sp));
                this.rot = Math.PI / 2 - Math.atan2(this.vel.z, this.vel.x);
            }
        }
        else if (this._just_died) {
            this.vel.x = this.vel.y = this.vel.z = 0;
        }

        super.update(dt);
    }
}
