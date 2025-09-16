function jwtExp(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    // base64url → base64 + padding
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const payload = JSON.parse(json);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

// consider tokens expiring within 60s as "expired"
export function isTokenExpired(token: string, skewSeconds = 60): boolean {
  const exp = jwtExp(token);
  if (!exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return exp - now <= skewSeconds;
}

function jwtPayload(token: string): any | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(pad));
  } catch {
    return null;
  }
}

export function getUserFromToken(token: string): { email: string; name: string } | null {
  const p = jwtPayload(token);
  if (!p) return null;
  const email = p.sub
  const name  = localStorage.getItem("name");
  if (!email) return null;
  if (!name) return null;
  return { email, name };
}

