/* ═══════════════════════════════════════════════════════════════════
   LABYRINTH OF MINOS — TUTORIAL 2   tutorial2.js
   Faithfully implements the hand-drawn sketch:
   START → 1.5-block obstacle → pressure-plate spike1 → platform →
   pressure-plate spike2 → fall-down shaft → ready spike (DASH) →
   long platform → hammer trap → golden thread → 3 doors (pick right)
   ═══════════════════════════════════════════════════════════════════ */

/* ── CANVAS / CTX ──────────────────────────────────────────────── */
var TC, TX;
var MAP_THEME_STORAGE_KEY = "minos-map-theme";
var MAP_THEME_ROOT = "../map_themes/Map";
var TORCH_ASSET = "../torch.png";
var MAP_THEME_ASSETS = {
  classic: null,
  variant1: {
    map: MAP_THEME_ROOT + "/MAP VARIENT 1.JPG",
    roof: MAP_THEME_ROOT + "/MAP 1 ROOF VARIENT.JPG",
    fall: MAP_THEME_ROOT + "/Fall Trap.JPG",
  },
  variant2: {
    map: MAP_THEME_ROOT + "/MAP VARIENT 2.JPG",
    roof: MAP_THEME_ROOT + "/MAP 2 ROOF VARIENT.JPG",
    fall: MAP_THEME_ROOT + "/Fall Trap.JPG",
  },
  variant3: {
    map: MAP_THEME_ROOT + "/MAP VARIENT 3.JPG",
    roof: MAP_THEME_ROOT + "/MAP 3 ROOF VARIENT.JPG",
    fall: MAP_THEME_ROOT + "/Fall Trap.JPG",
  },
};

/* ── PHYSICS CONSTANTS ─────────────────────────────────────────── */
var PX = 3.0; // base walk speed
var SPR_MULT = 1.22; // sprint multiplier
var JUMP_V = -13.5;
var GRAV = 0.58;
var FRIC = 0.8;
var DASH_COST = 28,
  DASH_SPD = 18,
  DASH_DUR = 16,
  DASH_CD = 52;
var STAM_MAX = 100,
  STAM_DRAIN = 0.55,
  STAM_REGEN = 0.3,
  STAM_MIN = 15;

/* ── WORLD DIMENSIONS ──────────────────────────────────────────── */
// Stage I stretches through the final thread chamber and single exit door.
var WORLD = 9600;
var TILE = 48; // 1 game tile = 48px

/* ── PLAYER ─────────────────────────────────────────────────────── */
var PL = {
  type: "player", // entity type
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,

  // collision box
  w: 34,
  h: 68,

  // sprite box
  sw: 80,
  sh: 80,

  dir: 1,
  grounded: false,

  // state
  state: "idle", // idle, walk, run, jump, dash
  moving: false,
  sprinting: false,

  // dash
  dashing: false,
  dtmr: 0,
  dcd: 0,
  ddir: 1,

  stamina: 100,

  // animation
  frame: 0,
  atick: 0,

  alive: true,
};
var PL_COX, PL_COY; // computed from sw/w after resize

/* ── SPRITES ─────────────────────────────────────────────────────── */
var SPR = {
  idle: null,
  idle2: null,
  walk: [],
  run: [],
  jump: [],
  door1: null,
  door2: null,
  hammerLeft: [],
  hammerRight: [],
  gold: null,
  spike: null,
  decor: {},
  torch: null,
  mapTheme: { map: null, roof: null, fall: null },
  pot: null, // For the Pot 1 can be found in pot-sprite.js
  pot2: null, // For the Pot 2 can be found in pot-sprite.js
  input: null,
};
var sprOK = false;
var HAMMER_LEFT_PATHS = [
  "../hammer_animation_swing_to_the_left1.png",
  "../hammer_animation_swing_to_the_left2.png",
  "../hammer_animation_swing_to_the_left3.png",
  "../hammer_animation_swing_to_the_left4.png",
  "../hammer_animation_swing_to_the_left5.png",
  "../hammer_animation_swing_to_the_left6.png",
];
var HAMMER_RIGHT_PATHS = [
  "../hammer_animation_swing_to_the_right1.png",
  "../hammer_aniamtion_swing_to_the_right2.png",
  "../hammer_animation_swing_to_the_right3.png",
  "../hammer_animation_swing_to_the_right4.png",
  "../hammer_animation_swing_to_the_right5.png",
  "../hammer_animation_swing_to_the_right6.png",
  "../hammer_animation_swing_to_the_right7.png",
  "../hammer_animation_swing_to_the_right8.png",
  "../hammer_animation_swing_to_the_right9.png",
];
var HAMMER_SWING_FRAMES = [0, 1, 2, 3, 4];
var JUMP_PATHS = [
  "../jump_animation1.png",
  "../jump_animation2.png",
  "../jump_animation3.png",
  "../jump_animation4.png",
  "../jump_animation5.png",
  "../jump_animation6.png",
];
var HAMMER_POINTER_PIVOTS = [
  { x: 0.86, y: 0.5 },
  { x: 0.87, y: 0.5 },
  { x: 0.84, y: 0.48 },
  { x: 0.5, y: 0.1 },
  { x: 0.38, y: 0.14 },
];
var DECOR_PATHS = {
  banner: "../adds_assets/banner.png",
  cage: "../adds_assets/birdcage.png",
  blood: "../adds_assets/blood_splatter.png",
  writing: "../adds_assets/blood_writing_(run).png",
  bossRoom: "../adds_assets/boss_room.png",
  clue: "../adds_assets/clue2.png",
  doorFrame: "../adds_assets/door_levels.png",
  fallTrap: "../adds_assets/fall_trap.png",
  statue: "../adds_assets/headless_statue.png",
  jar: "../adds_assets/jar.png",
  muralLady: "../adds_assets/mary.png",
  muralSeeker: "../adds_assets/man_finding.png",
  muralShade: "../adds_assets/jihugyft.png",
  bonesSmall: "../adds_assets/plenty_pile_of_bones.png",
  bonesWide: "../adds_assets/many_pile_of_bones.png",
  bonesLarge: "../adds_assets/pile_of_bones.png",
  bonesHuge: "../adds_assets/numerous_pile_of_bones.png",
  threadPaper: "../adds_assets/paper_golden_thread.png",
  clueMarker: "../adds_assets/roman_numbers.png",
  platform: "../adds_assets/platform.png",
  web: "../adds_assets/spider_web.png",
  vinesGreen: "../adds_assets/vines.png",
  vinesGreenWide: "../adds_assets/vines2.png",
  vinesRed1: "../adds_assets/redvines1.png",
  vinesRed2: "../adds_assets/redvines2.png",
  vinesRed3: "../adds_assets/redvines3.png",
  vinesRed4: "../adds_assets/redvines4.png",
};

async function loadSpr() {
  function li(src) {
    return new Promise(function (r) {
      var i = new Image();
      i.onload = function () {
        r(i);
      };
      i.onerror = function () {
        r(null);
      };
      i.src = src;
    });
  }
  if (typeof SPRITE_IDLE !== "undefined") SPR.idle = await li(SPRITE_IDLE);
  if (typeof SPRITE_IDLE2 !== "undefined") SPR.idle2 = await li(SPRITE_IDLE2);
  if (typeof SPRITE_WALK1 !== "undefined")
    SPR.walk = await Promise.all(
      [SPRITE_WALK1, SPRITE_WALK2, SPRITE_WALK3].map(li),
    );
  if (typeof SPRITE_RUN1 !== "undefined")
    SPR.run = await Promise.all(
      [SPRITE_RUN1, SPRITE_RUN2, SPRITE_RUN3, SPRITE_RUN4].map(li),
    );
  SPR.jump = await Promise.all(JUMP_PATHS.map(li));
  if (typeof SPRITE_DOOR1 !== "undefined") SPR.door1 = await li(SPRITE_DOOR1);
  if (typeof SPRITE_DOOR2 !== "undefined") SPR.door2 = await li(SPRITE_DOOR2);
  if (typeof SPRITE_GOLD !== "undefined") SPR.gold = await li(SPRITE_GOLD);
  if (typeof SPRITE_SPIKES !== "undefined") SPR.spike = await li(SPRITE_SPIKES);
  if (typeof SPRITE_POT !== "undefined") SPR.pot = await li(SPRITE_POT);
  if (typeof SPRITE_POT2 !== "undefined") SPR.pot2 = await li(SPRITE_POT2);
  if (typeof SPRITE_SECRET_DOOR !== "undefined")
    SPR.secretDoor = await li(SPRITE_SECRET_DOOR);
  if (typeof SPRITE_CLUE !== "undefined") SPR.clue = await li(SPRITE_CLUE);
  if (typeof SPRITE_INPUT !== "undefined") SPR.input = await li(SPRITE_INPUT);
  SPR.torch = await li(TORCH_ASSET);
  SPR.hammerLeft = await Promise.all(HAMMER_LEFT_PATHS.map(li));
  SPR.hammerRight = await Promise.all(HAMMER_RIGHT_PATHS.map(li));
  var decorKeys = Object.keys(DECOR_PATHS);
  for (var i = 0; i < decorKeys.length; i++) {
    SPR.decor[decorKeys[i]] = await li(DECOR_PATHS[decorKeys[i]]);
  }
  var selectedTheme = getSelectedMapTheme();
  var themeSet = MAP_THEME_ASSETS[selectedTheme];
  if (themeSet) {
    SPR.mapTheme.map = await li(themeSet.map);
    SPR.mapTheme.roof = await li(themeSet.roof);
    SPR.mapTheme.fall = await li(themeSet.fall);
  }
  sprOK = true;
}

function getSelectedMapTheme() {
  try {
    var selected = localStorage.getItem(MAP_THEME_STORAGE_KEY);
    return MAP_THEME_ASSETS[selected] ? selected : "classic";
  } catch (e) {
    return "classic";
  }
}

/* ── CAMERA ─────────────────────────────────────────────────────── */
var CAM = { x: 0, y: 0 }; // horizontal only

function isMobileViewport() {
  return window.matchMedia && window.matchMedia("(max-width: 900px), (max-height: 520px)").matches;
}

function getCanvasRenderScale() {
  return isMobileViewport() ? 1.14 : 1;
}

/* ── KEYS ─────────────────────────────────────────────────────────── */
var KEYS = {},
  JP = {};
window.addEventListener("keydown", function (e) {
  if (
    [
      "Space",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "KeyE",
      "KeyF",
      "ShiftLeft",
      "ShiftRight",
    ].indexOf(e.code) !== -1
  )
    e.preventDefault();
  if (!KEYS[e.code]) JP[e.code] = true;
  KEYS[e.code] = true;
});
window.addEventListener("keyup", function (e) {
  KEYS[e.code] = false;
});

/* ═══════════════════════════════════════════════════════════════════
   MAP DATA
   All x/y are world-space pixels.
   Floor is at y = FLOOR_Y (set dynamically as canvas.height * 0.82)
═══════════════════════════════════════════════════════════════════ */
var FLOOR_Y; // set in resize()
var MAP = {}; // rebuilt in buildMap()

