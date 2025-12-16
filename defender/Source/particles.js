import * as THREE from "../Common/three.js-r170/build/three.module.js";
import * as Constants from "./constants.js";

export class ParticleManager {
    static _instance = null;

    constructor(scene) {
        this._particles = [];
        this._scene = scene;
        ParticleManager._instance = this;
    }

    static get_instance () {
        return ParticleManager._instance;
    }

    clear = () => {
        // Iterate backwards so that it is fine to remove items while iterating
        for (let i = this._particles.length - 1; i >= 0; i--) {
            var p = this._particles[i];
            // Dispose of object
            this._scene.remove(p.mesh);
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
        }
        this._particles = [];
    }

    add_particles = (generator, count) => {
        var meshes = []
        for (let i = 0; i < count; i++) {
            const [pos, vel, accel, angles, col, size, shrink_speed, mat] = generator();
            meshes.push(this.add_particle(pos, vel, accel, angles, col, size, shrink_speed, mat));
        }
        return meshes;
    }

    add_particle = (position, velocity, acceleration, angles, colour, size, shrink_speed, mat) => {
        const geometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
        // const material = new THREE.MeshBasicMaterial({ color: colour });
        const material = new mat({ color: colour }); // TODO: not sure which
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true; // TODO: not sure?
        mesh.position.set(position.x, position.y, position.z);
        mesh.scale.set(size, size, size);
        mesh.setRotationFromEuler(angles);
        // Keep track of particle information
        this._particles.push({
            vel: velocity,
            accel: acceleration,
            scale: size,
            scale_vel: shrink_speed,
            mesh: mesh,
        });
        // Add particle to scene
        this._scene.add(mesh);
        return mesh;
    }

    update = (dt) => {
        // Iterate backwards so that it is fine to remove items while iterating
        for (let i = this._particles.length - 1; i >= 0; i--) {
            var p = this._particles[i];

            p.vel.x += p.accel.x * dt;
            p.vel.y += p.accel.y * dt;
            p.vel.z += p.accel.z * dt;

            p.mesh.position.x += p.vel.x * dt;
            p.mesh.position.y += p.vel.y * dt;
            p.mesh.position.z += p.vel.z * dt;

            p.scale -= p.scale_vel * dt;
            p.mesh.scale.x = p.mesh.scale.y = p.mesh.scale.z = p.scale;

            // Delete this particle if it is below the terrain
            // Scale is not halved because rotation can mean the cube is still above the terrain
            if (p.mesh.position.y + p.scale < Constants.PARTICLE_MIN_HEIGHT || p.scale <= Constants.EPSILON) {
                this._particles.splice(i, 1);
                // Dispose of object
                this._scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
            }
            // TODO: also allow decreasing particle size over time
        }
    }
}
