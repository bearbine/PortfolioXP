// Wrapper na localStorage.
// Jak localStorage zwroci śmieci, lepiej to spokojnie wyczyscic niz rozwalić caly start aplikacji.
import { STORAGE_VERSION } from "../konfiguracja/system.js";

const memoryStorage = new Map();

function getStorage() {
  try {
    const testKey = "portfolio-xp:storage-test";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return {
      getItem: (key) => memoryStorage.get(key) || null,
      setItem: (key, value) => memoryStorage.set(key, value),
      removeItem: (key) => memoryStorage.delete(key)
    };
  }
}

const storage = getStorage();

// Czytanie rekordow ma walidator. Jak dane sa zepsute, wracamy do fallbacku.
export function readRecord(key, fallback, validator) {
  const fallbackRecord = clone(fallback);
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallbackRecord;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      return fallbackRecord;
    }
    if (validator && !validator(parsed)) {
      return fallbackRecord;
    }
    return parsed;
  } catch {
    return fallbackRecord;
  }
}

export function writeRecord(key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeRecord(key) {
  try {
    storage.removeItem(key);
  } catch {
    // localStorage can be unavailable in privacy-restricted modes.
  }
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
