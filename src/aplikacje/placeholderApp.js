// Placeholder dla aplikacji, ktore jeszcze nie maja pelnej logiki.
// Lepszy taki kontrolowany placeholder niz martwy przycisk bez reakcji.
import { createButton, createElement, createImage } from "../rdzen/dom.js";
import { ASSETS } from "../konfiguracja/assets.js";

export function renderujAplikacjeZastepcza({ closeWindow, options = {} }) {
  const icon = options.icon || ASSETS.icons.help;
  const title = options.title || "Windows XP";
  const message = options.message || "This feature is prepared for a future version of Windows XP.";
  const root = createElement("div", { className: "app app-placeholder" }, [
    createElement("div", { className: "placeholder-card" }, [
      createImage(icon, "", "placeholder-card-ikona"),
      createElement("div", { className: "placeholder-card-kopia" }, [
        createElement("h2", { text: title }),
        createElement("p", { text: message }),
        createElement("p", { className: "placeholder-card-info", text: "This desktop item is intentionally wired as a safe placeholder instead of a dead button." })
      ])
    ]),
    createElement("div", { className: "placeholder-actions" }, [
      createButton("OK", "xp-button", () => closeWindow())
    ])
  ]);
  return { element: root };
}
