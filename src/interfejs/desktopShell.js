// Główna powloka pulpitu.
// Laczy widok pulpitu, menedzer okien i pasek zadan w jedna calosc.
import { applyUserSettings } from "../funkcje/themeService.js";
import { MenedzerOkien } from "../rdzen/windowManager.js";
import { DesktopView } from "./desktopView.js";
import { PasekZadan } from "./taskbar.js";
import { createElement } from "../rdzen/dom.js";

// Powloka trzyma razem desktop, taskbar i window manager. Bez tego wszystko byloby luzem.
export class PulpitSystemu {
  constructor({ rejestrAplikacji, uslugi, callbacks }) {
    this.rejestrAplikacji = rejestrAplikacji;
    this.uslugi = uslugi;
    this.callbacks = callbacks;
    this.element = createElement("section", { className: "desktop-shell", attrs: { "aria-label": "Desktop session" } });
    this.desktopView = new DesktopView({ rejestrAplikacji, uslugi });
    this.menedzerOkien = new MenedzerOkien({
      layer: this.desktopView.windowLayer,
      rejestrAplikacji,
      menedzerDzwieku: uslugi.menedzerDzwieku
    });
    this.uslugi.menedzerOkien = this.menedzerOkien;
    this.uslugi.openApp = (appId, options) => this.menedzerOkien.open(appId, options);
    this.taskbar = new PasekZadan({
      menedzerOkien: this.menedzerOkien,
      rejestrAplikacji,
      uslugi,
      callbacks
    });
    this.element.append(this.desktopView.element, this.taskbar.element);
    this.applySettings();
  }

  applySettings() {
    const settings = this.uslugi.magazynProfili.getSettings(this.uslugi.getCurrentUserId());
    applyUserSettings(settings, this.desktopView.element);
    this.desktopView.setIconSize(settings.desktop.iconSize);
    this.uslugi.menedzerDzwieku.setEnabled(settings.soundsEnabled);
  }

  refresh() {
    this.desktopView.refresh();
    this.taskbar.refreshProfile();
    this.applySettings();
  }

  dispose() {
    this.taskbar.dispose();
  }
}
