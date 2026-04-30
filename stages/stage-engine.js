const STAGE_PROGRESS_KEY = "minos-campaign-progress";

function ensureStageShell() {
  let canvas = document.getElementById("gameCanvas") || document.getElementById("stage-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
  }
  canvas.id = "gameCanvas";

  if (document.getElementById("ui-layer")) {
    return;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div id="scanlines" aria-hidden="true"></div>
      <div id="ember-container" aria-hidden="true"></div>
      <div id="ui-layer">
        <div id="hud-top">
          <div id="hud-top-left">
            <a id="tutorial-menu-btn" href="../index.html">Menu</a>
            <div class="hud-box">
              <div class="hud-lbl">Hero</div>
              <div class="hud-hearts" id="health-bar"></div>
            </div>
          </div>
          <div id="hud-stage-chip" class="hud-box">
            <div class="hud-lbl" id="layer-name">Stage I</div>
            <div class="hud-room" id="room-prog">Threshold Court</div>
          </div>
          <div id="hud-top-right">
            <div class="hud-box route-box">
              <div class="hud-lbl">Route</div>
              <div id="progress-bar-inline"><div id="prog-fill"></div></div>
            </div>
            <div class="hud-box timer-box">
              <div class="hud-lbl">Time</div>
              <div id="timer">00:00</div>
            </div>
          </div>
        </div>
      </div>
      <div id="stam-wrap">
        <span class="stam-label">Stamina</span>
        <div id="stam-track"><div id="stam-fill"></div></div>
        <span id="dash-ready">Ready</span>
      </div>
      <div id="hud-bottom">
        <div id="ctrl-hint">[D] Walk - [A] Back - [W/Space] Jump - [Shift] Dash - [Q] Drop - [P] Pause</div>
        <button id="inv-toggle-btn" class="bag-btn" type="button" onclick="toggleInventory()">Bag</button>
      </div>
      <div id="inventory-ui" class="overlay hidden">
        <div class="overlay-panel">
          <div class="overlay-kicker">Inventory</div>
          <div class="overlay-title">Collected Relics</div>
          <p class="overlay-text">Click an item to drop it back into the chamber.</p>
          <div id="inv-row" class="overlay-actions"></div>
        </div>
      </div>
      <div id="pause-menu" class="overlay hidden">
        <div class="overlay-panel">
          <div class="overlay-kicker">Paused</div>
          <div class="overlay-title">Trial Suspended</div>
          <p class="overlay-text">Resume when you are ready, restart the chamber, or return to the menu.</p>
          <div class="overlay-actions">
            <button class="action-btn" type="button" onclick="togglePause()">Resume</button>
            <button class="action-btn" type="button" onclick="resetMaze()">Restart</button>
            <button class="action-btn" type="button" onclick="returnToMenu()">Menu</button>
          </div>
        </div>
      </div>
      <div id="custom-alert" class="overlay hidden">
        <div class="overlay-panel">
          <div class="overlay-kicker" id="alert-icon">Warning</div>
          <div class="overlay-title" id="alert-title">Trial Failed</div>
          <p class="overlay-text" id="alert-message">Try the chamber again.</p>
          <div class="overlay-actions">
            <button class="action-btn btn" type="button" onclick="handleAlertConfirm()">Try Again</button>
          </div>
        </div>
      </div>
      <div id="door-quiz" class="overlay hidden">
        <div class="overlay-panel">
          <div class="overlay-kicker">Door Trial</div>
          <div class="overlay-title" id="quiz-room-title">Puzzle</div>
          <p class="overlay-text" id="quiz-question-text"></p>
          <div id="quiz-options" class="overlay-list"></div>
          <p class="overlay-text" id="quiz-hint-text"></p>
          <div class="overlay-actions">
            <button class="action-btn" type="button" onclick="submitQuizAnswer()">Unlock Door</button>
            <button class="action-btn" type="button" onclick="closeDoorQuiz()">Back Away</button>
          </div>
        </div>
      </div>
      <div id="tut-prompt" class="overlay hidden"></div>
      <div id="tut-summary" class="overlay hidden"></div>
      <div id="start-screen" class="overlay hidden"></div>
    `
  );
}

function loadStageProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STAGE_PROGRESS_KEY) || "null");
    if (!parsed) {
      return { tutorialComplete: true, highestStageUnlocked: 1, completedStages: [] };
    }
    return {
      tutorialComplete: parsed.tutorialComplete !== false,
      highestStageUnlocked: Math.max(1, Number(parsed.highestStageUnlocked) || 1),
      completedStages: Array.isArray(parsed.completedStages) ? parsed.completedStages.slice() : [],
    };
  } catch (error) {
    return { tutorialComplete: true, highestStageUnlocked: 1, completedStages: [] };
  }
}

function saveStageProgress(progress) {
  localStorage.setItem(STAGE_PROGRESS_KEY, JSON.stringify(progress));
}

function markStageComplete(stageNumber) {
  const progress = loadStageProgress();
  if (!progress.completedStages.includes(stageNumber)) {
    progress.completedStages.push(stageNumber);
  }
  progress.tutorialComplete = true;
  progress.highestStageUnlocked = Math.max(progress.highestStageUnlocked, Math.min(8, stageNumber + 1));
  saveStageProgress(progress);
  return import("../progress-service.js")
    .then((service) => service.markStageComplete(stageNumber))
    .catch((error) => {
      console.warn("Firebase progress save failed; local progress was saved.", error);
      return progress;
    });
}

function bootSelectedStage() {
  const stageIndex = Math.max(0, Math.min(7, (parseInt(document.body.dataset.stage || "1", 10) || 1) - 1));

  if (!window.__stagePageWrapped) {
    const originalReset = window.resetMaze;

    window.advStage = async function patchedAdvance() {
      const completedStage = stageIndex + 1;
      await markStageComplete(completedStage);
      if (completedStage >= 8) {
        if (window.SFX && typeof window.SFX.victory === "function") {
          window.SFX.victory();
        }
        setTimeout(() => {
          window.location.href = "../index.html";
        }, 700);
        return;
      }
      setTimeout(() => {
        window.location.href = `stage${completedStage + 1}.html`;
      }, 450);
    };

    window.resetMaze = function patchedReset() {
      if (typeof originalReset === "function") {
        originalReset();
      }
      if (typeof window.si === "number") {
        window.si = stageIndex;
      }
      if (typeof window.sec === "number") {
        window.sec = 0;
      }
      if (typeof window.resetSec === "function") {
        window.resetSec(false);
      }
      if (typeof window.startLoop === "function") {
        window.startLoop();
      }
    };

    window.returnToMenu = function returnToMenu() {
      window.location.href = "../index.html";
    };

    window.__stagePageWrapped = true;
  }

  const syncStageState = () => {
    if (typeof window.si === "number") {
      window.si = stageIndex;
    }
    if (typeof window.sec === "number") {
      window.sec = 0;
    }
    if (typeof window.lives === "number") {
      window.lives = 3;
    }
    if (typeof window.resetSec === "function") {
      window.resetSec(false);
    }
    if (typeof window.startLoop === "function") {
      window.startLoop();
    }
  };

  if (window.gameState === "playing") {
    syncStageState();
    return;
  }

  Promise.resolve(typeof window.launchGame === "function" ? window.launchGame() : null).then(syncStageState);
}

function loadLegacyEngine() {
  const script = document.createElement("script");
  script.src = "../stagescript2.js?v=stage1-tutorial-2";
  script.onload = () => {
    bootSelectedStage();
  };
  document.body.appendChild(script);
}

ensureStageShell();
loadLegacyEngine();
