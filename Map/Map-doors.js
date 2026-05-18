function getStage2DoorPlatformY(doorX, doorW, doorH) {
  if (!MAP.platforms) return FLOOR_Y - doorH;

  for (var i = 0; i < MAP.platforms.length; i++) {
    var platform = MAP.platforms[i];

    var doorFitsOnPlatform =
      doorX >= platform.x && doorX + doorW <= platform.x + platform.w;

    if (doorFitsOnPlatform) {
      return platform.y - doorH;
    }
  }

  return FLOOR_Y - doorH;
}

function initStage2Doors() {
  var dW = 118;
  var dH = 154;
  var correctDoorIndex = Math.floor(Math.random() * 3);

  var door1X = 2460;
  var door2X = 5120;
  var door3X = 7800;

  MAP.doors = [
    {
      x: door1X,
      y: getStage2DoorPlatformY(door1X, dW, dH),
      w: dW,
      h: dH,
      correct: correctDoorIndex === 0,
      fake: correctDoorIndex !== 0,
      label: correctDoorIndex === 0 ? "???" : "DOOR I",
      hint: "The true path lies where shadows gather near the climb.",
    },
    {
      x: door2X,
      y: getStage2DoorPlatformY(door2X, dW, dH),
      w: dW,
      h: dH,
      correct: correctDoorIndex === 1,
      fake: correctDoorIndex !== 1,
      label: correctDoorIndex === 1 ? "???" : "DOOR II",
      hint: "Seek the threshold where the bones whisper warnings.",
    },
    {
      x: door3X,
      y: getStage2DoorPlatformY(door3X, dW, dH),
      w: dW,
      h: dH,
      correct: correctDoorIndex === 2,
      fake: correctDoorIndex !== 2,
      label: correctDoorIndex === 2 ? "???" : "DOOR III",
      hint: "The exit breathes where the thread of gold was spun.",
    },
  ];

  MAP.correctDoorIndex = correctDoorIndex;

  MAP.doors.forEach(function (d) {
    d.attempted = false;
  });

  MAP.doorFrameRect = null;
}

function resetStage2Doors() {
  if (!MAP.doors || MAP.doors.length !== 3) return;

  var newCorrect = Math.floor(Math.random() * 3);
  MAP.correctDoorIndex = newCorrect;

  MAP.doors.forEach(function (d, i) {
    d.correct = i === newCorrect;
    d.fake = i !== newCorrect;
    d.label = i === newCorrect ? "???" : "DOOR " + ["I", "II", "III"][i];
    d.attempted = false;
  });
}

function updateStage2Doors() {
  GS.activeDoorIndex = -1;

  MAP.doors.forEach(function (door, i) {
    var px7 = PL.x + PL_COX;
    var py7 = PL.y + PL_COY;

    if (
      px7 < door.x + door.w + 10 &&
      px7 + PL.w > door.x - 10 &&
      py7 + PL.h > door.y &&
      py7 < door.y + door.h
    ) {
      GS.activeDoorIndex = i;

      if (JP["KeyE"]) {
        if (door.fake) {
          wrongDoor();
        } else {
          showQuizModal(i);
        }

        JP["KeyE"] = false;
      }
    }
  });
}

function wrongDoor() {
  if (GS.jumpscareActive) return;

  GS.jumpscareActive = true;
  GS.paused = true;

  var overlay = document.createElement("div");
  overlay.id = "mino-jumpscare";
  overlay.style.cssText = [
    "position:fixed",
    "inset:0",
    "z-index:9999",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:#000",
    "opacity:0",
    "transition:opacity 0.05s",
    "overflow:hidden",
  ].join(";");

  var img = new Image();
  img.style.cssText = [
    "max-width:100vw",
    "max-height:100vh",
    "width:100vw",
    "height:100vh",
    "object-fit:cover",
    "transform:scale(1.08)",
    "image-rendering:pixelated",
    "filter:brightness(1.3) contrast(1.4)",
  ].join(";");

  if (typeof SPRITE_MINO !== "undefined") {
    img.src = SPRITE_MINO;
  } else {
    overlay.style.background = "#cc0000";

    var txt = document.createElement("div");
    txt.textContent = "YOU CHOSE WRONG";
    txt.style.cssText =
      "color:#fff;font-size:80px;font-weight:bold;font-family:serif;text-shadow:0 0 40px #ff0000;";
    overlay.appendChild(txt);
  }

  overlay.appendChild(img);
  document.body.appendChild(overlay);

  var fl = document.getElementById("wrong-flash");
  if (fl) {
    fl.classList.add("show");
    setTimeout(function () {
      fl.classList.remove("show");
    }, 200);
  }

  TC.style.transition = "transform 0s";

  var shakeCount = 0;
  var shakeInterval = setInterval(function () {
    var dx = (Math.random() - 0.5) * 18;
    var dy = (Math.random() - 0.5) * 18;
    TC.style.transform = "translate(" + dx + "px," + dy + "px)";
    shakeCount++;

    if (shakeCount > 8) {
      clearInterval(shakeInterval);
      TC.style.transform = "";
    }
  }, 40);

  requestAnimationFrame(function () {
    overlay.style.opacity = "1";
  });

  setTimeout(function () {
    img.style.transition = "transform 0.4s ease-out";
    img.style.transform = "scale(1.22)";
  }, 60);

  setTimeout(function () {
    overlay.style.transition = "opacity 0.35s";
    overlay.style.opacity = "0";

    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);

      GS.jumpscareActive = false;
      GS.paused = false;
      GS.lives = 3;

      resetToStart();
      showBadge("Wrong door! Start again...");
    }, 380);
  }, 1100);
}

