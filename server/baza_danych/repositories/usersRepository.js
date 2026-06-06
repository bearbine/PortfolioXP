// Repository użytkownikow.
// Tutaj jest wyszukiwanie profili, tworzenie kont i mapowanie danych na bezpieczny format dla UI.
import { createPublicProfileId, matchesPublicProfileId } from "../../publicProfileIds.js";

// Role sa ograniczone, bo dodawanie losowych nazw rol tylko komplikuje auth.
export const ALLOWED_ROLES = Object.freeze(["admin", "user"]);

const USER_COLUMNS = `
  id,
  username,
  login,
  password_hash,
  password_required,
  role,
  avatar,
  created_at,
  updated_at
`;

export async function znajdzPoLoginie(pool, login) {
  const [rows] = await pool.execute(
    `SELECT ${USER_COLUMNS} FROM users WHERE login = ? LIMIT 1`,
    [login]
  );
  return rows[0] || null;
}

export async function znajdzPoId(pool, id) {
  const [rows] = await pool.execute(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = ? LIMIT 1`,
    [Number(id)]
  );
  return rows[0] || null;
}

// Frontend dostaje tylko dane profilu, nie techniczne śmieci z tabeli users.
export async function listaProfiliLogowania(pool) {
  const [rows] = await pool.execute(`
    SELECT id, username, login, password_required, role, avatar
    FROM users
    ORDER BY id ASC
  `);
  return rows.map(naProfilLogowania);
}

export async function znajdzPoPublicznymIdProfilu(pool, publicProfileId) {
  const [rows] = await pool.execute(`
    SELECT ${USER_COLUMNS}
    FROM users
    ORDER BY id ASC
  `);
  return rows.find((row) => matchesPublicProfileId(row, publicProfileId)) || null;
}

// Tworzenie usera idzie przez repo, żeby endpoint nie składal SQL ręcznie.
export async function utworzUzytkownika(pool, draft) {
  const [result] = await pool.execute(
    `
      INSERT INTO users (username, login, password_hash, password_required, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      draft.username,
      draft.login,
      draft.passwordHash,
      draft.passwordRequired ? 1 : 0,
      draft.role,
      draft.avatar
    ]
  );
  return naPublicznegoUzytkownika(await znajdzPoId(pool, result.insertId));
}

export async function zapiszKontoStartowe(pool, draft) {
  await pool.execute(
    `
      INSERT INTO users (username, login, password_hash, password_required, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        password_hash = VALUES(password_hash),
        password_required = VALUES(password_required),
        role = VALUES(role),
        avatar = VALUES(avatar)
    `,
    [
      draft.username,
      draft.login,
      draft.passwordHash,
      draft.passwordRequired ? 1 : 0,
      draft.role,
      draft.avatar
    ]
  );
  return naPublicznegoUzytkownika(await znajdzPoLoginie(pool, draft.login));
}

export function naProfilLogowania(row) {
  if (!row) {
    return null;
  }
  return {
    id: createPublicProfileId(row),
    displayName: row.username,
    roleLabel: rolaNaEtykiete(row.role),
    avatarId: row.avatar || "guest",
    passwordRequired: Boolean(row.password_required)
  };
}

export function naPublicznegoUzytkownika(row) {
  if (!row) {
    return null;
  }
  return {
    databaseId: Number(row.id),
    id: row.login,
    login: row.login,
    displayName: row.username,
    username: row.username,
    role: row.role,
    roleLabel: rolaNaEtykiete(row.role),
    avatarId: row.avatar || "guest",
    passwordRequired: Boolean(row.password_required),
    createdAt: formatDate(row.created_at),
    updatedAt: formatDate(row.updated_at)
  };
}

export function rolaNaEtykiete(role) {
  if (role === "admin") {
    return "Root-user";
  }
  return "user";
}

function formatDate(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value ? String(value) : null;
}
