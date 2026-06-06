// Male wrappery na bcrypt.
// Haslo nigdy nie powinno trafic do bazy jako zwykly tekst, nawet w takim projekcie.
import bcrypt from "bcryptjs";
import { serverConfig } from "./config.js";

export async function zahashujHaslo(password) {
  return bcrypt.hash(String(password), serverConfig.bcryptRounds);
}

export async function sprawdzHaslo(password, passwordHash) {
  if (typeof passwordHash !== "string" || passwordHash.length === 0) {
    return false;
  }
  return bcrypt.compare(String(password), passwordHash);
}