function buildMap() {
  var H = TC.height;
  FLOOR_Y = Math.round(H * 0.8);
  PL_COX = Math.round((PL.sw - PL.w) / 2);
  PL_COY = PL.sh - PL.h;

  /* ── PLATFORMS ─────────────────────────────────────────────── */
  var ph = TILE * 1.5;
  var loftY = FLOOR_Y - TILE * 1.55;
  var galleryY = FLOOR_Y - TILE * 2.2;
  var lowerY = FLOOR_Y + TILE * 3.75;
  var rise1Y = FLOOR_Y + TILE * 2.35;
  var rise2Y = FLOOR_Y + TILE * 1.35;
  var rise3Y = FLOOR_Y + TILE * 0.5;

  MAP.platforms = [
    { x: 0, y: FLOOR_Y, w: 650, h: ph },
    { x: 760, y: loftY, w: 420, h: TILE },
    { x: 1260, y: FLOOR_Y, w: 620, h: ph },
    { x: 1840, y: galleryY, w: 360, h: TILE },
    { x: 2240, y: loftY, w: 360, h: TILE },
    { x: 2640, y: FLOOR_Y, w: 420, h: ph },
    { x: 3140, y: FLOOR_Y, w: 420, h: ph },
    { x: 3660, y: FLOOR_Y, w: 320, h: ph },
    { x: 4060, y: FLOOR_Y, w: 260, h: ph },
    { x: 4560, y: lowerY, w: 660, h: ph },
    { x: 5320, y: lowerY, w: 1140, h: ph },
    { x: 6450, y: rise1Y, w: 240, h: TILE },
    { x: 6735, y: rise2Y, w: 240, h: TILE },
    { x: 7020, y: rise3Y, w: 280, h: TILE },
    { x: 7040, y: FLOOR_Y, w: 1220, h: ph },
    { x: 8350, y: FLOOR_Y, w: 1080, h: ph },
  ];

  MAP.obstacle = null;
  MAP.plates = [];

  /* ── STAGE I SOFTENERS ── */
  MAP.spikes = [];

  /* ── SHAFT ── */
  MAP.shaft = {
    x: 4380,
    y: FLOOR_Y + ph,
    w: 170,
    bottom: lowerY,
  };

  MAP.readySpike = null;
  MAP.hammer = null;

  /* ── STAGE I EXIT (no relic gate) ── */
  MAP.gold = null;

  /* ── SINGLE EXIT DOOR ── */
  /* ── THREE SCATTERED DOORS ── */
  var dW = 118,
    dH = 154;
  var doorY = FLOOR_Y - dH;
  MAP.doors = [
    { x: 7040 + 200, y: doorY, w: dW, h: dH, correct: false }, // Left door (wrong)
    { x: 8350 + 300, y: doorY, w: dW, h: dH, correct: false }, // Middle door (wrong)
    { x: 9138, y: doorY, w: dW, h: dH, correct: true }, // Right door (CORRECT)
  ];
  MAP.doorFrameRect = null;

  /* Lihim na Pinto */

  /* The Secret Door - hidden until riddle solved */
  /* The Secret Door - hidden until input puzzle solved */
  var secretDoorW = 100,
    secretDoorH = 140;
  MAP.secretDoor = {
    x: 20, // Near spawn/start
    y: doorY - 20,
    w: secretDoorW,
    h: secretDoorH,
    locked: true,
    visible: false, // Hidden until "Icarus" is entered
  };

  /* ── BREAKABLE POT WITH HIDDEN GOLD ── */
  MAP.pot = {
    x: 4820, // Place it in the lower shaft area (adjust as needed)
    y: lowerY - 74, // Sitting on the lower platform
    w: 64,
    h: 74,
    broken: false,
    breaking: false,
    breakTimer: 0,
  };

  /* ── GOLD ITEM (hidden inside pot, drops when pot breaks) ── */
  MAP.gold = {
    x: 0, // Set when pot breaks
    y: 0,
    w: 48,
    h: 48,
    collected: false,
    visible: false, // Hidden until pot breaks
    bobTimer: 0,
  };

  MAP.decorBack = [
    { key: "banner", x: 136, y: FLOOR_Y - 324, w: 170, h: 270, alpha: 0.56 },
    { key: "statue", x: 252, y: FLOOR_Y - 160, w: 138, h: 160, alpha: 0.56 },
    { key: "vinesGreen", x: 108, y: FLOOR_Y - 212, w: 88, h: 34, alpha: 0.22 },
    { key: "web", x: 206, y: FLOOR_Y - 286, w: 124, h: 44, alpha: 0.22 },
    {
      key: "vinesGreenWide",
      x: 468,
      y: FLOOR_Y - 224,
      w: 170,
      h: 58,
      alpha: 0.18,
    },
    { key: "web", x: 566, y: FLOOR_Y - 256, w: 110, h: 40, alpha: 0.2 },
    { key: "web", x: 770, y: loftY - 92, w: 150, h: 54, alpha: 0.34 },
    { key: "web", x: 1045, y: loftY - 108, w: 132, h: 48, alpha: 0.22 },
    {
      key: "muralSeeker",
      x: 1240,
      y: FLOOR_Y - 286,
      w: 186,
      h: 148,
      alpha: 0.16,
    },
    {
      key: "vinesGreenWide",
      x: 1635,
      y: FLOOR_Y - 234,
      w: 148,
      h: 48,
      alpha: 0.16,
    },
    { key: "web", x: 1800, y: galleryY - 86, w: 136, h: 52, alpha: 0.3 },
    { key: "web", x: 2080, y: loftY - 86, w: 120, h: 42, alpha: 0.24 },
    { key: "web", x: 2285, y: loftY - 104, w: 132, h: 48, alpha: 0.2 },
    {
      key: "vinesGreenWide",
      x: 2100,
      y: loftY - 120,
      w: 174,
      h: 60,
      alpha: 0.14,
    },
    { key: "vinesGreen", x: 2360, y: FLOOR_Y - 210, w: 90, h: 30, alpha: 0.18 },
    {
      key: "muralShade",
      x: 3000,
      y: FLOOR_Y - 292,
      w: 200,
      h: 152,
      alpha: 0.12,
    },
    { key: "cage", x: 3380, y: FLOOR_Y - 258, w: 104, h: 84, alpha: 0.16 },
    { key: "web", x: 3490, y: FLOOR_Y - 242, w: 118, h: 44, alpha: 0.2 },
    { key: "web", x: 3820, y: FLOOR_Y - 234, w: 134, h: 48, alpha: 0.18 },
    { key: "vinesRed3", x: 3980, y: FLOOR_Y - 238, w: 84, h: 248, alpha: 0.32 },
    { key: "web", x: 4320, y: FLOOR_Y - 116, w: 122, h: 44, alpha: 0.24 },
    {
      key: "vinesGreenWide",
      x: 4440,
      y: lowerY - 244,
      w: 154,
      h: 52,
      alpha: 0.15,
    },
    {
      key: "vinesGreenWide",
      x: 4680,
      y: lowerY - 230,
      w: 182,
      h: 60,
      alpha: 0.14,
    },
    {
      key: "muralSeeker",
      x: 5030,
      y: lowerY - 202,
      w: 142,
      h: 114,
      alpha: 0.12,
    },
    { key: "web", x: 5300, y: lowerY - 104, w: 128, h: 44, alpha: 0.34 },
    { key: "web", x: 5588, y: lowerY - 96, w: 124, h: 42, alpha: 0.2 },
    { key: "web", x: 5755, y: lowerY - 110, w: 116, h: 40, alpha: 0.22 },
    { key: "cage", x: 5840, y: lowerY - 262, w: 118, h: 96, alpha: 0.2 },
    { key: "writing", x: 6010, y: lowerY - 256, w: 152, h: 68, alpha: 0.22 },
    { key: "web", x: 6190, y: lowerY - 90, w: 110, h: 40, alpha: 0.22 },
    {
      key: "vinesGreenWide",
      x: 6360,
      y: lowerY - 218,
      w: 146,
      h: 48,
      alpha: 0.16,
    },
    { key: "vinesRed4", x: 6900, y: FLOOR_Y - 254, w: 92, h: 258, alpha: 0.3 },
    { key: "web", x: 7300, y: FLOOR_Y - 246, w: 130, h: 46, alpha: 0.22 },
    { key: "web", x: 7580, y: FLOOR_Y - 224, w: 112, h: 40, alpha: 0.18 },
    { key: "web", x: 7910, y: FLOOR_Y - 242, w: 140, h: 48, alpha: 0.2 },
    { key: "vinesGreen", x: 8342, y: FLOOR_Y - 214, w: 92, h: 30, alpha: 0.18 },
    {
      key: "vinesGreenWide",
      x: 8480,
      y: FLOOR_Y - 236,
      w: 174,
      h: 56,
      alpha: 0.18,
    },
    { key: "web", x: 8760, y: FLOOR_Y - 232, w: 120, h: 44, alpha: 0.26 },
    { key: "web", x: 8615, y: FLOOR_Y - 264, w: 144, h: 52, alpha: 0.18 },
    { key: "web", x: 9025, y: FLOOR_Y - 236, w: 116, h: 40, alpha: 0.2 },
    { key: "web", x: 9195, y: FLOOR_Y - 252, w: 138, h: 48, alpha: 0.18 },
  ];

  MAP.decorFront = [
    { key: "jar", x: 1328, y: FLOOR_Y - 56, w: 64, h: 74, alpha: 0.86 },
    { key: "bonesWide", x: 2610, y: FLOOR_Y - 8, w: 118, h: 56, alpha: 0.26 },
    { key: "bonesSmall", x: 4520, y: lowerY + 10, w: 84, h: 38, alpha: 0.36 },
    { key: "jar", x: 5760, y: lowerY - 58, w: 62, h: 72, alpha: 0.82 },
    { key: "blood", x: 7120, y: FLOOR_Y - 116, w: 116, h: 70, alpha: 0.24 },
    { key: "bonesSmall", x: 7440, y: FLOOR_Y - 6, w: 80, h: 36, alpha: 0.22 },
    { key: "clueMarker", x: 8890, y: FLOOR_Y - 220, w: 82, h: 50, alpha: 0.8 },
    { key: "bonesHuge", x: 9190, y: FLOOR_Y - 20, w: 160, h: 104, alpha: 0.34 },
  ];

  MAP.roomLights = [
    { x: 30, y: FLOOR_Y - 280, w: 1140, h: 360, glow: 0.09 },
    { x: 1180, y: FLOOR_Y - 300, w: 1700, h: 380, glow: 0.09 },
    { x: 4500, y: lowerY - 210, w: 1740, h: 360, glow: 0.1 },
    { x: 7020, y: FLOOR_Y - 260, w: 1340, h: 340, glow: 0.09 },
    { x: 8480, y: FLOOR_Y - 260, w: 980, h: 340, glow: 0.1 },
  ];

  MAP.roomColumns = [
    { x: 540, y: 120, w: 26, h: FLOOR_Y - 30, alpha: 0.12 },
    { x: 2490, y: 130, w: 22, h: FLOOR_Y - 20, alpha: 0.13 },
    { x: 4520, y: 140, w: 24, h: lowerY - 34, alpha: 0.14 },
    { x: 7060, y: 120, w: 24, h: FLOOR_Y - 26, alpha: 0.12 },
    { x: 8650, y: 120, w: 24, h: FLOOR_Y - 24, alpha: 0.14 },
  ];

  /* ── SPAWN POINT ── */
  MAP.spawn = {
    x: 96,
    y: FLOOR_Y - PL.h - PL_COY,
  };

  /* ── INTERACTIVE BANNER (Disguise) ── */
  MAP.banner = {
    x: 136, // Same x as decor banner
    y: FLOOR_Y - 324,
    w: 170,
    h: 270,
    used: false,
    active: true,
  };

  /* ── HIDDEN INPUT PUZZLE ── */
  MAP.inputPuzzle = {
    x: 400, // Near spawn area but slightly hidden
    y: FLOOR_Y - 120,
    w: 48,
    h: 48,
    activated: false,
    solved: false,
  };

  var paperPlatforms = [
    MAP.platforms[2],
    MAP.platforms[5],
    MAP.platforms[6],
    MAP.platforms[10],
  ];
  var rp = paperPlatforms[Math.floor(Math.random() * paperPlatforms.length)];
  MAP.cluePaper = {
    x: rp.x + 40 + Math.floor(Math.random() * (rp.w - 80)),
    y: rp.y - 28,
    w: 28,
    h: 28,
    collected: false,
    bobTimer: 0,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════════════════ */
var GS = {
  lives: 3,
  hasGold: false,
  hasPaper: false,
  startTime: 0,
  timerSecs: 0,
  step: 0, // tutorial step index
  paused: false,
  dead: false,
  won: false,
  jumpscareActive: false,
  quizActive: false, //For the quiz
  activeDoorIndex: -1,
  loopId: null,
  ptcls: [],
  bgX: 0,
  flicker: 0,
  deathFx: null,
  deathFlash: 0,
  badgeTimer: null,
  stepCardTimer: null,
  disguiseActive: false,
  disguiseTimer: 0,
  riddleSolved: false,
  inputActive: false,
  inputAnswer: "",
  inputSolved: false,
  inputTrigger: null,
};

/* ═══════════════════════════════════════════════════════════════════
   TUTORIAL STEPS
═══════════════════════════════════════════════════════════════════ */
var STEPS = [
  {
    icon: "🏛",
    title: "Threshold Court",
    desc: "Stage I mirrors the training hall's atmosphere, but the chamber now demands cleaner movement through its own trap route.",
    keys: ["D → Advance", "W / Space → Jump"],
    trigger: function () {
      return PL.x > 640;
    },
  },
  {
    icon: "⚖",
    title: "Broken Galleries",
    desc: "Cross the split platforms and keep your footing. The first court opens with staggered jumps instead of the training hall's simple lane.",
    keys: ["Jump the breaks"],
    trigger: function () {
      return PL.x > 1500;
    },
  },
  {
    icon: "⚠",
    title: "Watch the Floor",
    desc: "The threshold spikes rise from both low ground and raised ledges. Read the distance and commit cleanly.",
    keys: ["Read proximity traps"],
    trigger: function () {
      return PL.x > 2320;
    },
  },
  {
    icon: "💨",
    title: "Drop and Recover",
    desc: "The court breaks open beneath you. Land, then dash through the lower spike corridor before climbing back out.",
    keys: ["F → Dash through the lane"],
    trigger: function () {
      return PL.x > 5200;
    },
  },
  {
    icon: "🔨",
    title: "Hammer Gallery",
    desc: "The upper route narrows into a guarded hall. Time your sprint beneath the hammer and keep your momentum.",
    keys: ["Time the swing"],
    trigger: function () {
      return PL.x > MAP.hammer.anchorX + 120;
    },
  },
  {
    icon: "✨",
    title: "Golden Thread!",
    desc: "Claim the Golden Thread from the court's altar. Carry it into the final chamber to reveal the true exit.",
    keys: ["E → Pick up item"],
    trigger: function () {
      return GS.hasGold;
    },
  },
  {
    icon: "🚪",
    title: "Seal the Chamber",
    desc: "The three gates return, but now they close the first court instead of the tutorial. Use the Golden Thread and leave through the lit door.",
    keys: ["E → Enter chosen door"],
    trigger: function () {
      return GS.won;
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════ */
async function tutInit() {
  TC = document.getElementById("tutCanvas");
  TX = TC.getContext("2d");
  tutResize();
  window.addEventListener("resize", tutResize);
  buildHUD();
  setupPaperHUD();
  await loadSpr();
  spawnPlayer();
  GS.startTime = Date.now();
  GS.loopId = requestAnimationFrame(tutLoop);
}

function setupPaperHUD() {
  var slot = document.getElementById("hud-paper-slot");
  var overlay = document.getElementById("clue-overlay");
  var clueImg = document.getElementById("clue-img");
  if (!slot || !overlay) return;

  slot.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    if (typeof SPRITE_CLUE !== "undefined") clueImg.src = SPRITE_CLUE;
    overlay.style.display = "flex";
  });
  document.addEventListener("mouseup", function () {
    overlay.style.display = "none";
  });
}

function tutResize() {
  var canvasScale = getCanvasRenderScale();
  TC.width = Math.round(window.innerWidth * canvasScale);
  TC.height = Math.round(window.innerHeight * canvasScale);
  TC.style.width = "100vw";
  TC.style.height = "100vh";
  TC.getContext("2d").imageSmoothingEnabled = false;
  buildMap();
  spawnPlayer();
}

function spawnPlayer() {
  PL.x = MAP.spawn.x;
  PL.y = MAP.spawn.y;
  PL.vx = 0;
  PL.vy = 0;
  PL.grounded = false;
  PL.was = false;
  PL.dashing = false;
  PL.dtmr = 0;
  PL.dcd = 0;
  PL.stamina = STAM_MAX;
  PL.frame = 0;
  PL.atick = 0;
  PL.ifrm = 0;
  PL.itick = 0;
  PL.iframes = 0;
  PL.alive = true;
  PL.dir = 1;
  PL.moving = false;
  PL.sprinting = false;
  CAM.x = 0;
  GS.hasGold = false;
  GS.activeDoorIndex = -1;
}

function resetToStart() {
  // Reset all traps
  MAP.spikes.forEach(function (s) {
    s.active = false;
    s.riseTimer = 0;
  });
  if (MAP.hammer) {
    MAP.hammer.angle = 0;
    MAP.hammer.swingTimer = 0;
    MAP.hammer.hitCooldown = 0;
  }
  GS.hasGold = false;
  GS.hasPaper = false;
  if (MAP.cluePaper) MAP.cluePaper.collected = false;
  GS.activeDoorIndex = -1;
  GS.dead = false;
  GS.won = false;
  GS.jumpscareActive = false;
  GS.step = 0;
  GS.ptcls = [];
  GS.deathFx = null;
  GS.deathFlash = 0;
  GS.startTime = Date.now();
  GS.timerSecs = 0;
  spawnPlayer();
  hideScreen("screen-dead");
  hideScreen("screen-wrong");
  GS.quizActive = false;

  if (MAP.secretDoor) {
    MAP.secretDoor.locked = true;
  }

  GS.disguiseActive = false;
  GS.disguiseTimer = 0;
  GS.riddleSolved = false;
  if (MAP.banner) {
    MAP.banner.used = false;
    MAP.banner.active = true;
  }
  if (MAP.secretDoor) {
    MAP.secretDoor.visible = false;
    MAP.secretDoor.locked = true;
  }

  GS.inputActive = false;
  GS.inputAnswer = "";
  GS.inputSolved = false;
  if (MAP.inputPuzzle) {
    MAP.inputPuzzle.activated = false;
    MAP.inputPuzzle.solved = false;
  }
  if (MAP.secretDoor) {
    MAP.secretDoor.visible = false;
    MAP.secretDoor.locked = true;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   UPDATE
═══════════════════════════════════════════════════════════════════ */
function tutUpdate() {
  if (GS.paused || GS.won) return;

  GS.bgX += 0.4;
  GS.flicker = Math.sin(Date.now() * 0.003) * 0.08 + Math.random() * 0.04;

  if (GS.dead) {
    updateDeathFx();
    updateParticles();
    updateHUD();
    return;
  }

  GS.timerSecs = Math.floor((Date.now() - GS.startTime) / 1000);

  /* ── INPUT ── */
  var canSpr = PL.stamina > STAM_MIN;
  PL.sprinting =
    (KEYS["ShiftLeft"] || KEYS["ShiftRight"]) && canSpr && !PL.dashing;
  PL.moving = false;

  if (!PL.dashing) {
    var spd = PX * (PL.sprinting ? SPR_MULT : 1);
    if (KEYS["KeyD"] || KEYS["ArrowRight"]) {
      PL.vx += spd;
      PL.dir = 1;
      PL.moving = true;
    }
    if (KEYS["KeyA"] || KEYS["ArrowLeft"]) {
      PL.vx -= spd;
      PL.dir = -1;
      PL.moving = true;
    }
    if (KEYS["KeyS"] || KEYS["ArrowDown"]) {
      PL.vx *= 0.5;
    }
  }

  var cap = PX * (PL.sprinting ? SPR_MULT : 1) * 4;
  PL.vx = Math.max(-cap, Math.min(cap, PL.vx));

  // Jump
  if ((JP["KeyW"] || JP["Space"] || JP["ArrowUp"]) && PL.grounded) {
    PL.vy = JUMP_V;
    PL.grounded = false;
    PL.frame = 0;
    PL.atick = 0;
    JP["KeyW"] = JP["Space"] = JP["ArrowUp"] = false;
  }

  // Dash
  if (JP["KeyF"] && PL.dcd <= 0 && PL.stamina >= DASH_COST && !PL.dashing) {
    PL.dashing = true;
    PL.dtmr = DASH_DUR;
    PL.ddir = PL.dir;
    PL.stamina -= DASH_COST;
    PL.dcd = DASH_CD;
    if (PL.vy > 0) PL.vy *= 0.3;
    JP["KeyF"] = false;
  }
  if (PL.dashing) {
    PL.vx = PL.ddir * DASH_SPD;
    PL.dtmr--;
    spawnDashPtcl();
    if (PL.dtmr <= 0) {
      PL.dashing = false;
      PL.vx *= 0.4;
    }
  }

  // Stamina
  if (PL.sprinting && PL.moving)
    PL.stamina = Math.max(0, PL.stamina - STAM_DRAIN);
  else if (!PL.dashing)
    PL.stamina = Math.min(
      STAM_MAX,
      PL.stamina + (PL.moving ? STAM_REGEN * 0.5 : STAM_REGEN),
    );
  if (PL.dcd > 0) PL.dcd--;
  if (PL.iframes > 0) PL.iframes--;

  // Physics
  PL.vy += GRAV;
  PL.vx *= FRIC;
  PL.x += PL.vx;
  PL.y += PL.vy;
  if (PL.x < 0) {
    PL.x = 0;
    PL.vx = 0;
  }

  /* ── Pag Sira ng Paso ── */
  if (MAP.pot && !MAP.pot.broken) {
    var pot = MAP.pot;
    var pxPot = PL.x + PL_COX;
    var pyPot = PL.y + PL_COY;
    // Check if player is near pot and presses E
    var nearPot =
      Math.abs(pxPot + PL.w / 2 - (pot.x + pot.w / 2)) < 60 &&
      Math.abs(pyPot + PL.h / 2 - (pot.y + pot.h / 2)) < 80;
    if ((JP["KeyE"] || KEYS["KeyE"]) && nearPot) {
      MAP.pot.breaking = true;
    }
    if (pot.breaking) {
      pot.breakTimer++;
      // Shake effect
      pot.shakeX = (Math.random() - 0.5) * 4;
      pot.shakeY = (Math.random() - 0.5) * 4;
      if (pot.breakTimer > 20) {
        pot.broken = true;
        pot.shakeX = 0;
        pot.shakeY = 0;
        // Drop gold
        MAP.gold.x = pot.x + pot.w / 2 - 24;
        MAP.gold.y = pot.y + 10;
        MAP.gold.visible = true;
        spawnImpactPtcls(pot.x + pot.w / 2, pot.y + pot.h / 2, 12);
        showBadge("🏺 The vessel shatters! Something glimmers inside...");
      }
    }
  }

  /* ── Banner ── */
  if (MAP.banner && MAP.banner.active && !MAP.banner.used) {
    var bn = MAP.banner;
    var pxBn = PL.x + PL_COX;
    var pyBn = PL.y + PL_COY;
    var nearBanner =
      Math.abs(pxBn + PL.w / 2 - (bn.x + bn.w / 2)) < 80 &&
      Math.abs(pyBn + PL.h / 2 - (bn.y + bn.h / 2)) < 100;

    if (nearBanner && (JP["KeyE"] || KEYS["KeyE"])) {
      MAP.banner.used = true;
      GS.disguiseActive = true;
      GS.disguiseTimer = 600; // 10 seconds at 60fps (or use frame count)
      PL.sw = 80; // Keep sprite size but visually hidden
      showBadge("🎭 You hide beneath the banner... The Minos cannot see you.");
      spawnImpactPtcls(bn.x + bn.w / 2, bn.y + bn.h / 2, 8);
    }
  }

  /* ── HIDDEN INPUT PUZZLE ── */
  if (MAP.inputPuzzle && !MAP.inputPuzzle.solved && !GS.inputActive) {
    var ip = MAP.inputPuzzle;
    var pxIp = PL.x + PL_COX;
    var pyIp = PL.y + PL_COY;
    var nearInput =
      Math.abs(pxIp + PL.w / 2 - (ip.x + ip.w / 2)) < 60 &&
      Math.abs(pyIp + PL.h / 2 - (ip.y + ip.h / 2)) < 80;

    if (nearInput && (JP["KeyE"] || KEYS["KeyE"])) {
      GS.inputActive = true;
      GS.paused = true;
      GS.inputAnswer = "";
      showInputPuzzle();
    }
  }

  /* ── DISGUISE TIMER ── */
  if (GS.disguiseActive) {
    GS.disguiseTimer--;
    // Player is invisible/invulnerable while disguised
    PL.iframes = 2;
    if (GS.disguiseTimer <= 0) {
      GS.disguiseActive = false;
      showBadge("🎭 The banner falls apart... You are exposed!");
    }
  }

  // Platform collision
  PL.grounded = false;
  MAP.platforms.forEach(function (p) {
    var plx = PL.x + PL_COX,
      ply = PL.y + PL_COY;
    var prevBot = ply + PL.h - PL.vy;
    if (
      plx < p.x + p.w &&
      plx + PL.w > p.x &&
      ply + PL.h > p.y &&
      prevBot <= p.y + 8 &&
      PL.vy >= 0
    ) {
      PL.y = p.y - PL_COY - PL.h;
      PL.vy = 0;
      PL.grounded = true;
    }
  });

  // Obstacle collision (opening wall removed)
  var ob = MAP.obstacle;
  if (ob) {
    var plx2 = PL.x + PL_COX,
      ply2 = PL.y + PL_COY;
    if (
      plx2 < ob.x + ob.w &&
      plx2 + PL.w > ob.x &&
      ply2 + PL.h > ob.y &&
      ply2 < ob.y + ob.h
    ) {
      // Push player out from right side
      if (PL.vx >= 0 && plx2 + PL.w > ob.x && plx2 < ob.x) {
        PL.x = ob.x - PL_COX - PL.w;
        PL.vx = 0;
      }
    }
  }

  // Clamp right edge of world
  if (PL.x + PL.sw > WORLD) {
    PL.x = WORLD - PL.sw;
    PL.vx = 0;
  }

  /* ── PROXIMITY SPIKE TRIGGERS ── */
  MAP.spikes.forEach(function (sp) {
    if (sp.active) return;
    if (PL.x + PL_COX + PL.w >= sp.triggerX) {
      sp.active = true;
      sp.riseTimer = 0;
    }
  });

  /* ── SPIKE TRAPS ── */
  if (PL.iframes <= 0) {
    MAP.spikes.forEach(function (sp) {
      if (!sp.active) return;
      var spikeH = 32;
      var spikeY = sp.y - spikeH;
      var px3 = PL.x + PL_COX,
        py3 = PL.y + PL_COY;
      if (
        px3 < sp.x + sp.w &&
        px3 + PL.w > sp.x &&
        py3 + PL.h > spikeY &&
        py3 < sp.y
      ) {
        takeDamage("spike");
      }
    });
  }

  /* ── READY SPIKE (static — need dash) ── */
  if (MAP.readySpike && PL.iframes <= 0 && !PL.dashing) {
    var rs = MAP.readySpike;
    var spikeH2 = 36;
    var px4 = PL.x + PL_COX,
      py4 = PL.y + PL_COY;
    if (
      px4 < rs.x + rs.w &&
      px4 + PL.w > rs.x &&
      py4 + PL.h > rs.y - spikeH2 &&
      py4 < rs.y
    ) {
      takeDamage("readySpike");
    }
  }

  /* ── HAMMER ── */
  if (MAP.hammer) {
    var hm = MAP.hammer;
    var swingMax = hm.swingMax;
    hm.swingTimer += hm.swingSpeed;
    hm.angle = Math.sin(hm.swingTimer) * swingMax;
    // Pick a frame from the left/right swing sets based on the current arc.
    var swingRatio = Math.min(Math.abs(hm.angle) / swingMax, 1);
    hm.frameIdx = Math.round(
      swingRatio * Math.max(HAMMER_SWING_FRAMES.length - 1, 0),
    );
    // Hit detection
    if (hm.hitCooldown > 0) hm.hitCooldown--;
    if (PL.iframes <= 0 && hm.hitCooldown <= 0) {
      var hx = hm.anchorX + Math.sin(hm.angle) * hm.length;
      var hy2 = hm.anchorY + Math.cos(hm.angle) * hm.length;
      var px5 = PL.x + PL_COX,
        py5 = PL.y + PL_COY;
      // Head center is hm.hh below the handle pivot (hx, hy2) in pendulum direction
      var headCX = hx + Math.sin(hm.angle) * hm.hh;
      var headCY = hy2 + Math.cos(hm.angle) * hm.hh;
      var hL = headCX - hm.hw / 2,
        hR = headCX + hm.hw / 2,
        hT = headCY - hm.hh / 2,
        hB = headCY + hm.hh / 2;
      if (px5 < hR && px5 + PL.w > hL && py5 < hB && py5 + PL.h > hT) {
        var kd = PL.x + PL.sw / 2 < hx ? -1 : 1;
        PL.vx = kd * 10;
        PL.vy = -9;
        PL.grounded = false;
        hm.hitCooldown = 80;
        takeDamage("hammer");
      }
    }
  }

  /* ── GOLD THREW PICKUP ── */
  if (MAP.gold && MAP.gold.visible && !MAP.gold.collected && !GS.hasGold) {
    var g = MAP.gold;
    var px6 = PL.x + PL_COX;
    var py6 = PL.y + PL_COY;
    var nearGold =
      Math.abs(px6 + PL.w / 2 - (g.x + g.w / 2)) < 70 &&
      Math.abs(py6 + PL.h / 2 - (g.y + g.h / 2)) < 70;
    if (nearGold && (JP["KeyE"] || KEYS["KeyE"])) {
      MAP.gold.collected = true;
      GS.hasGold = true;
      showBadge("✨ Golden Thread collected! The true path is revealed...");
      spawnGoldPtcls(g.x + g.w / 2, g.y + g.h / 2);
    }
  }

  //Yung PAPEL!!

  if (MAP.cluePaper && !MAP.cluePaper.collected) {
    var cp = MAP.cluePaper;
    var cpx = PL.x + PL_COX;
    var cpy = PL.y + PL_COY;
    var nearPaper =
      Math.abs(cpx + PL.w / 2 - (cp.x + cp.w / 2)) < 60 &&
      Math.abs(cpy + PL.h / 2 - (cp.y + cp.h / 2)) < 80;
    if (nearPaper && (JP["KeyE"] || KEYS["KeyE"])) {
      cp.collected = true;
      GS.hasPaper = true;
      showBadge("📜 A weathered note... inspect it in your inventory.");
      spawnImpactPtcls(cp.x + cp.w / 2, cp.y + cp.h / 2, 6);
    }
  }

  /* ── DOOR INTERACTION ── */
  GS.activeDoorIndex = -1;
  MAP.doors.forEach(function (door, i) {
    var px7 = PL.x + PL_COX;
    var py7 = PL.y + PL_COY;
    if (
      px7 < door.x + door.w + 10 &&
      px7 + PL.w > door.x - 10 &&
      py7 + PL.h > door.y &&
      py7 < door.y + door.h
    ) {
      GS.activeDoorIndex = i;
      if (JP["KeyE"]) {
        if (door.correct) {
          // Correct door — show Icarus quiz
          if (GS.hasGold) {
            showIcarusQuiz();
          } else {
            showBadge("🔒 The door is sealed... find the Golden Thread first.");
          }
        } else {
          // Wrong door — jumpscare
          wrongDoor();
        }
      }
    }
  });
  JP["KeyE"] = false;

  /* ── SECRET DOOR (Hidden until riddle solved) ── */
  /* ── SECRET DOOR ── */
  if (MAP.secretDoor && MAP.secretDoor.visible) {
    var sd = MAP.secretDoor;
    var px8 = PL.x + PL_COX;
    var py8 = PL.y + PL_COY;
    var nearSecret =
      px8 < sd.x + sd.w + 20 &&
      px8 + PL.w > sd.x - 20 &&
      py8 + PL.h > sd.y &&
      py8 < sd.y + sd.h;

    if (nearSecret && (JP["KeyE"] || KEYS["KeyE"])) {
      if (!sd.locked) {
        GS.won = true;
        showScreen("screen-win");
      }
    }
  }

  /* ── VOID DEATH (fall off bottom) ── */
  if (PL.y > TC.height + 80) {
    takeDamage("void");
  }

  /* ── ANIMATION ── */
  if (!PL.grounded) {
    PL.atick++;
    if (PL.atick > 3) {
      PL.frame = Math.min(PL.frame + 1, Math.max(SPR.jump.length - 1, 0));
      PL.atick = 0;
    }
  } else if (PL.moving) {
    PL.atick++;
    if (PL.atick > (PL.sprinting ? 4 : 7)) {
      var arr = PL.sprinting ? SPR.run : SPR.walk;
      PL.frame = (PL.frame + 1) % Math.max(arr.length, 1);
      PL.atick = 0;
    }
    if (!PL.dashing && Math.random() < 0.1) spawnDustPtcl();
  } else if (!PL.dashing) {
    PL.frame = 0;
    if (++PL.itick > 40) {
      PL.ifrm = (PL.ifrm + 1) % 2;
      PL.itick = 0;
    }
  }

  /* ── CAMERA ── */
  var targetCamX = PL.x + PL.sw / 2 - TC.width / 2;
  var targetCamY = PL.y + PL.sh / 2 - TC.height / 2;

  // Clamp to world bounds
  targetCamX = Math.max(0, Math.min(WORLD - TC.width, targetCamX));
  targetCamY = Math.max(0, Math.min(TC.height * 2 - TC.height, targetCamY)); // Adjust vertical bounds as needed

  CAM.x += (targetCamX - CAM.x) * 0.12;
  CAM.y += (targetCamY - CAM.y) * 0.12;

  /* ── PARTICLES ── */
  updateParticles();

  /* ── TIMER ── */
  var t = document.getElementById("hud-timer");
  if (t) {
    var s3 = GS.timerSecs;
    t.textContent =
      String(Math.floor(s3 / 60)).padStart(2, "0") +
      ":" +
      String(s3 % 60).padStart(2, "0");
  }

  // Camera follow
  updateHUD();
}

/* ── DAMAGE / DEATH ─────────────────────────────────────────────── */
function takeDamage(source) {
  if (PL.iframes > 0) return;
  if (source === "void") {
    GS.lives = 0;
    PL.iframes = 0;
    updateHUD();
    startDeathSequence(source);
    return;
  }
  GS.lives = Math.max(0, GS.lives - 1);
  PL.iframes = 12;
  PL.vy = -10;
  spawnImpactPtcls(PL.x + PL.sw / 2, PL.y + PL.sh * 0.55, 10);
  updateHUD();
  if (GS.lives <= 0) {
    startDeathSequence(source);
  }
}

function updateParticles() {
  for (var i = GS.ptcls.length - 1; i >= 0; i--) {
    var pt = GS.ptcls[i];
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.vy += pt.type === "ember" ? -0.04 : 0.05;
    pt.life -= pt.dec;
    if (pt.life <= 0) GS.ptcls.splice(i, 1);
  }
}

function spawnImpactPtcls(x, y, count) {
  for (var i = 0; i < count; i++) {
    var isEmber = i % 3 === 0;
    GS.ptcls.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + (Math.random() - 0.5) * 18,
      vx: (Math.random() - 0.5) * 3.8,
      vy: -(Math.random() * 2.6 + 0.6),
      life: 1,
      dec: 0.035 + Math.random() * 0.03,
      sz: Math.random() * (isEmber ? 4 : 3) + 2,
      col: isEmber
        ? Math.random() < 0.5
          ? "#ffd36c"
          : "#ffb347"
        : Math.random() < 0.5
          ? "#9b1f2d"
          : "#67202a",
      type: isEmber ? "ember" : "dust",
    });
  }
}

function startDeathSequence(source) {
  if (GS.dead) return;
  GS.dead = true;
  GS.deathFlash = 1;
  PL.alive = false;
  PL.iframes = 0;
  PL.dashing = false;
  PL.sprinting = false;
  PL.vx = 0;
  PL.vy = 0;

  GS.deathFx = {
    x: PL.x,
    y: PL.y,
    vx:
      source === "hammer"
        ? PL.x + PL.sw / 2 < MAP.hammer.anchorX
          ? -2.8
          : 2.8
        : PL.dir * 1.2,
    vy: -6.4,
    rot: source === "hammer" ? 0.18 * PL.dir : 0,
    rotV: source === "hammer" ? 0.14 * PL.dir : 0.08 * PL.dir,
    scale: 1,
    alpha: 1,
    glow: 1,
    t: 0,
  };

  spawnImpactPtcls(PL.x + PL.sw / 2, PL.y + PL.sh * 0.45, 28);
  for (var i = 0; i < 10; i++) {
    GS.ptcls.push({
      x: PL.x + PL.sw / 2 + (Math.random() - 0.5) * 22,
      y: PL.y + PL.sh * 0.62 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 2.2,
      vy: -(Math.random() * 1.4 + 0.4),
      life: 1,
      dec: 0.025 + Math.random() * 0.02,
      sz: Math.random() * 8 + 6,
      col: Math.random() < 0.5 ? "#1f0f12" : "#3b1f18",
      type: "dust",
    });
  }
}

function updateDeathFx() {
  if (!GS.deathFx) return;
  var fx = GS.deathFx;
  fx.t++;
  fx.x += fx.vx;
  fx.y += fx.vy;
  fx.vy += 0.34;
  fx.vx *= 0.95;
  fx.rot += fx.rotV;
  fx.rotV *= 0.985;
  fx.scale = 1 + Math.sin((Math.min(fx.t, 16) / 16) * Math.PI) * 0.07;
  fx.glow = Math.max(0, 1 - fx.t / 22);
  fx.alpha = fx.t < 12 ? 1 : Math.max(0, 1 - (fx.t - 12) / 28);
  GS.deathFlash = Math.max(0, 1 - fx.t / 20);

  if (fx.t === 7 || fx.t === 14) {
    spawnImpactPtcls(fx.x + PL.sw / 2, fx.y + PL.sh * 0.55, 8);
  }

  if (fx.t > 42) {
    GS.lives = 3;
    resetToStart();
  }
}

function wrongDoor() {
  // Prevent re-triggering while jumpscare is active
  if (GS.jumpscareActive) return;
  GS.jumpscareActive = true;
  GS.paused = true;

  // Build jumpscare overlay
  var overlay = document.createElement("div");
  overlay.id = "mino-jumpscare";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9999",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:#000",
    "opacity:0",
    "transition:opacity 0.05s",
    "overflow:hidden",
  ].join(";");

  var img = new Image();
  img.style.cssText = [
    "max-width:100vw",
    "max-height:100vh",
    "width:100vw",
    "height:100vh",
    "object-fit:cover",
    "transform:scale(1.08)",
    "image-rendering:pixelated",
    "filter:brightness(1.3) contrast(1.4)",
  ].join(";");

  // Use SPRITE_MINO if available, otherwise a red fallback
  if (typeof SPRITE_MINO !== "undefined") {
    img.src = SPRITE_MINO;
  } else {
    // Fallback: red screen with text
    overlay.style.background = "#cc0000";
    var txt = document.createElement("div");
    txt.textContent = "YOU CHOSE WRONG";
    txt.style.cssText =
      "color:#fff;font-size:80px;font-weight:bold;font-family:serif;text-shadow:0 0 40px #ff0000;";
    overlay.appendChild(txt);
  }

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  // Red flash on canvas first
  var fl = document.getElementById("wrong-flash");
  if (fl) {
    fl.classList.add("show");
    setTimeout(function () {
      fl.classList.remove("show");
    }, 200);
  }

  // Screen shake
  TC.style.transition = "transform 0s";
  var shakeCount = 0;
  var shakeInterval = setInterval(function () {
    var dx = (Math.random() - 0.5) * 18;
    var dy = (Math.random() - 0.5) * 18;
    TC.style.transform = "translate(" + dx + "px," + dy + "px)";
    shakeCount++;
    if (shakeCount > 8) {
      clearInterval(shakeInterval);
      TC.style.transform = "";
    }
  }, 40);

  // Slam the overlay visible
  requestAnimationFrame(function () {
    overlay.style.opacity = "1";
  });

  // Animate the image: scale up for extra scare
  setTimeout(function () {
    img.style.transition = "transform 0.4s ease-out";
    img.style.transform = "scale(1.22)";
  }, 60);

  // Fade out and reset after the scare
  setTimeout(function () {
    overlay.style.transition = "opacity 0.35s";
    overlay.style.opacity = "0";
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      GS.jumpscareActive = false;
      GS.paused = false;
      GS.lives = 3;
      resetToStart();
      showBadge("✕ Wrong door! Start again...");
    }, 380);
  }, 1100);
}

