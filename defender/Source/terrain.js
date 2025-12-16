import * as THREE from "../Common/three.js-r170/build/three.module.js";
import { ImprovedNoise } from '../Common/three.js-r170/examples/jsm/math/ImprovedNoise.js';
import * as Constants from "./constants.js";
import { PolyModel } from "./poly_model.js";

class Terrain {
    constructor(seed) {
        // Not a true "seed", but used as the z value for the noise function
        this.seed = seed;
        // Also used for seeding PRBS, which is more of a true "seed"
        this._lfsr = seed;
        if (!seed) alert("Seed cannot be zero!");
    }

    random() {
        // PRBS23 - see https://en.wikipedia.org/wiki/Pseudorandom_binary_sequence
        // This won't work if seed is zero
        for (let i = 0; i < 23; i++) {
            var next_bit = ((this._lfsr >> 22) ^ (this._lfsr >> 17)) & 1;
            this._lfsr = ((this._lfsr << 1) | next_bit) & ((1 << 23) - 1);
        }
        // Return a random value between 0 and 1 (both exclusive)
        return this._lfsr / (1 << 23);
    }
}

export class EarthTerrain extends Terrain {
    constructor(seed, base_count) {
        super(seed);

        this.noise = new ImprovedNoise();

        this.init_base_locations(base_count);
        this.generate_terrain();
    }

    init_base_locations = (base_count) => {
        // Randomly choose locations, check if they have all four corners above water
        this.base_locations = [];
        const half_size = Constants.BASE_SIZE / 2
        function is_near_others(x, y, locations) {
            const d = Constants.BASE_MIN_SEPARATION;
            for (let i = 0; i < locations.length; i++) {
                if (x + Constants.EPSILON >= locations[i][0] - half_size - d &&
                    x - Constants.EPSILON <= locations[i][0] + half_size + d &&
                    y + Constants.EPSILON >= locations[i][1] - half_size - d &&
                    y - Constants.EPSILON <= locations[i][1] + half_size + d) {
                    return true;
                }
            }
            return false;
        }
        for (let i = 0; i < base_count; i++) {
            let x, y, heights;
            let counter = 0;
            do {
                x = Math.round(this.random() * Constants.WIDTH);
                y = Math.round(this.random() * Constants.LENGTH);

                // Check that difference between lowest and highest corners is not more than BASE_MAX_CORNER_HEIGHT_DIFF
                heights = [];
                for (let py = y - half_size; py <= y + half_size; py += Constants.BASE_SIZE) {
                    for (let px = x - half_size; px <= x + half_size; px += Constants.BASE_SIZE) {
                        heights.push(this.get_colour_height(px, py));
                    }
                }
                heights.sort();
                counter++;
                if (counter > 10000) {
                    alert(`Could not generate map with ${base_count} bases - failed on base number ${i + 1}!`);
                    return;
                }
            }
            while (is_near_others(x, y, this.base_locations) || this.get_colour_height(x, y) < Constants.BASE_MIN_HEIGHT ||
                    x < Constants.BASE_SIZE || x > Constants.WIDTH - Constants.BASE_SIZE ||
                    y < Constants.BASE_SIZE || y > Constants.LENGTH - Constants.BASE_SIZE ||
                    (x > Constants.WIDTH / 2 - Constants.SAFE_AREA_RADIUS && x < Constants.WIDTH / 2 + Constants.SAFE_AREA_RADIUS &&
                    y > Constants.LENGTH / 2 - Constants.SAFE_AREA_RADIUS && y < Constants.LENGTH / 2 + Constants.SAFE_AREA_RADIUS) ||
                    (heights.length == 4 && (heights[3] - heights[0] > Constants.BASE_MAX_CORNER_HEIGHT_DIFF ||
                        heights.reduce((a, b) => a + b, 0) / 4 > Constants.BASE_MAX_CORNER_HEIGHT)));
                    
            this.base_locations.push([x, y]);
        }
    }

