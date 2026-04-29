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
// Stage II stretches through a reworked webbed route with tighter staggered jumps.
var WORLD = 8450;
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
  var mezzY = FLOOR_Y - TILE * 0.7;
  var loftY = FLOOR_Y - TILE * 1.75;
  var galleryY = FLOOR_Y - TILE * 2.8;
  var lowerY = FLOOR_Y + TILE * 3.2;
  var rise1Y = FLOOR_Y + TILE * 2.2;
  var rise2Y = FLOOR_Y + TILE * 1.2;
  var rise3Y = FLOOR_Y + TILE * 0.2;

  MAP.platforms = [
    { x: 0, y: FLOOR_Y, w: 640, h: ph },
    { x: 790, y: mezzY, w: 260, h: TILE },
    { x: 1160, y: loftY, w: 300, h: TILE },
    { x: 1580, y: galleryY, w: 280, h: TILE },
    { x: 1985, y: loftY, w: 300, h: TILE },
    { x: 2405, y: mezzY, w: 240, h: TILE },
    { x: 2760, y: loftY, w: 420, h: TILE },
    { x: 3330, y: FLOOR_Y, w: 290, h: ph },
    { x: 3820, y: lowerY, w: 430, h: ph },
    { x: 4380, y: lowerY, w: 320, h: ph },
    { x: 4850, y: lowerY, w: 430, h: ph },
    { x: 5420, y: rise1Y, w: 220, h: TILE },
    { x: 5710, y: rise2Y, w: 200, h: TILE },
    { x: 6000, y: rise3Y, w: 260, h: TILE },
    { x: 6350, y: loftY, w: 390, h: TILE },
    { x: 6890, y: mezzY, w: 260, h: TILE },
    { x: 7280, y: FLOOR_Y, w: 1090, h: ph },
  ];

  MAP.obstacle = null;
  MAP.plates = [];

  /* ── STAGE II SMALL SPIKE CHECKS ── */
  MAP.spikes = [
    { x: 3000, y: loftY, w: 96, triggerX: 2870, active: false, riseTimer: 0 },
    { x: 4510, y: lowerY, w: 64, triggerX: 4420, active: false, riseTimer: 0 },
  ];

  /* ── SHAFT ── */
  MAP.shaft = {
    x: 3470,
    y: FLOOR_Y + ph,
    w: 180,
    bottom: lowerY,
  };

  MAP.readySpike = null;
  MAP.hammer = null;

  /* ── GOLDEN THREAD KEY ── */
  MAP.gold = {
    x: 1200,
    y: galleryY - 70,
    w: 48,
    h: 48,
    collected: false,
    bobTimer: 0,
  };

  /* ── STAGE II EXIT — 3 DOORS (2 fake, 1 real) ── */
  var dW = 118,
    dH = 154;
  var doorY = FLOOR_Y - dH;

  // Randomly assign which door is correct (0, 1, or 2)
  var correctDoorIndex = Math.floor(Math.random() * 3);

  MAP.doors = [
    {
      x: 2400, // scattered: mid-left area
      y: loftY - dH,
      w: dW,
      h: dH,
      correct: correctDoorIndex === 0,
      fake: correctDoorIndex !== 0,
      label: correctDoorIndex === 0 ? "???" : "DOOR I",
      hint: "The true path lies where shadows gather near the climb.",
    },
    {
      x: 5200, // scattered: lower area
      y: lowerY - dH,
      w: dW,
      h: dH,
      correct: correctDoorIndex === 1,
      fake: correctDoorIndex !== 1,
      label: correctDoorIndex === 1 ? "???" : "DOOR II",
      hint: "Seek the threshold where the bones whisper warnings.",
    },
    {
      x: 7800, // scattered: near end
      y: doorY,
      w: dW,
      h: dH,
      correct: correctDoorIndex === 2,
      fake: correctDoorIndex !== 2,
      label: correctDoorIndex === 2 ? "???" : "DOOR III",
      hint: "The exit breathes where the thread of gold was spun.",
    },
  ];

  // Store correct index for hint system
  MAP.correctDoorIndex = correctDoorIndex;

  // Track which doors have been attempted
  MAP.doors.forEach(function (d) {
    d.attempted = false;
  });

  MAP.doorFrameRect = null;

  MAP.decorBack = [
    { key: "cage", x: 168, y: FLOOR_Y - 268, w: 110, h: 90, alpha: 0.18 },
    { key: "web", x: 352, y: FLOOR_Y - 258, w: 142, h: 52, alpha: 0.28 },
    {
      key: "vinesGreenWide",
      x: 540,
      y: FLOOR_Y - 228,
      w: 174,
      h: 58,
      alpha: 0.15,
    },
    {
      key: "muralShade",
      x: 760,
      y: FLOOR_Y - 292,
      w: 198,
      h: 154,
      alpha: 0.12,
    },
    { key: "web", x: 1110, y: loftY - 92, w: 122, h: 44, alpha: 0.22 },
    { key: "vinesRed3", x: 1320, y: loftY - 130, w: 84, h: 244, alpha: 0.24 },
    { key: "web", x: 1568, y: galleryY - 102, w: 144, h: 52, alpha: 0.34 },
    { key: "web", x: 1885, y: galleryY - 96, w: 130, h: 48, alpha: 0.24 },
    { key: "vinesGreen", x: 2060, y: loftY - 112, w: 86, h: 30, alpha: 0.18 },
    { key: "writing", x: 2320, y: loftY - 188, w: 148, h: 64, alpha: 0.18 },
    { key: "web", x: 2630, y: loftY - 88, w: 122, h: 44, alpha: 0.24 },
    { key: "web", x: 3010, y: loftY - 98, w: 136, h: 48, alpha: 0.28 },
    { key: "web", x: 3390, y: FLOOR_Y - 250, w: 146, h: 54, alpha: 0.22 },
    {
      key: "vinesGreenWide",
      x: 3650,
      y: FLOOR_Y - 238,
      w: 166,
      h: 54,
      alpha: 0.16,
    },
    { key: "web", x: 3960, y: lowerY - 108, w: 132, h: 46, alpha: 0.3 },
    { key: "muralLady", x: 4140, y: lowerY - 198, w: 130, h: 108, alpha: 0.13 },
    {
      key: "vinesGreenWide",
      x: 4460,
      y: lowerY - 234,
      w: 176,
      h: 58,
      alpha: 0.16,
    },
    { key: "web", x: 4740, y: lowerY - 110, w: 124, h: 42, alpha: 0.28 },
    { key: "cage", x: 5035, y: lowerY - 266, w: 112, h: 92, alpha: 0.2 },
    { key: "writing", x: 5205, y: lowerY - 260, w: 154, h: 66, alpha: 0.2 },
    { key: "web", x: 5450, y: rise1Y - 92, w: 126, h: 44, alpha: 0.24 },
    { key: "web", x: 5735, y: rise2Y - 90, w: 122, h: 42, alpha: 0.24 },
    { key: "vinesRed4", x: 5950, y: rise3Y - 204, w: 92, h: 250, alpha: 0.24 },
    { key: "web", x: 6310, y: loftY - 94, w: 138, h: 50, alpha: 0.3 },
    {
      key: "muralSeeker",
      x: 6555,
      y: FLOOR_Y - 286,
      w: 178,
      h: 140,
      alpha: 0.13,
    },
    {
      key: "vinesGreenWide",
      x: 6845,
      y: mezzY - 154,
      w: 180,
      h: 60,
      alpha: 0.18,
    },
    { key: "web", x: 7070, y: mezzY - 86, w: 120, h: 42, alpha: 0.22 },
    { key: "web", x: 7395, y: FLOOR_Y - 242, w: 134, h: 48, alpha: 0.22 },
    {
      key: "vinesGreenWide",
      x: 7640,
      y: FLOOR_Y - 232,
      w: 170,
      h: 56,
      alpha: 0.16,
    },
    { key: "web", x: 7920, y: FLOOR_Y - 240, w: 138, h: 50, alpha: 0.24 },
    { key: "web", x: 8195, y: FLOOR_Y - 238, w: 126, h: 44, alpha: 0.2 },
  ];

  MAP.decorFront = [
    { key: "jar", x: 920, y: mezzY - 54, w: 58, h: 68, alpha: 0.78 },
    { key: "bonesSmall", x: 2940, y: loftY - 6, w: 76, h: 34, alpha: 0.22 },
    { key: "bonesWide", x: 4070, y: lowerY + 8, w: 118, h: 56, alpha: 0.24 },
    { key: "jar", x: 5185, y: lowerY - 58, w: 62, h: 72, alpha: 0.82 },
    { key: "bonesSmall", x: 5970, y: rise3Y - 6, w: 78, h: 34, alpha: 0.2 },
    { key: "blood", x: 6720, y: FLOOR_Y - 112, w: 112, h: 66, alpha: 0.22 },
    { key: "clueMarker", x: 7430, y: FLOOR_Y - 210, w: 72, h: 44, alpha: 0.68 },
    { key: "bonesHuge", x: 7880, y: FLOOR_Y - 18, w: 150, h: 96, alpha: 0.3 },
  ];
  cleanStageDecor();

  MAP.roomLights = [
    { x: 30, y: FLOOR_Y - 280, w: 920, h: 350, glow: 0.08 },
    { x: 1060, y: FLOOR_Y - 330, w: 2250, h: 410, glow: 0.1 },
    { x: 3820, y: lowerY - 220, w: 1600, h: 360, glow: 0.11 },
    { x: 6230, y: FLOOR_Y - 280, w: 1120, h: 340, glow: 0.09 },
    { x: 7300, y: FLOOR_Y - 260, w: 1180, h: 330, glow: 0.1 },
  ];

  MAP.roomColumns = [
    { x: 710, y: 120, w: 22, h: FLOOR_Y - 28, alpha: 0.11 },
    { x: 2280, y: 126, w: 22, h: FLOOR_Y - 22, alpha: 0.12 },
    { x: 4630, y: 138, w: 22, h: lowerY - 34, alpha: 0.13 },
    { x: 6510, y: 120, w: 24, h: FLOOR_Y - 26, alpha: 0.11 },
    { x: 8010, y: 120, w: 24, h: FLOOR_Y - 24, alpha: 0.13 },
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

/* ── DROPPED ITEMS SYSTEM ── */
var DROPPED_ITEMS = []; // Array of {x, y, type, bobTimer, active}

function spawnDroppedItem(x, y, type) {
  DROPPED_ITEMS.push({
    x: x,
    y: y,
    type: type, // "gold"
    bobTimer: Math.random() * Math.PI * 2,
    active: true,
    spawnTime: Date.now(),
  });
}

function clearDroppedItems() {
  DROPPED_ITEMS = [];
}

function drawDroppedItems() {
  DROPPED_ITEMS.forEach(function (item) {
    if (!item.active) return;
    if (item.x < CAM.x - 60 || item.x > CAM.x + TC.width + 60) return;

    item.bobTimer += 0.05;
    var bob = Math.sin(item.bobTimer) * 6;
    var ix = item.x,
      iy = item.y + bob;

    // Glow
    var gl = TX.createRadialGradient(ix, iy, 2, ix, iy, 35);
    gl.addColorStop(0, "rgba(255,215,0,.35)");
    gl.addColorStop(1, "transparent");
    TX.fillStyle = gl;
    TX.fillRect(ix - 40, iy - 40, 80, 80);

    var itemImg = SPR.gold || SPR.decor.threadPaper;
    if (itemImg && itemImg.complete && itemImg.naturalWidth) {
      TX.drawImage(itemImg, ix - 20, iy - 20, 40, 40);
    } else {
      TX.save();
      TX.shadowBlur = 15;
      TX.shadowColor = "#ffd700";
      TX.fillStyle = "#ffd700";
      TX.beginPath();
      TX.arc(ix, iy, 14, 0, Math.PI * 2);
      TX.fill();
      TX.fillStyle = "#ffaa00";
      TX.beginPath();
      TX.arc(ix, iy, 10, 0, Math.PI * 2);
      TX.fill();
      TX.restore();
    }

    // Label
    TX.fillStyle = "rgba(255,215,0,.7)";
    TX.font = "bold 9px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText("Dropped Key", ix, iy - 22);
    TX.fillText("[E] Pick up", ix, iy - 12);
    TX.textAlign = "left";
  });
}

function checkDroppedItemPickup() {
  if (GS.hasGold) return; // Already has gold

  for (var i = DROPPED_ITEMS.length - 1; i >= 0; i--) {
    var item = DROPPED_ITEMS[i];
    if (!item.active) continue;

    var px = PL.x + PL_COX + PL.w / 2;
    var py = PL.y + PL_COY + PL.h / 2;
    var dist = Math.hypot(px - item.x, py - item.y);

    if (dist < 60 || (JP["KeyE"] && dist < 100)) {
      // Pick up
      item.active = false;
      GS.hasGold = true;
      showBadge("✨ Golden Thread recovered!");
      spawnGoldPtcls(item.x, item.y);
      JP["KeyE"] = false;
      break;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   TUTORIAL STEPS
═══════════════════════════════════════════════════════════════════ */
var STEPS = [
  {
    icon: "🏛",
    title: "Webbed Galleries",
    desc: "Stage II keeps the same chamber language as Stage I, but the route now breaks into staggered ledges and tighter reads.",
    keys: ["D → Advance", "W / Space → Jump"],
    trigger: function () {
      return PL.x > 640;
    },
  },
  {
    icon: "⚖",
    title: "Split Route",
    desc: "Cross the lofted openings and keep your rhythm. The early room now asks for cleaner jump spacing than Stage I.",
    keys: ["Jump the breaks"],
    trigger: function () {
      return PL.x > 1500;
    },
  },
  {
    icon: "⚠",
    title: "Watch the Floor",
    desc: "Small spike groups now guard both the upper lane and the recovery floor. Read them early and keep moving.",
    keys: ["Read proximity traps"],
    trigger: function () {
      return PL.x > 2200;
    },
  },
  {
    icon: "💨",
    title: "Drop and Recover",
    desc: "The gallery drops into a lower recovery path. Land cleanly, cross the second spike read, then climb back to the main floor.",
    keys: ["Recover from the shaft"],
    trigger: function () {
      return PL.x > 4800;
    },
  },
  {
    icon: "🚪",
    title: "Exit Hall",
    desc: "The final corridor opens into a single gate. Clear the last span and close the chamber behind you.",
    keys: ["Reach the exit"],
    trigger: function () {
      return PL.x > 7400;
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MATH QUIZ SYSTEM
═══════════════════════════════════════════════════════════════════ */
var QUIZ_QUESTIONS = [
  {
    q: "What is 17 × 4?",
    choices: ["58", "68", "72", "64"],
    answer: 1, // index of correct choice (68)
    hint: "10×4 = 40, 7×4 = 28, 40+28 = 68",
  },
  {
    q: "Solve: 144 ÷ 12",
    choices: ["10", "11", "12", "14"],
    answer: 2,
    hint: "12 × 12 = 144",
  },
  {
    q: "What is 8² + 6²?",
    choices: ["100", "96", "110", "98"],
    answer: 0,
    hint: "64 + 36 = 100",
  },
  {
    q: "If 3x + 7 = 22, what is x?",
    choices: ["4", "5", "6", "7"],
    answer: 1,
    hint: "3x = 15, so x = 5",
  },
  {
    q: "What is the remainder when 97 is divided by 8?",
    choices: ["0", "1", "2", "3"],
    answer: 1,
    hint: "8 × 12 = 96, 97 − 96 = 1",
  },
  {
    q: "Simplify: (15 + 9) ÷ 4 × 2",
    choices: ["10", "12", "8", "14"],
    answer: 1,
    hint: "24 ÷ 4 = 6, 6 × 2 = 12",
  },
];

function getRandomQuestion() {
  var idx = Math.floor(Math.random() * QUIZ_QUESTIONS.length);
  return QUIZ_QUESTIONS[idx];
}

function buildQuizModal() {
  // Create modal if it doesn't exist
  if (document.getElementById("quiz-modal")) return;

  var modal = document.createElement("div");
  modal.id = "quiz-modal";
  modal.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9000",
    "display:none",
    "align-items:center",
    "justify-content:center",
    "background:rgba(0,0,0,0.85)",
    "backdrop-filter:blur(4px)",
  ].join(";");

  var card = document.createElement("div");
  card.id = "quiz-card";
  card.style.cssText = [
    "background:linear-gradient(180deg,#1a1210 0%,#0d0908 100%)",
    "border:2px solid #d4a843",
    "border-radius:8px",
    "padding:32px 28px",
    "max-width:420px",
    "width:90%",
    "box-shadow:0 0 40px rgba(212,168,67,0.25), inset 0 1px 0 rgba(255,255,255,0.06)",
    "text-align:center",
    "font-family:Cinzel,serif",
  ].join(";");

  var title = document.createElement("div");
  title.id = "quiz-title";
  title.textContent = "🔒 THE LABYRINTH ASKS";
  title.style.cssText = [
    "color:#d4a843",
    "font-size:18px",
    "font-weight:bold",
    "margin-bottom:20px",
    "letter-spacing:1px",
  ].join(";");

  var question = document.createElement("div");
  question.id = "quiz-question";
  question.style.cssText = [
    "color:#e8dcc8",
    "font-size:16px",
    "margin-bottom:24px",
    "line-height:1.5",
    "min-height:48px",
  ].join(";");

  var choicesDiv = document.createElement("div");
  choicesDiv.id = "quiz-choices";
  choicesDiv.style.cssText = [
    "display:flex",
    "flex-direction:column",
    "gap:10px",
    "margin-bottom:20px",
  ].join(";");

  var feedback = document.createElement("div");
  feedback.id = "quiz-feedback";
  feedback.style.cssText = [
    "color:#ff6644",
    "font-size:13px",
    "min-height:20px",
    "margin-bottom:12px",
    "font-style:italic",
  ].join(";");

  var hintDiv = document.createElement("div");
  hintDiv.id = "quiz-hint";
  hintDiv.style.cssText = [
    "color:#88bb88",
    "font-size:12px",
    "min-height:18px",
    "display:none",
    "font-style:italic",
    "border-top:1px solid rgba(212,168,67,0.2)",
    "padding-top:10px",
    "margin-top:10px",
  ].join(";");

  card.appendChild(title);
  card.appendChild(question);
  card.appendChild(choicesDiv);
  card.appendChild(feedback);
  card.appendChild(hintDiv);
  modal.appendChild(card);
  document.body.appendChild(modal);
}

function showQuizModal(doorIndex) {
  buildQuizModal();
  var modal = document.getElementById("quiz-modal");
  var questionEl = document.getElementById("quiz-question");
  var choicesEl = document.getElementById("quiz-choices");
  var feedbackEl = document.getElementById("quiz-feedback");
  var hintEl = document.getElementById("quiz-hint");

  // Pick one random question
  var qData = getRandomQuestion();
  GS.currentQuiz = {
    doorIndex: doorIndex,
    data: qData,
    answered: false,
  };

  questionEl.textContent = qData.q;
  feedbackEl.textContent = "";
  hintEl.style.display = "none";
  hintEl.textContent = "";
  choicesEl.innerHTML = "";

  qData.choices.forEach(function (choice, idx) {
    var btn = document.createElement("button");
    btn.textContent = choice;
    btn.style.cssText = [
      "background:linear-gradient(180deg,#2a1e18 0%,#1a1210 100%)",
      "border:1px solid #5a3a20",
      "color:#d4c4a8",
      "padding:12px 16px",
      "border-radius:4px",
      "cursor:pointer",
      "font-family:Cinzel,serif",
      "font-size:14px",
      "transition:all 0.15s",
      "width:100%",
    ].join(";");

    btn.onmouseenter = function () {
      btn.style.borderColor = "#d4a843";
      btn.style.background = "linear-gradient(180deg,#3a2a20 0%,#2a1e18 100%)";
    };
    btn.onmouseleave = function () {
      btn.style.borderColor = "#5a3a20";
      btn.style.background = "linear-gradient(180deg,#2a1e18 0%,#1a1210 100%)";
    };

    btn.onclick = function () {
      if (GS.currentQuiz.answered) return;
      handleQuizAnswer(idx);
    };

    choicesEl.appendChild(btn);
  });

  modal.style.display = "flex";
  GS.paused = true;
}

function handleQuizAnswer(choiceIndex) {
  if (!GS.currentQuiz) return;
  var quiz = GS.currentQuiz;
  var feedbackEl = document.getElementById("quiz-feedback");
  var hintEl = document.getElementById("quiz-hint");
  var choicesEl = document.getElementById("quiz-choices");

  quiz.answered = true;

  // Disable all buttons
  var buttons = choicesEl.querySelectorAll("button");
  buttons.forEach(function (btn, idx) {
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.6";
    if (idx === quiz.data.answer) {
      btn.style.borderColor = "#44aa44";
      btn.style.background = "linear-gradient(180deg,#1a3018 0%,#102010 100%)";
      btn.style.color = "#88ff88";
    }
  });

  if (choiceIndex === quiz.data.answer) {
    // CORRECT — proceed to next stage
    feedbackEl.textContent = "✓ Correct! The door yields...";
    feedbackEl.style.color = "#88ff88";

    setTimeout(function () {
      closeQuizModal();
      GS.won = true;
      showScreen("screen-win");
    }, 1200);
  } else {
    // WRONG — 1 heart damage + hint
    feedbackEl.textContent = "✗ Wrong! The labyrinth tightens its grip...";
    feedbackEl.style.color = "#ff6644";

    // Show hint about correct door
    hintEl.textContent =
      "💡 Hint: " +
      quiz.data.hint +
      " | " +
      MAP.doors[MAP.correctDoorIndex].hint;
    hintEl.style.display = "block";

    // Damage
    setTimeout(function () {
      closeQuizModal();
      takeDamage("quiz");
      MAP.doors[quiz.doorIndex].attempted = true;
    }, 2200);
  }
}

function closeQuizModal() {
  var modal = document.getElementById("quiz-modal");
  if (modal) modal.style.display = "none";
  GS.paused = false;
  GS.currentQuiz = null;
}

/* ═══════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════ */
async function tutInit() {
  TC = document.getElementById("tutCanvas");
  TX = TC.getContext("2d");
  tutResize();
  window.addEventListener("resize", tutResize);
  buildHUD();
  buildQuizModal();
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
  // Don't reset hasGold here — dropped items persist until picked up or void death
  GS.activeDoorIndex = -1;
}

function resetToStart() {
  // Reset all traps
  // Re-randomize correct door on reset
  if (MAP.doors && MAP.doors.length === 3) {
    var newCorrect = Math.floor(Math.random() * 3);
    MAP.correctDoorIndex = newCorrect;
    MAP.doors.forEach(function (d, i) {
      d.correct = i === newCorrect;
      d.fake = i !== newCorrect;
      d.label = i === newCorrect ? "???" : "DOOR " + ["I", "II", "III"][i];
      d.attempted = false;
    });
  }

  // Clear quiz state
  GS.currentQuiz = null;
  closeQuizModal();
  if (MAP.hammer) {
    MAP.hammer.angle = 0;
    MAP.hammer.swingTimer = 0;
    MAP.hammer.hitCooldown = 0;
  }
  // Clear dropped items on full reset
  clearDroppedItems();
  GS.hasGold = false;
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
  if (MAP.gold && !MAP.gold.collected && !GS.hasGold) {
    var g = MAP.gold;
    var px6 = PL.x + PL_COX,
      py6 = PL.y + PL_COY;
    if (
      JP["KeyE"] ||
      (Math.abs(px6 + PL.w / 2 - (g.x + g.w / 2)) < 80 &&
        Math.abs(py6 + PL.h / 2 - (g.y + g.h / 2)) < 80 &&
        (JP["KeyE"] || KEYS["KeyE"]))
    ) {
      // Auto-pickup on proximity
      if (
        Math.abs(px6 + PL.w / 2 - (g.x + g.w / 2)) < 70 &&
        Math.abs(py6 + PL.h / 2 - (g.y + g.h / 2)) < 70
      ) {
        MAP.gold.collected = true;
        GS.hasGold = true;
        showBadge("✨ Golden Thread collected!");
        spawnGoldPtcls(g.x + g.w / 2, g.y + g.h / 2);
      }
    }
  }
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
        if (!GS.hasGold) {
          showBadge("🔒 Locked! Find the Golden Thread first...");
          JP["KeyE"] = false;
          /* ── DROPPED ITEM PICKUP ── */
          checkDroppedItemPickup();
          return;
        }

        if (door.fake) {
          // Wrong door — jumpscare + reset
          wrongDoor();
        } else {
          // Right door — quiz time
          showQuizModal(i);
        }
        JP["KeyE"] = false;
      }
    }
  });
  JP["KeyE"] = false;

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

function takeDamage(source) {
  if (PL.iframes > 0) return;

  if (source === "void") {
    // VOID DEATH: respawn items, reset lives, no item drop
    GS.lives = 0;
    PL.iframes = 0;

    // Clear any previously dropped items (they respawn at original location)
    clearDroppedItems();

    // Reset gold to map spawn location (respawn)
    if (MAP.gold) {
      MAP.gold.collected = false;
    }
    GS.hasGold = false;

    updateHUD();
    startDeathSequence(source);
    return;
  }

  // NORMAL DEATH (spike, hammer, quiz wrong): drop items where player died
  if (GS.hasGold && MAP.gold) {
    // Drop the gold at player's death location
    spawnDroppedItem(PL.x + PL.sw / 2, PL.y + PL.sh * 0.5, "gold");
    MAP.gold.collected = true; // Mark original as gone
    GS.hasGold = false;
    showBadge("💔 Golden Thread dropped!");
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
  drawDroppedItems();
  drawDoors();
  drawDecorLayer(MAP.decorFront);
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

function drawDoors() {
  MAP.doors.forEach(function (door, i) {
    if (door.x + door.w < CAM.x - 20 || door.x > CAM.x + TC.width + 20) return;
    // Only the CORRECT door glows when player has the gold key
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
    // Glow for correct door — golden ethereal aura
    if (lit) {
      TX.save();
      TX.shadowBlur = 40 + 10 * Math.sin(Date.now() * 0.006);
      TX.shadowColor = "rgba(255,215,0,0.6)";
      var glowG = TX.createRadialGradient(
        door.x + door.w / 2,
        door.y + door.h / 2,
        5,
        door.x + door.w / 2,
        door.y + door.h / 2,
        100 + 15 * Math.sin(Date.now() * 0.003),
      );
      glowG.addColorStop(
        0,
        "rgba(255,215,0," + (0.25 + 0.1 * Math.sin(Date.now() * 0.005)) + ")",
      );
      glowG.addColorStop(
        0.4,
        "rgba(255,180,60," + (0.12 + 0.06 * Math.sin(Date.now() * 0.004)) + ")",
      );
      glowG.addColorStop(1, "transparent");
      TX.fillStyle = glowG;
      TX.fillRect(door.x - 60, door.y - 40, door.w + 120, door.h + 80);

      // Floating sparkles around correct door
      var sparkleCount = 5;
      for (var spk = 0; spk < sparkleCount; spk++) {
        var spkAngle = Date.now() * 0.002 + (spk / sparkleCount) * Math.PI * 2;
        var spkRadius = 50 + 20 * Math.sin(Date.now() * 0.003 + spk);
        var spkX = door.x + door.w / 2 + Math.cos(spkAngle) * spkRadius;
        var spkY = door.y + door.h / 2 + Math.sin(spkAngle) * spkRadius * 0.6;
        var spkAlpha = 0.4 + 0.4 * Math.sin(Date.now() * 0.005 + spk);
        TX.fillStyle = "rgba(255,230,150," + spkAlpha + ")";
        TX.beginPath();
        TX.arc(
          spkX,
          spkY,
          2 + Math.sin(Date.now() * 0.007 + spk),
          0,
          Math.PI * 2,
        );
        TX.fill();
      }

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
    TX.fillStyle = door.correct ? "rgba(255,215,0,.9)" : "rgba(212,168,67,.4)";
    TX.font = "9px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText(
      door.label || "EXIT",
      door.x + door.w / 2,
      door.y + door.h + 14,
    );
    if (GS.activeDoorIndex === i) {
      TX.fillStyle = "rgba(255,215,0,.95)";
      if (!GS.hasGold) {
        TX.fillText("🔒 NEED KEY", door.x + door.w / 2, door.y - 8);
      } else if (door.attempted) {
        TX.fillText("[E] RETRY", door.x + door.w / 2, door.y - 8);
      } else {
        TX.fillText("[E] ENTER", door.x + door.w / 2, door.y - 8);
      }
    }
    TX.textAlign = "left";
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
        return service.markStageComplete(2);
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
