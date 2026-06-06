// Welcome screen.
// Krótki ekran przejsciowy po logowaniu, żeby wejscie na pulpit nie bylo naglym przeskokiem.
import { LOGIN_CONFIG } from "../konfiguracja/system.js";
import { createElement } from "../rdzen/dom.js";

export function renderujEkranPowitania({ profile, onComplete }) {
  const root = createElement("section", { className: "welcome-screen", attrs: { "aria-label": "Windows XP welcome" } });
  root.append(
    createElement("div", { className: "welcome-screen-naglowek" }),
    createElement("div", { className: "welcome-screen-pasek-gorny" }),
    createElement("main", { className: "welcome-screen-centrum", attrs: { "aria-live": "polite" } }, [
      createElement("div", { className: "welcome-screen-ramka-komunikatu" }, [
        createElement("span", { className: "welcome-screen-komunikat", text: "welcome" }),
        createElement("span", { className: "welcome-screen-uzytkownik", text: profile.displayName })
      ])
    ]),
    createElement("div", { className: "welcome-screen-pasek-dolny" }),
    createElement("div", { className: "welcome-screen-stopka" })
  );

  const fadeTimer = window.setTimeout(() => {
    root.classList.add("is-complete");
  }, Math.max(0, LOGIN_CONFIG.welcomeDurationMs - LOGIN_CONFIG.welcomeFadeMs));
  const completeTimer = window.setTimeout(onComplete, LOGIN_CONFIG.welcomeDurationMs);

  return {
    element: root,
    dispose: () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    }
  };
}
