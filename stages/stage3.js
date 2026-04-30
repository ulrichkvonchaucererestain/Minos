/* ═══════════════════════════════════════════════════════════════════
   LABYRINTH OF MINOS — STAGE III   stage3.js
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

/* ── SPACE QUESTIONS DATABASE ─────────────────────────────────── */
var SPACE_QUESTIONS = [
  {
    q: "Which planet is closest to the Sun?",
    options: ["Venus", "Mercury", "Mars", "Earth"],
    correct: 1, // Mercury
  },
  {
    q: "What is the largest planet in our solar system?",
    options: ["Saturn", "Neptune", "Jupiter", "Uranus"],
    correct: 2, // Jupiter
  },
  {
    q: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Mercury"],
    correct: 2, // Mars
  },
  {
    q: "What is the name of the galaxy that contains our Solar System?",
    options: ["Andromeda", "Triangulum", "Whirlpool", "Milky Way"],
    correct: 3, // Milky Way
  },
  {
    q: "Which planet has the most extensive ring system?",
    options: ["Jupiter", "Uranus", "Saturn", "Neptune"],
    correct: 2, // Saturn
  },
  {
    q: "What is the hottest planet in our solar system?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    correct: 1, // Venus
  },
  {
    q: "Who was the first person to walk on the Moon?",
    options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "John Glenn"],
    correct: 2, // Neil Armstrong
  },
  {
    q: "What is the Great Red Spot on Jupiter?",
    options: ["A volcano", "A massive storm", "A crater", "A lake"],
    correct: 1, // A massive storm
  },
  {
    q: "Which two planets have no moons?",
    options: [
      "Earth & Mars",
      "Mercury & Venus",
      "Jupiter & Saturn",
      "Uranus & Neptune",
    ],
    correct: 1, // Mercury & Venus
  },
  {
    q: "How long does light take to travel from the Sun to Earth?",
    options: ["8 minutes", "1 hour", "1 day", "1 second"],
    correct: 0, // 8 minutes
  },
  {
    q: "What is a light-year a measure of?",
    options: ["Time", "Distance", "Speed", "Brightness"],
    correct: 1, // Distance
  },
  {
    q: "Which dwarf planet was reclassified from a planet in 2006?",
    options: ["Ceres", "Eris", "Pluto", "Haumea"],
    correct: 2, // Pluto
  },
];

function getRandomQuestion() {
  var idx = Math.floor(Math.random() * SPACE_QUESTIONS.length);
  return SPACE_QUESTIONS[idx];
}

function getRandomQuestions(count) {
  var shuffled = SPACE_QUESTIONS.slice();
  // Fisher-Yates shuffle
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled.slice(0, count);
}

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
// Stage III extends Stage II with denser hazards, tighter climbs, and roaming mobs.
var WORLD = 9100;
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
  rat: [],
  bat: null,
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

