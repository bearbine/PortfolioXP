// Testowy przeplyw autoryzacji odpalany z npm run test:auth.
// Tu celowo sprawdzam caly login flow, bo jeden maly błąd w auth potrafi rozwalić pol projektu.
import mysql from "mysql2/promise";
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootPath = resolve(fileURLToPath(new URL("..", import.meta.url)));
loadDotEnv(resolve(rootPath, ".env"));

const port = Number.parseInt(process.env.PORTFOLIO_XP_TEST_PORT || "4185", 10);
const baseUrl = `http://127.0.0.1:${port}`;
const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number.parseInt(process.env.DB_PORT || "3306", 10),
  database: process.env.DB_NAME || "portfolio_xp",
  user: process.env.DB_USER || "xp_user",
  password: process.env.DB_PASSWORD || "xp_password"
};
const suffix = Date.now().toString(36);
const testLogin = `auth-test-${suffix}`;
const passwordlessLogin = `no-password-${suffix}`;

const env = {
  ...process.env,
  PORT: String(port),
  HOST: "127.0.0.1",
  DB_HOST: dbConfig.host,
  DB_PORT: String(dbConfig.port),
  DB_NAME: dbConfig.database,
  DB_USER: dbConfig.user,
  DB_PASSWORD: dbConfig.password,
  JWT_SECRET: process.env.JWT_SECRET || "test-secret-for-portfolio-xp-auth-flow-1234567890",
  JWT_EXPIRES_IN: "15m",
  AUTH_CODE_EXPIRES_SECONDS: "60",
  AUTH_COOKIE_NAME: "xp_auth",
  CSRF_COOKIE_NAME: "xp_csrf",
  AUTH_RETURN_TOKEN_FOR_TESTS: "true"
};

const child = spawn(process.execPath, ["server/server.js"], {
  cwd: rootPath,
  env,
  stdio: ["ignore", "pipe", "pipe"]
});

const stderr = [];
child.stderr.on("data", (chunk) => stderr.push(chunk.toString()));

let db;

