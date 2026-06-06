// Magazyn profili i ustawien użytkownika.
// Trzyma rzeczy od UI, ale nie udaje backendowej autoryzacji.
import { DEFAULT_PROFILES, DEFAULT_USER_SETTINGS } from "../konfiguracja/profiles.js";
import { STORAGE_KEYS, STORAGE_VERSION } from "../konfiguracja/system.js";
import { AVATARS, WALLPAPERS, isKnownTheme } from "../konfiguracja/assets.js";
import { clone, isPlainObject, readRecord, writeRecord } from "./storage.js";

const DEFAULT_PROFILE_RECORD = Object.freeze({
  version: STORAGE_VERSION,
  profiles: Object.freeze({}),
  customProfiles: Object.freeze([])
});

const DEFAULT_SETTINGS_RECORD = Object.freeze({
  version: STORAGE_VERSION,
  users: Object.freeze({})
});

function validateProfileRecord(record) {
  return isPlainObject(record.profiles) && (record.customProfiles === undefined || Array.isArray(record.customProfiles));
}

function validateSettingsRecord(record) {
  return isPlainObject(record.users);
}

function normalizeUserId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42);
}


function hasAvatar(avatarId) {
  return AVATARS.some((avatar) => avatar.id === avatarId);
}

function normalizeDisplayName(value, fallback = "User") {
  const name = String(value || "").trim().replace(/\s+/g, " ").slice(0, 32);
  return name || fallback;
}

function normalizeProfileOverride(profile) {
  if (!isPlainObject(profile)) {
    return {};
  }
  const next = {};
  if (typeof profile.displayName === "string" && profile.displayName.trim().length > 0) {
    next.displayName = normalizeDisplayName(profile.displayName);
  }
  if (typeof profile.avatarId === "string" && hasAvatar(profile.avatarId)) {
    next.avatarId = profile.avatarId;
  }
  return next;
}


function normalizeRemoteProfile(profile) {
  if (!isPlainObject(profile)) {
    return null;
  }
  const id = normalizeUserId(profile.id);
  if (!id) {
    return null;
  }
  return {
    id,
    displayName: normalizeDisplayName(profile.displayName, id),
    avatarId: hasAvatar(profile.avatarId) ? profile.avatarId : AVATARS[0].id,
    passwordRequired: profile.passwordRequired !== false,
    passwordHint: typeof profile.passwordHint === "string" ? profile.passwordHint.trim().slice(0, 80) : "",
    role: typeof profile.roleLabel === "string" && profile.roleLabel.trim().length > 0
      ? profile.roleLabel.trim().slice(0, 48)
      : "user",
    isRemote: true
  };
}


function normalizeUserSettings(settings) {
  const next = clone(DEFAULT_USER_SETTINGS);
  if (!isPlainObject(settings)) {
    return next;
  }
  if (typeof settings.wallpaperId === "string" && WALLPAPERS.some((wallpaper) => wallpaper.id === settings.wallpaperId)) {
    next.wallpaperId = settings.wallpaperId;
  }
  if (typeof settings.themeId === "string" && isKnownTheme(settings.themeId)) {
    next.themeId = settings.themeId;
  }
  if (typeof settings.soundsEnabled === "boolean") {
    next.soundsEnabled = settings.soundsEnabled;
  }
  if (settings.cursorTheme === "system" || settings.cursorTheme === "xp-shadow") {
    next.cursorTheme = settings.cursorTheme;
  }
  if (isPlainObject(settings.desktop)) {
    next.desktop.iconSize = settings.desktop.iconSize === "large" ? "large" : "normal";
    next.desktop.showIconLabels = settings.desktop.showIconLabels !== false;
  }
  if (typeof settings.notepadText === "string") {
    next.notepadText = settings.notepadText.slice(0, 100000);
  }
  return next;
}

