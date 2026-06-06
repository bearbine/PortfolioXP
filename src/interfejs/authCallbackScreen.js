// Ekran callbacka autoryzacji.
// Użytkownik prawie go nie widzi, ale bez niego nie ma wymiany code na sesje.
import { createElement } from "../rdzen/dom.js";

// Ten ekran pokazuje stan wymiany kodu. Użytkownik nie musi widzieć szczegółów technicznych.
export function renderujEkranCallbackAutoryzacji({ status = "Preparing your desktop..." } = {}) {
  const root = createElement("section", {
    className: "welcome-screen auth-callback-screen",
    attrs: { "aria-label": "Windows XP authentication callback" }
  });

  root.append(
    createElement("div", { className: "welcome-screen-naglowek" }),
    createElement("div", { className: "welcome-screen-pasek-gorny" }),
    createElement("main", { className: "welcome-screen-centrum", attrs: { "aria-live": "polite" } }, [
      createElement("div", { className: "welcome-screen-ramka-komunikatu" }, [
        createElement("span", { className: "welcome-screen-komunikat", text: "welcome" }),
        createElement("span", { className: "welcome-screen-uzytkownik", text: status })
      ])
    ]),
    createElement("div", { className: "welcome-screen-pasek-dolny" }),
    createElement("div", { className: "welcome-screen-stopka" })
  );

  return {
    element: root,
    dispose: () => {}
  };
}
