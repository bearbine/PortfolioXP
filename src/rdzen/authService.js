// Serwis autoryzacji po stronie frontendu.
// Zamiast robic fetch w kazdym pliku, caly auth flow idzie przez to miejsce.
// Własny błąd API pomaga odroznic odpowiedz backendu od zwyklego błędu sieci.
export class BladApiAutoryzacji extends Error {
  constructor(message, { status = 0, code = "request_failed" } = {}) {
    super(message);
    this.name = "BladApiAutoryzacji";
    this.status = status;
    this.code = code;
  }
}

// Serwis trzyma CSRF i wszystkie requesty auth, żeby UI nie musial znac szczegolow API.
export class SerwisAutoryzacji extends EventTarget {
  constructor({ magazynSesji, apiBaseUrl = "" }) {
    super();
    this.magazynSesji = magazynSesji;
    this.apiBaseUrl = apiBaseUrl.replace(/\/+$/, "");
    this.csrfToken = null;
  }

  async listProfiles() {
    const data = await this.request("/api/auth/profiles");
    return Array.isArray(data.users) ? data.users : [];
  }

  async register({ username, displayName, login, password, passwordRequired = true, avatarId }) {
    const data = await this.request("/api/auth/register", {
      method: "POST",
      body: {
        username: username || displayName,
        login,
        password: passwordRequired ? password : "",
        passwordRequired,
        avatarId
      }
    });
    return data.user;
  }

  async login({ profileId, login, password }) {
    const body = { password, redirectUri: "/auth/callback" };
    if (profileId) {
      body.profileId = profileId;
    } else {
      body.login = login;
    }
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body
    });
    if (!data.redirectTo) {
      throw new BladApiAutoryzacji("The logon server returned an invalid response.", { status: 502, code: "bad_auth_response" });
    }
    return data.redirectTo;
  }

  async handleCurrentCallback() {
    const url = new URL(window.location.href);
    if (url.pathname !== "/auth/callback" || !url.searchParams.has("code")) {
      return null;
    }
    return this.exchangeCodeFromUrl(url);
  }

  redirectToCallback(redirectTo) {
    const url = new URL(redirectTo, window.location.origin);
    window.location.assign(`${url.pathname}${url.search}`);
  }

  async exchangeCodeFromUrl(url) {
    const code = url.searchParams.get("code") || "";
    return this.exchangeCode(code);
  }

  async exchangeCode(code) {
    const data = await this.request("/api/auth/token", {
      method: "POST",
      body: { code }
    });
    if (!data.user) {
      throw new BladApiAutoryzacji("The logon server did not create a valid session.", { status: 502, code: "bad_token_response" });
    }
    this.dispatchEvent(new CustomEvent("authchange", { detail: { user: data.user } }));
    return data;
  }

  async me() {
    const data = await this.request("/api/auth/me");
    return data.user;
  }

  async protectedAdmin() {
    return this.request("/api/protected/admin");
  }

  async adminAuditLogs({ limit = 5 } = {}) {
    const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 5, 1), 20);
    return this.request(`/api/admin/audit-logs?limit=${safeLimit}`);
  }

  async logout() {
    await this.request("/api/auth/logout", { method: "POST" }).catch(() => null);
    this.clear();
  }

  clear() {
    this.csrfToken = null;
    this.dispatchEvent(new CustomEvent("authchange", { detail: { user: null } }));
  }

  async getCsrfToken({ force = false } = {}) {
    if (this.csrfToken && !force) {
      return this.csrfToken;
    }
    const data = await this.request("/api/auth/csrf", { skipCsrf: true });
    if (!data.csrfToken) {
      throw new BladApiAutoryzacji("The logon server did not return a CSRF token.", {
        status: 502,
        code: "bad_csrf_response"
      });
    }
    this.csrfToken = data.csrfToken;
    return this.csrfToken;
  }

  // Wspolny request ogarnia CSRF, cookie i retry. Bez tego kazdy formularz mialby swoja wersje balaganu.
  async request(path, {
    method = "GET",
    body = null,
    skipCsrf = false,
    retryOnCsrf = true
  } = {}) {
    const headers = new Headers({ Accept: "application/json" });
    const normalizedMethod = method.toUpperCase();
    const init = {
      method: normalizedMethod,
      headers,
      credentials: "same-origin"
    };
    if (!skipCsrf && requiresCsrf(path, normalizedMethod)) {
      headers.set("X-CSRF-Token", await this.getCsrfToken());
    }
    if (body !== null) {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(body);
    }
    let response;
    try {
      response = await fetch(`${this.apiBaseUrl}${path}`, init);
    } catch {
      throw new BladApiAutoryzacji("The logon server could not be reached.", { status: 0, code: "network_error" });
    }

    const data = await readJson(response);
    if (!response.ok && response.status === 403 && data.error === "invalid_csrf" && retryOnCsrf && !skipCsrf) {
      this.csrfToken = null;
      return this.request(path, { method: normalizedMethod, body, skipCsrf, retryOnCsrf: false });
    }
    if (!response.ok) {
      throw new BladApiAutoryzacji(data.message || "The request failed.", {
        status: response.status,
        code: data.error || "request_failed"
      });
    }
    return data;
  }
}

function requiresCsrf(path, method) {
  return !["GET", "HEAD", "OPTIONS"].includes(method) && path.startsWith("/api/auth/");
}

async function readJson(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
