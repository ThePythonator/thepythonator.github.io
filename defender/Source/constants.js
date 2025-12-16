// constants.js

import { Vector3 } from "../Common/three.js-r170/build/three.module.js";

// General
export const EPSILON = 0.0001;
export const SHOW_FPS = false;

// Environment
export const GRAVITY = 15;
export const FOG_INTENSITY = 0.01;
export const MAX_HEIGHT = 256; // Player's engines cut out after this limit

// Camera
export const FOV = 60;
export const NEAR = 0.1;
export const FAR = 10000;

// Lighting
export const SHADOW_LIGHT_HEIGHT = 128;

// Minimap
export const MINIMAP_WIDTH = 256; // Width of minimap in in-game units
export const MINIMAP_RELATIVE_WIDTH = 0.25; // Percentage of overall canvas
export const MINIMAP_BORDER_RELATIVE_WIDTH = 0.02; // Percentage of overall canvas
export const ICON_HEIGHT = MAX_HEIGHT + 128; // Height above the player/enemy
export const PLAYER_ICON = {
    scale: 8,
    vertices: [
        [  0, 0,  1 ],
        [  1, 0, -1 ],
        [ -1, 0, -1 ],
    ],
    faces: [
        { vertices: [  0,  1,  2 ], colour: 0xFFFFFF }, // Face 0
    ],
};
export const ENEMY_ICON = {
    scale: 8,
    vertices: [
        [  0, 0,  1 ],
        [  1, 0, -1 ],
        [ -1, 0, -1 ],
    ],
    faces: [
        { vertices: [  0,  1,  2 ], colour: 0xA00000 }, // Face 0
    ],
};

// HUD and menus
export const HUD_CAMERA_WIDTH = 1024;
export const HUD_CAMERA_NEAR = -32;
export const HUD_CAMERA_FAR = 32;
export const HUD_BAR_THICKNESS_RATIO = 0.02;
export const HUD_BAR_THICKNESS = HUD_BAR_THICKNESS_RATIO * HUD_CAMERA_WIDTH;
export const HUD_LABEL_WIDTH_RATIO = 0.1;
export const HUD_LABEL_WIDTH = HUD_LABEL_WIDTH_RATIO * HUD_CAMERA_WIDTH;

export const HUD_BLINK_SPEED = 0.1; // Every 0.1s alternate between showing and hidden

export const MENU_BUTTON_WIDTH = HUD_CAMERA_WIDTH / 3;
export const MENU_BUTTON_HEIGHT = HUD_CAMERA_WIDTH / 16;
export const MENU_OVERLAY_OPACITY = 0.75;
export const MENU_TITLE_FONT_SIZE = 48;
export const MENU_SUBTITLE_FONT_SIZE = 32;

export const TITLE_TEXT = ["P L A N E T A R Y", "D E F E N D E R"];

// Scoring
export const MAX_FUEL_SCORE = 100; // Points for a full tank of fuel
export const THARGOID_SCORE = 50; // Points per thargoid shot
// export const LEVELS_PASSED_SCORE = 100; // Points per level complete
export const SHOT_FIRED_SCORE_PENALTY = 1; // Points lost per shot

// Terrain generation
export const WIDTH = 512;
export const LENGTH = WIDTH;
export const EARTH = {
    octaves: 4,
    axis_scale: 1/128,
    height_coefficients: [0, 12, 0, 16], // 12h + 16h^3
    colour_variation: 0.1,
};
export const MOON = {
    octaves: 3,
    axis_scale: 1/128,
    height_coefficients: [0, 12, 6], // 12h + 6h^2
    colour_variation: 0.08,
};
export const SAFE_AREA_RADIUS = 32;

// Terrain regions
export const SAND_HEIGHT = 0.1; // From 0.0 to 0.1
export const GRASS_HEIGHT = 0.55; // From 0.1 to 0.55
export const MOUNTAIN_STONE_HEIGHT = 0.75; // From 0.55 to 0.75
// Snow is above 0.75