function drawDoors() {
  MAP.doors.forEach(function (door, i) {
    if (door.x + door.w < CAM.x - 20 || door.x > CAM.x + TC.width + 20) return;

    var lit = door.correct;
    var pulse = lit ? 0.7 + 0.3 * Math.sin(Date.now() * 0.004) : 1;

    TX.save();
    TX.fillStyle = "rgba(0,0,0,.22)";
    TX.beginPath();
    TX.ellipse(
      door.x + door.w / 2,
      door.y + door.h + 10,
      door.w * 0.56,
      10,
      0,
      0,
      Math.PI * 2,
    );
    TX.fill();

    TX.fillStyle = "rgba(32,18,18,.88)";
    TX.fillRect(door.x - 14, door.y + door.h - 14, door.w + 28, 30);

    TX.fillStyle = "rgba(232,194,106,.18)";
    TX.fillRect(door.x - 14, door.y + door.h - 14, door.w + 28, 2);
    TX.restore();

    if (lit) {
      TX.save();
      TX.shadowBlur = 40 + 10 * Math.sin(Date.now() * 0.006);
      TX.shadowColor = "rgba(255,215,0,0.6)";

      var glowG = TX.createRadialGradient(
        door.x + door.w / 2,
        door.y + door.h / 2,
        5,
        door.x + door.w / 2,
        door.y + door.h / 2,
        100 + 15 * Math.sin(Date.now() * 0.003),
      );

      glowG.addColorStop(
        0,
        "rgba(255,215,0," + (0.25 + 0.1 * Math.sin(Date.now() * 0.005)) + ")",
      );
      glowG.addColorStop(
        0.4,
        "rgba(255,180,60," + (0.12 + 0.06 * Math.sin(Date.now() * 0.004)) + ")",
      );
      glowG.addColorStop(1, "transparent");

      TX.fillStyle = glowG;
      TX.fillRect(door.x - 60, door.y - 40, door.w + 120, door.h + 80);

      for (var spk = 0; spk < 5; spk++) {
        var spkAngle = Date.now() * 0.002 + (spk / 5) * Math.PI * 2;
        var spkRadius = 50 + 20 * Math.sin(Date.now() * 0.003 + spk);
        var spkX = door.x + door.w / 2 + Math.cos(spkAngle) * spkRadius;
        var spkY = door.y + door.h / 2 + Math.sin(spkAngle) * spkRadius * 0.6;
        var spkAlpha = 0.4 + 0.4 * Math.sin(Date.now() * 0.005 + spk);

        TX.fillStyle = "rgba(255,230,150," + spkAlpha + ")";
        TX.beginPath();
        TX.arc(
          spkX,
          spkY,
          2 + Math.sin(Date.now() * 0.007 + spk),
          0,
          Math.PI * 2,
        );
        TX.fill();
      }

      TX.restore();
    }

    var frame = SPR.decor.doorFrame;
    if (frame && frame.complete && frame.naturalWidth) {
      var cropX = frame.naturalWidth * 0.5;
      var cropW = frame.naturalWidth * 0.5;
      var cropY = frame.naturalHeight * 0.255;
      var cropH = frame.naturalHeight * 0.745;
      var drawY = door.y + 12;
      var drawH = door.h - 4;

      TX.globalAlpha = lit ? pulse : 0.88;
      TX.drawImage(
        frame,
        cropX,
        cropY,
        cropW,
        cropH,
        door.x - 2,
        drawY,
        door.w + 4,
        drawH,
      );
      TX.globalAlpha = 1;
    } else {
      var img = lit ? SPR.door2 : SPR.door1;

      if (img && img.complete && img.naturalWidth) {
        TX.globalAlpha = lit ? pulse : 0.75;
        TX.drawImage(img, door.x, door.y, door.w, door.h);
        TX.globalAlpha = 1;
      } else {
        TX.fillStyle = lit ? "#8a6a20" : "#3a2010";
        TX.fillRect(door.x, door.y, door.w, door.h);

        TX.fillStyle = lit ? "#ffd700" : "#5a3818";
        TX.fillRect(door.x + 4, door.y + 4, door.w - 8, door.h - 8);

        if (lit) {
          TX.fillStyle = "#ffd700";
          TX.font = "bold 18px serif";
          TX.textAlign = "center";
          TX.fillText("✓", door.x + door.w / 2, door.y + door.h / 2 + 6);
          TX.textAlign = "left";
        }

        TX.strokeStyle = lit ? "#ffd700" : "#5a3818";
        TX.lineWidth = 3;
        TX.strokeRect(door.x, door.y, door.w, door.h);
      }
    }

    TX.fillStyle = door.correct ? "rgba(255,215,0,.9)" : "rgba(212,168,67,.4)";
    TX.font = "9px Cinzel,serif";
    TX.textAlign = "center";
    TX.fillText(
      door.label || "EXIT",
      door.x + door.w / 2,
      door.y + door.h + 14,
    );

    if (GS.activeDoorIndex === i) {
      TX.fillStyle = "rgba(255,215,0,.95)";
      if (door.attempted) {
        TX.fillText("[E] RETRY", door.x + door.w / 2, door.y - 8);
      } else {
        TX.fillText("[E] ENTER", door.x + door.w / 2, door.y - 8);
      } 
    }

    TX.textAlign = "left";
  });
}
