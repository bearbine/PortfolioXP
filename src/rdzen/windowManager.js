// Menedzer okien.
// Odpowiada za otwieranie, fokus, minimalizacje, drag, resize i caly ten desktopowy balagan.
import { createElement, createImage, isInteractiveElement } from "./dom.js";
import { utworzKontrolkiOkna } from "../interfejs/kontrolkiOkna.js";

const RESIZE_DIRECTIONS = ["n", "e", "s", "w", "ne", "nw", "se", "sw"];

// Ten manager pilnuje calego żyćia okna: open, focus, minimize, resize i close.
export class MenedzerOkien extends EventTarget {
  constructor({ layer, rejestrAplikacji, menedzerDzwieku }) {
    super();
    this.layer = layer;
    this.rejestrAplikacji = rejestrAplikacji;
    this.menedzerDzwieku = menedzerDzwieku;
    this.windows = new Map();
    this.nextWindowNumber = 1;
    this.nextZIndex = 20;
    this.resizeObserver = new ResizeObserver(() => this.fitAllWindows());
    this.resizeObserver.observe(this.layer);
  }

  // Otwieranie okna musi uwzgledniac singletony, inaczej user odpali 20 takich samych okien.
  open(appId, options = {}) {
    const app = this.rejestrAplikacji.get(appId);
    if (!app) {
      this.menedzerDzwieku?.play("error");
      return null;
    }

    if (app.singleton) {
      const existing = [...this.windows.values()].find((windowState) => windowState.appId === appId);
      if (existing) {
        this.restore(existing.id);
        this.focus(existing.id);
        return existing.id;
      }
    }

    const id = `window-${this.nextWindowNumber++}`;
    const bounds = this.getInitialBounds(app, options);
    const windowState = {
      id,
      appId,
      title: options.title || app.title,
      icon: app.icon,
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      minWidth: app.minSize?.width || 280,
      minHeight: app.minSize?.height || 180,
      zIndex: this.nextZIndex++,
      minimized: false,
      maximized: false,
      restoreBounds: null,
      options,
      cleanup: []
    };

    windowState.element = this.createWindowElement(windowState, app);
    this.windows.set(id, windowState);
    this.layer.append(windowState.element);
    this.applyBounds(windowState);
    this.focus(id);
    this.menedzerDzwieku?.play("windowOpen", { volume: 0.35 });
    this.emitChange();
    return id;
  }

  close(id) {
    const windowState = this.windows.get(id);
    if (!windowState) {
      return;
    }
    for (const cleanup of windowState.cleanup) {
      cleanup();
    }
    windowState.element.remove();
    this.windows.delete(id);
    this.menedzerDzwieku?.play("windowClose", { volume: 0.3 });
    const topWindow = this.getTopVisibleWindow();
    if (topWindow) {
      this.focus(topWindow.id);
    } else {
      this.emitChange();
    }
  }

  minimize(id) {
    const windowState = this.windows.get(id);
    if (!windowState) {
      return;
    }
    windowState.minimized = true;
    windowState.element.classList.add("is-minimized");
    windowState.element.setAttribute("aria-hidden", "true");
    this.menedzerDzwieku?.play("minimize", { volume: 0.35 });
    const topWindow = this.getTopVisibleWindow(id);
    if (topWindow) {
      this.focus(topWindow.id);
    } else {
      this.emitChange();
    }
  }

  restore(id) {
    const windowState = this.windows.get(id);
    if (!windowState) {
      return;
    }
    windowState.minimized = false;
    windowState.element.classList.remove("is-minimized");
    windowState.element.removeAttribute("aria-hidden");
    if (windowState.maximized && windowState.restoreBounds) {
      this.setBounds(windowState, windowState.restoreBounds);
      windowState.maximized = false;
      windowState.restoreBounds = null;
      windowState.element.classList.remove("is-maximized");
    }
    this.focus(id);
    this.menedzerDzwieku?.play("restore", { volume: 0.3 });
  }

  toggleMaximize(id) {
    const windowState = this.windows.get(id);
    if (!windowState) {
      return;
    }
    if (windowState.maximized) {
      this.restore(id);
      return;
    }
    windowState.restoreBounds = {
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height
    };
    const layerRect = this.layer.getBoundingClientRect();
    this.setBounds(windowState, {
      x: 0,
      y: 0,
      width: Math.max(windowState.minWidth, layerRect.width),
      height: Math.max(windowState.minHeight, layerRect.height)
    });
    windowState.maximized = true;
    windowState.minimized = false;
    windowState.element.classList.add("is-maximized");
    windowState.element.classList.remove("is-minimized");
    this.focus(id);
  }

