import * as THREE from "../Common/three.js-r170/build/three.module.js";

import * as Constants from "./constants.js";

// TODO: move these values into constants?

export function ship_explosion(pos) {
    return function () {
        var position = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 1.5).add(pos);
        var velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 6 + 2);
        if (velocity.y < 0) {
            velocity.y *= -1; // TEMP: if explosions can occur from trees etc it may look a bit odd
        }
        var acceleration = new THREE.Vector3(0, -10 - Math.random() * 15, 0);
        var angle = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        var colour_choice = Math.random();
        var r, g, b;
        b = 0;
        if (colour_choice < 0.5) {
            // Red
            r = Math.random() * 0.5;
            g = Math.random() * r * 0.05;
        }
        else if (colour_choice < 0.8) {
            // Orange
            r = Math.random() * 0.5 + 0.3;
            g = Math.random() * r * 0.1;
        }
        else {
            // Yellow
            r = Math.random() * 0.6 + 0.3;
            g = r - 0.2;
        }
        return [
            position, // Position
            velocity, // Velocity
            acceleration, // Acceleration
            angle, // Rotation
            new THREE.Color(r, g, b), // Colour
            0.2 + Math.random() * 0.2, // Size
            0.1, // Rate at which particles get smaller
            THREE.MeshPhongMaterial // Material
        ];
    }
}

export function engine_exhaust(pos, vel, rot) {
    return function () {
        var velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 3 + 1);
        velocity.add(vel).multiplyScalar(0.7);
        velocity.sub(new THREE.Vector3(0, 0, 1).applyAxisAngle(Constants.Y_AXIS, rot).multiplyScalar(5)); // Emphasise control direction
        var acceleration = new THREE.Vector3(0, -5 - Math.random() * 5, 0);
        var angle = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        // Blue engine particles
        var r = Math.random() * 0.6 + 0.3;
        var g = r + 0.2;
        var b = 1.0;
        return [
            pos.clone(), // Position
            velocity, // Velocity
            acceleration, // Acceleration
            angle, // Rotation
            new THREE.Color(r, g, b), // Colour
            0.2 + Math.random() * 0.15, // Size
            0.15, // Rate at which particles get smaller
            THREE.MeshPhongMaterial // Material
        ];
    }
}

export function laser_projectile(pos, vel, rot) {
    return function () {
        var velocity = new THREE.Vector3(0, 0, 1).multiplyScalar(Math.random() * 5 + 25).applyAxisAngle(Constants.Y_AXIS, rot);
        velocity.add(vel).add(new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 2));
        var acceleration = new THREE.Vector3(0, -1 - Math.random() * 1, 0);
        var angle = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        // Laser particles
        var r = Math.random() * 0.05;
        var g = 0.2 + Math.random() * 0.2;
        var b = r + 0.05;
        return [
            pos, // Position
            velocity, // Velocity
            acceleration, // Acceleration
            angle, // Rotation
            new THREE.Color(r, g, b), // Colour
            0.2 + Math.random() * 0.15, // Size
            0.15, // Rate at which particles get smaller
            THREE.MeshBasicMaterial // Material
        ];
    }
}

export function fire_trail(pos, vel, rot) {
    return function () {
        var position = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 1);
        position.add(pos);
        var velocity = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 4 + 1);
        velocity.sub(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0,1,0), rot).multiplyScalar(0.05 * vel.length())); // Emphasise control direction
        var acceleration = new THREE.Vector3(0, -5 - Math.random() * 5, 0);
        var angle = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        var colour_choice = Math.random();
        var r, g, b;
        b = 0;
        if (colour_choice < 0.5) {
            // Red
            r = Math.random() * 0.5;
            g = Math.random() * r * 0.05;
        }
        else if (colour_choice < 0.8) {
            // Orange
            r = Math.random() * 0.5 + 0.3;
            g = Math.random() * r * 0.1;
        }
        else {
            // Yellow
            r = Math.random() * 0.6 + 0.3;
            g = r - 0.2;
        }
        return [
            position, // Position
            velocity, // Velocity
            acceleration, // Acceleration
            angle, // Rotation
            new THREE.Color(r, g, b), // Colour
            0.15 + Math.random() * 0.2, // Size
            0.15, // Rate at which particles get smaller
            THREE.MeshPhongMaterial // Material
        ];
    }
}