try {
  await waitForServer();
  db = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    charset: "utf8mb4",
    timezone: "Z"
  });

  await assertMariaDbReady(db);
  await assertTablesExist(db);
  await assertInitialUserSeeded(db);

  const csrfJar = new Map();
  const csrfToken = await getCsrf(csrfJar);
  assert(Boolean(csrfToken) && csrfJar.has("xp_csrf"), "CSRF endpoint sets cookie and returns token");

  const loginProfiles = await request("/api/auth/profiles");
  assert(Array.isArray(loginProfiles.users) && loginProfiles.users.length >= 1, "login profiles endpoint returns public profiles");
  const adminLoginProfile = loginProfiles.users.find((user) => user.displayName === "Roma");
  assert(Boolean(adminLoginProfile), "login profiles include Roma display card");
  assert(/^profile-[a-f0-9]{24}$/.test(adminLoginProfile.id), "login profile id is an opaque public id");
  for (const profile of loginProfiles.users) {
    for (const field of ["databaseId", "login", "role", "createdAt", "updatedAt", "username", "password_hash"]) {
      assert(!(field in profile), `/api/auth/profiles does not expose ${field}`);
    }
  }

  const profileLoginJar = new Map();
  const profileLogin = await csrfRequest("/api/auth/login", {
    method: "POST",
    cookieJar: profileLoginJar,
    body: { profileId: adminLoginProfile.id, password: "admin", redirectUri: "/auth/callback" }
  });
  assert(Boolean(profileLogin.redirectTo), "login accepts opaque public profile id");

  const noCsrfLogin = await request("/api/auth/login", {
    method: "POST",
    body: { login: "admin", password: "admin", redirectUri: "/auth/callback" },
    expectedStatus: 403
  });
  assert(noCsrfLogin.error === "invalid_csrf", "login without CSRF fails");

  const registerJar = new Map();
  const created = await csrfRequest("/api/auth/register", {
    method: "POST",
    cookieJar: registerJar,
    expectedStatus: 201,
    body: {
      username: "Auth Test",
      login: testLogin,
      password: "pass1234",
      avatarId: "guest"
    }
  });
  assert(created.user.login === testLogin, "register returns created user");
  await assertPasswordIsHashed(db, testLogin, "pass1234");

  const duplicate = await csrfRequest("/api/auth/register", {
    method: "POST",
    expectedStatus: 409,
    body: {
      username: "Duplicate",
      login: testLogin,
      password: "pass1234",
      avatarId: "guest"
    }
  });
  assert(duplicate.error === "login_taken", "duplicate login is rejected");

  const passwordless = await csrfRequest("/api/auth/register", {
    method: "POST",
    expectedStatus: 201,
    body: {
      username: "No Password",
      login: passwordlessLogin,
      password: "",
      passwordRequired: false,
      avatarId: "duck"
    }
  });
  assert(passwordless.user.passwordRequired === false, "register supports passwordless users");
  await assertPasswordIsHashed(db, passwordlessLogin, "");

  const rateLimitedRegister = await csrfRequest("/api/auth/register", {
    method: "POST",
    expectedStatus: 429,
    body: {
      username: "Rate Limited",
      login: `rate-limited-${suffix}`,
      password: "pass1234",
      avatarId: "guest"
    }
  });
  assert(rateLimitedRegister.error === "too_many_attempts", "register endpoint is rate-limited");

  const wrongPassword = await csrfRequest("/api/auth/login", {
    method: "POST",
    body: { login: testLogin, password: "wrong", redirectUri: "/auth/callback" },
    expectedStatus: 401
  });
  assert(wrongPassword.error === "invalid_credentials", "wrong password is rejected cleanly");

  const userJar = new Map();
  const login = await csrfRequest("/api/auth/login", {
    method: "POST",
    cookieJar: userJar,
    body: { login: testLogin, password: "pass1234", redirectUri: "/auth/callback" }
  });
  assert(Boolean(login.redirectTo), "login returns authorization callback URL");
  assert(!("token" in login), "login does not return direct JWT");
  const authCode = codeFromRedirect(login.redirectTo);
  await assertAuthorizationCodeIsHashed(db, authCode);

  const tokenExchange = await csrfRequest("/api/auth/token", {
    method: "POST",
    cookieJar: userJar,
    body: { code: authCode, returnToken: true }
  });
  assert(tokenExchange.user.login === testLogin, "authorization code exchange returns public user");
  assert(!("password_hash" in tokenExchange.user), "token exchange does not expose password hash");
  assert(userJar.has("xp_auth"), "authorization code exchange sets auth cookie");

  const reusedCode = await csrfRequest("/api/auth/token", {
    method: "POST",
    cookieJar: userJar,
    body: { code: authCode },
    expectedStatus: 400
  });
  assert(reusedCode.error === "used_code", "authorization code cannot be reused");

  const invalidCode = await csrfRequest("/api/auth/token", {
    method: "POST",
    body: { code: "invalid-code-value" },
    expectedStatus: 400
  });
  assert(["invalid_input", "invalid_code"].includes(invalidCode.error), "invalid authorization code is rejected");

  const expiredJar = new Map();
  const expiredLogin = await csrfRequest("/api/auth/login", {
    method: "POST",
    cookieJar: expiredJar,
    body: { login: testLogin, password: "pass1234", redirectUri: "/auth/callback" }
  });
  const expiredCode = codeFromRedirect(expiredLogin.redirectTo);
  await expireAuthorizationCode(db, expiredCode);
  const expiredExchange = await csrfRequest("/api/auth/token", {
    method: "POST",
    cookieJar: expiredJar,
    body: { code: expiredCode },
    expectedStatus: 400
  });
  assert(expiredExchange.error === "expired_code", "expired authorization code is rejected");

  const me = await request("/api/auth/me", { cookieJar: userJar });
  assert(me.user.login === testLogin, "me returns token user from auth cookie");

  const userAdminAttempt = await request("/api/protected/admin", {
    cookieJar: userJar,
    expectedStatus: 403
  });
  assert(userAdminAttempt.error === "forbidden", "admin endpoint rejects normal users");

  const adminJar = await loginAndExchange("admin", "admin", { returnToken: true });
  const adminProtected = await request("/api/protected/admin", { cookieJar: adminJar.cookies });
  assert(adminProtected.permissions.canOpenAdminResource === true, "admin endpoint accepts admin auth cookie");

  const adminHeaderProtected = await request("/api/protected/admin", {
    headers: { Authorization: `Bearer ${adminJar.token}` }
  });
  assert(adminHeaderProtected.permissions.canOpenAdminResource === true, "admin endpoint accepts Authorization Bearer token for API tests");

  const auditLogs = await request("/api/admin/audit-logs?limit=80", { cookieJar: adminJar.cookies });
  assert(Array.isArray(auditLogs.logs), "admin audit logs endpoint returns logs");
  const auditEvents = new Set(auditLogs.logs.map((log) => log.eventType));
  assert(auditEvents.has("LOGIN_SUCCESS"), "audit logs include login success events");
  assert(auditEvents.has("LOGIN_FAILED"), "audit logs include failed login events");
  assert(auditEvents.has("AUTH_CODE_EXCHANGED"), "audit logs include authorization code exchange events");
  assert(auditEvents.has("ADMIN_ACCESS_GRANTED"), "audit logs include admin access granted events");
  assert(!JSON.stringify(auditLogs).toLowerCase().includes("pass1234"), "audit logs do not expose plain passwords");

  const passwordlessJar = await loginAndExchange(passwordlessLogin, "");
  assert(passwordlessJar.cookies.has("xp_auth"), "passwordless registered user can complete code flow with blank password");

  const missingToken = await request("/api/protected/admin", { expectedStatus: 401 });
  assert(missingToken.error === "missing_token", "protected admin route rejects missing token");

  const invalidToken = await request("/api/protected/admin", {
    headers: { Authorization: "Bearer invalid.token.value" },
    expectedStatus: 401
  });
  assert(["invalid_token", "expired_token"].includes(invalidToken.error), "protected admin route rejects invalid token");

  console.log(JSON.stringify({ ok: true, checks: "MariaDB auth, CSRF, authorization code, JWT cookie, role checks, and audit logs passed" }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
    stderr
  }, null, 2));
  process.exitCode = 1;
} finally {
  if (db) {
    await cleanupTestUsers(db).catch(() => {});
    await db.end().catch(() => {});
  }
  child.kill();
  await waitForChildExit();
}

