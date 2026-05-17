function drawSwordItem() {
  if (!MAP.swordItem || MAP.swordItem.collected) return;
  var s = MAP.swordItem;
  if (s.x < CAM.x - 80 || s.x > CAM.x + TC.width + 80) return;

  var bob = Math.sin(Date.now() * 0.003) * 5;
  var ix = s.x - CAM.x;
  var iy = s.y + bob;

  // Glow
  var gl = TX.createRadialGradient(ix, iy, 2, ix, iy, 32);
  gl.addColorStop(0, "rgba(212,168,67,.4)");
  gl.addColorStop(1, "transparent");
  TX.fillStyle = gl;
  TX.fillRect(ix - 40, iy - 40, 80, 80);

  // Draw sword sprite or fallback
  if (SPR.sword && SPR.sword.complete && SPR.sword.naturalWidth) {
    TX.save();
    TX.translate(ix, iy);
    TX.rotate(-Math.PI / 4);
    TX.drawImage(SPR.sword, -18, -18, 36, 36);
    TX.restore();
  } else {
    TX.save();
    TX.translate(ix, iy);
    TX.rotate(-Math.PI / 4);
    TX.fillStyle = "#5a3010";
    TX.fillRect(-3, -18, 6, 10);
    TX.fillStyle = "#d4a843";
    TX.fillRect(-8, -8, 16, 4);
    TX.fillStyle = "#e8eaf0";
    TX.fillRect(-4, -4, 8, 40);
    TX.restore();
  }

  // Label
  TX.fillStyle = "rgba(212,168,67,.85)";
  TX.font = "bold 9px Cinzel,serif";
  TX.textAlign = "center";
  TX.fillText("Sword", ix, iy - 26);
  if (GS.nearSword) {
    TX.fillStyle = "rgba(255,255,180,1)";
    TX.font = "bold 10px Cinzel,serif";
    TX.fillText("[E] Pick up", ix, iy - 14);
  }
  TX.textAlign = "left";
}

function checkSwordPickup() {
  if (GS.hasSword) return;
  if (!MAP.swordItem || MAP.swordItem.collected) return;

  var px = PL.x + PL_COX + PL.w / 2;
  var py = PL.y + PL_COY + PL.h / 2;
  var sx = MAP.swordItem.x;
  var sy = MAP.swordItem.y;
  var dist = Math.hypot(px - sx, py - sy);

  // Show prompt when close
  GS.nearSword = dist < 80;

  // Only pick up when E is pressed
  if (dist < 80 && JP["KeyE"]) {
    MAP.swordItem.collected = true;
    GS.hasSword = true;
    GS.nearSword = false;
    JP["KeyE"] = false;
    showBadge("⚔️ Sword equipped! Press [F] to swing.");
    updateHUD();
  }
}

/* ── SWORD SWING ── */
if (GS.hasSword) {
  if (GS.sword.cooldown > 0) GS.sword.cooldown--;

  if (JP["KeyF"] && !GS.sword.active && GS.sword.cooldown <= 0) {
    GS.sword.active = true;
    GS.sword.timer = 18;
    GS.sword.dir = PL.dir;
    GS.sword.cooldown = 28;
    JP["KeyF"] = false;

    if (MAP.pots) {
      var swingReach = 72;
      var swingCX = PL.x + PL_COX + PL.w / 2 + GS.sword.dir * swingReach * 0.5;
      var swingCY = PL.y + PL_COY + PL.h * 0.45;

      MAP.pots.forEach(function (pot) {
        if (pot.broken) return;
        var potCX = pot.x + pot.w / 2;
        var potCY = pot.y + pot.h / 2;
        var dx = Math.abs(swingCX - potCX);
        var dy = Math.abs(swingCY - potCY);
        if (dx < swingReach && dy < pot.h * 0.7) {
          pot.broken = true;
          pot.breakTimer = 0;
          spawnPotShards(potCX, potCY);
          if (pot.hasGold && !GS.hasGold) {
            spawnDroppedItem(potCX, pot.y, "gold");
            showBadge("⚔️ Pot smashed — Golden Thread found!");
          } else {
            showBadge("⚔️ Empty pot.");
          }
        }
      });
    }
  }

  if (GS.sword.active) {
    GS.sword.timer--;
    if (GS.sword.timer <= 0) GS.sword.active = false;
  }
}

