const STORAGE_KEY = "minos-campaign-progress";
const progressServicePromise = import("./progress-service.js").catch((error) => {
  console.warn("Firebase progress service unavailable.", error);
  return null;
});

const STAGE_DATA = [
  {
    id: "tutorial",
    label: "Tutorial",
    title: "Training Hall",
    href: "tutorial/tutorial.html",
    description:
      "Learn the sacred order: vault, plate, drop, dash, relic, door.",
    statusText: "Required",
    meta: ["Foundations", "3 lives", "Guided"],
    art: "adds_assets/banner.png",
  },
  {
    id: 1,
    label: "Stage I",
    title: "Threshold Court",
    href: "stages/stage1.html",
    description:
      "Wide lanes and forgiving timing turn the tutorial into a true run.",
    statusText: "Unlocked After Tutorial",
    meta: ["2 checkpoints", "Jump + plate", "Readable"],
    art: "adds_assets/headless_statue.png",
  },
  {
    id: 2,
    label: "Stage II",
    title: "Webbed Galleries",
    href: "stages/stage2.html",
    description:
      "Mid-air routes and trap pairings demand steadier movement and recovery.",
    statusText: "Stage 1",
    meta: ["2 checkpoints", "Platforms", "Crossfire"],
    art: "adds_assets/spider_web.png",
  },
  {
    id: 3,
    label: "Stage III",
    title: "Cracked Aqueduct",
    href: "stages/stage3.html",
    description:
      "Longer gaps, tighter recoveries, and chained pressure plates test rhythm.",
    statusText: "Stage 2",
    meta: ["2 checkpoints", "Falls", "Chains"],
    art: "adds_assets/jar.png",
  },
  {
    id: 4,
    label: "Stage IV",
    title: "The Blood Run",
    href: "stages/stage4.html",
    description:
      "Narrow paths blend dashes and reactive hazards inside a scarlet corridor.",
    statusText: "Stage 3",
    meta: ["2 checkpoints", "Dash lanes", "Tight"],
    art: "adds_assets/blood_writing_(run).png",
  },
  {
    id: 5,
    label: "Stage V",
    title: "Thread Archives",
    href: "stages/stage5.html",
    description:
      "Collect the golden clue, then carry it through denser trap combinations.",
    statusText: "Stage 4",
    meta: ["2 checkpoints", "Relic run", "Mixed hazards"],
    art: "adds_assets/paper_golden_thread.png",
  },
  {
    id: 6,
    label: "Stage VI",
    title: "Ashen Barracks",
    href: "stages/stage6.html",
    description:
      "Hammer timing and layered spike fields push precision above raw speed.",
    statusText: "Stage 5",
    meta: ["1 checkpoint", "Hammer chains", "Demanding"],
    art: "adds_assets/many_pile_of_bones.png",
  },
  {
    id: 7,
    label: "Stage VII",
    title: "Oracle Descent",
    href: "stages/stage7.html",
    description:
      "Sparse recovery points and deceptive clue routes sharpen every decision.",
    statusText: "Stage 6",
    meta: ["1 checkpoint", "Clue route", "High tension"],
    art: "adds_assets/clue2.png",
  },
  {
    id: 8,
    label: "Stage VIII",
    title: "Throne of Minos",
    href: "stages/stage8.html",
    description:
      "The full ritual sequence returns as a layered final ordeal before the throne.",
    statusText: "Stage 7",
    meta: ["1 checkpoint", "Boss chamber", "Final trial"],
    art: "adds_assets/boss_room.png",
  },
];