var MOB_RAT_PATHS = [
  "../MOBS/rat1.png",
  "../MOBS/rat2.png",
  "../MOBS/rat3.png",
  "../MOBS/rat4.png",
];
var MOB_BAT_PATH = "../MOBS/bats.png";

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
  SPR.torch = await li(TORCH_ASSET);
  SPR.rat = await Promise.all(MOB_RAT_PATHS.map(li));
  SPR.bat = await li(MOB_BAT_PATH);
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
  return (
    window.matchMedia &&
    window.matchMedia("(max-width: 900px), (max-height: 520px)").matches
  );
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
      "KeyR",
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
  var mezzY = FLOOR_Y - TILE * 0.35;
  var loftY = FLOOR_Y - TILE * 0.95;
  var galleryY = FLOOR_Y - TILE * 1.35;
  var lowerY = FLOOR_Y + TILE * 2.7;
  var trenchY = FLOOR_Y + TILE * 3.7;
  var rise1Y = FLOOR_Y + TILE * 1.8;
  var rise2Y = FLOOR_Y + TILE * 0.95;
  var rise3Y = FLOOR_Y + TILE * 0.2;

  MAP.platforms = [
    { x: 0, y: FLOOR_Y, w: 560, h: ph },
    { x: 760, y: mezzY, w: 220, h: TILE },
    { x: 1070, y: mezzY, w: 250, h: TILE },
    { x: 1460, y: FLOOR_Y, w: 360, h: ph },
    { x: 1980, y: loftY, w: 240, h: TILE },
    { x: 2320, y: mezzY, w: 200, h: TILE },
    { x: 2620, y: FLOOR_Y, w: 360, h: ph },
    { x: 3060, y: trenchY, w: 170, h: ph },
    { x: 3350, y: lowerY, w: 260, h: ph },
    { x: 3730, y: rise1Y, w: 230, h: TILE },
    { x: 4040, y: rise2Y, w: 210, h: TILE },
    { x: 4330, y: rise3Y, w: 240, h: TILE },
    { x: 4680, y: mezzY, w: 260, h: TILE },
    { x: 5040, y: FLOOR_Y, w: 340, h: ph },
    { x: 5530, y: rise1Y, w: 220, h: TILE },
    { x: 5840, y: rise2Y, w: 210, h: TILE },
    { x: 6150, y: mezzY, w: 230, h: TILE },
    { x: 6490, y: FLOOR_Y, w: 360, h: ph },
    { x: 7000, y: mezzY, w: 230, h: TILE },
    { x: 7360, y: FLOOR_Y, w: 1060, h: ph },
  ];

  MAP.obstacle = null;
  MAP.plates = [];

  /* ── STAGE III SPIKE LAYOUT ── */
  MAP.spikes = [
    { x: 1238, y: mezzY, w: 64, triggerX: 1168, active: false, riseTimer: 0 },
    { x: 2886, y: FLOOR_Y, w: 64, triggerX: 2808, active: false, riseTimer: 0 },
    { x: 4406, y: rise3Y, w: 64, triggerX: 4340, active: false, riseTimer: 0 },
    { x: 7485, y: FLOOR_Y, w: 96, triggerX: 7400, active: false, riseTimer: 0 },
  ];

  MAP.mobs = [
    {
      type: "rat",
      x: 2065,
      startX: 2065,
      y: loftY,
      w: 56,
      h: 32,
      minX: 1992,
      maxX: 2160,
      vx: 1.15,
      tick: 0,
      dead: false,
      hitCooldown: 0,
    },
    {
      type: "bat",
      x: 4690,
      startX: 4690,
      y: mezzY - 128,
      baseY: mezzY - 128,
      w: 72,
      h: 42,
      minX: 4638,
      maxX: 4912,
      vx: 1.45,
      bob: 0,
      tick: 0,
      dead: false,
      hitCooldown: 0,
    },
    {
      type: "rat",
      x: 7055,
      startX: 7055,
      y: mezzY,
      w: 56,
      h: 32,
      minX: 7012,
      maxX: 7158,
      vx: -1.25,
      tick: 0,
      dead: false,
      hitCooldown: 0,
    },
  ];

  /* ── SHAFT ── */
  MAP.shaft = {
    x: 3140,
    y: FLOOR_Y + ph,
    w: 120,
    bottom: trenchY,
  };

  MAP.readySpike = null;
  MAP.hammer = null;

  /* ── GOLDEN THREAD (Required to unlock doors) ── */
  MAP.gold = {
    x: 3500, // Positioned before the doors
    y: rise2Y - 120,
    w: 64,
    h: 64,
    collected: false,
    bobTimer: 0,
  };

  /* ── THREE DOORS: 2 FAKE, 1 REAL ── */
  /* ── THREE DOORS: 2 FAKE, 1 REAL ── */
  var dW = 118,
    dH = 154;
  var doorY = FLOOR_Y - dH;

  // Randomly assign which door is correct (0, 1, or 2)
  var correctDoorIndex = Math.floor(Math.random() * 3);

  MAP.doors = [
    {
      x: 1800,
      y: doorY,
      w: dW,
      h: dH,
      correct: correctDoorIndex === 0,
      label: correctDoorIndex === 0 ? "EXIT" : "DOOR A",
      answered: false,
      question: null, // Will be set when player interacts
    },
    {
      x: 4500,
      y: doorY,
      w: dW,
      h: dH,
      correct: correctDoorIndex === 1,
      label: correctDoorIndex === 1 ? "EXIT" : "DOOR B",
      answered: false,
      question: null,
    },
    {
      x: 7200,
      y: doorY,
      w: dW,
      h: dH,
      correct: correctDoorIndex === 2,
      label: correctDoorIndex === 2 ? "EXIT" : "DOOR C",
      answered: false,
      question: null,
    },
  ];
  MAP.doorFrameRect = null;

  MAP.decorBack = [
    { key: "cage", x: 150, y: FLOOR_Y - 276, w: 104, h: 88, alpha: 0.18 },
    { key: "web", x: 300, y: FLOOR_Y - 256, w: 132, h: 48, alpha: 0.24 },
    {
      key: "vinesGreenWide",
      x: 520,
      y: FLOOR_Y - 216,
      w: 170,
      h: 56,
      alpha: 0.15,
    },

    { key: "web", x: 820, y: mezzY - 96, w: 126, h: 44, alpha: 0.26 },
    { key: "writing", x: 1120, y: FLOOR_Y - 178, w: 142, h: 58, alpha: 0.16 },
    { key: "vinesRed3", x: 1330, y: FLOOR_Y - 208, w: 80, h: 236, alpha: 0.22 },

    { key: "web", x: 2010, y: loftY - 94, w: 128, h: 46, alpha: 0.26 },
    {
      key: "muralShade",
      x: 2230,
      y: FLOOR_Y - 292,
      w: 188,
      h: 146,
      alpha: 0.1,
    },

    { key: "web", x: 3110, y: trenchY - 118, w: 132, h: 46, alpha: 0.26 },
    { key: "vinesGreen", x: 3350, y: lowerY - 142, w: 82, h: 96, alpha: 0.16 },
    { key: "web", x: 3770, y: rise1Y - 96, w: 138, h: 48, alpha: 0.24 },
    {
      key: "vinesGreenWide",
      x: 4010,
      y: rise2Y - 156,
      w: 162,
      h: 52,
      alpha: 0.16,
    },
    { key: "web", x: 4350, y: rise3Y - 104, w: 132, h: 46, alpha: 0.28 },

    {
      key: "muralLady",
      x: 4560,
      y: FLOOR_Y - 286,
      w: 138,
      h: 112,
      alpha: 0.12,
    },
    { key: "web", x: 4720, y: mezzY - 96, w: 132, h: 46, alpha: 0.24 },
    {
      key: "vinesGreenWide",
      x: 5060,
      y: FLOOR_Y - 212,
      w: 170,
      h: 56,
      alpha: 0.15,
    },

    { key: "cage", x: 5590, y: rise1Y - 178, w: 104, h: 88, alpha: 0.18 },
    { key: "writing", x: 5870, y: FLOOR_Y - 188, w: 146, h: 60, alpha: 0.16 },
    { key: "web", x: 6180, y: mezzY - 96, w: 126, h: 44, alpha: 0.24 },
    { key: "vinesRed4", x: 6740, y: FLOOR_Y - 212, w: 88, h: 244, alpha: 0.22 },
    { key: "web", x: 7030, y: mezzY - 96, w: 132, h: 48, alpha: 0.28 },

    {
      key: "muralSeeker",
      x: 7410,
      y: FLOOR_Y - 284,
      w: 176,
      h: 138,
      alpha: 0.12,
    },
    {
      key: "vinesGreenWide",
      x: 7720,
      y: FLOOR_Y - 160,
      w: 180,
      h: 60,
      alpha: 0.18,
    },
    { key: "web", x: 7995, y: FLOOR_Y - 88, w: 120, h: 42, alpha: 0.22 },
  ];

  MAP.decorFront = [
    { key: "jar", x: 812, y: mezzY - 58, w: 52, h: 62, alpha: 0.76 },
    { key: "bonesSmall", x: 2038, y: loftY - 4, w: 72, h: 30, alpha: 0.22 },
    { key: "bonesWide", x: 3390, y: lowerY + 10, w: 114, h: 52, alpha: 0.24 },
    { key: "jar", x: 5105, y: FLOOR_Y - 60, w: 58, h: 68, alpha: 0.78 },
    { key: "bonesSmall", x: 6540, y: FLOOR_Y - 6, w: 76, h: 32, alpha: 0.2 },
    { key: "blood", x: 6988, y: FLOOR_Y - 108, w: 108, h: 62, alpha: 0.2 },
    { key: "clueMarker", x: 7628, y: FLOOR_Y - 204, w: 68, h: 40, alpha: 0.64 },
    { key: "bonesHuge", x: 7905, y: FLOOR_Y - 18, w: 148, h: 92, alpha: 0.28 },
  ];
  cleanStageDecor();

  MAP.roomLights = [
    { x: 30, y: FLOOR_Y - 280, w: 880, h: 350, glow: 0.08 },
    { x: 930, y: FLOOR_Y - 330, w: 1650, h: 410, glow: 0.1 },
    { x: 2710, y: lowerY - 240, w: 980, h: 430, glow: 0.11 },
    { x: 3730, y: FLOOR_Y - 280, w: 2050, h: 360, glow: 0.09 },
    { x: 5900, y: FLOOR_Y - 260, w: 2600, h: 330, glow: 0.1 },
  ];

  MAP.roomColumns = [
    { x: 610, y: 120, w: 22, h: FLOOR_Y - 28, alpha: 0.11 },
    { x: 1700, y: 126, w: 22, h: FLOOR_Y - 22, alpha: 0.12 },
    { x: 3240, y: 138, w: 22, h: trenchY - 34, alpha: 0.13 },
    { x: 5110, y: 120, w: 24, h: FLOOR_Y - 26, alpha: 0.11 },
    { x: 7410, y: 120, w: 24, h: FLOOR_Y - 24, alpha: 0.13 },
  ];

  /* ── SPAWN POINT ── */
  MAP.spawn = {
    x: 230,
    y: FLOOR_Y - PL.h - PL_COY,
  };
}