// Tu robie caly login: CSRF, /login, code z redirecta i /token.
async function loginAndExchange(login, password, { returnToken = false } = {}) {
  const cookieJar = new Map();
  const loginResult = await csrfRequest("/api/auth/login", {
    method: "POST",
    cookieJar,
    body: { login, password, redirectUri: "/auth/callback" }
  });
  assert(Boolean(loginResult.redirectTo) && !("token" in loginResult), `${login} login returns authorization code callback`);
  const tokenResult = await csrfRequest("/api/auth/token", {
    method: "POST",
    cookieJar,
    body: { code: codeFromRedirect(loginResult.redirectTo), returnToken }
  });
  assert(cookieJar.has("xp_auth"), `${login} token exchange sets auth cookie`);
  return { cookies: cookieJar, token: tokenResult.token || null, user: tokenResult.user };
}

async function csrfRequest(path, options = {}) {
  const cookieJar = options.cookieJar || new Map();
  const csrfToken = options.csrfToken || await getCsrf(cookieJar);
  return request(path, {
    ...options,
    cookieJar,
    headers: {
      "X-CSRF-Token": csrfToken,
      ...(options.headers || {})
    }
  });
}

async function getCsrf(cookieJar = new Map()) {
  const data = await request("/api/auth/csrf", { cookieJar });
  return data.csrfToken;
}

