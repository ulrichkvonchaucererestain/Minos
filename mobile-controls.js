(function () {
  var MOBILE_QUERY = "(max-width: 900px), (max-height: 520px)";
  var FULLSCREEN_PREF_KEY = "minos_fullscreen_preferred";
  var mobileControlsQuery = window.matchMedia(MOBILE_QUERY);

  var KEY_LABELS = {
    KeyA: { key: "a", label: "Left" },
    KeyD: { key: "d", label: "Right" },
    Space: { key: " ", label: "Jump" },
    ShiftLeft: { key: "Shift", label: "Dash" },
    ShiftRight: { key: "Shift", label: "Dash" },
    KeyE: { key: "e", label: "E" },
    KeyQ: { key: "q", label: "Throw" },
  };

  var CONTROL_ICONS = {
    KeyE:
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
      '<path d="M16 4v8" />' +
      '<path d="M11 7.5a10 10 0 1 0 10 0" />' +
      "</svg>",
    KeyQ:
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
      '<path d="M7 22 24 8" />' +
      '<path d="m20 7 5 2-1 5" />' +
      '<path d="M8 22l-2 4 4-2" />' +
      '<path d="M12 18c3.5 1.8 6.8 1.7 10-.3" />' +
      "</svg>",
    ShiftLeft:
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
      '<path d="M5 17h14" />' +
      '<path d="m15 10 7 7-7 7" />' +
      '<path d="M4 10h7" />' +
      '<path d="M4 24h7" />' +
      "</svg>",
    Space:
      '<svg viewBox="0 0 32 32" aria-hidden="true">' +
      '<path d="M7 22h18" />' +
      '<path d="M16 22V8" />' +
      '<path d="m10 14 6-6 6 6" />' +
      "</svg>",
  };

  var activeKeys = new Set();

  function dispatchKey(code, type) {
    var key = KEY_LABELS[code] ? KEY_LABELS[code].key : code;
    var eventInit = {
      key: key,
      code: code,
      bubbles: true,
      cancelable: true,
    };

    window.dispatchEvent(new KeyboardEvent(type, eventInit));
    document.dispatchEvent(new KeyboardEvent(type, eventInit));
  }

  function pressKey(code) {
    if (activeKeys.has(code)) return;
    activeKeys.add(code);
    dispatchKey(code, "keydown");
  }

  function releaseKey(code) {
    if (!activeKeys.has(code)) return;
    activeKeys.delete(code);
    dispatchKey(code, "keyup");
  }

  function releaseAll() {
    Array.from(activeKeys).forEach(releaseKey);
  }

  function shouldShowMobilePads() {
    return mobileControlsQuery.matches;
  }

  function wantsFullscreen() {
    try {
      return sessionStorage.getItem(FULLSCREEN_PREF_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function rememberFullscreenPreference() {
    try {
      sessionStorage.setItem(FULLSCREEN_PREF_KEY, "1");
    } catch (e) {}
  }

  function isFullscreenActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }

  function requestGameFullscreen(rememberChoice) {
    var root = document.documentElement;
    var request =
      root.requestFullscreen ||
      root.webkitRequestFullscreen ||
      root.msRequestFullscreen;

    if (rememberChoice) rememberFullscreenPreference();

    if (isFullscreenActive()) {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        var exitResult = exit.call(document);
        if (exitResult && exitResult.catch) exitResult.catch(function () {});
      }
      return;
    }

    if (request) {
      var result = request.call(root);
      var lockOrientation = function () {
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock("landscape").catch(function () {});
        }
      };

      if (result && result.then) {
        result.then(lockOrientation).catch(function () {});
      } else {
        lockOrientation();
      }
    }
  }

  function requestPreferredFullscreen() {
    if (!shouldShowMobilePads() || !wantsFullscreen() || isFullscreenActive()) return;
    requestGameFullscreen(false);
  }

  function makeButton(code, text, className) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-control-btn " + (className || "");
    button.dataset.keyCode = code;
    button.innerHTML =
      '<span class="mobile-control-icon">' +
      (CONTROL_ICONS[code] || "") +
      "</span>" +
      '<span class="mobile-control-main">' +
      text +
      "</span>";
    button.setAttribute("aria-label", KEY_LABELS[code].label);

    button.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      requestPreferredFullscreen();
      button.setPointerCapture(event.pointerId);
      pressKey(code);
      button.classList.add("is-pressed");
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) {
      button.addEventListener(name, function (event) {
        event.preventDefault();
        releaseKey(code);
        button.classList.remove("is-pressed");
      });
    });

    return button;
  }

  function makeJoystick() {
    var joystick = document.createElement("div");
    var knob = document.createElement("div");
    joystick.className = "mobile-control-pad mobile-move-pad mobile-joystick";
    knob.className = "mobile-joystick-knob";
    knob.innerHTML =
      '<span class="mobile-joystick-arrows" aria-hidden="true">' +
      '<svg viewBox="0 0 36 24">' +
      '<path d="M14 12H4" />' +
      '<path d="m8 7-5 5 5 5" />' +
      '<path d="M22 12h10" />' +
      '<path d="m28 7 5 5-5 5" />' +
      "</svg>" +
      "</span>";
    joystick.setAttribute("aria-label", "Movement joystick");
    joystick.appendChild(knob);

    var activePointerId = null;
    var maxTravel = 44;
    var deadZone = 14;

    function updateJoystick(clientX, clientY) {
      var rect = joystick.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var dx = Math.max(-maxTravel, Math.min(maxTravel, clientX - centerX));
      var dy = Math.max(-22, Math.min(22, clientY - centerY));

      knob.style.transform = "translate(" + dx + "px, " + dy + "px)";

      if (dx < -deadZone) {
        pressKey("KeyA");
        releaseKey("KeyD");
      } else if (dx > deadZone) {
        pressKey("KeyD");
        releaseKey("KeyA");
      } else {
        releaseKey("KeyA");
        releaseKey("KeyD");
      }
    }

    function resetJoystick() {
      activePointerId = null;
      knob.style.transform = "translate(0, 0)";
      releaseKey("KeyA");
      releaseKey("KeyD");
      joystick.classList.remove("is-active");
    }

    joystick.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      requestPreferredFullscreen();
      activePointerId = event.pointerId;
      joystick.setPointerCapture(event.pointerId);
      joystick.classList.add("is-active");
      updateJoystick(event.clientX, event.clientY);
    });

    joystick.addEventListener("pointermove", function (event) {
      if (event.pointerId !== activePointerId) return;
      event.preventDefault();
      updateJoystick(event.clientX, event.clientY);
    });

    ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (name) {
      joystick.addEventListener(name, function (event) {
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        event.preventDefault();
        resetJoystick();
      });
    });

    return joystick;
  }

  function injectMobileControls() {
    if (document.getElementById("mobile-controls")) return;

    document.documentElement.classList.add("game-controls-ready");
    if (shouldShowMobilePads()) {
      document.documentElement.classList.add("mobile-controls-enabled");
    }

    var rotate = document.createElement("div");
    rotate.id = "rotate-device";
    rotate.innerHTML =
      '<div class="rotate-device-panel">' +
      '<div class="rotate-device-title">Turn Your Device</div>' +
      '<div class="rotate-device-copy">Gameplay uses landscape mode with touch controls.</div>' +
      "</div>";
    document.body.appendChild(rotate);

    var controls = document.createElement("div");
    controls.id = "mobile-controls";
    controls.setAttribute("aria-label", "Mobile gameplay controls");

    var fullscreenButton = document.createElement("button");
    fullscreenButton.type = "button";
    fullscreenButton.id = "mobile-fullscreen-btn";
    fullscreenButton.textContent = "Full Screen";
    fullscreenButton.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      event.stopPropagation();
      requestGameFullscreen(true);
    });

    var movePad = makeJoystick();

    var actionPad = document.createElement("div");
    actionPad.className = "mobile-control-pad mobile-action-pad";
    actionPad.appendChild(makeButton("KeyE", "E", "mobile-control-small action-top"));
    actionPad.appendChild(makeButton("KeyQ", "Throw", "mobile-control-wide action-left"));
    actionPad.appendChild(makeButton("ShiftLeft", "Dash", "mobile-control-wide action-right"));
    actionPad.appendChild(makeButton("Space", "Jump", "mobile-control-primary action-bottom"));

    controls.appendChild(fullscreenButton);
    controls.appendChild(movePad);
    controls.appendChild(actionPad);
    document.body.appendChild(controls);

    document.addEventListener("contextmenu", function (event) {
      if (event.target.closest("#mobile-controls")) event.preventDefault();
    });

    if (wantsFullscreen() && shouldShowMobilePads()) {
      document.documentElement.classList.add("fullscreen-preferred");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectMobileControls);
  } else {
    injectMobileControls();
  }

  function syncMobilePadState() {
    if (shouldShowMobilePads()) {
      document.documentElement.classList.add("mobile-controls-enabled");
    } else {
      document.documentElement.classList.remove("mobile-controls-enabled");
      releaseAll();
    }
  }

  if (mobileControlsQuery.addEventListener) {
    mobileControlsQuery.addEventListener("change", syncMobilePadState);
  } else if (mobileControlsQuery.addListener) {
    mobileControlsQuery.addListener(syncMobilePadState);
  }
  window.addEventListener("resize", syncMobilePadState);

  window.addEventListener("blur", releaseAll);
  window.addEventListener("pagehide", releaseAll);
})();