  focus(id) {
    const windowState = this.windows.get(id);
    if (!windowState) {
      return;
    }
    windowState.minimized = false;
    windowState.zIndex = this.nextZIndex++;
    windowState.element.style.zIndex = String(windowState.zIndex);
    windowState.element.classList.remove("is-minimized");
    windowState.element.removeAttribute("aria-hidden");

    for (const otherWindow of this.windows.values()) {
      otherWindow.element.classList.toggle("is-active", otherWindow.id === id);
    }
    this.activeWindowId = id;
    this.emitChange();
  }

  activateFromTaskbar(id) {
    const windowState = this.windows.get(id);
    if (!windowState) {
      return;
    }
    if (windowState.minimized) {
      this.restore(id);
      return;
    }
    if (this.activeWindowId === id) {
      this.minimize(id);
      return;
    }
    this.focus(id);
  }

  snapshot() {
    return {
      activeWindowId: this.activeWindowId || null,
      windows: [...this.windows.values()].map((windowState) => ({
        id: windowState.id,
        appId: windowState.appId,
        title: windowState.title,
        icon: windowState.icon,
        minimized: windowState.minimized,
        maximized: windowState.maximized,
        active: windowState.id === this.activeWindowId
      }))
    };
  }

  fitAllWindows() {
    for (const windowState of this.windows.values()) {
      if (windowState.maximized) {
        const layerRect = this.layer.getBoundingClientRect();
        this.setBounds(windowState, {
          x: 0,
          y: 0,
          width: Math.max(windowState.minWidth, layerRect.width),
          height: Math.max(windowState.minHeight, layerRect.height)
        });
      } else {
        this.setBounds(windowState, this.clampBounds(windowState, {
          x: windowState.x,
          y: windowState.y,
          width: windowState.width,
          height: windowState.height
        }));
      }
    }
    this.emitChange();
  }

