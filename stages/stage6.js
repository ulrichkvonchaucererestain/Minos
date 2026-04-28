/* ═══════════════════════════════════════════════════════════════════
   LABYRINTH OF MINOS — STAGE VI   stage6.js
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
var PX = 3.0;
var SPR_MULT = 1.22;
var JUMP_V = -13.5;
var GRAV = 0.58;
var FRIC = 0.8;
var DASH_COST = 28,
  DASH_SPD = 15,
  DASH_DUR = 13,
  DASH_CD = 52;
var STAM_MAX = 100,
  STAM_DRAIN = 0.55,
  STAM_REGEN = 0.3,
  STAM_MIN = 15;

/* ── WORLD DIMENSIONS ──────────────────────────────────────────── */
var WORLD = 9100;
var TILE = 48;

/* ── PLAYER ─────────────────────────────────────────────────────── */
var PL = {
  type: "player",
  x: 0, y: 0, vx: 0, vy: 0,
  w: 34, h: 68,
  sw: 80, sh: 80,
  dir: 1,
  grounded: false,
  state: "idle",
  moving: false,
  sprinting: false,
  dashing: false,
  dtmr: 0, dcd: 0, ddir: 1,
  stamina: 100,
  frame: 0, atick: 0,
  alive: true,
};
var PL_COX, PL_COY;

/* ── SPRITES ─────────────────────────────────────────────────────── */
var SPR = {
  idle: null, idle2: null,
  walk: [], run: [], jump: [],
  door1: null, door2: null,
  hammerLeft: [], hammerRight: [],
  gold: null, spike: null,
  decor: {}, torch: null,
  mapTheme: { map: null, roof: null, fall: null },
  rat: [], bat: null,
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
  { x: 0.5,  y: 0.1  },
  { x: 0.38, y: 0.14 },
];
var DECOR_PATHS = {
  banner:      "../adds_assets/banner.png",
  cage:        "../adds_assets/birdcage.png",
  blood:       "../adds_assets/blood_splatter.png",
  writing:     "../adds_assets/blood_writing_(run).png",
  bossRoom:    "../adds_assets/boss_room.png",
  clue:        "../adds_assets/clue2.png",
  doorFrame:   "../adds_assets/door_levels.png",
  fallTrap:    "../adds_assets/fall_trap.png",
  statue:      "../adds_assets/headless_statue.png",
  jar:         "../adds_assets/jar.png",
  muralLady:   "../adds_assets/mary.png",
  muralSeeker: "../adds_assets/man_finding.png",
  muralShade:  "../adds_assets/jihugyft.png",
  bonesSmall:  "../adds_assets/plenty_pile_of_bones.png",
  bonesWide:   "../adds_assets/many_pile_of_bones.png",
  bonesLarge:  "../adds_assets/pile_of_bones.png",
  bonesHuge:   "../adds_assets/numerous_pile_of_bones.png",
  threadPaper: "../adds_assets/paper_golden_thread.png",
  clueMarker:  "../adds_assets/roman_numbers.png",
  platform:    "../adds_assets/platform.png",
  web:         "../adds_assets/spider_web.png",
  vinesGreen:      "../adds_assets/vines.png",
  vinesGreenWide:  "../adds_assets/vines2.png",
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
      i.onload = function () { r(i); };
      i.onerror = function () { r(null); };
      i.src = src;
    });
  }
  if (typeof SPRITE_IDLE  !== "undefined") SPR.idle  = await li(SPRITE_IDLE);
  if (typeof SPRITE_IDLE2 !== "undefined") SPR.idle2 = await li(SPRITE_IDLE2);
  if (typeof SPRITE_WALK1 !== "undefined")
    SPR.walk = await Promise.all([SPRITE_WALK1, SPRITE_WALK2, SPRITE_WALK3].map(li));
  if (typeof SPRITE_RUN1  !== "undefined")
    SPR.run  = await Promise.all([SPRITE_RUN1, SPRITE_RUN2, SPRITE_RUN3, SPRITE_RUN4].map(li));
  SPR.jump = await Promise.all(JUMP_PATHS.map(li));
  if (typeof SPRITE_DOOR1  !== "undefined") SPR.door1  = await li(SPRITE_DOOR1);
  if (typeof SPRITE_DOOR2  !== "undefined") SPR.door2  = await li(SPRITE_DOOR2);
  if (typeof SPRITE_GOLD   !== "undefined") SPR.gold   = await li(SPRITE_GOLD);
  if (typeof SPRITE_SPIKES !== "undefined") SPR.spike  = await li(SPRITE_SPIKES);
  SPR.torch      = await li(TORCH_ASSET);
  SPR.rat        = await Promise.all(MOB_RAT_PATHS.map(li));
  SPR.bat        = await li(MOB_BAT_PATH);
  SPR.hammerLeft  = await Promise.all(HAMMER_LEFT_PATHS.map(li));
  SPR.hammerRight = await Promise.all(HAMMER_RIGHT_PATHS.map(li));
  var decorKeys = Object.keys(DECOR_PATHS);
  for (var i = 0; i < decorKeys.length; i++) {
    SPR.decor[decorKeys[i]] = await li(DECOR_PATHS[decorKeys[i]]);
  }
  var selectedTheme = getSelectedMapTheme();
  var themeSet = MAP_THEME_ASSETS[selectedTheme];
  if (themeSet) {
    SPR.mapTheme.map  = await li(themeSet.map);
    SPR.mapTheme.roof = await li(themeSet.roof);
    SPR.mapTheme.fall = await li(themeSet.fall);
  }
  sprOK = true;
}

function getSelectedMapTheme() {
  try {
    var selected = localStorage.getItem(MAP_THEME_STORAGE_KEY);
    return MAP_THEME_ASSETS[selected] ? selected : "classic";
  } catch (e) { return "classic"; }
}

/* ── CAMERA ─────────────────────────────────────────────────────── */
var CAM = { x: 0, y: 0 };

/* ── KEYS ─────────────────────────────────────────────────────────── */
var KEYS = {}, JP = {};
window.addEventListener("keydown", function (e) {
  if (["Space","ArrowUp","ArrowLeft","ArrowRight","ArrowDown",
       "KeyW","KeyA","KeyS","KeyD","KeyE","KeyF","ShiftLeft","ShiftRight"
      ].indexOf(e.code) !== -1) e.preventDefault();
  if (!KEYS[e.code]) JP[e.code] = true;
  KEYS[e.code] = true;
});
window.addEventListener("keyup", function (e) { KEYS[e.code] = false; });

/* ═══════════════════════════════════════════════════════════════════
   MAP DATA
═══════════════════════════════════════════════════════════════════ */
var FLOOR_Y;
var MAP = {};

