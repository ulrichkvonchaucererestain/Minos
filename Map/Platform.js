/* ═══════════════════════════════════════════════════════════════════
   Platform.js — Stage I
   Owns: data, collision, and rendering for all platforms.
   Called by stage1.js:
     buildPlatforms()           → inside buildMap()
     resolvePlatformCollision() → inside tutUpdate()
     drawPlatforms()            → inside tutDraw()
═══════════════════════════════════════════════════════════════════ */

/* ── TILE CONSTANT ──────────────────────────────────────────────── */
var TILE = 48;   // 1 game tile = 48px
var FLOOR_Y;     // computed in buildPlatforms() on every resize

/* ═══════════════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════════════ */
function buildPlatforms() {
  // Compute layout values — also used by buildMap() in stage1.js
  FLOOR_Y = Math.round(TC.height * 0.8);
  PL_COX  = Math.round((PL.sw - PL.w) / 2);
  PL_COY  = PL.sh - PL.h;

  var ph       = TILE * 1.5;
  var mezzY    = FLOOR_Y - TILE * 0.7;
  var loftY    = FLOOR_Y - TILE * 1.75;
  var galleryY = FLOOR_Y - TILE * 2.8;
  var lowerY   = FLOOR_Y + TILE * 3.2;
  var rise1Y   = FLOOR_Y + TILE * 2.2;
  var rise2Y   = FLOOR_Y + TILE * 1.2;
  var rise3Y   = FLOOR_Y + TILE * 0.2;

  MAP.platforms = [
    { x: 0,    y: FLOOR_Y,  w: 640,  h: ph },    // starting floor
    { x: 790,  y: mezzY,    w: 260,  h: TILE },   // mezzanine 1
    { x: 1160, y: loftY,    w: 300,  h: TILE },   // loft 1
    { x: 1580, y: galleryY, w: 280,  h: TILE },   // gallery
    { x: 1985, y: loftY,    w: 300,  h: TILE },   // loft 2
    { x: 2405, y: mezzY,    w: 240,  h: TILE },   // mezzanine 2
    { x: 2760, y: loftY,    w: 420,  h: TILE },   // loft 3 (wide)
    { x: 3330, y: FLOOR_Y,  w: 290,  h: ph },     // floor ledge
    { x: 3820, y: lowerY,   w: 430,  h: ph },     // lower section 1
    { x: 4380, y: lowerY,   w: 320,  h: ph },     // lower section 2
    { x: 4850, y: lowerY,   w: 430,  h: ph },     // lower section 3
    { x: 5420, y: rise1Y,   w: 220,  h: TILE },   // rising step 1
    { x: 5710, y: rise2Y,   w: 200,  h: TILE },   // rising step 2
    { x: 6000, y: rise3Y,   w: 260,  h: TILE },   // rising step 3
    { x: 6350, y: loftY,    w: 390,  h: TILE },   // loft 4 (wide)
    { x: 6890, y: mezzY,    w: 260,  h: TILE },   // mezzanine 3
    { x: 7280, y: FLOOR_Y,  w: 1090, h: ph },     // final corridor floor
  ];

  // Expose layout vars so buildMap() in stage1.js can use them
  MAP._ph       = ph;
  MAP._mezzY    = mezzY;
  MAP._loftY    = loftY;
  MAP._galleryY = galleryY;
  MAP._lowerY   = lowerY;
  MAP._rise1Y   = rise1Y;
  MAP._rise2Y   = rise2Y;
  MAP._rise3Y   = rise3Y;
}

/* ═══════════════════════════════════════════════════════════════════
   COLLISION
═══════════════════════════════════════════════════════════════════ */
function resolvePlatformCollision() {
  PL.grounded = false;

  MAP.platforms.forEach(function (p) {
    var plx     = PL.x + PL_COX;
    var ply     = PL.y + PL_COY;
    var prevBot = ply + PL.h - PL.vy; // bottom edge one frame ago

    if (
      plx < p.x + p.w &&    // horizontal overlap
      plx + PL.w > p.x &&
      ply + PL.h > p.y &&    // current frame overlaps top surface
      prevBot <= p.y + 8 &&  // was above platform last frame
      PL.vy >= 0             // falling or stationary (not jumping up)
    ) {
      PL.y        = p.y - PL_COY - PL.h; // snap onto surface
      PL.vy       = 0;
      PL.grounded = true;
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   RENDERING
═══════════════════════════════════════════════════════════════════ */
function drawPlatforms() {
  MAP.platforms.forEach(function (p) {
    // Frustum cull — skip off-screen platforms
    if (p.x + p.w < CAM.x - 20 || p.x > CAM.x + TC.width + 20) return;

    /* ── Base gradient fill ── */
    var sg = TX.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
    sg.addColorStop(0,    "#372224");
    sg.addColorStop(0.18, "#2a1a1c");
    sg.addColorStop(1,    "#140c10");
    TX.fillStyle = sg;
    TX.fillRect(p.x, p.y, p.w, p.h);

    /* ── Top-edge highlight strips ── */
    TX.fillStyle = "rgba(232,194,106,.62)";
    TX.fillRect(p.x, p.y,     p.w, 2);           // bright gold line
    TX.fillStyle = "rgba(120,86,44,.82)";
    TX.fillRect(p.x, p.y + 2, p.w, 4);           // warm brown sub-strip
    TX.fillStyle = "rgba(255,248,224,.06)";
    TX.fillRect(p.x + 6, p.y + 7, p.w - 12, 1); // faint inner shimmer

    /* ── Side / bottom shadows ── */
    TX.fillStyle = "rgba(0,0,0,.4)";
    TX.fillRect(p.x,           p.y, 3,  p.h);    // left edge
    TX.fillRect(p.x + p.w - 3, p.y, 3,  p.h);    // right edge
    TX.fillRect(p.x + 10, p.y + p.h - 8, Math.max(0, p.w - 20), 8); // bottom

    /* ── Optional decorative frieze (platform sprite) ── */
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
        18
      );
      TX.restore();
    }
  });
}