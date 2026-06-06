// Trasy autoryzacji.
// To jest serce logowania: CSRF, profile, login, callback code, token, logout i /me.
import express from "express";
import { serverConfig } from "../config.js";
import { issueCsrfToken, createRequireCsrf } from "../csrf.js";
import { utworzLimiter, getClientIp } from "../rateLimit.js";
import { createCode, findByCodeHash, hashAuthorizationCode, markCodeAsUsed } from "../baza_danych/repositories/authCodesRepository.js";
import { ALLOWED_ROLES, utworzUzytkownika, znajdzPoId, znajdzPoLoginie, znajdzPoPublicznymIdProfilu, listaProfiliLogowania, naPublicznegoUzytkownika } from "../baza_danych/repositories/usersRepository.js";
import { isValidPublicProfileId } from "../publicProfileIds.js";
import { zahashujHaslo, sprawdzHaslo } from "../passwords.js";
import { clearAuthCookie, setAuthCookie, signUserToken } from "../tokens.js";
import { AUDIT_EVENTS, zapiszLogAudytu } from "../audyt/auditLogger.js";

export function utworzTraseAutoryzacji(pool, wymagajAutoryzacji) {
  const router = express.Router();
  const requireCsrf = createRequireCsrf(pool);
  const loginRateLimit = utworzLimiter({
    windowMs: 5 * 60 * 1000,
    maxAttempts: 5,
    keyGenerator: (request) => `login:${getClientIp(request)}:${normalizeLogin(request.body?.login) || normalizePublicProfileId(request.body?.profileId) || "unknown"}`,
    onLimitExceeded: (request) => zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.RATE_LIMIT_HIT,
      severity: "warning",
      loginAttempt: normalizeLogin(request.body?.login) || normalizePublicProfileId(request.body?.profileId) || null,
      request,
      details: { limiter: "login" }
    })
  });
  const registerRateLimit = utworzLimiter({
    windowMs: 10 * 60 * 1000,
    maxAttempts: 3,
    keyGenerator: (request) => `register:${getClientIp(request)}`,
    onLimitExceeded: (request) => zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.RATE_LIMIT_HIT,
      severity: "warning",
      loginAttempt: normalizeLogin(request.body?.login) || null,
      request,
      details: { limiter: "register" }
    })
  });
  const tokenRateLimit = utworzLimiter({
    windowMs: 60 * 1000,
    maxAttempts: 10,
    keyGenerator: (request) => `token:${getClientIp(request)}`,
    onLimitExceeded: (request) => zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.RATE_LIMIT_HIT,
      severity: "warning",
      request,
      details: { limiter: "token" }
    })
  });

  // Frontend najpierw bierze CSRF, potem używa go przy POST-ach.
  router.get("/csrf", (request, response) => {
    response.json({ csrfToken: issueCsrfToken(response) });
  });

  // Profile do login screena, bez pokazywania loginu technicznego i hasha hasla.
  router.get("/profiles", asyncHandler(async (request, response) => {
    response.json({ users: await listaProfiliLogowania(pool) });
  }));

  // Rejestracja tworzy zwyklego usera. Adminow nie robimy sobie z formularza, bo wiadomo jakby sie skonczylo.
  router.post("/register", requireCsrf, registerRateLimit, asyncHandler(async (request, response) => {
    const parsed = parseRegisterBody(request.body);
    if (!parsed.ok) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.REGISTER_FAILED,
        severity: "warning",
        loginAttempt: normalizeLogin(request.body?.login) || null,
        request,
        details: { reason: "invalid_input" }
      });
      response.status(400).json({ error: "invalid_input", message: parsed.message });
      return;
    }

    try {
      const passwordRequired = parsed.value.passwordRequired !== false;
      const user = await utworzUzytkownika(pool, {
        ...parsed.value,
        passwordHash: await zahashujHaslo(passwordRequired ? parsed.value.password : "")
      });
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.REGISTER_SUCCESS,
        severity: "info",
        userId: user.databaseId,
        loginAttempt: parsed.value.login,
        request
      });
      response.status(201).json({ user });
    } catch (error) {
      if (isDuplicateLoginError(error)) {
        await zapiszLogAudytu(pool, {
          eventType: AUDIT_EVENTS.REGISTER_FAILED,
          severity: "warning",
          loginAttempt: parsed.value.login,
          request,
          details: { reason: "login_taken" }
        });
        response.status(409).json({ error: "login_taken", message: "This login name is already used." });
        return;
      }
      throw error;
    }
  }));

  // Login tylko sprawdza haslo i wydaje authorization code, sesja powstaje dopiero w /token.
  router.post("/login", requireCsrf, loginRateLimit, asyncHandler(async (request, response) => {
    const parsed = parseLoginBody(request.body);
    if (!parsed.ok) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.LOGIN_FAILED,
        severity: "warning",
        loginAttempt: normalizeLogin(request.body?.login) || normalizePublicProfileId(request.body?.profileId) || null,
        request,
        details: { reason: "invalid_input" }
      });
      response.status(400).json({ error: "invalid_input", message: parsed.message });
      return;
    }

    const user = parsed.value.profileId
      ? await znajdzPoPublicznymIdProfilu(pool, parsed.value.profileId)
      : await znajdzPoLoginie(pool, parsed.value.login);
    const passwordOk = user ? await sprawdzHaslo(parsed.value.password, user.password_hash) : false;
    if (!user || !passwordOk) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.LOGIN_FAILED,
        severity: "warning",
        userId: user?.id || null,
        loginAttempt: parsed.value.login || parsed.value.profileId || null,
        request,
        details: { reason: "invalid_credentials" }
      });
      response.status(401).json({ error: "invalid_credentials", message: "The login name or password is incorrect." });
      return;
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.LOGIN_FAILED,
        severity: "warning",
        userId: user.id,
        loginAttempt: user.login,
        request,
        details: { reason: "forbidden_role", role: user.role }
      });
      response.status(403).json({ error: "forbidden_role", message: "This account role is not allowed to log on." });
      return;
    }

    const authorizationCode = await createCode(pool, {
      userId: user.id,
      redirectUri: parsed.value.redirectUri
    });
    const redirectTo = `${authorizationCode.redirectUri}?code=${encodeURIComponent(authorizationCode.code)}`;

    await zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.LOGIN_SUCCESS,
      severity: "info",
      userId: user.id,
      loginAttempt: user.login,
      request
    });
    await zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.AUTH_CODE_ISSUED,
      severity: "info",
      userId: user.id,
      loginAttempt: user.login,
      request,
      details: { redirectUri: authorizationCode.redirectUri, expiresAt: authorizationCode.expiresAt }
    });

    response.json({
      redirectTo,
      expiresAt: authorizationCode.expiresAt
    });
  }));

  // Callback wymienia code na cookie sesji. Tu jest faktyczny moment zalogowania.
  router.post("/token", requireCsrf, tokenRateLimit, asyncHandler(async (request, response) => {
    const parsed = parseTokenBody(request.body);
    if (!parsed.ok) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.AUTH_CODE_INVALID,
        severity: "warning",
        request,
        details: { reason: "invalid_input" }
      });
      response.status(400).json({ error: "invalid_input", message: parsed.message });
      return;
    }

    const codeHash = hashAuthorizationCode(parsed.value.code);
    const codeRow = await findByCodeHash(pool, codeHash);
    if (!codeRow) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.AUTH_CODE_INVALID,
        severity: "warning",
        request,
        details: { reason: "code_not_found" }
      });
      response.status(400).json({ error: "invalid_code", message: authorizationCodeErrorMessage("invalid_code") });
      return;
    }
    if (codeRow.used_at) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.AUTH_CODE_REUSED_BLOCKED,
        severity: "warning",
        userId: codeRow.user_id,
        request
      });
      response.status(400).json({ error: "used_code", message: authorizationCodeErrorMessage("used_code") });
      return;
    }
    if (Boolean(codeRow.is_expired)) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.AUTH_CODE_EXPIRED,
        severity: "warning",
        userId: codeRow.user_id,
        request
      });
      response.status(400).json({ error: "expired_code", message: authorizationCodeErrorMessage("expired_code") });
      return;
    }

    const used = await markCodeAsUsed(pool, codeRow.id);
    if (!used) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.AUTH_CODE_REUSED_BLOCKED,
        severity: "warning",
        userId: codeRow.user_id,
        request,
        details: { reason: "mark_used_failed" }
      });
      response.status(400).json({ error: "used_code", message: authorizationCodeErrorMessage("used_code") });
      return;
    }

    const user = await znajdzPoId(pool, codeRow.user_id);
    if (!user) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.AUTH_CODE_INVALID,
        severity: "warning",
        userId: codeRow.user_id,
        request,
        details: { reason: "user_not_found" }
      });
      response.status(400).json({ error: "invalid_code", message: authorizationCodeErrorMessage("invalid_code") });
      return;
    }

    await zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.AUTH_CODE_EXCHANGED,
      severity: "info",
      userId: user.id,
      loginAttempt: user.login,
      request
    });

    const token = signUserToken(user);
    setAuthCookie(response, token);
    const body = {
      tokenType: "Cookie",
      expiresIn: serverConfig.jwtExpiresIn,
      user: naPublicznegoUzytkownika(user)
    };
    if (serverConfig.allowTokenResponseForTests && request.body?.returnToken === true) {
      body.token = token;
      body.tokenType = "Bearer";
    }
    response.json(body);
  }));

  // Logout czysci cookie i zapisuje zdarzenie. Prosto, ale musi byc przez CSRF.
  router.post("/logout", requireCsrf, asyncHandler(async (request, response) => {
    await zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.LOGOUT,
      severity: "info",
      request
    });
    clearAuthCookie(response);
    response.json({ ok: true });
  }));

  // /me to prawda o sesji. Frontend może sobie pamietac UI, ale tu sprawdza czy user żyje.
  router.get("/me", wymagajAutoryzacji, (request, response) => {
    response.json({ user: request.auth.publicUser });
  });

  return router;
}

