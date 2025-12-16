import * as THREE from '../Common/three.js-r170/build/three.module.js';
import { OrbitControls } from '../Common/three.js-r170/examples/jsm/controls/OrbitControls.js';
import Stats from '../Common/three.js-r170/examples/jsm/libs/stats.module.js';

import { Audio, AudioSamples } from './audio.js';
import { Button } from './button.js';
import { FollowCamera } from './camera.js';
import * as Constants from './constants.js';
import { Keyboard, Mouse } from './controls.js';
import { ParticleManager } from './particles.js';
import { Player } from './player.js';
import { PolyModel } from './poly_model.js';
import { EarthTerrain, MoonTerrain } from './terrain.js';
import { TextBox } from './text.js';
import { Thargoid } from './thargoid.js';

const MenuStates = Object.freeze({
    MAIN_MENU: 0,
    CONTROLS: 1,
    IN_GAME: 2,
    WON_TRANSITION: 3,
    LOST_TRANSITION: 4,
    GAME_WON: 5,
    GAME_LOST: 6,
    LOADING: 7,
});

const MenuTextIdx = Object.freeze({
    TITLE_TOP: 0,
    TITLE_BOTTOM: 1,
    WON: 2,
    LOST: 3,
    SCORE: 4,
    AMMO: 5,
    ALTITUDE: 6,
    FUEL: 7,
    PRESS_TO_START: 8,
    LOADING: 9,
    LEVEL_NUMBER: 10,
    CONTROLS_FORWARDS: 11,
    CONTROLS_LEFT: 12,
    CONTROLS_RIGHT: 13,
    CONTROLS_SHIFT: 14,
    CONTROLS_FIRE: 15,
});

const MenuButtonIdx = Object.freeze({
    PLAY: 0,
    CONTROLS: 1,
    PLAY_AGAIN: 2,
    NEXT_LEVEL: 3,
    BACK: 4,
    // And one for back to main menu?
});

