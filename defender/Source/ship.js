import * as THREE from "../Common/three.js-r170/build/three.module.js";

import * as Constants from "./constants.js";
import { ParticleManager } from './particles.js';
import { ship_explosion } from "./particle_generators.js";
import { PolyModel } from "./poly_model.js";

export class Ship extends PolyModel {
    constructor(terrain, ship_shape, icon = null) {
        super(ship_shape.vertices, ship_shape.body, ship_shape.scale); // Ahoy!

        this._terrain = terrain;
        this._alive = true;
        this._just_died = false;

        this._icon = null;
        if (icon) {
            this._icon = new PolyModel(icon.vertices, icon.faces, icon.scale, false, THREE.MeshBasicMaterial);
            this._icon.mesh.position.set(0, Constants.ICON_HEIGHT, 0);
            this.mesh.add(this._icon.mesh);
        }

        this.collidable_points = [];
        for (let i = 0; i < ship_shape.collidable_points.length; i++) {
            this.collidable_points.push(ship_shape.vertices[ship_shape.collidable_points[i]].map(x => x * ship_shape.scale));
        }
            
        // Physics information
        this.pos = new THREE.Vector3(0, 0, 0);
        this.vel = new THREE.Vector3(0, 0, 0);
        this.rot = 0;

        // Used to avoid creating new vectors every loop
        // Used by this class and child classes for vector math
        this._temp_vector = new THREE.Vector3(0, 0, 0);
    }

    colliding_with(ship) {
        for (let i = 0; i < this.collidable_points.length; i++) {
            // Check if any point is inside the other ship
            var [x,y,z] = this.collidable_points[i];
            if (ship.point_inside(this._temp_vector.set(x, y, z).applyAxisAngle(Constants.Y_AXIS, this.rot).add(this.pos))) return true;
        }
        return false;
    }

    kill() {
        this._alive = false;
        this._just_died = true;

        // Explode the ship by creating some particles!
        ParticleManager.get_instance().add_particles(ship_explosion(this.pos), Constants.EXPLOSION.count);
    }

    update (dt) {
        if (this._just_died) {
            this._just_died = false;
        }

        // Update position
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
        this.pos.z += this.vel.z * dt;
        
        // if (this.pos.y > Constants.SOFT_MAX_HEIGHT) {
        //     // this.pos.y = Constants.MAX_HEIGHT;
        //     // this.vel.y = 0;
        //     if (this.vel.y > 0) {
        //         const max_sp = 1000;
        //         console.log(this.pos.y)
        //         this.vel.y = Math.min(this.vel.y, max_sp * (Constants.HARD_MAX_HEIGHT - this.pos.y) / (Constants.HARD_MAX_HEIGHT - Constants.SOFT_MAX_HEIGHT));
        //     }
        // }

        // Set model to ship position and angle
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
        this.mesh.setRotationFromAxisAngle(this._temp_vector.set(0, 1, 0), this.rot);

        // Check for collision with terrain
        if (this._alive) {
            for (let i = 0; i < this.collidable_points.length; i++) {
                // Check if any point is lower than the terrain
                var [x,y,z] = this.collidable_points[i];
                x += this.pos.x;
                y += this.pos.y;
                z += this.pos.z;
                var h = this._terrain.get_terrain_height(x, z);
                if (y <= h) {
                    // Ship collided with terrain
                    this.kill();
                    break;
                }
            }
        }
    }
}
