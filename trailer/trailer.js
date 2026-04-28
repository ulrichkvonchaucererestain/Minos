/* ═══════════════════════════════════════════════════════════════════
   LABYRINTH OF MINOS — TRAILER ENGINE  (trailer.js)
   2 km world · all 8 stage themes · every game feature showcased
   Two modes: CINEMATIC (auto-scroll) and PLAYABLE (keyboard control)
   ═══════════════════════════════════════════════════════════════════ */

/* ── TRAILER WORLD WIDTH ─────────────────────────────────────── */
var TRAILER_W = 20000; // 2 km

/* ── ZONES: each zone showcases a feature + uses a stage theme ─ */
var ZONES = [
  {
    name: "Prologue",
    feature: null,
    tag: "LABYRINTH OF MINOS",
    title: "Enter if You Dare",
    desc: "8 Stages · 3 Sections · Infinite Paths",
    theme: 0, // Entry Halls — gold
    start: 0,
    end: 0.06,
    speed: 1.5,
  },
  {
    name: "Platforming",
    feature: "CORE MECHANICS",
    tag: "FLUID MOVEMENT",
    title: "Run · Jump · Sprint · Dash",
    desc: "Master movement to survive every stage",
    theme: 0,
    start: 0.06,
    end: 0.14,
    speed: 2.8,
  },
  {
    name: "Pit Corridors",
    feature: "STAGE 2",
    tag: "PIT CORRIDORS",
    title: "Abyss Below",
    desc: "One wrong step and you fall into the void",
    theme: 1, // blue
    start: 0.14,
    end: 0.21,
    speed: 2.2,
  },
  {
    name: "Fake Platforms",
    feature: "HAZARD",
    tag: "FAKE PLATFORMS",
    title: "Nothing Is Solid",
    desc: "Some floors crumble the moment you land",
    theme: 2, // purple — Stone Halls
    start: 0.21,
    end: 0.29,
    speed: 2.0,
  },
  {
    name: "Hammer",
    feature: "HAZARD",
    tag: "SWINGING HAMMERS",
    title: "Time Your Crossing",
    desc: "Pendulum traps guard every path forward",
    theme: 4, // orange — Ancient Ruins
    start: 0.29,
    end: 0.37,
    speed: 1.8,
  },
  {
    name: "Items",
    feature: "MECHANIC",
    tag: "ITEM SYSTEM",
    title: "Collect · Carry · Use",
    desc: "Find the hint item to unlock the exit door",
    theme: 3, // green — Cliff Paths
    start: 0.37,
    end: 0.44,
    speed: 2.4,
  },
  {
    name: "Boulder",
    feature: "BOSS HAZARD",
    tag: "THE BOULDER",
    title: "It Never Stops Chasing",
    desc: "A relentless boulder hunts you through one stage",
    theme: 5, // red — Forge Depths
    start: 0.44,
    end: 0.52,
    speed: 3.2,
  },
  {
    name: "Void Fall",
    feature: "DEATH",
    tag: "FALL INTO THE VOID",
    title: "The Pit Claims All",
    desc: "Fall far enough and the floor shatters your body",
    theme: 1, // blue pits
    start: 0.52,
    end: 0.6,
    speed: 2.0,
  },
  {
    name: "Quiz Door",
    feature: "PUZZLE",
    tag: "DOOR OF KNOWLEDGE",
    title: "Answer to Advance",
    desc: "Each stage ends with a mathematical riddle",
    theme: 6, // teal — Sanctum
    start: 0.6,
    end: 0.68,
    speed: 1.6,
  },
  {
    name: "Sanctum",
    feature: "STAGE 7",
    tag: "INNER SANCTUM",
    title: "The Heart of the Maze",
    desc: "Harder platforms · more hazards · no mercy",
    theme: 6,
    start: 0.68,
    end: 0.76,
    speed: 3.0,
  },
  {
    name: "Throne",
    feature: "FINAL STAGE",
    tag: "THRONE OF MINOS",
    title: "Face the Minotaur's Realm",
    desc: "Stage 8 · The ultimate challenge",
    theme: 7, // gold — Throne of Minos
    start: 0.76,
    end: 0.88,
    speed: 2.6,
  },
  {
    name: "Epilogue",
    feature: null,
    tag: "LABYRINTH OF MINOS",
    title: "Can You Escape?",
    desc: "8 Stages of Platforming · Math Puzzles · Survival",
    theme: 7,
    start: 0.88,
    end: 1.0,
    speed: 1.2,
  },
];

/* ── TRAILER ROOM — one giant section ─────────────────────────── */
var TRAILER_ROOM = (function buildRoom() {
  var H = 1; // normalized — real canvas.height used at draw time

  /* ── Platforms ─────────────────────────────────────────────── */
  var plats = [];

  /* Helper: add a platform segment */
  function p(xFrac, yFrac, wFrac, hFrac, fake) {
    plats.push({ x: xFrac, y: yFrac, w: wFrac, h: hFrac, fake: !!fake });
  }

  /* ── ZONE 0–1: Prologue + opening run (0–0.14) ── */
  p(0, 0.92, 0.13, 0.08);
  p(0.14, 0.92, 0.04, 0.06);
  p(0.19, 0.87, 0.04, 0.06);
  p(0.24, 0.82, 0.04, 0.06);
  p(0.29, 0.87, 0.04, 0.06);
  p(0.34, 0.92, 0.08, 0.08);

  /* ── ZONE 2: Pit Corridors (0.14–0.21) — narrow walkways over gaps ── */
  p(0.44, 0.92, 0.03, 0.06);
  p(0.48, 0.88, 0.03, 0.06);
  p(0.52, 0.84, 0.03, 0.06);
  p(0.56, 0.8, 0.03, 0.06);
  p(0.6, 0.84, 0.03, 0.06);
  p(0.64, 0.88, 0.05, 0.06);

  /* ── ZONE 3: Fake Platforms (0.21–0.29) ── */
  p(0.7, 0.92, 0.04, 0.06);
  p(0.75, 0.87, 0.04, 0.06, true); // FAKE
  p(0.8, 0.92, 0.04, 0.06);
  p(0.85, 0.87, 0.04, 0.06, true); // FAKE
  p(0.9, 0.82, 0.04, 0.06, true); // FAKE
  p(0.95, 0.92, 0.04, 0.06);

  /* ── ZONE 4: Hammer Zone (0.29–0.37) — safe but scary corridor ── */
  p(1.0, 0.92, 0.07, 0.08);

  /* ── ZONE 5: Item pickup zone (0.37–0.44) ── */
  p(1.08, 0.92, 0.04, 0.06);
  p(1.13, 0.87, 0.04, 0.06);
  p(1.18, 0.82, 0.04, 0.06);
  p(1.23, 0.87, 0.04, 0.06);
  p(1.28, 0.92, 0.06, 0.08);

  /* ── ZONE 6: Boulder chase (0.44–0.52) — flat fast run ── */
  p(1.35, 0.92, 0.16, 0.08);

  /* ── ZONE 7: Void Fall zone (0.52–0.60) — floating islands ── */
  p(1.52, 0.75, 0.03, 0.05);
  p(1.56, 0.68, 0.03, 0.05);
  p(1.6, 0.62, 0.03, 0.05);
  p(1.64, 0.68, 0.03, 0.05);
  p(1.68, 0.75, 0.03, 0.05);
  p(1.72, 0.82, 0.04, 0.06);

  /* ── ZONE 8: Quiz door area (0.60–0.68) ── */
  p(1.77, 0.92, 0.08, 0.08);

  /* ── ZONE 9: Sanctum — dense chaotic platforms (0.68–0.76) ── */
  p(1.86, 0.92, 0.03, 0.06);
  p(1.9, 0.85, 0.03, 0.06, true); // FAKE
  p(1.94, 0.78, 0.03, 0.06);
  p(1.98, 0.71, 0.03, 0.06, true); // FAKE
  p(2.02, 0.78, 0.03, 0.06);
  p(2.06, 0.85, 0.03, 0.06);
  p(2.1, 0.92, 0.03, 0.06);

  /* ── ZONE 10: Throne — dramatic run to finish (0.76–1.0) ── */
  p(2.14, 0.92, 0.04, 0.06);
  p(2.19, 0.89, 0.04, 0.06);
  p(2.24, 0.85, 0.04, 0.06);
  p(2.29, 0.80, 0.04, 0.06);
  p(2.34, 0.85, 0.04, 0.06);
  p(2.39, 0.89, 0.04, 0.06);
  p(2.44, 0.92, 0.04, 0.06);
  p(2.49, 0.89, 0.04, 0.06);
  p(2.54, 0.85, 0.04, 0.06);
  p(2.59, 0.89, 0.04, 0.06);
  p(2.64, 0.92, 0.04, 0.06);
  p(2.69, 0.89, 0.04, 0.06, true); // FAKE
  p(2.74, 0.85, 0.04, 0.06);
  p(2.79, 0.92, 0.2, 0.08); // final wide exit platform

  // Scale all x fractions to TRAILER_W / WORLD_W ratio
  // Actually keep them as-is; TRAILER_W replaces WORLD_W for this map
  // We'll pass TRAILER_W into draw calls via a global override below.

  /* ── Items ── */
  var items = [
    // Zone 5 — scroll pickup showcase
    {
      id: "trail_scroll",
      label: "Stone Tablet",
      icon: "📜",
      x: 1.215 / 3,
      y: 0.75,
      rp: true,
    },
    // Zone 5 — gem bonus
    {
      id: "trail_gem",
      label: "Blue Gem",
      icon: "💎",
      x: 1.255 / 3,
      y: 0.78,
      rp: false,
    },
    // Zone 9 — rune
    {
      id: "trail_rune",
      label: "Mystic Rune",
      icon: "🔮",
      x: 2.0 / 3,
      y: 0.64,
      rp: true,
    },
    // Zone 10 — crown
    {
      id: "trail_crown",
      label: "Crown",
      icon: "👑",
      x: 2.6 / 3,
      y: 0.77,
      rp: true,
    },
  ];

  // Recalculate item x to TRAILER_W fractions
  items.forEach(function (it) {
    // x was already set as direct fraction of TRAILER_W
  });

  return {
    name: "Labyrinth — Full Preview",
    sections: [
      {
        platforms: plats,
        items: items,
        obstacles: [],
        lore: "",
        hammers: [],
      },
    ],
    puzzle: null,
  };
})();

