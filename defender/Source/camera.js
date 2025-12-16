import * as THREE from "../Common/three.js-r170/build/three.module.js";
import * as Constants from "./constants.js"

export class FollowCamera {
    constructor(fov, aspect, near, far) {
        // This camera lags behind the target by lerping
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._target = null;
        this._offset = new THREE.Vector3(0, 0, 0);
    }

    get = () => {
        return this._camera;
    }

    set_target = (target) => {
        this._target = target;
    }

    set_offset = (offset) => {
        this._offset = offset;
    }

    centre_target = () => {
        // Face the camera so that the target will be in the centre of the view when it comes to rest
        var x = this._camera.position.x - this._offset.x;
        var y = this._camera.position.y - this._offset.y;
        var z = this._camera.position.z - this._offset.z;
        this._camera.lookAt(x, y, z);
    }

    update = (dt) => {
        if (this._target) {
            // cam_pos += (obj_pos - cam_pos) * dt * speed
            this._camera.position.x += ((this._target.x + this._offset.x) - this._camera.position.x) * dt * Constants.CAMERA_SPEED;
            this._camera.position.y += ((this._target.y + this._offset.y) - this._camera.position.y) * dt * Constants.CAMERA_SPEED;
            this._camera.position.z += ((this._target.z + this._offset.z) - this._camera.position.z) * dt * Constants.CAMERA_SPEED;
            // this._camera.lookAt(this._target);
        }
    }
}