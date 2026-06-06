// Seed danych startowych.
// Tu przygotowuje konto startowe i opcjonalnie resetuje użytkownikow dla czystego środowiska.
import { fileURLToPath } from "node:url";
import { serverConfig } from "../config.js";
import { utworzPuleBazy } from "./connection.js";
import { uruchomMigracje } from "./migrate.js";
import { zahashujHaslo } from "../passwords.js";
import { zapiszKontoStartowe } from "./repositories/usersRepository.js";

export const KONTA_STARTOWE = Object.freeze([
  {
    username: "Roma",
    login: "admin",
    password: "admin",
    role: "admin",
    avatar: "chess",
    passwordRequired: true
  }
]);

// Tutaj składam konta startowe z zahashowanym haslem, dopiero potem leci zapis do DB.
export async function zasiejKontaStartowe(pool, options = {}) {
  const resetUsers = options.resetUsers ?? serverConfig.resetUsersOnInit;
  const accounts = [];

  for (const user of KONTA_STARTOWE) {
    accounts.push({
      username: user.username,
      login: user.login,
      passwordHash: await zahashujHaslo(user.password),
      role: user.role,
      avatar: user.avatar,
      passwordRequired: user.passwordRequired
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (resetUsers) {
      await wyczyscKontaUzytkownikow(connection);
    }

    for (const account of accounts) {
      await zapiszKontoStartowe(connection, account);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Najpierw auth_codes, potem users, bo kody sa powiazane z userami.
export async function wyczyscKontaUzytkownikow(pool) {
  await pool.execute("DELETE FROM auth_codes");
  await pool.execute("DELETE FROM users");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pool = utworzPuleBazy();
  try {
    await uruchomMigracje(pool);
    await zasiejKontaStartowe(pool);
    console.log("MariaDB initial user seeded.");
  } finally {
    await pool.end();
  }
}