function buildMap() {
  var H = TC.height;
  FLOOR_Y = Math.round(H * 0.8);
  PL_COX = Math.round((PL.sw - PL.w) / 2);
  PL_COY = PL.sh - PL.h;

  var ph       = TILE * 1.5;
  var mezzY    = FLOOR_Y - TILE * 0.35;
  var loftY    = FLOOR_Y - TILE * 0.95;
  var galleryY = FLOOR_Y - TILE * 1.35;
  var lowerY   = FLOOR_Y + TILE * 2.7;
  var trenchY  = FLOOR_Y + TILE * 3.7;
  var rise1Y   = FLOOR_Y + TILE * 1.8;
  var rise2Y   = FLOOR_Y + TILE * 0.95;
  var rise3Y   = FLOOR_Y + TILE * 0.2;

  MAP.platforms = [
    { x: 0,    y: FLOOR_Y, w: 420,  h: ph },
    { x: 560,  y: mezzY,   w: 160,  h: TILE },
    { x: 790,  y: rise1Y,  w: 150,  h: TILE },
    { x: 1010, y: loftY,   w: 170,  h: TILE },
    { x: 1280, y: mezzY,   w: 160,  h: TILE },
    { x: 1510, y: FLOOR_Y, w: 220,  h: ph },
    { x: 1820, y: trenchY, w: 140,  h: ph },
    { x: 2050, y: lowerY,  w: 200,  h: ph },
    { x: 2330, y: rise1Y,  w: 160,  h: TILE },
    { x: 2560, y: rise2Y,  w: 150,  h: TILE },
    { x: 2780, y: rise3Y,  w: 160,  h: TILE },
    { x: 3010, y: FLOOR_Y, w: 230,  h: ph },
    { x: 3330, y: mezzY,   w: 170,  h: TILE },
    { x: 3570, y: loftY,   w: 180,  h: TILE },
    { x: 3830, y: lowerY,  w: 210,  h: ph },
    { x: 4120, y: FLOOR_Y, w: 240,  h: ph },
    { x: 4460, y: rise1Y,  w: 160,  h: TILE },
    { x: 4700, y: mezzY,   w: 170,  h: TILE },
    { x: 4950, y: loftY,   w: 180,  h: TILE },
    { x: 5200, y: FLOOR_Y, w: 240,  h: ph },
    { x: 5530, y: trenchY, w: 145,  h: ph },
    { x: 5770, y: lowerY,  w: 200,  h: ph },
    { x: 6050, y: mezzY,   w: 170,  h: TILE },
    { x: 6310, y: rise1Y,  w: 160,  h: TILE },
    { x: 6540, y: FLOOR_Y, w: 1580, h: ph },
  ];

  MAP.obstacle = null;
  MAP.plates   = [];

  MAP.spikes = [
    { x: 1110, y: loftY,   w: 64, triggerX: 1042, active: false, riseTimer: 0 },
    { x: 2160, y: lowerY,  w: 64, triggerX: 2090, active: false, riseTimer: 0 },
    { x: 2870, y: rise3Y,  w: 64, triggerX: 2805, active: false, riseTimer: 0 },
    { x: 4010, y: lowerY,  w: 64, triggerX: 3940, active: false, riseTimer: 0 },
    { x: 5080, y: loftY,   w: 64, triggerX: 5010, active: false, riseTimer: 0 },
    { x: 5890, y: lowerY,  w: 64, triggerX: 5820, active: false, riseTimer: 0 },
  ];

  MAP.mobs = [
    { type:"rat", x:1035, startX:1035, y:loftY,        w:56, h:32,
      minX:1020, maxX:1135, vx:1.2,  tick:0, dead:false, hitCooldown:0 },
    { type:"bat", x:2335, startX:2335, y:rise1Y-126, baseY:rise1Y-126, w:72, h:42,
      minX:2310, maxX:2470, vx:1.5,  bob:0, tick:0, dead:false, hitCooldown:0 },
    { type:"rat", x:3585, startX:3585, y:loftY,        w:56, h:32,
      minX:3580, maxX:3695, vx:-1.25, tick:0, dead:false, hitCooldown:0 },
    { type:"bat", x:4705, startX:4705, y:mezzY-130,  baseY:mezzY-130,  w:72, h:42,
      minX:4680, maxX:4835, vx:1.55, bob:0, tick:0, dead:false, hitCooldown:0 },
    { type:"rat", x:6075, startX:6075, y:mezzY,        w:56, h:32,
      minX:6060, maxX:6185, vx:1.25, tick:0, dead:false, hitCooldown:0 },
  ];

  MAP.shaft = { x:3140, y:FLOOR_Y+ph, w:120, bottom:trenchY };

  MAP.readySpike = null;
  MAP.hammer     = null;
  MAP.gold       = null;

  /* ── 3 DOORS — one correct, two wrong ── */
  var dW = 118, dH = 154;
  var doorY = FLOOR_Y - dH;

  // Randomise correct door once per run; keep across resize
  if (typeof MAP._correctDoorIdx === "undefined") {
    MAP._correctDoorIdx = Math.floor(Math.random() * 3);
  }

  MAP.doors = [
    { x: 2420, y: doorY, w: dW, h: dH,
      correct: MAP._correctDoorIdx === 0, label: "DOOR I"   },
    { x: 5590, y: doorY, w: dW, h: dH,
      correct: MAP._correctDoorIdx === 1, label: "DOOR II"  },
    { x: 7850, y: doorY, w: dW, h: dH,
      correct: MAP._correctDoorIdx === 2, label: "DOOR III" },
  ];
  MAP.doorFrameRect = null;

  MAP.decorBack = [
    { key:"cage",         x:120,  y:FLOOR_Y-274, w:104, h:88,  alpha:0.18 },
    { key:"web",          x:250,  y:FLOOR_Y-256, w:132, h:48,  alpha:0.24 },
    { key:"vinesGreenWide",x:520, y:FLOOR_Y-214, w:170, h:56,  alpha:0.15 },
    { key:"web",          x:820,  y:rise1Y-94,   w:126, h:44,  alpha:0.24 },
    { key:"muralShade",   x:1030, y:FLOOR_Y-290, w:182, h:144, alpha:0.10 },
    { key:"web",          x:1020, y:loftY-96,    w:128, h:46,  alpha:0.26 },
    { key:"vinesRed2",    x:1470, y:FLOOR_Y-212, w:78,  h:228, alpha:0.21 },
    { key:"web",          x:2060, y:lowerY-118,  w:132, h:46,  alpha:0.24 },
    { key:"muralLady",    x:2260, y:FLOOR_Y-286, w:138, h:112, alpha:0.11 },
    { key:"web",          x:2345, y:rise1Y-96,   w:126, h:44,  alpha:0.24 },
    { key:"web",          x:2790, y:rise3Y-104,  w:132, h:46,  alpha:0.28 },
    { key:"vinesGreen",   x:3345, y:mezzY-150,   w:82,  h:98,  alpha:0.16 },
    { key:"web",          x:3590, y:loftY-96,    w:128, h:46,  alpha:0.26 },
    { key:"muralSeeker",  x:3820, y:FLOOR_Y-288, w:176, h:138, alpha:0.11 },
    { key:"banner",       x:4180, y:FLOOR_Y-308, w:84,  h:166, alpha:0.12 },
    { key:"web",          x:4465, y:rise1Y-96,   w:128, h:46,  alpha:0.24 },
    { key:"web",          x:4970, y:loftY-96,    w:130, h:46,  alpha:0.26 },
    { key:"vinesRed4",    x:5230, y:FLOOR_Y-212, w:88,  h:244, alpha:0.22 },
    { key:"web",          x:5790, y:lowerY-118,  w:130, h:46,  alpha:0.24 },
    { key:"vinesGreenWide",x:6530,y:FLOOR_Y-162, w:182, h:60,  alpha:0.18 },
    { key:"web",          x:7960, y:FLOOR_Y-88,  w:120, h:42,  alpha:0.22 },
  ];

  MAP.decorFront = [
    { key:"jar",        x:576,  y:mezzY-58,   w:52,  h:62, alpha:0.76 },
    { key:"bonesSmall", x:1032, y:loftY-4,    w:72,  h:30, alpha:0.24 },
    { key:"bonesWide",  x:2058, y:lowerY+10,  w:114, h:52, alpha:0.24 },
    { key:"jar",        x:3350, y:mezzY-58,   w:54,  h:64, alpha:0.76 },
    { key:"bonesLarge", x:3585, y:loftY-8,    w:110, h:62, alpha:0.22 },
    { key:"jar",        x:4720, y:mezzY-58,   w:54,  h:64, alpha:0.76 },
    { key:"blood",      x:5900, y:lowerY-66,  w:102, h:58, alpha:0.20 },
    { key:"clueMarker", x:6320, y:rise1Y-62,  w:68,  h:40, alpha:0.64 },
    { key:"bonesHuge",  x:7900, y:FLOOR_Y-18, w:148, h:92, alpha:0.28 },
  ];

  MAP.roomLights = [
    { x:30,   y:FLOOR_Y-280, w:900,  h:350, glow:0.08 },
    { x:960,  y:FLOOR_Y-330, w:1250, h:410, glow:0.10 },
    { x:2220, y:lowerY-240,  w:1250, h:430, glow:0.11 },
    { x:3510, y:FLOOR_Y-300, w:1750, h:370, glow:0.09 },
    { x:5450, y:FLOOR_Y-270, w:2700, h:340, glow:0.10 },
  ];

  MAP.roomColumns = [
    { x:520,  y:120, w:22, h:FLOOR_Y-28,    alpha:0.11 },
    { x:1490, y:126, w:22, h:FLOOR_Y-22,    alpha:0.12 },
    { x:2990, y:138, w:22, h:rise3Y+20,     alpha:0.13 },
    { x:4380, y:120, w:24, h:FLOOR_Y-26,    alpha:0.11 },
    { x:6660, y:120, w:24, h:FLOOR_Y-24,    alpha:0.13 },
  ];

  MAP.spawn = { x: 230, y: FLOOR_Y - PL.h - PL_COY };
}

/* ═══════════════════════════════════════════════════════════════════
   GAME STATE
═══════════════════════════════════════════════════════════════════ */
var GS = {
  lives: 3,
  hasGold: false,
  startTime: 0,
  timerSecs: 0,
  step: 0,
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

  // ── Quiz state ──
  quizActive:    false,
  quizDoor:      null,
  quizQuestions: [],
  quizCurrent:   0,
  quizEl:        null,

  // ── Inventory ──
  inventory: [],
};

/* ═══════════════════════════════════════════════════════════════════
   INVENTORY SYSTEM
═══════════════════════════════════════════════════════════════════ */

var ITEM_DEFS = {
  goldenThread: {
    id:   "goldenThread",
    name: "Golden Thread",
    icon: "🪡",
    desc: "Ariadne's thread — reveals the true door.",
    glow: "#ffd700",
  },
};

function addToInventory(itemId) {
  var def = ITEM_DEFS[itemId];
  if (!def) return false;
  for (var k = 0; k < GS.inventory.length; k++) {
    if (GS.inventory[k].id === itemId) return false;
  }
  GS.inventory.push(def);
  renderInventoryHUD();
  return true;
}

function removeFromInventory(itemId) {
  GS.inventory = GS.inventory.filter(function (it) { return it.id !== itemId; });
  renderInventoryHUD();
}

function renderInventoryHUD() {
  var panel = document.getElementById("inv-panel");
  if (!panel) return;
  var grid = document.getElementById("inv-grid");
  if (!grid) return;
  grid.innerHTML = "";

  var SLOT_COUNT = 6;
  for (var s = 0; s < SLOT_COUNT; s++) {
    var item = GS.inventory[s] || null;
    var slot = document.createElement("div");
    slot.className = "inv-slot" + (item ? " inv-slot--filled" : "");
    if (item && item.glow) {
      slot.style.boxShadow  = "0 0 10px 2px " + item.glow + "55, inset 0 0 8px " + item.glow + "22";
      slot.style.borderColor = item.glow + "88";
    }
    if (item) {
      var ico = document.createElement("div");
      ico.className = "inv-icon";
      ico.textContent = item.icon;
      slot.appendChild(ico);
      var nm = document.createElement("div");
      nm.className = "inv-name";
      nm.textContent = item.name;
      slot.appendChild(nm);
      slot.title = item.name + "\n" + item.desc;
    }
    grid.appendChild(slot);
  }
}

function buildInventoryHUD() {
  // Always replace style tag so changes always apply
  var oldStyle = document.getElementById("inv-styles");
  if (oldStyle) oldStyle.parentNode.removeChild(oldStyle);
  var style = document.createElement("style");
  style.id = "inv-styles";
  style.textContent = [
    "#inv-panel{",
    "  position:fixed;top:50%;right:12px;transform:translateY(-50%);z-index:600;",
    "  font-family:Cinzel,serif;pointer-events:none;",
    "  display:flex;flex-direction:column;align-items:center;gap:6px;",
    "}",
    "#inv-label{",
    "  color:#c8a23a;font-size:8px;letter-spacing:2px;text-transform:uppercase;",
    "  opacity:0.75;writing-mode:vertical-rl;text-orientation:mixed;margin-bottom:4px;",
    "}",
    "#inv-grid{ display:flex;flex-direction:column;gap:6px; }",
    ".inv-slot{",
    "  width:48px;height:54px;background:rgba(10,6,4,0.82);",
    "  border:1.5px solid rgba(200,162,58,0.22);border-radius:6px;",
    "  display:flex;flex-direction:column;align-items:center;justify-content:center;",
    "  gap:2px;transition:box-shadow 0.3s,border-color 0.3s;position:relative;",
    "}",
    ".inv-slot--filled{ background:rgba(20,12,4,0.92); }",
    ".inv-icon{ font-size:22px;line-height:1;filter:drop-shadow(0 0 4px rgba(255,215,0,0.6)); }",
    ".inv-name{",
    "  font-size:6px;color:#e0c87a;text-align:center;",
    "  letter-spacing:0.5px;line-height:1.1;",
    "  max-width:42px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;",
    "}",
    "@keyframes inv-pickup{",
    "  0%{transform:scale(1.18);box-shadow:0 0 22px 6px #ffd70099;}",
    "  60%{transform:scale(1.04);}",
    "  100%{transform:scale(1);}",
    "}",
    ".inv-slot--new{ animation:inv-pickup 0.55s ease-out forwards; }",
  ].join("\n");
  document.head.appendChild(style);

  if (!document.getElementById("inv-panel")) {
    var panel = document.createElement("div");
    panel.id = "inv-panel";
    var label = document.createElement("div");
    label.id = "inv-label";
    label.textContent = "⚔ Inventory";
    panel.appendChild(label);
    var grid = document.createElement("div");
    grid.id = "inv-grid";
    panel.appendChild(grid);
    document.body.appendChild(panel);
  }

  renderInventoryHUD();
}