export const CRATER_HEIGHT = -0.3; // Craters only occur below this colour height
export const CRATER_HEIGHT_CHANGE = -0.1; // Craters lower colour height by this much
export const CRATER_MIN_SEPARATION = 1;
export const CRATER_MIN_RADIUS = 8;
export const CRATER_MAX_RADIUS = 32;
export const LAVA_HEIGHT = -0.35;

// Props
export const TREE_MINIMUM_SQUARE_DISTANCE = 4;
export const TREE_PROBABILITY = 0.25;
export const TREE_MINIMUM_GROUND_HEIGHT = 0.13; // Colour height, not terrain height

export const PALM_TREE_MINIMUM_SQUARE_DISTANCE = 9;
export const PALM_TREE_PROBABILITY = 0.3;
export const PALM_TREE_MAXIMUM_GROUND_HEIGHT = 0.09; // Colour height, not terrain height

export const HOUSE_MINIMUM_SQUARE_DISTANCE = 9;
export const HOUSE_PROBABILITY = 0.1;
export const HOUSE_MINIMUM_GROUND_HEIGHT = 0.15; // Colour height, not terrain height
export const HOUSE_MAX_HEIGHT_CHANGE = 0.25; // In terrain height
export const HOUSE_SQUARE_CHANCE = 0.25; // 25% of houses will be square

export const ROCK_MINIMUM_SQUARE_DISTANCE = 16;
export const ROCK_PROBABILITY = 0.015;
export const ROCK_MAX_HEIGHT_CHANGE = 0.25; // In terrain height
export const VERY_SMALL_ROCK_MINIMUM_SQUARE_DISTANCE = 4;
export const VERY_SMALL_ROCK_CHANCE = 0.35; // 35% of rocks will be very small (half size) - although these percentages don't seem right

// Base area
export const BASE_SIZE = 8;
export const BASE_MIN_HEIGHT = 0.15;
export const BASE_MIN_SEPARATION = 48;
export const BASE_MAX_CORNER_HEIGHT_DIFF = 0.1;
export const BASE_MAX_CORNER_HEIGHT = 0.4;

// Camera
export const CAMERA_SPEED = 7;

// Player
export const PLAYER_SPAWN_HEIGHT = 4; // TODO: maybe change this so player takes off from a base?
export const PLAYER_ACCELERATION = {
    horizontal: 20,
    vertical: 30
};
export const PLAYER_AMMO = 10;
export const PLAYER_AMMO_RELOAD_RATE = 2; // per second
export const PLAYER_FIRE_RATE = 0.15; // Minimum time per round fired
export const PLAYER_HEADLIGHT_INTENSITY = 50;
export const PLAYER_FUEL_BASE = 60; // Seconds of flight time
export const PLAYER_FUEL_INCREASE_PER_LEVEL = 15; // Seconds of flight time

export const PLAYER_AMMO_WARN = 0.25 * PLAYER_AMMO;
export const PLAYER_ALTITUDE_WARN = 5;
export const PLAYER_FUEL_WARN = 0.125; // Percentage of max fuel

// Level difficulty
export const BASE_THARGOID_COUNT = 4;
export const THARGOID_COUNT_INCREASE_PER_LEVEL = 2;

// Vectors
export const Y_AXIS = new Vector3(0, 1, 0);

// Particles
export const EXPLOSION = {
    count: 200
};
export const PARTICLE_MIN_HEIGHT = -32;