/* ── Recalculate platform fractions for TRAILER_W ── */
/* Platforms built above used fractions where 1.0 = one WORLD_W (10000px).
   TRAILER_W = 20000. Divide every x/w by 2 so 1.0 = full TRAILER_W. */
(function rescalePlatforms() {
  TRAILER_ROOM.sections[0].platforms.forEach(function (p) {
    p.x = p.x / 2;
    p.w = p.w / 2;
  });
  TRAILER_ROOM.sections[0].items.forEach(function (it) {
    // items already set as fraction of TRAILER_W
    if (it.x > 1) it.x = it.x / 3; // re-normalise any miscalculated ones
  });
})();

/* ── STATE ───────────────────────────────────────────────────── */
var TR = {
  mode: "cinematic", // 'cinematic' | 'playable'
  camX: 0,
  scrollSpeed: 2.0,
  progress: 0, // 0–1 across TRAILER_W
  zone: 0,
  captionTimer: 0,
  captionShown: -1,
  captionAlpha: 0,
  boulderActive: false,
  boulderX: -400,
  boulderY: -400,
  boulderVy: 0,
  boulderDrop: false,
  boulderRoll: false,
  boulderWarn: 120,
  hammers: [],
  fakeStates: {},
  flashTimer: 0,
  playLives: 3,
  playStamina: 100,
  playTimer: 0,
  paused: false,
};

/* ── CANVAS ──────────────────────────────────────────────────── */
var tCanvas, tCtx;
var tFlicker = 0,
  tBgX = 0,
  tPtcls = [];
var tPlayer = {
  x: 60,
  y: 0,
  vx: 0,
  vy: 0,
  dir: 1,
  grounded: false,
  was: false,
  moving: false,
  sprinting: false,
  dashing: false,
  dtmr: 0,
  dcd: 0,
  ddir: 1,
  stamina: 100,
  frame: 0,
  atick: 0,
  ifrm: 0,
  itick: 0,
  ifrm_t: 0,
};

var tKeys = {};
var tLoopId = null;

/* ── CHARACTER SPRITES ────────────────────────────────────────── */
var TSPR = { idle: null, idle2: null, walk: [], run: [], jump: null };
var tSprOK = false;
var T_RUN_FRAME_SOURCES = [
  "../run_animation1.png",
  "../run_animation2.png",
  "../run_animation3.png",
  "../run_animation4.png",
  "../run_animation5.png",
  "../run_animation6.png",
  "../run_animation7.png",
];

/* ── CONSTANTS (mirror main game) ── */
var T_SW = 80,
  T_SH = 80,
  T_CW = 34,
  T_CH = 68;
var T_COX = (T_SW - T_CW) / 2,
  T_COY = T_SH - T_CH;
var T_GRAV = 0.58,
  T_FRIC = 0.8,
  T_BSPD = 2.025,
  T_SMULT = 1.2,
  T_JVEL = -11.25;
var T_SMAX = 100,
  T_SDRAIN = 0.35,
  T_SREGEN = 0.3,
  T_SSMIN = 15;
var T_DCOST = 20,
  T_DSPD = 18,
  T_DDUR = 13,
  T_DCDWN = 50;
var T_BRICK_H = 22;
var T_VOID_OFFSET = 45 * T_BRICK_H;
var T_VOID_H = T_BRICK_H * 4;
var T_BOULDER_SIZE = 52;

/* ── SPRITE LOADING ───────────────────────────────────────────── */
function _loadImg(s) {
  return new Promise(function (r) {
    var i = new Image();
    i.onload = function () {
      r(i);
    };
    i.onerror = function () {
      r(null);
    };
    i.src = s;
  });
}
async function _loadSpriteAssets() {
  if (typeof SPRITE_IDLE !== "undefined") {
    TSPR.idle = await _loadImg(SPRITE_IDLE);
    TSPR.idle2 = await _loadImg(SPRITE_IDLE2);
    TSPR.walk = await Promise.all(
      [SPRITE_WALK1, SPRITE_WALK2, SPRITE_WALK3].map(_loadImg),
    );
    TSPR.run = await Promise.all(T_RUN_FRAME_SOURCES.map(_loadImg));
    TSPR.jump = await _loadImg(
      typeof SPRITE_JUMP !== "undefined" ? SPRITE_JUMP : SPRITE_IDLE,
    );
  }
  tSprOK = true;
}

/* ── INIT ────────────────────────────────────────────────────── */
function trailerInit() {
  tCanvas = document.getElementById("trailerCanvas");
  tCtx = tCanvas.getContext("2d");
  trailerResize();
  window.addEventListener("resize", trailerResize);
  window.addEventListener("keydown", trailerKeyDown);
  window.addEventListener("keyup", function (e) {
    tKeys[e.code] = false;
  });

  // Load sprites
  _loadSpriteAssets();

  // Spawn trailer hammers at hammer zone positions
  _spawnTrailerHammers();

  // Boulder starts in roll-chase mode for the boulder zone
  TR.boulderActive = false;

  // Start cinematic loop
  requestAnimationFrame(trailerLoop);
}

