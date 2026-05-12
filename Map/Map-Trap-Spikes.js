function initStage2SpikeTraps() {
  MAP.spikes = [
    { x: 3000, y: MAP._loftY, w: 96, triggerX: 2870, active: false, riseTimer: 0 },
    { x: 4510, y: MAP._lowerY, w: 64, triggerX: 4420, active: false, riseTimer: 0 },
  ];

  MAP.readySpike = null;
}

function updateStage2SpikeTraps() {
  MAP.spikes.forEach(function (sp) {
    if (sp.active) return;
    if (PL.x + PL_COX + PL.w >= sp.triggerX) {
      sp.active = true;
      sp.riseTimer = 0;
    }
  });

  if (PL.iframes <= 0) {
    MAP.spikes.forEach(function (sp) {
      if (!sp.active) return;

      var spikeH = 32;
      var spikeY = sp.y - spikeH;
      var px3 = PL.x + PL_COX;
      var py3 = PL.y + PL_COY;

      if (
        px3 < sp.x + sp.w &&
        px3 + PL.w > sp.x &&
        py3 + PL.h > spikeY &&
        py3 < sp.y
      ) {
        takeDamage("spike");
      }
    });
  }

  if (MAP.readySpike && PL.iframes <= 0 && !PL.dashing) {
    var rs = MAP.readySpike;
    var spikeH2 = 36;
    var px4 = PL.x + PL_COX;
    var py4 = PL.y + PL_COY;

    if (
      px4 < rs.x + rs.w &&
      px4 + PL.w > rs.x &&
      py4 + PL.h > rs.y - spikeH2 &&
      py4 < rs.y
    ) {
      takeDamage("readySpike");
    }
  }
}

function drawSpikeRack(x, y, w, spikeH, gap) {
  var count = Math.max(3, Math.round(w / gap));
  var toothW = w / count;
  var rackTop = y - 8;
  var rackHeight = 12;

  TX.save();

  TX.fillStyle = "rgba(0,0,0,.32)";
  TX.beginPath();
  TX.ellipse(x + w / 2, y + 6, w * 0.56, 10, 0, 0, Math.PI * 2);
  TX.fill();

  var baseG = TX.createLinearGradient(x, rackTop, x, rackTop + rackHeight);
  baseG.addColorStop(0, "#1b1214");
  baseG.addColorStop(0.45, "#40282b");
  baseG.addColorStop(1, "#12090b");
  TX.fillStyle = baseG;
  TX.fillRect(x, rackTop, w, rackHeight);

  TX.fillStyle = "rgba(255,204,140,.15)";
  TX.fillRect(x, rackTop, w, 2);
  TX.fillStyle = "rgba(90,14,14,.35)";
  TX.fillRect(x, rackTop + rackHeight - 3, w, 2);
  TX.fillStyle = "rgba(0,0,0,.42)";
  TX.fillRect(x, rackTop + rackHeight, w, 4);

  for (var j = 0; j < count; j++) {
    var sx = x + j * toothW;
    var tipX = sx + toothW / 2;
    var leftX = sx + toothW * 0.14;
    var rightX = sx + toothW * 0.86;

    TX.fillStyle = "rgba(0,0,0,.24)";
    TX.beginPath();
    TX.moveTo(leftX + 1, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH + 6);
    TX.lineTo(rightX + 2, rackTop + rackHeight - 1);
    TX.closePath();
    TX.fill();

    var bladeG = TX.createLinearGradient(tipX, y - spikeH, tipX, rackTop + rackHeight);
    bladeG.addColorStop(0, "#f3e5d5");
    bladeG.addColorStop(0.18, "#d8d1c8");
    bladeG.addColorStop(0.55, "#8a8c93");
    bladeG.addColorStop(1, "#2f3137");
    TX.fillStyle = bladeG;

    TX.beginPath();
    TX.moveTo(leftX, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH);
    TX.lineTo(rightX, rackTop + rackHeight - 1);
    TX.closePath();
    TX.fill();

    TX.strokeStyle = "rgba(21,16,18,.72)";
    TX.lineWidth = 1;
    TX.beginPath();
    TX.moveTo(leftX, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH);
    TX.lineTo(rightX, rackTop + rackHeight - 1);
    TX.stroke();

    TX.strokeStyle = "rgba(255,255,255,.26)";
    TX.beginPath();
    TX.moveTo(tipX, y - spikeH + 3);
    TX.lineTo(tipX - toothW * 0.1, rackTop + 1);
    TX.stroke();

    TX.fillStyle = "rgba(104,18,20,.42)";
    TX.beginPath();
    TX.moveTo(leftX + 1, rackTop + rackHeight - 1);
    TX.lineTo(tipX, y - spikeH * 0.34);
    TX.lineTo(rightX - toothW * 0.2, rackTop + rackHeight - 1);
    TX.closePath();
    TX.fill();
  }

  TX.restore();
}

function drawSpikes() {
  MAP.spikes.forEach(function (sp) {
    if (!sp.active) return;
    if (sp.x + sp.w < CAM.x - 20 || sp.x > CAM.x + TC.width + 20) return;
    drawSpikeRack(sp.x, sp.y, sp.w, 42, 22);
  });
}

function drawReadySpike() {
  if (!MAP.readySpike) return;

  var rs = MAP.readySpike;
  if (rs.x + rs.w < CAM.x - 20 || rs.x > CAM.x + TC.width + 20) return;

  var spikeH = 48;
  drawSpikeRack(rs.x, rs.y, rs.w, spikeH, 22);

  TX.fillStyle = "rgba(8,14,22,.72)";
  TX.fillRect(rs.x + rs.w / 2 - 74, rs.y - spikeH - 28, 148, 20);
  TX.strokeStyle = "rgba(68,170,255,.28)";
  TX.strokeRect(rs.x + rs.w / 2 - 74, rs.y - spikeH - 28, 148, 20);
  TX.fillStyle = "rgba(92,184,255,.9)";
  TX.font = "bold 10px Cinzel,serif";
  TX.textAlign = "center";
  TX.fillText("DASH [SHIFT]", rs.x + rs.w / 2, rs.y - spikeH - 14);
  TX.textAlign = "left";
}
