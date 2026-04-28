import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
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
const signupContainer = document.getElementById("signup-container");
const verifyContainer = document.getElementById("verify-container");
const signupForm = document.getElementById("signup-form");
const verifyMessage = document.getElementById("verify-message");
const googleSignupButton = document.getElementById("google-signup-btn");
const resendCodeButton = document.getElementById("resend-code-btn");
const backToSignupButton = document.getElementById("back-to-signup-btn");

let currentUser = null;

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

function getDefaultProgress() {
  return {
    tutorialComplete: false,
    highestStageUnlocked: 1,
    completedStages: [],
  };
}

function showSignup() {
  signupContainer.classList.remove("hidden");
  verifyContainer.classList.add("hidden");
}

function showVerification(email) {
  signupContainer.classList.add("hidden");
  verifyContainer.classList.remove("hidden");
  verifyMessage.textContent = `We sent a verification link to ${email}. Open the link, then log in to continue.`;
}

async function createUserRecord(user, name) {
  const userRef = ref(database, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    await update(userRef, {
      email: user.email || "",
      name: name || user.displayName || snapshot.val().name || "",
      photoURL: user.photoURL || "",
      lastLoginAt: new Date().toISOString(),
      provider: user.providerData[0]?.providerId || "password",
    });
    return;
  }

  await set(userRef, {
    name: name || user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    provider: user.providerData[0]?.providerId || "password",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    progress: getDefaultProgress(),
  });
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    currentUser = userCredential.user;

    await updateProfile(currentUser, { displayName: name });
    await createUserRecord(currentUser, name);
    await sendEmailVerification(currentUser, verificationActionSettings);

    showMessage("Account created. Check your email for verification.");
    showVerification(email);
  } catch (error) {
    showMessage(
      getFirebaseErrorMessage(error, "Signup failed. Please try again."),
    );
  }
});

googleSignupButton.addEventListener("click", async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    await createUserRecord(userCredential.user, userCredential.user.displayName);
    showMessage("Google account connected. Returning to the menu...");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 900);
  } catch (error) {
    showMessage(
      getFirebaseErrorMessage(error, "Google signup failed. Please try again."),
    );
  }
});

resendCodeButton.addEventListener("click", async () => {
  if (!currentUser) {
    showMessage("Create an account first, then request another link.");
    return;
  }

  try {
    await sendEmailVerification(currentUser, verificationActionSettings);
    showMessage("Verification link sent again.");
  } catch (error) {
    showMessage(
      getFirebaseErrorMessage(error, "Could not send the verification link."),
    );
  }
});

backToSignupButton.addEventListener("click", showSignup);