function flashInventorySlot(slotIndex) {
  var grid = document.getElementById("inv-grid");
  if (!grid) return;
  var slots = grid.querySelectorAll(".inv-slot");
  var slot = slots[slotIndex];
  if (!slot) return;
  slot.classList.remove("inv-slot--new");
  void slot.offsetWidth;
  slot.classList.add("inv-slot--new");
}

/* ═══════════════════════════════════════════════════════════════════
   MYTHOLOGY QUIZ BANK
═══════════════════════════════════════════════════════════════════ */

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

var QUIZ_BANK = [
  // ── Greek Heroes & Gods ──
  function () {
    return {
      q: "Who is the king of the Greek gods on Mount Olympus?",
      answer: "Zeus",
      options: shuffle(["Zeus", "Poseidon", "Hades", "Ares"]),
    };
  },
  function () {
    return {
      q: "What hero slew the Gorgon Medusa?",
      answer: "Perseus",
      options: shuffle(["Perseus", "Theseus", "Heracles", "Achilles"]),
    };
  },
  function () {
    return {
      q: "Who gave Theseus the golden thread to escape the Labyrinth?",
      answer: "Ariadne",
      options: shuffle(["Ariadne", "Medea", "Circe", "Persephone"]),
    };
  },
  function () {
    return {
      q: "The Labyrinth of Crete was built to contain which creature?",
      answer: "The Minotaur",
      options: shuffle(["The Minotaur", "The Chimera", "The Hydra", "The Cyclops"]),
    };
  },
  function () {
    return {
      q: "Which hero completed the Twelve Labours?",
      answer: "Heracles",
      options: shuffle(["Heracles", "Odysseus", "Jason", "Bellerophon"]),
    };
  },
  function () {
    return {
      q: "Who is the Greek god of the sea?",
      answer: "Poseidon",
      options: shuffle(["Poseidon", "Zeus", "Apollo", "Hephaestus"]),
    };
  },
  function () {
    return {
      q: "Achilles was said to be invulnerable everywhere except his —",
      answer: "Heel",
      options: shuffle(["Heel", "Shoulder", "Knee", "Wrist"]),
    };
  },
  function () {
    return {
      q: "Which goddess sprang fully armoured from Zeus's head?",
      answer: "Athena",
      options: shuffle(["Athena", "Artemis", "Aphrodite", "Hera"]),
    };
  },
  function () {
    return {
      q: "Odysseus is the hero of which epic poem by Homer?",
      answer: "The Odyssey",
      options: shuffle(["The Odyssey", "The Iliad", "The Aeneid", "Theogony"]),
    };
  },
  function () {
    return {
      q: "Who was the father of Theseus, king of Athens?",
      answer: "Aegeus",
      options: shuffle(["Aegeus", "Minos", "Daedalus", "Peleus"]),
    };
  },
  // ── Creatures & Monsters ──
  function () {
    return {
      q: "The Hydra was a many-headed serpent slain as one of whose Labours?",
      answer: "Heracles",
      options: shuffle(["Heracles", "Perseus", "Theseus", "Jason"]),
    };
  },
  function () {
    return {
      q: "Which winged horse was born from Medusa's blood?",
      answer: "Pegasus",
      options: shuffle(["Pegasus", "Arion", "Sleipnir", "Xanthus"]),
    };
  },
  function () {
    return {
      q: "The Sphinx posed a riddle outside which ancient city?",
      answer: "Thebes",
      options: shuffle(["Thebes", "Athens", "Troy", "Corinth"]),
    };
  },
  function () {
    return {
      q: "What was the name of the three-headed dog guarding the Underworld?",
      answer: "Cerberus",
      options: shuffle(["Cerberus", "Orthrus", "Scylla", "Argus"]),
    };
  },
  function () {
    return {
      q: "Bellerophon rode Pegasus to fight which fire-breathing monster?",
      answer: "Chimera",
      options: shuffle(["Chimera", "Hydra", "Gorgon", "Manticore"]),
    };
  },
  // ── Underworld & Afterlife ──
  function () {
    return {
      q: "Who is the ruler of the Greek Underworld?",
      answer: "Hades",
      options: shuffle(["Hades", "Charon", "Thanatos", "Ares"]),
    };
  },
  function () {
    return {
      q: "The ferryman who carried souls across the river Styx was called —",
      answer: "Charon",
      options: shuffle(["Charon", "Hermes", "Thanatos", "Hades"]),
    };
  },
  function () {
    return {
      q: "Persephone was taken to the Underworld by which god?",
      answer: "Hades",
      options: shuffle(["Hades", "Zeus", "Ares", "Poseidon"]),
    };
  },
  // ── Minos & the Labyrinth ──
  function () {
    return {
      q: "Who designed and built the Labyrinth for King Minos?",
      answer: "Daedalus",
      options: shuffle(["Daedalus", "Hephaestus", "Prometheus", "Icarus"]),
    };
  },
  function () {
    return {
      q: "Icarus fell into the sea because he flew too close to the —",
      answer: "Sun",
      options: shuffle(["Sun", "Moon", "Storm", "Mountain"]),
    };
  },
  function () {
    return {
      q: "King Minos was the son of Zeus and which mortal woman?",
      answer: "Europa",
      options: shuffle(["Europa", "Io", "Semele", "Danae"]),
    };
  },
  function () {
    return {
      q: "How many Athenian youths were sent to the Minotaur as tribute each year?",
      answer: "Seven boys and seven girls",
      options: shuffle(["Seven boys and seven girls", "Three boys and three girls",
                         "Ten warriors", "One hero"]),
    };
  },
  // ── Roman equivalents ──
  function () {
    return {
      q: "The Roman equivalent of the Greek god Zeus is —",
      answer: "Jupiter",
      options: shuffle(["Jupiter", "Neptune", "Mars", "Mercury"]),
    };
  },
  function () {
    return {
      q: "What is the Roman name for the Greek god Hermes?",
      answer: "Mercury",
      options: shuffle(["Mercury", "Vulcan", "Pluto", "Saturn"]),
    };
  },
  function () {
    return {
      q: "The Roman name for the Greek god Ares (god of war) is —",
      answer: "Mars",
      options: shuffle(["Mars", "Jupiter", "Apollo", "Neptune"]),
    };
  },
];

function buildQuiz() {
  // Pick exactly 1 random question from the mythology bank
  var n = Math.floor(Math.random() * QUIZ_BANK.length);
  return [QUIZ_BANK[n]()];
}

function openQuiz(doorIndex) {
  var door = MAP.doors[doorIndex];
  // Only show quiz on the correct door; wrong doors trigger jumpscare immediately
  if (!door || !door.correct) {
    wrongDoor();
    return;
  }
  GS.quizActive    = true;
  GS.quizDoor      = doorIndex;
  GS.quizQuestions = buildQuiz();
  GS.quizCurrent   = 0;
  GS.paused        = true;
  renderQuizUI();
}

function renderQuizUI() {
  closeQuizUI();
  var q = GS.quizQuestions[GS.quizCurrent];
  var overlay = document.createElement("div");
  overlay.id = "quiz-overlay";
  overlay.style.cssText = [
    "position:fixed", "inset:0", "z-index:8000",
    "display:flex", "flex-direction:column",
    "align-items:center", "justify-content:center",
    "background:rgba(0,0,0,0.82)", "font-family:Cinzel,serif",
  ].join(";");

  var door = MAP.doors[GS.quizDoor];

  overlay.innerHTML = [
    '<div style="background:#1a0f0a;border:2px solid #c8a23a;border-radius:10px;',
    'padding:36px 44px;max-width:540px;width:90%;text-align:center;',
    'box-shadow:0 0 60px rgba(200,162,58,0.22)">',
    '<div style="color:#c8a23a;font-size:13px;letter-spacing:2px;margin-bottom:16px;">',
    "🏛 " + (door ? door.label : "DOOR") + " — TRIAL OF MYTH</div>",
    '<div style="color:#fff;font-size:20px;font-weight:bold;margin-bottom:28px;line-height:1.4;">',
    q.q + "</div>",
    '<div id="quiz-options" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">',
    q.options.map(function (opt) {
      return (
        '<button onclick="quizAnswer(' + JSON.stringify(opt) + ')" style="' +
        "background:#2a1a10;border:1.5px solid #7a5a20;color:#f0d890;" +
        "padding:12px 8px;border-radius:6px;font-family:Cinzel,serif;font-size:14px;" +
        'cursor:pointer;transition:background 0.15s;" ' +
        "onmouseover=\"this.style.background='#3a2a18'\" " +
        "onmouseout=\"this.style.background='#2a1a10'\">" +
        opt + "</button>"
      );
    }).join(""),
    "</div>",
    '<div style="color:#7a5a20;font-size:11px;margin-top:18px;">',
    "⚠ Wrong answer costs 1 ❤</div>",
    "</div>",
  ].join("");

  document.body.appendChild(overlay);
  GS.quizEl = overlay;
}

function closeQuizUI() {
  var old = document.getElementById("quiz-overlay");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  GS.quizEl = null;
}

window.quizAnswer = function (chosen) {
  if (!GS.quizActive) return;
  var q = GS.quizQuestions[GS.quizCurrent];
  var correct = String(chosen) === String(q.answer);

  if (!correct) {
    closeQuizUI();
    GS.quizActive = false;
    GS.paused     = false;
    GS.lives = Math.max(0, GS.lives - 1);
    updateHUD();
    spawnImpactPtcls(PL.x + PL.sw / 2, PL.y + PL.sh * 0.55, 10);
    if (GS.lives <= 0) {
      startDeathSequence("quiz");
    } else {
      showBadge("✕ Wrong! -1 ❤  Try the door again.");
    }
    return;
  }

  // Correct answer on the correct door → advance to stage 7
  closeQuizUI();
  GS.quizActive = false;
  GS.paused     = false;
  window.location.href = "stage7.html";
};

