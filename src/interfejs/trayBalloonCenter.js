// Centrum dymkow traya.
// Powiadomienia maja byc pomocne, ale nie moga zaslaniac calego pulpitu jak spam.
import { ASSETS } from "../konfiguracja/assets.js";
import { createElement, createImage } from "../rdzen/dom.js";

const POLL_INTERVAL_MS = 7000;
const AUTO_DISMISS_MS = 6500;
const FADE_MS = 520;
const MAX_LOGS_PER_POLL = 8;

const NOTIFICATION_EVENTS = new Set([
  "LOGIN_FAILED",
  "REGISTER_FAILED",
  "CSRF_INVALID",
  "RATE_LIMIT_HIT",
  "ADMIN_ACCESS_DENIED",
  "AUTH_CODE_REUSED_BLOCKED",
  "AUTH_CODE_EXPIRED",
  "AUTH_CODE_INVALID"
]);

const EVENT_TITLES = {
  LOGIN_FAILED: "Logon attempt failed",
  REGISTER_FAILED: "Account creation failed",
  CSRF_INVALID: "Security request blocked",
  RATE_LIMIT_HIT: "Too many requests blocked",
  ADMIN_ACCESS_DENIED: "Administrator access denied",
  AUTH_CODE_REUSED_BLOCKED: "Authorization code reuse blocked",
  AUTH_CODE_EXPIRED: "Authorization code expired",
  AUTH_CODE_INVALID: "Invalid authorization code"
};

// Dymki traya maja kolejke, żeby kilka komunikatow nie weszlo sobie na glowe.
export class CentrumPowiadomienZasobnika {
  constructor({ serwisAutoryzacji, menedzerDzwieku, anchor = null, icon = ASSETS.systemUi.xpTrayRisk } = {}) {
    this.serwisAutoryzacji = serwisAutoryzacji;
    this.menedzerDzwieku = menedzerDzwieku;
    this.anchor = anchor;
    this.icon = icon;
    this.lastSeenId = 0;
    this.pollTimer = null;
    this.dismissTimer = null;
    this.currentBalloon = null;
    this.isPolling = false;
    this.isInitialized = false;
  }

  start() {
    this.stop();
    window.setTimeout(() => this.poll({ initialize: true }), 900);
    this.pollTimer = window.setInterval(() => this.poll(), POLL_INTERVAL_MS);
  }

  stop() {
    if (this.pollTimer) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.close({ immediate: true });
  }

  async poll({ initialize = false } = {}) {
    if (!this.serwisAutoryzacji || this.isPolling) {
      return;
    }

    this.isPolling = true;
    try {
      const data = await this.serwisAutoryzacji.adminAuditLogs({ limit: MAX_LOGS_PER_POLL });
      const logs = Array.isArray(data.logs) ? data.logs : [];
      this.handleLogs(logs, { initialize });
    } catch (error) {
      // Zwykły user nie czyta logów audytu, więc centrum powiadomień ma wtedy siedzieć cicho.
      if (error?.status === 401 || error?.status === 403) {
        this.stop();
      }
    } finally {
      this.isPolling = false;
    }
  }

  handleLogs(logs, { initialize = false } = {}) {
    if (!logs.length) {
      this.isInitialized = true;
      return;
    }

    const newestId = logs.reduce((max, log) => Math.max(max, Number(log.id) || 0), this.lastSeenId);

    if (initialize || !this.isInitialized) {
      this.lastSeenId = newestId;
      this.isInitialized = true;
      return;
    }

    const newLogs = logs
      .filter((log) => (Number(log.id) || 0) > this.lastSeenId)
      .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

    for (const log of newLogs) {
      if (shouldNotify(log)) {
        this.showAuditNotification(log);
      }
    }

    this.lastSeenId = newestId;
  }

  showAuditNotification(log) {
    const title = EVENT_TITLES[log.eventType] || "Security Audit";
    const message = buildAuditMessage(log);

    this.show({
      title,
      message,
      meta: formatAuditTime(log.createdAt),
      icon: this.icon
    });
  }

  show({ title, message, meta = "", icon = this.icon }) {
    this.close({ immediate: true });

    const closeButton = createElement("button", {
      type: "button",
      className: "tray-balloon-zamknij",
      attrs: { "aria-label": "Close notification" },
      text: "×"
    });
    closeButton.addEventListener("click", () => this.close());

    const balloon = createElement("section", {
      className: "xp-tray-balloon",
      attrs: { role: "status", "aria-live": "polite" }
    }, [
      createElement("div", { className: "tray-balloon-naglowek" }, [
        icon ? createImage(icon, "", "tray-balloon-ikona") : null,
        createElement("strong", { className: "tray-balloon-tytul", text: title }),
        closeButton
      ]),
      createElement("div", { className: "tray-balloon-tresc" }, [
        createElement("p", { text: message }),
        meta ? createElement("p", { className: "tray-balloon-meta", text: meta }) : null
      ]),
      createElement("span", { className: "tray-balloon-ogonek", attrs: { "aria-hidden": "true" } })
    ]);

    document.body.append(balloon);
    this.currentBalloon = balloon;
    this.position(balloon);

    window.requestAnimationFrame(() => balloon.classList.add("is-visible"));
    this.menedzerDzwieku?.play("notification", { volume: 0.42, group: "zasobnik-balloon", exclusive: true, exclusiveFadeMs: 90 });

    this.dismissTimer = window.setTimeout(() => this.close(), AUTO_DISMISS_MS);
  }

  position(balloon) {
    const taskbarHeight = getTaskbarHeight();
    const rect = balloon.getBoundingClientRect();
    const right = 18;
    const bottom = taskbarHeight + 10;

    balloon.style.right = `${right}px`;
    balloon.style.bottom = `${bottom}px`;

    if (this.anchor) {
      const anchorRect = this.anchor.getBoundingClientRect();
      const center = anchorRect.left + anchorRect.width / 2;
      const tailRight = Math.max(20, Math.min(rect.width - 36, window.innerWidth - center - right));
      balloon.style.setProperty("--balloon-tail-right", `${Math.round(tailRight)}px`);
    }
  }

  close({ immediate = false } = {}) {
    if (this.dismissTimer) {
      window.clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    if (!this.currentBalloon) {
      return;
    }

    const balloon = this.currentBalloon;
    this.currentBalloon = null;

    if (immediate) {
      balloon.remove();
      return;
    }

    balloon.classList.add("is-hiding");
    window.setTimeout(() => balloon.remove(), FADE_MS);
  }
}

function shouldNotify(log) {
  if (!log || !NOTIFICATION_EVENTS.has(log.eventType)) {
    return false;
  }
  return log.severity === "warning" || log.severity === "critical" || log.eventType.endsWith("FAILED") || log.eventType.endsWith("BLOCKED");
}

function buildAuditMessage(log) {
  const login = log.loginAttempt ? `Account: ${log.loginAttempt}. ` : "";
  const detailReason = log.details?.reason ? `Reason: ${log.details.reason}.` : "Security event was recorded in the audit log.";
  return `${login}${detailReason}`;
}

function formatAuditTime(value) {
  if (!value) {
    return "Recorded just now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recorded just now";
  }
  return `Recorded at ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function getTaskbarHeight() {
  const token = getComputedStyle(document.documentElement).getPropertyValue("--taskbar-height").trim();
  const numericToken = Number.parseFloat(token);
  if (Number.isFinite(numericToken)) {
    return numericToken;
  }
  const taskbar = document.querySelector(".taskbar");
  return taskbar?.getBoundingClientRect().height || 40;
}
