import { createButton, createElement } from "../rdzen/dom.js";

function utworzPrzyciskKontrolki({ typ, label, title, onClick, disabled = false }) {
  const klasy = [
    "xp-window-kontrolka",
    `xp-window-kontrolka-${typ}`,
    disabled ? "is-disabled" : ""
  ].filter(Boolean).join(" ");

  const button = createButton("", klasy, disabled ? null : onClick, {
    title,
    "aria-label": label
  });

  if (disabled) {
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
  }

  return button;
}

export function utworzKontrolkiOkna({
  onMinimize,
  onMaximize,
  onClose,
  canMaximize = true,
  showMinimize = true,
  showMaximize = true,
  showClose = true,
  minimizeLabel = "Minimize",
  minimizeTitle = "Minimize",
  closeLabel = "Close",
  closeTitle = "Close"
} = {}) {
  const controls = [];

  if (showMinimize) {
    controls.push(utworzPrzyciskKontrolki({
      typ: "minimalizuj",
      label: minimizeLabel,
      title: minimizeTitle,
      onClick: onMinimize,
      disabled: !onMinimize
    }));
  }

  if (showMaximize) {
    controls.push(utworzPrzyciskKontrolki({
      typ: "maksymalizuj",
      label: canMaximize ? "Maximize or restore" : "Maximize is locked in this window",
      title: canMaximize ? "Maximize or restore" : "Maximize is locked in this window",
      onClick: onMaximize,
      disabled: !canMaximize || !onMaximize
    }));
  }

  if (showClose) {
    controls.push(utworzPrzyciskKontrolki({
      typ: "zamknij",
      label: closeLabel,
      title: closeTitle,
      onClick: onClose
    }));
  }

  return createElement("div", { className: "xp-window-kontrolki" }, controls);
}
