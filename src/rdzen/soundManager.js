// Menedzer dźwiękow.
// Audio w przeglądarce bywa kaprysne, wiec odblokowanie i fade out sa tutaj, nie w UI.
function createAudioProbe() {
  try {
    return new Audio();
  } catch {
    return null;
  }
}

function canPlayOgg() {
  const audio = createAudioProbe();
  if (!audio || typeof audio.canPlayType !== "function") {
    return false;
  }
  return audio.canPlayType("audio/ogg; codecs=vorbis") !== "" || audio.canPlayType("audio/ogg") !== "";
}

// Przeglądarki blokuja autoplay, dlatego najpierw trzeba audio odblokowac po akcji usera.
export class MenedzerDzwieku {
  constructor(soundRegistry) {
    this.registry = soundRegistry;
    this.enabled = true;
    this.unlocked = false;
    this.audioCache = new Map();
    this.activeAudio = new Set();
    this.activeGroups = new Map();
    this.fadeTimers = new Map();
    this.preferOgg = canPlayOgg();
    this.unlock = this.unlock.bind(this);
    this.addUnlockListeners();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.stopAll();
    }
  }

  addUnlockListeners() {
    window.addEventListener("pointerdown", this.unlock, { capture: true, passive: true });
    window.addEventListener("keydown", this.unlock, { capture: true, passive: true });
  }

  unlock() {
    if (this.unlocked) {
      return;
    }
    this.unlocked = true;
    window.removeEventListener("pointerdown", this.unlock, { capture: true });
    window.removeEventListener("keydown", this.unlock, { capture: true });
  }

  // Play ma try/catch, bo dźwięk w browserze potrafi odmowic bez pytania.
  play(soundId, options = {}) {
    if (!this.enabled) {
      return Promise.resolve(false);
    }

    const source = this.resolveSoundSource(soundId);
    if (!source) {
      return Promise.resolve(false);
    }

    const group = options.group || soundId;
    if (options.exclusive) {
      this.stopGroup(group, { fadeMs: options.exclusiveFadeMs || 0 });
    }

    const audio = this.createAudio(source);
    audio.currentTime = 0;
    audio.volume = typeof options.volume === "number" ? Math.max(0, Math.min(1, options.volume)) : 0.8;

    this.trackAudio(audio, group);

    return audio.play().then(() => true).catch(() => {
      this.untrackAudio(audio, group);
      return false;
    });
  }

  stopGroup(group, options = {}) {
    const groupItems = this.activeGroups.get(group);
    if (!groupItems) {
      return;
    }

    for (const audio of [...groupItems]) {
      this.stopAudio(audio, group, options);
    }
  }

  stopAll() {
    for (const audio of [...this.activeAudio]) {
      this.stopAudio(audio);
    }
    this.activeGroups.clear();
  }

  stopAudio(audio, group = null, options = {}) {
    const fadeMs = Math.max(0, Number(options.fadeMs) || 0);

    if (fadeMs > 0 && !audio.paused && audio.volume > 0) {
      this.fadeOutAudio(audio, group, fadeMs);
      return;
    }

    this.stopAudioNow(audio, group);
  }

  fadeOutAudio(audio, group, fadeMs) {
    this.clearFadeTimer(audio);

    const startVolume = audio.volume;
    const steps = 12;
    const stepMs = Math.max(16, fadeMs / steps);
    let currentStep = 0;

    const timerId = window.setInterval(() => {
      currentStep += 1;
      const progress = Math.min(1, currentStep / steps);
      audio.volume = Math.max(0, startVolume * (1 - progress));

      if (progress >= 1) {
        this.clearFadeTimer(audio);
        this.stopAudioNow(audio, group);
      }
    }, stepMs);

    this.fadeTimers.set(audio, timerId);
  }

  stopAudioNow(audio, group = null) {
    this.clearFadeTimer(audio);
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch {
      // Some browsers can throw when audio is not ready yet.
    }
    this.untrackAudio(audio, group);
  }

  clearFadeTimer(audio) {
    const timerId = this.fadeTimers.get(audio);
    if (!timerId) {
      return;
    }
    window.clearInterval(timerId);
    this.fadeTimers.delete(audio);
  }

  trackAudio(audio, group) {
    this.activeAudio.add(audio);
    if (!this.activeGroups.has(group)) {
      this.activeGroups.set(group, new Set());
    }
    this.activeGroups.get(group).add(audio);

    const cleanup = () => this.untrackAudio(audio, group);
    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("error", cleanup, { once: true });
  }

  untrackAudio(audio, group = null) {
    this.clearFadeTimer(audio);
    this.activeAudio.delete(audio);

    if (group) {
      const groupItems = this.activeGroups.get(group);
      if (groupItems) {
        groupItems.delete(audio);
        if (groupItems.size === 0) {
          this.activeGroups.delete(group);
        }
      }
      return;
    }

    for (const [groupName, groupItems] of this.activeGroups.entries()) {
      groupItems.delete(audio);
      if (groupItems.size === 0) {
        this.activeGroups.delete(groupName);
      }
    }
  }

  resolveSoundSource(soundId) {
    const entry = this.registry[soundId];

    if (typeof entry === "string") {
      return entry;
    }

    if (!entry || typeof entry !== "object") {
      return null;
    }

    if (this.preferOgg && typeof entry.ogg === "string" && entry.ogg.length > 0) {
      return entry.ogg;
    }

    if (typeof entry.wav === "string" && entry.wav.length > 0) {
      return entry.wav;
    }

    return null;
  }

  createAudio(src) {
    return this.getAudioTemplate(src).cloneNode(true);
  }

  getAudioTemplate(src) {
    if (!this.audioCache.has(src)) {
      const audio = new Audio(src);
      audio.preload = "none";
      audio.addEventListener("error", () => {
        this.audioCache.delete(src);
      }, { once: true });
      this.audioCache.set(src, audio);
    }
    return this.audioCache.get(src);
  }
}
