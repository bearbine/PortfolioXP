// Magazyn sesji po stronie przeglądarki.
// To tylko stan pomocniczy UI, prawdziwa sesje i tak potwierdza backend.
import { STORAGE_KEYS, STORAGE_VERSION } from "../konfiguracja/system.js";
import { isPlainObject, readRecord, writeRecord } from "./storage.js";

const DEFAULT_SESSION = Object.freeze({
  version: STORAGE_VERSION,
  phase: "boot",
  obecnyUzytkownikId: null,
  lastUserId: "admin"
});

const SESSION_PHASES = Object.freeze(["boot", "login", "welcome", "desktop", "wylaczKomputer"]);

function isSafeUserId(userId) {
  return typeof userId === "string" && /^[a-z0-9_-]{1,72}$/i.test(userId);
}

function validateSession(record) {
  const phaseOk = SESSION_PHASES.includes(record.phase);
  const currentOk = record.obecnyUzytkownikId === null || isSafeUserId(record.obecnyUzytkownikId);
  const lastOk = isSafeUserId(record.lastUserId);
  return isPlainObject(record) && phaseOk && currentOk && lastOk;
}

// Store sesji pomaga frontendowi pamietac faze UI, ale backend nadal potwierdza prawdziwa sesje.
export class MagazynSesji extends EventTarget {
  constructor() {
    super();
    this.session = readRecord(STORAGE_KEYS.session, DEFAULT_SESSION, validateSession);
  }

  getSession() {
    return { ...this.session };
  }

  setPhase(phase) {
    if (!SESSION_PHASES.includes(phase)) {
      return;
    }
    this.session = { ...this.session, version: STORAGE_VERSION, phase };
    this.persist();
  }

  setCurrentUser(userId) {
    if (userId !== null && !isSafeUserId(userId)) {
      return;
    }
    this.session = {
      ...this.session,
      version: STORAGE_VERSION,
      obecnyUzytkownikId: userId,
      lastUserId: userId || this.session.lastUserId
    };
    this.persist();
  }

  startBoot() {
    this.session = { ...this.session, version: STORAGE_VERSION, phase: "boot", obecnyUzytkownikId: null };
    this.persist();
  }

  startWelcome(userId) {
    if (!isSafeUserId(userId)) {
      return false;
    }
    this.session = { ...this.session, version: STORAGE_VERSION, phase: "welcome", obecnyUzytkownikId: userId, lastUserId: userId };
    this.persist();
    return true;
  }

  startDesktop(userId) {
    if (!isSafeUserId(userId)) {
      return false;
    }
    this.session = { ...this.session, version: STORAGE_VERSION, phase: "desktop", obecnyUzytkownikId: userId, lastUserId: userId };
    this.persist();
    return true;
  }

  clearCurrentUser() {
    this.session = { ...this.session, version: STORAGE_VERSION, obecnyUzytkownikId: null, phase: "login" };
    this.persist();
  }

  wylaczKomputer() {
    this.session = { ...this.session, version: STORAGE_VERSION, obecnyUzytkownikId: null, phase: "wylaczKomputer" };
    this.persist();
  }

  isRestorableDesktop() {
    return this.session.phase === "desktop" && isSafeUserId(this.session.obecnyUzytkownikId);
  }

  persist() {
    writeRecord(STORAGE_KEYS.session, this.session);
    this.dispatchEvent(new CustomEvent("sessionchange", { detail: this.getSession() }));
  }
}
