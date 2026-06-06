// Rejestr aplikacji pulpitu.
// Kazda aplikacja dostaje swoje ID, ikone i funkcje renderujaca zawartosc okna.
import { ASSETS } from "../konfiguracja/assets.js";
import { renderujPrzegladarke } from "./browserApp.js";
import { renderujEksplorator } from "./explorerApp.js";
import { renderujPomoc } from "./helpApp.js";
import { renderujNotatnik } from "./notepadApp.js";
import { renderujPaint } from "./paintApp.js";
import { renderujAplikacjeZastepcza } from "./placeholderApp.js";
import { renderujUruchom } from "./runApp.js";
import { renderujPodgladZdarzenBezpieczenstwa } from "./securityEventViewerApp.js";
import { renderujUstawienia } from "./settingsApp.js";

export class RejestrAplikacji {
  constructor(apps) {
    this.apps = new Map();
    for (const app of apps) {
      if (isValidAppDefinition(app)) {
        this.apps.set(app.id, Object.freeze(app));
      }
    }
  }

  get(appId) {
    return this.apps.get(appId) || null;
  }

  getAll() {
    return [...this.apps.values()];
  }

  getDesktopApps() {
    return this.getAll().filter((app) => app.desktop);
  }

  getStartMenuApps() {
    return this.getAll().filter((app) => app.menuStart);
  }
}

// Tutaj składam liste aplikacji. Dodanie nowej apki zwykle zaczyna sie od tej mapy.
export function utworzRejestrAplikacji(uslugi) {
  const appDefinitions = [
    {
      id: "my-computer",
      title: "My Computer",
      icon: ASSETS.icons.myComputer,
      desktop: true,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 700, height: 460 },
      minSize: { width: 420, height: 300 },
      render: (context) => renderujEksplorator({ ...context, uslugi, mode: "computer" })
    },
    {
      id: "my-documents",
      title: "My Documents",
      icon: ASSETS.icons.myDocuments,
      desktop: true,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 660, height: 430 },
      minSize: { width: 390, height: 280 },
      render: (context) => renderujEksplorator({ ...context, uslugi, mode: "documents" })
    },
    {
      id: "recycle-bin",
      title: "Recycle Bin",
      icon: ASSETS.icons.recycleBinEmpty,
      desktop: true,
      menuStart: false,
      singleton: true,
      defaultSize: { width: 620, height: 380 },
      minSize: { width: 360, height: 260 },
      render: (context) => renderujEksplorator({ ...context, uslugi, mode: "recycle" })
    },
    {
      id: "internet-explorer",
      title: "Internet Explorer",
      icon: ASSETS.icons.internetExplorer,
      desktop: true,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 760, height: 500 },
      minSize: { width: 430, height: 300 },
      render: (context) => renderujPrzegladarke({ ...context, uslugi })
    },
    {
      id: "notepad",
      title: "Untitled - Notepad",
      icon: ASSETS.icons.notepad,
      desktop: true,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 620, height: 420 },
      minSize: { width: 360, height: 260 },
      render: (context) => renderujNotatnik({ ...context, uslugi })
    },
    {
      id: "paint",
      title: "untitled - Paint",
      icon: ASSETS.icons.paint,
      desktop: true,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 720, height: 500 },
      minSize: { width: 460, height: 320 },
      render: (context) => renderujPaint({ ...context, uslugi })
    },
    {
      id: "control-panel",
      title: "Control Panel",
      icon: ASSETS.icons.controlPanel,
      desktop: true,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 700, height: 500 },
      minSize: { width: 460, height: 340 },
      render: (context) => renderujUstawienia({ ...context, uslugi })
    },
    {
      id: "run",
      title: "Run",
      icon: ASSETS.icons.run,
      desktop: false,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 420, height: 210 },
      minSize: { width: 360, height: 190 },
      render: (context) => renderujUruchom({ ...context, uslugi })
    },
    {
      id: "help",
      title: "Help and Support",
      icon: ASSETS.icons.help,
      desktop: false,
      menuStart: true,
      singleton: true,
      defaultSize: { width: 640, height: 430 },
      minSize: { width: 390, height: 280 },
      render: (context) => renderujPomoc({ ...context, uslugi })
    },
    {
      id: "security-event-viewer",
      title: "Security Event Viewer",
      icon: ASSETS.menuStart.security,
      desktop: false,
      menuStart: false,
      singleton: true,
      defaultSize: { width: 760, height: 460 },
      minSize: { width: 520, height: 320 },
      render: (context) => renderujPodgladZdarzenBezpieczenstwa({ ...context, uslugi })
    },
    {
      id: "placeholder",
      title: "Windows XP",
      icon: ASSETS.icons.help,
      desktop: false,
      menuStart: false,
      singleton: false,
      defaultSize: { width: 430, height: 210 },
      minSize: { width: 340, height: 180 },
      render: (context) => renderujAplikacjeZastepcza({ ...context, uslugi })
    }
  ];

  return new RejestrAplikacji(appDefinitions);
}

function isValidAppDefinition(app) {
  return Boolean(
    app &&
    typeof app.id === "string" &&
    /^[a-z0-9-]+$/.test(app.id) &&
    typeof app.title === "string" &&
    typeof app.icon === "string" &&
    typeof app.render === "function"
  );
}
