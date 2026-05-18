var PLAYER_WALK_AUDIO = null;
var PLAYER_JUMP_AUDIO = null;

function getPlayerSound(kind) {
  var src = null;

  if (kind === "walk") {
    src =
      typeof SPRITE_WALK !== "undefined"
        ? SPRITE_WALK
        : typeof SPRITE_MUSIC_WALK !== "undefined"
          ? SPRITE_MUSIC_WALK
          : null;
  }

  if (kind === "jump") {
    src =
      typeof SPRITE_JUMP !== "undefined"
        ? SPRITE_JUMP
        : typeof SPRITE_MUSIC_JUMP !== "undefined"
          ? SPRITE_MUSIC_JUMP
          : null;
  }

  if (!src) return null;

  if (kind === "walk" && !PLAYER_WALK_AUDIO) {
    PLAYER_WALK_AUDIO = new Audio(src);
    PLAYER_WALK_AUDIO.loop = true;
    PLAYER_WALK_AUDIO.volume = 0.45;
  }

  if (kind === "jump" && !PLAYER_JUMP_AUDIO) {
    PLAYER_JUMP_AUDIO = new Audio(src);
    PLAYER_JUMP_AUDIO.volume = 0.7;
  }

  return kind === "walk" ? PLAYER_WALK_AUDIO : PLAYER_JUMP_AUDIO;
}

function playPlayerJumpSound() {
  var audio = getPlayerSound("jump");
  if (!audio) return;

  audio.currentTime = 0;
  audio.play().catch(function () {});
}

function updatePlayerWalkSound() {
  var audio = getPlayerSound("walk");
  if (!audio) return;

  var shouldPlay =
    PL.moving &&
    PL.grounded &&
    !PL.dashing &&
    Math.abs(PL.vx) > 0.1 &&
    !(typeof GS !== "undefined" && (GS.dead || GS.paused || GS.won));

  if (shouldPlay) {
    if (audio.paused) audio.play().catch(function () {});
  } else {
    audio.pause();
    audio.currentTime = 0;
  }
}

function updatePlayerMovement() {
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

  // Talon
  if ((JP["KeyW"] || JP["Space"] || JP["ArrowUp"]) && PL.grounded) {
    PL.vy = JUMP_V;
    PL.grounded = false;
    PL.frame = 0;
    PL.atick = 0;
    playPlayerJumpSound();
    JP["KeyW"] = JP["Space"] = JP["ArrowUp"] = false;
  }

  // Dash
  if (
    (JP["ShiftLeft"] || JP["ShiftRight"]) &&
    PL.dcd <= 0 &&
    PL.stamina >= DASH_COST &&
    !PL.dashing
  ) {
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
  if (PL.sprinting && PL.moving) {
    PL.stamina = Math.max(0, PL.stamina - STAM_DRAIN);
  } else if (!PL.dashing) {
    PL.stamina = Math.min(
      STAM_MAX,
      PL.stamina + (PL.moving ? STAM_REGEN * 0.5 : STAM_REGEN),
    );
  }

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
  resolvePlatformCollision();

  // Obstacle collision
  var ob = MAP.obstacle;
  if (ob) {
    var plx2 = PL.x + PL_COX;
    var ply2 = PL.y + PL_COY;

    if (
      plx2 < ob.x + ob.w &&
      plx2 + PL.w > ob.x &&
      ply2 + PL.h > ob.y &&
      ply2 < ob.y + ob.h
    ) {
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

  updatePlayerWalkSound();
}