class GameTest {
    init = () => {
        this.game_area = document.getElementById("game-wrapper");
        // this.canvas = document.getElementById("gl-canvas");
        // this.minimap = document.getElementById("gl-minimap");

        this.clock = new THREE.Clock();
    
        // Main game scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.fog = new THREE.FogExp2(0x000000, Constants.FOG_INTENSITY);

        // Scene used for HUD and game menus
        this.overlay_scene = new THREE.Scene();
        // this.hud_scene.background = new THREE.Color(0xFFFFFF); // temp
        

        // Create class to handle keyboard inputs
        this.keyboard = new Keyboard();
        // Create class to hangle mouse inputs
        this.mouse = new Mouse();

        // Create audio manager
        this.audio = new Audio();

        // Used to control all particles
        // All future instances should be retrieved using ParticleManager.get_instance()
        this.particles = new ParticleManager(this.scene);
        
        // Create camera
        this.camera = new FollowCamera(Constants.FOV, 1.0, Constants.NEAR, Constants.FAR);
        this.scene.add(this.camera.get());

        // Create minimap camera
        const half_width = Constants.MINIMAP_WIDTH / 2;
        this.minimap_camera = new THREE.OrthographicCamera(-half_width, half_width, half_width, -half_width, -5000, 10000); // TODO
        // this.minimap_camera = new THREE.OrthographicCamera(-window.width / 2, window.width / 2, window.width / 2, -window.width / 2, -5000, 10000); // TODO
        this.scene.add(this.minimap_camera);


        // Ambient light
        this.scene.add(new THREE.AmbientLight(0xFFFFFF));

        // Get minimum width of sidebars
        var left_bar = document.getElementById("left-bar");
        const min_sidebar_width = parseInt(window.getComputedStyle(left_bar).minWidth);
        var render_size = Math.min(window.innerWidth - min_sidebar_width * 2, window.innerHeight);
        
        // Resize left bar (right bar will fill the remaining space)
        var bar_size = (window.innerWidth - render_size) / 2;
        left_bar.style.maxWidth = `${bar_size}px`;

        // Set the mouse offset so it gives coordinates in terms of screen size
        this.mouse.set_offset(-(bar_size + render_size / 2), -render_size / 2);
        this.mouse.set_scale(Constants.HUD_CAMERA_WIDTH / render_size, Constants.HUD_CAMERA_WIDTH / render_size);

        // Create renderer and set size
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.shadowMap.enabled = true;
        this.renderer.setSize(render_size, render_size);
        this.renderer.setAnimationLoop(this.animate);

        this.canvas = this.renderer.domElement;
        this.canvas.id = "gl-canvas";
        this.game_area.append(this.canvas);
        this.game_area.style.maxWidth = `${render_size}px`;

        // Create renderer for minimap
        // Inspiration taken from https://www.youtube.com/watch?v=tdV-4EICEow
        this.minimap_renderer = new THREE.WebGLRenderer();
        var minimap_size = render_size * Constants.MINIMAP_RELATIVE_WIDTH;
        // this.minimap_renderer.setSize(this.minimap.offsetWidth, this.minimap.offsetWidth);
        this.minimap_renderer.setSize(minimap_size, minimap_size);
        
        this.minimap = this.minimap_renderer.domElement;
        this.minimap.id = "gl-minimap";
        this.game_area.append(this.minimap);

        // Create camera for overlay graphics
        const half_cam_width = Constants.HUD_CAMERA_WIDTH / 2; // temp for testing
        this.overlay_camera = new THREE.OrthographicCamera(
            -half_cam_width, half_cam_width, half_cam_width, -half_cam_width,
            Constants.HUD_CAMERA_NEAR, Constants.HUD_CAMERA_FAR
        );

        // Create renderer for overlay
        this.overlay_renderer = new THREE.WebGLRenderer({ alpha: true });
        this.overlay_renderer.setSize(render_size, render_size);
        
        this.overlay = this.overlay_renderer.domElement;
        this.overlay.id = "gl-overlay";
        this.game_area.append(this.overlay);

        // Bar to show remaining ammo
        const ammo_bar = new THREE.Mesh(
            new THREE.PlaneGeometry(Constants.HUD_CAMERA_WIDTH, Constants.HUD_CAMERA_WIDTH * Constants.HUD_BAR_THICKNESS_RATIO),
            new THREE.MeshBasicMaterial({color: 0x00FF00})
        );
        // Position at bottom of screen
        ammo_bar.position.y = - (1 - Constants.HUD_BAR_THICKNESS_RATIO) * Constants.HUD_CAMERA_WIDTH / 2;
        ammo_bar.position.z = - Constants.HUD_CAMERA_FAR;
        this.overlay_scene.add(ammo_bar);

        // Bar to show altitude
        const altitude_bar = new THREE.Mesh(
            new THREE.PlaneGeometry(Constants.HUD_CAMERA_WIDTH, Constants.HUD_CAMERA_WIDTH * Constants.HUD_BAR_THICKNESS_RATIO),
            new THREE.MeshBasicMaterial({color: 0xD0D0D0})
        );
        // Position at bottom of screen
        altitude_bar.position.y = - (1 - Constants.HUD_BAR_THICKNESS_RATIO * 3) * Constants.HUD_CAMERA_WIDTH / 2;
        altitude_bar.position.z = - Constants.HUD_CAMERA_FAR;
        this.overlay_scene.add(altitude_bar);

        // Bar to show fuel reserves
        const fuel_bar = new THREE.Mesh(
            new THREE.PlaneGeometry(Constants.HUD_CAMERA_WIDTH, Constants.HUD_CAMERA_WIDTH * Constants.HUD_BAR_THICKNESS_RATIO),
            new THREE.MeshBasicMaterial({color: 0xD0D0D0})
        );
        // Position at bottom of screen
        fuel_bar.position.y = - (1 - Constants.HUD_BAR_THICKNESS_RATIO * 5) * Constants.HUD_CAMERA_WIDTH / 2;
        fuel_bar.position.z = - Constants.HUD_CAMERA_FAR;
        this.overlay_scene.add(fuel_bar);


        const thargoid_model = new PolyModel(Constants.THARGOID.vertices, Constants.THARGOID.body, 1/8, false, THREE.MeshBasicMaterial);

        const alpha_overlay = new THREE.Mesh(
            new THREE.PlaneGeometry(Constants.HUD_CAMERA_WIDTH, Constants.HUD_CAMERA_WIDTH),
            new THREE.MeshBasicMaterial({color: 0x000000, transparent: true, opacity: Constants.MENU_OVERLAY_OPACITY, depthWrite: false})
        )
        // alpha_overlay.position.z = -Constants.HUD_CAMERA_FAR;
        this.overlay_scene.add(alpha_overlay);

        const h = Constants.HUD_CAMERA_WIDTH * 0.15;
        const text_lines = [
            new TextBox(
                0, - h - Constants.MENU_TITLE_FONT_SIZE, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                Constants.TITLE_TEXT[0], 0xD0D0D0, Constants.MENU_TITLE_FONT_SIZE
            ),
            new TextBox(
                0, - h + Constants.MENU_TITLE_FONT_SIZE, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                Constants.TITLE_TEXT[1], 0xD0D0D0, Constants.MENU_TITLE_FONT_SIZE
            ),
            new TextBox(
                0, - h - Constants.MENU_TITLE_FONT_SIZE, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "You won! :)", 0xD0D0D0, Constants.MENU_TITLE_FONT_SIZE
            ),
            new TextBox(
                0, - h - Constants.MENU_TITLE_FONT_SIZE, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "You lost :(", 0xD0D0D0, Constants.MENU_TITLE_FONT_SIZE
            ),
            new TextBox(0, 0, 0, 0, "", 0x000000, 12), // Score (this TextBox is generated dynamically)
            new TextBox(
                - (Constants.HUD_CAMERA_WIDTH - Constants.HUD_LABEL_WIDTH) / 2, (1 - Constants.HUD_BAR_THICKNESS_RATIO) * Constants.HUD_CAMERA_WIDTH / 2,
                Constants.HUD_LABEL_WIDTH, Constants.HUD_BAR_THICKNESS,
                "Ammo", 0xD0D0D0, 12, null, 0x000000
            ),
            new TextBox(
                - (Constants.HUD_CAMERA_WIDTH - Constants.HUD_LABEL_WIDTH) / 2, (1 - Constants.HUD_BAR_THICKNESS_RATIO * 3) * Constants.HUD_CAMERA_WIDTH / 2,
                Constants.HUD_LABEL_WIDTH, Constants.HUD_BAR_THICKNESS,
                "Alt", 0xD0D0D0, 12, null, 0x000000
            ),
            new TextBox(
                - (Constants.HUD_CAMERA_WIDTH - Constants.HUD_LABEL_WIDTH) / 2, (1 - Constants.HUD_BAR_THICKNESS_RATIO * 5) * Constants.HUD_CAMERA_WIDTH / 2,
                Constants.HUD_LABEL_WIDTH, Constants.HUD_BAR_THICKNESS,
                "Fuel", 0xD0D0D0, 12, null, 0x000000
            ),
            new TextBox(
                0, 0,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "Press shift / B to start", 0xD0D0D0, 12
                // "Press a key to start", 0xD0D0D0, 12
            ),
            new TextBox(
                0, 0,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "Loading...", 0xD0D0D0, 12
            ),
            new TextBox(0, 0, 0, 0, "", 0x000000, 12), // Level reached (this TextBox is generated dynamically)
            new TextBox(
                0, -Constants.HUD_CAMERA_WIDTH * 0.15,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "W / UP:  forwards thrust", 0xD0D0D0, 24
            ),
            new TextBox(
                0, -Constants.HUD_CAMERA_WIDTH * 0.075,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "A / LEFT:  turn left", 0xD0D0D0, 24
            ),
            new TextBox(
                0, -Constants.HUD_CAMERA_WIDTH * 0.0,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "D / RIGHT:  turn right", 0xD0D0D0, 24
            ),
            new TextBox(
                0, Constants.HUD_CAMERA_WIDTH * 0.075,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "SHIFT / B:  upwards thrust", 0xD0D0D0, 24
            ),
            new TextBox(
                0, Constants.HUD_CAMERA_WIDTH * 0.15,
                Constants.MENU_BUTTON_WIDTH, Constants.HUD_BAR_THICKNESS,
                "SPACE:  fire weapons", 0xD0D0D0, 24
            ),
        ];
        for (let i = 0; i < text_lines.length; i++) {
            // Initially make it invisible
            text_lines[i].mesh.visible = false;
            this.overlay_scene.add(text_lines[i].mesh);
        }
        text_lines[MenuTextIdx.AMMO].mesh.position.z = -1;
        text_lines[MenuTextIdx.ALTITUDE].mesh.position.z = -1;
        text_lines[MenuTextIdx.FUEL].mesh.position.z = -1;

        const buttons = [
            new Button(
                0, Constants.HUD_CAMERA_WIDTH * 0.15, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "Play", this.mouse
            ),
            new Button(
                0, Constants.HUD_CAMERA_WIDTH * 0.3, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "Controls", this.mouse
            ),
            new Button(
                0, Constants.HUD_CAMERA_WIDTH * 0.15, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "Play again", this.mouse
            ),
            new Button(
                0, Constants.HUD_CAMERA_WIDTH * 0.15, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "Next level", this.mouse
            ),
            new Button(
                0, Constants.HUD_CAMERA_WIDTH * 0.3, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
                "Back", this.mouse
            ),
        ];
        for (let i = 0; i < buttons.length; i++) {
            // Initially make it invisible
            buttons[i].mesh.visible = false;
            this.overlay_scene.add(buttons[i].mesh);
        }

        // Create object to track hud
        this.hud = {
            ammo: ammo_bar,
            altitude: altitude_bar,
            fuel: fuel_bar,
            thargoid_model: thargoid_model,
            thargoids_left: [],
            alpha_overlay: alpha_overlay,
            text_lines: text_lines,
            buttons: buttons,
            blink_timer: 0.0,
            score: 0,
            thargoids_shot: 0,
            level: 0,
        };
        
        // Set highscore information
        var highscore = document.cookie.split("; ").find((row) => row.startsWith("highscore="))?.split("=")[1];
        if (highscore) this.set_highscore_table(highscore);

        // Create object to track menu information
        this.menu = {
            state: MenuStates.MAIN_MENU, // TODO: use to display menu, game, or score
        };

        // Temp
        // const tree = new PolyModel(Constants.CONICAL_TREE.vertices, Constants.CONICAL_TREE.faces, Constants.CONICAL_TREE.scale);
        // tree.mesh.position.set(Constants.WIDTH / 2, 10, Constants.WIDTH / 2);
        // // tree.mesh.rotation.set(-2, 0, 0);
        // this.scene.add(tree.mesh);

        // Temp for testing
        // const controls = new OrbitControls(this.overlay_camera, this.overlay_renderer.domElement);
        // const controls = new OrbitControls(this.camera._camera, this.renderer.domElement);
        // controls.target = this.hud.thargoid.mesh.position;
        // controls.target = tree.mesh.position;
        // controls.update();
    
        // Add window resize listener
        window.addEventListener('resize', this.on_window_resize);
        
        if (Constants.SHOW_FPS) {
            this.stats = new Stats();
            this.stats.dom.style.position = "absolute";
            this.game_area.appendChild(this.stats.dom);
        }

        this.show_menu_title();
    }