function getDefaultProgress() {
  return {
    tutorialComplete: false,
    highestStageUnlocked: 1,
    completedStages: [],
  };
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!parsed) {
      return getDefaultProgress();
    }
    return {
      tutorialComplete: Boolean(parsed.tutorialComplete),
      highestStageUnlocked: Math.max(
        1,
        Number(parsed.highestStageUnlocked) || 1,
      ),
      completedStages: Array.isArray(parsed.completedStages)
        ? parsed.completedStages
        : [],
    };
  } catch (error) {
    return getDefaultProgress();
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

async function loadSavedProgress() {
  const service = await progressServicePromise;
  if (service) {
    return service.loadProgress();
  }
  return loadProgress();
}

async function saveSavedProgress(progress) {
  const service = await progressServicePromise;
  if (service) {
    return service.saveProgress(progress);
  }
  saveProgress(progress);
  return progress;
}

async function setupAccountMenu() {
  const service = await progressServicePromise;
  if (!service) {
    return;
  }

  const user = await service.getCurrentUser();
  const loginButton = document.getElementById("login-btn");
  const signupButton = document.getElementById("signup-btn");

  if (!user) {
    loginButton.textContent = "Log In";
    signupButton.textContent = "Create Account";
    return;
  }

  loginButton.textContent = user.displayName || user.email || "Account";
  loginButton.title = user.email || "";
  loginButton.addEventListener("click", (event) => {
    event.stopImmediatePropagation();
    openAccountModal(user);
  }, true);

  signupButton.textContent = "Log Out";
  signupButton.addEventListener("click", async (event) => {
    event.stopImmediatePropagation();
    await service.logout();
    window.location.reload();
  }, true);
}

async function openAccountModal(user) {
  const progress = await loadSavedProgress();
  const completed = progress.completedStages.length;

  document.getElementById("account-name-value").textContent =
    user.displayName || "No display name";
  document.getElementById("account-email-value").textContent =
    user.email || "No email";
  document.getElementById("account-status-value").textContent =
    user.emailVerified ? "Verified" : "Email not verified";
  document.getElementById("account-progress-value").textContent =
    progress.tutorialComplete
      ? `${completed} of 8 stages completed`
      : "Tutorial not completed";

  const modal = document.getElementById("account-modal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeAccountModal() {
  const modal = document.getElementById("account-modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function isStageUnlocked(progress, stageId) {
  if (stageId === "tutorial") {
    return true;
  }
  if (!progress.tutorialComplete) {
    return false;
  }
  return stageId <= progress.highestStageUnlocked;
}

function getCompletionLabel(progress, stageId) {
  if (stageId === "tutorial") {
    return progress.tutorialComplete ? "Complete" : "Awaiting Trial";
  }
  return progress.completedStages.includes(stageId) ? "Conquered" : "Open";
}

async function renderCards() {
  const progress = await loadSavedProgress();
  const grid = document.getElementById("stage-grid");
  grid.innerHTML = STAGE_DATA.map((stage) => {
    const unlocked = isStageUnlocked(progress, stage.id);
    const complete =
      stage.id === "tutorial"
        ? progress.tutorialComplete
        : progress.completedStages.includes(stage.id);
    const statusClass = complete ? "complete" : unlocked ? "" : "locked";
    const buttonText = unlocked
      ? complete
        ? "Play Again"
        : "Enter"
      : "Locked";
    return `
      <article class="stage-card ${unlocked ? "" : "locked"}" style="--card-art:url('${stage.art}')">
        <div class="card-top">
          <div class="card-index">${stage.label}</div>
          <h3 class="card-title">${stage.title}</h3>
          <p class="card-desc">${stage.description}</p>
          <div class="card-meta">
            ${stage.meta.map((item) => `<span>${item}</span>`).join("")}
          </div>
        </div>
        <div class="card-bottom">
          <div class="card-status ${statusClass}">${complete ? getCompletionLabel(progress, stage.id) : stage.statusText}</div>
          <button class="card-btn" type="button" data-href="${stage.href}" ${unlocked ? "" : "disabled"}>
            ${buttonText}
          </button>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".card-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!button.disabled) {
        window.location.href = button.dataset.href;
      }
    });
  });

  updateProgressNote(progress);
}

function updateProgressNote(progress) {
  const progressNote = document.getElementById("progress-note");
  if (!progress.tutorialComplete) {
    progressNote.textContent =
      "Complete the Training Hall to unlock Stage I and begin the full descent.";
    return;
  }

  const completed = progress.completedStages.length;
  const currentStage = Math.min(progress.highestStageUnlocked, 8);
  progressNote.textContent =
    completed >= 8
      ? "Every chamber stands cleared. Return to any trial or descend again for a faster run."
      : `You have cleared ${completed} of 8 stages. The next open route lies at Stage ${currentStage}.`;
}

function continueJourney() {
  openStageModal();
}

async function resetProgress() {
  const fresh = getDefaultProgress();
  await saveSavedProgress(fresh);
  await renderCards();
}

function openStageModal() {
  const modal = document.getElementById("stage-modal");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  renderCards();
}

function closeStageModal() {
  const modal = document.getElementById("stage-modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.getElementById("map-maker-btn").addEventListener("click", () => {
  window.location.href = "map-maker/map-maker.html";
});
document.getElementById("login-btn").addEventListener("click", () => {
  window.location.href = "log-in/login.html";
});
document.getElementById("signup-btn").addEventListener("click", () => {
  window.location.href = "log-in/signup.html";
});

document
  .getElementById("continue-btn")
  .addEventListener("click", continueJourney);
document.getElementById("tutorial-btn").addEventListener("click", () => {
  window.location.href = "tutorial/tutorial.html";
});
document
  .getElementById("reset-progress-btn")
  .addEventListener("click", resetProgress);
document
  .getElementById("close-stage-modal-btn")
  .addEventListener("click", closeStageModal);
document
  .getElementById("stage-modal-backdrop")
  .addEventListener("click", closeStageModal);
document
  .getElementById("close-account-modal-btn")
  .addEventListener("click", closeAccountModal);
document
  .getElementById("account-modal-backdrop")
  .addEventListener("click", closeAccountModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeStageModal();
    closeAccountModal();
  }
});

renderCards();
setupAccountMenu();
