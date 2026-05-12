import {
  getApp,
  getApps,
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const LOGIN_PAGE = "index.html";
const body = document.body;
const authMode = body.dataset.authPage || "";
const loginViewEl = document.getElementById("login-view");
const appViewEl = document.getElementById("app-view");
const loginFormEl = document.getElementById("login-form");
const emailEl = document.getElementById("login-email");
const passwordEl = document.getElementById("login-password");
const loginSubmitEl = document.getElementById("login-submit");
const forgotPasswordEl = document.getElementById("forgot-password");
const loginStatusEl = document.getElementById("login-status");

function isFirebaseConfigured() {
  const config = window.YFNED_FIREBASE_CONFIG;
  if (!config) return false;

  return Object.values(config).every((value) => (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("REPLACE_ME")
  ));
}

function getYfnedFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(window.YFNED_FIREBASE_CONFIG);
}

function setLoginStatus(message, tone = "info") {
  if (!loginStatusEl) return;

  loginStatusEl.textContent = message;
  loginStatusEl.dataset.tone = tone;
}

function setLoginBusy(isBusy) {
  if (loginSubmitEl) {
    loginSubmitEl.disabled = isBusy;
  }
  if (forgotPasswordEl) {
    forgotPasswordEl.disabled = isBusy;
  }
}

function getFriendlyAuthMessage(error) {
  const code = error?.code || "unknown";
  let message = "";

  switch (error?.code) {
    case "auth/invalid-email":
      message = "Enter a valid username/email address.";
      break;
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      message = "Username or password was not recognized.";
      break;
    case "auth/user-disabled":
      message = "This Firebase user account is disabled.";
      break;
    case "auth/operation-not-allowed":
      message = "Email/password sign-in is not enabled for this Firebase project.";
      break;
    case "auth/api-key-not-valid":
      message = "Firebase rejected this app's API key. Replace static/firebase-config.js with the current Web App config from Firebase Project settings.";
      break;
    case "auth/unauthorized-domain":
      message = "This browser address is not authorized in Firebase Auth. Use localhost instead of 127.0.0.1, or add 127.0.0.1 under Authentication > Settings > Authorized domains.";
      break;
    case "auth/too-many-requests":
      message = "Too many attempts. Please wait a moment and try again.";
      break;
    case "auth/network-request-failed":
      message = "Could not reach Firebase Auth. Check your connection and try again.";
      break;
    default:
      message = "Could not sign in. Check the Firebase error code.";
      break;
  }

  return `${message} (${code})`;
}

function showLogin() {
  body.dataset.authState = "unauthenticated";
  if (loginViewEl) {
    loginViewEl.hidden = false;
  }
  if (appViewEl) {
    appViewEl.hidden = true;
  }
}

function showAuthenticatedApp() {
  body.dataset.authState = "authenticated";
  if (loginViewEl) {
    loginViewEl.hidden = true;
  }
  if (appViewEl) {
    appViewEl.hidden = false;
  }
}

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");
  if (!redirect) {
    return "";
  }

  try {
    const targetUrl = new URL(redirect, window.location.href);
    if (targetUrl.origin !== window.location.origin) {
      return "";
    }

    return `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`;
  } catch {
    return "";
  }
}

function redirectToLogin() {
  const loginUrl = new URL(LOGIN_PAGE, window.location.href);
  const pageName = window.location.pathname.split("/").pop() || LOGIN_PAGE;
  loginUrl.searchParams.set("redirect", `${pageName}${window.location.search}${window.location.hash}`);
  window.location.replace(loginUrl.href);
}

function notifyProtectedAppReady(user) {
  window.YFNED_AUTH_USER = user;
  body.dataset.authState = "authenticated";
  window.dispatchEvent(new CustomEvent("yfned:auth-ready", {
    detail: { user }
  }));
}

if (!authMode) {
  throw new Error("YFNED Auth was loaded without an auth page mode.");
}

if (!isFirebaseConfigured()) {
  if (authMode === "protected") {
    redirectToLogin();
  } else {
    showLogin();
    setLoginStatus("Firebase configuration is missing. Update static/firebase-config.js first.", "error");
    setLoginBusy(true);
  }
} else {
  const auth = getAuth(getYfnedFirebaseApp());
  const persistenceReady = setPersistence(auth, browserLocalPersistence).catch(() => {
    setLoginStatus("Firebase Auth persistence could not be set for this browser.", "warning");
  });

  document.querySelectorAll("[data-auth-action='sign-out']").forEach((button) => {
    button.addEventListener("click", async () => {
      await signOut(auth);
    });
  });

  if (authMode === "login" && loginFormEl) {
    loginFormEl.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = emailEl.value.trim();
      const password = passwordEl.value;

      if (!email || !password) {
        setLoginStatus("Enter your username and password.", "warning");
        return;
      }

      setLoginBusy(true);
      setLoginStatus("Signing in...", "info");

      try {
        await persistenceReady;
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Firebase sign-in failed:", error);
        setLoginStatus(getFriendlyAuthMessage(error), "error");
        setLoginBusy(false);
      }
    });

    forgotPasswordEl?.addEventListener("click", async () => {
      const email = emailEl.value.trim();
      if (!email) {
        setLoginStatus("Enter your username/email first, then use Forgot Password.", "warning");
        emailEl.focus();
        return;
      }

      setLoginBusy(true);
      setLoginStatus("Sending password reset email...", "info");

      try {
        await sendPasswordResetEmail(auth, email);
        setLoginStatus("Password reset email sent.", "success");
      } catch (error) {
        console.error("Firebase password reset failed:", error);
        setLoginStatus(getFriendlyAuthMessage(error), "error");
      } finally {
        setLoginBusy(false);
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (authMode === "protected") {
      if (user) {
        notifyProtectedAppReady(user);
        return;
      }

      redirectToLogin();
      return;
    }

    if (user) {
      const redirectTarget = getRedirectTarget();
      if (redirectTarget) {
        window.location.assign(redirectTarget);
        return;
      }

      showAuthenticatedApp();
      setLoginBusy(false);
      return;
    }

    window.YFNED_AUTH_USER = null;
    showLogin();
    setLoginBusy(false);
  });
}