function showIcarusQuiz() {
  if (GS.quizActive) return;
  GS.quizActive = true;
  GS.paused = true;

  // Create quiz overlay
  var overlay = document.createElement("div");
  overlay.id = "icarus-quiz-overlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9998",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(5,3,5,.94)",
    "font-family:'Cinzel',serif",
    "color:#d4b896",
  ].join(";");

  var panel = document.createElement("div");
  panel.style.cssText = [
    "background:linear-gradient(180deg,rgba(85,57,28,.18),transparent 100%),#120e1a",
    "border:3px solid #8a6a20",
    "box-shadow:4px 4px 0 #8a6a20,0 24px 64px rgba(0,0,0,.42),inset 0 0 40px rgba(0,0,0,.8)",
    "padding:38px 48px",
    "max-width:520px",
    "width:90%",
    "text-align:center",
    "position:relative",
  ].join(";");

  var questions = [
    {
      q: "Icarus and his father escaped imprisonment using wings made of what?",
      options: [
        "Steel and leather",
        "Wax and feathers",
        "Wood and cloth",
        "Magic and silk",
      ],
      correct: 1, // Wax and feathers
    },
    {
      q: "What was the name of Icarus's father, the master craftsman?",
      options: ["Perseus", "Theseus", "Daedalus", "Prometheus"],
      correct: 2, // Daedalus
    },
    {
      q: "Why did Icarus fall into the sea?",
      options: [
        "He was struck by lightning",
        "He flew too close to the sun",
        "His wings were stolen",
        "He became tired",
      ],
      correct: 1, // Flew too close to the sun
    },
  ];

  // Pick random question
  var q = questions[Math.floor(Math.random() * questions.length)];

  panel.innerHTML =
    '<div style="font-size:2.2rem;margin-bottom:10px;">☀</div>' +
    '<div style="font-size:1.1rem;color:#f0c060;text-shadow:0 0 20px rgba(212,168,67,.5);margin-bottom:22px;letter-spacing:1px;">' +
    "The Riddle of Icarus" +
    "</div>" +
    '<div style="width:100%;height:2px;margin:0 0 20px;background:linear-gradient(90deg,transparent,#8a6a20,#d4a843,#8a6a20,transparent);"></div>' +
    '<p style="font-size:.78rem;color:#d4b896;line-height:1.9;margin-bottom:22px;text-align:left;">' +
    q.q +
    "</p>";

  q.options.forEach(function (opt, idx) {
    var btn = document.createElement("button");
    btn.textContent = opt;
    btn.style.cssText = [
      "display:block",
      "width:100%",
      "background:linear-gradient(180deg,#3a2010,#2a1408)",
      "border:2px solid #d4a843",
      "border-bottom:4px solid #1a0a04",
      "border-right:4px solid #1a0a04",
      "color:#f0c060",
      "padding:11px 28px",
      "margin:8px auto",
      "cursor:pointer",
      "font-family:'Cinzel',serif",
      "font-size:.78rem",
      "letter-spacing:1px",
      "text-transform:uppercase",
      "transition:all .1s",
    ].join(";");
    btn.onmouseover = function () {
      this.style.background = "#4a2a10";
      this.style.borderColor = "#f0c060";
      this.style.textShadow = "0 0 18px rgba(212,168,67,.6)";
      this.style.transform = "translate(-2px,-2px)";
    };
    btn.onmouseout = function () {
      this.style.background = "linear-gradient(180deg,#3a2010,#2a1408)";
      this.style.borderColor = "#d4a843";
      this.style.textShadow = "none";
      this.style.transform = "translate(0,0)";
    };
    btn.onmousedown = function () {
      this.style.transform = "translate(1px,1px)";
    };
    btn.onclick = function () {
      if (idx === q.correct) {
        // Correct answer — win!
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .4s";
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          GS.quizActive = false;
          GS.paused = false;
          GS.won = true;
          showScreen("screen-win");
        }, 400);
      } else {
        // Wrong answer — take damage
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .3s";
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          GS.quizActive = false;
          GS.paused = false;
          takeDamage("quiz");
          showBadge("✕ Wrong! The gods frown upon your ignorance...");
        }, 300);
      }
    };
    panel.appendChild(btn);
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function showRiddle() {
  if (GS.quizActive) return;
  GS.quizActive = true;
  GS.paused = true;

  var overlay = document.createElement("div");
  overlay.id = "riddle-overlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9998",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(5,3,5,.94)",
    "font-family:'Cinzel',serif",
    "color:#d4b896",
  ].join(";");

  var panel = document.createElement("div");
  panel.style.cssText = [
    "background:linear-gradient(180deg,rgba(85,57,28,.18),transparent 100%),#120e1a",
    "border:3px solid #8a6a20",
    "box-shadow:4px 4px 0 #8a6a20,0 24px 64px rgba(0,0,0,.42),inset 0 0 40px rgba(0,0,0,.8)",
    "padding:38px 48px",
    "max-width:520px",
    "width:90%",
    "text-align:center",
    "position:relative",
  ].join(";");

  var riddle = {
    q: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars drive there. What am I?",
    options: ["A dream", "A map", "A painting", "A shadow"],
    correct: 1, // A map
  };

  panel.innerHTML =
    '<div style="font-size:2.2rem;margin-bottom:10px;">🗺</div>' +
    '<div style="font-size:1.1rem;color:#f0c060;text-shadow:0 0 20px rgba(212,168,67,.5);margin-bottom:22px;letter-spacing:1px;">' +
    "The Riddle of the Labyrinth" +
    "</div>" +
    '<div style="width:100%;height:2px;margin:0 0 20px;background:linear-gradient(90deg,transparent,#8a6a20,#d4a843,#8a6a20,transparent);"></div>' +
    '<p style="font-size:.78rem;color:#d4b896;line-height:1.9;margin-bottom:22px;text-align:left;font-style:italic;">' +
    '"' +
    riddle.q +
    '"' +
    "</p>";

  riddle.options.forEach(function (opt, idx) {
    var btn = document.createElement("button");
    btn.textContent = opt;
    btn.style.cssText = [
      "display:block",
      "width:100%",
      "background:linear-gradient(180deg,#3a2010,#2a1408)",
      "border:2px solid #d4a843",
      "border-bottom:4px solid #1a0a04",
      "border-right:4px solid #1a0a04",
      "color:#f0c060",
      "padding:11px 28px",
      "margin:8px auto",
      "cursor:pointer",
      "font-family:'Cinzel',serif",
      "font-size:.78rem",
      "letter-spacing:1px",
      "text-transform:uppercase",
      "transition:all .1s",
    ].join(";");
    btn.onmouseover = function () {
      this.style.background = "#4a2a10";
      this.style.borderColor = "#f0c060";
      this.style.textShadow = "0 0 18px rgba(212,168,67,.6)";
      this.style.transform = "translate(-2px,-2px)";
    };
    btn.onmouseout = function () {
      this.style.background = "linear-gradient(180deg,#3a2010,#2a1408)";
      this.style.borderColor = "#d4a843";
      this.style.textShadow = "none";
      this.style.transform = "translate(0,0)";
    };
    btn.onmousedown = function () {
      this.style.transform = "translate(1px,1px)";
    };
    btn.onclick = function () {
      if (idx === riddle.correct) {
        // Correct - reveal secret door permanently
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .4s";
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          GS.quizActive = false;
          GS.paused = false;
          GS.riddleSolved = true;
          MAP.secretDoor.locked = false;
          MAP.secretDoor.visible = true;
          showBadge(
            "🗝 The secret path is revealed! The door materializes from shadow...",
          );
        }, 400);
      } else {
        // Wrong - door stays hidden
        overlay.style.opacity = "0";
        overlay.style.transition = "opacity .3s";
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          GS.quizActive = false;
          GS.paused = false;
          showBadge(
            "✕ The shadows reject your answer... The door remains hidden.",
          );
        }, 300);
      }
    };
    panel.appendChild(btn);
  });

  overlay.appendChild(panel);
  document.body.appendChild(overlay);
}

