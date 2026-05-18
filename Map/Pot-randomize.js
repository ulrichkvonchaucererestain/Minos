var STAGE2_POT_W = 52;
var STAGE2_POT_H = 68;
var STAGE2_POT_DOOR_SAFE_X = 360;
var STAGE2_POT_DOOR_SAFE_Y = 120;
var STAGE2_POT_TRAP_SAFE_X = 260;
var STAGE2_POT_TRAP_SAFE_Y = 90;

function stage2RectsOverlap(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

function isStage2PotNearDoor(pos, doors) {
  if (!doors) return false;

  var potRect = {
    x: pos.x,
    y: pos.y,
    w: STAGE2_POT_W,
    h: STAGE2_POT_H,
  };

  return doors.some(function (door) {
    var safeDoorRect = {
      x: door.x - STAGE2_POT_DOOR_SAFE_X,
      y: door.y - STAGE2_POT_DOOR_SAFE_Y,
      w: door.w + STAGE2_POT_DOOR_SAFE_X * 2,
      h: door.h + STAGE2_POT_DOOR_SAFE_Y * 2,
    };

    return stage2RectsOverlap(potRect, safeDoorRect);
  });
}

function isStage2PotNearTrap(pos, floorY) {
  var potRect = {
    x: pos.x,
    y: pos.y,
    w: STAGE2_POT_W,
    h: STAGE2_POT_H,
  };

  if (MAP.spikes) {
    var nearSpike = MAP.spikes.some(function (spike) {
      var spikeRect = {
        x: spike.x - STAGE2_POT_TRAP_SAFE_X,
        y: spike.y - 60 - STAGE2_POT_TRAP_SAFE_Y,
        w: spike.w + STAGE2_POT_TRAP_SAFE_X * 2,
        h: 80 + STAGE2_POT_TRAP_SAFE_Y * 2,
      };

      var triggerRect = {
        x: spike.triggerX - STAGE2_POT_TRAP_SAFE_X,
        y: spike.y - STAGE2_POT_TRAP_SAFE_Y,
        w: STAGE2_POT_TRAP_SAFE_X * 2,
        h: STAGE2_POT_TRAP_SAFE_Y * 2,
      };

      return (
        stage2RectsOverlap(potRect, spikeRect) ||
        stage2RectsOverlap(potRect, triggerRect)
      );
    });

    if (nearSpike) return true;
  }

  if (MAP.readySpike) {
    var readySpikeRect = {
      x: MAP.readySpike.x - STAGE2_POT_TRAP_SAFE_X,
      y: MAP.readySpike.y - 70 - STAGE2_POT_TRAP_SAFE_Y,
      w: MAP.readySpike.w + STAGE2_POT_TRAP_SAFE_X * 2,
      h: 100 + STAGE2_POT_TRAP_SAFE_Y * 2,
    };

    if (stage2RectsOverlap(potRect, readySpikeRect)) return true;
  }

  if (MAP.fireballLauncher) {
    var fireballPlateRect = {
      x: MAP.fireballLauncher.plateX - STAGE2_POT_TRAP_SAFE_X,
      y: floorY - STAGE2_POT_TRAP_SAFE_Y,
      w: MAP.fireballLauncher.plateW + STAGE2_POT_TRAP_SAFE_X * 2,
      h: STAGE2_POT_TRAP_SAFE_Y * 2,
    };

    var fireballZoneRect = {
      x: MAP.fireballLauncher.x - STAGE2_POT_TRAP_SAFE_X,
      y: floorY - 140,
      w: MAP.fireballLauncher.rangeW + STAGE2_POT_TRAP_SAFE_X * 2,
      h: 220,
    };

    return (
      stage2RectsOverlap(potRect, fireballPlateRect) ||
      stage2RectsOverlap(potRect, fireballZoneRect)
    );
  }

  return false;
}

function getStage2PotPlatformPosition(pos) {
  if (!MAP.platforms) return null;

  for (var i = 0; i < MAP.platforms.length; i++) {
    var platform = MAP.platforms[i];

    var potFitsOnPlatform =
      pos.x >= platform.x + 8 &&
      pos.x + STAGE2_POT_W <= platform.x + platform.w - 8;

    if (potFitsOnPlatform) {
      return {
        x: pos.x,
        y: platform.y - STAGE2_POT_H,
      };
    }
  }

  return null;
}

function shuffleStage2Pots(list) {
  var copy = list.slice();

  for (var i = copy.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }

  return copy;
}

function initStage2Pots(mezzY, lowerY, loftY, galleryY, floorY) {
  MAP.gold = null;

  var candidates = [
    { x: 920 },
    { x: 1320 },
    { x: 1760 },
    { x: 3010 },
    { x: 4070 },
    { x: 4920 },
    { x: 6555 },
    { x: 7070 },
    { x: 7430 },
    { x: 8200 },
  ]
    .map(getStage2PotPlatformPosition)
    .filter(function (pos) {
      return pos !== null;
    });

  var safePositions = candidates.filter(function (pos) {
    return (
      !isStage2PotNearDoor(pos, MAP.doors) && !isStage2PotNearTrap(pos, floorY)
    );
  });

  if (safePositions.length < 3) {
    safePositions = candidates.filter(function (pos) {
      return !isStage2PotNearDoor(pos, MAP.doors);
    });
  }

  if (safePositions.length < 3) {
    safePositions = candidates;
  }

  var selected = shuffleStage2Pots(safePositions).slice(0, 3);
  var goldPotIndex = Math.floor(Math.random() * selected.length);

  MAP.pots = selected.map(function (pos, i) {
    return {
      x: pos.x,
      y: pos.y,
      w: STAGE2_POT_W,
      h: STAGE2_POT_H,
      hasGold: i === goldPotIndex,
      broken: false,
      breakTimer: 0,
    };
  });
}

function resetStage2Pots() {
  if (!MAP.pots) return;

  var newGoldPot = Math.floor(Math.random() * MAP.pots.length);

  MAP.pots.forEach(function (pot, i) {
    pot.hasGold = i === newGoldPot;
    pot.broken = false;
    pot.breakTimer = 0;
  });
}

function updateStage2Pots() {
  if (!MAP.pots) return;

  MAP.pots.forEach(function (pot) {
    if (pot.broken) pot.breakTimer++;
  });
}

function drawPots() {
  if (!MAP.pots) return;

  MAP.pots.forEach(function (pot) {
    if (pot.x + pot.w < CAM.x - 60 || pot.x > CAM.x + TC.width + 60) return;
    if (pot.broken) return;

    TX.save();

    var potImg = SPR.pot;
    if (potImg && potImg.complete && potImg.naturalWidth) {
      TX.drawImage(potImg, pot.x, pot.y, pot.w, pot.h);
    } else {
      TX.fillStyle = "#8B6955";
      TX.beginPath();
      TX.ellipse(
        pot.x + pot.w / 2,
        pot.y + pot.h * 0.72,
        pot.w * 0.42,
        pot.h * 0.28,
        0,
        0,
        Math.PI * 2,
      );
      TX.fill();

      TX.fillStyle = "#A0785A";
      TX.fillRect(
        pot.x + pot.w * 0.18,
        pot.y + pot.h * 0.1,
        pot.w * 0.64,
        pot.h * 0.65,
      );

      TX.fillStyle = "#C4A882";
      TX.fillRect(pot.x + pot.w * 0.14, pot.y + pot.h * 0.08, pot.w * 0.72, 8);
    }

    TX.restore();
  });
}

function spawnPotShards(cx, cy) {
  for (var i = 0; i < 14; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = Math.random() * 5 + 2;

    GS.ptcls.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      life: 1,
      dec: 0.04 + Math.random() * 0.03,
      sz: Math.random() * 5 + 3,
      col: Math.random() < 0.5 ? "#8B6955" : "#C4A882",
      type: "dust",
    });
  }
}