function trailerResize() {
  tCanvas.width = window.innerWidth;
  tCanvas.height = window.innerHeight;
}

/* ── HAMMER SPAWNING ─────────────────────────────────────────── */
function _spawnTrailerHammers() {
  var H = tCanvas.height || window.innerHeight;
  var hammerZoneStart = 0.29 * TRAILER_W;
  var hammerZoneEnd = 0.37 * TRAILER_W;
  TR.hammers = [
    {
      anchorX: hammerZoneStart + (hammerZoneEnd - hammerZoneStart) * 0.3,
      anchorY: H * 0.55,
      length: 95,
      angle: Math.PI * 0.5,
      angleV: 0.02,
      g: 0.013,
      hw: 36,
      hh: 22,
      hitCooldown: 0,
    },
    {
      anchorX: hammerZoneStart + (hammerZoneEnd - hammerZoneStart) * 0.65,
      anchorY: H * 0.5,
      length: 110,
      angle: Math.PI * 1.5,
      angleV: -0.018,
      g: 0.012,
      hw: 36,
      hh: 22,
      hitCooldown: 0,
    },
    // Sanctum hammer
    {
      anchorX: 0.72 * TRAILER_W,
      anchorY: H * 0.52,
      length: 100,
      angle: Math.PI * 0.5,
      angleV: 0.024,
      g: 0.015,
      hw: 36,
      hh: 22,
      hitCooldown: 0,
    },
  ];
}

/* ── ZONE RESOLVER ─────────────────────────────────────────────── */
function _getZone(progress) {
  for (var i = ZONES.length - 1; i >= 0; i--) {
    if (progress >= ZONES[i].start) return i;
  }
  return 0;
}

function _currentTheme() {
  var z = ZONES[TR.zone];
  return STAGE_THEMES[z ? z.theme : 0] || STAGE_THEMES[0];
}

/* ── CAPTION SYSTEM ─────────────────────────────────────────────── */
function _showCaption(z) {
  if (TR.captionShown === TR.zone) return;
  TR.captionShown = TR.zone;
  var zone = ZONES[z];
  if (!zone || !zone.title) return;

  var cap = document.getElementById("feature-caption");
  if (!cap) return;

  cap.innerHTML =
    (zone.tag ? '<div class="fc-tag">' + zone.tag + "</div>" : "") +
    '<div class="fc-title">' +
    zone.title +
    "</div>" +
    '<div class="fc-desc">' +
    (zone.desc || "") +
    "</div>";

  cap.classList.add("show");
  clearTimeout(TR._capTimeout);
  TR._capTimeout = setTimeout(function () {
    cap.classList.remove("show");
  }, 3200);

  // Zone label
  var zl = document.getElementById("zone-label");
  if (zl && zone.feature) zl.textContent = zone.feature;
}

/* ── PLATFORM HELPERS ────────────────────────────────────────── */
function _getPlats() {
  return TRAILER_ROOM.sections[0].platforms;
}

function _groundUnder(wx) {
  var floor = tCanvas.height * 0.92;
  var plats = _getPlats();
  var H = tCanvas.height;
  for (var i = 0; i < plats.length; i++) {
    var p = plats[i];
    if (!_platSolid(i)) continue;
    var px = p.x * TRAILER_W;
    var pw = p.w * TRAILER_W;
    var py = p.y * H;
    if (wx >= px && wx <= px + pw && py < floor) floor = py;
  }
  return floor - T_BOULDER_SIZE;
}

function _platSolid(idx) {
  var p = _getPlats()[idx];
  if (!p || !p.fake) return true;
  var st = TR.fakeStates[idx];
  if (!st) return true;
  return st.stage < 2;
}

/* ── UPDATE FAKE PLATFORMS ────────────────────────────────────── */
function _updateFakePlats() {
  var plats = _getPlats();
  var H = tCanvas.height;
  plats.forEach(function (p, idx) {
    if (!p.fake) return;
    var st = TR.fakeStates[idx];
    if (!st) return;
    st.timer--;
    if (st.stage === 0 && st.timer <= 0) {
      st.stage = 1;
      st.timer = 18;
    } else if (st.stage === 1 && st.timer <= 0) {
      st.stage = 2;
    }
  });
}

function _touchFakePlat(idx) {
  if (!TR.fakeStates[idx]) {
    TR.fakeStates[idx] = { stage: 1, timer: 108 };
  }
}

/* ── UPDATE HAMMERS ───────────────────────────────────────────── */
function _updateHammers() {
  TR.hammers.forEach(function (h) {
    if (h.hitCooldown > 0) h.hitCooldown--;
    h.angleV += -h.g * Math.sin(h.angle);
    h.angleV *= 0.9995;
    h.angle += h.angleV;
    if (h.angle > 1.22) {
      h.angle = 1.22;
      h.angleV = -Math.abs(h.angleV) * 0.92;
    }
    if (h.angle < -1.22) {
      h.angle = -1.22;
      h.angleV = Math.abs(h.angleV) * 0.92;
    }

    if (TR.mode === "playable" && !TR.paused) {
      var hx = h.anchorX + Math.sin(h.angle) * h.length;
      var hy = h.anchorY + Math.cos(h.angle) * h.length;
      if (h.hitCooldown <= 0) {
        var plx = tPlayer.x + T_COX,
          ply = tPlayer.y + T_COY;
        var pR = plx + T_CW,
          pB = ply + T_CH;
        var hL = hx - h.hw / 2,
          hR = hx + h.hw / 2,
          hT = hy - h.hh / 2,
          hBot = hy + h.hh / 2;
        if (pR > hL && plx < hR && pB > hT && ply < hBot) {
          var kd = tPlayer.x + T_SW / 2 < hx ? -1 : 1;
          tPlayer.vx = kd * 10;
          tPlayer.vy = -11;
          tPlayer.grounded = false;
          tPlayer.ifrm = 90;
          h.hitCooldown = 90;
          TR.playLives = Math.max(0, TR.playLives - 1);
          _updatePlayHUD();
        }
      }
    }
  });
}

