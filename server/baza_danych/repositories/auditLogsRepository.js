// Repository dla audit_logs.
// Endpointy nie powinny składac SQL-a gdzie popadnie, dlatego logika bazy siedzi tutaj.
const AUDIT_COLUMNS = `
  id,
  event_type,
  severity,
  user_id,
  login_attempt,
  ip_address,
  user_agent,
  details,
  created_at
`;

const ALLOWED_SEVERITIES = new Set(["info", "warning", "critical"]);

// Zapis pojedynczego logu. Jak eventType jest pusty, nie udajemy ze cos zapisano.
export async function createAuditLog(pool, entry) {
  const eventType = normalizeEventType(entry.eventType);
  if (!eventType) {
    return null;
  }

  const severity = ALLOWED_SEVERITIES.has(entry.severity) ? entry.severity : "info";
  const userId = toNullableNumber(entry.userId);
  const loginAttempt = normalizeNullableText(entry.loginAttempt, 80);
  const ipAddress = normalizeNullableText(entry.ipAddress, 45);
  const userAgent = normalizeNullableText(entry.userAgent, 255);
  const details = JSON.stringify(sanitizeDetails(entry.details));

  const [result] = await pool.execute(
    `
      INSERT INTO audit_logs (
        event_type,
        severity,
        user_id,
        login_attempt,
        ip_address,
        user_agent,
        details
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [eventType, severity, userId, loginAttempt, ipAddress, userAgent, details]
  );

  return result.insertId || null;
}

// Pobieranie logow z filtrami. Limit jest przyciety, żeby nikt nie zaciagnal pol bazy do UI.
export async function listRecentAuditLogs(pool, { limit = 100, offset = 0, eventType = "", severity = "" } = {}) {
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 100, 1), 200);
  const safeOffset = Math.max(Number.parseInt(offset, 10) || 0, 0);
  const filters = [];
  const params = [];

  const normalizedEventType = normalizeEventType(eventType);
  if (normalizedEventType) {
    filters.push("event_type = ?");
    params.push(normalizedEventType);
  }

  if (ALLOWED_SEVERITIES.has(severity)) {
    filters.push("severity = ?");
    params.push(severity);
  }

  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `
      SELECT ${AUDIT_COLUMNS}
      FROM audit_logs
      ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
    `,
    [...params, safeLimit, safeOffset]
  );

  return rows.map(toPublicAuditLog);
}

export function toPublicAuditLog(row) {
  return {
    id: Number(row.id),
    eventType: row.event_type,
    severity: row.severity,
    userId: row.user_id === null || row.user_id === undefined ? null : Number(row.user_id),
    loginAttempt: row.login_attempt || null,
    ipAddress: row.ip_address || null,
    userAgent: row.user_agent || null,
    details: parseDetails(row.details),
    createdAt: formatDate(row.created_at)
  };
}

function normalizeEventType(value) {
  const eventType = String(value || "").trim().toUpperCase();
  return /^[A-Z0-9_]{3,80}$/.test(eventType) ? eventType : "";
}

function normalizeNullableText(value, maxLength) {
  const text = String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
  return text || null;
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Tutaj wyrzucam pola typu token, password, code. Logi to nie kosz na sekrety.
// Czyszczenie details, bo ktos kiedys na pewno przez przypadek wrzuci tam token albo haslo.
function sanitizeDetails(details) {
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return {};
  }

  const blockedKeys = new Set([
    "password",
    "passwordHash",
    "password_hash",
    "token",
    "jwt",
    "authorizationCode",
    "code",
    "csrfToken",
    "secret",
    "dbPassword"
  ]);
  const safe = {};

  for (const [key, value] of Object.entries(details)) {
    if (blockedKeys.has(key)) {
      continue;
    }
    if (!/^[a-zA-Z0-9_:-]{1,48}$/.test(key)) {
      continue;
    }
    if (value === null || typeof value === "boolean" || typeof value === "number") {
      safe[key] = value;
    } else if (typeof value === "string") {
      safe[key] = value.slice(0, 240);
    }
  }

  return safe;
}

function parseDetails(value) {
  if (!value) {
    return {};
  }
  if (typeof value === "object") {
    return sanitizeDetails(value);
  }
  try {
    return sanitizeDetails(JSON.parse(String(value)));
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value ? String(value) : null;
}
