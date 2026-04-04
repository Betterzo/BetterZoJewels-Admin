let loggingOut = false;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;

export function isAuthLogoutPending() {
  return loggingOut;
}

const AUTH_NOTICE_KEY = "auth_notice";

function decodeJwtExpMs(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function clearTokenExpirySchedule() {
  if (expiryTimer !== null) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

/**
 * Reads stored user and schedules logout when JWT `exp` is reached (if token is a JWT).
 * Call after login and on app boot when already authenticated.
 */
export function scheduleTokenExpiryLogoutFromStoredUser() {
  clearTokenExpirySchedule();
  try {
    const raw = localStorage.getItem("duser");
    if (!raw) return;
    const user = JSON.parse(raw) as { access_token?: string };
    const token = user?.access_token;
    if (!token || typeof token !== "string") return;
    const expMs = decodeJwtExpMs(token);
    if (!expMs) return;
    const delay = expMs - Date.now() - 1500;
    if (delay <= 0) {
      logoutSession("expired");
      return;
    }
    expiryTimer = setTimeout(() => logoutSession("expired"), delay);
  } catch {
    /* ignore */
  }
}

export type LogoutReason = "expired" | "unauthorized";

/**
 * Clears auth storage and sends the user to login. Idempotent while redirecting.
 */
export function logoutSession(reason?: LogoutReason) {
  if (loggingOut) return;
  if (localStorage.getItem("isAuthenticated") !== "true" && !localStorage.getItem("duser")) {
    return;
  }
  loggingOut = true;
  clearTokenExpirySchedule();
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("duser");
  try {
    if (reason) {
      sessionStorage.setItem(AUTH_NOTICE_KEY, reason === "expired" ? "session_expired" : "session_unauthorized");
    }
  } catch {
    /* ignore */
  }
  window.location.replace("/");
}

export function readAndClearAuthNotice(): "session_expired" | "session_unauthorized" | null {
  try {
    const v = sessionStorage.getItem(AUTH_NOTICE_KEY);
    sessionStorage.removeItem(AUTH_NOTICE_KEY);
    if (v === "session_expired" || v === "session_unauthorized") return v;
  } catch {
    /* ignore */
  }
  return null;
}

export function isUnauthorizedApiError(config: { url?: string; headers?: unknown } | undefined): boolean {
  const url = config?.url || "";
  if (
    url.includes("/login") ||
    url.includes("/request-otp") ||
    url.includes("/verify-otp") ||
    url.includes("/reset-password")
  ) {
    return false;
  }
  const headers = (config?.headers || {}) as Record<string, unknown>;
  const auth = headers.Authorization ?? headers.authorization;
  if (typeof auth !== "string" || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7).trim();
  if (!token) return false;
  return localStorage.getItem("isAuthenticated") === "true";
}