/* ── UPDATE BOULDER ───────────────────────────────────────────── */
function _updateBoulder() {
  var boulderZoneX = 0.44 * TRAILER_W;

  if (TR.mode === "cinematic") {
    // In cinematic mode — always roll chasing camX
    if (!TR.boulderActive && TR.camX > boulderZoneX - tCanvas.width) {
      TR.boulderActive = true;
      TR.boulderX = TR.camX - T_BOULDER_SIZE;
      TR.boulderY = -T_BOULDER_SIZE;
      TR.boulderVy = 0;
      TR.boulderDrop = false;
      TR.boulderRoll = false;
      TR.boulderWarn = 80;
    }
    if (TR.boulderActive) {
      if (!TR.boulderDrop) {
        TR.boulderWarn--;
        TR.boulderX = TR.camX + tCanvas.width * 0.3;
        if (TR.boulderWarn <= 0) {
          TR.boulderY = -T_BOULDER_SIZE;
          TR.boulderDrop = true;
        }
      } else if (!TR.boulderRoll) {
        TR.boulderVy += 0.9;
        TR.boulderY += TR.boulderVy;
        var ly = _groundUnder(TR.boulderX + T_BOULDER_SIZE / 2);
        if (TR.boulderY >= ly) {
          TR.boulderY = ly;
          TR.boulderVy = 0;
          TR.boulderRoll = true;
        }
      } else {
        var tx = TR.camX + tCanvas.width * 0.25;
        var dx = tx - TR.boulderX;
        TR.boulderX += Math.sign(dx) * Math.min(Math.abs(dx), 3.5);
        var gy = _groundUnder(TR.boulderX + T_BOULDER_SIZE / 2);
        if (TR.boulderY < gy) {
          TR.boulderVy += 0.9;
          TR.boulderY += TR.boulderVy;
        } else {
          TR.boulderY = gy;
          TR.boulderVy = 0;
        }
      }
      // Disable after boulder zone passes
      if (TR.camX > 0.52 * TRAILER_W) {
        TR.boulderActive = false;
      }
    }
  } else {
    // Playable mode — follow player in boulder zone
    if (!TR.boulderActive && tPlayer.x > boulderZoneX) {
      TR.boulderActive = true;
      TR.boulderX = tPlayer.x - T_BOULDER_SIZE * 2;
      TR.boulderY = -T_BOULDER_SIZE;
      TR.boulderVy = 0;
      TR.boulderDrop = true;
      TR.boulderRoll = false;
    }
    if (TR.boulderActive) {
      if (!TR.boulderRoll) {
        TR.boulderVy += 0.9;
        TR.boulderY += TR.boulderVy;
        var ly2 = _groundUnder(TR.boulderX + T_BOULDER_SIZE / 2);
        if (TR.boulderY >= ly2) {
          TR.boulderY = ly2;
          TR.boulderVy = 0;
          TR.boulderRoll = true;
        }
      } else {
        var tx2 = tPlayer.x + T_SW / 2 - T_BOULDER_SIZE / 2;
        var dx2 = tx2 - TR.boulderX;
        TR.boulderX += Math.sign(dx2) * Math.min(Math.abs(dx2), 3.0 + si * 0.2);
        var gy2 = _groundUnder(TR.boulderX + T_BOULDER_SIZE / 2);
        TR.boulderY = gy2;
        TR.boulderVy = 0;
      }
      if (tPlayer.x > 0.52 * TRAILER_W) TR.boulderActive = false;
    }
  }
}

/* ── UPDATE PARTICLES ─────────────────────────────────────────── */
function _updatePtcls() {
  for (var i = tPtcls.length - 1; i >= 0; i--) {
    var p = tPtcls[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === "ember") p.vy -= 0.04;
    else p.vy += 0.05;
    p.life -= p.dec;
    if (p.life <= 0) tPtcls.splice(i, 1);
  }
}

function _spawnP(x, y, col, type) {
  tPtcls.push({
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 3,
    vy: -(Math.random() * 2 + 0.5),
    life: 1,
    dec: 0.018 + Math.random() * 0.02,
    sz: Math.random() * 2.5 + 1.5,
    col: col,
    type: type || "ember",
  });
}

/* ── CINEMATIC AUTO-SCROLL UPDATE ────────────────────────────── */
function _updateCinematic() {
  if (TR.paused) return;
  var z = ZONES[TR.zone];
  var targetSpeed = z ? z.speed : 2.0;
  TR.scrollSpeed += (targetSpeed - TR.scrollSpeed) * 0.03;

  // Zone transition
  var newZone = _getZone(TR.camX / TRAILER_W);
  if (newZone !== TR.zone) {
    TR.zone = newZone;
    _showCaption(newZone);
  }

  // Auto-move player forward based on scroll speed
  tPlayer.x += TR.scrollSpeed * 0.5;
  
  // Apply gravity and physics for smooth jumping, walking, sprinting, dashing
  tPlayer.vy += T_GRAV;
  tPlayer.vx *= T_FRIC;
  tPlayer.y += tPlayer.vy;

  // Platform collision
  tPlayer.grounded = false;
  var plats = _getPlats();
  var H = tCanvas.height;
  plats.forEach(function (p, pidx) {
    if (!_platSolid(pidx)) return;
    var rx = p.x * TRAILER_W,
      ry = p.y * H,
      rw = p.w * TRAILER_W,
      rh = p.h * H;
    var cx = tPlayer.x + T_COX,
      cy = tPlayer.y + T_COY;
    var prevBot = cy + T_CH - tPlayer.vy;
    if (
      cx < rx + rw &&
      cx + T_CW > rx &&
      cy + T_CH > ry &&
      prevBot <= ry + 8 &&
      tPlayer.vy >= 0
    ) {
      tPlayer.y = ry - T_COY - T_CH;
      tPlayer.vy = 0;
      tPlayer.grounded = true;
    }
  });

  // Occasional jump for visual variety in cinematic mode
  if (tPlayer.grounded && Math.random() < 0.015) {
    tPlayer.vy = T_JVEL;
    tPlayer.grounded = false;
  }

  // Camera smoothly follows player (centered horizontally and vertically)
  var targetCamX = tPlayer.x + T_SW / 2 - tCanvas.width / 2;
  targetCamX = Math.max(0, Math.min(TRAILER_W - tCanvas.width, targetCamX));
  TR.camX += (targetCamX - TR.camX) * 0.12;
  TR.camX = Math.min(TR.camX, TRAILER_W - tCanvas.width);

  TR.progress = TR.camX / (TRAILER_W - tCanvas.width);

  // Progress bar
  var pf = document.getElementById("trailer-progress-fill");
  if (pf) pf.style.width = TR.progress * 100 + "%";

  // Loop back
  if (TR.camX >= TRAILER_W - tCanvas.width - 10) {
    TR.camX = 0;
    TR.progress = 0;
    TR.zone = 0;
    TR.boulderActive = false;
    TR.fakeStates = {};
    TR.captionShown = -1;
    tPlayer.x = 60;
    tPlayer.y = 0;
    tPlayer.vx = 0;
    tPlayer.vy = 0;
  }
}

