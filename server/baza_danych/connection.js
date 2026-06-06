// Połączenie z MariaDB.
// Pool jest wspolny dla backendu, żeby nie tworzyc nowego połączenia przy kazdym zapytaniu.
import mysql from "mysql2/promise";
import { serverConfig } from "../config.js";

// Tworzenie poola jest funkcja, bo testy i init-db czasem potrzebuja swojej instancji.
export function utworzPuleBazy(config = serverConfig, options = {}) {
  return mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: options.multipleStatements === true,
    charset: "utf8mb4",
    timezone: "Z"
  });
}

export async function assertDatabaseConnection(pool) {
  await pool.query("SELECT 1");
}
