export function getFirebaseErrorMessage(error, fallback) {
  const messages = {
    "auth/configuration-not-found":
      "Firebase Authentication is not enabled for this project.",
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/invalid-credential": "The email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed":
      "Network error. Check your internet connection and try again.",
    "auth/operation-not-allowed":
      "This sign-in method is not enabled in Firebase Authentication.",
    "auth/too-many-requests":
      "Firebase blocked the request temporarily. Wait a few minutes, then try again.",
    "auth/popup-blocked": "Allow popups for this site, then try Google again.",
    "auth/popup-closed-by-user": "Google sign-in was closed before it finished.",
    "auth/unauthorized-domain":
      "This URL is not authorized in Firebase Authentication settings.",
    "auth/user-token-expired":
      "Your signup session expired. Please log in and request a new verification link.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/weak-password": "Use a stronger password with at least 6 characters.",
    "database/permission-denied":
      "Login worked, but Realtime Database rules blocked saving user data.",
    "permission_denied":
      "Login worked, but Realtime Database rules blocked saving user data.",
  };

  console.error(error);
  const detail = error.code ? ` (${error.code})` : "";
  return (messages[error.code] || messages[error.message] || fallback) + detail;
}