function showInputPuzzle() {
  if (GS.quizActive) return;
  GS.quizActive = true; // Reuse quiz lock to prevent multiple overlays

  var overlay = document.createElement("div");
  overlay.id = "input-puzzle-overlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9998",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(5,3,5,.94)",
    "font-family:'Cinzel',serif",
    "color:#d4b896",
  ].join(";");

  var panel = document.createElement("div");
  panel.style.cssText = [
    "background:linear-gradient(180deg,rgba(85,57,28,.18),transparent 100%),#120e1a",
    "border:3px solid #8a6a20",
    "box-shadow:4px 4px 0 #8a6a20,0 24px 64px rgba(0,0,0,.42),inset 0 0 40px rgba(0,0,0,.8)",
    "padding:38px 48px",
    "max-width:480px",
    "width:90%",
    "text-align:center",
    "position:relative",
  ].join(";");

  panel.innerHTML =
    '<div style="font-size:2.2rem;margin-bottom:10px;">⌨</div>' +
    '<div style="font-size:1.1rem;color:#f0c060;text-shadow:0 0 20px rgba(212,168,67,.5);margin-bottom:22px;letter-spacing:1px;">' +
    "Whisper the Name" +
    "</div>" +
    '<div style="width:100%;height:2px;margin:0 0 20px;background:linear-gradient(90deg,transparent,#8a6a20,#d4a843,#8a6a20,transparent);"></div>' +
    '<p style="font-size:.78rem;color:#d4b896;line-height:1.9;margin-bottom:22px;">' +
    "A hidden mechanism awaits the correct word. Type carefully..." +
    "</p>" +
    '<div id="input-display" style="background:#0a0608;border:2px solid #5a3a20;padding:12px 20px;margin-bottom:22px;font-size:1.2rem;color:#d4a843;letter-spacing:4px;min-height:24px;">' +
    "</div>";

  var inputDisplay = panel.querySelector("#input-display");

  // Submit button
  var submitBtn = document.createElement("button");
  submitBtn.textContent = "SUBMIT";
  submitBtn.style.cssText = [
    "display:inline-block",
    "background:linear-gradient(180deg,#3a2010,#2a1408)",
    "border:2px solid #d4a843",
    "border-bottom:4px solid #1a0a04",
    "border-right:4px solid #1a0a04",
    "color:#f0c060",
    "padding:11px 36px",
    "margin:8px",
    "cursor:pointer",
    "font-family:'Cinzel',serif",
    "font-size:.78rem",
    "letter-spacing:2px",
    "text-transform:uppercase",
    "transition:all .1s",
  ].join(";");

  submitBtn.onmouseover = function () {
    this.style.background = "#4a2a10";
    this.style.borderColor = "#f0c060";
    this.style.textShadow = "0 0 18px rgba(212,168,67,.6)";
    this.style.transform = "translate(-2px,-2px)";
  };
  submitBtn.onmouseout = function () {
    this.style.background = "linear-gradient(180deg,#3a2010,#2a1408)";
    this.style.borderColor = "#d4a843";
    this.style.textShadow = "none";
    this.style.transform = "translate(0,0)";
  };
  submitBtn.onmousedown = function () {
    this.style.transform = "translate(1px,1px)";
  };
  submitBtn.onclick = function () {
    checkInputAnswer(overlay, inputDisplay.textContent);
  };

  // Close button
  var closeBtn = document.createElement("button");
  closeBtn.textContent = "CLOSE";
  closeBtn.style.cssText = submitBtn.style.cssText;
  closeBtn.onclick = function () {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity .3s";
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      GS.quizActive = false;
      GS.inputActive = false;
      GS.paused = false;
    }, 300);
  };

  panel.appendChild(submitBtn);
  panel.appendChild(closeBtn);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  // Keyboard input handler
  var keyHandler = function (e) {
    if (!GS.inputActive) {
      document.removeEventListener("keydown", keyHandler);
      return;
    }
    e.preventDefault();

    if (e.code === "Enter") {
      checkInputAnswer(overlay, inputDisplay.textContent);
      document.removeEventListener("keydown", keyHandler);
    } else if (e.code === "Backspace") {
      inputDisplay.textContent = inputDisplay.textContent.slice(0, -1);
    } else if (e.code === "Escape") {
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity .3s";
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        GS.quizActive = false;
        GS.inputActive = false;
        GS.paused = false;
      }, 300);
      document.removeEventListener("keydown", keyHandler);
    } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      if (inputDisplay.textContent.length < 12) {
        inputDisplay.textContent += e.key.toUpperCase();
      }
    }
  };

  document.addEventListener("keydown", keyHandler);
}

