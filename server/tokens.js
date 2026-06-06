// JWT i cookie sesji.
// Token jest podpisany na backendzie, a frontend ma go dostawac głównie przez cookie httpOnly.
import jwt from "jsonwebtoken";
import { serverConfig } from "./config.js";

// Do tokenu wrzucam tylko potrzebne dane, bez hasel i innych glupot.
export function signUserToken(user) {
  return jwt.sign(
    {
      userId: Number(user.id),
      login: user.login,
      username: user.username,
      role: user.role
    },
    serverConfig.jwtSecret,
    {
      subject: String(user.id),
      issuer: "portfolio-xp",
      expiresIn: serverConfig.jwtExpiresIn,
      algorithm: "HS256"
    }
  );
}

// Weryfikacja tokenu to pierwszy krok, ale potem i tak sprawdzamy usera w bazie.
export function verifyUserToken(token) {
  return jwt.verify(token, serverConfig.jwtSecret, {
    issuer: "portfolio-xp",
    algorithms: ["HS256"]
  });
}

// Cookie httpOnly, bo token nie powinien latac po JS jak zwykly string.
export function setAuthCookie(response, token) {
  response.cookie(serverConfig.authCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: serverConfig.cookieSecure,
    path: "/",
    maxAge: jwtMaxAgeMs(serverConfig.jwtExpiresIn)
  });
}

export function clearAuthCookie(response) {
  response.clearCookie(serverConfig.authCookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: serverConfig.cookieSecure,
    path: "/"
  });
}

export function getAuthTokenFromRequest(request) {
  const cookieToken = readCookie(request, serverConfig.authCookieName);
  if (cookieToken) {
    return { token: cookieToken, source: "cookie" };
  }

  const header = request.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (match) {
    return { token: match[1], source: "authorization_header" };
  }

  return { token: null, source: null };
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

function jwtMaxAgeMs(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value * 1000;
  }
  const text = String(value || "").trim();
  const match = text.match(/^(\d+)([smhd])?$/i);
  if (!match) {
    return 60 * 60 * 1000;
  }
  const amount = Number.parseInt(match[1], 10);
  const unit = (match[2] || "s").toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  return amount * multipliers[unit];
}
