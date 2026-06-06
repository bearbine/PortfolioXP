// Dialog zasilania.
// Obsluguje logoff, restart i power off w stylu systemowego okna.
import { createButton, createElement, createImage } from "../rdzen/dom.js";

const FADE_MS = 220;

// Power dialog tylko udaje systemowe akcje, ale flow restartu/logoff musi byc spójny.
export function otworzOknoZasilania({
  mode = "turn-off",
  assets,
  menedzerDzwieku = null,
  mount = document.body,
  onCancel = null,
  onStandBy = null,
  onTurnOff = null,
  onRestart = null,
  onSwitchUser = null,
  onLogOff = null
} = {}) {
  if (!assets?.power) {
    throw new Error("Power dialog requires ASSETS.power.");
  }

  zamknijIstniejaceOknoZasilania();

  const overlay = createElement("div", {
    className: "xp-power-overlay",
    attrs: {
      role: "presentation",
      "data-power-dialog": "true"
    }
  });

  const dialog = createElement("section", {
    className: ["xp-power-dialog", mode === "log-off" ? "xp-power-dialog-wyloguj" : "xp-power-dialog-wylacz"],
    attrs: {
      role: "dialog",
      "aria-modal": "true",
      "aria-label": mode === "log-off" ? "Log Off Windows" : "Turn off computer"
    }
  }, [
    renderujNaglowek({ mode, assets }),
    renderujTresc({
      mode,
      assets,
      onStandBy,
      onTurnOff,
      onRestart,
      onSwitchUser,
      onLogOff,
      closeAndRun
    }),
    renderujStopke({ close })
  ]);

  overlay.append(dialog);
  overlay.addEventListener("mousemove", stopBehindDialog);
  overlay.addEventListener("mousedown", stopBehindDialog);
  overlay.addEventListener("mouseup", stopBehindDialog);
  overlay.addEventListener("click", stopBehindDialog);
  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });

  mount.append(overlay);
  menedzerDzwieku?.play?.("menuCommand", { volume: 0.35 });

  window.requestAnimationFrame(() => {
    overlay.classList.add("is-visible");
    dialog.querySelector(".xp-power-dialog-anuluj")?.focus();
  });

  function close() {
    overlay.classList.remove("is-visible");
    window.setTimeout(() => overlay.remove(), FADE_MS);
    if (typeof onCancel === "function") {
      onCancel();
    }
  }

  function closeAndRun(action) {
    overlay.classList.remove("is-visible");
    window.setTimeout(() => overlay.remove(), FADE_MS);
    if (typeof action === "function") {
      action();
    }
  }

  return {
    element: overlay,
    close
  };
}

function zamknijIstniejaceOknoZasilania() {
  for (const element of document.querySelectorAll("[data-power-dialog='true']")) {
    element.remove();
  }
}

function stopBehindDialog(event) {
  event.preventDefault();
  event.stopPropagation();
}

function renderujNaglowek({ mode, assets }) {
  return createElement("header", { className: "xp-power-dialog-naglowek" }, [
    createElement("span", {
      className: "xp-power-dialog-tytul",
      text: mode === "log-off" ? "Log Off Windows" : "Turn off computer"
    }),
    createImage(assets.power.windowsOff, "", "xp-power-dialog-logo")
  ]);
}

function renderujTresc({ mode, assets, onStandBy, onTurnOff, onRestart, onSwitchUser, onLogOff, closeAndRun }) {
  const przyciski = mode === "log-off"
    ? [
        {
          label: "Switch User",
          icon: assets.power.switchUser,
          action: onSwitchUser,
          extraClass: "xp-power-button-przelacz-uzytkownika"
        },
        {
          label: "Log Off",
          icon: assets.power.logOff,
          action: onLogOff
        }
      ]
    : [
        {
          label: "Stand By",
          icon: assets.power.standBy,
          action: onStandBy,
          disabled: true
        },
        {
          label: "Turn Off",
          icon: assets.power.turnOff,
          action: onTurnOff
        },
        {
          label: "Restart",
          icon: assets.power.restart,
          action: onRestart,
          extraClass: "xp-power-button-restart"
        }
      ];

  return createElement("div", { className: "xp-power-dialog-tresc" },
    przyciski.map((button) => renderujPrzyciskZasilania({ ...button, closeAndRun }))
  );
}

function renderujPrzyciskZasilania({ label, icon, action, disabled = false, extraClass = "", closeAndRun }) {
  const button = createElement("button", {
    type: "button",
    className: [
      "xp-power-button",
      extraClass,
      disabled ? "is-disabled" : ""
    ],
    attrs: {
      "aria-label": label,
      "aria-disabled": disabled ? "true" : null,
      tabindex: disabled ? "-1" : "0"
    }
  }, [
    createImage(icon, "", "xp-power-button-ikona"),
    createElement("span", { className: "xp-power-button-label", text: label })
  ]);

  if (!disabled) {
    button.addEventListener("click", () => closeAndRun(action));
  }

  return button;
}

function renderujStopke({ close }) {
  return createElement("footer", { className: "xp-power-dialog-stopka" }, [
    createButton("Cancel", "xp-power-dialog-anuluj", close)
  ]);
}