function checkInputAnswer(overlay, answer) {
  var correct = "ICARUS";
  var userAnswer = (answer || "").toUpperCase().trim();

  if (userAnswer === correct) {
    // Correct - reveal secret door
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity .4s";
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      GS.quizActive = false;
      GS.inputActive = false;
      GS.paused = false;
      GS.inputSolved = true;
      MAP.inputPuzzle.solved = true;
      MAP.secretDoor.visible = true;
      MAP.secretDoor.locked = false;
      showBadge(
        "🗝 The name echoes through stone... A secret door materializes!",
      );
      spawnGoldPtcls(
        MAP.secretDoor.x + MAP.secretDoor.w / 2,
        MAP.secretDoor.y + MAP.secretDoor.h / 2,
      );
    }, 400);
  } else {
    // Wrong - shake effect
    var panel = overlay.querySelector("div");
    panel.style.transform = "translateX(-10px)";
    setTimeout(function () {
      panel.style.transform = "translateX(10px)";
    }, 50);
    setTimeout(function () {
      panel.style.transform = "translateX(-10px)";
    }, 100);
    setTimeout(function () {
      panel.style.transform = "translateX(10px)";
    }, 150);
    setTimeout(function () {
      panel.style.transform = "translateX(0)";
    }, 200);

    inputDisplay.textContent = "";
    inputDisplay.style.borderColor = "#cc2222";
    setTimeout(function () {
      inputDisplay.style.borderColor = "#5a3a20";
    }, 500);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   DRAW
═══════════════════════════════════════════════════════════════════ */
function tutDraw() {
  var W = TC.width,
    H = TC.height;
  TX.clearRect(0, 0, W, H);

  TX.save();
  TX.translate(-CAM.x, -CAM.y);

  drawBG(W, H);
  drawChamberDepth(H);
  drawDecorLayer(MAP.decorBack);
  drawPlatforms();
  drawObstacle();
  drawPlates();
  drawSpikes();
  drawReadySpike();
  drawShaft(H);
  drawHammer();
  drawGold();
  drawCluePaper();
  drawDoors();
  drawInputPuzzle();
  drawSecretDoor();
  drawDecorLayer(MAP.decorFront);
  drawBannerInteraction();
  drawParticles();
  drawPlayer();
  drawPot();

  TX.restore();

  // Screen-space
  drawVignette(W, H);
  drawStamBar(W, H);
}

function drawBG(W, H) {
  var th = { color: "#3a2a1a", accentColor: "#d4a843" };
  GS.flicker = Math.sin(Date.now() * 0.003) * 0.06 + Math.random() * 0.03;
  var g = TX.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#050309");
  g.addColorStop(0.56, "#0a0608");
  g.addColorStop(1, "#040203");
  TX.fillStyle = g;
  TX.fillRect(0, 0, WORLD, H);
  if (SPR.mapTheme.map) {
    TX.save();
    TX.globalAlpha = 0.34;
    TX.drawImage(SPR.mapTheme.map, 0, H * 0.08, WORLD, H * 0.68);
    TX.restore();
  }
  if (SPR.mapTheme.roof) {
    TX.save();
    TX.globalAlpha = 0.3;
    TX.drawImage(SPR.mapTheme.roof, 0, 0, WORLD, H * 0.18);
    TX.restore();
  }
  var haze = TX.createRadialGradient(
    CAM.x + W * 0.5,
    H * 0.18,
    10,
    CAM.x + W * 0.5,
    H * 0.42,
    W * 0.7,
  );
  haze.addColorStop(0, "rgba(214,187,128,0.11)");
  haze.addColorStop(1, "transparent");
  TX.fillStyle = haze;
  TX.fillRect(CAM.x, 0, W, H);
  TX.fillStyle = th.color + "12";
  TX.fillRect(0, 0, WORLD, H);
  TX.strokeStyle = "rgba(20,12,28,.5)";
  TX.lineWidth = 1;
  var bw = 80,
    bh = 50,
    ox = (GS.bgX * 0.2) % bw;
  for (var bx = ox + CAM.x - bw; bx < CAM.x + W + bw; bx += bw)
    for (var by = 0; by < H; by += bh)
      TX.strokeRect(
        bx + (Math.floor(by / bh) % 2) * bw * 0.5 - bw * 0.25,
        by,
        bw,
        bh,
      );
  for (var col = 0; col < WORLD; col += 340) {
    if (col < CAM.x - 220 || col > CAM.x + W + 220) continue;
    TX.fillStyle = "rgba(255,255,255,0.015)";
    TX.fillRect(col, H * 0.12, 185, H * 0.48);
    TX.fillStyle = "rgba(0,0,0,0.16)";
    TX.fillRect(col + 10, H * 0.12, 14, H * 0.48);
  }
  // Torches
  for (var tx = 300; tx < WORLD; tx += 600) {
    var ty = H * 0.28,
      inten = 0.1 + GS.flicker * 0.5;
    if (tx < CAM.x - 150 || tx > CAM.x + W + 150) continue;
    var tg = TX.createRadialGradient(tx, ty - 16, 0, tx, ty - 12, 126);
    tg.addColorStop(0, "rgba(255,214,122," + (0.22 + inten * 0.55) + ")");
    tg.addColorStop(0.34, "rgba(214,104,32," + (0.12 + inten * 0.25) + ")");
    tg.addColorStop(1, "transparent");
    TX.fillStyle = tg;
    TX.fillRect(0, 0, WORLD, H);

    var torch = SPR.torch;
    var torchW = 34;
    var torchH = 34;
    var torchBaseY = ty - 6;
    if (torch) {
      TX.drawImage(
        torch,
        tx - torchW * 0.5,
        torchBaseY - torchH,
        torchW,
        torchH,
      );
    }

    var emberGlow = TX.createRadialGradient(
      tx,
      torchBaseY - 28,
      0,
      tx,
      torchBaseY - 28,
      34,
    );
    emberGlow.addColorStop(0, "rgba(255,240,184,.48)");
    emberGlow.addColorStop(0.3, "rgba(255,170,70,.26)");
    emberGlow.addColorStop(1, "transparent");
    TX.fillStyle = emberGlow;
    TX.fillRect(tx - 34, torchBaseY - 64, 68, 68);

    var flameWobble = Math.sin(Date.now() * 0.007 + tx * 0.015) * 4;
    TX.save();
    TX.globalCompositeOperation = "screen";
    TX.fillStyle = "rgba(255,164,63,.88)";
    TX.beginPath();
    TX.moveTo(tx, torchBaseY - 45 - flameWobble * 0.12);
    TX.quadraticCurveTo(tx + 10, torchBaseY - 30, tx, torchBaseY - 12);
    TX.quadraticCurveTo(
      tx - 12,
      torchBaseY - 30,
      tx,
      torchBaseY - 45 - flameWobble * 0.12,
    );
    TX.fill();
    TX.fillStyle = "rgba(255,241,190,.96)";
    TX.beginPath();
    TX.moveTo(tx, torchBaseY - 38 - flameWobble * 0.08);
    TX.quadraticCurveTo(tx + 5, torchBaseY - 28, tx, torchBaseY - 18);
    TX.quadraticCurveTo(
      tx - 6,
      torchBaseY - 28,
      tx,
      torchBaseY - 38 - flameWobble * 0.08,
    );
    TX.fill();
    TX.restore();
  }
  TX.fillStyle = "rgba(0,0,0,.18)";
  TX.fillRect(0, H * 0.72, WORLD, H * 0.28);
}

function drawChamberDepth(H) {
  (MAP.roomLights || []).forEach(function (zone) {
    if (zone.x + zone.w < CAM.x - 80 || zone.x > CAM.x + TC.width + 80) return;

    TX.save();

    TX.fillStyle = "rgba(10,8,14,.22)";
    TX.fillRect(zone.x, zone.y, zone.w, zone.h);

    var archG = TX.createLinearGradient(
      zone.x,
      zone.y,
      zone.x,
      zone.y + zone.h,
    );
    archG.addColorStop(0, "rgba(26,18,22,.44)");
    archG.addColorStop(0.25, "rgba(10,7,12,.1)");
    archG.addColorStop(1, "rgba(0,0,0,0)");
    TX.fillStyle = archG;
    TX.fillRect(zone.x + 24, zone.y + 18, zone.w - 48, zone.h - 18);

    var glow = TX.createRadialGradient(
      zone.x + zone.w / 2,
      zone.y + zone.h * 0.18,
      18,
      zone.x + zone.w / 2,
      zone.y + zone.h * 0.18,
      zone.w * 0.42,
    );
    glow.addColorStop(0, "rgba(204,164,96," + zone.glow + ")");
    glow.addColorStop(0.5, "rgba(114,80,38," + zone.glow * 0.42 + ")");
    glow.addColorStop(1, "transparent");
    TX.fillStyle = glow;
    TX.fillRect(zone.x, zone.y, zone.w, zone.h);

    TX.fillStyle = "rgba(0,0,0,.18)";
    TX.fillRect(zone.x + 18, zone.y + zone.h - 54, zone.w - 36, 54);

    TX.restore();
  });

  (MAP.roomColumns || []).forEach(function (col) {
    if (col.x + col.w < CAM.x - 60 || col.x > CAM.x + TC.width + 60) return;
    TX.save();
    var cg = TX.createLinearGradient(col.x, col.y, col.x + col.w, col.y);
    cg.addColorStop(0, "rgba(14,10,16," + col.alpha + ")");
    cg.addColorStop(0.5, "rgba(42,30,34," + col.alpha * 1.2 + ")");
    cg.addColorStop(1, "rgba(12,8,12," + col.alpha + ")");
    TX.fillStyle = cg;
    TX.fillRect(col.x, col.y, col.w, col.h);
    TX.fillStyle = "rgba(212,168,67,.08)";
    TX.fillRect(col.x + 2, col.y, Math.max(1, col.w - 4), 3);
    TX.fillStyle = "rgba(0,0,0,.26)";
    TX.fillRect(col.x + 4, col.y + col.h - 18, Math.max(1, col.w - 8), 18);
    TX.restore();
  });
}

function drawDecorLayer(list) {
  if (!list) return;
  list.forEach(function (item) {
    var img = SPR.decor[item.key];
    if (!img || item.x + item.w < CAM.x - 40 || item.x > CAM.x + TC.width + 40)
      return;
    TX.save();
    TX.globalAlpha = item.alpha == null ? 1 : item.alpha;
    TX.drawImage(img, item.x, item.y, item.w, item.h);
    TX.restore();
  });
}

function drawBannerInteraction() {
  if (!MAP.banner || !MAP.banner.active || MAP.banner.used) return;
  var bn = MAP.banner;
  if (bn.x + bn.w < CAM.x - 40 || bn.x > CAM.x + TC.width + 40) return;

  var pxBn = PL.x + PL_COX;
  var pyBn = PL.y + PL_COY;
  var nearBanner =
    Math.abs(pxBn + PL.w / 2 - (bn.x + bn.w / 2)) < 80 &&
    Math.abs(pyBn + PL.h / 2 - (bn.y + bn.h / 2)) < 100;

  if (nearBanner) {
    TX.fillStyle = "rgba(255,215,0,.9)";
    TX.font = "bold 10px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText("[E] Hide in banner", bn.x + bn.w / 2, bn.y - 8);
    TX.textAlign = "left";
  }
}

function drawPlatforms() {
  MAP.platforms.forEach(function (p) {
    if (p.x + p.w < CAM.x - 20 || p.x > CAM.x + TC.width + 20) return;
    var sg = TX.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    sg.addColorStop(0, "#372224");
    sg.addColorStop(0.18, "#2a1a1c");
    sg.addColorStop(1, "#140c10");
    TX.fillStyle = sg;
    TX.fillRect(p.x, p.y, p.w, p.h);

    TX.fillStyle = "rgba(232,194,106,.62)";
    TX.fillRect(p.x, p.y, p.w, 2);
    TX.fillStyle = "rgba(120,86,44,.82)";
    TX.fillRect(p.x, p.y + 2, p.w, 4);
    TX.fillStyle = "rgba(255,248,224,.06)";
    TX.fillRect(p.x + 6, p.y + 7, p.w - 12, 1);

    TX.fillStyle = "rgba(0,0,0,.4)";
    TX.fillRect(p.x, p.y, 3, p.h);
    TX.fillRect(p.x + p.w - 3, p.y, 3, p.h);
    TX.fillRect(p.x + 10, p.y + p.h - 8, Math.max(0, p.w - 20), 8);

    if (SPR.decor.platform && p.w >= 120) {
      var friezeW = Math.min(p.w - 36, 136);
      TX.save();
      TX.globalAlpha = 0.16;
      TX.drawImage(
        SPR.decor.platform,
        6,
        0,
        Math.max(1, SPR.decor.platform.naturalWidth - 12),
        SPR.decor.platform.naturalHeight,
        p.x + (p.w - friezeW) / 2,
        p.y - 8,
        friezeW,
        18,
      );
      TX.restore();
    }
  });
}

function drawObstacle() {
  var ob = MAP.obstacle;
  if (!ob) return;
  if (ob.x + ob.w < CAM.x - 20 || ob.x > CAM.x + TC.width + 20) return;
  var sg = TX.createLinearGradient(ob.x, ob.y, ob.x + ob.w, ob.y);
  sg.addColorStop(0, "#4a2e1a");
  sg.addColorStop(0.5, "#5a3a20");
  sg.addColorStop(1, "#4a2e1a");
  TX.fillStyle = sg;
  TX.fillRect(ob.x, ob.y, ob.w, ob.h);
  TX.fillStyle = "rgba(212,168,67,.4)";
  TX.fillRect(ob.x, ob.y, ob.w, 3);
  TX.fillStyle = "rgba(0,0,0,.5)";
  TX.fillRect(ob.x, ob.y, 2, ob.h);
  TX.fillRect(ob.x + ob.w - 2, ob.y, 2, ob.h);
  // Label
  TX.fillStyle = "rgba(255,200,80,.6)";
  TX.font = "bold 10px Cinzel,serif";
  TX.textAlign = "center";
  TX.fillText("JUMP!", ob.x + ob.w / 2, ob.y - 8);
  TX.textAlign = "left";
}

function drawSpikeRack(x, y, w, spikeH, gap) {
  var count = Math.max(3, Math.round(w / gap));
  var toothW = w / count;
  var rackTop = y - 8;
  var rackHeight = 12;

  TX.save();

  TX.fillStyle = "rgba(0,0,0,.32)";
  TX.beginPath();
  TX.ellipse(x + w / 2, y + 6, w * 0.56, 10, 0, 0, Math.PI * 2);
  TX.fill();

  var baseG = TX.createLinearGradient(x, rackTop, x, rackTop + rackHeight);
  baseG.addColorStop(0, "#1b1214");
  baseG.addColorStop(0.45, "#40282b");
  baseG.addColorStop(1, "#12090b");
  TX.fillStyle = baseG;
  TX.fillRect(x, rackTop, w, rackHeight);

  TX.fillStyle = "rgba(255,204,140,.15)";
  TX.fillRect(x, rackTop, w, 2);
  TX.fillStyle = "rgba(90,14,14,.35)";
  TX.fillRect(x, rackTop + rackHeight - 3, w, 2);
  TX.fillStyle = "rgba(0,0,0,.42)";
  TX.fillRect(x, rackTop + rackHeight, w, 4);

  for (var j = 0; j < count; j++) {
    var sx = x + j * toothW;
    var tipX = sx + toothW / 2;
    var leftX = sx + toothW * 0.14;
    var rightX = sx + toothW * 0.86;

    TX.fillStyle = "rgba(0,0,0,.24)";
    TX.beginPath();
    TX.moveTo(leftX + 1, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH + 6);
    TX.lineTo(rightX + 2, rackTop + rackHeight - 1);
    TX.closePath();
    TX.fill();

    var bladeG = TX.createLinearGradient(
      tipX,
      y - spikeH,
      tipX,
      rackTop + rackHeight,
    );
    bladeG.addColorStop(0, "#f3e5d5");
    bladeG.addColorStop(0.18, "#d8d1c8");
    bladeG.addColorStop(0.55, "#8a8c93");
    bladeG.addColorStop(1, "#2f3137");
    TX.fillStyle = bladeG;
    TX.beginPath();
    TX.moveTo(leftX, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH);
    TX.lineTo(rightX, rackTop + rackHeight - 1);
    TX.closePath();
    TX.fill();

    TX.strokeStyle = "rgba(21,16,18,.72)";
    TX.lineWidth = 1;
    TX.beginPath();
    TX.moveTo(leftX, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH);
    TX.lineTo(rightX, rackTop + rackHeight - 1);
    TX.stroke();

    TX.strokeStyle = "rgba(255,255,255,.26)";
    TX.beginPath();
    TX.moveTo(tipX, y - spikeH + 3);
    TX.lineTo(tipX - toothW * 0.1, rackTop + 1);
    TX.stroke();

    TX.fillStyle = "rgba(104,18,20,.42)";
    TX.beginPath();
    TX.moveTo(leftX + 1, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH * 0.34);
    TX.lineTo(rightX - toothW * 0.2, rackTop + rackHeight - 1);
    TX.closePath();
    TX.fill();
  }

  TX.restore();
}

function drawPlates() {
  MAP.plates.forEach(function (plate) {
    if (plate.x + plate.w < CAM.x - 20 || plate.x > CAM.x + TC.width + 20)
      return;

    TX.save();
    TX.fillStyle = plate.active ? "rgba(156,104,28,.95)" : "rgba(106,74,24,.9)";
    TX.fillRect(plate.x, plate.y, plate.w, plate.h);
    TX.fillStyle = "rgba(238,204,122,.55)";
    TX.fillRect(plate.x, plate.y, plate.w, 2);
    TX.fillStyle = "rgba(0,0,0,.35)";
    TX.fillRect(plate.x + 4, plate.y + plate.h, plate.w - 8, 3);
    TX.fillStyle = "rgba(212,168,67,.72)";
    TX.font = "bold 8px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText("PLATE", plate.x + plate.w / 2, plate.y - 4);
    TX.textAlign = "left";
    TX.restore();
  });
}

function drawSpikes() {
  MAP.spikes.forEach(function (sp) {
    if (!sp.active) return;
    if (sp.x + sp.w < CAM.x - 20 || sp.x > CAM.x + TC.width + 20) return;
    drawSpikeRack(sp.x, sp.y, sp.w, 42, 22);
  });
}

function drawReadySpike() {
  if (!MAP.readySpike) return;
  var rs = MAP.readySpike;
  if (rs.x + rs.w < CAM.x - 20 || rs.x > CAM.x + TC.width + 20) return;
  var spikeH = 48;
  drawSpikeRack(rs.x, rs.y, rs.w, spikeH, 22);

  TX.fillStyle = "rgba(8,14,22,.72)";
  TX.fillRect(rs.x + rs.w / 2 - 74, rs.y - spikeH - 28, 148, 20);
  TX.strokeStyle = "rgba(68,170,255,.28)";
  TX.strokeRect(rs.x + rs.w / 2 - 74, rs.y - spikeH - 28, 148, 20);
  TX.fillStyle = "rgba(92,184,255,.9)";
  TX.font = "bold 10px Cinzel,serif";
  TX.textAlign = "center";
  TX.fillText("DASH [F]", rs.x + rs.w / 2, rs.y - spikeH - 14);
  TX.textAlign = "left";
}

function drawShaft(H) {
  // Visual shaft walls (the drop zone between plate2 and the shaft bottom)
  var sh = MAP.shaft;
  if (sh.x + sh.w < CAM.x - 20 || sh.x > CAM.x + TC.width + 20) return;
  var shaftG = TX.createLinearGradient(sh.x, sh.y, sh.x, sh.bottom);
  shaftG.addColorStop(0, "rgba(14,8,14,.48)");
  shaftG.addColorStop(1, "rgba(0,0,0,.74)");
  TX.fillStyle = shaftG;
  TX.fillRect(sh.x, sh.y, sh.w, sh.bottom - sh.y);
  if (SPR.mapTheme.fall) {
    TX.save();
    TX.globalAlpha = 0.26;
    TX.drawImage(SPR.mapTheme.fall, sh.x, sh.y, sh.w, sh.bottom - sh.y);
    TX.restore();
  }
  TX.fillStyle = "rgba(0,0,0,.26)";
  TX.fillRect(sh.x + 10, sh.y + 6, sh.w - 20, sh.bottom - sh.y - 6);
}

function drawHammer() {
  if (!MAP.hammer) return;
  var hm = MAP.hammer;
  if (hm.anchorX < CAM.x - 300 || hm.anchorX > CAM.x + TC.width + 300) return;
  var hx = hm.anchorX + Math.sin(hm.angle) * hm.length;
  var hy2 = hm.anchorY + Math.cos(hm.angle) * hm.length;

  var hmImg =
    SPR.hammerRight && SPR.hammerRight.length ? SPR.hammerRight[0] : null;
  if (hmImg && hmImg.complete && hmImg.naturalWidth) {
    TX.save();
    // Rotate one hammer asset around the pointer/ball for a genuinely steady swing.
    var scale = 0.72;
    var sprW = hmImg.naturalWidth * scale;
    var sprH = hmImg.naturalHeight * scale;
    var pivot = { x: 0.86, y: 0.5 };
    TX.translate(hm.anchorX, hm.anchorY);
    TX.rotate(hm.angle);
    TX.drawImage(hmImg, -sprW * pivot.x, -sprH * pivot.y, sprW, sprH);
    TX.restore();
  } else {
    TX.save();
    TX.translate(hm.anchorX, hm.anchorY);
    TX.rotate(hm.angle);
    // Fallback rectangle if no sprite
    var hg = TX.createLinearGradient(
      -hm.hw / 2,
      -hm.hh / 2,
      hm.hw / 2,
      hm.hh / 2,
    );
    hg.addColorStop(0, "#909090");
    hg.addColorStop(0.4, "#c0c0c8");
    hg.addColorStop(1, "#484858");
    TX.fillStyle = hg;
    TX.fillRect(-hm.hw / 2, -hm.hh / 2, hm.hw, hm.hh);
    TX.strokeStyle = "#282830";
    TX.lineWidth = 2;
    TX.strokeRect(-hm.hw / 2, -hm.hh / 2, hm.hw, hm.hh);
    TX.fillStyle = "rgba(255,255,255,.2)";
    TX.fillRect(-hm.hw / 2 + 2, -hm.hh / 2 + 2, hm.hw - 4, 4);
    TX.restore();
  }

  // Warning
  var dist = Math.hypot(
    PL.x + PL.sw / 2 - hm.anchorX,
    PL.y + PL.sh / 2 - hm.anchorY,
  );
  if (dist < 300) {
    var alp =
      Math.max(0, (300 - dist) / 300) *
      (0.5 + 0.4 * Math.abs(Math.sin(Date.now() * 0.01)));
    TX.save();
    TX.globalAlpha = alp;
    TX.font = "bold 16px serif";
    TX.fillStyle = "#ff3300";
    TX.textAlign = "center";
    TX.fillText("⚠", hm.anchorX, hm.anchorY - 20);
    TX.restore();
  }
}

function drawGold() {
  if (!MAP.gold) return;
  if (MAP.gold.collected) return;
  var g = MAP.gold;
  if (g.x < CAM.x - 60 || g.x > CAM.x + TC.width + 60) return;
  MAP.gold.bobTimer = (MAP.gold.bobTimer || 0) + 0.05;
  var bob = Math.sin(MAP.gold.bobTimer) * 6;
  var gx = g.x + g.w / 2,
    gy = g.y + bob;

  // Glow
  var gl = TX.createRadialGradient(gx, gy, 2, gx, gy, 40);
  gl.addColorStop(0, "rgba(255,215,0,.4)");
  gl.addColorStop(1, "transparent");
  TX.fillStyle = gl;
  TX.fillRect(gx - 45, gy - 45, 90, 90);

  var threadImg = SPR.decor.doorFrame || SPR.decor.threadPaper || SPR.gold;
  if (threadImg && threadImg.complete && threadImg.naturalWidth) {
    var srcW = threadImg.naturalWidth;
    var srcH = threadImg.naturalHeight;
    var cropX = srcW * 0.705;
    var cropY = srcH * 0.0;
    var cropW = srcW * 0.105;
    var cropH = srcH * 0.145;
    var drawW = g.w * 0.3;
    var drawH = g.h * 0.24;
    TX.drawImage(
      threadImg,
      cropX,
      cropY,
      cropW,
      cropH,
      gx - drawW / 2,
      gy - drawH * 0.14,
      drawW,
      drawH,
    );
  } else {
    // Fallback drawn coin
    TX.save();
    TX.shadowBlur = 20;
    TX.shadowColor = "#ffd700";
    TX.fillStyle = "#ffd700";
    TX.beginPath();
    TX.arc(gx, gy, 18, 0, Math.PI * 2);
    TX.fill();
    TX.fillStyle = "#ffaa00";
    TX.beginPath();
    TX.arc(gx, gy, 14, 0, Math.PI * 2);
    TX.fill();
    TX.fillStyle = "#ffe066";
    TX.font = "bold 14px serif";
    TX.textAlign = "center";
    TX.fillText("G", gx, gy + 5);
    TX.restore();
  }
  // Label
  TX.fillStyle = "rgba(255,215,0,.9)";
  TX.font = "bold 10px Cinzel,serif";
  TX.textAlign = "center";
  TX.fillText("Golden Thread", gx, g.y + bob - 26);
  TX.fillText("[E] Pick up", gx, g.y + bob - 14);
  TX.textAlign = "left";
}

function drawCluePaper() {
  if (!MAP.cluePaper || MAP.cluePaper.collected) return;
  var cp = MAP.cluePaper;
  if (cp.x + cp.w < CAM.x - 40 || cp.x > CAM.x + TC.width + 40) return;

  cp.bobTimer = (cp.bobTimer || 0) + 0.04;
  var bob = Math.sin(cp.bobTimer) * 3;
  var px = cp.x;
  var py = cp.y + bob;
  var w = cp.w,
    h = cp.h;

  TX.save();

  TX.fillStyle = "rgba(0,0,0,0.25)";
  TX.beginPath();
  TX.ellipse(px + w / 2, py + h + 4, w * 0.5, 5, 0, 0, Math.PI * 2);
  TX.fill();

  TX.fillStyle = "#e8dfc0";
  TX.beginPath();
  TX.moveTo(px + 6, py);
  TX.lineTo(px + w, py);
  TX.lineTo(px + w, py + h);
  TX.lineTo(px, py + h);
  TX.lineTo(px, py + 6);
  TX.closePath();
  TX.fill();

  TX.fillStyle = "#c8ba90";
  TX.beginPath();
  TX.moveTo(px, py + 6);
  TX.lineTo(px + 6, py);
  TX.lineTo(px + 6, py + 6);
  TX.closePath();
  TX.fill();

  TX.strokeStyle = "rgba(80,60,30,0.3)";
  TX.lineWidth = 1;
  for (var li2 = 1; li2 <= 3; li2++) {
    TX.beginPath();
    TX.moveTo(px + 4, py + li2 * (h / 4.5));
    TX.lineTo(px + w - 3, py + li2 * (h / 4.5));
    TX.stroke();
  }

  TX.strokeStyle = "rgba(100,80,40,0.5)";
  TX.lineWidth = 1;
  TX.beginPath();
  TX.moveTo(px + 6, py);
  TX.lineTo(px + w, py);
  TX.lineTo(px + w, py + h);
  TX.lineTo(px, py + h);
  TX.lineTo(px, py + 6);
  TX.closePath();
  TX.stroke();

  var gl = TX.createRadialGradient(
    px + w / 2,
    py + h / 2,
    2,
    px + w / 2,
    py + h / 2,
    28,
  );
  gl.addColorStop(0, "rgba(232,220,160,0.25)");
  gl.addColorStop(1, "transparent");
  TX.fillStyle = gl;
  TX.fillRect(px - 10, py - 10, w + 20, h + 20);

  var cpx2 = PL.x + PL_COX;
  var cpy2 = PL.y + PL_COY;
  var nearPaper2 =
    Math.abs(cpx2 + PL.w / 2 - (cp.x + cp.w / 2)) < 60 &&
    Math.abs(cpy2 + PL.h / 2 - (cp.y + cp.h / 2)) < 80;
  if (nearPaper2) {
    TX.fillStyle = "rgba(255,215,0,.9)";
    TX.font = "bold 10px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText("[E] Pick up", cp.x + cp.w / 2, cp.y + bob - 8);
    TX.textAlign = "left";
  }

  TX.restore();
}

function drawDoors() {
  MAP.doors.forEach(function (door, i) {
    if (door.x + door.w < CAM.x - 20 || door.x > CAM.x + TC.width + 20) return;

    // Door glows if it's the correct door AND player has gold
    var lit = door.correct && GS.hasGold;
    var pulse = lit ? 0.7 + 0.3 * Math.sin(Date.now() * 0.004) : 1;

    TX.save();
    TX.fillStyle = "rgba(0,0,0,.22)";
    TX.beginPath();
    TX.ellipse(
      door.x + door.w / 2,
      door.y + door.h + 10,
      door.w * 0.56,
      10,
      0,
      0,
      Math.PI * 2,
    );
    TX.fill();
    TX.fillStyle = "rgba(32,18,18,.88)";
    TX.fillRect(door.x - 14, door.y + door.h - 14, door.w + 28, 30);
    TX.fillStyle = "rgba(232,194,106,.18)";
    TX.fillRect(door.x - 14, door.y + door.h - 14, door.w + 28, 2);
    TX.restore();

    // Glow for correct door
    if (lit) {
      TX.save();
      TX.shadowBlur = 30;
      TX.shadowColor = "#ffd700";
      var glowG = TX.createRadialGradient(
        door.x + door.w / 2,
        door.y + door.h / 2,
        10,
        door.x + door.w / 2,
        door.y + door.h / 2,
        80,
      );
      glowG.addColorStop(0, "rgba(255,215,0,.35)");
      glowG.addColorStop(1, "transparent");
      TX.fillStyle = glowG;
      TX.fillRect(door.x - 40, door.y - 20, door.w + 80, door.h + 40);
      TX.restore();
    }

    var frame = SPR.decor.doorFrame;
    if (frame && frame.complete && frame.naturalWidth) {
      var cropX = frame.naturalWidth * 0.5;
      var cropW = frame.naturalWidth * 0.5;
      var cropY = frame.naturalHeight * 0.255;
      var cropH = frame.naturalHeight * 0.745;
      var drawY = door.y + 12;
      var drawH = door.h - 4;
      TX.globalAlpha = lit ? pulse : 0.88;
      TX.drawImage(
        frame,
        cropX,
        cropY,
        cropW,
        cropH,
        door.x - 2,
        drawY,
        door.w + 4,
        drawH,
      );
      TX.globalAlpha = 1;
    } else {
      var img = lit ? SPR.door2 : SPR.door1;
      if (img && img.complete && img.naturalWidth) {
        TX.globalAlpha = lit ? pulse : 0.75;
        TX.drawImage(img, door.x, door.y, door.w, door.h);
        TX.globalAlpha = 1;
      } else {
        // Fallback drawn door
        TX.fillStyle = lit ? "#8a6a20" : "#3a2010";
        TX.fillRect(door.x, door.y, door.w, door.h);
        TX.fillStyle = lit ? "#ffd700" : "#5a3818";
        TX.fillRect(door.x + 4, door.y + 4, door.w - 8, door.h - 8);
        if (lit) {
          TX.fillStyle = "#ffd700";
          TX.font = "bold 18px serif";
          TX.textAlign = "center";
          TX.fillText("✓", door.x + door.w / 2, door.y + door.h / 2 + 6);
          TX.textAlign = "left";
        }
        TX.strokeStyle = lit ? "#ffd700" : "#5a3818";
        TX.lineWidth = 3;
        TX.strokeRect(door.x, door.y, door.w, door.h);
      }
    }
    // Labels
    TX.fillStyle = lit ? "rgba(255,215,0,.9)" : "rgba(212,168,67,.4)";
    TX.font = "9px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText(
      door.correct && GS.hasGold ? "TRUE PATH" : "EXIT",
      door.x + door.w / 2,
      door.y + door.h + 14,
    );
    if (GS.activeDoorIndex === i) {
      TX.fillStyle = "rgba(255,215,0,.95)";
      TX.fillText("[E] ENTER", door.x + door.w / 2, door.y - 8);
    }
    TX.textAlign = "left";
  });
}