    start_level = () => {
        // Remove terrain
        // Have to dispose of mesh manually
        // this.terrain.mesh.geometry.dispose();
        // this.terrain.mesh.material.dispose();
        // this.scene.remove(this.terrain.mesh);

        // Generate terrain
        const thargoids = Constants.BASE_THARGOID_COUNT + this.hud.level * Constants.THARGOID_COUNT_INCREASE_PER_LEVEL;

        // TODO: need a better way of choosing which terrain (a menu option?)
        if (this.hud.level % 2 == 0) {
            this.terrain = new EarthTerrain(1 + this.hud.level, thargoids);
        }
        else {
            this.terrain = new MoonTerrain(1 + this.hud.level, thargoids);
        }
        this.scene.add(this.terrain.mesh);
        // for (let i = 0; i < this.terrain.props.length; i++) {
        //     this.scene.add(this.terrain.props[i].mesh);
        // }

        // const test = new PolyModel(Constants.SMALL_ROCK.vertices, Constants.SMALL_ROCK.faces, 1/2);
        // test.mesh.position.set(Constants.WIDTH / 2, 0, Constants.LENGTH / 2);
        // this.scene.add(test.mesh);

        // Create player ship
        this.player = new Player(this.terrain, this.keyboard, this.audio, this.hud.level);
        this.scene.add(this.player.mesh);

        // A rather hacky way to cause shadows to appear on ground
        const point_light = new THREE.PointLight(0xFFFFFF, 10000); // TODO: make intensity a constant
        point_light.castShadow = true;
        point_light.position.set(0, Constants.SHADOW_LIGHT_HEIGHT, 0);
        point_light.shadow.mapSize.width = 2 ** 12;
        point_light.shadow.mapSize.height = 2 ** 12;
        // point_light.shadow.camera.near = 0.1;
        // point_light.shadow.camera.far = Constants.WIDTH * 2;
        this.player.mesh.add(point_light);

        // Add the camera to the ship so that it follows it
        this.camera.set_target(this.player.pos);
        this.camera.set_offset(new THREE.Vector3(0, 10, 20)); // TODO: move to constants
        this.camera.centre_target();
        
        // Set camera to correct position so it does not move on startup
        this.camera._camera.position.set(
            this.player.pos.x + this.camera._offset.x,
            this.player.pos.y + this.camera._offset.y,
            this.player.pos.z + this.camera._offset.z
        );

        // Set minimap position
        this.minimap_camera.position.set(this.player.pos.x, this.player.pos.y + 1, this.player.pos.z);
        this.minimap_camera.lookAt(this.player.pos);

        // Track thargoids still alive
        this.thargoids = []
        this.hud.thargoids_left = [];
        this.hud.thargoids_shot = 0;
        for (let i = 0; i < this.terrain.base_locations.length; i++) {
            // Create new thargoid at each base location
            const [x, z] = this.terrain.base_locations[i];
            const thargoid = new Thargoid(this.terrain, this.player, x, z);
            this.scene.add(thargoid.mesh);
            this.thargoids.push(thargoid);
            const thargoid_mesh = this.hud.thargoid_model.mesh.clone();
            var col = i % 10; // TODO
            var row = Math.floor(i / 10); // TODO
            thargoid_mesh.position.set(Constants.HUD_CAMERA_WIDTH / 2 - 32 - col * 48, Constants.HUD_CAMERA_WIDTH / 2 - 32 - row * 48, -16);
            this.overlay_scene.add(thargoid_mesh);
            this.hud.thargoids_left.push(thargoid_mesh);
        }

        // Set state and menu information
        this.menu.state = MenuStates.IN_GAME;
        this.hide_menu();
        this.hud.text_lines[MenuTextIdx.AMMO].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.ALTITUDE].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.FUEL].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.PRESS_TO_START].mesh.visible = true;
        // Show bars
        this.hud.ammo.visible = true;
        this.hud.altitude.visible = true;
        this.hud.fuel.visible = true;
    }

    end_level = (won) => {
        // Score is combined from thargoids shot, fuel left, and shots fired
        this.hud.score += this.hud.thargoids_shot * Constants.THARGOID_SCORE;
        if (won) this.hud.score += Constants.MAX_FUEL_SCORE * this.player.fuel / (Constants.PLAYER_FUEL_BASE + Constants.PLAYER_FUEL_INCREASE_PER_LEVEL * this.hud.level);
        this.hud.score -= this.player.shots_fired * Constants.SHOT_FIRED_SCORE_PENALTY;
        // Stop score from being negative
        this.hud.score = Math.max(0, Math.floor(this.hud.score));
        this.create_text(this.hud.score);

        var highscore = document.cookie.split("; ").find((row) => row.startsWith("highscore="))?.split("=")[1];
        if (!highscore) {
            // If highscore is undefined or NaN
            highscore = this.hud.score;
        }
        else {
            highscore = Math.max(highscore, this.hud.score);
        }

        document.cookie = `highscore=${highscore}; Secure`;
        this.set_highscore_table(highscore, this.hud.score);

        if (won) {
            this.menu.state = MenuStates.WON_TRANSITION;
        }
        else {
            this.menu.state = MenuStates.LOST_TRANSITION;
        }
        this.hud.transition_delay = 2; // TODO: make a constant
    }

    set_highscore_table = (highscore, last_score = null) => {
        // Display highscore on right panel
        const highscore_list = document.getElementById("highscores");
        highscore_list.innerHTML = `<em>You: ${highscore}</em>`;
        if (last_score) highscore_list.innerHTML += `<br/>Last attempt: ${last_score}`;
    }

    create_text = (score) => {
        // Score text
        // Destroy old text
        this.hud.text_lines[MenuTextIdx.SCORE].mesh.geometry.dispose();
        this.hud.text_lines[MenuTextIdx.SCORE].mesh.material.dispose();
        this.overlay_scene.remove(this.hud.text_lines[MenuTextIdx.SCORE].mesh);
        this.hud.text_lines[MenuTextIdx.SCORE].text_mesh.geometry.dispose();
        this.hud.text_lines[MenuTextIdx.SCORE].text_mesh.material.dispose();

        // Create new text
        this.hud.text_lines[MenuTextIdx.SCORE] = new TextBox(
            0, - Constants.HUD_CAMERA_WIDTH * 0.1 + Constants.MENU_SUBTITLE_FONT_SIZE, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
            "Score:  " + score.toString(), 0xD0D0D0, Constants.MENU_SUBTITLE_FONT_SIZE
        );
        this.overlay_scene.add(this.hud.text_lines[MenuTextIdx.SCORE].mesh);
        this.hud.text_lines[MenuTextIdx.SCORE].mesh.visible = false;

        // Level reached text
        // Destroy old text
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh.geometry.dispose();
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh.material.dispose();
        this.overlay_scene.remove(this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh);
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].text_mesh.geometry.dispose();
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].text_mesh.material.dispose();

        // Create new text
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER] = new TextBox(
            0, Constants.MENU_SUBTITLE_FONT_SIZE, Constants.MENU_BUTTON_WIDTH, Constants.MENU_BUTTON_HEIGHT,
            "Level reached:  " + (this.hud.level+1).toString(), 0xD0D0D0, Constants.MENU_SUBTITLE_FONT_SIZE
        );
        this.overlay_scene.add(this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh);
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh.visible = false;
    }

    show_menu_title = () => {
        // Show alpha overlay
        this.hud.alpha_overlay.visible = true;
        this.hud.alpha_overlay.material.opacity = Constants.MENU_OVERLAY_OPACITY;
        // Show buttons
        this.hud.buttons[MenuButtonIdx.PLAY].set_visible(true);
        this.hud.buttons[MenuButtonIdx.CONTROLS].set_visible(true);
        // Show title text
        this.hud.text_lines[MenuTextIdx.TITLE_TOP].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.TITLE_BOTTOM].mesh.visible = true;
        // Hide bars
        this.hud.ammo.visible = false;
        this.hud.altitude.visible = false;
        this.hud.fuel.visible = false;
    }

    show_menu_loading = () => {
        // Show title text
        this.hud.text_lines[MenuTextIdx.LOADING].mesh.visible = true;
        // Hide bars
        this.hud.ammo.visible = false;
        this.hud.altitude.visible = false;
        this.hud.fuel.visible = false;
    }

    show_menu_controls = () => {
        // Show title text
        // this.hud.text_lines[MenuTextIdx.TITLE_TOP].mesh.visible = true;
        // Show buttons
        this.hud.buttons[MenuButtonIdx.BACK].set_visible(true);
        // Show text
        this.hud.text_lines[MenuTextIdx.CONTROLS_FORWARDS].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.CONTROLS_LEFT].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.CONTROLS_RIGHT].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.CONTROLS_SHIFT].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.CONTROLS_FIRE].mesh.visible = true;
    }

    set_transistion_opacity = (opacity) => {
        // Show alpha overlay
        this.hud.alpha_overlay.visible = true;
        this.hud.alpha_overlay.material.opacity = opacity;
    }
    
    show_menu_game_won = () => {
        // Show alpha overlay
        this.hud.alpha_overlay.visible = true;
        this.hud.alpha_overlay.material.opacity = Constants.MENU_OVERLAY_OPACITY;
        // Show buttons
        this.hud.buttons[MenuButtonIdx.NEXT_LEVEL].set_visible(true);
        // Show game won text
        this.hud.text_lines[MenuTextIdx.WON].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.SCORE].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh.visible = true;
    }
    
    show_menu_game_lost = () => {
        // Show alpha overlay
        this.hud.alpha_overlay.visible = true;
        this.hud.alpha_overlay.material.opacity = Constants.MENU_OVERLAY_OPACITY;
        // Show buttons
        this.hud.buttons[MenuButtonIdx.PLAY_AGAIN].set_visible(true);
        // Show game lost text
        this.hud.text_lines[MenuTextIdx.LOST].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.SCORE].mesh.visible = true;
        this.hud.text_lines[MenuTextIdx.LEVEL_NUMBER].mesh.visible = true;
    }

    hide_menu = () => {
        // Hide menu items
        this.hud.alpha_overlay.visible = false;
        // Hide text
        for (let i = 0; i < this.hud.text_lines.length; i++) {
            this.hud.text_lines[i].mesh.visible = false;
        }
        // Hide buttons
        for (let i = 0; i < this.hud.buttons.length; i++) {
            this.hud.buttons[i].set_visible(false);
        }
    }
    
    clear_level = () => {
        // Remove terrain
        // Have to dispose of mesh manually
        this.terrain.mesh.geometry.dispose();
        this.terrain.mesh.material.dispose();
        this.scene.remove(this.terrain.mesh);

        // for (let i = 0; i < this.terrain.props.length; i++) {
        //     this.terrain.props[i].dispose();
        //     this.scene.remove(this.terrain.props[i].mesh);
        // }

        // Remove all particles
        this.particles.clear();

        // Remove player
        this.player.dispose();
        this.scene.remove(this.player.mesh);
        
        // Get rid of any thargoids which are left
        for (let i = this.thargoids.length - 1; i >= 0; i--) {
            // Dispose of object
            this.scene.remove(this.thargoids[i].mesh);
            this.thargoids[i].dispose();
            
            // The two lists should be exactly the same length
            const thargoid_mesh = this.hud.thargoids_left[i];
            thargoid_mesh.geometry.dispose();
            thargoid_mesh.material.dispose();
            this.overlay_scene.remove(thargoid_mesh);
        }
        this.thargoids = [];
        this.hud.thargoids_left = [];

        // TODO: tidy up terrain data
    }

    on_window_resize = () => {
        // Get minimum width of sidebars
        var left_bar = document.getElementById("left-bar");
        const min_sidebar_width = parseInt(window.getComputedStyle(left_bar).minWidth);

        // Resize main canvas
        var render_size = Math.min(window.innerWidth - min_sidebar_width * 2, window.innerHeight);
        this.renderer.setSize(render_size, render_size);
        this.game_area.style.maxWidth = `${render_size}px`;
        
        // Resize left bar (right bar will fill the remaining space)
        var bar_size = (window.innerWidth - render_size) / 2;
        left_bar.style.maxWidth = `${bar_size}px`;

        // Set the mouse offset so it gives coordinates in terms of screen size
        this.mouse.set_offset(-(bar_size + render_size / 2), -render_size / 2);
        this.mouse.set_scale(Constants.HUD_CAMERA_WIDTH / render_size, Constants.HUD_CAMERA_WIDTH / render_size);
        
        // Resize minimap
        var minimap_size = render_size * Constants.MINIMAP_RELATIVE_WIDTH;
        this.minimap_renderer.setSize(minimap_size, minimap_size);
        var minimap_offset = render_size * Constants.MINIMAP_BORDER_RELATIVE_WIDTH;
        this.minimap.style.top = `${minimap_offset}px`;
        this.minimap.style.left = `${minimap_offset}px`;
        
        // Resize overlay
        this.overlay_renderer.setSize(render_size, render_size);

        // Rerender scene
        this.render();
    }

    update_game = (dt) => {
        // Update the player
        this.player.update(dt);

        this.hud.blink_timer -= dt;
        if (this.hud.blink_timer <= 0) {
            this.hud.blink_timer += Constants.HUD_BLINK_SPEED * 2;
        }

        if (this.menu.state == MenuStates.IN_GAME && this.player._just_died) {
            this.end_level(false);
        }

        // Update enemies
        for (let i = this.thargoids.length - 1; i >= 0; i--) {
            this.thargoids[i].update(dt);
            if (!this.thargoids[i]._alive) {
                // Dispose of object
                this.scene.remove(this.thargoids[i].mesh);
                this.thargoids[i].dispose();
                // If thargoid is no longer alive, remove it from list to stop updating it
                this.thargoids.splice(i, 1);
                
                // Remove one of the thargoid HUD icons too
                const idx = this.hud.thargoids_left.length - 1;
                const thargoid_mesh = this.hud.thargoids_left[idx];
                // Have to dispose of mesh manually
                thargoid_mesh.geometry.dispose();
                thargoid_mesh.material.dispose();
                this.overlay_scene.remove(thargoid_mesh);
                // Also remove from the array of icons
                this.hud.thargoids_left.splice(idx, 1);

                // Check if the last thargoid was killed
                if (idx == 0 && this.player._alive && this.player._has_control) {
                    this.end_level(true);
                }
            }
            else if (this.player.colliding_with(this.thargoids[i])) {
                this.player.lose_control();
                this.thargoids[i].kill();
                this.audio.play_sound(AudioSamples.THARGOID_EXPLOSION);
            }
            else {
                for (let j = this.player.projectiles.length - 1; j >= 0; j--) {
                    if (this.thargoids[i].point_inside(this.player.projectiles[j].position)) {
                        // Player hit thargoid with projectile
                        this.thargoids[i].kill();
                        this.audio.play_sound(AudioSamples.THARGOID_EXPLOSION);
                        this.hud.thargoids_shot++;
                        // TEMP: hacky way to cause the ParticleManager to delete the particle
                        this.player.projectiles[j].position.y = -10;
                        this.player.projectiles.splice(j, 1);
                    }
                }
            }
        }

        // if (this.player.fuel <= 0) {
        //     // Ran out of fuel
        //     this.player.lose_control();
        // }

        const blink_on = this.hud.blink_timer < Constants.HUD_BLINK_SPEED;

        // Set size and colour of ammo bar on HUD
        this.hud.ammo.position.x = - (Constants.HUD_CAMERA_WIDTH - Constants.HUD_LABEL_WIDTH) * (1 - this.player.ammo / Constants.PLAYER_AMMO);
        this.hud.ammo.material.color.r = (1 - this.player.ammo / Constants.PLAYER_AMMO);
        this.hud.ammo.material.color.g = (this.player.ammo / Constants.PLAYER_AMMO);
        this.hud.ammo.material.color.b = 0;
        
        // Set size of altitude bar on HUD
        const terrain_height = this.terrain.get_terrain_height(this.player.pos.x, this.player.pos.z);
        const alt = this.player.pos.y - terrain_height;
        // const alt = this.player.pos.y;
        this.hud.altitude.position.x = - (Constants.HUD_CAMERA_WIDTH - Constants.HUD_LABEL_WIDTH) * (1 - alt / (Constants.MAX_HEIGHT - terrain_height));
        
        const fuel_ratio = this.player.fuel / (Constants.PLAYER_FUEL_BASE + Constants.PLAYER_FUEL_INCREASE_PER_LEVEL * this.hud.level);

        // Set size and colour of fuel bar on HUD
        this.hud.fuel.position.x = - (Constants.HUD_CAMERA_WIDTH - Constants.HUD_LABEL_WIDTH) * (1 - fuel_ratio);
        this.hud.fuel.material.color.r = 1;
        this.hud.fuel.material.color.g = fuel_ratio > 0.25 ? 1 : 0;
        this.hud.fuel.material.color.b = fuel_ratio > 0.5 ? 1 : 0;

        // Make labels blink when low
        this.hud.text_lines[MenuTextIdx.AMMO].text_mesh.visible = blink_on || this.player.ammo > Constants.PLAYER_AMMO_WARN;
        this.hud.text_lines[MenuTextIdx.ALTITUDE].text_mesh.visible = blink_on || alt > Constants.PLAYER_ALTITUDE_WARN;
        this.hud.text_lines[MenuTextIdx.FUEL].text_mesh.visible = blink_on || fuel_ratio > Constants.PLAYER_FUEL_WARN;
        this.hud.text_lines[MenuTextIdx.PRESS_TO_START].text_mesh.visible = !this.player._playing;

        // if (this.player.ammo <= Constants.PLAYER_AMMO_WARN || alt <= Constants.PLAYER_ALTITUDE_WARN || fuel_ratio <= Constants.PLAYER_FUEL_WARN) {
        if (!this.player._has_control || alt <= Constants.PLAYER_ALTITUDE_WARN || fuel_ratio <= Constants.PLAYER_FUEL_WARN) {
            // if (this.player._alive) this.audio.play_sound(AudioSamples.ALERT);
        }
        if (this.player._alive) {
            if (!this.player._has_control || this.player.fuel <= 0) {
                this.audio.play_sound(AudioSamples.ALERT);
            }
        }

        
        // Update the particle system
        this.particles.update(dt);
        // Update the camera so it can follow the player
        this.camera.update(dt);
        // Update the minimap camera position
        this.minimap_camera.position.set(this.player.pos.x, this.player.pos.y + 1, this.player.pos.z);
    }
    
    animate = () => {
        if (Constants.SHOW_FPS) this.stats.begin();

        var dt = this.clock.getDelta();
        dt = Math.min(dt, 1/20); // Don't let dt get too big (if game is running at less than 20fps)

        // Update buttons
        for (let i = 0; i < this.hud.buttons.length; i++) {
            if (this.hud.buttons[i].mesh.visible) this.hud.buttons[i].update(dt);
        }

        this.mouse.clear_just_clicked();

        if (this.menu.state == MenuStates.MAIN_MENU) {
            if (this.hud.buttons[MenuButtonIdx.PLAY].clicked) {
                this.audio.play_sound(AudioSamples.CLICK);
                this.hide_menu();
                this.menu.state = MenuStates.LOADING;
                this.show_menu_loading();
            }
            else if (this.hud.buttons[MenuButtonIdx.CONTROLS].clicked) {
                this.audio.play_sound(AudioSamples.CLICK);
                this.hide_menu();
                this.menu.state = MenuStates.CONTROLS;
                this.show_menu_controls();
            }
        }
        else if (this.menu.state == MenuStates.CONTROLS) {
            if (this.hud.buttons[MenuButtonIdx.BACK].clicked) {
                this.audio.play_sound(AudioSamples.CLICK);
                this.hide_menu();
                this.menu.state = MenuStates.MAIN_MENU;
                this.show_menu_title();
            }
        }
        else if (this.menu.state == MenuStates.LOADING) {
            this.hide_menu();
            this.menu.state = MenuStates.IN_GAME;
            this.start_level();
        }
        else if (this.menu.state == MenuStates.IN_GAME) {
            this.update_game(dt);
        }
        else if (this.menu.state == MenuStates.WON_TRANSITION) {
            if (this.hud.transition_delay > 0) {
                this.hud.transition_delay -= dt;
            }
            else {
                this.menu.state = MenuStates.GAME_WON;
                this.show_menu_game_won();
            }

            if (this.hud.transition_delay < 1) { // TODO: make a constant
                this.set_transistion_opacity((1.0 - this.hud.transition_delay) * Constants.MENU_OVERLAY_OPACITY); // TODO: make 1.0 a constant
            }
            this.update_game(dt);
        }
        else if (this.menu.state == MenuStates.LOST_TRANSITION) {
            if (this.hud.transition_delay > 0) {
                this.hud.transition_delay -= dt;
            }
            else {
                this.menu.state = MenuStates.GAME_LOST;
                this.show_menu_game_lost();
            }

            if (this.hud.transition_delay < 1) { // TODO: make a constant
                this.set_transistion_opacity((1.0 - this.hud.transition_delay) * Constants.MENU_OVERLAY_OPACITY); // TODO: make 1.0 a constant
            }
            this.update_game(dt);
        }
        else if (this.menu.state == MenuStates.GAME_WON) {
            // TODO
            // TODO: don't show in background? maybe show a second or so but fade out?
            this.update_game(dt);
            
            if (this.hud.buttons[MenuButtonIdx.NEXT_LEVEL].clicked || this.keyboard.fire) {
                this.audio.play_sound(AudioSamples.CLICK);
                this.clear_level();
                this.hud.level++; // Increment level counter
                this.hide_menu();
                this.menu.state = MenuStates.LOADING;
                this.show_menu_loading();
            }
        }
        else if (this.menu.state == MenuStates.GAME_LOST) {
            // TODO
            // TODO: show in background
            this.update_game(dt);
            
            if (this.hud.buttons[MenuButtonIdx.PLAY_AGAIN].clicked || this.keyboard.fire) {
                this.audio.play_sound(AudioSamples.CLICK);
                this.clear_level();
                this.hud.score = 0; // Restart with zero score
                this.hud.level = 0; // Restart from level 0
                this.hide_menu();
                this.menu.state = MenuStates.LOADING;
                this.show_menu_loading();
            }
        }
        // Render the scene
        this.render();

        if (Constants.SHOW_FPS) this.stats.end();
    }
    
    render = () => {
        // Reset fog for main scene
        this.scene.fog.density = Constants.FOG_INTENSITY;
        this.renderer.render(this.scene, this.camera.get());

        // Clear fog for minimap
        this.scene.fog.density = 0;
        this.minimap_renderer.render(this.scene, this.minimap_camera);

        // Render overlay (HUD and menus)
        this.overlay_renderer.render(this.overlay_scene, this.overlay_camera);

    }
}

const game = new GameTest();
game.init();
