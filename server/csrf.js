// Obsluga CSRF dla formularzy i POST requestow.
// Cookie + naglowek musza do siebie pasowac, inaczej request jest odrzucany.
import { randomBytes, timingSafeEqual } from "node:crypto";
import { AUDIT_EVENTS, zapiszLogAudytu } from "./audyt/auditLogger.js";
import { serverConfig } from "./config.js";

// Generuje token i od razu wrzuca go do cookie, żeby frontend mogl go potem odeslac w naglowku.
export function issueCsrfToken(response) {
  const token = randomBytes(32).toString("base64url");
  response.cookie(serverConfig.csrfCookieName, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: serverConfig.cookieSecure,
    path: "/",
    maxAge: 10 * 60 * 1000
  });
  return token;
}

// Middleware do sprawdzania CSRF. Jak naglowek i cookie sie nie zgadzaja, request wypada.
export function createRequireCsrf(pool) {
  return async function requireCsrf(request, response, next) {
    const cookieToken = readCookie(request, serverConfig.csrfCookieName);
    const headerToken = request.get("x-csrf-token") || "";

    if (!tokensMatch(cookieToken, headerToken)) {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.CSRF_INVALID,
        severity: "warning",
        request,
        details: {
          reason: "missing_or_mismatched_csrf",
          hasCookieToken: Boolean(cookieToken),
          hasHeaderToken: Boolean(headerToken)
        }
      });
      response.status(403).json({
        error: "invalid_csrf",
        message: "Invalid CSRF token."
      });
      return;
    }

    next();
  };
}

export function requireCsrf(request, response, next) {
  const cookieToken = readCookie(request, serverConfig.csrfCookieName);
  const headerToken = request.get("x-csrf-token") || "";

  if (!tokensMatch(cookieToken, headerToken)) {
    response.status(403).json({
      error: "invalid_csrf",
      message: "Invalid CSRF token."
    });
    return;
  }

  next();
}

function tokensMatch(cookieToken, headerToken) {
  if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken));
}

function readCookie(request, name) {
  const header = request.get("cookie") || "";
  for (const part of header.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return null;
}