function drawSecretDoor() {
  if (!MAP.secretDoor || !MAP.secretDoor.visible) return;
  var sd = MAP.secretDoor;

  if (sd.x + sd.w < CAM.x - 20 || sd.x > CAM.x + TC.width + 20) return;
  TX.save();

  // Shadow
  TX.fillStyle = "rgba(0,0,0,.22)";
  TX.beginPath();
  TX.ellipse(
    sd.x + sd.w / 2,
    sd.y + sd.h + 10,
    sd.w * 0.56,
    10,
    0,
    0,
    Math.PI * 2,
  );
  TX.fill();

  // Dark mysterious frame
  TX.fillStyle = "#2a1a0a";
  TX.fillRect(sd.x - 8, sd.y - 8, sd.w + 16, sd.h + 16);

  // Door body - darker than normal doors
  TX.fillStyle = "#1a0a04";
  TX.fillRect(sd.x, sd.y, sd.w, sd.h);

  // Subtle rune marks
  TX.fillStyle = "rgba(212,168,67,0.3)";
  TX.font = "10px Cinzel,serif";
  TX.textAlign = "center";
  TX.fillText("?", sd.x + sd.w / 2, sd.y + sd.h / 2 + 5);

  // Lock indicator
  TX.fillStyle = "rgba(255,100,100,0.6)";
  TX.font = "bold 14px serif";
  TX.fillText("🔒", sd.x + sd.w / 2, sd.y + 25);

  // Interaction prompt when near
  var px = PL.x + PL_COX;
  var py = PL.y + PL_COY;
  var nearSecret =
    px < sd.x + sd.w + 20 &&
    px + PL.w > sd.x - 20 &&
    py + PL.h > sd.y &&
    py < sd.y + sd.h;

  if (nearSecret) {
    TX.fillStyle = "rgba(212,168,67,.7)";
    TX.font = "bold 10px Cinzel,serif";
    TX.fillText("[E] Inspect", sd.x + sd.w / 2, sd.y - 12);
  }

  TX.restore();
}