async function request(path, { method = "GET", body = null, headers = {}, cookieJar = null, expectedStatus = 200 } = {}) {
  const requestHeaders = {
    Accept: "application/json",
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...headers
  };
  if (cookieJar && cookieJar.size > 0) {
    requestHeaders.Cookie = [...cookieJar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : null
  });
  if (cookieJar) {
    storeCookies(response, cookieJar);
  }
  const data = await response.json().catch(() => ({}));
  if (response.status !== expectedStatus) {
    throw new Error(`${method} ${path} expected ${expectedStatus}, got ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 12000) {
    if (child.exitCode !== null) {
      throw new Error(`server exited early with code ${child.exitCode}`);
    }
    try {
      await request("/api/auth/profiles");
      return;
    } catch {
      await delay(100);
    }
  }
  throw new Error("timed out waiting for auth server");
}

async function assertMariaDbReady(pool) {
  const [rows] = await pool.query("SELECT 1 AS ok");
  assert(rows[0]?.ok === 1, "MariaDB connection works");
}

async function assertTablesExist(pool) {
  const [rows] = await pool.execute(
    `
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'auth_codes', 'audit_logs')
    `,
    [dbConfig.database]
  );
  const names = new Set(rows.map((row) => row.TABLE_NAME));
  assert(names.has("users") && names.has("auth_codes") && names.has("audit_logs"), "MariaDB users, auth_codes, and audit_logs tables exist");
}

async function assertInitialUserSeeded(pool) {
  const [rows] = await pool.execute(
    "SELECT username, login, role, password_required FROM users WHERE login = ? LIMIT 1",
    ["admin"]
  );
  const admin = rows[0];
  assert(admin?.username === "Roma", "initial Roma account is seeded/upserted");
  assert(admin?.role === "admin" && Number(admin.password_required) === 1, "initial Roma account is an admin password-protected account");

  const [userCountRows] = await pool.execute("SELECT COUNT(*) AS count FROM users");
  assert(Number(userCountRows[0]?.count || 0) === 1, "startup seed resets login users to the initial admin account");
}

async function assertPasswordIsHashed(pool, login, plainPassword) {
  const [rows] = await pool.execute("SELECT password_hash FROM users WHERE login = ? LIMIT 1", [login]);
  const row = rows[0];
  assert(row && typeof row.password_hash === "string", "password hash exists in MariaDB");
  assert(row.password_hash !== plainPassword, "plain password is not stored");
  assert(/^\$2[aby]\$\d{2}\$/.test(row.password_hash), "password hash uses bcrypt format with salt");
}

async function assertAuthorizationCodeIsHashed(pool, code) {
  const codeHash = hashAuthorizationCode(code);
  const [rows] = await pool.execute("SELECT code_hash FROM auth_codes WHERE code_hash = ? LIMIT 1", [codeHash]);
  const row = rows[0];
  assert(row && row.code_hash === codeHash, "authorization code hash exists in MariaDB");
  assert(row.code_hash !== code, "plain authorization code is not stored");
}

async function expireAuthorizationCode(pool, code) {
  await pool.execute(
    "UPDATE auth_codes SET expires_at = UTC_TIMESTAMP() - INTERVAL 5 SECOND WHERE code_hash = ?",
    [hashAuthorizationCode(code)]
  );
}

async function cleanupTestUsers(pool) {
  await pool.execute(
    "DELETE FROM users WHERE login IN (?, ?)",
    [testLogin, passwordlessLogin]
  );
}

function hashAuthorizationCode(code) {
  return createHash("sha256").update(String(code)).digest("hex");
}

function codeFromRedirect(redirectTo) {
  const url = new URL(redirectTo, baseUrl);
  const code = url.searchParams.get("code");
  assert(Boolean(code), "authorization callback contains code");
  return code;
}

function storeCookies(response, cookieJar) {
  const setCookieHeaders = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie")].filter(Boolean);

  for (const header of setCookieHeaders) {
    const [cookiePair] = header.split(";");
    const equalsIndex = cookiePair.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const name = cookiePair.slice(0, equalsIndex);
    const value = cookiePair.slice(equalsIndex + 1);
    if (!value) {
      cookieJar.delete(name);
    } else {
      cookieJar.set(name, value);
    }
  }
}

function loadDotEnv(envPath) {
  if (!existsSync(envPath)) {
    return;
  }
  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }
    const key = line.slice(0, equalsIndex).trim();
    const value = stripQuotes(line.slice(equalsIndex + 1).trim());
    if (key && !Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  }
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForChildExit() {
  if (child.exitCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
    setTimeout(resolve, 2500);
  });
}
