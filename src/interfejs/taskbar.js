// Pasek zadan.
// Trzyma Start, quick launch, przyciski okien, tray i zegar. Tu łatwo zrobic chaos, wiec ostroznie.
import { ASSETS } from "../konfiguracja/assets.js";
import { createElement, createImage, setPressed } from "../rdzen/dom.js";
import { MenuStart } from "./startMenu.js";
import { OknoZasobnika } from "./trayPopup.js";
import { CentrumPowiadomienZasobnika } from "./trayBalloonCenter.js";

// Taskbar slucha zmian menedzera okien i na tej podstawie rysuje przyciski aplikacji.
export class PasekZadan {
  constructor({ menedzerOkien, rejestrAplikacji, uslugi, callbacks }) {
    this.menedzerOkien = menedzerOkien;
    this.rejestrAplikacji = rejestrAplikacji;
    this.uslugi = uslugi;
    this.callbacks = callbacks;
    this.element = createElement("footer", { className: "taskbar" });
    this.menuStart = new MenuStart({
      rejestrAplikacji,
      uslugi,
      callbacks: {
        ...callbacks,
        onStartMenuOpenChange: (isOpen) => this.updateStartButtonPressed(isOpen)
      }
    });
    this.oknoZasobnika = new OknoZasobnika();
    this.centrumPowiadomienZasobnika = new CentrumPowiadomienZasobnika({
      serwisAutoryzacji: this.uslugi.serwisAutoryzacji,
      menedzerDzwieku: this.uslugi.menedzerDzwieku,
      icon: ASSETS.systemUi.xpTrayRisk
    });

    this.przyciskStart = createElement("button", {
      type: "button",
      className: "taskbar-start",
      attrs: { "aria-label": "Start", "aria-pressed": "false" }
    }, [
      createImage(ASSETS.systemUi.przyciskStart, "Start", "taskbar-start-obraz")
    ]);

    this.szybkieUruchamianie = createElement("div", { className: "taskbar-quicklaunch", attrs: { "aria-label": "Quick Launch" } }, [
      this.createQuickLaunchButton("Internet Explorer", ASSETS.icons.internetExplorer, "internet-explorer"),
      this.createQuickLaunchButton("E-mail", ASSETS.menuStart.email || ASSETS.icons.help, "outlook-express")
    ]);
    this.przyciski = createElement("div", { className: "taskbar-przyciski" });
    this.zegarZasobnika = createElement("time", { className: "taskbar-clock" });

    this.przyciskGlosnosci = this.createTrayButton("Volume", ASSETS.systemUi.xpTrayVolume, () => this.openVolumePanel());
    this.przyciskUrzadzenia = this.createTrayButton("Safely Remove Hardware", ASSETS.systemUi.xpTrayDevice, () => this.openDevicePanel());
    this.przyciskAudytu = this.createTrayButton("Security Audit", ASSETS.systemUi.xpTrayRisk, () => this.openAuditPanel());
    this.przyciskPomocy = this.createTrayButton("Help and Support", ASSETS.systemUi.xpTrayHelp, () => this.openHelpPanel());
    this.przyciskZegara = createElement("button", { type: "button", className: "taskbar-tray-zegar-przycisk", attrs: { "aria-label": "Date and time" } }, [
      this.zegarZasobnika
    ]);
    this.przyciskZegara.addEventListener("click", () => this.openClockPanel());

    this.zasobnik = createElement("div", { className: "taskbar-tray" }, [
      this.przyciskGlosnosci,
      this.przyciskUrzadzenia,
      this.przyciskAudytu,
      this.przyciskPomocy,
      this.przyciskZegara
    ]);
    this.centrumPowiadomienZasobnika.anchor = this.przyciskAudytu;

    this.element.append(this.menuStart.element, this.przyciskStart, this.szybkieUruchamianie, this.przyciski, this.zasobnik);
    this.przyciskStart.addEventListener("click", () => {
      this.uslugi.menedzerDzwieku.play("menuCommand", { volume: 0.35 });
      this.menuStart.toggle();
      this.updateStartButtonPressed(this.menuStart.isOpen);
    });

    this.menedzerOkien.addEventListener("change", (event) => this.renderButtons(event.detail));
    this.clockTimer = window.setInterval(() => this.updateClock(), 1000);
    this.updateClock();
    this.renderButtons(this.menedzerOkien.snapshot());
    this.centrumPowiadomienZasobnika.start();
  }

  createQuickLaunchButton(label, icon, appId) {
    const button = createElement("button", {
      type: "button",
      className: "taskbar-quicklaunch-przycisk",
      attrs: { "aria-label": label, title: label }
    }, [
      createImage(icon, "", "taskbar-quicklaunch-ikona")
    ]);
    button.addEventListener("click", () => {
      this.uslugi.menedzerDzwieku.play("menuCommand", { volume: 0.28 });
      if (this.rejestrAplikacji.get(appId)) {
        this.uslugi.openApp(appId);
        return;
      }
      this.uslugi.openApp("placeholder", {
        title: label,
        message: `${label} is not implemented yet.`,
        icon
      });
    });
    return button;
  }

  updateStartButtonPressed(isOpen) {
    if (!this.przyciskStart) {
      return;
    }
    setPressed(this.przyciskStart, isOpen);
  }

