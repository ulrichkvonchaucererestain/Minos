// ─── Shared mob spawn constants ───────────────────────────────────────────────
var MOB_MIN_COUNT = 3;
var MOB_MAX_COUNT = 4;
var MOB_PLAYER_SPAWN_SAFE_DISTANCE = 900;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRandomMobCount() {
  return (
    MOB_MIN_COUNT +
    Math.floor(Math.random() * (MOB_MAX_COUNT - MOB_MIN_COUNT + 1))
  );
}

function resetMobPlatformReservations() {
  MAP.mobSpawnReservedPlatforms = {};
}

function getMobPlatformKey(platform) {
  var index = MAP.platforms.indexOf(platform);
  if (index >= 0) return String(index);
  return [platform.x, platform.y, platform.w, platform.h || 0].join(":");
}

// ─── Platform safety checks ───────────────────────────────────────────────────

function mobRectOverlapsPlatform(platform, rect) {
  return (
    rect.x < platform.x + platform.w &&
    rect.x + rect.w > platform.x &&
    Math.abs(rect.y - platform.y) < 180
  );
}

function mobPlatformHasDoorOrTrap(platform) {
  var blocked = false;

  if (MAP.doors) {
    MAP.doors.forEach(function (door) {
      if (mobRectOverlapsPlatform(platform, door)) blocked = true;
    });
  }

  if (MAP.spikes) {
    MAP.spikes.forEach(function (spike) {
      if (mobRectOverlapsPlatform(platform, spike)) blocked = true;
    });
  }

  if (MAP.readySpike && mobRectOverlapsPlatform(platform, MAP.readySpike)) {
    blocked = true;
  }

  if (MAP.fireballLauncher) {
    var fireTrap = {
      x: MAP.fireballLauncher.plateX,
      y: FLOOR_Y,
      w: MAP.fireballLauncher.plateW,
      h: 40,
    };
    if (mobRectOverlapsPlatform(platform, fireTrap)) blocked = true;
  }

  return blocked;
}

function mobPlatformIsNearPlayerSpawn(platform) {
  if (!MAP.spawn) return false;

  var platformCenterX = platform.x + platform.w / 2;
  var platformCenterY = platform.y;
  var spawnW = MAP.spawn.w || PL.w;
  var spawnH = MAP.spawn.h || PL.h;
  var spawnCenterX = MAP.spawn.x + spawnW / 2;
  var spawnCenterY = MAP.spawn.y + spawnH / 2;

  return (
    Math.hypot(platformCenterX - spawnCenterX, platformCenterY - spawnCenterY) <
    MOB_PLAYER_SPAWN_SAFE_DISTANCE
  );
}

// ─── Main platform picker ─────────────────────────────────────────────────────

function getMobSpawnPlatforms(mobType, minPlatformWidth, count) {
  if (!MAP.mobSpawnReservedPlatforms) resetMobPlatformReservations();

  var safePlatforms = MAP.platforms.filter(function (platform) {
    var platformKey = getMobPlatformKey(platform);

    return (
      platform.w >= minPlatformWidth &&
      !MAP.mobSpawnReservedPlatforms[platformKey] &&
      !mobPlatformHasDoorOrTrap(platform) &&
      !mobPlatformIsNearPlayerSpawn(platform)
    );
  });

  var pickedPlatforms = [];

  for (var i = 0; i < count && safePlatforms.length > 0; i++) {
    var platformIndex = Math.floor(Math.random() * safePlatforms.length);
    var platform = safePlatforms.splice(platformIndex, 1)[0];
    var platformKey = getMobPlatformKey(platform);

    MAP.mobSpawnReservedPlatforms[platformKey] = mobType;
    pickedPlatforms.push(platform);
  }

  return pickedPlatforms;
}