function updateSwordSwing() {
  if (!GS.hasSword) return;
  if (GS.sword.cooldown > 0) GS.sword.cooldown--;

  if (JP["KeyF"] && !GS.sword.active && GS.sword.cooldown <= 0) {
    GS.sword.active = true;
    GS.sword.timer = 18;
    GS.sword.dir = PL.dir;
    GS.sword.cooldown = 28;
    JP["KeyF"] = false;

    if (MAP.pots) {
      var swingReach = 72;
      var swingCX = PL.x + PL_COX + PL.w / 2 + GS.sword.dir * swingReach * 0.5;
      var swingCY = PL.y + PL_COY + PL.h * 0.45;

      MAP.pots.forEach(function (pot) {
        if (pot.broken) return;
        var potCX = pot.x + pot.w / 2;
        var potCY = pot.y + pot.h / 2;
        var dx = Math.abs(swingCX - potCX);
        var dy = Math.abs(swingCY - potCY);
        if (dx < swingReach && dy < pot.h * 0.7) {
          pot.broken = true;
          pot.breakTimer = 0;
          spawnPotShards(potCX, potCY);
          if (pot.hasGold && !GS.hasGold) {
            spawnDroppedItem(potCX, pot.y, "gold");
            showBadge("⚔️ Pot smashed — Golden Thread found!");
          } else {
            showBadge("⚔️ Empty pot.");
          }
        }
      });
    }

    // ── SWORD KILLS RATS ──
    if (MAP.rats) {
      MAP.rats.forEach(function (rat) {
        if (rat.dead) return;
        var ratCX = rat.x + rat.w / 2;
        var ratCY = rat.y + rat.h / 2;
        var dx = Math.abs(swingCX - ratCX);
        var dy = Math.abs(swingCY - ratCY);
        if (dx < swingReach && dy < rat.h * 1.2) {
          rat.dead = true;
          spawnImpactPtcls(ratCX, ratCY, 8);
          showBadge("⚔️ Rat slain!");
        }
      });
    }

    // ── SWORD KILLS BATS ──
    if (MAP.bats) {
      MAP.bats.forEach(function (bat) {
        if (bat.dead) return;
        var batCX = bat.x + bat.w / 2;
        var batCY = bat.y + bat.h / 2;
        var dx = Math.abs(swingCX - batCX);
        var dy = Math.abs(swingCY - batCY);
        if (dx < swingReach && dy < bat.h * 1.5) {
          bat.dead = true;
          spawnImpactPtcls(batCX, batCY, 8);
          showBadge("⚔️ Bat slain!");
        }
      });
    }
  }

  if (GS.sword.active) {
    GS.sword.timer--;
    if (GS.sword.timer <= 0) GS.sword.active = false;
  }
}

function drawSwordAnimation() {
  if (!GS.hasSword || GS.deathFx) return;

  if (GS.sword.active) {
    GS.sword.swingTick++;
    if (GS.sword.swingTick >= 3) {
      GS.sword.swingTick = 0;
      GS.sword.swingFrame++;
    }

    var swingImg = SPR.swing;
    if (swingImg && swingImg.complete && swingImg.naturalWidth) {
      TX.save();
      if (PL.dir === -1) {
        TX.translate(PL.x + PL.sw, PL.y - PL.sh * 0.25);
        TX.scale(-1, 1);
        TX.drawImage(swingImg, 0, 0, PL.sw * 1.5, PL.sh * 1.5);
      } else {
        TX.drawImage(
          swingImg,
          PL.x - PL.sw * 0.25,
          PL.y - PL.sh * 0.25,
          PL.sw * 2.0,
          PL.sh * 1.5,
        );
      }
      TX.restore();
    } else {
      // Fallback — drawn swing arc
      var swingProgress = 1 - GS.sword.timer / 18;
      var handX = PL.x + PL.sw / 2 + PL.dir * 40;
      var handY = PL.y + PL_COY + PL.h * 0.62;
      var idleAngle = PL.dir === 1 ? Math.PI * 0.55 : Math.PI * 0.45;
      var swingAngle =
        PL.dir === 1
          ? idleAngle - Math.PI * 0.9 * Math.sin(swingProgress * Math.PI)
          : idleAngle + Math.PI * 0.9 * Math.sin(swingProgress * Math.PI);
      var swordLen = 62,
        swordW = 10;
      TX.save();
      TX.translate(handX, handY);
      TX.rotate(swingAngle);
      if (swingProgress < 0.85) {
        TX.save();
        TX.globalAlpha = 0.18 * (1 - swingProgress);
        TX.strokeStyle = "#ffe066";
        TX.lineWidth = swordW * 2.2;
        TX.lineCap = "round";
        TX.beginPath();
        TX.moveTo(0, 19);
        TX.lineTo(0, 19 + swordLen);
        TX.stroke();
        TX.restore();
      }
      TX.fillStyle = "#5a3010";
      TX.fillRect(-3, 0, 6, 14);
      TX.fillStyle = "#d4a843";
      TX.fillRect(-10, 14, 20, 5);
      TX.fillStyle = "#e8eaf0";
      TX.fillRect(-swordW / 2, 19, swordW, swordLen);
      TX.restore();
    }
  } else {
    GS.sword.swingFrame = 0;
    GS.sword.swingTick = 0;
  }
}

function updateSwordHUD() {
  var swordHud = document.getElementById("sword-hud");
  if (!swordHud && GS.hasSword) {
    swordHud = document.createElement("div");
    swordHud.id = "sword-hud";
    swordHud.style.cssText = [
      "position:fixed",
      "bottom:54px",
      "right:18px",
      "background:rgba(10,6,4,0.82)",
      "border:1px solid #d4a843",
      "border-radius:6px",
      "padding:4px 10px",
      "color:#e8dcc8",
      "font-family:Cinzel,serif",
      "font-size:11px",
      "pointer-events:none",
      "z-index:200",
    ].join(";");
    swordHud.textContent = "⚔️  [F] Swing";
    document.body.appendChild(swordHud);
  }
  if (swordHud) {
    if (!GS.hasSword) {
      swordHud.style.display = "none";
    } else {
      swordHud.style.display = "";
      var swReady = GS.sword && GS.sword.cooldown <= 0;
      swordHud.style.opacity = swReady ? "1" : "0.45";
    }
  }
}