  createTrayButton(label, icon, action) {
    const button = createElement("button", { type: "button", className: "taskbar-tray-przycisk", attrs: { "aria-label": label, title: label } }, [
      createImage(icon, label, "taskbar-tray-ikona")
    ]);
    button.addEventListener("click", action);
    return button;
  }

  openVolumePanel() {
    this.uslugi.menedzerDzwieku.play("menuCommand", { volume: 0.25 });
    this.oknoZasobnika.open({
      anchor: this.przyciskGlosnosci,
      title: "Volume Control",
      icon: ASSETS.systemUi.xpTrayVolume,
      content: [
        createElement("p", { text: "Volume Control is available in Windows XP." }),
        createElement("div", { className: "tray-popup-suwak", attrs: { "aria-hidden": "true" } }, [
          createElement("span")
        ])
      ]
    });
  }

  openDevicePanel() {
    this.uslugi.menedzerDzwieku.play("menuCommand", { volume: 0.25 });
    this.oknoZasobnika.open({
      anchor: this.przyciskUrzadzenia,
      title: "Safely Remove Hardware",
      icon: ASSETS.systemUi.xpTrayDevice,
      content: [
        createElement("p", { text: "USB Mass Storage Device can be safely removed." }),
        createElement("p", { className: "tray-popup-info", text: "Hardware notification area." })
      ]
    });
  }

  async openAuditPanel() {
    this.uslugi.menedzerDzwieku.play("notification", { volume: 0.35 });

    const loading = createElement("p", { text: "Reading latest security events..." });
    this.oknoZasobnika.open({
      anchor: this.przyciskAudytu,
      title: "Security Audit",
      icon: ASSETS.systemUi.xpTrayRisk,
      content: [loading]
    });

    try {
      const data = await this.uslugi.serwisAutoryzacji.adminAuditLogs({ limit: 3 });
      const logs = Array.isArray(data.logs) ? data.logs : [];
      const items = logs.length
        ? logs.map((log) => createElement("p", {
            className: "tray-popup-linia-audytu",
            text: `${log.eventType} · ${log.severity} · ${formatAuditTime(log.createdAt)}`
          }))
        : [createElement("p", { text: "No audit events recorded yet." })];

      this.oknoZasobnika.open({
        anchor: this.przyciskAudytu,
        title: "Security Audit",
        icon: ASSETS.systemUi.xpTrayRisk,
        content: [
          ...items,
          createElement("p", { className: "tray-popup-info", text: "Project-only XP security extension." })
        ]
      });
    } catch (error) {
      this.oknoZasobnika.open({
        anchor: this.przyciskAudytu,
        title: "Security Audit",
        icon: ASSETS.systemUi.xpTrayRisk,
        content: [
          createElement("p", { text: error?.status === 403 ? "Access denied. Administrator privileges are required." : "Security audit events are not available." }),
          createElement("p", { className: "tray-popup-info", text: "This tray item is connected to the backend audit log system." })
        ]
      });
    }
  }

  openHelpPanel() {
    this.uslugi.menedzerDzwieku.play("menuCommand", { volume: 0.25 });
    this.oknoZasobnika.open({
      anchor: this.przyciskPomocy,
      title: "Help and Support",
      icon: ASSETS.systemUi.xpTrayHelp,
      content: [
        createElement("p", { text: "Help and Support Center is not implemented yet." }),
        createElement("p", { className: "tray-popup-info", text: "Placeholder prepared for future desktop expansion." })
      ]
    });
  }

  openClockPanel() {
    this.uslugi.menedzerDzwieku.play("menuCommand", { volume: 0.25 });
    const now = new Date();
    this.oknoZasobnika.open({
      anchor: this.przyciskZegara,
      title: "Date and Time",
      icon: ASSETS.icons.settings,
      content: [
        createElement("p", { text: now.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" }) }),
        createElement("p", { className: "tray-popup-info", text: "Date and Time Properties is not implemented yet." })
      ]
    });
  }

  // Tu byl kiedys latwy bug: przyciski musza zostac w jednym rzedzie, nie pionowo.
  renderButtons(snapshot) {
    this.przyciski.replaceChildren();
    for (const item of snapshot.windows) {
      const button = createElement("button", {
        type: "button",
        className: [
          "taskbar-button",
          item.active ? "is-active" : "",
          item.minimized ? "is-minimized" : ""
        ],
        attrs: { "aria-label": item.title }
      }, [
        createImage(item.icon, "", "taskbar-button-ikona"),
        createElement("span", { text: item.title })
      ]);
      button.addEventListener("click", () => this.menedzerOkien.activateFromTaskbar(item.id));
      this.przyciski.append(button);
    }
  }

  updateClock() {
    const now = new Date();
    this.zegarZasobnika.dateTime = now.toISOString();
    this.zegarZasobnika.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  refreshProfile() {
    this.menuStart.render();
  }

  dispose() {
    window.clearInterval(this.clockTimer);
    this.oknoZasobnika.close();
    this.centrumPowiadomienZasobnika.stop();
  }
}

function formatAuditTime(value) {
  if (!value) {
    return "recently";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "recently";
  }
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
