// Menu Start.
// Duzy element UI, bo trzyma kolumny, submenu, akcje i zamykanie po kliknięciu poza menu.
import { ASSETS, getAvatar } from "../konfiguracja/assets.js";
import { createElement, createImage } from "../rdzen/dom.js";
import { LEFT_MENU_ITEMS, RIGHT_MENU_ITEMS, SUBMENUS } from "./startMenuData.js";

const SIDE_CLASS_SUFFIX = {
  left: "lewa",
  right: "prawa",
  submenu: "podmenu"
};

function getSideClassSuffix(side) {
  return SIDE_CLASS_SUFFIX[side] || side;
}

// Menu Start ma sporo stanu, bo submenu musi sie otwierac i zamykac bez dziwnych skokow.
export class MenuStart {
  constructor({ rejestrAplikacji, uslugi, callbacks }) {
    this.rejestrAplikacji = rejestrAplikacji;
    this.uslugi = uslugi;
    this.callbacks = callbacks;
    this.onOpenChange = typeof callbacks?.onStartMenuOpenChange === "function"
      ? callbacks.onStartMenuOpenChange
      : null;
    this.element = createElement("section", { className: "start-menu", attrs: { "aria-label": "Start menu" } });
    this.isOpen = false;
    this.activeSubmenuKey = null;
    this.flyoutLayer = null;
    this.handleOutsidePointer = this.handleOutsidePointer.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.render();
  }

  render() {
    const profile = this.uslugi.magazynProfili.getProfile(this.uslugi.getCurrentUserId());
    this.flyoutLayer = createElement("div", { className: "start-menu-warstwa-podmenu", attrs: { "aria-hidden": "true" } });
    this.element.replaceChildren();
    this.element.append(
      this.renderujNaglowek(profile),
      createElement("div", { className: "start-menu-tresc" }, [
        this.renderColumn("left", LEFT_MENU_ITEMS),
        this.renderColumn("right", RIGHT_MENU_ITEMS)
      ]),
      this.flyoutLayer,
      this.renderujStopke()
    );
  }

  renderujNaglowek(profile) {
    const avatar = profile?.avatarId ? getAvatar(profile.avatarId).path : ASSETS.menuStart.user;
    const name = profile?.displayName || profile?.username || "User";
    return createElement("header", { className: "start-menu-naglowek" }, [
      createImage(avatar, "", "start-menu-avatar"),
      createElement("span", { className: "start-menu-nazwa-uzytkownika", text: name })
    ]);
  }

  renderColumn(side, items) {
    const sideClass = getSideClassSuffix(side);
    const column = createElement("div", { className: ["start-menu-kolumna", `start-menu-kolumna-${sideClass}`] });
    for (const item of items) {
      column.append(this.renderMenuEntry(item, side, 0));
    }
    return column;
  }

