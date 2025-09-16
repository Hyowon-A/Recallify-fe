// auth.ts
import { API_BASE_URL } from "./config";
import { isTokenExpired } from "./jwt";

type TokensResponse = { accessToken?: string; refreshToken?: string };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const rt = localStorage.getItem("refreshToken");
  if (!rt) return null;

  const res = await fetch(`${API_BASE_URL}/user/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: rt }),
  });

  if (!res.ok) {
    // refresh failed → clear tokens
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    return null;
  }

  const data: TokensResponse = await res.json();
  const at = data.accessToken ?? null;
  if (at) localStorage.setItem("token", at);
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken); // handle rotation
  return at;
}

// Proactively refresh if missing/expired (with single-flight de-dupe)
export async function refreshIfNeeded(): Promise<string | null> {
  const at = localStorage.getItem("token");
  const rt = localStorage.getItem("refreshToken");

  const needs = (!at && !!rt) || (at && isTokenExpired(at));
  if (!needs) return at ?? null;

  if (!refreshPromise) refreshPromise = refreshAccessToken().finally(() => (refreshPromise = null));
  return refreshPromise;
}

function buildHeaders(init: RequestInit, token: string | null): Headers {
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Only set JSON content-type if caller hasn't and body isn't FormData/URLSearchParams
  const body = init.body as any;
  const hasCT = headers.has("Content-Type");
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const isUrlEnc = typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
  if (!hasCT && body && !isForm && !isUrlEnc && typeof body === "string" && body.trim().startsWith("{")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  // 1) Proactive refresh
  const token1 = (await refreshIfNeeded()) ?? localStorage.getItem("token");
  let headers = buildHeaders(init, token1);

  // 2) First attempt
  let res = await fetch(input, { ...init, headers });

  // 3) If unauthorized, try exactly one reactive refresh + retry
  if (res.status === 401) {
    const token2 = await refreshAccessToken();
    if (!token2) return res; // still 401 → let caller handle logout
    headers = buildHeaders(init, token2);
    res = await fetch(input, { ...init, headers });
  }

  return res;
}