function drawInputPuzzle() {
  if (!MAP.inputPuzzle || MAP.inputPuzzle.solved) return;
  var ip = MAP.inputPuzzle;
  if (ip.x + ip.w < CAM.x - 40 || ip.x > CAM.x + TC.width + 40) return;

  var bob = Math.sin(Date.now() * 0.003) * 3;

  TX.save();

  // Draw the input sprite if loaded
  if (SPR.input && SPR.input.complete && SPR.input.naturalWidth) {
    TX.globalAlpha = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
    TX.drawImage(SPR.input, ip.x, ip.y + bob, ip.w, ip.h);
  } else {
    // Fallback: mysterious glowing rune
    TX.globalAlpha = 0.6 + Math.sin(Date.now() * 0.005) * 0.4;
    var glow = TX.createRadialGradient(
      ip.x + ip.w / 2,
      ip.y + ip.h / 2 + bob,
      0,
      ip.x + ip.w / 2,
      ip.y + ip.h / 2 + bob,
      ip.w,
    );
    glow.addColorStop(0, "rgba(212,168,67,0.8)");
    glow.addColorStop(1, "transparent");
    TX.fillStyle = glow;
    TX.fillRect(ip.x - 10, ip.y - 10 + bob, ip.w + 20, ip.h + 20);

    TX.fillStyle = "rgba(212,168,67,0.9)";
    TX.font = "bold 16px serif";
    TX.textAlign = "center";
    TX.fillText("?", ip.x + ip.w / 2, ip.y + ip.h / 2 + 6 + bob);
  }

  TX.restore();

  // Interaction hint
  var pxIp = PL.x + PL_COX;
  var pyIp = PL.y + PL_COY;
  var nearInput =
    Math.abs(pxIp + PL.w / 2 - (ip.x + ip.w / 2)) < 60 &&
    Math.abs(pyIp + PL.h / 2 - (ip.y + ip.h / 2)) < 80;

  if (nearInput) {
    TX.fillStyle = "rgba(255,215,0,.9)";
    TX.font = "bold 10px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText("[E] Inspect", ip.x + ip.w / 2, ip.y + bob - 8);
    TX.textAlign = "left";
  }
}

