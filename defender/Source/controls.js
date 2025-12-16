// Some inspiration taken from
// https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FirstPersonControls.js
export class Keyboard {
    constructor() {
        window.addEventListener("keydown", this.on_keydown);
        window.addEventListener("keyup", this.on_keyup);

        this.forward = false;
        this.up = false;
        this.left = false;
        this.right = false;
        this.fire = false;
        
        this.arr_up = false;
        this.arr_down = false;
        this.arr_left = false;
        this.arr_right = false;

        this.shift = false;
        this.space = false;
        this.caps = false;

        this.k_w = false;
        this.k_a = false;
        this.k_s = false;
        this.k_d = false;

        this.k_q = false;
        this.k_e = false;

        this.k_b = false;
    }

    update_keys = () => {
        this.forward = this.arr_up || this.k_w;
        this.up = this.shift || this.k_b;
        this.left = this.arr_left || this.k_a;
        this.right = this.arr_right || this.k_d;
        this.fire = this.space;
    }

    on_keydown = (event) => {
        switch (event.code) {
            case "ArrowUp":
                this.arr_up = true; break;
            case "ArrowDown":
                this.arr_down = true; break;
            case "ArrowLeft":
                this.arr_left = true; break;
            case "ArrowRight":
                this.arr_right = true; break;
            case "KeyW":
                this.k_w = true; break;
            case "KeyA":
                this.k_a = true; break;
            case "KeyS":
                this.k_s = true; break;
            case "KeyD":
                this.k_d = true; break;
            case "KeyQ":
                this.k_q = true; break;
            case "KeyE":
                this.k_e = true; break;
            case "KeyB":
                this.k_b = true; break;
            case "ShiftLeft":
            case "ShiftRight":
                this.shift = true; break;
            case "CapsLock":
                this.caps = true; break;
            case "Space":
                this.space = true; break;
        }
        this.update_keys();
    }

    on_keyup = (event) => {
        switch (event.code) {
            case "ArrowUp":
                this.arr_up = false; break;
            case "ArrowDown":
                this.arr_down = false; break;
            case "ArrowLeft":
                this.arr_left = false; break;
            case "ArrowRight":
                this.arr_right = false; break;
            case "KeyW":
                this.k_w = false; break;
            case "KeyA":
                this.k_a = false; break;
            case "KeyS":
                this.k_s = false; break;
            case "KeyD":
                this.k_d = false; break;
            case "KeyQ":
                this.k_q = false; break;
            case "KeyE":
                this.k_e = false; break;
            case "KeyB":
                this.k_b = false; break;
            case "ShiftLeft":
            case "ShiftRight":
                this.shift = false; break;
            case "CapsLock":
                this.caps = false; break;
            case "Space":
                this.space = false; break;
        }
        this.update_keys();
    }
}

export class Mouse {
    constructor() {
        this._x = this._y = null;
        this._clicked = false;
        this._just_clicked = false;
        this._offset_x = this._offset_y = 0;
        this._scale_x = this._scale_y = 1;

        window.addEventListener("mousemove", this.on_mouse_move);
        window.addEventListener("mousedown", this.on_mouse_down);
        window.addEventListener("mouseup", this.on_mouse_up);
    }

    set_offset = (x, y) => {
        this._offset_x = x;
        this._offset_y = y;
    }

    set_scale = (x, y) => {
        this._scale_x = x;
        this._scale_y = y;
    }

    x = () => {
        return (this._x + this._offset_x) * this._scale_x;
    }
    y = () => {
        return (this._y + this._offset_y) * this._scale_y;
    }
    clicked = () => {
        return this._clicked;
    }

    on_mouse_move = (event) => {
        this._x = event.x;
        this._y = event.y;
    }

    on_mouse_down = (event) => {
        if (event.button == 0) {
            this._clicked = true;
            this._just_clicked = true;
        }
    }

    on_mouse_up = (event) => {
        if (event.button == 0) {
            this._clicked = false;
            this._just_clicked = false;
        }
    }

    clear_just_clicked = () => {
        this._just_clicked = false;
    }
}