/* ═══════════════════════════════════════════════════════════════════
   TUTORIAL STEPS
═══════════════════════════════════════════════════════════════════ */
var STEPS = [
  {
    icon: "🕸",
    title: "Stage VI — Fallen Nave",
    desc: "The sixth chamber pushes a harsher climb through the fallen nave where traps and roaming enemies overlap more often.",
    keys: ["Stay mobile", "Watch for rats and bats"],
    trigger: function () { return PL.x > 700; },
  },
  {
    icon: "☠",
    title: "Hazards Stack",
    desc: "Fewer spike traps protect the route now, but 3 mobs patrol the safest-looking ledges.",
    keys: ["Clear ledges fast"],
    trigger: function () { return PL.x > 2400; },
  },
  {
    icon: "🦇",
    title: "Roaming Threats",
    desc: "Flying and crawling enemies force cleaner timing. Hesitation is punished harder here.",
    keys: ["Read patrols"],
    trigger: function () { return PL.x > 5200; },
  },
  {
    icon: "🚪",
    title: "Final Push",
    desc: "The exit hall is longer and less forgiving. Cross the last hazards and reach the next gate.",
    keys: ["Finish the chamber"],
    trigger: function () { return PL.x > 7900; },
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
  TC.width  = window.innerWidth;
  TC.height = window.innerHeight;
  TC.getContext("2d").imageSmoothingEnabled = false;
  buildMap();
  spawnPlayer();
}

function spawnPlayer() {
  PL.x  = MAP.spawn.x;
  PL.y  = MAP.spawn.y;
  PL.vx = 0; PL.vy = 0;
  PL.grounded  = false;
  PL.was       = false;
  PL.dashing   = false;
  PL.dtmr = 0; PL.dcd = 0;
  PL.stamina   = STAM_MAX;
  PL.frame = 0; PL.atick = 0;
  PL.ifrm = 0; PL.itick = 0; PL.iframes = 0;
  PL.alive     = true;
  PL.dir       = 1;
  PL.moving    = false;
  PL.sprinting = false;
  CAM.x = 0;
  GS.hasGold        = false;
  GS.activeDoorIndex = -1;
  GS.inventory      = [];
  renderInventoryHUD();
  if (MAP.mobs) {
    MAP.mobs.forEach(function (m) {
      m.dead = false; m.hitCooldown = 0;
      if (typeof m.startX === "undefined") m.startX = m.x;
      m.x = m.startX; m.tick = 0;
      if (m.type === "bat") m.bob = m.bob || 0;
    });
  }
}

function resetToStart() {
  // Re-randomise correct door (once only per reset)
  MAP._correctDoorIdx = Math.floor(Math.random() * 3);
  if (MAP.doors && MAP.doors.length === 3) {
    MAP.doors[0].correct = MAP._correctDoorIdx === 0;
    MAP.doors[1].correct = MAP._correctDoorIdx === 1;
    MAP.doors[2].correct = MAP._correctDoorIdx === 2;
  }
  MAP.spikes.forEach(function (s) { s.active = false; s.riseTimer = 0; });
  if (MAP.hammer) {
    MAP.hammer.angle = 0;
    MAP.hammer.swingTimer = 0;
    MAP.hammer.hitCooldown = 0;
  }
  if (MAP.mobs) {
    MAP.mobs.forEach(function (m) {
      m.dead = false; m.hitCooldown = 0;
      if (typeof m.startX !== "undefined") m.x = m.startX;
      m.tick = 0;
    });
  }
  GS.hasGold        = false;
  GS.inventory      = [];
  renderInventoryHUD();
  if (MAP.gold) MAP.gold.collected = false;
  GS.activeDoorIndex  = -1;
  GS.dead             = false;
  GS.won              = false;
  GS.jumpscareActive  = false;
  GS.step             = 0;
  GS.ptcls            = [];
  GS.deathFx          = null;
  GS.deathFlash       = 0;
  GS.startTime        = Date.now();
  GS.timerSecs        = 0;
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
  PL.sprinting = (KEYS["ShiftLeft"] || KEYS["ShiftRight"]) && canSpr && !PL.dashing;
  PL.moving = false;

  if (!PL.dashing) {
    var spd = PX * (PL.sprinting ? SPR_MULT : 1);
    if (KEYS["KeyD"] || KEYS["ArrowRight"]) { PL.vx += spd; PL.dir = 1;  PL.moving = true; }
    if (KEYS["KeyA"] || KEYS["ArrowLeft"])  { PL.vx -= spd; PL.dir = -1; PL.moving = true; }
    if (KEYS["KeyS"] || KEYS["ArrowDown"])  { PL.vx *= 0.5; }
  }

  var cap = PX * (PL.sprinting ? SPR_MULT : 1) * 4;
  PL.vx = Math.max(-cap, Math.min(cap, PL.vx));

  if ((JP["KeyW"] || JP["Space"] || JP["ArrowUp"]) && PL.grounded) {
    PL.vy = JUMP_V; PL.grounded = false;
    PL.frame = 0; PL.atick = 0;
    JP["KeyW"] = JP["Space"] = JP["ArrowUp"] = false;
  }

  if (JP["KeyF"] && PL.dcd <= 0 && PL.stamina >= DASH_COST && !PL.dashing) {
    PL.dashing  = true;
    PL.dtmr     = DASH_DUR;
    PL.ddir     = PL.dir;
    PL.stamina -= DASH_COST;
    PL.dcd      = DASH_CD;
    if (PL.vy > 0) PL.vy *= 0.3;
    JP["KeyF"] = false;
  }
  if (PL.dashing) {
    PL.vx = PL.ddir * DASH_SPD;
    PL.dtmr--;
    spawnDashPtcl();
    if (PL.dtmr <= 0) { PL.dashing = false; PL.vx *= 0.4; }
  }

  if (PL.sprinting && PL.moving)
    PL.stamina = Math.max(0, PL.stamina - STAM_DRAIN);
  else if (!PL.dashing)
    PL.stamina = Math.min(STAM_MAX, PL.stamina + (PL.moving ? STAM_REGEN * 0.5 : STAM_REGEN));
  if (PL.dcd > 0) PL.dcd--;
  if (PL.iframes > 0) PL.iframes--;

  PL.vy += GRAV;
  PL.vx *= FRIC;
  PL.x  += PL.vx;
  PL.y  += PL.vy;
  if (PL.x < 0) { PL.x = 0; PL.vx = 0; }

  PL.grounded = false;
  MAP.platforms.forEach(function (p) {
    var plx = PL.x + PL_COX, ply = PL.y + PL_COY;
    var prevBot = ply + PL.h - PL.vy;
    if (plx < p.x+p.w && plx+PL.w > p.x && ply+PL.h > p.y && prevBot <= p.y+8 && PL.vy >= 0) {
      PL.y = p.y - PL_COY - PL.h;
      PL.vy = 0; PL.grounded = true;
    }
  });

  var ob = MAP.obstacle;
  if (ob) {
    var plx2 = PL.x + PL_COX, ply2 = PL.y + PL_COY;
    if (plx2 < ob.x+ob.w && plx2+PL.w > ob.x && ply2+PL.h > ob.y && ply2 < ob.y+ob.h) {
      if (PL.vx >= 0 && plx2+PL.w > ob.x && plx2 < ob.x) {
        PL.x = ob.x - PL_COX - PL.w; PL.vx = 0;
      }
    }
  }

  if (PL.x + PL.sw > WORLD) { PL.x = WORLD - PL.sw; PL.vx = 0; }

  /* ── SPIKE TRIGGERS ── */
  MAP.spikes.forEach(function (sp) {
    if (sp.active) return;
    if (PL.x + PL_COX + PL.w >= sp.triggerX) { sp.active = true; sp.riseTimer = 0; }
  });

  /* ── SPIKE DAMAGE ── */
  if (PL.iframes <= 0) {
    MAP.spikes.forEach(function (sp) {
      if (!sp.active) return;
      var spikeH = 32, spikeY = sp.y - spikeH;
      var px3 = PL.x+PL_COX, py3 = PL.y+PL_COY;
      if (px3 < sp.x+sp.w && px3+PL.w > sp.x && py3+PL.h > spikeY && py3 < sp.y)
        takeDamage("spike");
    });
  }

  /* ── READY SPIKE ── */
  if (MAP.readySpike && PL.iframes <= 0 && !PL.dashing) {
    var rs = MAP.readySpike, spikeH2 = 36;
    var px4 = PL.x+PL_COX, py4 = PL.y+PL_COY;
    if (px4 < rs.x+rs.w && px4+PL.w > rs.x && py4+PL.h > rs.y-spikeH2 && py4 < rs.y)
      takeDamage("readySpike");
  }

  /* ── HAMMER ── */
  if (MAP.hammer) {
    var hm = MAP.hammer;
    hm.swingTimer += hm.swingSpeed;
    hm.angle = Math.sin(hm.swingTimer) * hm.swingMax;
    var swingRatio = Math.min(Math.abs(hm.angle) / hm.swingMax, 1);
    hm.frameIdx = Math.round(swingRatio * Math.max(HAMMER_SWING_FRAMES.length - 1, 0));
    if (hm.hitCooldown > 0) hm.hitCooldown--;
    if (PL.iframes <= 0 && hm.hitCooldown <= 0) {
      var hx2 = hm.anchorX + Math.sin(hm.angle) * hm.length;
      var hy3 = hm.anchorY + Math.cos(hm.angle) * hm.length;
      var px5 = PL.x+PL_COX, py5 = PL.y+PL_COY;
      var headCX = hx2 + Math.sin(hm.angle)*hm.hh;
      var headCY = hy3 + Math.cos(hm.angle)*hm.hh;
      var hL = headCX-hm.hw/2, hR = headCX+hm.hw/2;
      var hT = headCY-hm.hh/2, hB = headCY+hm.hh/2;
      if (px5 < hR && px5+PL.w > hL && py5 < hB && py5+PL.h > hT) {
        var kd = PL.x+PL.sw/2 < hx2 ? -1 : 1;
        PL.vx = kd*10; PL.vy = -9; PL.grounded = false;
        hm.hitCooldown = 80; takeDamage("hammer");
      }
    }
  }

  /* ── DOOR INTERACTION — quiz only on correct door ── */
  if (!GS.quizActive) {
    GS.activeDoorIndex = -1;
    MAP.doors.forEach(function (door, i) {
      var px7 = PL.x+PL_COX, py7 = PL.y+PL_COY;
      if (px7 < door.x+door.w+10 && px7+PL.w > door.x-10 &&
          py7+PL.h > door.y && py7 < door.y+door.h) {
        GS.activeDoorIndex = i;
        if (JP["KeyE"]) {
          openQuiz(i); // wrong doors jumpscare inside openQuiz
        }
      }
    });
    JP["KeyE"] = false;
  }

  /* ── VOID DEATH ── */
  if (PL.y > TC.height + 80) takeDamage("void");

  /* ── ANIMATION ── */
  if (!PL.grounded) {
    PL.atick++;
    if (PL.atick > 3) {
      PL.frame = Math.min(PL.frame+1, Math.max(SPR.jump.length-1, 0));
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
    if (++PL.itick > 40) { PL.ifrm = (PL.ifrm+1)%2; PL.itick = 0; }
  }

  /* ── CAMERA ── */
  var targetCamX = PL.x + PL.sw/2 - TC.width/2;
  var targetCamY = PL.y + PL.sh/2 - TC.height/2;
  targetCamX = Math.max(0, Math.min(WORLD - TC.width, targetCamX));
  targetCamY = Math.max(0, Math.min(TC.height*2 - TC.height, targetCamY));
  CAM.x += (targetCamX - CAM.x) * 0.12;
  CAM.y += (targetCamY - CAM.y) * 0.12;

  updateParticles();
  updateMobs();

  var t = document.getElementById("hud-timer");
  if (t) {
    var s3 = GS.timerSecs;
    t.textContent = String(Math.floor(s3/60)).padStart(2,"0") + ":" + String(s3%60).padStart(2,"0");
  }

  updateHUD();
}

/* ── DAMAGE / DEATH ─────────────────────────────────────────────── */
function takeDamage(source) {
  if (PL.iframes > 0) return;
  if (source === "void") {
    GS.lives = 0; PL.iframes = 0;
    updateHUD(); startDeathSequence(source); return;
  }
  GS.lives = Math.max(0, GS.lives - 1);
  PL.iframes = 12; PL.vy = -10;
  spawnImpactPtcls(PL.x+PL.sw/2, PL.y+PL.sh*0.55, 10);
  updateHUD();
  if (GS.lives <= 0) startDeathSequence(source);
}

function updateMobs() {
  if (!MAP.mobs) return;
  MAP.mobs.forEach(function (m) {
    if (m.dead) return;
    if (m.hitCooldown > 0) m.hitCooldown--;
    m.tick = (m.tick || 0) + 1;
    if (m.type === "bat") {
      m.x += m.vx;
      if (m.x < m.minX || m.x+m.w > m.maxX) {
        m.vx *= -1; m.x = Math.max(m.minX, Math.min(m.maxX-m.w, m.x));
      }
      m.bob = (m.bob||0) + 0.08;
      m.y = m.baseY + Math.sin(m.bob)*18;
    } else {
      m.x += m.vx;
      if (m.x < m.minX || m.x+m.w > m.maxX) {
        m.vx *= -1; m.x = Math.max(m.minX, Math.min(m.maxX-m.w, m.x));
      }
    }
    if (PL.iframes > 0) return;
    var px = PL.x+PL_COX, py = PL.y+PL_COY;
    var my = m.type === "rat" ? m.y-m.h : m.y;
    if (px < m.x+m.w && px+PL.w > m.x && py < my+m.h && py+PL.h > my) {
      PL.vx = (px+PL.w*0.5 < m.x+m.w*0.5 ? -8 : 8);
      PL.vy = -8; takeDamage("mob");
    }
  });
}

function updateParticles() {
  for (var i = GS.ptcls.length-1; i >= 0; i--) {
    var pt = GS.ptcls[i];
    pt.x += pt.vx; pt.y += pt.vy;
    pt.vy += pt.type === "ember" ? -0.04 : 0.05;
    pt.life -= pt.dec;
    if (pt.life <= 0) GS.ptcls.splice(i, 1);
  }
}

function spawnImpactPtcls(x, y, count) {
  for (var i = 0; i < count; i++) {
    var isEmber = i % 3 === 0;
    GS.ptcls.push({
      x: x+(Math.random()-0.5)*16, y: y+(Math.random()-0.5)*18,
      vx:(Math.random()-0.5)*3.8, vy:-(Math.random()*2.6+0.6),
      life:1, dec:0.035+Math.random()*0.03,
      sz: Math.random()*(isEmber?4:3)+2,
      col: isEmber
        ? (Math.random()<0.5 ? "#ffd36c" : "#ffb347")
        : (Math.random()<0.5 ? "#9b1f2d" : "#67202a"),
      type: isEmber ? "ember" : "dust",
    });
  }
}

function startDeathSequence(source) {
  if (GS.dead) return;
  GS.dead = true; GS.deathFlash = 1;
  PL.alive = false; PL.iframes = 0;
  PL.dashing = false; PL.sprinting = false;
  PL.vx = 0; PL.vy = 0;

  GS.deathFx = {
    x: PL.x, y: PL.y,
    vx: source === "hammer"
      ? (PL.x+PL.sw/2 < MAP.hammer.anchorX ? -2.8 : 2.8)
      : PL.dir * 1.2,
    vy: -6.4,
    rot:  source === "hammer" ? 0.18*PL.dir : 0,
    rotV: source === "hammer" ? 0.14*PL.dir : 0.08*PL.dir,
    scale:1, alpha:1, glow:1, t:0,
  };

  spawnImpactPtcls(PL.x+PL.sw/2, PL.y+PL.sh*0.45, 28);
  for (var i = 0; i < 10; i++) {
    GS.ptcls.push({
      x: PL.x+PL.sw/2+(Math.random()-0.5)*22,
      y: PL.y+PL.sh*0.62+(Math.random()-0.5)*10,
      vx:(Math.random()-0.5)*2.2, vy:-(Math.random()*1.4+0.4),
      life:1, dec:0.025+Math.random()*0.02,
      sz: Math.random()*8+6,
      col: Math.random()<0.5 ? "#1f0f12" : "#3b1f18",
      type:"dust",
    });
  }
}

function updateDeathFx() {
  if (!GS.deathFx) return;
  var fx = GS.deathFx;
  fx.t++;
  fx.x += fx.vx; fx.y += fx.vy;
  fx.vy += 0.34; fx.vx *= 0.95;
  fx.rot  += fx.rotV; fx.rotV *= 0.985;
  fx.scale = 1 + Math.sin(Math.min(fx.t,16)/16*Math.PI)*0.07;
  fx.glow  = Math.max(0, 1 - fx.t/22);
  fx.alpha = fx.t < 12 ? 1 : Math.max(0, 1-(fx.t-12)/28);
  GS.deathFlash = Math.max(0, 1-fx.t/20);
  if (fx.t === 7 || fx.t === 14) spawnImpactPtcls(fx.x+PL.sw/2, fx.y+PL.sh*0.55, 8);
  if (fx.t > 42) { GS.lives = 3; resetToStart(); }
}

function wrongDoor() {
  if (GS.jumpscareActive) return;
  GS.jumpscareActive = true;
  GS.paused = true;

  var overlay = document.createElement("div");
  overlay.id = "mino-jumpscare";
  overlay.style.cssText = [
    "position:fixed","inset:0","z-index:9999",
    "display:flex","align-items:center","justify-content:center",
    "background:#000","opacity:0","transition:opacity 0.05s","overflow:hidden",
  ].join(";");

  var img = new Image();
  img.style.cssText = [
    "max-width:100vw","max-height:100vh","width:100vw","height:100vh",
    "object-fit:cover","transform:scale(1.08)","image-rendering:pixelated",
    "filter:brightness(1.3) contrast(1.4)",
  ].join(";");

  if (typeof SPRITE_MINO !== "undefined") {
    img.src = SPRITE_MINO;
  } else {
    overlay.style.background = "#cc0000";
    var txt = document.createElement("div");
    txt.textContent = "YOU CHOSE WRONG";
    txt.style.cssText = "color:#fff;font-size:80px;font-weight:bold;font-family:serif;text-shadow:0 0 40px #ff0000;";
    overlay.appendChild(txt);
  }
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  var fl = document.getElementById("wrong-flash");
  if (fl) { fl.classList.add("show"); setTimeout(function(){ fl.classList.remove("show"); }, 200); }

  TC.style.transition = "transform 0s";
  var shakeCount = 0;
  var shakeInterval = setInterval(function () {
    TC.style.transform = "translate("+(Math.random()-0.5)*18+"px,"+(Math.random()-0.5)*18+"px)";
    if (++shakeCount > 8) { clearInterval(shakeInterval); TC.style.transform = ""; }
  }, 40);

  requestAnimationFrame(function () { overlay.style.opacity = "1"; });
  setTimeout(function () {
    img.style.transition = "transform 0.4s ease-out";
    img.style.transform  = "scale(1.22)";
  }, 60);
  setTimeout(function () {
    overlay.style.transition = "opacity 0.35s";
    overlay.style.opacity    = "0";
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      GS.jumpscareActive = false;
      GS.paused = false;
      GS.lives  = 3;
      resetToStart();
      showBadge("✕ Wrong door! Start again...");
    }, 380);
  }, 1100);
}

