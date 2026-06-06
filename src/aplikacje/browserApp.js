// Lokalny Internet Explorer w projekcie.
// Nie laczy sie z prawdziwym internetem, tylko pokazuje kontrolowane strony portfolio i komunikaty.
import { createButton, createElement, createImage } from "../rdzen/dom.js";
import { ASSETS } from "../konfiguracja/assets.js";

// Browser renderuje pasek narzędzi i tresc lokalnej strony portfolio.
export function renderujPrzegladarke(context) {
  const root = createElement("div", { className: "app app-przegladarka" });
  const toolbar = createElement("div", { className: "browser-toolbar" }, [
    createButton("Back", "xp-button xp-button-small", null, { disabled: "true" }),
    createButton("Forward", "xp-button xp-button-small", null, { disabled: "true" }),
    createButton("Stop", "xp-button xp-button-small", () => context.uslugi.menedzerDzwieku.play("click")),
    createButton("Refresh", "xp-button xp-button-small", () => context.uslugi.menedzerDzwieku.play("click")),
    createButton("Home", "xp-button xp-button-small", () => context.uslugi.menedzerDzwieku.play("click"))
  ]);
  const address = createElement("div", { className: "browser-address" }, [
    createElement("span", { text: "Address" }),
    createElement("input", {
      className: "browser-address-pole",
      value: "http://www.msn.com/",
      attrs: { "aria-label": "Address" }
    }),
    createButton("Go", "xp-button xp-button-small", () => context.uslugi.menedzerDzwieku.play("error"))
  ]);
  const page = createElement("div", { className: "browser-page" }, [
    createImage(ASSETS.icons.internetExplorer, "", "browser-page-ikona"),
    createElement("h2", { text: "The page cannot be displayed" }),
    createElement("p", { text: "Windows XP can only display local portfolio pages and built-in content." }),
    createElement("button", { type: "button", className: "xp-button", text: "Diagnose Connection Problems" })
  ]);
  root.append(toolbar, address, page);
  return { element: root };
}
