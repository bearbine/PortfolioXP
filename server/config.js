// Konfiguracja backendu z env.
// Specjalnie pilnuje sekretow, bo zostawienie domyslnego JWT_SECRET to proszenie sie o problemy.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

loadDotEnv(resolve(projectRoot, ".env"));

// Caly config w jednym miejscu, żeby serwer nie bral wartosci z env gdzie popadnie.
export const serverConfig = Object.freeze({
  isProduction: process.env.NODE_ENV === "production",
  host: process.env.HOST || "127.0.0.1",
  port: Number.parseInt(process.env.PORT || "4173", 10),
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  authCookieName: process.env.AUTH_COOKIE_NAME || "xp_auth",
  csrfCookieName: process.env.CSRF_COOKIE_NAME || "xp_csrf",
  authCodeExpiresSeconds: Number.parseInt(process.env.AUTH_CODE_EXPIRES_SECONDS || process.env.AUTH_CODE_LIFETIME_SECONDS || "60", 10),
  allowTokenResponseForTests: process.env.AUTH_RETURN_TOKEN_FOR_TESTS === "true",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  bcryptRounds: Number.parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  resetUsersOnInit: process.env.RESET_USERS_ON_INIT !== "false",
  db: Object.freeze({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number.parseInt(process.env.DB_PORT || "3306", 10),
    name: process.env.DB_NAME || "portfolio_xp",
    user: process.env.DB_USER || "xp_user",
    password: process.env.DB_PASSWORD || "xp_password"
  })
});

// Ten check ma zatrzymac start, jesli ktos zostawil przykladowy sekret. Lepiej fail od razu.
export function assertServerSecrets(config = serverConfig) {
  const secret = String(config.jwtSecret || "").trim();
  const normalized = secret.toLowerCase();

  if (
    !secret ||
    secret.length < 32 ||
    normalized.includes("change-this") ||
    normalized.includes("replace-this")
  ) {
    throw new Error("JWT_SECRET must be changed from the example value and contain at least 32 characters.");
  }
}

// Prosty loader .env bez dodatkowej paczki. Wystarcza do lokalnego projektu.
function loadDotEnv(envPath) {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const key = line.slice(0, equalsIndex).trim();
    const rawValue = line.slice(equalsIndex + 1).trim();
    if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    process.env[key] = stripQuotes(rawValue);
  }
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