/* ═══════════════════════════════════════════════════════════════════
   DRAW
═══════════════════════════════════════════════════════════════════ */
function tutDraw() {
  var W = TC.width, H = TC.height;
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
  drawDoors();
  drawDecorLayer(MAP.decorFront);
  drawMobs();
  drawParticles();
  drawPlayer();

  TX.restore();
  drawVignette(W, H);
  drawStamBar(W, H);
}

function drawBG(W, H) {
  var th = { color:"#3a2a1a", accentColor:"#d4a843" };
  GS.flicker = Math.sin(Date.now()*0.003)*0.06 + Math.random()*0.03;
  var g = TX.createLinearGradient(0,0,0,H);
  g.addColorStop(0, "#050309");
  g.addColorStop(0.56,"#0a0608");
  g.addColorStop(1,  "#040203");
  TX.fillStyle = g;
  TX.fillRect(0, 0, WORLD, H);
  if (SPR.mapTheme.map) {
    TX.save(); TX.globalAlpha = 0.34;
    TX.drawImage(SPR.mapTheme.map, 0, H*0.08, WORLD, H*0.68);
    TX.restore();
  }
  if (SPR.mapTheme.roof) {
    TX.save(); TX.globalAlpha = 0.3;
    TX.drawImage(SPR.mapTheme.roof, 0, 0, WORLD, H*0.18);
    TX.restore();
  }
  var haze = TX.createRadialGradient(CAM.x+W*0.5,H*0.18,10,CAM.x+W*0.5,H*0.42,W*0.7);
  haze.addColorStop(0,"rgba(214,187,128,0.11)");
  haze.addColorStop(1,"transparent");
  TX.fillStyle = haze;
  TX.fillRect(CAM.x, 0, W, H);
  TX.fillStyle = th.color+"12";
  TX.fillRect(0, 0, WORLD, H);
  TX.strokeStyle = "rgba(20,12,28,.5)";
  TX.lineWidth = 1;
  var bw=80, bh=50, ox=(GS.bgX*0.2)%bw;
  for (var bx=ox+CAM.x-bw; bx<CAM.x+W+bw; bx+=bw)
    for (var by=0; by<H; by+=bh)
      TX.strokeRect(bx+(Math.floor(by/bh)%2)*bw*0.5-bw*0.25, by, bw, bh);
  for (var col=0; col<WORLD; col+=340) {
    if (col<CAM.x-220 || col>CAM.x+W+220) continue;
    TX.fillStyle="rgba(255,255,255,0.015)"; TX.fillRect(col, H*0.12, 185, H*0.48);
    TX.fillStyle="rgba(0,0,0,0.16)";       TX.fillRect(col+10, H*0.12, 14, H*0.48);
  }
  for (var ttx=300; ttx<WORLD; ttx+=600) {
    var ty=H*0.28, inten=0.1+GS.flicker*0.5;
    if (ttx<CAM.x-150 || ttx>CAM.x+W+150) continue;
    var tg2=TX.createRadialGradient(ttx,ty-16,0,ttx,ty-12,126);
    tg2.addColorStop(0,"rgba(255,214,122,"+(0.22+inten*0.55)+")");
    tg2.addColorStop(0.34,"rgba(214,104,32,"+(0.12+inten*0.25)+")");
    tg2.addColorStop(1,"transparent");
    TX.fillStyle=tg2; TX.fillRect(0,0,WORLD,H);
    var torchImg=SPR.torch, torchW=34, torchH=34, torchBaseY=ty-6;
    if (torchImg) TX.drawImage(torchImg, ttx-torchW*0.5, torchBaseY-torchH, torchW, torchH);
    var eg=TX.createRadialGradient(ttx,torchBaseY-28,0,ttx,torchBaseY-28,34);
    eg.addColorStop(0,"rgba(255,240,184,.48)");
    eg.addColorStop(0.3,"rgba(255,170,70,.26)");
    eg.addColorStop(1,"transparent");
    TX.fillStyle=eg; TX.fillRect(ttx-34,torchBaseY-64,68,68);
    var fw=Math.sin(Date.now()*0.007+ttx*0.015)*4;
    TX.save(); TX.globalCompositeOperation="screen";
    TX.fillStyle="rgba(255,164,63,.88)";
    TX.beginPath();
    TX.moveTo(ttx,torchBaseY-45-fw*0.12);
    TX.quadraticCurveTo(ttx+10,torchBaseY-30,ttx,torchBaseY-12);
    TX.quadraticCurveTo(ttx-12,torchBaseY-30,ttx,torchBaseY-45-fw*0.12);
    TX.fill();
    TX.fillStyle="rgba(255,241,190,.96)";
    TX.beginPath();
    TX.moveTo(ttx,torchBaseY-38-fw*0.08);
    TX.quadraticCurveTo(ttx+5,torchBaseY-28,ttx,torchBaseY-18);
    TX.quadraticCurveTo(ttx-6,torchBaseY-28,ttx,torchBaseY-38-fw*0.08);
    TX.fill();
    TX.restore();
  }
  TX.fillStyle="rgba(0,0,0,.18)";
  TX.fillRect(0,H*0.72,WORLD,H*0.28);
}