  // Tutaj składam DOM okna. Lepiej miec to w jednym miejscu niz w kazdej aplikacji osobno.
  createWindowElement(windowState, app) {
    const element = createElement("section", {
      className: "xp-window",
      attrs: {
        role: "dialog",
        "aria-label": windowState.title,
        tabindex: "-1"
      },
      dataset: { windowId: windowState.id, appId: windowState.appId }
    });

    const titlebar = createElement("div", { className: "xp-window-belka" });
    const title = createElement("div", { className: "xp-window-tytul" }, [
      createImage(windowState.icon, "", "xp-window-ikona"),
      createElement("span", { text: windowState.title })
    ]);
    const controls = utworzKontrolkiOkna({
      onMinimize: () => this.minimize(windowState.id),
      onMaximize: () => this.toggleMaximize(windowState.id),
      onClose: () => this.close(windowState.id)
    });
    titlebar.append(title, controls);

    const content = createElement("div", { className: "xp-window-tresc" });
    const appResult = app.render({
      windowId: windowState.id,
      title: windowState.title,
      closeWindow: () => this.close(windowState.id),
      minimizeWindow: () => this.minimize(windowState.id),
      focusWindow: () => this.focus(windowState.id),
      options: windowState.options || {}
    });
    if (appResult?.element) {
      content.append(appResult.element);
    }
    if (typeof appResult?.dispose === "function") {
      windowState.cleanup.push(appResult.dispose);
    }

    element.append(titlebar, content);
    for (const direction of RESIZE_DIRECTIONS) {
      element.append(createElement("div", { className: `xp-window-zmiana-rozmiaru xp-window-zmiana-rozmiaru-${direction}`, dataset: { direction } }));
    }

    element.addEventListener("pointerdown", () => this.focus(windowState.id));
    titlebar.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || isInteractiveElement(event.target) || windowState.maximized) {
        return;
      }
      this.startDrag(event, windowState);
    });
    titlebar.addEventListener("dblclick", (event) => {
      if (!isInteractiveElement(event.target)) {
        this.toggleMaximize(windowState.id);
      }
    });
    element.addEventListener("pointerdown", (event) => {
      const handle = event.target.closest(".xp-window-zmiana-rozmiaru");
      if (!handle || event.button !== 0 || windowState.maximized) {
        return;
      }
      this.startResize(event, windowState, handle.dataset.direction);
    });

    return element;
  }

  // Drag działa na pointerach. Trzeba pilnowac, żeby inputy w oknie nie zaczely przesuwac calego okna.
  startDrag(event, windowState) {
    event.preventDefault();
    this.focus(windowState.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const startBounds = { x: windowState.x, y: windowState.y };
    const abort = new AbortController();
    const onMove = (moveEvent) => {
      this.setBounds(windowState, this.clampBounds(windowState, {
        x: startBounds.x + moveEvent.clientX - startX,
        y: startBounds.y + moveEvent.clientY - startY,
        width: windowState.width,
        height: windowState.height
      }));
    };
    const onEnd = () => abort.abort();
    window.addEventListener("pointermove", onMove, { signal: abort.signal });
    window.addEventListener("pointerup", onEnd, { once: true, signal: abort.signal });
  }

  // Resize jest najbardziej upierdliwy, bo kazdy kierunek zmienia inne krawedzie.
  startResize(event, windowState, direction) {
    event.preventDefault();
    this.focus(windowState.id);
    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: windowState.x,
      y: windowState.y,
      width: windowState.width,
      height: windowState.height
    };
    const abort = new AbortController();
    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - start.pointerX;
      const dy = moveEvent.clientY - start.pointerY;
      let next = { x: start.x, y: start.y, width: start.width, height: start.height };
      if (direction.includes("e")) next.width = start.width + dx;
      if (direction.includes("s")) next.height = start.height + dy;
      if (direction.includes("w")) {
        next.x = start.x + dx;
        next.width = start.width - dx;
      }
      if (direction.includes("n")) {
        next.y = start.y + dy;
        next.height = start.height - dy;
      }
      next.width = Math.max(windowState.minWidth, next.width);
      next.height = Math.max(windowState.minHeight, next.height);
      this.setBounds(windowState, this.clampBounds(windowState, next));
    };
    const onEnd = () => abort.abort();
    window.addEventListener("pointermove", onMove, { signal: abort.signal });
    window.addEventListener("pointerup", onEnd, { once: true, signal: abort.signal });
  }

  getInitialBounds(app, options) {
    const layerRect = this.layer.getBoundingClientRect();
    const width = Math.min(options.width || app.defaultSize?.width || 560, Math.max(320, layerRect.width - 32));
    const height = Math.min(options.height || app.defaultSize?.height || 380, Math.max(220, layerRect.height - 32));
    const offset = (this.windows.size % 8) * 26;
    return this.clampBounds({ minWidth: app.minSize?.width || 280, minHeight: app.minSize?.height || 180 }, {
      x: Math.max(12, Math.round((layerRect.width - width) / 2) + offset),
      y: Math.max(10, Math.round((layerRect.height - height) / 2) + offset),
      width,
      height
    });
  }

  clampBounds(windowState, bounds) {
    const layerRect = this.layer.getBoundingClientRect();
    const minVisible = 72;
    const width = Math.max(windowState.minWidth, Math.min(bounds.width, Math.max(windowState.minWidth, layerRect.width)));
    const height = Math.max(windowState.minHeight, Math.min(bounds.height, Math.max(windowState.minHeight, layerRect.height)));
    const maxX = Math.max(0, layerRect.width - minVisible);
    const maxY = Math.max(0, layerRect.height - minVisible);
    const x = Math.max(Math.min(bounds.x, maxX), Math.min(0, layerRect.width - width));
    const y = Math.max(Math.min(bounds.y, maxY), Math.min(0, layerRect.height - height));
    return { x, y, width, height };
  }

  setBounds(windowState, bounds) {
    windowState.x = Math.round(bounds.x);
    windowState.y = Math.round(bounds.y);
    windowState.width = Math.round(bounds.width);
    windowState.height = Math.round(bounds.height);
    this.applyBounds(windowState);
  }

  applyBounds(windowState) {
    Object.assign(windowState.element.style, {
      left: `${windowState.x}px`,
      top: `${windowState.y}px`,
      width: `${windowState.width}px`,
      height: `${windowState.height}px`,
      zIndex: String(windowState.zIndex)
    });
  }

  getTopVisibleWindow(excludedId = null) {
    return [...this.windows.values()]
      .filter((windowState) => windowState.id !== excludedId && !windowState.minimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0] || null;
  }

  emitChange() {
    this.dispatchEvent(new CustomEvent("change", { detail: this.snapshot() }));
  }
}
