// Repository dla kodow autoryzacyjnych.
// Kod z URL jest jednorazowy, a w bazie trzymany jest hash, nie surowy tekst.
import { createHash, randomBytes } from "node:crypto";
import { serverConfig } from "../../config.js";

// Kod jest krótko zyjacy i jednorazowy, wiec tu zapisuje expires_at i usera.
export async function createCode(pool, {
  userId,
  redirectUri,
  lifetimeSeconds = serverConfig.authCodeExpiresSeconds
}) {
  const code = randomBytes(32).toString("base64url");
  const codeHash = hashAuthorizationCode(code);
  const expiresAt = new Date(Date.now() + Math.max(1, lifetimeSeconds) * 1000);

  await pool.execute(
    `
      INSERT INTO auth_codes (code_hash, user_id, redirect_uri, expires_at)
      VALUES (?, ?, ?, ?)
    `,
    [codeHash, Number(userId), redirectUri, toMariaDbDateTime(expiresAt)]
  );

  return {
    code,
    codeHash,
    redirectUri,
    expiresAt: expiresAt.toISOString()
  };
}

export async function findByCodeHash(pool, codeHash) {
  const [rows] = await pool.execute(
    `
      SELECT
        id,
        code_hash,
        user_id,
        redirect_uri,
        expires_at,
        used_at,
        expires_at <= UTC_TIMESTAMP() AS is_expired
      FROM auth_codes
      WHERE code_hash = ?
      LIMIT 1
    `,
    [codeHash]
  );
  return rows[0] || null;
}

// Used_at blokuje ponowne użycie. Bez tego callback mozna by odpalac w kolko.
export async function markCodeAsUsed(pool, id) {
  const [result] = await pool.execute(
    `
      UPDATE auth_codes
      SET used_at = UTC_TIMESTAMP()
      WHERE id = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP()
    `,
    [Number(id)]
  );
  return result.affectedRows === 1;
}

export async function deleteExpiredCodes(pool) {
  const [result] = await pool.execute(
    "DELETE FROM auth_codes WHERE expires_at <= UTC_TIMESTAMP() OR used_at IS NOT NULL"
  );
  return result.affectedRows || 0;
}

// Hashujemy code przed baza. Jak ktos zobaczy DB, nie ma miec gotowego kodu z URL.
export function hashAuthorizationCode(code) {
  return createHash("sha256").update(String(code)).digest("hex");
}

function toMariaDbDateTime(date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