// Store profili trzyma ustawienia UI i dane profili, ale nie jest źródlem prawdy dla auth.
export class MagazynProfili extends EventTarget {
  constructor() {
    super();
    this.profileRecord = readRecord(STORAGE_KEYS.profiles, DEFAULT_PROFILE_RECORD, validateProfileRecord);
    this.settingsRecord = readRecord(STORAGE_KEYS.settings, DEFAULT_SETTINGS_RECORD, validateSettingsRecord);
    this.remoteProfiles = null;
  }

  getProfiles() {
    if (Array.isArray(this.remoteProfiles)) {
      return this.remoteProfiles.map((profile) => ({
        ...profile,
        ...normalizeProfileOverride(this.profileRecord.profiles[profile.id])
      }));
    }

    const defaultProfiles = DEFAULT_PROFILES.map((profile) => ({
      ...profile,
      ...normalizeProfileOverride(this.profileRecord.profiles[profile.id])
    }));


    return defaultProfiles;
  }

  getProfile(userId) {
    return this.getProfiles().find((profile) => profile.id === userId) || null;
  }

  hasProfile(userId) {
    return Boolean(this.getProfile(userId));
  }

  hasRemoteProfiles() {
    return Array.isArray(this.remoteProfiles);
  }

  // Profile z backendu nadpisuja liste logowania, ale lokalne ustawienia usera zostaja.
  setRemoteProfiles(profiles) {
    if (!Array.isArray(profiles)) {
      return false;
    }
    this.remoteProfiles = profiles
      .map((profile) => normalizeRemoteProfile(profile))
      .filter(Boolean);
    this.dispatchEvent(new CustomEvent("profileschange", { detail: { remote: true } }));
    return true;
  }

  upsertRemoteProfile(profile) {
    const normalized = normalizeRemoteProfile(profile);
    if (!normalized) {
      return null;
    }
    const profiles = Array.isArray(this.remoteProfiles) ? [...this.remoteProfiles] : [];
    const index = profiles.findIndex((item) => item.id === normalized.id);
    if (index === -1) {
      profiles.push(normalized);
    } else {
      profiles[index] = normalized;
    }
    this.remoteProfiles = profiles;
    this.dispatchEvent(new CustomEvent("profileschange", { detail: { userId: normalized.id, profile: normalized, remote: true } }));
    return normalized;
  }


  updateProfile(userId, patch) {
    if (!this.hasProfile(userId)) {
      return false;
    }
    const nextProfile = normalizeProfileOverride({
      ...(this.profileRecord.profiles[userId] || {}),
      ...patch
    });
    this.profileRecord = {
      version: STORAGE_VERSION,
      profiles: {
        ...this.profileRecord.profiles,
        [userId]: nextProfile
      },
      customProfiles: [...(this.profileRecord.customProfiles || [])]
    };
    writeRecord(STORAGE_KEYS.profiles, this.profileRecord);
    this.dispatchEvent(new CustomEvent("profileschange", { detail: { userId } }));
    return true;
  }

  getSettings(userId) {
    if (!this.hasProfile(userId)) {
      return clone(DEFAULT_USER_SETTINGS);
    }
    return normalizeUserSettings(this.settingsRecord.users[userId]);
  }

  updateSettings(userId, patch) {
    if (!this.hasProfile(userId)) {
      return false;
    }
    const current = this.getSettings(userId);
    const next = normalizeUserSettings({
      ...current,
      ...patch,
      desktop: {
        ...current.desktop,
        ...(patch && patch.desktop ? patch.desktop : {})
      }
    });
    this.settingsRecord = {
      version: STORAGE_VERSION,
      users: {
        ...this.settingsRecord.users,
        [userId]: next
      }
    };
    writeRecord(STORAGE_KEYS.settings, this.settingsRecord);
    this.dispatchEvent(new CustomEvent("settingschange", { detail: { userId, settings: next } }));
    return true;
  }

  getNotepadText(userId) {
    const settings = this.getSettings(userId);
    return typeof settings.notepadText === "string" ? settings.notepadText : "";
  }

  saveNotepadText(userId, text) {
    this.updateSettings(userId, { notepadText: String(text).slice(0, 100000) });
  }
}
