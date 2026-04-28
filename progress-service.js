import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  get,
  ref,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { auth, database } from "./log-in/firebase-config.js";

const STORAGE_KEY = "minos-campaign-progress";

function getDefaultProgress() {
  return {
    tutorialComplete: false,
    highestStageUnlocked: 1,
    completedStages: [],
  };
}

function normalizeProgress(progress) {
  const defaults = getDefaultProgress();
  if (!progress || typeof progress !== "object") {
    return defaults;
  }

  return {
    tutorialComplete: Boolean(progress.tutorialComplete),
    highestStageUnlocked: Math.max(
      1,
      Number(progress.highestStageUnlocked) || 1,
    ),
    completedStages: Array.isArray(progress.completedStages)
      ? progress.completedStages
          .map((stage) => Number(stage))
          .filter((stage) => Number.isInteger(stage) && stage >= 1 && stage <= 8)
      : [],
  };
}

function loadLocalProgress() {
  try {
    return normalizeProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
  } catch (error) {
    return getDefaultProgress();
  }
}

function saveLocalProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
}

function waitForUser() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 2000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
}

async function ensureUserRecord(user) {
  if (!user) {
    return null;
  }

  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    await set(userRef, {
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      progress: getDefaultProgress(),
    });
  }

  return userRef;
}

export async function getCurrentUser() {
  return waitForUser();
}

export async function logout() {
  await signOut(auth);
}

export async function loadProgress() {
  const user = await waitForUser();
  if (!user) {
    return loadLocalProgress();
  }

  const userRef = await ensureUserRecord(user);
  const snapshot = await get(ref(database, `users/${user.uid}/progress`));
  const progress = snapshot.exists()
    ? normalizeProgress(snapshot.val())
    : loadLocalProgress();

  saveLocalProgress(progress);
  await update(userRef, {
    email: user.email || "",
    name: user.displayName || "",
    lastLoginAt: new Date().toISOString(),
    progress,
  });
  return progress;
}

export async function saveProgress(progress) {
  const normalized = normalizeProgress(progress);
  saveLocalProgress(normalized);

  const user = await waitForUser();
  if (!user) {
    return normalized;
  }

  await ensureUserRecord(user);
  await update(ref(database, `users/${user.uid}`), {
    progress: normalized,
    progressUpdatedAt: new Date().toISOString(),
  });
  return normalized;
}

export async function resetProgress() {
  return saveProgress(getDefaultProgress());
}

export async function markTutorialComplete() {
  const progress = await loadProgress();
  progress.tutorialComplete = true;
  progress.highestStageUnlocked = Math.max(progress.highestStageUnlocked, 1);
  return saveProgress(progress);
}

export async function markStageComplete(stageNumber) {
  const progress = await loadProgress();
  const stage = Math.max(1, Math.min(8, Number(stageNumber) || 1));

  progress.tutorialComplete = true;
  if (!progress.completedStages.includes(stage)) {
    progress.completedStages.push(stage);
  }
  progress.completedStages.sort((a, b) => a - b);
  progress.highestStageUnlocked = Math.max(
    progress.highestStageUnlocked,
    Math.min(8, stage + 1),
  );

  return saveProgress(progress);
}

window.MinosProgress = {
  getCurrentUser,
  logout,
  loadProgress,
  saveProgress,
  resetProgress,
  markTutorialComplete,
  markStageComplete,
};
