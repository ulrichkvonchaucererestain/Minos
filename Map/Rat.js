var RAT_MIN_COUNT = MOB_MIN_COUNT;
var RAT_MAX_COUNT = MOB_MAX_COUNT;
var RAT_IMG = null;

function loadRatSprite() {
  if (RAT_IMG || typeof SPRITE_RAT === "undefined") return;

  RAT_IMG = new Image();
  RAT_IMG.src = SPRITE_RAT;
}

function initRats() {
  loadRatSprite();

  MAP.rats = [];

  var ratCount = getRandomMobCount();
  var safePlatforms = getMobSpawnPlatforms("rat", 140, ratCount);

  for (var i = 0; i < safePlatforms.length; i++) {
    var platform = safePlatforms[i];
    var ratW = 46;
    var ratH = 32;
    var minX = platform.x + 18;
    var maxX = platform.x + platform.w - ratW - 18;
    var x = minX + Math.random() * Math.max(1, maxX - minX);

    MAP.rats.push({
      x: x,
      y: platform.y - ratH + 6,
      w: ratW,
      h: ratH,
      left: minX,
      right: maxX,
      vx: Math.random() < 0.5 ? -0.7 : 0.7,
      frame: Math.random() * 100,
    });
  }
}
function ratHitsPlayer(rat) {
  var px = PL.x + PL_COX;
  var py = PL.y + PL_COY;

  return (
    px < rat.x + rat.w &&
    px + PL.w > rat.x &&
    py < rat.y + rat.h &&
    py + PL.h > rat.y
  );
}

function updateRats() {
  if (!MAP.rats) return;

  MAP.rats.forEach(function (rat) {
    if (rat.dead) return;
    rat.x += rat.vx;
    rat.frame += 0.15;

    if (rat.x <= rat.left || rat.x >= rat.right) {
      rat.vx *= -1;
    }

    if (PL.iframes <= 0 && ratHitsPlayer(rat)) {
      takeDamage("rat");
      rat.vx *= -1;
      rat.x += rat.vx * 18;
    }
  });
}

function drawRats() {
  if (!MAP.rats) return;

  MAP.rats.forEach(function (rat) {
    if (rat.dead) return; 
    if (rat.x + rat.w < CAM.x - 50 || rat.x > CAM.x + TC.width + 50) return;

    TX.save();

    if (rat.vx < 0) {
      TX.translate(rat.x + rat.w, rat.y);
      TX.scale(-1, 1);
      drawRatImage(0, 0, rat);
    } else {
      drawRatImage(rat.x, rat.y, rat);
    }

    TX.restore();
  });
}

function drawRatImage(x, y, rat) {
  var bob = Math.sin(rat.frame) * 1.5;

  if (RAT_IMG && RAT_IMG.complete && RAT_IMG.naturalWidth) {
    TX.drawImage(RAT_IMG, x, y + bob, rat.w, rat.h);
  } else {
    TX.fillStyle = "#3b3330";
    TX.fillRect(x, y + bob + 10, rat.w, rat.h - 10);
    TX.fillStyle = "#1d1715";
    TX.fillRect(x + rat.w - 10, y + bob + 14, 8, 6);
  }
}