/* ── PLAYABLE UPDATE ─────────────────────────────────────────── */
function _updatePlayable() {
  if (TR.paused) return;
  TR.playTimer++;

  var canSpr = tPlayer.stamina > T_SSMIN;
  tPlayer.sprinting =
    (tKeys["ShiftLeft"] || tKeys["ShiftRight"]) && canSpr && !tPlayer.dashing;
  tPlayer.moving = false;

  if (!tPlayer.dashing) {
    var spd = T_BSPD * (tPlayer.sprinting ? T_SMULT : 1);
    if (tKeys["KeyW"] || tKeys["KeyD"] || tKeys["ArrowRight"]) {
      tPlayer.vx += spd;
      tPlayer.dir = 1;
      tPlayer.moving = true;
    }
    if (tKeys["KeyA"] || tKeys["ArrowLeft"]) {
      tPlayer.vx -= spd;
      tPlayer.dir = -1;
      tPlayer.moving = true;
    }
    if (tKeys["KeyS"] || tKeys["ArrowDown"]) {
      tPlayer.vx *= 0.55;
    }
  }

  var cap2 = T_BSPD * (tPlayer.sprinting ? T_SMULT : 1) * 4;
  tPlayer.vx = Math.max(-cap2, Math.min(cap2, tPlayer.vx));

  // Jump
  if (tKeys["Space"] && tPlayer.grounded) {
    tPlayer.vy = T_JVEL;
    tPlayer.grounded = false;
    tKeys["Space"] = false;
  }

  // Dash
  if (
    tKeys["KeyF"] &&
    tPlayer.dcd <= 0 &&
    tPlayer.stamina >= T_DCOST &&
    !tPlayer.dashing
  ) {
    tPlayer.dashing = true;
    tPlayer.dtmr = T_DDUR;
    tPlayer.ddir = tPlayer.dir;
    tPlayer.stamina -= T_DCOST;
    tPlayer.dcd = T_DCDWN;
    if (tPlayer.vy > 0) tPlayer.vy *= 0.3;
    tKeys["KeyF"] = false;
  }
  if (tPlayer.dashing) {
    tPlayer.vx = tPlayer.ddir * T_DSPD;
    tPlayer.dtmr--;
    if (tPlayer.dtmr <= 0) {
      tPlayer.dashing = false;
      tPlayer.vx *= 0.4;
    }
  }

  // Stamina
  if (tPlayer.sprinting && tPlayer.moving)
    tPlayer.stamina = Math.max(0, tPlayer.stamina - T_SDRAIN);
  else if (!tPlayer.dashing)
    tPlayer.stamina = Math.min(
      T_SMAX,
      tPlayer.stamina + (tPlayer.moving ? T_SREGEN * 0.5 : T_SREGEN),
    );
  if (tPlayer.dcd > 0) tPlayer.dcd--;

  tPlayer.vy += T_GRAV;
  tPlayer.vx *= T_FRIC;
  tPlayer.x += tPlayer.vx;
  tPlayer.y += tPlayer.vy;
  if (tPlayer.x < 0) {
    tPlayer.x = 0;
    tPlayer.vx = 0;
  }
  if (tPlayer.x > TRAILER_W - T_SW) {
    tPlayer.x = TRAILER_W - T_SW;
    tPlayer.vx = 0;
  }

  // Platform collision
  tPlayer.grounded = false;
  var plats = _getPlats();
  var H = tCanvas.height;
  plats.forEach(function (p, pidx) {
    if (!_platSolid(pidx)) return;
    var rx = p.x * TRAILER_W,
      ry = p.y * H,
      rw = p.w * TRAILER_W,
      rh = p.h * H;
    var cx = tPlayer.x + T_COX,
      cy = tPlayer.y + T_COY;
    var prevBot = cy + T_CH - tPlayer.vy;
    if (
      cx < rx + rw &&
      cx + T_CW > rx &&
      cy + T_CH > ry &&
      prevBot <= ry + 8 &&
      tPlayer.vy >= 0
    ) {
      tPlayer.y = ry - T_COY - T_CH;
      tPlayer.vy = 0;
      tPlayer.grounded = true;
      if (p.fake) _touchFakePlat(pidx);
    }
  });

  // Void fall
  var voidY = H + T_VOID_OFFSET - T_VOID_H;
  if (tPlayer.y + T_SH >= voidY && tPlayer.vy > 0) {
    tPlayer.y = voidY - T_SH;
    tPlayer.vy = 0;
    tPlayer.vx = 0;
    TR.playLives = Math.max(0, TR.playLives - 1);
    _updatePlayHUD();
    if (TR.playLives <= 0) {
      TR.playLives = 3;
    }
    tPlayer.x = 60;
    TR.camX = 0;
  }

  // Camera follows player
  var targetCamX = tPlayer.x + T_SW / 2 - tCanvas.width / 2;
  targetCamX = Math.max(0, Math.min(TRAILER_W - tCanvas.width, targetCamX));
  TR.camX += (targetCamX - TR.camX) * 0.12;

  TR.progress = TR.camX / (TRAILER_W - tCanvas.width);
  var newZ = _getZone(tPlayer.x / TRAILER_W);
  if (newZ !== TR.zone) {
    TR.zone = newZ;
    _showCaption(newZ);
  }

  var pf2 = document.getElementById("trailer-progress-fill");
  if (pf2) pf2.style.width = TR.progress * 100 + "%";

  // Animation
  if (tPlayer.moving && tPlayer.grounded) {
    tPlayer.atick++;
    if (tPlayer.atick > (tPlayer.sprinting || tPlayer.dashing ? 4 : 7)) {
      var arr = tPlayer.sprinting || tPlayer.dashing ? TSPR.run : TSPR.walk;
      tPlayer.frame = (tPlayer.frame + 1) % Math.max(arr.length, 1);
      tPlayer.atick = 0;
    }
  } else if (!tPlayer.moving && !tPlayer.dashing) {
    tPlayer.frame = 0;
    if (++tPlayer.itick > 40) {
      tPlayer.ifrm = (tPlayer.ifrm + 1) % 2;
      tPlayer.itick = 0;
    }
  }

  _updatePlayHUD();

  // Stam bar
  var sf = document.getElementById("ph-stam-fill");
  if (sf) sf.style.width = (tPlayer.stamina / T_SMAX) * 100 + "%";
}

function _updatePlayHUD() {
  var hb = document.getElementById("ph-health");
  if (!hb) return;
  hb.innerHTML = "";
  for (var i = 0; i < 3; i++) {
    var full = i < TR.playLives;
    hb.innerHTML +=
      '<div class="ph-heart' +
      (full ? " full" : "") +
      '"><svg viewBox="0 0 20 18"><path d="M10 16.5S1 11 1 5.5A4.5 4.5 0 0 1 10 3.6 4.5 4.5 0 0 1 19 5.5C19 11 10 16.5 10 16.5z" fill="' +
      (full ? "#cc2222" : "#2a1010") +
      '" stroke="' +
      (full ? "#ff4444" : "#4a2020") +
      '" stroke-width="1.5"/></svg></div>';
  }
  var t2 = document.getElementById("ph-timer");
  if (t2) {
    var s2 = Math.floor(TR.playTimer / 60);
    t2.textContent =
      String(Math.floor(s2 / 60)).padStart(2, "0") +
      ":" +
      String(s2 % 60).padStart(2, "0");
  }
}

/* ── DRAW ────────────────────────────────────────────────────── */
function trailerDraw() {
  var W = tCanvas.width,
    H = tCanvas.height;
  tCtx.clearRect(0, 0, W, H);

  var th = _currentTheme();
  tFlicker = Math.sin(Date.now() * 0.003) * 0.08 + Math.random() * 0.04;
  tBgX += 0.4;

  tCtx.save();
  tCtx.translate(-TR.camX, 0);

  /* ── BACKGROUND ── */
  _drawBG(th);

  /* ── PLATFORMS ── */
  _drawPlatforms();

  /* ── VOID FLOOR ── */
  _drawVoidFloor(th);

  /* ── ITEMS ── */
  _drawItems();

  /* ── BOULDER ── */
  if (TR.boulderActive) _drawBoulder();

  /* ── HAMMERS ── */
  _drawHammers();

  /* ── PLAYER ── */
  _drawPlayer(th);

  /* ── PARTICLES ── */
  _drawPtcls();

  tCtx.restore();

  /* ── SCREEN-SPACE HUD ── */
  _drawVignette(W, H);

  if (TR.mode === "playable") {
    _drawPlayStam(W, H);
  }

  /* ── FLASH ── */
  if (TR.flashTimer > 0) {
    tCtx.save();
    tCtx.globalAlpha = TR.flashTimer / 10;
    tCtx.fillStyle = "#fff";
    tCtx.fillRect(0, 0, W, H);
    tCtx.restore();
    TR.flashTimer--;
  }
}

