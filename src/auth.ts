export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
  
    const headers = new Headers(init.headers);
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        headers.set("Content-Type", "application/json");
    }
  
    let res = await fetch(input, { ...init, headers });
  
    if (res.status === 401 && refreshToken) {
      // Try to refresh the token
      const refreshRes = await fetch("/api/user/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
  
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newAccessToken = data.accessToken;
        localStorage.setItem("token", newAccessToken);
  
        // Retry the original request with new token
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        res = await fetch(input, { ...init, headers });
      } else {
        // Refresh failed — log out
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/"; // or redirect to login
      }
    }
  
    return res;
  }