function drawChamberDepth(H) {
  (MAP.roomLights||[]).forEach(function(zone){
    if (zone.x+zone.w<CAM.x-80||zone.x>CAM.x+TC.width+80) return;
    TX.save();
    TX.fillStyle="rgba(10,8,14,.22)"; TX.fillRect(zone.x,zone.y,zone.w,zone.h);
    var archG=TX.createLinearGradient(zone.x,zone.y,zone.x,zone.y+zone.h);
    archG.addColorStop(0,"rgba(26,18,22,.44)");
    archG.addColorStop(0.25,"rgba(10,7,12,.1)");
    archG.addColorStop(1,"rgba(0,0,0,0)");
    TX.fillStyle=archG; TX.fillRect(zone.x+24,zone.y+18,zone.w-48,zone.h-18);
    var glow=TX.createRadialGradient(zone.x+zone.w/2,zone.y+zone.h*0.18,18,
                                      zone.x+zone.w/2,zone.y+zone.h*0.18,zone.w*0.42);
    glow.addColorStop(0,"rgba(204,164,96,"+zone.glow+")");
    glow.addColorStop(0.5,"rgba(114,80,38,"+(zone.glow*0.42)+")");
    glow.addColorStop(1,"transparent");
    TX.fillStyle=glow; TX.fillRect(zone.x,zone.y,zone.w,zone.h);
    TX.fillStyle="rgba(0,0,0,.18)";
    TX.fillRect(zone.x+18,zone.y+zone.h-54,zone.w-36,54);
    TX.restore();
  });
  (MAP.roomColumns||[]).forEach(function(col){
    if (col.x+col.w<CAM.x-60||col.x>CAM.x+TC.width+60) return;
    TX.save();
    var cg=TX.createLinearGradient(col.x,col.y,col.x+col.w,col.y);
    cg.addColorStop(0,"rgba(14,10,16,"+col.alpha+")");
    cg.addColorStop(0.5,"rgba(42,30,34,"+(col.alpha*1.2)+")");
    cg.addColorStop(1,"rgba(12,8,12,"+col.alpha+")");
    TX.fillStyle=cg; TX.fillRect(col.x,col.y,col.w,col.h);
    TX.fillStyle="rgba(212,168,67,.08)"; TX.fillRect(col.x+2,col.y,Math.max(1,col.w-4),3);
    TX.fillStyle="rgba(0,0,0,.26)"; TX.fillRect(col.x+4,col.y+col.h-18,Math.max(1,col.w-8),18);
    TX.restore();
  });
}

function drawDecorLayer(list) {
  if (!list) return;
  list.forEach(function(item){
    var img=SPR.decor[item.key];
    if (!img||item.x+item.w<CAM.x-40||item.x>CAM.x+TC.width+40) return;
    TX.save(); TX.globalAlpha=item.alpha==null?1:item.alpha;
    TX.drawImage(img,item.x,item.y,item.w,item.h);
    TX.restore();
  });
}

function drawPlatforms() {
  MAP.platforms.forEach(function(p){
    if (p.x+p.w<CAM.x-20||p.x>CAM.x+TC.width+20) return;
    var sg=TX.createLinearGradient(p.x,p.y,p.x,p.y+p.h);
    sg.addColorStop(0,"#372224"); sg.addColorStop(0.18,"#2a1a1c"); sg.addColorStop(1,"#140c10");
    TX.fillStyle=sg; TX.fillRect(p.x,p.y,p.w,p.h);
    TX.fillStyle="rgba(232,194,106,.62)"; TX.fillRect(p.x,p.y,p.w,2);
    TX.fillStyle="rgba(120,86,44,.82)";   TX.fillRect(p.x,p.y+2,p.w,4);
    TX.fillStyle="rgba(255,248,224,.06)"; TX.fillRect(p.x+6,p.y+7,p.w-12,1);
    TX.fillStyle="rgba(0,0,0,.4)";
    TX.fillRect(p.x,p.y,3,p.h); TX.fillRect(p.x+p.w-3,p.y,3,p.h);
    TX.fillRect(p.x+10,p.y+p.h-8,Math.max(0,p.w-20),8);
    if (SPR.decor.platform && p.w>=120) {
      var friezeW=Math.min(p.w-36,136);
      TX.save(); TX.globalAlpha=0.16;
      TX.drawImage(SPR.decor.platform,6,0,
        Math.max(1,SPR.decor.platform.naturalWidth-12),SPR.decor.platform.naturalHeight,
        p.x+(p.w-friezeW)/2,p.y-8,friezeW,18);
      TX.restore();
    }
  });
}

function drawObstacle() {
  var ob=MAP.obstacle;
  if (!ob||ob.x+ob.w<CAM.x-20||ob.x>CAM.x+TC.width+20) return;
  var sg=TX.createLinearGradient(ob.x,ob.y,ob.x+ob.w,ob.y);
  sg.addColorStop(0,"#4a2e1a"); sg.addColorStop(0.5,"#5a3a20"); sg.addColorStop(1,"#4a2e1a");
  TX.fillStyle=sg; TX.fillRect(ob.x,ob.y,ob.w,ob.h);
  TX.fillStyle="rgba(212,168,67,.4)"; TX.fillRect(ob.x,ob.y,ob.w,3);
  TX.fillStyle="rgba(0,0,0,.5)";
  TX.fillRect(ob.x,ob.y,2,ob.h); TX.fillRect(ob.x+ob.w-2,ob.y,2,ob.h);
  TX.fillStyle="rgba(255,200,80,.6)";
  TX.font="bold 10px Cinzel,serif"; TX.textAlign="center";
  TX.fillText("JUMP!",ob.x+ob.w/2,ob.y-8); TX.textAlign="left";
}