/* ── BACKGROUND ─────────────────────────────────────────────── */
function _drawBG(th) {
  var W = TRAILER_W,
    H = tCanvas.height;
  var extra = T_VOID_OFFSET + T_VOID_H + 20;
  var g = tCtx.createLinearGradient(0, 0, 0, H + extra);
  g.addColorStop(0, "#030208");
  g.addColorStop(0.5, "#050305");
  g.addColorStop(1, "#040203");
  tCtx.fillStyle = g;
  tCtx.fillRect(0, 0, W, H + extra);
  tCtx.fillStyle = th.color + "18";
  tCtx.fillRect(0, 0, W, H + extra);
  tCtx.strokeStyle = "rgba(20,12,28,.5)";
  tCtx.lineWidth = 1;
  var bw = 80,
    bh = 50,
    ox = (tBgX * 0.2) % bw;
  for (var bx = -ox + TR.camX; bx < TR.camX + tCanvas.width + bw; bx += bw)
    for (var by = 0; by < H; by += bh)
      tCtx.strokeRect(
        bx + (Math.floor(by / bh) % 2) * bw * 0.5 - bw * 0.25,
        by,
        bw,
        bh,
      );
  // Torches every 800px
  for (var tx = 400; tx < W; tx += 800) {
    var ty = H * 0.28,
      inten = 0.1 + tFlicker * 0.5;
    var tg2 = tCtx.createRadialGradient(tx, ty, 0, tx, ty, 140);
    tg2.addColorStop(0, "rgba(220,110,10," + inten + ")");
    tg2.addColorStop(0.4, "rgba(140,55,6," + inten * 0.3 + ")");
    tg2.addColorStop(1, "transparent");
    tCtx.fillStyle = tg2;
    tCtx.fillRect(0, 0, W, H);
    tCtx.fillStyle = "#3a2010";
    tCtx.fillRect(tx - 5, ty - 28, 10, 22);
    tCtx.fillStyle = "#5a3018";
    tCtx.fillRect(tx - 4, ty - 33, 8, 8);
    tCtx.save();
    tCtx.globalAlpha = 0.7 + tFlicker;
    tCtx.fillStyle = "rgba(220,90,6,.85)";
    tCtx.beginPath();
    tCtx.ellipse(tx, ty - 38 + tFlicker * 6, 5, 10, 0, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.restore();
    if (Math.random() < 0.08)
      _spawnP(tx + (Math.random() - 0.5) * 8, ty - 48, "#cc6008", "ember");
  }
  // Zone-theme colour fog overlay
  _drawZoneFog(th);
  // Dark veil
  tCtx.fillStyle = "rgba(0,0,0,.15)";
  tCtx.fillRect(0, 0, W, H + extra);
}

function _drawZoneFog(th) {
  var W = TRAILER_W,
    H = tCanvas.height;
  ZONES.forEach(function (z) {
    var startX = z.start * TRAILER_W;
    var endX = z.end * TRAILER_W;
    var t = STAGE_THEMES[z.theme] || STAGE_THEMES[0];
    var fogG = tCtx.createLinearGradient(startX, 0, endX, 0);
    fogG.addColorStop(0, "transparent");
    fogG.addColorStop(0.1, t.color + "22");
    fogG.addColorStop(0.9, t.color + "22");
    fogG.addColorStop(1, "transparent");
    tCtx.fillStyle = fogG;
    tCtx.fillRect(startX, 0, endX - startX, H);
  });
}

/* ── PLATFORMS ───────────────────────────────────────────────── */
function _drawPlatforms() {
  var H = tCanvas.height;
  _getPlats().forEach(function (p, idx) {
    if (p.fake) {
      _drawFakePlat(p, idx);
      return;
    }
    var rx = p.x * TRAILER_W,
      ry = p.y * H,
      rw = p.w * TRAILER_W,
      rh = p.h * H;
    // Skip if off-screen
    if (rx + rw < TR.camX - 100 || rx > TR.camX + tCanvas.width + 100) return;
    var sg = tCtx.createLinearGradient(rx, ry, rx, ry + rh);
    sg.addColorStop(0, "#3a2628");
    sg.addColorStop(0.3, "#2c1e1e");
    sg.addColorStop(1, "#180e0e");
    tCtx.fillStyle = sg;
    tCtx.fillRect(rx, ry, rw, rh);
    tCtx.fillStyle = "rgba(212,168,67,.55)";
    tCtx.fillRect(rx, ry, rw, 2);
    tCtx.fillStyle = "rgba(90,65,35,.8)";
    tCtx.fillRect(rx, ry + 2, rw, 2);
    tCtx.fillStyle = "rgba(0,0,0,.4)";
    tCtx.fillRect(rx, ry, 2, rh);
    tCtx.fillRect(rx + rw - 2, ry, 2, rh);
  });
}

function _drawFakePlat(p, idx) {
  var H = tCanvas.height;
  var rx = p.x * TRAILER_W,
    ry = p.y * H,
    rw = p.w * TRAILER_W,
    rh = p.h * H;
  if (rx + rw < TR.camX - 100 || rx > TR.camX + tCanvas.width + 100) return;
  var st = TR.fakeStates[idx];
  if (st && st.stage === 2) return;

  var shakeX = 0,
    shakeY = 0,
    progress = 0;
  if (st && st.stage === 1) {
    progress = 1 - st.timer / 18;
    shakeX = (Math.random() - 0.5) * (4 + progress * 6);
    shakeY = (Math.random() - 0.5) * (2 + progress * 4);
  }
  tCtx.save();
  tCtx.translate(shakeX, shakeY);
  var sg2 = tCtx.createLinearGradient(rx, ry, rx, ry + rh);
  sg2.addColorStop(0, "#3a2628");
  sg2.addColorStop(0.3, "#2c1e1e");
  sg2.addColorStop(1, "#180e0e");
  tCtx.fillStyle = sg2;
  tCtx.fillRect(rx, ry, rw, rh);
  tCtx.fillStyle = "rgba(212,168,67,.55)";
  tCtx.fillRect(rx, ry, rw, 2);
  if (st && st.stage === 1) {
    tCtx.fillStyle = "rgba(0,0,0," + progress * 0.7 + ")";
    tCtx.fillRect(rx, ry, rw, rh);
    tCtx.strokeStyle = "rgba(255,100,30," + (0.6 + progress * 0.4) + ")";
    tCtx.lineWidth = 2;
    tCtx.beginPath();
    tCtx.moveTo(rx + rw * 0.3, ry);
    tCtx.lineTo(rx + rw * 0.2, ry + rh);
    tCtx.moveTo(rx + rw * 0.6, ry);
    tCtx.lineTo(rx + rw * 0.7, ry + rh);
    tCtx.stroke();
    _spawnP(rx + Math.random() * rw, ry + rh * 0.5, "#6a4020", "dust");
  }
  tCtx.restore();
}

/* ── VOID FLOOR ──────────────────────────────────────────────── */
function _drawVoidFloor(th) {
  var W = TRAILER_W,
    H = tCanvas.height;
  var wallY = H + T_VOID_OFFSET - T_VOID_H;
  tCtx.fillStyle = "#0e0808";
  tCtx.fillRect(0, wallY, W, T_VOID_OFFSET + T_VOID_H + 40);
  var brickW = 64,
    brickH = T_BRICK_H;
  var rows = Math.ceil(T_VOID_H / brickH) + 1;
  for (var row = 0; row < rows; row++) {
    var rowY = wallY + row * brickH;
    var off = row % 2 === 0 ? 0 : brickW / 2;
    for (
      var bx2 = TR.camX - brickW + off;
      bx2 < TR.camX + tCanvas.width + brickW;
      bx2 += brickW
    ) {
      var bg3 = tCtx.createLinearGradient(bx2, rowY, bx2, rowY + brickH);
      bg3.addColorStop(0, "#4a2a1a");
      bg3.addColorStop(1, "#2a1208");
      tCtx.fillStyle = bg3;
      tCtx.fillRect(bx2 + 1, rowY + 1, brickW - 2, brickH - 2);
      tCtx.fillStyle = "rgba(120,70,30,.55)";
      tCtx.fillRect(bx2 + 1, rowY + 1, brickW - 2, 2);
      tCtx.fillStyle = "#110606";
      tCtx.fillRect(bx2, rowY, 1, brickH);
      tCtx.fillRect(bx2, rowY, brickW, 1);
    }
  }
  var gl2 = tCtx.createLinearGradient(0, wallY - 80, 0, wallY);
  gl2.addColorStop(0, "transparent");
  gl2.addColorStop(1, "rgba(160,20,20,.2)");
  tCtx.fillStyle = gl2;
  tCtx.fillRect(0, wallY - 80, W, 80);
}

/* ── ITEMS ───────────────────────────────────────────────────── */
function _drawItems() {
  var H = tCanvas.height;
  var t3 = Date.now() * 0.003;
  TRAILER_ROOM.sections[0].items.forEach(function (item) {
    var ix = item.x * TRAILER_W,
      iy = item.y * H,
      bob = Math.sin(t3 + ix * 0.01) * 4;
    if (ix + 40 < TR.camX || ix - 40 > TR.camX + tCanvas.width) return;
    var gl3 = tCtx.createRadialGradient(ix, iy + bob, 2, ix, iy + bob, 30);
    gl3.addColorStop(
      0,
      item.rp ? "rgba(255,215,0,.3)" : "rgba(100,150,255,.2)",
    );
    gl3.addColorStop(1, "transparent");
    tCtx.fillStyle = gl3;
    tCtx.fillRect(ix - 35, iy + bob - 35, 70, 70);
    tCtx.font = "24px serif";
    tCtx.textAlign = "center";
    tCtx.fillText(item.icon, ix, iy + bob);
    tCtx.font = "9px Cinzel,serif";
    tCtx.fillStyle = item.rp ? "rgba(255,215,0,.9)" : "rgba(150,180,255,.9)";
    tCtx.fillText(item.label, ix, iy + bob + 18);
    tCtx.textAlign = "left";
  });
}

/* ── BOULDER ─────────────────────────────────────────────────── */
function _drawBoulder() {
  var bx = TR.boulderX,
    by = TR.boulderY,
    bs = T_BOULDER_SIZE;
  var cx = bx + bs / 2,
    cy = by + bs / 2,
    r = bs / 2;
  if (bx + bs < TR.camX - 20 || bx > TR.camX + tCanvas.width + 20) return;
  tCtx.save();
  var rg = tCtx.createRadialGradient(
    cx - r * 0.28,
    cy - r * 0.28,
    r * 0.04,
    cx,
    cy,
    r,
  );
  rg.addColorStop(0, "#a89080");
  rg.addColorStop(0.35, "#6e5848");
  rg.addColorStop(0.72, "#4c3c30");
  rg.addColorStop(1, "#2c2018");
  tCtx.fillStyle = rg;
  tCtx.beginPath();
  tCtx.arc(cx, cy, r, 0, Math.PI * 2);
  tCtx.fill();
  tCtx.strokeStyle = "rgba(25,12,8,.72)";
  tCtx.lineWidth = 1.5;
  tCtx.beginPath();
  tCtx.moveTo(cx - 9, cy - 13);
  tCtx.lineTo(cx + 3, cy + 1);
  tCtx.lineTo(cx + 15, cy - 7);
  tCtx.stroke();
  tCtx.beginPath();
  tCtx.moveTo(cx - 15, cy + 3);
  tCtx.lineTo(cx - 5, cy + 15);
  tCtx.stroke();
  tCtx.fillStyle = "rgba(230,210,190,.18)";
  tCtx.beginPath();
  tCtx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.3, 0, Math.PI * 2);
  tCtx.fill();
  tCtx.strokeStyle = "rgba(0,0,0,.55)";
  tCtx.lineWidth = 2;
  tCtx.beginPath();
  tCtx.arc(cx, cy, r, 0, Math.PI * 2);
  tCtx.stroke();
  // Dust trail
  if (TR.boulderRoll && Math.random() < 0.45)
    _spawnP(
      bx + (Math.random() < 0.5 ? 2 : bs - 2),
      by + bs - 6,
      "#8a7060",
      "dust",
    );
  tCtx.restore();
}