function drawPot() {
  if (!MAP.pot) return;
  var pot = MAP.pot;
  if (pot.x + pot.w < CAM.x - 40 || pot.x > CAM.x + TC.width + 40) return;

  var px = pot.x + (pot.shakeX || 0);
  var py = pot.y + (pot.shakeY || 0);

  if (pot.broken) {
    // Draw broken pot shards (using pot2 if available, or fallback)
    if (SPR.pot2 && SPR.pot2.complete && SPR.pot2.naturalWidth) {
      TX.save();
      TX.globalAlpha = 0.7;
      TX.drawImage(SPR.pot2, px, py + 20, pot.w, pot.h * 0.6);
      TX.restore();
    } else {
      // Fallback broken pot
      TX.fillStyle = "rgba(140,100,60,.5)";
      TX.fillRect(px + 8, py + 40, pot.w - 16, 20);
      TX.fillStyle = "rgba(160,120,70,.4)";
      TX.fillRect(px + 4, py + 50, 20, 10);
      TX.fillRect(px + pot.w - 24, py + 45, 20, 12);
    }
    return;
  }

  // Draw intact pot
  var potImg = pot.breaking && SPR.pot2 ? SPR.pot2 : SPR.pot;
  if (potImg && potImg.complete && potImg.naturalWidth) {
    TX.drawImage(potImg, px, py, pot.w, pot.h);
  } else {
    // Fallback clay pot
    var pg = TX.createLinearGradient(px, py, px + pot.w, py + pot.h);
    pg.addColorStop(0, "#8a5a2a");
    pg.addColorStop(0.5, "#a07040");
    pg.addColorStop(1, "#6a4020");
    TX.fillStyle = pg;
    TX.beginPath();
    TX.moveTo(px + pot.w * 0.3, py);
    TX.quadraticCurveTo(
      px,
      py + pot.h * 0.3,
      px + pot.w * 0.2,
      py + pot.h * 0.7,
    );
    TX.quadraticCurveTo(
      px + pot.w * 0.1,
      py + pot.h,
      px + pot.w * 0.5,
      py + pot.h,
    );
    TX.quadraticCurveTo(
      px + pot.w * 0.9,
      py + pot.h,
      px + pot.w * 0.8,
      py + pot.h * 0.7,
    );
    TX.quadraticCurveTo(px + pot.w, py + pot.h * 0.3, px + pot.w * 0.7, py);
    TX.closePath();
    TX.fill();
    TX.strokeStyle = "#5a3010";
    TX.lineWidth = 2;
    TX.stroke();
    // Pot rim
    TX.fillStyle = "#7a5028";
    TX.fillRect(px + pot.w * 0.25, py, pot.w * 0.5, 8);
  }

  // Interaction hint
  var pxPot = PL.x + PL_COX;
  var pyPot = PL.y + PL_COY;
  var nearPot =
    Math.abs(pxPot + PL.w / 2 - (pot.x + pot.w / 2)) < 80 &&
    Math.abs(pyPot + PL.h / 2 - (pot.y + pot.h / 2)) < 100;
  if (nearPot && !pot.breaking) {
    TX.fillStyle = "rgba(255,215,0,.9)";
    TX.font = "bold 10px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText("[E] Break", pot.x + pot.w / 2, pot.y - 8);
    TX.textAlign = "left";
  }
}

function drawParticles() {
  GS.ptcls.forEach(function (p) {
    TX.save();
    TX.globalAlpha = p.life * 0.75;
    TX.fillStyle = p.col;
    TX.shadowBlur = 5;
    TX.shadowColor = p.col;
    TX.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
    TX.restore();
  });
}

function drawPlayer() {
  var img = null;
  if (!PL.grounded && SPR.jump.length) {
    img = SPR.jump[Math.min(PL.frame, Math.max(SPR.jump.length - 1, 0))];
  } else if (!PL.moving) {
    img = PL.ifrm === 0 ? SPR.idle : SPR.idle2;
  } else if (PL.sprinting || PL.dashing) {
    img = SPR.run[PL.frame % Math.max(SPR.run.length, 1)];
  } else {
    img = SPR.walk[PL.frame % Math.max(SPR.walk.length, 1)];
  }

  if (!GS.deathFx && PL.iframes > 0 && Math.floor(PL.iframes / 5) % 2 === 0)
    return; // flicker

  TX.save();

  if (GS.disguiseActive) {
    TX.globalAlpha = 0.15; // Nearly invisible
    TX.filter = "sepia(0.8) brightness(0.6)"; // Banner-like coloring
  }

  if (GS.deathFx) {
    var fx = GS.deathFx;
    TX.globalAlpha = fx.alpha;
    TX.shadowBlur = 24 * fx.glow;
    TX.shadowColor = "rgba(255,180,90,.85)";
    TX.fillStyle = "rgba(0,0,0," + 0.18 * fx.alpha + ")";
    TX.beginPath();
    TX.ellipse(
      fx.x + PL.sw / 2,
      fx.y + PL.sh + 6,
      PL_COX * (1.05 + fx.t * 0.01),
      6,
      0,
      0,
      Math.PI * 2,
    );
    TX.fill();

    TX.translate(fx.x + PL.sw / 2, fx.y + PL.sh * 0.56);
    TX.rotate(fx.rot);
    TX.scale(
      (PL.dir === -1 ? -1 : 1) * fx.scale,
      Math.max(0.78, 1 - fx.t * 0.01),
    );

    if (img && img.complete && img.naturalWidth) {
      TX.drawImage(img, -PL.sw / 2, -PL.sh * 0.56, PL.sw, PL.sh);
    } else {
      TX.fillStyle = "#d4a843";
      TX.fillRect(-PL.sw / 2 + 8, -PL.sh * 0.56 + 20, PL.sw - 16, PL.sh - 28);
      TX.fillStyle = "#f0c080";
      TX.fillRect(-PL.sw / 2 + 10, -PL.sh * 0.56 + 2, PL.sw - 20, 20);
      TX.fillStyle = "#8a3020";
      TX.fillRect(-PL.sw / 2 + 8, -PL.sh * 0.56 + 22, PL.sw - 16, 6);
    }

    if (GS.disguiseActive) {
      TX.globalAlpha = 1;
      TX.filter = "none";
      // Draw banner overlay on player
      TX.fillStyle = "rgba(139,90,43,0.6)";
      TX.fillRect(PL.x + 10, PL.y + 10, PL.sw - 20, PL.sh - 20);
    }

    TX.restore();
    return;
  }

  if (PL.dashing) {
    TX.globalAlpha = 0.55 + Math.random() * 0.3;
    TX.shadowBlur = 18;
    TX.shadowColor = "#44aaff";
  }
  // Shadow ellipse
  TX.fillStyle = "rgba(0,0,0,.3)";
  TX.beginPath();
  TX.ellipse(
    PL.x + PL.sw / 2,
    PL.y + PL.sh + 2,
    PL_COX * 0.9,
    5,
    0,
    0,
    Math.PI * 2,
  );
  TX.fill();

  if (img && img.complete && img.naturalWidth) {
    if (PL.dir === -1) {
      TX.translate(PL.x + PL.sw, PL.y);
      TX.scale(-1, 1);
      TX.drawImage(img, 0, 0, PL.sw, PL.sh);
    } else {
      TX.drawImage(img, PL.x, PL.y, PL.sw, PL.sh);
    }
  } else {
    // Fallback block figure
    if (PL.dir === -1) {
      TX.translate((PL.x + PL.sw / 2) * 2, 0);
      TX.scale(-1, 1);
    }
    TX.fillStyle = "#d4a843";
    TX.fillRect(PL.x + 8, PL.y + 20, PL.sw - 16, PL.sh - 28);
    TX.fillStyle = "#f0c080";
    TX.fillRect(PL.x + 10, PL.y + 2, PL.sw - 20, 20);
    TX.fillStyle = "#8a3020";
    TX.fillRect(PL.x + 8, PL.y + 22, PL.sw - 16, 6);
  }

  // Gold item indicator above head
  if (GS.hasGold) {
    TX.globalAlpha = 1;
    TX.font = "18px serif";
    TX.textAlign = "center";
    TX.fillText("🪙", PL.x + PL.sw / 2, PL.y - 6);
    TX.textAlign = "left";
  }
  TX.restore();
}

function drawVignette(W, H) {
  var vg = TX.createRadialGradient(
    W / 2,
    H / 2,
    H * 0.2,
    W / 2,
    H / 2,
    H * 0.85,
  );
  vg.addColorStop(0, "transparent");
  vg.addColorStop(1, "rgba(0,0,0,.78)");
  TX.fillStyle = vg;
  TX.fillRect(0, 0, W, H);

  if (GS.deathFlash > 0) {
    var deathG = TX.createRadialGradient(
      W / 2,
      H * 0.45,
      20,
      W / 2,
      H * 0.45,
      H * 0.72,
    );
    deathG.addColorStop(0, "rgba(255,158,72," + GS.deathFlash * 0.16 + ")");
    deathG.addColorStop(0.55, "rgba(148,24,24," + GS.deathFlash * 0.12 + ")");
    deathG.addColorStop(1, "rgba(28,0,0," + GS.deathFlash * 0.36 + ")");
    TX.fillStyle = deathG;
    TX.fillRect(0, 0, W, H);
  }
}

function drawStamBar(W, H) {
  var pct = PL.stamina / STAM_MAX;
  var sf = document.getElementById("stam-fill");
  if (sf) sf.style.width = pct * 100 + "%";
  var dr = document.getElementById("dash-ready");
  if (dr)
    dr.textContent = PL.dcd <= 0 && PL.stamina >= DASH_COST ? "READY" : "";
}

/* ── PARTICLES ──────────────────────────────────────────────────── */
function spawnDustPtcl() {
  GS.ptcls.push({
    x: PL.x + PL.sw / 2 + (Math.random() - 0.5) * 12,
    y: PL.y + PL.sh,
    vx: (Math.random() - 0.5) * 2,
    vy: -(Math.random() * 0.8 + 0.2),
    life: 1,
    dec: 0.04 + Math.random() * 0.03,
    sz: Math.random() * 3 + 1.5,
    col: "#7a4a28",
    type: "dust",
  });
}
function spawnDashPtcl() {
  for (var i = 0; i < 3; i++)
    GS.ptcls.push({
      x: PL.x + PL.sw / 2 + (Math.random() - 0.5) * PL_COX,
      y: PL.y + PL.sh * 0.5 + (Math.random() - 0.5) * 20,
      vx: -PL.ddir * (Math.random() * 2.5 + 1),
      vy: (Math.random() - 0.5) * 1.5,
      life: 1,
      dec: 0.09 + Math.random() * 0.06,
      sz: Math.random() * 5 + 3,
      col: "#44aaff",
      type: "dash",
    });
}
function spawnGoldPtcls(gx, gy) {
  for (var i = 0; i < 20; i++)
    GS.ptcls.push({
      x: gx + (Math.random() - 0.5) * 30,
      y: gy + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 5,
      vy: -(Math.random() * 4 + 1),
      life: 1,
      dec: 0.025 + Math.random() * 0.02,
      sz: Math.random() * 4 + 2,
      col: "#ffd700",
      type: "ember",
    });
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN LOOP
═══════════════════════════════════════════════════════════════════ */
function tutLoop() {
  tutUpdate();
  tutDraw();
  JP = {};
  GS.loopId = requestAnimationFrame(tutLoop);
}

/* ═══════════════════════════════════════════════════════════════════
   HUD / UI
═══════════════════════════════════════════════════════════════════ */
function buildHUD() {
  updateHUD();
}

function updateHUD() {
  var hb = document.getElementById("hud-hearts");
  if (!hb) return;
  var paperSlot = document.getElementById("hud-paper-slot");
  if (paperSlot) paperSlot.style.display = GS.hasPaper ? "flex" : "none";
  hb.innerHTML = "";
  for (var i = 0; i < 3; i++) {
    var full = i < GS.lives;
    hb.innerHTML +=
      '<svg class="hud-heart' +
      (full ? " full" : "") +
      '" viewBox="0 0 20 18"><path d="M10 16.5S1 11 1 5.5A4.5 4.5 0 0 1 10 3.6 4.5 4.5 0 0 1 19 5.5C19 11 10 16.5 10 16.5z" fill="' +
      (full ? "#cc2222" : "#2a1010") +
      '" stroke="' +
      (full ? "#ff4444" : "#4a2020") +
      '" stroke-width="1.5"/></svg>';
  }
}

/* ── STEPS ─────────────────────────────────────────────────────── */
function showStep(idx) {
  return;
}

function advanceStep() {
  return;
}

function showBadge(msg) {
  return;
}

/* ── SCREENS ────────────────────────────────────────────────────── */
function showScreen(id) {
  if (id === "screen-win" && !window.__minosStageSaved) {
    window.__minosStageSaved = true;
    import("../progress-service.js")
      .then(function (service) {
        return service.markStageComplete(1);
      })
      .catch(function (error) {
        console.warn("Firebase stage progress save failed.", error);
      });
  }
  var el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}
function hideScreen(id) {
  var el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

/* ── EXPOSE ─────────────────────────────────────────────────────── */
window.tutInit = tutInit;
window.resetToStart = resetToStart;
