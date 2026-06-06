// Migracje bazy danych.
// Ten plik pilnuje, żeby tabele istnialy i mialy aktualny schemat.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { utworzPuleBazy } from "./connection.js";

// Migracje mozna odpalac wiele razy, dlatego SQL musi byc bezpieczny na ponowny start.
export async function uruchomMigracje(pool) {
  const schema = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  for (const statement of splitSqlStatements(schema)) {
    await pool.query(statement);
  }
  await uruchomMigracjeZgodnosci(pool);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pool = utworzPuleBazy();
  try {
    await uruchomMigracje(pool);
    console.log("MariaDB schema is up to date.");
  } finally {
    await pool.end();
  }
}

function splitSqlStatements(schema) {
  return schema
    .split(/;\s*(?:\r?\n|$)/)
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function uruchomMigracjeZgodnosci(pool) {
  await pool.query("UPDATE users SET role = 'user' WHERE role NOT IN ('admin', 'user')");
  await pool.query("ALTER TABLE users MODIFY role ENUM('admin', 'user') NOT NULL DEFAULT 'user'");
}