/* ── HAMMERS ─────────────────────────────────────────────────── */
function _drawHammers() {
  TR.hammers.forEach(function (h) {
    var hx = h.anchorX + Math.sin(h.angle) * h.length;
    var hy = h.anchorY + Math.cos(h.angle) * h.length;
    if (hx < TR.camX - 200 || hx > TR.camX + tCanvas.width + 200) return;
    tCtx.save();
    tCtx.fillStyle = "#5a4020";
    tCtx.beginPath();
    tCtx.arc(h.anchorX, h.anchorY, 8, 0, Math.PI * 2);
    tCtx.fill();
    tCtx.strokeStyle = "#d4a843";
    tCtx.lineWidth = 1.5;
    tCtx.beginPath();
    tCtx.arc(h.anchorX, h.anchorY, 8, 0, Math.PI * 2);
    tCtx.stroke();
    for (var s3 = 1; s3 <= 7; s3++) {
      var t0 = (s3 - 1) / 7,
        t1 = s3 / 7;
      var x0 = h.anchorX + Math.sin(h.angle) * h.length * t0;
      var y0 = h.anchorY + Math.cos(h.angle) * h.length * t0;
      var x1 = h.anchorX + Math.sin(h.angle) * h.length * t1;
      var y1 = h.anchorY + Math.cos(h.angle) * h.length * t1;
      tCtx.strokeStyle = s3 % 2 === 0 ? "#4a3820" : "#7a5830";
      tCtx.lineWidth = 5;
      tCtx.beginPath();
      tCtx.moveTo(x0, y0);
      tCtx.lineTo(x1, y1);
      tCtx.stroke();
    }
    tCtx.translate(hx, hy);
    tCtx.rotate(h.angle);
    tCtx.fillStyle = "#5a3010";
    tCtx.fillRect(-5, -h.hh / 2 - 20, 10, 24);
    var hg2 = tCtx.createLinearGradient(
      -h.hw / 2,
      -h.hh / 2,
      h.hw / 2,
      h.hh / 2,
    );
    hg2.addColorStop(0, "#909090");
    hg2.addColorStop(0.4, "#c0c0c8");
    hg2.addColorStop(1, "#484858");
    tCtx.fillStyle = hg2;
    tCtx.fillRect(-h.hw / 2, -h.hh / 2, h.hw, h.hh);
    tCtx.strokeStyle = "#282830";
    tCtx.lineWidth = 2;
    tCtx.strokeRect(-h.hw / 2, -h.hh / 2, h.hw, h.hh);
    tCtx.fillStyle = "rgba(255,255,255,.22)";
    tCtx.fillRect(-h.hw / 2 + 2, -h.hh / 2 + 2, h.hw - 4, 4);
    tCtx.restore();
  });
}

