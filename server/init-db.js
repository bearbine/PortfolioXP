// Ręczne przygotowanie bazy danych.
// Przydaje sie lokalnie, kiedy chce odpalić migracje i seed bez startowania calego serwera.
import { serverConfig } from "./config.js";
import { utworzPuleBazy } from "./baza_danych/connection.js";
import { uruchomMigracje } from "./baza_danych/migrate.js";
import { zasiejKontaStartowe } from "./baza_danych/seed.js";

const db = utworzPuleBazy();

try {
  await uruchomMigracje(db);
  await zasiejKontaStartowe(db);
  const resetMode = serverConfig.resetUsersOnInit ? "reset users and seed initial account" : "seed initial account without resetting users";
  console.log(`Initialized MariaDB database ${serverConfig.db.name} at ${serverConfig.db.host}:${serverConfig.db.port} (${resetMode})`);
} finally {
  await db.end();
}