function drawSpikeRack(x, y, w, spikeH, gap) {
  var count=Math.max(3,Math.round(w/gap));
  var toothW=w/count, rackTop=y-8, rackHeight=12;
  TX.save();
  TX.fillStyle="rgba(0,0,0,.32)";
  TX.beginPath(); TX.ellipse(x+w/2,y+6,w*0.56,10,0,0,Math.PI*2); TX.fill();
  var baseG=TX.createLinearGradient(x,rackTop,x,rackTop+rackHeight);
  baseG.addColorStop(0,"#1b1214"); baseG.addColorStop(0.45,"#40282b"); baseG.addColorStop(1,"#12090b");
  TX.fillStyle=baseG; TX.fillRect(x,rackTop,w,rackHeight);
  TX.fillStyle="rgba(255,204,140,.15)"; TX.fillRect(x,rackTop,w,2);
  TX.fillStyle="rgba(90,14,14,.35)";   TX.fillRect(x,rackTop+rackHeight-3,w,2);
  TX.fillStyle="rgba(0,0,0,.42)";      TX.fillRect(x,rackTop+rackHeight,w,4);
  for (var j=0; j<count; j++) {
    var sx=x+j*toothW, tipX=sx+toothW/2;
    var leftX=sx+toothW*0.14, rightX=sx+toothW*0.86;
    TX.fillStyle="rgba(0,0,0,.24)";
    TX.beginPath(); TX.moveTo(leftX+1,rackTop+rackHeight-1);
    TX.lineTo(tipX,y-spikeH+6); TX.lineTo(rightX+2,rackTop+rackHeight-1); TX.closePath(); TX.fill();
    var bladeG=TX.createLinearGradient(tipX,y-spikeH,tipX,rackTop+rackHeight);
    bladeG.addColorStop(0,"#f3e5d5"); bladeG.addColorStop(0.18,"#d8d1c8");
    bladeG.addColorStop(0.55,"#8a8c93"); bladeG.addColorStop(1,"#2f3137");
    TX.fillStyle=bladeG;
    TX.beginPath(); TX.moveTo(leftX,rackTop+rackHeight-1);
    TX.lineTo(tipX,y-spikeH); TX.lineTo(rightX,rackTop+rackHeight-1); TX.closePath(); TX.fill();
    TX.strokeStyle="rgba(21,16,18,.72)"; TX.lineWidth=1;
    TX.beginPath(); TX.moveTo(leftX,rackTop+rackHeight-1);
    TX.lineTo(tipX,y-spikeH); TX.lineTo(rightX,rackTop+rackHeight-1); TX.stroke();
    TX.strokeStyle="rgba(255,255,255,.26)";
    TX.beginPath(); TX.moveTo(tipX,y-spikeH+3); TX.lineTo(tipX-toothW*0.1,rackTop+1); TX.stroke();
    TX.fillStyle="rgba(104,18,20,.42)";
    TX.beginPath(); TX.moveTo(leftX+1,rackTop+rackHeight-1);
    TX.lineTo(tipX,y-spikeH*0.34); TX.lineTo(rightX-toothW*0.2,rackTop+rackHeight-1);
    TX.closePath(); TX.fill();
  }
  TX.restore();
}

function drawPlates() {
  MAP.plates.forEach(function(plate){
    if (plate.x+plate.w<CAM.x-20||plate.x>CAM.x+TC.width+20) return;
    TX.save();
    TX.fillStyle=plate.active?"rgba(156,104,28,.95)":"rgba(106,74,24,.9)";
    TX.fillRect(plate.x,plate.y,plate.w,plate.h);
    TX.fillStyle="rgba(238,204,122,.55)"; TX.fillRect(plate.x,plate.y,plate.w,2);
    TX.fillStyle="rgba(0,0,0,.35)"; TX.fillRect(plate.x+4,plate.y+plate.h,plate.w-8,3);
    TX.fillStyle="rgba(212,168,67,.72)"; TX.font="bold 8px Cinzel,serif"; TX.textAlign="center";
    TX.fillText("PLATE",plate.x+plate.w/2,plate.y-4); TX.textAlign="left";
    TX.restore();
  });
}

function drawSpikes() {
  MAP.spikes.forEach(function(sp){
    if (!sp.active||sp.x+sp.w<CAM.x-20||sp.x>CAM.x+TC.width+20) return;
    drawSpikeRack(sp.x,sp.y,sp.w,42,22);
  });
}

function drawReadySpike() {
  if (!MAP.readySpike) return;
  var rs=MAP.readySpike;
  if (rs.x+rs.w<CAM.x-20||rs.x>CAM.x+TC.width+20) return;
  drawSpikeRack(rs.x,rs.y,rs.w,48,22);
  TX.fillStyle="rgba(8,14,22,.72)"; TX.fillRect(rs.x+rs.w/2-74,rs.y-48-28,148,20);
  TX.strokeStyle="rgba(68,170,255,.28)"; TX.strokeRect(rs.x+rs.w/2-74,rs.y-48-28,148,20);
  TX.fillStyle="rgba(92,184,255,.9)"; TX.font="bold 10px Cinzel,serif"; TX.textAlign="center";
  TX.fillText("DASH [F]",rs.x+rs.w/2,rs.y-48-14); TX.textAlign="left";
}

function drawShaft(H) {
  var sh=MAP.shaft;
  if (sh.x+sh.w<CAM.x-20||sh.x>CAM.x+TC.width+20) return;
  var shaftG=TX.createLinearGradient(sh.x,sh.y,sh.x,sh.bottom);
  shaftG.addColorStop(0,"rgba(14,8,14,.48)"); shaftG.addColorStop(1,"rgba(0,0,0,.74)");
  TX.fillStyle=shaftG; TX.fillRect(sh.x,sh.y,sh.w,sh.bottom-sh.y);
  if (SPR.mapTheme.fall) {
    TX.save(); TX.globalAlpha=0.26;
    TX.drawImage(SPR.mapTheme.fall,sh.x,sh.y,sh.w,sh.bottom-sh.y);
    TX.restore();
  }
  TX.fillStyle="rgba(0,0,0,.26)"; TX.fillRect(sh.x+10,sh.y+6,sh.w-20,sh.bottom-sh.y-6);
}

function drawHammer() {
  if (!MAP.hammer) return;
  var hm=MAP.hammer;
  if (hm.anchorX<CAM.x-300||hm.anchorX>CAM.x+TC.width+300) return;
  var hmImg=SPR.hammerRight&&SPR.hammerRight.length?SPR.hammerRight[0]:null;
  if (hmImg&&hmImg.complete&&hmImg.naturalWidth) {
    TX.save();
    var scale=0.72, sprW=hmImg.naturalWidth*scale, sprH=hmImg.naturalHeight*scale;
    TX.translate(hm.anchorX,hm.anchorY); TX.rotate(hm.angle);
    TX.drawImage(hmImg,-sprW*0.86,-sprH*0.5,sprW,sprH);
    TX.restore();
  } else {
    TX.save(); TX.translate(hm.anchorX,hm.anchorY); TX.rotate(hm.angle);
    var hg=TX.createLinearGradient(-hm.hw/2,-hm.hh/2,hm.hw/2,hm.hh/2);
    hg.addColorStop(0,"#909090"); hg.addColorStop(0.4,"#c0c0c8"); hg.addColorStop(1,"#484858");
    TX.fillStyle=hg; TX.fillRect(-hm.hw/2,-hm.hh/2,hm.hw,hm.hh);
    TX.strokeStyle="#282830"; TX.lineWidth=2;
    TX.strokeRect(-hm.hw/2,-hm.hh/2,hm.hw,hm.hh);
    TX.fillStyle="rgba(255,255,255,.2)"; TX.fillRect(-hm.hw/2+2,-hm.hh/2+2,hm.hw-4,4);
    TX.restore();
  }
  var dist=Math.hypot(PL.x+PL.sw/2-hm.anchorX,PL.y+PL.sh/2-hm.anchorY);
  if (dist<300) {
    var alp=Math.max(0,(300-dist)/300)*(0.5+0.4*Math.abs(Math.sin(Date.now()*0.01)));
    TX.save(); TX.globalAlpha=alp;
    TX.font="bold 16px serif"; TX.fillStyle="#ff3300"; TX.textAlign="center";
    TX.fillText("⚠",hm.anchorX,hm.anchorY-20); TX.restore();
  }
}

function drawGold() {
  if (!MAP.gold||MAP.gold.collected) return;
  var g=MAP.gold;
  if (g.x<CAM.x-60||g.x>CAM.x+TC.width+60) return;
  MAP.gold.bobTimer=(MAP.gold.bobTimer||0)+0.05;
  var bob=Math.sin(MAP.gold.bobTimer)*6;
  var gx=g.x+g.w/2, gy=g.y+bob;
  var gl=TX.createRadialGradient(gx,gy,2,gx,gy,40);
  gl.addColorStop(0,"rgba(255,215,0,.4)"); gl.addColorStop(1,"transparent");
  TX.fillStyle=gl; TX.fillRect(gx-45,gy-45,90,90);
  TX.save(); TX.shadowBlur=20; TX.shadowColor="#ffd700";
  TX.fillStyle="#ffd700"; TX.beginPath(); TX.arc(gx,gy,18,0,Math.PI*2); TX.fill();
  TX.fillStyle="#ffaa00"; TX.beginPath(); TX.arc(gx,gy,14,0,Math.PI*2); TX.fill();
  TX.fillStyle="#ffe066"; TX.font="bold 14px serif"; TX.textAlign="center";
  TX.fillText("G",gx,gy+5); TX.restore();
  TX.fillStyle="rgba(255,215,0,.9)"; TX.font="bold 10px Cinzel,serif"; TX.textAlign="center";
  TX.fillText("Golden Thread",gx,g.y+bob-26);
  TX.fillText("[E] Pick up",gx,g.y+bob-14); TX.textAlign="left";
}

