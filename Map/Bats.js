var BAT_MIN_COUNT = 3;
var BAT_MAX_COUNT = 5;
var BAT_PLAYER_SPAWN_SAFE_DISTANCE = 900;
var BAT_DAMAGE_DISTANCE = 55;
var BAT_HEIGHT_OFFSET = 19;
var BAT_IMG = null;

function loadBatSprite() {
  if (BAT_IMG || typeof SPRITE_BAT === "undefined") return;

  BAT_IMG = new Image();
  BAT_IMG.src = SPRITE_BAT;
}

function batRectOverlapsPlatform(platform, rect) {
  return (
    rect.x < platform.x + platform.w &&
    rect.x + rect.w > platform.x &&
    Math.abs(rect.y - platform.y) < 180
  );
}

function batPlatformHasDoorOrTrap(platform) {
  var blocked = false;

  if (MAP.doors) {
    MAP.doors.forEach(function (door) {
      if (batRectOverlapsPlatform(platform, door)) blocked = true;
    });
  }

  if (MAP.spikes) {
    MAP.spikes.forEach(function (spike) {
      if (batRectOverlapsPlatform(platform, spike)) blocked = true;
    });
  }

  if (MAP.readySpike && batRectOverlapsPlatform(platform, MAP.readySpike)) {
    blocked = true;
  }

  if (MAP.fireballLauncher) {
    var fireTrap = {
      x: MAP.fireballLauncher.plateX,
      y: FLOOR_Y,
      w: MAP.fireballLauncher.plateW,
      h: 40,
    };

    if (batRectOverlapsPlatform(platform, fireTrap)) blocked = true;
  }

  return blocked;
}

function batPlatformIsNearPlayerSpawn(platform) {
  if (!MAP.spawn) return false;

  var platformCenterX = platform.x + platform.w / 2;
  var platformCenterY = platform.y;
  var spawnCenterX = MAP.spawn.x + PL.w / 2;
  var spawnCenterY = MAP.spawn.y + PL.h / 2;

  return (
    Math.hypot(platformCenterX - spawnCenterX, platformCenterY - spawnCenterY) <
    BAT_PLAYER_SPAWN_SAFE_DISTANCE
  );
}

function initBats() {
  loadBatSprite();

  var safePlatforms = MAP.platforms.filter(function (platform) {
    return (
      platform.w >= 160 &&
      !batPlatformHasDoorOrTrap(platform) &&
      !batPlatformIsNearPlayerSpawn(platform)
    );
  });

  MAP.bats = [];

  var batCount =
    BAT_MIN_COUNT +
    Math.floor(Math.random() * (BAT_MAX_COUNT - BAT_MIN_COUNT + 1));

  for (var i = 0; i < batCount && safePlatforms.length > 0; i++) {
    var platformIndex = Math.floor(Math.random() * safePlatforms.length);
    var platform = safePlatforms.splice(platformIndex, 1)[0];

    var batW = 44;
    var batH = 38;
    var minX = platform.x + 20;
    var maxX = platform.x + platform.w - batW - 20;
    var x = minX + Math.random() * Math.max(1, maxX - minX);
    var y = platform.y - 120 - BAT_HEIGHT_OFFSET - Math.random() * 45;

    MAP.bats.push({
      x: x,
      y: y,
      baseY: y,
      w: batW,
      h: batH,
      left: minX,
      right: maxX,
      vx: Math.random() < 0.5 ? -1.1 : 1.1,
      frame: Math.random() * 100,
    });
  }
}

function batHitsPlayer(bat) {
  var playerCenterX = PL.x + PL_COX + PL.w / 2;
  var playerCenterY = PL.y + PL_COY + PL.h / 2;
  var batCenterX = bat.x + bat.w / 2;
  var batCenterY = bat.y + bat.h / 2;

  return (
    Math.hypot(playerCenterX - batCenterX, playerCenterY - batCenterY) <
    BAT_DAMAGE_DISTANCE
  );
}

function updateBats() {
  if (!MAP.bats) return;

  MAP.bats.forEach(function (bat) {
    bat.x += bat.vx;
    bat.frame += 0.2;
    bat.y = bat.baseY + Math.sin(bat.frame) * 18;

    if (bat.x <= bat.left || bat.x >= bat.right) {
      bat.vx *= -1;
    }

    if (PL.iframes <= 0 && batHitsPlayer(bat)) {
      takeDamage("bat");
      bat.vx *= -1;
      bat.x += bat.vx * 22;
    }
  });
}

function drawBats() {
  if (!MAP.bats) return;

  MAP.bats.forEach(function (bat) {
    if (bat.x + bat.w < CAM.x - 50 || bat.x > CAM.x + TC.width + 50) return;

    TX.save();

    if (bat.vx < 0) {
      TX.translate(bat.x + bat.w, bat.y);
      TX.scale(-1, 1);
      drawBatImage(0, 0, bat);
    } else {
      drawBatImage(bat.x, bat.y, bat);
    }

    TX.restore();
  });
}

function drawBatImage(x, y, bat) {
  if (BAT_IMG && BAT_IMG.complete && BAT_IMG.naturalWidth) {
    TX.drawImage(BAT_IMG, x, y, bat.w, bat.h);
  } else {
    TX.fillStyle = "#221820";
    TX.fillRect(x + 10, y + 12, bat.w - 20, bat.h - 14);
    TX.fillStyle = "#3b2538";
    TX.fillRect(x, y + 16, bat.w, 8);
  }
}
