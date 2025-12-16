import * as THREE from "../Common/three.js-r170/build/three.module.js";
import { TTFLoader } from "../Common/three.js-r170/examples/jsm/loaders/TTFLoader.js";
import { Font } from "../Common/three.js-r170/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from '../Common/three.js-r170/examples/jsm/geometries/TextGeometry.js';

export class Button {
    constructor(x, y, w, h, text, mouse) {
        this.mesh = new THREE.LineSegments(
            new THREE.EdgesGeometry(
                new THREE.BoxGeometry(w, h, 0.1)
            ),
            new THREE.LineBasicMaterial({color: 0x00FF00})
        )
        this.mesh.position.x = x;
        this.mesh.position.y = -y;

        this.fill_mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.05),
            new THREE.MeshBasicMaterial({color: 0x003300})
        )
        this.fill_mesh.visible = false;

        this.mesh.add(this.fill_mesh);

        // Button text
        const loader = new TTFLoader();
        loader.load("./Common/three.js-r170/examples/fonts/ttf/kenpixel.ttf", (response) => {
            const font = new Font(response);
            const geometry = new TextGeometry(text, { font: font, size: 32, depth: 0.1 });
            geometry.computeBoundingBox();
            const material = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const text_mesh = new THREE.Mesh(geometry, material);
            text_mesh.position.x = - (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
            text_mesh.position.y = - (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
            text_mesh.position.z = 0,
            this.mesh.add(text_mesh);
        });

        this._mouse = mouse;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this._visible = true;
    }

    set_visible(visible) {
        this._visible = visible;
        this.mesh.visible = visible;
        this.fill_mesh.visible = false;
    }

    update(dt) {
        var x = this._mouse.x();
        var y = this._mouse.y();
        var hw = this.w / 2;
        var hh = this.h / 2;
        if (x > this.x - hw && x < this.x + hw && y > this.y - hh && y < this.y + hh) { // TODO include this.x, this.y
            // The mouse is over the button
            this.fill_mesh.visible = this._visible;
            this.clicked = false;
            this.clicked = this._visible && this._mouse._just_clicked;
        }
        else {
            this.fill_mesh.visible = false;
            this.clicked = false;
        }
    }
}