// Ships
// Taken from https://elite.bbcelite.com/6502sp/main/variable/ship_cobra_mk_3.html
export const COBRA = {
    scale: 1/64,
    specs: {
        // max_speed: 10,
        // acceleration: 5 // CHange later to be per axis, adn also change flying controls
    },
    collidable_points: [
        // Vertex indicies of points to check for collisions
        1, 0, // Front bottom edge
        10, 11, // Back bottom edge
        4, 7, // Left edge
        3, 8, // Right edge
        // TODO: later do I need more to allow collisions from above? Or should I use face normals or something against thargoids?
    ],
    vertices: [
        [   32,    0,   76 ], // Vertex 0
        [  -32,    0,   76 ], // Vertex 1
        [    0,   26,   24 ], // Vertex 2
        [ -120,   -3,   -8 ], // Vertex 3
        [  120,   -3,   -8 ], // Vertex 4
        [  -88,   16,  -40 ], // Vertex 5
        [   88,   16,  -40 ], // Vertex 6
        [  128,   -8,  -40 ], // Vertex 7
        [ -128,   -8,  -40 ], // Vertex 8
        [    0,   26,  -40 ], // Vertex 9
        [  -32,  -24,  -40 ], // Vertex 10
        [   32,  -24,  -40 ], // Vertex 11
        [  -36,    8,  -40.05 ], // Vertex 12
        [   -8,   12,  -40.05 ], // Vertex 13
        [    8,   12,  -40.05 ], // Vertex 14
        [   36,    8,  -40.05 ], // Vertex 15
        [   36,  -12,  -40.05 ], // Vertex 16
        [    8,  -16,  -40.05 ], // Vertex 17
        [   -8,  -16,  -40.05 ], // Vertex 18
        [  -36,  -12,  -40.05 ], // Vertex 19
        [    0,    0,   76 ], // Vertex 20
        [    0,    0,   90 ], // Vertex 21
        [  -80,   -6,  -40.05 ], // Vertex 22
        [  -80,    6,  -40.05 ], // Vertex 23
        [  -88,    0,  -40.05 ], // Vertex 24
        [   80,    6,  -40.05 ], // Vertex 25
        [   88,    0,  -40.05 ], // Vertex 26
        [   80,   -6,  -40.05 ], // Vertex 27
    ],
    edges: [
        [  0,   1 ], // Edge 0
        [  0,   4 ], // Edge 1
        [  1,   3 ], // Edge 2
        [  3,   8 ], // Edge 3
        [  4,   7 ], // Edge 4
        [  6,   7 ], // Edge 5
        [  6,   9 ], // Edge 6
        [  5,   9 ], // Edge 7
        [  5,   8 ], // Edge 8
        [  2,   5 ], // Edge 9
        [  2,   6 ], // Edge 10
        [  3,   5 ], // Edge 11
        [  4,   6 ], // Edge 12
        [  1,   2 ], // Edge 13
        [  0,   2 ], // Edge 14
        [  8,  10 ], // Edge 15
        [ 10,  11 ], // Edge 16
        [  7,  11 ], // Edge 17
        [  1,  10 ], // Edge 18
        [  0,  11 ], // Edge 19
        [  1,   5 ], // Edge 20
        [  0,   6 ], // Edge 21
        [ 20,  21 ], // Edge 22
        [ 12,  13 ], // Edge 23
        [ 18,  19 ], // Edge 24
        [ 14,  15 ], // Edge 25
        [ 16,  17 ], // Edge 26
        [ 15,  16 ], // Edge 27
        [ 14,  17 ], // Edge 28
        [ 13,  18 ], // Edge 29
        [ 12,  19 ], // Edge 30
        [  2,   9 ], // Edge 31
        [ 22,  24 ], // Edge 32
        [ 23,  24 ], // Edge 33
        [ 22,  23 ], // Edge 34
        [ 25,  26 ], // Edge 35
        [ 26,  27 ], // Edge 36
        [ 25,  27 ], // Edge 37
    ],
    body: [
        { vertices: [   0,   1,  10 ], colour: 0x3F0000 }, // Face 0
        { vertices: [   0,  10,  11 ], colour: 0x3F0000 }, // Face 1
        { vertices: [   1,   3,  10 ], colour: 0x3F0000 }, // Face 2
        { vertices: [   3,   8,  10 ], colour: 0x3F0000 }, // Face 3
        { vertices: [   0,  11,   4 ], colour: 0x3F0000 }, // Face 4
        { vertices: [   4,  11,   7 ], colour: 0x3F0000 }, // Face 5
        { vertices: [   0,   2,   1 ], colour: 0x3F0000 }, // Face 6
        { vertices: [   1,   2,   5 ], colour: 0x3F0000 }, // Face 7
        { vertices: [   2,   9,   5 ], colour: 0x3F0000 }, // Face 8
        { vertices: [   2,   6,   9 ], colour: 0x3F0000 }, // Face 9
        { vertices: [   0,   6,   2 ], colour: 0x3F0000 }, // Face 10
        { vertices: [   1,   5,   3 ], colour: 0x3F0000 }, // Face 11
        { vertices: [   3,   5,   8 ], colour: 0x3F0000 }, // Face 12
        { vertices: [   0,   4,   6 ], colour: 0x3F0000 }, // Face 13
        { vertices: [   4,   7,   6 ], colour: 0x3F0000 }, // Face 14
        { vertices: [   9,  11,  10 ], colour: 0x3F0000 }, // Face 15
        { vertices: [   5,   9,  10 ], colour: 0x3F0000 }, // Face 16
        { vertices: [   5,  10,   8 ], colour: 0x3F0000 }, // Face 17
        { vertices: [   6,  11,   9 ], colour: 0x3F0000 }, // Face 18
        { vertices: [   6,   7,  11 ], colour: 0x3F0000 }, // Face 19
    ],
    engine_centres: [
        // [ -84,  0, -40 ],
        // [  84,  0, -40 ],
        [ -22,  0, -40 ],
        [  22,  0, -40 ],
    ],
    engines: [
        { vertices: [  22,  24,  23 ], colour: 0xBBEEFF }, // Face 0
        { vertices: [  12,  18,  19 ], colour: 0xBBEEFF }, // Face 1
        { vertices: [  12,  13,  18 ], colour: 0xBBEEFF }, // Face 2
        { vertices: [  14,  15,  17 ], colour: 0xBBEEFF }, // Face 3
        { vertices: [  15,  16,  17 ], colour: 0xBBEEFF }, // Face 4
        { vertices: [  25,  26,  27 ], colour: 0xBBEEFF }, // Face 5
    ],
};
export const THARGOID = {
    scale: 1/64,
    // size: 2,
    collidable_points: [
        // Vertex indicies of points to check for collisions
        // All main vertices are collidable to avoid missing any collisions
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13, 14, 15
    ],
    vertices: [
        [   48,  -48,  32 ], // Vertex 0
        [    0,  -68,  32 ], // Vertex 1
        [  -48,  -48,  32 ], // Vertex 2
        [  -68,    0,  32 ], // Vertex 3
        [  -48,   48,  32 ], // Vertex 4
        [    0,   68,  32 ], // Vertex 5
        [   48,   48,  32 ], // Vertex 6
        [   68,    0,  32 ], // Vertex 7
        [  116, -116, -24 ], // Vertex 8
        [    0, -164, -24 ], // Vertex 9
        [ -116, -116, -24 ], // Vertex 10
        [ -164,    0, -24 ], // Vertex 11
        [ -116,  116, -24 ], // Vertex 12
        [    0,  164, -24 ], // Vertex 13
        [  116,  116, -24 ], // Vertex 14
        [  164,    0, -24 ], // Vertex 15
        [    0,    0,  12 ], // Vertex 16
        [    0,    0,  12 ], // Vertex 17
    ],
    edges: [
        [  0,  7 ],
        [  0,  1 ],
        [  1,  2 ],
        [  2,  3 ],
        [  3,  4 ],
        [  4,  5 ],
        [  5,  6 ],
        [  6,  7 ],
        [  0,  8 ],
        [  1,  9 ],
        [  2, 10 ],
        [  3, 11 ],
        [  4, 12 ],
        [  5, 13 ],
        [  6, 14 ],
        [  7, 15 ],
        [  8, 15 ],
        [  8,  9 ],
        [  9, 10 ],
        [ 10, 11 ],
        [ 11, 12 ],
        [ 12, 13 ],
        [ 13, 14 ],
        [ 14, 15 ],
    ],
    body: [
        { vertices: [  0, 17,  1 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 0
        { vertices: [  1, 17,  2 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 1
        { vertices: [  2, 17,  3 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 2
        { vertices: [  3, 17,  4 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 3
        { vertices: [  4, 17,  5 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 4
        { vertices: [  5, 17,  6 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 5
        { vertices: [  6, 17,  7 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 6
        { vertices: [  7, 17,  0 ], colour: 0x101510, normal: [ 0, 0, 1 ] }, // Face 7
        
        { vertices: [  8,  0,  9 ], colour: 0x0A150A }, // Face 8
        { vertices: [  9,  1, 10 ], colour: 0x0A150A }, // Face 9
        { vertices: [ 10,  2, 11 ], colour: 0x0A150A }, // Face 10
        { vertices: [ 11,  3, 12 ], colour: 0x0A150A }, // Face 11
        { vertices: [ 12,  4, 13 ], colour: 0x0A150A }, // Face 12
        { vertices: [ 13,  5, 14 ], colour: 0x0A150A }, // Face 13
        { vertices: [ 14,  6, 15 ], colour: 0x0A150A }, // Face 14
        { vertices: [ 15,  7,  8 ], colour: 0x0A150A }, // Face 15

        { vertices: [  9,  0,  1 ], colour: 0x1A251A }, // Face 16
        { vertices: [ 10,  1,  2 ], colour: 0x1A251A }, // Face 17
        { vertices: [ 11,  2,  3 ], colour: 0x1A251A }, // Face 18
        { vertices: [ 12,  3,  4 ], colour: 0x1A251A }, // Face 19
        { vertices: [ 13,  4,  5 ], colour: 0x1A251A }, // Face 20
        { vertices: [ 14,  5,  6 ], colour: 0x1A251A }, // Face 21
        { vertices: [ 15,  6,  7 ], colour: 0x1A251A }, // Face 22
        { vertices: [  8,  7,  0 ], colour: 0x1A251A }, // Face 23
        
        { vertices: [ 16, 15,  8 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 24
        { vertices: [ 16,  8,  9 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 25
        { vertices: [ 16,  9, 10 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 26
        { vertices: [ 16, 10, 11 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 27
        { vertices: [ 16, 11, 12 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 28
        { vertices: [ 16, 12, 13 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 29
        { vertices: [ 16, 13, 14 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 30
        { vertices: [ 16, 14, 15 ], colour: 0x101510, normal: [ 0, 0, -1 ] }, // Face 31
    ],
};

// Environment
export const CONICAL_TREE_LEAVES = {
    scale: 1/4,
    collidable_points: [
        // Vertex indicies of points to check for collisions
        // Only higher up vertices are considered
        0, 1, 2, 3
    ],
    vertices: [
        // Tree
        [0, 8.5, 0],
        [-Math.sqrt(3), 1.5, 1],
        [Math.sqrt(3), 1.5, 1],
        [0, 1.5, -2],
    ],
    faces: [
        { vertices: [ 0, 2, 3 ], colour: 0x009000 }, // Face 0
        { vertices: [ 0, 1, 2 ], colour: 0x009000 }, // Face 1
        { vertices: [ 0, 3, 1 ], colour: 0x009000 }, // Face 2
        { vertices: [ 1, 3, 2 ], colour: 0x009000 }, // Face 3
    ]
};
export const TREE_TRUNK = {
    scale: 1/4,
    collidable_points: [],
    vertices: [
        // Trunk
        [0, 1.5, 2 / 3],
        [-Math.sqrt(3) / 3, 1.5, -1 / 3],
        [Math.sqrt(3) / 3, 1.5, -1 / 3],
        [0, 0, 2 / 3],
        [-Math.sqrt(3) / 3, 0, -1 / 3],
        [Math.sqrt(3) / 3, 0, -1 / 3],
    ],
    faces: [
        { vertices: [ 0, 1, 4 ], colour: 0x301500 }, // Face 0
        { vertices: [ 0, 4, 3 ], colour: 0x301500 }, // Face 1
        { vertices: [ 1, 2, 5 ], colour: 0x301500 }, // Face 2
        { vertices: [ 1, 5, 4 ], colour: 0x301500 }, // Face 3
        { vertices: [ 2, 0, 3 ], colour: 0x301500 }, // Face 4
        { vertices: [ 2, 3, 5 ], colour: 0x301500 }, // Face 5
        { vertices: [ 4, 5, 3 ], colour: 0x301500 }, // Face 6
    ]
};
export const PALM_TREE_LEAVES = {
    scale: 1/4,
    collidable_points: [
        // Vertex indicies of points to check for collisions
        // Only higher up vertices are considered
        0, 1, 2, 3
    ],
    vertices: [
        // Tree
        [0, 8, 0],
        [  1, 7, -2],
        [ -1, 7, -2],
        [0, 5, -3],
    ],
    faces: [
        { vertices: [ 0, 1, 2 ], colour: 0x009000 }, // Face 0
        { vertices: [ 1, 3, 2 ], colour: 0x009000 }, // Face 1
        // Other side of previous faces
        { vertices: [ 0, 2, 1 ], colour: 0x009000 }, // Face 2
        { vertices: [ 1, 2, 3 ], colour: 0x009000 }, // Face 3
    ]
};
export const PALM_TRUNK = {
    scale: 1/4,
    collidable_points: [],
    vertices: [
        // Trunk
        [0, 8, 0],
        [0, 0, 2 / 3],
        [-Math.sqrt(3) / 3, 0, -1 / 3],
        [Math.sqrt(3) / 3, 0, -1 / 3],
    ],
    faces: [
        { vertices: [ 0, 1, 3 ], colour: 0x301500 }, // Face 0
        { vertices: [ 0, 3, 2 ], colour: 0x301500 }, // Face 1
        { vertices: [ 0, 2, 1 ], colour: 0x301500 }, // Face 2
    ]
};
export const HOUSE = {
    scale: 1/2,
    collidable_points: [],
    vertices: [
        // Walls
        [ -2, -2, -1],
        [ -2, -2,  1],
        [  2, -2,  1],
        [  2, -2, -1],
        [ -2, 1.5, -1],
        [ -2, 1.5,  1],
        [  2, 1.5,  1],
        [  2, 1.5, -1],
        [  2, 2, 0],
        [ -2, 2, 0],
        [  2.25, 2, 0],
        [ -2.25, 2, 0],
        // Roof corners
        [ -2.25, 1.5 - 1/8, -1.25],
        [ -2.25, 1.5 - 1/8,  1.25],
        [  2.25, 1.5 - 1/8,  1.25],
        [  2.25, 1.5 - 1/8, -1.25],
    ],
    faces: [
        { vertices: [ 0, 1, 4 ], colour: 0xD0D0D0 }, // Face 0
        { vertices: [ 4, 1, 5 ], colour: 0xD0D0D0 }, // Face 1
        { vertices: [ 2, 3, 6 ], colour: 0xD0D0D0 }, // Face 2
        { vertices: [ 6, 3, 7 ], colour: 0xD0D0D0 }, // Face 3
        { vertices: [ 1, 2, 5 ], colour: 0xD0D0D0 }, // Face 4
        { vertices: [ 5, 2, 6 ], colour: 0xD0D0D0 }, // Face 5
        { vertices: [ 0, 3, 4 ], colour: 0xD0D0D0 }, // Face 6
        { vertices: [ 4, 3, 7 ], colour: 0xD0D0D0 }, // Face 7
        
        { vertices: [ 15, 12, 11 ], colour: 0x600000 }, // Face 8
        { vertices: [ 10, 15, 11 ], colour: 0x600000 }, // Face 9
        { vertices: [ 14, 10, 11 ], colour: 0x600000 }, // Face 10
        { vertices: [ 13, 14, 11 ], colour: 0x600000 }, // Face 11
        
        // Roof again, but other direction so it can be seen from either direction
        { vertices: [ 15, 11, 12 ], colour: 0x600000 }, // Face 12
        { vertices: [ 10, 11, 15 ], colour: 0x600000 }, // Face 13
        { vertices: [ 14, 11, 10 ], colour: 0x600000 }, // Face 14
        { vertices: [ 13, 11, 14 ], colour: 0x600000 }, // Face 15

        { vertices: [ 4, 5, 9 ], colour: 0xD0D0D0 }, // Face 16
        { vertices: [ 6, 7, 8 ], colour: 0xD0D0D0 }, // Face 17
    ]
};
export const SQUARE_HOUSE = {
    scale: 1/2,
    collidable_points: [],
    vertices: [
        // Walls
        [ -1, -2, -1],
        [ -1, -2,  1],
        [  1, -2,  1],
        [  1, -2, -1],
        [ -1, 1.5, -1],
        [ -1, 1.5,  1],
        [  1, 1.5,  1],
        [  1, 1.5, -1],
        [  0, 2, 0],
        // Roof corners
        [ -1.25, 1.5 - 1/8, -1.25],
        [ -1.25, 1.5 - 1/8,  1.25],
        [  1.25, 1.5 - 1/8,  1.25],
        [  1.25, 1.5 - 1/8, -1.25],
    ],
    faces: [
        { vertices: [ 0, 1, 4 ], colour: 0xD0D0D0 }, // Face 0
        { vertices: [ 4, 1, 5 ], colour: 0xD0D0D0 }, // Face 1
        { vertices: [ 2, 3, 6 ], colour: 0xD0D0D0 }, // Face 2
        { vertices: [ 6, 3, 7 ], colour: 0xD0D0D0 }, // Face 3
        { vertices: [ 1, 2, 5 ], colour: 0xD0D0D0 }, // Face 4
        { vertices: [ 5, 2, 6 ], colour: 0xD0D0D0 }, // Face 5
        { vertices: [ 0, 3, 4 ], colour: 0xD0D0D0 }, // Face 6
        { vertices: [ 4, 3, 7 ], colour: 0xD0D0D0 }, // Face 7
        
        { vertices: [ 8, 10,  9 ], colour: 0x600000 }, // Face 8
        { vertices: [ 8, 11, 10 ], colour: 0x600000 }, // Face 9
        { vertices: [ 8, 12, 11 ], colour: 0x600000 }, // Face 10
        { vertices: [ 8,  9, 12 ], colour: 0x600000 }, // Face 11
        
        // Roof again, but other direction so it can be seen from either direction
        { vertices: [ 8,  9, 10], colour: 0x600000 }, // Face 12
        { vertices: [ 8, 10, 11], colour: 0x600000 }, // Face 13
        { vertices: [ 8, 11, 12], colour: 0x600000 }, // Face 14
        { vertices: [ 8, 12,  9], colour: 0x600000 }, // Face 15
    ]
};
export const SMALL_ROCK = {
    scale: 1/2,
    collidable_points: [],
    vertices: [
        [ -2, 0, -2 ],
        [  2, 0, -2 ],
        [  2, 0,  2 ],
        [ -2, 0,  2 ],
        [ 0, 1.5, -1.5 ],
        [ 0, 1.5,  1.5 ],
        [ -1.5, 1.5, 0 ],
        [  1.5, 1.5, 0 ],
        [ 0, 2.25, 0 ],
    ],
    faces: [
        { vertices: [ 0, 4, 1 ], colour: 0xD0D0D0 }, // Face 0
        { vertices: [ 0, 3, 6 ], colour: 0xD0D0D0 }, // Face 1
        { vertices: [ 3, 2, 5 ], colour: 0xD0D0D0 }, // Face 2
        { vertices: [ 2, 1, 7 ], colour: 0xD0D0D0 }, // Face 3
        
        { vertices: [ 0, 6, 4 ], colour: 0xD0D0D0 }, // Face 4
        { vertices: [ 3, 5, 6 ], colour: 0xD0D0D0 }, // Face 5
        { vertices: [ 2, 7, 5 ], colour: 0xD0D0D0 }, // Face 6
        { vertices: [ 1, 4, 7 ], colour: 0xD0D0D0 }, // Face 7
        
        { vertices: [ 8, 4, 6 ], colour: 0xD0D0D0 }, // Face 0
        { vertices: [ 8, 6, 5 ], colour: 0xD0D0D0 }, // Face 1
        { vertices: [ 8, 5, 7 ], colour: 0xD0D0D0 }, // Face 2
        { vertices: [ 8, 7, 4 ], colour: 0xD0D0D0 }, // Face 3
    ]
};