  renderMenuEntry(item, side, depth = 0) {
    if (item.type === "separator") {
      return createElement("div", { className: "start-menu-separator", attrs: { "aria-hidden": "true" } });
    }
    if (item.type === "spacer") {
      return createElement("div", { className: "start-menu-odstep", attrs: { "aria-hidden": "true" } });
    }

    const hasSubmenu = Boolean(item.submenu || item.submenuItems);
    const labelNode = createElement("span", { className: "start-item-etykieta", text: item.label });
    if (item.arrowIcon) {
      labelNode.append(createImage(item.arrowIcon, "", "start-item-ikona-wszystkie-programy"));
    }

    const button = createElement("div", {
      className: [
        "start-item",
        `start-item-${getSideClassSuffix(side)}`,
        item.strong ? "is-strong" : "",
        hasSubmenu ? "has-submenu" : "",
        item.disabled ? "is-disabled" : "",
        depth > 0 ? "is-submenu-item" : ""
      ],
      attrs: {
        role: "menuitem",
        tabindex: item.disabled ? null : "0",
        "aria-disabled": item.disabled ? "true" : null,
        "aria-haspopup": hasSubmenu ? "menu" : null
      },
      dataset: { itemId: item.id || item.label }
    }, [
      createImage(item.icon || ASSETS.menuStart.empty, "", "start-item-ikona"),
      createElement("span", { className: "start-item-teksty" }, [
        labelNode,
        item.subLabel ? createElement("span", { className: "start-item-opis", text: item.subLabel }) : null
      ]),
      hasSubmenu && !item.arrowIcon ? createElement("span", { className: "start-item-strzalka", attrs: { "aria-hidden": "true" } }) : null
    ]);

    if (item.disabled) {
      // Wyłączone pozycje zostają widoczne, ale nic nie robią. Taki placeholder w stylu systemowym.
    } else if (hasSubmenu && depth === 0) {
      button.addEventListener("mouseenter", () => this.openRootSubmenu(item, button));
      button.addEventListener("focus", () => this.openRootSubmenu(item, button));
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.openRootSubmenu(item, button);
      });
    } else if (hasSubmenu) {
      const openNestedSubmenu = () => {
        this.setActiveSubmenu(item.submenu || item.id);
        window.requestAnimationFrame(() => this.positionNestedSubmenu(button));
      };
      button.addEventListener("mouseenter", openNestedSubmenu);
      button.addEventListener("focus", openNestedSubmenu);
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openNestedSubmenu();
      });
    } else {
      button.addEventListener("mouseenter", () => {
        this.setActiveSubmenu(null);
        if (depth === 0) {
          this.closeRootSubmenu();
        }
      });
      button.addEventListener("focus", () => {
        this.setActiveSubmenu(null);
        if (depth === 0) {
          this.closeRootSubmenu();
        }
      });
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        this.activateItem(item);
      });
    }

    if (!item.disabled) {
      button.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }
        event.preventDefault();
        if (hasSubmenu && depth === 0) {
          this.openRootSubmenu(item, button);
        } else if (hasSubmenu) {
          this.setActiveSubmenu(item.submenu || item.id);
          window.requestAnimationFrame(() => this.positionNestedSubmenu(button));
        } else {
          this.activateItem(item);
        }
      });
    }

    if (hasSubmenu && depth > 0) {
      const submenuItems = item.submenuItems || SUBMENUS[item.submenu] || [];
      button.append(this.renderSubmenu(submenuItems, item.submenu || item.id, depth + 1));
    }

    return button;
  }

  openRootSubmenu(item, anchor) {
    const key = item.submenu || item.id;
    const submenuItems = item.submenuItems || SUBMENUS[item.submenu] || [];
    if (!submenuItems.length || !this.flyoutLayer) {
      this.closeRootSubmenu();
      return;
    }

    this.activeSubmenuKey = key;
    this.flyoutLayer.replaceChildren();
    this.flyoutLayer.removeAttribute("aria-hidden");

    for (const entry of this.element.querySelectorAll(".start-item.is-root-submenu-active")) {
      entry.classList.remove("is-root-submenu-active");
    }
    anchor.classList.add("is-root-submenu-active");

    const flyout = this.renderSubmenu(submenuItems, key, 1);
    flyout.classList.add("start-submenu-glowne", "is-open");
    flyout.addEventListener("mouseenter", () => {
      this.activeSubmenuKey = key;
      anchor.classList.add("is-root-submenu-active");
    });
    flyout.addEventListener("mouseleave", () => {
      window.setTimeout(() => this.closeRootSubmenuIfPointerOutsideActiveZone(), 35);
    });
    anchor.addEventListener("mouseleave", () => {
      window.setTimeout(() => this.closeRootSubmenuIfPointerOutsideActiveZone(), 35);
    }, { once: true });

    this.flyoutLayer.append(flyout);
    this.positionRootSubmenu(flyout, anchor, item);
  }

  positionRootSubmenu(flyout, anchor, item) {
    const menuRect = this.element.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const footer = this.element.querySelector(".start-menu-stopka");
    const footerHeight = footer?.getBoundingClientRect().height || 44;

    const left = Math.max(0, Math.round(anchorRect.right - menuRect.left - 2));
    flyout.style.left = `${left}px`;

    if (item.id === "all-programs") {
      flyout.style.top = "auto";
      flyout.style.bottom = `${Math.round(footerHeight)}px`;
      return;
    }

    flyout.style.bottom = "auto";
    flyout.style.top = `${Math.max(0, Math.round(anchorRect.top - menuRect.top - 2))}px`;
  }

  positionNestedSubmenu(anchor) {
    const submenu = Array.from(anchor.children).find((child) => child.classList?.contains("start-submenu"));
    if (!submenu || !submenu.classList.contains("is-open")) {
      return;
    }

    const taskbarHeight = this.getTaskbarHeight();
    const gap = 5;
    const viewportPadding = 6;
    const topLimit = viewportPadding;
    const bottomLimit = window.innerHeight - taskbarHeight - viewportPadding;
    const rightLimit = window.innerWidth - viewportPadding;

    submenu.style.left = `calc(100% + ${gap}px)`;
    submenu.style.right = "auto";
    submenu.style.top = "auto";
    submenu.style.bottom = "auto";
    submenu.style.maxHeight = "";
    submenu.style.overflowY = "";

    const anchorRect = anchor.getBoundingClientRect();
    let submenuRect = submenu.getBoundingClientRect();

    // Horizontal behavior:
    // Default is the classic cascade to the right. If there is no space,
    // open to the left instead of letting the panel leave the viewport.
    if (anchorRect.right + gap + submenuRect.width > rightLimit) {
      submenu.style.left = "auto";
      submenu.style.right = `calc(100% + ${gap}px)`;
      submenuRect = submenu.getBoundingClientRect();
    }

    const availableHeight = Math.max(160, bottomLimit - topLimit);
    let submenuHeight = submenuRect.height;

    if (submenuHeight > availableHeight) {
      submenu.style.maxHeight = `${Math.round(availableHeight)}px`;
      submenu.style.overflowY = "auto";
      submenuHeight = availableHeight;
    }

    // Vertical behavior:
    // XP-style All Programs cascades should prefer growing upward first.
    // Align the submenu bottom with the current folder row, then clamp it
    // back into the visible desktop area when needed.
    let desiredViewportTop = anchorRect.bottom - submenuHeight;

    if (desiredViewportTop < topLimit) {
      desiredViewportTop = topLimit;
    }

    if (desiredViewportTop + submenuHeight > bottomLimit) {
      desiredViewportTop = Math.max(topLimit, bottomLimit - submenuHeight);
    }

    const topRelativeToAnchor = Math.round(desiredViewportTop - anchorRect.top);
    submenu.style.top = `${topRelativeToAnchor}px`;
    submenu.style.bottom = "auto";
  }

  getTaskbarHeight() {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--taskbar-height").trim();
    const numericToken = Number.parseFloat(token);
    if (Number.isFinite(numericToken)) {
      return numericToken;
    }
    const taskbar = document.querySelector(".taskbar");
    return taskbar?.getBoundingClientRect().height || 40;
  }

  closeRootSubmenuIfPointerOutsideActiveZone() {
    if (!this.activeSubmenuKey || !this.lastPointerTarget) {
      return;
    }

    if (!this.isPointerInsideRootSubmenuZone(this.lastPointerTarget)) {
      this.closeRootSubmenu();
    }
  }

  isPointerInsideRootSubmenuZone(target) {
    if (!(target instanceof Element)) {
      return false;
    }

    if (target.closest(".start-item.is-root-submenu-active")) {
      return true;
    }

    if (target.closest(".start-menu-warstwa-podmenu")) {
      return true;
    }

    return false;
  }

  handlePointerMove(event) {
    this.lastPointerTarget = event.target;

    if (!this.activeSubmenuKey) {
      return;
    }

    if (!this.isPointerInsideRootSubmenuZone(event.target)) {
      this.closeRootSubmenu();
    }
  }

  closeRootSubmenu() {
    this.activeSubmenuKey = null;
    if (this.flyoutLayer) {
      this.flyoutLayer.replaceChildren();
      this.flyoutLayer.setAttribute("aria-hidden", "true");
    }
    for (const entry of this.element.querySelectorAll(".start-item.is-root-submenu-active")) {
      entry.classList.remove("is-root-submenu-active");
    }
  }

  renderSubmenu(items, key, depth) {
    const submenu = createElement("div", {
      className: "start-submenu",
      attrs: { role: "menu" },
      dataset: { submenu: key, depth }
    });
    for (const entry of items) {
      submenu.append(this.renderMenuEntry(entry, "submenu", depth));
    }
    submenu.addEventListener("mouseenter", () => this.setActiveSubmenu(key));
    return submenu;
  }

  renderujStopke() {
    return createElement("footer", { className: "start-menu-stopka" }, [
      startAction("Log Off", ASSETS.menuStart.wyloguj, () => {
        this.close();
        this.callbacks.onLogoff();
      }),
      startAction("Turn Off Computer", ASSETS.menuStart.wylaczKomputer, () => {
        this.close();
        this.callbacks.onShutdown();
      })
    ]);
  }

  setActiveSubmenu(key) {
    for (const submenu of this.element.querySelectorAll(".start-submenu:not(.start-submenu-glowne)")) {
      const isOpen = Boolean(key) && submenu.dataset.submenu === key;
      submenu.classList.toggle("is-open", isOpen);
      if (!isOpen) {
        submenu.style.top = "";
        submenu.style.bottom = "";
        submenu.style.maxHeight = "";
        submenu.style.overflowY = "";
      }
    }

    if (key) {
      window.requestAnimationFrame(() => {
        for (const submenu of this.element.querySelectorAll(".start-submenu.is-open:not(.start-submenu-glowne)")) {
          const anchor = submenu.parentElement;
          if (anchor?.classList.contains("start-item")) {
            this.positionNestedSubmenu(anchor);
          }
        }
      });
    }
  }

  activateItem(item) {
    this.close();
    if (item.appId && this.rejestrAplikacji.get(item.appId)) {
      this.uslugi.openApp(item.appId);
      return;
    }
    this.uslugi.openApp("placeholder", {
      title: item.label || "Windows XP",
      message: item.placeholder || `${item.label || "This feature"} is not implemented yet.`,
      icon: item.icon || ASSETS.icons.help
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    if (this.isOpen) {
      return;
    }
    this.render();
    this.isOpen = true;
    this.element.classList.add("is-open");
    this.onOpenChange?.(true);
    window.setTimeout(() => {
      document.addEventListener("pointerdown", this.handleOutsidePointer);
      document.addEventListener("pointermove", this.handlePointerMove);
    }, 0);
  }

  close() {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.closeRootSubmenu();
    this.setActiveSubmenu(null);
    this.element.classList.remove("is-open");
    document.removeEventListener("pointerdown", this.handleOutsidePointer);
    document.removeEventListener("pointermove", this.handlePointerMove);
    this.lastPointerTarget = null;
    this.onOpenChange?.(false);
  }

  handleOutsidePointer(event) {
    if (!this.element.contains(event.target) && !event.target.closest(".taskbar-start")) {
      this.close();
    }
  }
}

function startAction(label, icon, action) {
  const button = createElement("button", { type: "button", className: "start-action" }, [
    createImage(icon, "", "start-action-ikona"),
    createElement("span", { text: label })
  ]);
  button.addEventListener("click", action);
  return button;
}
