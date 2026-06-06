// Synchronizacja sesji miedzy kartami.
// Jak user wyloguje sie w jednej karcie, druga tez powinna to ogarnąć.
const DEFAULT_CHANNEL_NAME = "portfolio-xp-session";
const STORAGE_EVENT_KEY = "portfolio-xp-session-event";

// BroadcastChannel + storage event, bo nie kazda przeglądarka zachowuje sie identycznie.
export class SynchronizacjaSesji extends EventTarget {
  constructor({ channelName = DEFAULT_CHANNEL_NAME } = {}) {
    super();
    this.channelName = channelName;
    this.channel = null;
    this.tabId = createTabId();
    this.handleBroadcastMessage = this.handleBroadcastMessage.bind(this);
    this.handleStorageEvent = this.handleStorageEvent.bind(this);

    if ("BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(channelName);
      this.channel.addEventListener("message", this.handleBroadcastMessage);
    }

    window.addEventListener("storage", this.handleStorageEvent);
  }

  broadcastLogout({ reason = "logout" } = {}) {
    this.broadcast({ type: "logout", reason });
  }

  broadcastSessionChange({ userId = null, reason = "session-change" } = {}) {
    this.broadcast({ type: "session-change", userId, reason });
  }

  broadcastSessionCheck({ reason = "session-check" } = {}) {
    this.broadcast({ type: "session-check", reason });
  }

  dispose() {
    if (this.channel) {
      this.channel.removeEventListener("message", this.handleBroadcastMessage);
      this.channel.close();
      this.channel = null;
    }
    window.removeEventListener("storage", this.handleStorageEvent);
  }

  broadcast(payload) {
    const message = {
      ...payload,
      source: this.tabId,
      at: Date.now()
    };

    if (this.channel) {
      this.channel.postMessage(message);
    }

    // localStorage fallback also covers browsers where BroadcastChannel is unavailable.
    // Storage event nie odpala się w tej samej karcie, więc nie zapętli własnej wiadomości.
    try {
      localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify(message));
      localStorage.removeItem(STORAGE_EVENT_KEY);
    } catch {
      // Private browsing/storage-denied mode: BroadcastChannel may still work.
    }
  }

  handleBroadcastMessage(event) {
    this.handleMessage(event.data);
  }

  handleStorageEvent(event) {
    if (event.key !== STORAGE_EVENT_KEY || !event.newValue) {
      return;
    }
    try {
      this.handleMessage(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed cross-tab messages.
    }
  }

  handleMessage(message) {
    if (!message || message.source === this.tabId || typeof message.type !== "string") {
      return;
    }
    this.dispatchEvent(new CustomEvent(message.type, { detail: message }));
  }
}

function createTabId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
