import * as THREE from "../Common/three.js-r170/build/three.module.js";
import { TTFLoader } from "../Common/three.js-r170/examples/jsm/loaders/TTFLoader.js";
import { Font } from "../Common/three.js-r170/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from '../Common/three.js-r170/examples/jsm/geometries/TextGeometry.js';

export class TextBox {
    constructor(x, y, w, h, text, colour, size, outline_colour = null, background_colour = null) {
        this._outline = outline_colour != null;
        this.mesh = new THREE.LineSegments(
            new THREE.EdgesGeometry(
                new THREE.BoxGeometry(w, h, 0.1)
            ),
            new THREE.LineBasicMaterial({color: outline_colour, transparent: !this._outline, opacity: this._outline ? 1 : 0})
        )
        this.mesh.position.x = x;
        this.mesh.position.y = -y;

        this._background = background_colour != null;
        this.fill_mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, 0.05),
            new THREE.MeshBasicMaterial({color: background_colour, transparent: !this._background, opacity: this._background ? 1 : 0})
        )
        
        this.mesh.add(this.fill_mesh);

        // Button text
        this.text_mesh = null;
        const loader = new TTFLoader();
        loader.load("./Common/three.js-r170/examples/fonts/ttf/kenpixel.ttf", (response) => {
            const font = new Font(response);
            const geometry = new TextGeometry(text, { font: font, size: size, depth: 0.1 });
            geometry.computeBoundingBox();
            const material = new THREE.MeshBasicMaterial({ color: colour });
            const text_mesh = new THREE.Mesh(geometry, material);
            text_mesh.position.x = - (geometry.boundingBox.max.x - geometry.boundingBox.min.x) / 2;
            text_mesh.position.y = - (geometry.boundingBox.max.y - geometry.boundingBox.min.y) / 2;
            text_mesh.position.z = 0,
            this.text_mesh = text_mesh;
            this.mesh.add(text_mesh);
        });
    }
}
