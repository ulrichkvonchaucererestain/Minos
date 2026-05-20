function initStage2FireballTrap() {
  var fireballStart = MAP.platformById.fireballStart;
  var fireballEnd = MAP.platformById.fireballEnd;

  MAP.fireballLauncher = {
    x: fireballStart.x + 160,
    rangeW: fireballEnd.x + fireballEnd.w - (fireballStart.x + 160),
    intervalFrames: 60,
    timer: 60,
    triggered: false,
    plateX: fireballStart.x + 160,
    plateY: fireballStart.y,
    plateW: 120,
    speed: Math.max(4, Math.round(TC.height / (1.3 * 60))),
  };

  GS.fireballs = [];
}

function updateStage2FireballTrap() {
  if (!MAP.fireballLauncher) return;
  if (!GS.fireballs) GS.fireballs = [];

  var launcher = MAP.fireballLauncher;
  var plFeetX = PL.x + PL_COX;
  var plFeetX2 = plFeetX + PL.w;
  var plFeetY = PL.y + PL_COY + PL.h;
  var onFloor = PL.grounded && Math.abs(plFeetY - launcher.plateY) <= 8;

  var onPlate =
    plFeetX2 > launcher.plateX &&
    plFeetX < launcher.plateX + launcher.plateW &&
    onFloor;

  if (onPlate && !launcher.triggered) {
    launcher.triggered = true;
  }

  if (launcher.triggered) {
    launcher.timer++;

    if (launcher.timer >= launcher.intervalFrames) {
      launcher.timer = 0;

      GS.fireballs.push({
        x: launcher.x + Math.random() * launcher.rangeW - 24,
        y: -48,
        vx: 0,
        vy: launcher.speed,
        w: 48,
        h: 48,
      });
    }
  }

  for (var i = GS.fireballs.length - 1; i >= 0; i--) {
    var fb = GS.fireballs[i];
    fb.y += fb.vy;

    if (fb.y > FLOOR_Y + 60) {
      GS.fireballs.splice(i, 1);
      continue;
    }

    if (PL.iframes <= 0) {
      var px = PL.x + PL_COX;
      var py = PL.y + PL_COY;

      if (
        px < fb.x + fb.w &&
        px + PL.w > fb.x &&
        py < fb.y + fb.h &&
        py + PL.h > fb.y
      ) {
        takeDamage("fireball");
        GS.fireballs.splice(i, 1);
      }
    }
  }
}

function drawFireballs() {
  if (!GS.fireballs) return;

  GS.fireballs.forEach(function (fb) {
    if (fb.x < CAM.x - 80 || fb.x > CAM.x + TC.width + 80) return;

    TX.save();
    TX.translate(fb.x + fb.w / 2, fb.y + fb.h / 2);
    TX.rotate(Math.PI);

    if (SPR.fireball && SPR.fireball.complete && SPR.fireball.naturalWidth) {
      TX.shadowBlur = 18;
      TX.shadowColor = "rgba(255,120,0,0.85)";
      TX.drawImage(
        SPR.fireball,
        -fb.w * 0.6,
        -fb.h * 0.6,
        fb.w * 1.2,
        fb.h * 1.2,
      );
    } else {
      TX.shadowBlur = 22;
      TX.shadowColor = "rgba(255,100,0,0.9)";
      TX.fillStyle = "#ff6600";
      TX.beginPath();
      TX.arc(0, 0, fb.w / 2, 0, Math.PI * 2);
      TX.fill();

      TX.fillStyle = "#ffee44";
      TX.beginPath();
      TX.arc(0, 0, fb.w / 4, 0, Math.PI * 2);
      TX.fill();

      TX.fillStyle = "rgba(255,80,0,0.6)";
      TX.beginPath();
      TX.moveTo(-8, -fb.h / 2);
      TX.lineTo(8, -fb.h / 2);
      TX.lineTo(0, -fb.h);
      TX.closePath();
      TX.fill();
    }

    TX.restore();
  });
}