    is_within_base_area = (x, y) => {
        const half_size = Constants.BASE_SIZE / 2
        for (let i = 0; i < this.base_locations.length; i++) {
            if (x + Constants.EPSILON >= this.base_locations[i][0] - half_size &&
                x - Constants.EPSILON <= this.base_locations[i][0] + half_size &&
                y + Constants.EPSILON >= this.base_locations[i][1] - half_size &&
                y - Constants.EPSILON <= this.base_locations[i][1] + half_size) {
                return this.base_locations[i];
            }
        }
        return null;
    }

    constrain_height = (h) => {
        return Math.tanh(2 * h);
    }

    get_colour_height = (x, y) => {
        // Get "height" of terrain from noise, used to determine colours
        let height = 0;
        let scale = 1;
        let weight_sum = 0
        for (let i = 0; i < Constants.EARTH.octaves; i++) {
            let weight = 5 + 5 * (1 - i / Constants.EARTH.octaves);
            weight_sum += weight;
            height += this.noise.noise(x * Constants.EARTH.axis_scale * scale, y * Constants.EARTH.axis_scale * scale, this.seed) * weight;
            scale *= 2;
        }
        // Can't just return height as it could be outside range -1...1
        return this.constrain_height(height / weight_sum);
    }

    get_terrain_height = (x, y) => {
        let h, location;
        if (location = this.is_within_base_area(x, y)) {
            // Find second highest height
            const half_size = Constants.BASE_SIZE / 2
            let heights = [];
            for (let py = location[1] - half_size; py <= location[1] + half_size; py += Constants.BASE_SIZE) {
                for (let px = location[0] - half_size; px <= location[0] + half_size; px += Constants.BASE_SIZE) {
                    heights.push(this.get_colour_height(px, py));
                }
            }
            heights.sort();
            h = (heights[1] + heights[2]) * 0.5 + 0.02;
        }
        else {
            h = this.get_colour_height(x, y);
        }
        let terrain_height = 0;
        if (h >= 0) {
            for (let i = 0; i < Constants.EARTH.height_coefficients.length; i++) {
                terrain_height += Constants.EARTH.height_coefficients[i] * (h ** i);
            }
        }
        return terrain_height;
    }

