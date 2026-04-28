import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  get,
  ref,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { auth, database, googleProvider } from "./firebase-config.js";
import { getFirebaseErrorMessage } from "./firebase-errors.js";

const messageBox = document.getElementById("message-box");
const loginForm = document.getElementById("login-form");
const googleLoginButton = document.getElementById("google-login-btn");

const verificationActionSettings = {
  url: `${window.location.origin}/log-in/login.html?verified=1`,
  handleCodeInApp: false,
};

function showMessage(message) {
  messageBox.textContent = message;
  messageBox.style.display = "block";

  setTimeout(() => {
    messageBox.style.display = "none";
  }, 4000);
}

async function saveLogin(user) {
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    await set(userRef, {
      email: user.email || "",
      name: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      provider: user.providerData[0]?.providerId || "password",
      progress: {
        tutorialComplete: false,
        highestStageUnlocked: 1,
        completedStages: [],
      },
    });
    return;
  }

  await update(userRef, {
    email: user.email || "",
    name: user.displayName || snapshot.val()?.name || "",
    photoURL: user.photoURL || "",
    lastLoginAt: new Date().toISOString(),
    provider: user.providerData[0]?.providerId || "password",
  });
}

async function finishLogin(user) {
  const providerId = user.providerData[0]?.providerId || "password";
  if (providerId === "password" && !user.emailVerified) {
    await sendEmailVerification(user, verificationActionSettings);
    await signOut(auth);
    showMessage("Please verify your email first. We sent a new verification link.");
    return;
  }

  await saveLogin(user);
  showMessage("Login successful. Returning to the menu...");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 900);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await finishLogin(userCredential.user);
  } catch (error) {
    showMessage(getFirebaseErrorMessage(error, "Login failed. Please try again."));
  }
});

googleLoginButton.addEventListener("click", async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await finishLogin(userCredential.user);
  } catch (error) {
    showMessage(
      getFirebaseErrorMessage(error, "Google login failed. Please try again."),
    );
  }
});