/* ── PLAYER ──────────────────────────────────────────────────── */
function _drawPlayer(th) {
  var sx = tPlayer.x,
    sy = tPlayer.y;
  tCtx.save();
  if (tPlayer.dashing) {
    tCtx.globalAlpha = 0.55 + Math.random() * 0.3;
    tCtx.shadowBlur = 20;
    tCtx.shadowColor = "#44aaff";
  }
  tCtx.fillStyle = "rgba(0,0,0,.3)";
  tCtx.beginPath();
  tCtx.ellipse(sx + T_SW / 2, sy + T_SH + 2, T_CW * 0.65, 5, 0, 0, Math.PI * 2);
  tCtx.fill();

  // Draw character sprite or fallback
  var img = null;
  if (tSprOK && TSPR.idle) {
    // Jump sprite when airborne
    if (!tPlayer.grounded && TSPR.jump) {
      img = TSPR.jump;
    }
    // Idle or walk when grounded and not moving
    else if (!tPlayer.moving) {
      img = tPlayer.ifrm === 0 ? TSPR.idle : TSPR.idle2;
    }
    // Run when sprinting or dashing
    else if (tPlayer.sprinting || tPlayer.dashing) {
      img =
        TSPR.run && TSPR.run.length > 0
          ? TSPR.run[tPlayer.frame % TSPR.run.length]
          : null;
    }
    // Walk animation
    else {
      img =
        TSPR.walk && TSPR.walk.length > 0
          ? TSPR.walk[tPlayer.frame % TSPR.walk.length]
          : null;
    }
  }

  if (img && img.complete && img.naturalWidth > 0) {
    tCtx.translate(sx + T_SW / 2, sy + T_SH / 2);
    if (tPlayer.dir === -1) {
      tCtx.scale(-1, 1);
    }
    tCtx.drawImage(img, -T_CW / 2, -T_CH / 2, T_CW, T_CH);
  } else {
    // Fallback block character
    if (tPlayer.dir === -1) {
      tCtx.translate((sx + T_SW / 2) * 2, 0);
      tCtx.scale(-1, 1);
    }
    tCtx.fillStyle = th.accentColor || "#d4a843";
    tCtx.fillRect(sx + 8, sy + 20, T_SW - 16, T_SH - 28);
    tCtx.fillStyle = "#f0c080";
    tCtx.fillRect(sx + 10, sy + 2, T_SW - 20, 20);
  }

  // Sprint/dash aura
  if (tPlayer.sprinting || tPlayer.dashing) {
    tCtx.fillStyle = "rgba(255,200,60,.12)";
    tCtx.fillRect(sx, sy, T_SW, T_SH);
  }
  tCtx.restore();
}

/* ── PARTICLES ───────────────────────────────────────────────── */
function _drawPtcls() {
  tPtcls.forEach(function (p) {
    tCtx.save();
    tCtx.globalAlpha = p.life * 0.75;
    tCtx.fillStyle = p.col;
    tCtx.shadowBlur = 6;
    tCtx.shadowColor = p.col;
    tCtx.fillRect(
      Math.round(p.x - p.sz / 2),
      Math.round(p.y - p.sz / 2),
      Math.ceil(p.sz),
      Math.ceil(p.sz),
    );
    tCtx.restore();
  });
}

/* ── STAMINA (play mode) ─────────────────────────────────────── */
function _drawPlayStam(W, H) {
  // Handled by CSS bar — just sync it
  var sf = document.getElementById("ph-stam-fill");
  if (sf) sf.style.width = (tPlayer.stamina / T_SMAX) * 100 + "%";
}

/* ── VIGNETTE ────────────────────────────────────────────────── */
function _drawVignette(W, H) {
  var vg = tCtx.createRadialGradient(
    W / 2,
    H / 2,
    H * 0.18,
    W / 2,
    H / 2,
    H * 0.9,
  );
  vg.addColorStop(0, "transparent");
  vg.addColorStop(1, "rgba(0,0,0,.60)");
  tCtx.fillStyle = vg;
  tCtx.fillRect(0, 0, W, H);
}

/* ── MAIN LOOP ───────────────────────────────────────────────── */
function trailerLoop() {
  tFlicker = Math.sin(Date.now() * 0.003) * 0.08 + Math.random() * 0.04;

  _updatePtcls();
  _updateHammers();
  _updateBoulder();

  if (TR.mode === "cinematic") {
    _updateCinematic();
    // Auto-crumble fakes in cinematic by touching them when camX passes
    _autoCrumbleFakes();
  } else {
    _updatePlayable();
    _updateFakePlats();
  }

  trailerDraw();

  tLoopId = requestAnimationFrame(trailerLoop);
}

/* Auto-crumble fake platforms in cinematic mode when camera passes them */
function _autoCrumbleFakes() {
  var plats = _getPlats();
  var H = tCanvas.height;
  plats.forEach(function (p, idx) {
    if (!p.fake) return;
    var px = p.x * TRAILER_W;
    if (
      px > TR.camX + tCanvas.width * 0.4 &&
      px < TR.camX + tCanvas.width * 0.7
    ) {
      if (!TR.fakeStates[idx]) TR.fakeStates[idx] = { stage: 1, timer: 108 };
    }
    if (TR.fakeStates[idx]) {
      var st = TR.fakeStates[idx];
      st.timer--;
      if (st.stage === 0 && st.timer <= 0) {
        st.stage = 1;
        st.timer = 18;
      } else if (st.stage === 1 && st.timer <= 0) {
        st.stage = 2;
      }
      // Reset when camera moves far past
      if (px < TR.camX - tCanvas.width) {
        delete TR.fakeStates[idx];
      }
    }
  });
}

/* ── INPUT ───────────────────────────────────────────────────── */
function trailerKeyDown(e) {
  tKeys[e.code] = true;

  // P = toggle play/cinematic
  if (e.code === "KeyP") {
    if (TR.mode === "cinematic") _enterPlayMode();
    else _enterCinematicMode();
    return;
  }
  // Escape = cinematic
  if (e.code === "Escape") {
    _enterCinematicMode();
    return;
  }
  // Any movement key = enter play mode
  if (
    [
      "KeyW",
      "KeyA",
      "KeyD",
      "Space",
      "KeyF",
      "ShiftLeft",
      "ShiftRight",
      "ArrowLeft",
      "ArrowRight",
    ].indexOf(e.code) !== -1
  ) {
    if (TR.mode === "cinematic") _enterPlayMode();
  }
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
    ].indexOf(e.code) !== -1
  ) {
    e.preventDefault();
  }
}

/* ── MODE SWITCHING ──────────────────────────────────────────── */
function _enterPlayMode() {
  TR.mode = "playable";
  document.body.classList.remove("cinematic");

  // Snap player to camX position
  tPlayer.x = TR.camX + 120;
  tPlayer.vx = 0;
  tPlayer.vy = 0;
  var plats = _getPlats();
  var H = tCanvas.height;
  var landY = H * 0.88 - T_CH;
  plats.forEach(function (p, idx) {
    if (!_platSolid(idx)) return;
    var px = p.x * TRAILER_W,
      pw = p.w * TRAILER_W,
      py = p.y * H;
    var pcx = tPlayer.x + T_SW / 2;
    if (pcx >= px && pcx <= px + pw && py - T_CH < landY) landY = py - T_CH;
  });
  tPlayer.y = landY - T_COY;
  tPlayer.grounded = true;
  TR.playLives = 3;
  TR.playTimer = 0;
  tPlayer.stamina = T_SMAX;

  // Show play HUD
  var ph = document.getElementById("play-hud");
  var sb = document.getElementById("ph-stambar");
  var pb = document.getElementById("play-btn");
  if (ph) {
    ph.classList.remove("show");
  }
  if (sb) {
    sb.classList.add("show");
  }
  if (pb) {
    pb.classList.remove("show");
  }
  _updatePlayHUD();

  var zl = document.getElementById("zone-label");
  if (zl) zl.textContent = "PLAYABLE MODE — P or ESC to return";

  var cap = document.getElementById("feature-caption");
  if (cap) cap.classList.remove("show");
}

function _enterCinematicMode() {
  TR.mode = "cinematic";
  document.body.classList.add("cinematic");

  var ph = document.getElementById("play-hud");
  var sb = document.getElementById("ph-stambar");
  var pb = document.getElementById("play-btn");
  if (ph) ph.classList.remove("show");
  if (sb) sb.classList.remove("show");
  if (pb) pb.classList.remove("show");

  var zl = document.getElementById("zone-label");
  if (zl) zl.textContent = "";
}

/* ── EXPOSE ──────────────────────────────────────────────────── */
window.trailerInit = trailerInit;
window.enterPlayMode = _enterPlayMode;
window.enterCinematicMode = _enterCinematicMode;