    // Some inspiration from
    // https://github.com/mrdoob/three.js/blob/dev/examples/webgl_geometry_terrain.html
    // https://medium.com/@joshmarinacci/low-poly-style-terrain-generation-8a017ab02e7b
    // https://www.reddit.com/r/threejs/comments/w0okys/im_using_perlin_noise_to_generate_tiles_for_a/
    // https://www.youtube.com/watch?v=w2ljEVh3i5w
    // https://hofk.de/main/discourse.threejs/2019/ColorStripeChanging2/ColorStripeChanging2.html
    generate_terrain = () => {
        const geometry = new THREE.BufferGeometry();

        let positions = [];
        let colours = [];
        let tree_positions = [];
        let palm_tree_positions = [];
        let house_positions = [];
        let square_house_positions = [];
        for (let y = 0; y < Constants.LENGTH; y++) {
            for (let x = 0; x < Constants.WIDTH; x++) {
                let square = [];
                let sum_h = 0;
                let terrain_heights = [];
                for (let py = y; py <= y + 1; py++) {
                    for (let px = x; px <= x + 1; px++) {
                        sum_h += Math.max(0, this.get_colour_height(px, py));
                        let ph = this.get_terrain_height(px, py);
                        terrain_heights.push(ph);
                        square.push([px, ph, py]);
                    }
                }
                // mean_h is between 0 and 1 (water is all 0)
                const mean_h = sum_h / 4;

                // First triangle
                positions.push(...square[0]);
                positions.push(...square[2]);
                positions.push(...square[1]);
                
                // Second triangle
                positions.push(...square[1]);
                positions.push(...square[2]);
                positions.push(...square[3]);

                // Select colours for terrain
                let r, g, b;
                r = g = b = 0;
                if (this.is_within_base_area(x, y) ||
                    this.is_within_base_area(x + 1, y) ||
                    this.is_within_base_area(x, y + 1) ||
                    this.is_within_base_area(x + 1, y + 1)) {
                    r = 0.5;
                    g = 0.5;
                    b = 0.5;
                }
                else if (mean_h <= 0) {
                    // Water
                    let water_depth = -1 * mean_h;
                    r = Math.max(0, 0.05 * (0.5 - water_depth));
                    g = Math.max(0, 0.1 * (0.5 - water_depth));
                    b = Math.max(0.05, 0.6 - water_depth * 0.8);
                }
                else if (mean_h <= Constants.SAND_HEIGHT) {
                    // Sand
                    let sand_height = mean_h / Constants.SAND_HEIGHT;
                    r = 1;
                    g = 1;
                    b = 0.4 * sand_height + 0.1;

                    if (mean_h <= Constants.PALM_TREE_MAXIMUM_GROUND_HEIGHT) {
                        // Make sure no trees are closer than the minimum distance
                        var too_close = false;
                        for (let i = 0; i < palm_tree_positions.length; i++) {
                            const [tx, ty] = palm_tree_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            if (dx * dx + dy * dy < Constants.PALM_TREE_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        if (!too_close && this.random() < Constants.PALM_TREE_PROBABILITY * mean_h) { // TODO: change to informed by noise map
                            palm_tree_positions.push([x, y]);
                        }
                    }
                }
                else if (mean_h <= Constants.GRASS_HEIGHT) {
                    // Grass
                    let grass_height = (mean_h - Constants.SAND_HEIGHT) / (Constants.GRASS_HEIGHT - Constants.SAND_HEIGHT);
                    r = 0;
                    g = 0.3 * (grass_height * grass_height) + 0.3;
                    b = 0.1 * (1 - grass_height) + 0.05;

                    if (mean_h >= Constants.TREE_MINIMUM_GROUND_HEIGHT) {
                        // Only add trees in grass area
                        // Make sure no trees are closer than the minimum distance
                        var too_close = false;
                        for (let i = 0; i < tree_positions.length; i++) {
                            const [tx, ty] = tree_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            if (dx * dx + dy * dy < Constants.TREE_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        for (let i = 0; i < house_positions.length; i++) {
                            const [tx, ty] = house_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            if (dx * dx + dy * dy < Constants.HOUSE_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        if (!too_close && this.random() < Constants.TREE_PROBABILITY * (Constants.GRASS_HEIGHT - mean_h)) { // TODO: change to informed by noise map
                            tree_positions.push([x, y]);
                        }
                    }
                    
                    const flat_terrain = Math.max(...terrain_heights) - Math.min(...terrain_heights) <= Constants.HOUSE_MAX_HEIGHT_CHANGE;
                    if (flat_terrain && mean_h >= Constants.HOUSE_MINIMUM_GROUND_HEIGHT) {
                        // Only add trees in grass area
                        // Make sure no trees are closer than the minimum distance
                        var too_close = false;
                        for (let i = 0; i < tree_positions.length; i++) {
                            const [tx, ty] = tree_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            const sq_dist = dx * dx + dy * dy;
                            if (sq_dist < Constants.HOUSE_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        for (let i = 0; i < house_positions.length; i++) {
                            const [tx, ty] = house_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            const sq_dist = dx * dx + dy * dy;
                            if (sq_dist < Constants.HOUSE_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        if (!too_close && this.random() < Constants.HOUSE_PROBABILITY * (Constants.GRASS_HEIGHT - mean_h)) { // TODO: change to informed by noise map
                            (this.random() < Constants.HOUSE_SQUARE_CHANCE ? square_house_positions : house_positions).push([x + 0.5, y + 0.5]);
                        }
                    }
                }
                else if (mean_h <= Constants.MOUNTAIN_STONE_HEIGHT) {
                    // Mountains
                    let mountain_height = (mean_h - Constants.GRASS_HEIGHT) / (1 - Constants.GRASS_HEIGHT);
                    r = mountain_height * 0.3 + 0.34;
                    g = mountain_height * 0.3 + 0.29;
                    b = mountain_height * 0.3 + 0.22;
                }
                else {
                    // Snow
                    r = 1;
                    g = 1;
                    b = 1;
                }

                // Add randomness to colours
                r = Math.min(1, Math.max(0, r * (1 + (this.random() * 2 - 1) * Constants.EARTH.colour_variation)));
                g = Math.min(1, Math.max(0, g * (1 + (this.random() * 2 - 1) * Constants.EARTH.colour_variation)));
                b = Math.min(1, Math.max(0, b * (1 + (this.random() * 2 - 1) * Constants.EARTH.colour_variation)));

                // Both triangles are the same colour
                // 2 triangles, 3 vertices each
                for (let i = 0; i < 6; i++) {
                    colours.push(r, g, b);
                }
            }
        }

        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));

        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({ vertexColors: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        const transform = new THREE.Object3D();

        // Create trees
        const tree_leaves = new PolyModel(Constants.CONICAL_TREE_LEAVES.vertices, Constants.CONICAL_TREE_LEAVES.faces, Constants.CONICAL_TREE_LEAVES.scale);
        const tree_leaves_mesh = new THREE.InstancedMesh(tree_leaves.mesh.geometry, tree_leaves.mesh.material, tree_positions.length);
        const tree_trunks = new PolyModel(Constants.TREE_TRUNK.vertices, Constants.TREE_TRUNK.faces, Constants.TREE_TRUNK.scale);
        const tree_trunks_mesh = new THREE.InstancedMesh(tree_trunks.mesh.geometry, tree_trunks.mesh.material, tree_positions.length);
        for (let i = 0; i < tree_positions.length; i++) {
            // Add randomness to colours
            const is_dark = this.random() < 0.3;
            var g = is_dark ? 0.05 * this.random() + 0.05 : 0.3 * this.random() + 0.3;
            const col = new THREE.Color(0, g, 0);

            const [x, y] = tree_positions[i];
            const h = this.get_terrain_height(x, y);
            transform.position.set(x, h, y);
            transform.rotation.set(0, this.random() * 2 * Math.PI / 3, 0);
            transform.updateMatrix();

            tree_leaves_mesh.setMatrixAt(i, transform.matrix);
            tree_leaves_mesh.setColorAt(i, col);

            tree_trunks_mesh.setMatrixAt(i, transform.matrix);
        }

        tree_leaves_mesh.castShadow = true;
        tree_leaves_mesh.receiveShadow = true;
        this.mesh.add(tree_leaves_mesh);
        this.mesh.add(tree_trunks_mesh);

        // Create palm trees
        const palm_tree_leaves = new PolyModel(Constants.PALM_TREE_LEAVES.vertices, Constants.PALM_TREE_LEAVES.faces, Constants.PALM_TREE_LEAVES.scale);
        const palm_tree_leaves_mesh = new THREE.InstancedMesh(palm_tree_leaves.mesh.geometry, palm_tree_leaves.mesh.material, palm_tree_positions.length * 3);
        const palm_tree_trunks = new PolyModel(Constants.PALM_TRUNK.vertices, Constants.PALM_TRUNK.faces, Constants.PALM_TRUNK.scale);
        const palm_tree_trunks_mesh = new THREE.InstancedMesh(palm_tree_trunks.mesh.geometry, palm_tree_trunks.mesh.material, palm_tree_positions.length);
        for (let i = 0; i < palm_tree_positions.length; i++) {
            // Add randomness to colours
            const is_dark = this.random() < 0.3;
            var g = is_dark ? 0.05 * this.random() + 0.05 : 0.3 * this.random() + 0.3;
            const col = new THREE.Color(0, g, 0);

            const [x, y] = palm_tree_positions[i];
            const h = this.get_terrain_height(x, y);
            transform.position.set(x, h, y);

            const angle = this.random() * 2 * Math.PI / 3;

            for (let j = 0; j < 3; j++) {
                transform.rotation.set(0, angle + 2 * j * Math.PI / 3, 0);
                transform.updateMatrix();
                palm_tree_leaves_mesh.setMatrixAt(i * 3 + j, transform.matrix);
                palm_tree_leaves_mesh.setColorAt(i * 3 + j, col);
            }

            palm_tree_trunks_mesh.setMatrixAt(i, transform.matrix);
        }

        palm_tree_leaves_mesh.castShadow = true;
        palm_tree_leaves_mesh.receiveShadow = true;
        palm_tree_trunks_mesh.castShadow = true;
        palm_tree_trunks_mesh.receiveShadow = true;
        this.mesh.add(palm_tree_leaves_mesh);
        this.mesh.add(palm_tree_trunks_mesh);

        // Create houses
        const house = new PolyModel(Constants.HOUSE.vertices, Constants.HOUSE.faces, Constants.HOUSE.scale);
        const house_mesh = new THREE.InstancedMesh(house.mesh.geometry, house.mesh.material, house_positions.length);
        for (let i = 0; i < house_positions.length; i++) {
            const [x, y] = house_positions[i];
            const h = this.get_terrain_height(x, y);
            transform.position.set(x, h, y);
            transform.rotation.set(0, (this.random() - 0.5) * Math.PI, 0);
            transform.updateMatrix();
            house_mesh.setMatrixAt(i, transform.matrix);
        }
        house_mesh.castShadow = true;
        house_mesh.receiveShadow = true;
        this.mesh.add(house_mesh);
        
        // Square houses
        const square_house = new PolyModel(Constants.SQUARE_HOUSE.vertices, Constants.SQUARE_HOUSE.faces, Constants.SQUARE_HOUSE.scale);
        const square_house_mesh = new THREE.InstancedMesh(square_house.mesh.geometry, square_house.mesh.material, square_house_positions.length);
        for (let i = 0; i < square_house_positions.length; i++) {
            const [x, y] = square_house_positions[i];
            const h = this.get_terrain_height(x, y);
            transform.position.set(x, h, y);
            transform.rotation.set(0, (this.random() - 0.5) * Math.PI, 0);
            transform.updateMatrix();
            square_house_mesh.setMatrixAt(i, transform.matrix);
        }
        square_house_mesh.castShadow = true;
        square_house_mesh.receiveShadow = true;
        this.mesh.add(square_house_mesh);
    }
}

export class MoonTerrain extends Terrain {
    constructor(seed, base_count) {
        super(seed);

        this.noise = new ImprovedNoise();
        // this.prop_noise = new ImprovedNoise();
        
        this.init_crater_locations();
        this.init_base_locations(base_count);
        this.generate_terrain();
    }

    init_base_locations = (base_count) => {
        this.base_locations = [];
        var i = 0;
        while (base_count > 0 && i < this.crater_locations.length) {
            var [x, y, r] = this.crater_locations[i++];
            while (x > Constants.WIDTH / 2 - Constants.SAFE_AREA_RADIUS && x < Constants.WIDTH / 2 + Constants.SAFE_AREA_RADIUS &&
                    y > Constants.LENGTH / 2 - Constants.SAFE_AREA_RADIUS && y < Constants.LENGTH / 2 + Constants.SAFE_AREA_RADIUS &&
                    i < this.crater_locations.length) {
                [x, y, r] = this.crater_locations[i++];
            }
            this.base_locations.push([x, y]);
            base_count--;
        }
        if (base_count) {
            alert(`Unable to create Thargoid spawn locations (${base_count} remaining)!`);
        }
    }

    init_crater_locations = () => {
        this.crater_locations = [];
        
        function is_near_others(x, y, r, locations) {
            for (let i = 0; i < locations.length; i++) {
                const dx = x - locations[i][0];
                const dy = y - locations[i][1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < Constants.CRATER_MIN_SEPARATION + r + locations[i][2]) return true;
            }
            return false;
        }

        const crater_count = (Constants.WIDTH / 96) ** 2; // TODO; temp
        for (let i = 0; i < crater_count; i++) {
            let x, y;
            const r = this.random() * (Constants.CRATER_MAX_RADIUS - Constants.CRATER_MIN_RADIUS) + Constants.CRATER_MIN_RADIUS;
            let counter = 0;
            do {
                x = Math.round(this.random() * Constants.WIDTH);
                y = Math.round(this.random() * Constants.LENGTH);

                counter++;
                if (counter > 10000) {
                    alert(`Could not generate map with ${crater_count} crater - failed on crater number ${i + 1}!`);
                    return;
                }

                // Check if not too close to another crater
            }
            while (is_near_others(x, y, r, this.crater_locations) || x < r || x > Constants.WIDTH - r || y < r || y > Constants.LENGTH - r);
            
            this.crater_locations.push([x, y, r]);
        }
    }

    is_within_crater = (x, y) => {
        // Apply an offset and only use a single frequency of noise
        // return this.noise.noise(x / 32, y / 32, this.seed + 1) <= -0.2;
        for (let i = 0; i < this.crater_locations.length; i++) {
            const dx = x - this.crater_locations[i][0];
            const dy = y - this.crater_locations[i][1];
            const r = this.crater_locations[i][2];
            const sq_dist = dx * dx + dy * dy;
            if (sq_dist < r * r) return this.crater_locations[i];
        }
        return [null, null, null];
    }
    
    constrain_height = (h) => {
        return Math.tanh(2 * h);
    }

    get_colour_height = (x, y) => {
        // Get "height" of terrain from noise, used to determine colours
        let height = 0;
        let scale = 1;
        let weight_sum = 0
        for (let i = 0; i < Constants.MOON.octaves; i++) {
            let weight = 5 + 5 * (1 - i / Constants.MOON.octaves);
            weight_sum += weight;
            height += this.noise.noise(x * Constants.MOON.axis_scale * scale, y * Constants.MOON.axis_scale * scale, this.seed) * weight;
            scale *= 2;
        }
        // Can't just return height as it could be outside range -1...1
        var h = this.constrain_height(height / weight_sum);
        // const crater_offset = Math.max(Math.min(this.noise.noise(x / 32, y / 32, this.seed + 1), -0.25), -0.35) + 0.25;
        // return Math.max(h + crater_offset * 3, -1);
        const [cx, cy, r] = this.is_within_crater(x, y); // The radius of the crater
        if (r) {
            const dx = cx - x;
            const dy = cy - y;
            const ratio = (dx * dx + dy * dy) / (r * r); // Measure of how close to edge of crater
            h = Math.max(-1, Math.min(1, h + ((ratio ** 4) - 1) * 0.5));//Constants.CRATER_HEIGHT_CHANGE
        }
        return Math.max(h, Constants.LAVA_HEIGHT);
    }

    get_terrain_height = (x, y) => {
        var h = this.get_colour_height(x, y);
        let terrain_height = 0;
        for (let i = 0; i < Constants.MOON.height_coefficients.length; i++) {
            terrain_height += Constants.MOON.height_coefficients[i] * (h ** i);
        }
        return terrain_height;
    }

    generate_terrain = () => {
        const geometry = new THREE.BufferGeometry();

        let positions = [];
        let colours = [];
        let rock_positions = [];
        let very_small_rock_positions = [];
        for (let y = 0; y < Constants.LENGTH; y++) {
            for (let x = 0; x < Constants.WIDTH; x++) {
                let square = [];
                let sum_h = 0;
                let terrain_heights = [];
                for (let py = y; py <= y + 1; py++) {
                    for (let px = x; px <= x + 1; px++) {
                        sum_h += this.get_colour_height(px, py);
                        let ph = this.get_terrain_height(px, py);
                        terrain_heights.push(ph);
                        square.push([px, ph, py]);
                    }
                }
                // mean_h is between -1 and 1
                const mean_h = sum_h / 4;

                // First triangle
                positions.push(...square[0]);
                positions.push(...square[2]);
                positions.push(...square[1]);
                
                // Second triangle
                positions.push(...square[1]);
                positions.push(...square[2]);
                positions.push(...square[3]);

                // Select colours for terrain
                let r, g, b;
                const [cx, cy, cr] = this.is_within_crater(x, y);
                if (mean_h <= Constants.LAVA_HEIGHT) {
                    r = 1;
                    g = 0.2 + 0.2 * this.random();
                    b = 0;
                }
                else if (cr) {
                    const sq_dist_ratio = ((x - cx) ** 2 + (y - cy) ** 2) / (cr ** 2);
                    r = g = b = 0.3 + mean_h * 0.5 + 0.1 * sq_dist_ratio;
                }
                else {
                    r = g = b = 0.4 + mean_h * 0.5;
                    const flat_terrain = Math.max(...terrain_heights) - Math.min(...terrain_heights) <= Constants.HOUSE_MAX_HEIGHT_CHANGE;
                    if (flat_terrain) {
                        // Make sure no rocks are closer than the minimum distance
                        var too_close = false;
                        for (let i = 0; i < rock_positions.length; i++) {
                            const [tx, ty] = rock_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            if (dx * dx + dy * dy < Constants.ROCK_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        for (let i = 0; i < very_small_rock_positions.length; i++) {
                            const [tx, ty] = very_small_rock_positions[i];
                            const dx = tx - x;
                            const dy = ty - y;
                            if (dx * dx + dy * dy < Constants.VERY_SMALL_ROCK_MINIMUM_SQUARE_DISTANCE) {
                                too_close = true;
                                break;
                            }
                        }
                        if (!too_close && this.random() < Constants.ROCK_PROBABILITY * (1.0 - mean_h)) { // TODO: change to informed by noise map
                            (this.random() < Constants.VERY_SMALL_ROCK_CHANCE ? very_small_rock_positions : rock_positions).push([x, y]);
                        }
                    }
                }

                // Add randomness to colours
                r = Math.min(1, Math.max(0, r * (1 + (this.random() * 2 - 1) * Constants.MOON.colour_variation)));
                g = Math.min(1, Math.max(0, g * (1 + (this.random() * 2 - 1) * Constants.MOON.colour_variation)));
                b = Math.min(1, Math.max(0, b * (1 + (this.random() * 2 - 1) * Constants.MOON.colour_variation)));

                // Both triangles are the same colour
                // 2 triangles, 3 vertices each
                for (let i = 0; i < 6; i++) {
                    colours.push(r, g, b);
                }
            }
        }

        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));

        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({ vertexColors: true });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        const transform = new THREE.Object3D();
        // Create rocks
        const rock = new PolyModel(Constants.SMALL_ROCK.vertices, Constants.SMALL_ROCK.faces, Constants.SMALL_ROCK.scale);
        const rock_mesh = new THREE.InstancedMesh(rock.mesh.geometry, rock.mesh.material, rock_positions.length);
        for (let i = 0; i < rock_positions.length; i++) {
            const [x, y] = rock_positions[i];
            const h = this.get_terrain_height(x, y);
            var w = this.random() * 0.2 + 0.1;
            const col = new THREE.Color(w, w, w);
            transform.position.set(x, h, y);
            transform.rotation.set(0, (this.random() - 0.5) * Math.PI, 0);
            transform.updateMatrix();
            rock_mesh.setMatrixAt(i, transform.matrix);
            rock_mesh.setColorAt(i, col);
        }
        rock_mesh.castShadow = true;
        rock_mesh.receiveShadow = true;
        this.mesh.add(rock_mesh);

        const very_small_rock = new PolyModel(Constants.SMALL_ROCK.vertices, Constants.SMALL_ROCK.faces, Constants.SMALL_ROCK.scale / 2);
        const very_small_rock_mesh = new THREE.InstancedMesh(very_small_rock.mesh.geometry, very_small_rock.mesh.material, very_small_rock_positions.length);
        for (let i = 0; i < very_small_rock_positions.length; i++) {
            const [x, y] = very_small_rock_positions[i];
            const h = this.get_terrain_height(x, y);
            var w = this.random() * 0.2 + 0.1;
            const col = new THREE.Color(w, w, w);
            transform.position.set(x, h, y);
            transform.rotation.set(0, (this.random() - 0.5) * Math.PI, 0);
            transform.updateMatrix();
            very_small_rock_mesh.setMatrixAt(i, transform.matrix);
            very_small_rock_mesh.setColorAt(i, col);
        }
        very_small_rock_mesh.castShadow = true;
        very_small_rock_mesh.receiveShadow = true;
        this.mesh.add(very_small_rock_mesh);
    }
}