/* ═══════════════════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════════════════ */
var GS = {
  lives: 3,
  hasGold: false,
  startTime: 0,
  timerSecs: 0,
  step: 0, // tutorial step index
  paused: false,
  dead: false,
  won: false,
  jumpscareActive: false,
  activeDoorIndex: -1,
  loopId: null,
  ptcls: [],
  bgX: 0,
  flicker: 0,
  deathFx: null,
  deathFlash: 0,
  badgeTimer: null,
  stepCardTimer: null,
};

/* ═══════════════════════════════════════════════════════════════════
   TUTORIAL STEPS
═══════════════════════════════════════════════════════════════════ */
var STEPS = [
  {
    icon: "🕸",
    title: "Stage III — Infested Climb",
    desc: "Find the Golden Thread to unlock the mysterious doors. Beware: only one door leads to freedom!",
    keys: ["Find the Golden Thread", "Choose wisely among 3 doors"],
    trigger: function () {
      return PL.x > 700;
    },
  },
  {
    icon: "☠",
    title: "The Golden Thread",
    desc: "The Golden Thread lies hidden in the chamber. Without it, the doors remain sealed.",
    keys: ["Search thoroughly"],
    trigger: function () {
      return PL.x > 2400;
    },
  },
  {
    icon: "🦇",
    title: "The Three Doors",
    desc: "Two doors lead to doom, one to salvation. Each requires answering space riddles correctly.",
    keys: ["Answer 4/6 questions correctly", "Choose the right door"],
    trigger: function () {
      return PL.x > 5200;
    },
  },
  {
    icon: "🚪",
    title: "Final Choice",
    desc: "Use your knowledge of the cosmos to unlock the true exit. Wrong answers cost health!",
    keys: ["Space knowledge required", "Hearts are limited"],
    trigger: function () {
      return PL.x > 7900;
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
  await loadSpr();
  spawnPlayer();
  GS.startTime = Date.now();
  GS.loopId = requestAnimationFrame(tutLoop);
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
  if (MAP.mobs) {
    MAP.mobs.forEach(function (m) {
      m.dead = false;
      m.hitCooldown = 0;
      if (typeof m.startX === "undefined") m.startX = m.x;
      m.x = m.startX;
      m.tick = 0;
      if (m.type === "bat") m.bob = m.bob || 0;
    });
  }
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
  if (MAP.mobs) {
    MAP.mobs.forEach(function (m) {
      m.dead = false;
      m.hitCooldown = 0;
      if (typeof m.startX !== "undefined") m.x = m.startX;
      m.tick = 0;
    });
  }
  GS.hasGold = false;
  GS.activeDoorIndex = -1;
  // Reset doors
  if (MAP.doors) {
    var correctDoorIndex = Math.floor(Math.random() * 3);
    MAP.doors.forEach(function (door, i) {
      door.correct = i === correctDoorIndex;
      door.label =
        i === correctDoorIndex ? "EXIT" : "DOOR " + String.fromCharCode(65 + i);
      door.answered = false;
      door.question = null;
    });
  }
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
}

/* ── DOOR QUIZ SYSTEM (Single Question) ───────────────────────── */
var currentQuiz = null;

function startDoorQuiz(door, doorIndex) {
  GS.paused = true;
  currentQuiz = {
    door: door,
    doorIndex: doorIndex,
    question: door.question,
  };

  buildQuizUI();
  showQuizQuestion();
}

function buildQuizUI() {
  var existing = document.getElementById("quiz-overlay");
  if (existing) existing.remove();

  var overlay = document.createElement("div");
  overlay.id = "quiz-overlay";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:10000",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:rgba(0,0,0,0.85)",
    "font-family:Cinzel,serif",
  ].join(";");

  var container = document.createElement("div");
  container.id = "quiz-container";
  container.style.cssText = [
    "background:linear-gradient(180deg,#1a0f0a 0%,#0d0705 100%)",
    "border:2px solid #d4a843",
    "border-radius:8px",
    "padding:32px",
    "max-width:560px",
    "width:90%",
    "color:#e8c26a",
    "box-shadow:0 0 40px rgba(212,168,67,0.3)",
  ].join(";");

  var title = document.createElement("h2");
  title.id = "quiz-title";
  title.style.cssText =
    "margin:0 0 20px 0;color:#ffd700;font-size:24px;text-align:center;";
  title.textContent = "🔮 Oracle's Riddle";

  var subtitle = document.createElement("div");
  subtitle.style.cssText =
    "text-align:center;margin-bottom:16px;font-size:13px;color:#a08050;";
  subtitle.textContent = "Answer correctly to unlock the door...";

  var question = document.createElement("div");
  question.id = "quiz-question";
  question.style.cssText =
    "font-size:20px;margin-bottom:28px;line-height:1.4;color:#f0e6d2;text-align:center;";

  var options = document.createElement("div");
  options.id = "quiz-options";
  options.style.cssText = "display:flex;flex-direction:column;gap:12px;";

  var feedback = document.createElement("div");
  feedback.id = "quiz-feedback";
  feedback.style.cssText =
    "margin-top:20px;text-align:center;font-size:18px;min-height:28px;";

  container.appendChild(title);
  container.appendChild(subtitle);
  container.appendChild(question);
  container.appendChild(options);
  container.appendChild(feedback);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

function showQuizQuestion() {
  if (!currentQuiz) return;

  var q = currentQuiz.question;

  document.getElementById("quiz-question").textContent = q.q;

  var optionsDiv = document.getElementById("quiz-options");
  optionsDiv.innerHTML = "";

  q.options.forEach(function (opt, idx) {
    var btn = document.createElement("button");
    btn.style.cssText = [
      "background:linear-gradient(180deg,#2a1a10 0%,#1a0f0a 100%)",
      "border:1px solid #8a6a3a",
      "color:#e8c26a",
      "padding:16px 20px",
      "font-size:17px",
      "cursor:pointer",
      "border-radius:4px",
      "font-family:Cinzel,serif",
      "transition:all 0.2s",
      "text-align:left",
    ].join(";");

    btn.onmouseover = function () {
      this.style.borderColor = "#d4a843";
      this.style.background = "linear-gradient(180deg,#3a2a1a 0%,#2a1a10 100%)";
    };
    btn.onmouseout = function () {
      this.style.borderColor = "#8a6a3a";
      this.style.background = "linear-gradient(180deg,#2a1a10 0%,#1a0f0a 100%)";
    };

    btn.textContent = String.fromCharCode(65 + idx) + ". " + opt;
    btn.onclick = function () {
      handleQuizAnswer(idx);
    };
    optionsDiv.appendChild(btn);
  });

  document.getElementById("quiz-feedback").textContent = "";
}

function handleQuizAnswer(selectedIndex) {
  if (!currentQuiz) return;

  var q = currentQuiz.question;
  var isCorrect = selectedIndex === q.correct;
  var feedback = document.getElementById("quiz-feedback");
  var door = currentQuiz.door;

  // Disable all buttons
  var buttons = document
    .getElementById("quiz-options")
    .getElementsByTagName("button");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
    if (i === q.correct) {
      buttons[i].style.borderColor = "#4a8a4a";
      buttons[i].style.background =
        "linear-gradient(180deg,#2a4a2a 0%,#1a3a1a 100%)";
    } else if (i === selectedIndex && !isCorrect) {
      buttons[i].style.borderColor = "#8a2a2a";
      buttons[i].style.background =
        "linear-gradient(180deg,#4a1a1a 0%,#3a1010 100%)";
    }
  }

  door.answered = true;

  if (isCorrect) {
    feedback.innerHTML =
      '<span style="color:#4aff4a;">✓ Correct! The door unlocks...</span>';

    setTimeout(function () {
      closeQuizUI();

      if (door.correct) {
        // Right door + right answer = proceed to stage 4
        showBadge("🌟 The path opens! Proceeding to Stage IV...");
        setTimeout(function () {
          window.location.href = "stage4.html";
        }, 1500);
      } else {
        // Wrong door but right answer = damage, door seals
        takeDamage("wrongDoor");
        showBadge("✕ Right answer, but wrong door! -1 Heart");
      }
    }, 1200);
  } else {
    feedback.innerHTML =
      '<span style="color:#ff4a4a;">✗ Wrong! The answer was: ' +
      q.options[q.correct] +
      "</span>";

    setTimeout(function () {
      closeQuizUI();
      takeDamage("quizFail");
      showBadge("✕ Wrong answer! -1 Heart");
    }, 1500);
  }
}

function closeQuizUI() {
  var overlay = document.getElementById("quiz-overlay");
  if (overlay) overlay.remove();
  currentQuiz = null;
  GS.paused = false;
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
  PL.sprinting = false;
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
  if ((JP["ShiftLeft"] || JP["ShiftRight"]) && PL.dcd <= 0 && PL.stamina >= DASH_COST && !PL.dashing) {
    PL.dashing = true;
    PL.dtmr = DASH_DUR;
    PL.ddir = PL.dir;
    PL.stamina -= DASH_COST;
    PL.dcd = DASH_CD;
    if (PL.vy > 0) PL.vy *= 0.3;
    JP["ShiftLeft"] = false;
    JP["ShiftRight"] = false;
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

  /* ── GOLDEN THREAD PICKUP ── */
  if (MAP.gold && !MAP.gold.collected && !GS.hasGold) {
    var g = MAP.gold;
    var px6 = PL.x + PL_COX,
      py6 = PL.y + PL_COY;

    // Auto-pickup on proximity (no E key needed, just walk near it)
    if (
      Math.abs(px6 + PL.w / 2 - (g.x + g.w / 2)) < 70 &&
      Math.abs(py6 + PL.h / 2 - (g.y + g.h / 2)) < 70
    ) {
      MAP.gold.collected = true;
      GS.hasGold = true;
      showBadge("✨ Golden Thread collected! Doors are now unlocked!");
      spawnGoldPtcls(g.x + g.w / 2, g.y + g.h / 2);
    }
  }
  handleThrowInput();
  updateThrowFx();


  /* ── DOOR INTERACTION ── */
  GS.activeDoorIndex = -1;
  MAP.doors.forEach(function (door, i) {
    var px7 = PL.x + PL_COX,
      py7 = PL.y + PL_COY;
    if (
      px7 < door.x + door.w + 10 &&
      px7 + PL.w > door.x - 10 &&
      py7 + PL.h > door.y &&
      py7 < door.y + door.h
    ) {
      GS.activeDoorIndex = i;

      if (JP["KeyE"]) {
        // Check if player has the golden thread
        if (!GS.hasGold) {
          showBadge("🔒 Locked! Find the Golden Thread first!");
          JP["KeyE"] = false;
          return;
        }

        // If door already answered correctly, proceed to stage 4
        if (door.answered && door.correct) {
          window.location.href = "stage4.html";
          return;
        }

        // If door already answered wrong, don't allow retry
        if (door.answered && !door.correct) {
          showBadge("✕ This door is sealed!");
          JP["KeyE"] = false;
          return;
        }

        // Assign random question if not already assigned
        if (!door.question) {
          door.question = getRandomQuestion();
        }

        // Start single question quiz for this door
        startDoorQuiz(door, i);
        JP["KeyE"] = false;
      }
    }
  });

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
  updateMobs();

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

function updateMobs() {
  if (!MAP.mobs) return;
  MAP.mobs.forEach(function (m) {
    if (m.dead) return;
    if (m.hitCooldown > 0) m.hitCooldown--;
    m.tick = (m.tick || 0) + 1;
    if (m.type === "bat") {
      m.x += m.vx;
      if (m.x < m.minX || m.x + m.w > m.maxX) {
        m.vx *= -1;
        m.x = Math.max(m.minX, Math.min(m.maxX - m.w, m.x));
      }
      m.bob = (m.bob || 0) + 0.08;
      m.y = m.baseY + Math.sin(m.bob) * 18;
    } else {
      m.x += m.vx;
      if (m.x < m.minX || m.x + m.w > m.maxX) {
        m.vx *= -1;
        m.x = Math.max(m.minX, Math.min(m.maxX - m.w, m.x));
      }
    }

    if (PL.iframes > 0) return;
    var px = PL.x + PL_COX,
      py = PL.y + PL_COY;
    var my = m.type === "rat" ? m.y - m.h : m.y;
    if (px < m.x + m.w && px + PL.w > m.x && py < my + m.h && py + PL.h > my) {
      PL.vx = px + PL.w * 0.5 < m.x + m.w * 0.5 ? -8 : 8;
      PL.vy = -8;
      takeDamage("mob");
    }
  });
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
  // This is now handled by the quiz system, but keep for compatibility
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

  if (typeof SPRITE_MINO !== "undefined") {
    img.src = SPRITE_MINO;
  } else {
    overlay.style.background = "#cc0000";
    var txt = document.createElement("div");
    txt.textContent = "YOU CHOSE WRONG";
    txt.style.cssText =
      "color:#fff;font-size:80px;font-weight:bold;font-family:serif;text-shadow:0 0 40px #ff0000;";
    overlay.appendChild(txt);
  }

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  var fl = document.getElementById("wrong-flash");
  if (fl) {
    fl.classList.add("show");
    setTimeout(function () {
      fl.classList.remove("show");
    }, 200);
  }

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

  requestAnimationFrame(function () {
    overlay.style.opacity = "1";
  });

  setTimeout(function () {
    img.style.transition = "transform 0.4s ease-out";
    img.style.transform = "scale(1.22)";
  }, 60);

  setTimeout(function () {
    overlay.style.transition = "opacity 0.35s";
    overlay.style.opacity = "0";
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      GS.jumpscareActive = false;
      GS.paused = false;
      // Don't reset everything, just damage
      takeDamage("wrongDoor");
      showBadge("✕ Wrong door! -1 Heart");
    }, 380);
  }, 1100);
}

/* ═══════════════════════════════════════════════════════════════════
   DRAW
═══════════════════════════════════════════════════════════════════ */
function cleanStageDecor() {
  if (MAP.decorBack) {
    MAP.decorBack.forEach(function (item) {
      if (!item || !item.key) return;
      if (item.key === "web") item.alpha = Math.min(item.alpha || 0.22, 0.24);
      else if (item.key.indexOf("vines") === 0) item.alpha = Math.min(item.alpha || 0.18, 0.2);
      else if (item.key.indexOf("mural") === 0) item.alpha = Math.min(item.alpha || 0.12, 0.12);
      else if (item.key === "cage") item.alpha = Math.min(item.alpha || 0.18, 0.18);
    });
  }

  if (MAP.decorFront) {
    MAP.decorFront.forEach(function (item) {
      if (!item || !item.key) return;
      if (item.key.indexOf("bones") === 0) {
        var floorLine = item.y;
        if (item.y > FLOOR_Y - item.h) floorLine = Math.min(FLOOR_Y, item.y + 8);
        item.y = floorLine - item.h + 8;
        item.alpha = Math.min(Math.max(item.alpha || 0.28, 0.28), 0.42);
      } else if (item.key === "jar") {
        item.alpha = Math.min(item.alpha || 0.76, 0.8);
      } else if (item.key === "blood") {
        item.alpha = Math.min(item.alpha || 0.2, 0.22);
      }
    });
  }
}

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
  drawThrowFx();
  drawDoors();
  drawDecorLayer(MAP.decorFront);
  drawMobs();
  drawParticles();
  drawPlayer();

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

function drawDoors() {
  MAP.doors.forEach(function (door, i) {
    if (door.x + door.w < CAM.x - 20 || door.x > CAM.x + TC.width + 20) return;
    
    var locked = !GS.hasGold;
    var lit = door.correct && GS.hasGold && !door.answered;
    var pulse = 0.7 + Math.sin(Date.now() * 0.004 + i) * 0.3;
    
    TX.save();
    
    // Shadow
    TX.fillStyle = "rgba(0,0,0,.22)";
    TX.beginPath();
    TX.ellipse(door.x + door.w / 2, door.y + door.h + 10, door.w * 0.56, 10, 0, 0, Math.PI * 2);
    TX.fill();
    
    // Base
    TX.fillStyle = "rgba(32,18,18,.88)";
    TX.fillRect(door.x - 14, door.y + door.h - 14, door.w + 28, 30);
    TX.fillStyle = "rgba(232,194,106,.18)";
    TX.fillRect(door.x - 14, door.y + door.h - 14, door.w + 28, 2);
    
    // Glow for correct/unlocked door
    if (lit) {
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
      glowG.addColorStop(0, "rgba(255,215,0," + (0.35 * pulse) + ")");
      glowG.addColorStop(1, "transparent");
      TX.fillStyle = glowG;
      TX.fillRect(door.x - 40, door.y - 20, door.w + 80, door.h + 40);
    }
    
    // Door frame/image
    var frame = SPR.decor.doorFrame;
    if (frame && frame.complete && frame.naturalWidth) {
      var cropX = frame.naturalWidth * 0.5;
      var cropW = frame.naturalWidth * 0.5;
      var cropY = frame.naturalHeight * 0.255;
      var cropH = frame.naturalHeight * 0.745;
      var drawY = door.y + 12;
      var drawH = door.h - 4;
      
      if (locked) {
        TX.globalAlpha = 0.5;
      } else if (door.answered && !door.correct) {
        TX.globalAlpha = 0.4;
      } else {
        TX.globalAlpha = lit ? pulse : 0.88;
      }
      
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
      // Fallback drawn door
      if (locked) {
        TX.fillStyle = "#2a1a0a";
      } else if (door.answered && !door.correct) {
        TX.fillStyle = "#3a1010";
      } else {
        TX.fillStyle = lit ? "#8a6a20" : "#3a2010";
      }
      
      TX.fillRect(door.x, door.y, door.w, door.h);
      TX.fillStyle = locked ? "#5a3818" : (lit ? "#ffd700" : "#5a3818");
      TX.fillRect(door.x + 4, door.y + 4, door.w - 8, door.h - 8);
      
      if (lit) {
        TX.fillStyle = "#ffd700";
        TX.font = "bold 18px serif";
        TX.textAlign = "center";
        TX.fillText("✓", door.x + door.w / 2, door.y + door.h / 2 + 6);
        TX.textAlign = "left";
      }
      
      if (locked) {
        TX.fillStyle = "#8a6a3a";
        TX.font = "bold 24px serif";
        TX.textAlign = "center";
        TX.fillText("🔒", door.x + door.w / 2, door.y + door.h / 2 + 8);
        TX.textAlign = "left";
      }
      
      TX.strokeStyle = locked ? "#4a3020" : (lit ? "#ffd700" : "#5a3818");
      TX.lineWidth = 3;
      TX.strokeRect(door.x, door.y, door.w, door.h);
    }
    
    // Labels
    TX.fillStyle = locked ? "rgba(120,100,80,0.6)" : 
                   (lit ? "rgba(255,215,0,.9)" : "rgba(212,168,67,.4)");
    TX.font = "9px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText(door.label || "EXIT", door.x + door.w / 2, door.y + door.h + 14);
    
    if (GS.activeDoorIndex === i) {
      if (locked) {
        TX.fillStyle = "rgba(255,100,100,.9)";
        TX.fillText("🔒 Need Golden Thread", door.x + door.w / 2, door.y - 8);
      } else if (!door.answered) {
        TX.fillStyle = "rgba(255,215,0,.95)";
        TX.fillText("[E] ANSWER RIDDLE", door.x + door.w / 2, door.y - 8);
      } else if (door.correct) {
        TX.fillStyle = "rgba(100,255,100,.9)";
        TX.fillText("✓ UNLOCKED", door.x + door.w / 2, door.y - 8);
      } else {
        TX.fillStyle = "rgba(255,100,100,.9)";
        TX.fillText("✕ SEALED", door.x + door.w / 2, door.y - 8);
      }
    }
    
    TX.textAlign = "left";
    TX.restore();
  });
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
  TX.fillText("DASH [SHIFT]", rs.x + rs.w / 2, rs.y - spikeH - 14);
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


function getThrowLandingY(x) {
  var best = FLOOR_Y;
  var feet = PL.y + PL.sh - 8;
  if (MAP.platforms) {
    MAP.platforms.forEach(function (p) {
      if (x >= p.x - 20 && x <= p.x + p.w + 20 && p.y >= PL.y && p.y < best) {
        best = p.y;
      }
    });
  }
  if (best < feet - 180) best = feet;
  return best;
}

function startThrownItem(icon) {
  var sx = PL.x + PL.sw / 2 + PL.dir * 28;
  var sy = PL.y + PL.sh * 0.38;
  var maxX = typeof WORLD === "number" ? WORLD - 80 : sx + PL.dir * 320;
  var tx = Math.max(80, Math.min(maxX, sx + PL.dir * 340));
  var landingY = getThrowLandingY(tx);
  GS.throwFx = {
    icon: icon || "??",
    sx: sx,
    sy: sy,
    x: sx,
    y: sy,
    tx: tx,
    ty: landingY - 34,
    t: 0,
    life: 34,
    spin: 0,
  };
  PL.throwTimer = 18;
}

function handleThrowInput() {
  if (!JP["KeyR"]) return;
  JP["KeyR"] = false;
  if (GS.throwFx) return;

  var icon = "??";
  var didThrow = false;
  if (GS.inventory && GS.inventory.length) {
    var item = GS.inventory[GS.inventory.length - 1];
    icon = item.icon || icon;
    if (typeof removeFromInventory === "function") removeFromInventory(item.id);
    else GS.inventory.pop();
    if (item.id === "goldenThread") GS.hasGold = false;
    didThrow = true;
  } else if (GS.hasGold) {
    GS.hasGold = false;
    didThrow = true;
  }

  if (!didThrow) {
    if (typeof showBadge === "function") showBadge("Inventory is empty.");
    return;
  }

  if (MAP.gold) {
    MAP.gold.collected = true;
    MAP.gold.visible = true;
  }
  if (typeof updateTutorialInventoryUI === "function") updateTutorialInventoryUI();
  if (typeof renderInventoryHUD === "function") renderInventoryHUD();
  if (typeof showBadge === "function") showBadge("Golden Thread thrown!");
  startThrownItem(icon);
}

function updateThrowFx() {
  if (PL.throwTimer > 0) PL.throwTimer--;
  var fx = GS.throwFx;
  if (!fx) return;
  fx.t++;
  fx.spin += 0.55;
  var p = Math.min(1, fx.t / fx.life);
  var ease = 1 - Math.pow(1 - p, 3);
  fx.x = fx.sx + (fx.tx - fx.sx) * ease;
  fx.y = fx.sy + (fx.ty - fx.sy) * ease - Math.sin(p * Math.PI) * 120;

  if (p >= 1) {
    if (MAP.gold) {
      MAP.gold.x = fx.tx - MAP.gold.w / 2;
      MAP.gold.y = getThrowLandingY(fx.tx) - Math.max(64, MAP.gold.h * 0.68);
      MAP.gold.collected = false;
      MAP.gold.visible = true;
      MAP.gold.bobTimer = 0;
      if (typeof spawnGoldPtcls === "function") spawnGoldPtcls(MAP.gold.x + MAP.gold.w / 2, MAP.gold.y + MAP.gold.h / 2);
    }
    GS.throwFx = null;
  }
}

function drawThrowFx() {
  if (PL.throwTimer > 0) {
    var k = PL.throwTimer / 18;
    var handX = PL.x + PL.sw / 2 + PL.dir * 24;
    var handY = PL.y + PL.sh * 0.4;
    TX.save();
    TX.globalAlpha = 0.25 + k * 0.5;
    TX.strokeStyle = "rgba(240,209,138,.9)";
    TX.lineWidth = 2 + k * 3;
    TX.lineCap = "round";
    TX.beginPath();
    TX.moveTo(handX - PL.dir * 18, handY + 16);
    TX.quadraticCurveTo(handX + PL.dir * 18, handY - 6, handX + PL.dir * 52, handY - 18);
    TX.stroke();
    TX.restore();
  }

  var fx = GS.throwFx;
  if (!fx) return;
  TX.save();
  TX.globalAlpha = 0.35;
  TX.strokeStyle = "rgba(240,209,138,.75)";
  TX.lineWidth = 3;
  TX.lineCap = "round";
  TX.beginPath();
  TX.moveTo(fx.sx, fx.sy);
  TX.quadraticCurveTo((fx.sx + fx.x) / 2, Math.min(fx.sy, fx.y) - 64, fx.x, fx.y);
  TX.stroke();
  TX.globalAlpha = 1;
  TX.shadowBlur = 18;
  TX.shadowColor = "rgba(255,215,0,.9)";
  TX.translate(fx.x, fx.y);
  TX.rotate(fx.spin);
  TX.font = "24px serif";
  TX.textAlign = "center";
  TX.textBaseline = "middle";
  TX.fillText(fx.icon, 0, 0);
  TX.restore();
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

/* ── GOLDEN THREAD PICKUP ── */
if (MAP.gold && !MAP.gold.collected && !GS.hasGold) {
  var g = MAP.gold;
  var px6 = PL.x + PL_COX,
    py6 = PL.y + PL_COY;

  // Auto-pickup on proximity (no E key needed, just walk near it)
  if (
    Math.abs(px6 + PL.w / 2 - (g.x + g.w / 2)) < 70 &&
    Math.abs(py6 + PL.h / 2 - (g.y + g.h / 2)) < 70
  ) {
    MAP.gold.collected = true;
    GS.hasGold = true;
    showBadge("✨ Golden Thread collected! Doors are now unlocked!");
    spawnGoldPtcls(g.x + g.w / 2, g.y + g.h / 2);
  }
}

function drawMobs() {
  if (!MAP.mobs) return;
  MAP.mobs.forEach(function (m) {
    if (m.dead) return;
    var drawY = m.type === "rat" ? m.y - m.h : m.y;
    if (m.x + m.w < CAM.x - 40 || m.x > CAM.x + TC.width + 40) return;

    TX.save();
    if (m.vx < 0) {
      TX.translate(m.x + m.w, drawY);
      TX.scale(-1, 1);
      var dx = 0;
    } else {
      TX.translate(m.x, drawY);
      var dx = 0;
    }

    if (m.type === "rat" && SPR.rat && SPR.rat.length) {
      var frame = SPR.rat[Math.floor((m.tick || 0) / 8) % SPR.rat.length];
      if (frame && frame.complete && frame.naturalWidth) {
        TX.drawImage(frame, dx, 0, m.w, m.h);
      } else {
        TX.fillStyle = "#7c6450";
        TX.fillRect(dx, 0, m.w, m.h);
      }
    } else if (
      m.type === "bat" &&
      SPR.bat &&
      SPR.bat.complete &&
      SPR.bat.naturalWidth
    ) {
      TX.drawImage(SPR.bat, dx, 0, m.w, m.h);
    } else {
      TX.fillStyle = m.type === "bat" ? "#5a485e" : "#7c6450";
      TX.fillRect(dx, 0, m.w, m.h);
    }
    TX.restore();
  });
}

function drawParticles() {
  GS.ptcls.forEach(function (p) {
    TX.save();
    if (p.type === "dash") {
      TX.globalAlpha = p.life * 0.44;
      TX.strokeStyle = p.col;
      TX.lineWidth = p.sz;
      TX.lineCap = "round";
      TX.beginPath();
      TX.moveTo(p.x, p.y);
      TX.lineTo(p.x - p.vx * (p.len || 6), p.y - p.vy * (p.len || 6));
      TX.stroke();
    } else {
      TX.globalAlpha = p.life * 0.75;
      TX.fillStyle = p.col;
      TX.shadowBlur = 5;
      TX.shadowColor = p.col;
      TX.fillRect(p.x - p.sz / 2, p.y - p.sz / 2, p.sz, p.sz);
    }
    TX.restore();
  });
}

function drawPlayer() {
  var img = null;
  if (PL.dashing && SPR.run.length) {
    img = SPR.run[PL.frame % Math.max(SPR.run.length, 1)];
  } else if (!PL.grounded && SPR.jump.length) {
    img = SPR.jump[Math.min(PL.frame, Math.max(SPR.jump.length - 1, 0))];
  } else if (!PL.moving) {
    img = PL.ifrm === 0 ? SPR.idle : SPR.idle2;
  } else if (PL.sprinting) {
    img = SPR.run[PL.frame % Math.max(SPR.run.length, 1)];
  } else {
    img = SPR.walk[PL.frame % Math.max(SPR.walk.length, 1)];
  }

  if (!GS.deathFx && PL.iframes > 0 && Math.floor(PL.iframes / 5) % 2 === 0)
    return; // flicker

  TX.save();

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

    TX.restore();
    return;
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

  if (PL.dashing && img && img.complete && img.naturalWidth) {
    for (var trail = 3; trail >= 1; trail--) {
      var ghostX = PL.x - PL.ddir * trail * 14;
      TX.save();
      TX.globalAlpha = 0.1 + (4 - trail) * 0.055;
      TX.shadowBlur = 10;
      TX.shadowColor = "rgba(212,168,67,.42)";
      if (PL.dir === -1) {
        TX.translate(ghostX + PL.sw, PL.y);
        TX.scale(-1, 1);
        TX.drawImage(img, 0, 0, PL.sw, PL.sh);
      } else {
        TX.drawImage(img, ghostX, PL.y, PL.sw, PL.sh);
      }
      TX.restore();
    }
  }

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
      vx: -PL.ddir * (Math.random() * 3.2 + 2.2),
      vy: (Math.random() - 0.5) * 0.8,
      life: 1,
      dec: 0.1 + Math.random() * 0.05,
      sz: Math.random() * 3 + 2,
      len: Math.random() * 4 + 7,
      col: Math.random() < 0.5 ? "#d4a843" : "#8a5a28",
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
        return service.markStageComplete(3);
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