function asyncHandler(handler) {
  return function wrappedHandler(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

// Login może isc po profileId albo po loginie technicznym, wiec trzeba to normalnie rozdzielic.
function parseLoginBody(body) {
  const profileId = normalizePublicProfileId(body?.profileId);
  const login = profileId ? "" : normalizeLogin(body?.login);
  if (!profileId && !login) {
    return { ok: false, message: "Choose a valid account." };
  }
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length > 128) {
    return { ok: false, message: "The password is too long." };
  }
  const redirectUri = normalizeRedirectUri(body?.redirectUri);
  if (!redirectUri) {
    return { ok: false, message: "The authorization callback is not valid." };
  }
  return { ok: true, value: { login, profileId, password, redirectUri } };
}

function parseTokenBody(body) {
  const code = typeof body?.code === "string" ? body.code.trim() : "";
  if (!/^[A-Za-z0-9_-]{32,256}$/.test(code)) {
    return { ok: false, message: "The authorization code is not valid." };
  }
  return { ok: true, value: { code } };
}

// Walidacja formularza rejestracji. Lepiej odrzucic dziwne dane tutaj niz potem w SQL.
function parseRegisterBody(body) {
  const username = normalizeDisplayName(body?.username || body?.displayName);
  const login = normalizeLogin(body?.login);
  const passwordRequired = body?.passwordRequired !== false;
  const password = typeof body?.password === "string" ? body.password : "";
  const avatar = normalizeAvatar(body?.avatar || body?.avatarId);

  if (!username) {
    return { ok: false, message: "Type a user name." };
  }
  if (!login || login.length < 3) {
    return { ok: false, message: "Use a login name with at least 3 letters or numbers." };
  }
  if (passwordRequired && (password.length < 4 || password.length > 128)) {
    return { ok: false, message: "Use a password between 4 and 128 characters." };
  }
  if (!passwordRequired && password.length > 0) {
    return { ok: false, message: "Do not send a password when password protection is disabled." };
  }

  return {
    ok: true,
    value: {
      username,
      login,
      password,
      passwordRequired,
      role: "user",
      avatar
    }
  };
}

function normalizePublicProfileId(value) {
  const profileId = String(value || "").trim().toLowerCase();
  return isValidPublicProfileId(profileId) ? profileId : "";
}

function normalizeLogin(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}

function normalizeDisplayName(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ").slice(0, 32);
  return text || "";
}

function normalizeAvatar(value) {
  const avatar = String(value || "guest").trim().toLowerCase();
  return /^[a-z0-9_-]{1,42}$/.test(avatar) ? avatar : "guest";
}

function normalizeRedirectUri(value) {
  const redirectUri = typeof value === "string" && value.trim() ? value.trim() : "/auth/callback";
  if (redirectUri === "/auth/callback") {
    return redirectUri;
  }
  return null;
}

function authorizationCodeErrorMessage(reason) {
  if (reason === "expired_code") {
    return "The authorization code has expired. Please log on again.";
  }
  if (reason === "used_code") {
    return "The authorization code has already been used.";
  }
  return "The authorization code is invalid.";
}

function isDuplicateLoginError(error) {
  return error?.code === "ER_DUP_ENTRY" || String(error?.message || "").toLowerCase().includes("duplicate");
}