function drawDoors() {
  MAP.doors.forEach(function(door, i){
    if (door.x+door.w<CAM.x-20||door.x>CAM.x+TC.width+20) return;
    // Stage VI has no gold thread — no "lit" mechanic needed
    var lit = false;
    var pulse = 1;

    TX.save();
    TX.fillStyle="rgba(0,0,0,.22)";
    TX.beginPath(); TX.ellipse(door.x+door.w/2,door.y+door.h+10,door.w*0.56,10,0,0,Math.PI*2);
    TX.fill();
    TX.fillStyle="rgba(32,18,18,.88)";
    TX.fillRect(door.x-14,door.y+door.h-14,door.w+28,30);
    TX.fillStyle="rgba(232,194,106,.18)";
    TX.fillRect(door.x-14,door.y+door.h-14,door.w+28,2);
    TX.restore();

    var frame=SPR.decor.doorFrame;
    if (frame&&frame.complete&&frame.naturalWidth) {
      var cropX=frame.naturalWidth*0.5, cropW=frame.naturalWidth*0.5;
      var cropY=frame.naturalHeight*0.255, cropH=frame.naturalHeight*0.745;
      TX.globalAlpha=0.88;
      TX.drawImage(frame,cropX,cropY,cropW,cropH,door.x-2,door.y+12,door.w+4,door.h-4);
      TX.globalAlpha=1;
    } else {
      TX.fillStyle="#3a2010"; TX.fillRect(door.x,door.y,door.w,door.h);
      TX.fillStyle="#5a3818"; TX.fillRect(door.x+4,door.y+4,door.w-8,door.h-8);
      TX.strokeStyle="#5a3818"; TX.lineWidth=3; TX.strokeRect(door.x,door.y,door.w,door.h);
    }

    // Label
    TX.textAlign="center"; TX.font="9px Cinzel,serif";
    TX.fillStyle="rgba(212,168,67,.55)";
    TX.fillText(door.label||"DOOR",door.x+door.w/2,door.y+door.h+14);
    if (GS.activeDoorIndex===i) {
      TX.fillStyle="rgba(255,215,0,.95)"; TX.font="bold 11px Cinzel,serif";
      TX.fillText("[E] ENTER",door.x+door.w/2,door.y-8);
    }
    TX.textAlign="left";
  });
}

function drawMobs() {
  if (!MAP.mobs) return;
  MAP.mobs.forEach(function(m){
    if (m.dead) return;
    var drawY=m.type==="rat"?m.y-m.h:m.y;
    if (m.x+m.w<CAM.x-40||m.x>CAM.x+TC.width+40) return;
    TX.save();
    if (m.vx<0) { TX.translate(m.x+m.w,drawY); TX.scale(-1,1); }
    else         { TX.translate(m.x,drawY); }
    var dx=0;
    if (m.type==="rat"&&SPR.rat&&SPR.rat.length) {
      var fr=SPR.rat[Math.floor((m.tick||0)/8)%SPR.rat.length];
      if (fr&&fr.complete&&fr.naturalWidth) TX.drawImage(fr,dx,0,m.w,m.h);
      else { TX.fillStyle="#7c6450"; TX.fillRect(dx,0,m.w,m.h); }
    } else if (m.type==="bat"&&SPR.bat&&SPR.bat.complete&&SPR.bat.naturalWidth) {
      TX.drawImage(SPR.bat,dx,0,m.w,m.h);
    } else {
      TX.fillStyle=m.type==="bat"?"#5a485e":"#7c6450";
      TX.fillRect(dx,0,m.w,m.h);
    }
    TX.restore();
  });
}

function drawParticles() {
  GS.ptcls.forEach(function(p){
    TX.save(); TX.globalAlpha=p.life*0.75; TX.fillStyle=p.col;
    TX.shadowBlur=5; TX.shadowColor=p.col;
    TX.fillRect(p.x-p.sz/2,p.y-p.sz/2,p.sz,p.sz);
    TX.restore();
  });
}

function drawPlayer() {
  var img=null;
  if (!PL.grounded&&SPR.jump.length)
    img=SPR.jump[Math.min(PL.frame,Math.max(SPR.jump.length-1,0))];
  else if (!PL.moving) img=PL.ifrm===0?SPR.idle:SPR.idle2;
  else if (PL.sprinting||PL.dashing) img=SPR.run[PL.frame%Math.max(SPR.run.length,1)];
  else img=SPR.walk[PL.frame%Math.max(SPR.walk.length,1)];

  if (!GS.deathFx&&PL.iframes>0&&Math.floor(PL.iframes/5)%2===0) return;

  TX.save();
  if (GS.deathFx) {
    var fx=GS.deathFx;
    TX.globalAlpha=fx.alpha; TX.shadowBlur=24*fx.glow;
    TX.shadowColor="rgba(255,180,90,.85)";
    TX.fillStyle="rgba(0,0,0,"+(0.18*fx.alpha)+")";
    TX.beginPath();
    TX.ellipse(fx.x+PL.sw/2,fx.y+PL.sh+6,PL_COX*(1.05+fx.t*0.01),6,0,0,Math.PI*2);
    TX.fill();
    TX.translate(fx.x+PL.sw/2,fx.y+PL.sh*0.56);
    TX.rotate(fx.rot);
    TX.scale((PL.dir===-1?-1:1)*fx.scale,Math.max(0.78,1-fx.t*0.01));
    if (img&&img.complete&&img.naturalWidth) {
      TX.drawImage(img,-PL.sw/2,-PL.sh*0.56,PL.sw,PL.sh);
    } else {
      TX.fillStyle="#d4a843"; TX.fillRect(-PL.sw/2+8,-PL.sh*0.56+20,PL.sw-16,PL.sh-28);
      TX.fillStyle="#f0c080"; TX.fillRect(-PL.sw/2+10,-PL.sh*0.56+2,PL.sw-20,20);
      TX.fillStyle="#8a3020"; TX.fillRect(-PL.sw/2+8,-PL.sh*0.56+22,PL.sw-16,6);
    }
    TX.restore(); return;
  }

  if (PL.dashing) { TX.globalAlpha=0.55+Math.random()*0.3; TX.shadowBlur=18; TX.shadowColor="#44aaff"; }
  TX.fillStyle="rgba(0,0,0,.3)";
  TX.beginPath(); TX.ellipse(PL.x+PL.sw/2,PL.y+PL.sh+2,PL_COX*0.9,5,0,0,Math.PI*2); TX.fill();

  if (img&&img.complete&&img.naturalWidth) {
    if (PL.dir===-1) { TX.translate(PL.x+PL.sw,PL.y); TX.scale(-1,1); TX.drawImage(img,0,0,PL.sw,PL.sh); }
    else             { TX.drawImage(img,PL.x,PL.y,PL.sw,PL.sh); }
  } else {
    if (PL.dir===-1) { TX.translate((PL.x+PL.sw/2)*2,0); TX.scale(-1,1); }
    TX.fillStyle="#d4a843"; TX.fillRect(PL.x+8,PL.y+20,PL.sw-16,PL.sh-28);
    TX.fillStyle="#f0c080"; TX.fillRect(PL.x+10,PL.y+2,PL.sw-20,20);
    TX.fillStyle="#8a3020"; TX.fillRect(PL.x+8,PL.y+22,PL.sw-16,6);
  }

  // Inventory item icons floating above head
  if (GS.inventory.length > 0) {
    TX.globalAlpha = 1;
    TX.font = "16px serif";
    TX.textAlign = "center";
    GS.inventory.forEach(function(item, idx){
      TX.fillText(item.icon, PL.x+PL.sw/2+(idx-(GS.inventory.length-1)/2)*20, PL.y-6);
    });
    TX.textAlign = "left";
  }
  TX.restore();
}

function drawVignette(W, H) {
  var vg=TX.createRadialGradient(W/2,H/2,H*0.2,W/2,H/2,H*0.85);
  vg.addColorStop(0,"transparent"); vg.addColorStop(1,"rgba(0,0,0,.78)");
  TX.fillStyle=vg; TX.fillRect(0,0,W,H);
  if (GS.deathFlash>0) {
    var deathG=TX.createRadialGradient(W/2,H*0.45,20,W/2,H*0.45,H*0.72);
    deathG.addColorStop(0,"rgba(255,158,72,"+GS.deathFlash*0.16+")");
    deathG.addColorStop(0.55,"rgba(148,24,24,"+GS.deathFlash*0.12+")");
    deathG.addColorStop(1,"rgba(28,0,0,"+GS.deathFlash*0.36+")");
    TX.fillStyle=deathG; TX.fillRect(0,0,W,H);
  }
}

function drawStamBar(W, H) {
  var sf=document.getElementById("stam-fill");
  if (sf) sf.style.width=(PL.stamina/STAM_MAX)*100+"%";
  var dr=document.getElementById("dash-ready");
  if (dr) dr.textContent=PL.dcd<=0&&PL.stamina>=DASH_COST?"READY":"";
}

/* ── PARTICLES ──────────────────────────────────────────────────── */
function spawnDustPtcl() {
  GS.ptcls.push({ x:PL.x+PL.sw/2+(Math.random()-0.5)*12, y:PL.y+PL.sh,
    vx:(Math.random()-0.5)*2, vy:-(Math.random()*0.8+0.2),
    life:1, dec:0.04+Math.random()*0.03, sz:Math.random()*3+1.5, col:"#7a4a28", type:"dust" });
}
function spawnDashPtcl() {
  for (var i=0;i<3;i++)
    GS.ptcls.push({ x:PL.x+PL.sw/2+(Math.random()-0.5)*PL_COX,
      y:PL.y+PL.sh*0.5+(Math.random()-0.5)*20,
      vx:-PL.ddir*(Math.random()*2.5+1), vy:(Math.random()-0.5)*1.5,
      life:1, dec:0.09+Math.random()*0.06, sz:Math.random()*5+3, col:"#44aaff", type:"dash" });
}
function spawnGoldPtcls(gx, gy) {
  for (var i=0;i<20;i++)
    GS.ptcls.push({ x:gx+(Math.random()-0.5)*30, y:gy+(Math.random()-0.5)*20,
      vx:(Math.random()-0.5)*5, vy:-(Math.random()*4+1),
      life:1, dec:0.025+Math.random()*0.02, sz:Math.random()*4+2, col:"#ffd700", type:"ember" });
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
  buildInventoryHUD();
}

function updateHUD() {
  var hb=document.getElementById("hud-hearts");
  if (!hb) return;
  hb.innerHTML="";
  for (var i=0;i<3;i++) {
    var full=i<GS.lives;
    hb.innerHTML+=
      '<svg class="hud-heart'+(full?" full":"")+'" viewBox="0 0 20 18">'+
      '<path d="M10 16.5S1 11 1 5.5A4.5 4.5 0 0 1 10 3.6 4.5 4.5 0 0 1 19 5.5C19 11 10 16.5 10 16.5z" fill="'+
      (full?"#cc2222":"#2a1010")+'" stroke="'+(full?"#ff4444":"#4a2020")+'" stroke-width="1.5"/></svg>';
  }
}

function showStep(idx) { return; }
function advanceStep()  { return; }
function showBadge(msg) { return; }

function showScreen(id) { var el=document.getElementById(id); if(el) el.classList.remove("hidden"); }
function hideScreen(id) { var el=document.getElementById(id); if(el) el.classList.add("hidden"); }

window.tutInit      = tutInit;
window.resetToStart = resetToStart;