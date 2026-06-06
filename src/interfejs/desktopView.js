// Widok pulpitu.
// Renderuje ikony, tapete i kliknięcia na desktopie, czyli to co user widzi po zalogowaniu.
import { ASSETS } from "../konfiguracja/assets.js";
import { createElement, createImage } from "../rdzen/dom.js";
import { ContextMenu } from "./contextMenu.js";

// DesktopView trzyma ikony i context menu. Okna sa obok, w window-layer.
export class DesktopView {
  constructor({ rejestrAplikacji, uslugi }) {
    this.rejestrAplikacji = rejestrAplikacji;
    this.uslugi = uslugi;
    this.contextMenu = new ContextMenu();
    this.selectedAppId = null;
    this.element = createElement("section", { className: "desktop", attrs: { "aria-label": "Desktop", tabindex: "0" } });
    this.iconLayer = createElement("div", { className: "desktop-icons" });
    this.windowLayer = createElement("div", { className: "window-layer" });
    this.element.append(this.iconLayer, this.windowLayer);
    this.bindEvents();
    this.renderIcons();
  }

  bindEvents() {
    this.element.addEventListener("click", (event) => {
      if (event.target === this.element || event.target === this.iconLayer) {
        this.clearSelection();
      }
    });
    this.element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const icon = event.target.closest(".desktop-icon");
      if (icon) {
        this.selectedAppId = icon.dataset.appId;
        this.renderIcons();
        this.openIconContextMenu(event.clientX, event.clientY, this.selectedAppId);
      } else {
        this.openDesktopContextMenu(event.clientX, event.clientY);
      }
    });
    this.element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && this.selectedAppId) {
        this.uslugi.openApp(this.selectedAppId);
      }
    });
  }

  // Ikony renderuje z rejestru aplikacji, żeby menu i pulpit nie mialy dwoch osobnych prawd.
  renderIcons() {
    this.iconLayer.replaceChildren();
    for (const app of this.rejestrAplikacji.getDesktopApps()) {
      const button = createElement("button", {
        type: "button",
        className: app.id === this.selectedAppId ? "desktop-icon is-selected" : "desktop-icon",
        dataset: { appId: app.id },
        attrs: { "aria-label": app.title }
      }, [
        createImage(app.icon, "", "desktop-icon-obraz"),
        createElement("span", { className: "desktop-icon-etykieta", text: app.title })
      ]);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.selectedAppId = app.id;
        this.uslugi.menedzerDzwieku.play("select", { volume: 0.2 });
        this.renderIcons();
      });
      button.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        this.uslugi.openApp(app.id);
      });
      this.iconLayer.append(button);
    }
  }

  clearSelection() {
    this.selectedAppId = null;
    this.renderIcons();
  }

  refresh() {
    this.renderIcons();
  }

  openIconContextMenu(x, y, appId) {
    this.contextMenu.open({
      x,
      y,
      items: [
        { label: "Open", action: () => this.uslugi.openApp(appId) },
        { separator: true },
        { label: "Rename", disabled: true },
        { label: "Properties", action: () => this.uslugi.openApp("help") }
      ]
    });
  }

  openDesktopContextMenu(x, y) {
    this.contextMenu.open({
      x,
      y,
      items: [
        { label: "Arrange Icons By", disabled: true },
        { label: "Refresh", action: () => this.refresh() },
        { separator: true },
        { label: "New", disabled: true },
        { separator: true },
        { label: "Properties", action: () => this.uslugi.openApp("control-panel") }
      ]
    });
  }

  setIconSize(size) {
    this.element.dataset.iconSize = size === "large" ? "large" : "normal";
  }
}
