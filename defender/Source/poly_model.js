import * as THREE from "../Common/three.js-r170/build/three.module.js";

export class PolyModel {
    constructor(vertices, faces, scale = 1, shadows = true, Material = THREE.MeshPhongMaterial) {
        this.normals = [];
        this.centroids = [];

        // var norm_positions = [];

        // Construct from vertices, and faces
        let positions = [];
        let colours = [];
        for (let i = 0; i < faces.length; i++) {
            const p1 = new THREE.Vector3(...vertices[faces[i].vertices[0]].map(x => x * scale));
            const p2 = new THREE.Vector3(...vertices[faces[i].vertices[1]].map(x => x * scale));
            const p3 = new THREE.Vector3(...vertices[faces[i].vertices[2]].map(x => x * scale));

            positions.push(p1.x, p1.y, p1.z);
            positions.push(p2.x, p2.y, p2.z);
            positions.push(p3.x, p3.y, p3.z);

            var ax, ay, az;
            ax = (p1.x + p2.x + p3.x) / 3;
            ay = (p1.y + p2.y + p3.y) / 3;
            az = (p1.z + p2.z + p3.z) / 3;

            this.centroids.push(new THREE.Vector3(ax, ay, az));

            // norm_positions.push(ax, ay, az);
            if (faces[i].normal) {
                // Optionally can specify custom normals for faces
                this.normals.push(new THREE.Vector3(...faces[i].normal));
                
                // norm_positions.push(ax + faces[i].normal[0], ay + faces[i].normal[1], az + faces[i].normal[2]);
            }
            else {
                // Get two vectors parallel to plane
                p2.sub(p1);
                p3.sub(p1);
    
                // Calculate normal
                this.normals.push(p2.cross(p3));
                
                // norm_positions.push(ax + p2.x, ay + p2.y, az + p2.z);
            }
            // norm_positions.push(ax, ay, az);

            const colour = new THREE.Color(faces[i].colour).convertLinearToSRGB();
            colours.push(colour.r, colour.g, colour.b);
            colours.push(colour.r, colour.g, colour.b);
            colours.push(colour.r, colour.g, colour.b);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
        geometry.computeVertexNormals();

        const material = new Material({ vertexColors: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = shadows;
        this.mesh.receiveShadow = shadows;
        
        // const geo = new THREE.BufferGeometry();
        // geo.setAttribute("position", new THREE.Float32BufferAttribute(norm_positions, 3));
        // geo.computeVertexNormals();

        // const mat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true });
        // this.mesh.add(new THREE.Mesh(geo, mat));
    }

    point_inside(point) {
        for (let i = 0; i < this.normals.length; i++) {
            // Dot product with normal
            var rot = this.mesh.quaternion.clone().invert();
            // (rot(point - this.pos) - centroid) . normal
            var d = new THREE.Vector3().copy(point).sub(this.mesh.position).applyQuaternion(rot).sub(this.centroids[i]).dot(this.normals[i]);
            if (d > 0) {
                // The point is on the outside of a face, so cannot be within the polyhedron
                return false;
            }
        }
        return true;
    }

    dispose() {
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
