// Prosty Notepad.
// Trzyma tekst użytkownika w store, bo szkoda byloby tracic notatke po zamknieciu okna.
import { createButton, createElement } from "../rdzen/dom.js";

// Notepad składa menu i textarea, potem zapisuje tekst po kazdej zmianie.
export function renderujNotatnik(context) {
  const { uslugi } = context;
  const root = createElement("div", { className: "app app-notatnik" });
  const menu = createElement("div", { className: "notepad-menu" }, [
    createButton("File", "menu-button", () => uslugi.menedzerDzwieku.play("menuCommand")),
    createButton("Edit", "menu-button", () => uslugi.menedzerDzwieku.play("menuCommand")),
    createButton("Format", "menu-button", () => uslugi.menedzerDzwieku.play("menuCommand")),
    createButton("View", "menu-button", () => uslugi.menedzerDzwieku.play("menuCommand")),
    createButton("Help", "menu-button", () => uslugi.openApp("help"))
  ]);
  const textarea = createElement("textarea", {
    className: "notepad-textarea",
    attrs: { spellcheck: "false", "aria-label": "Notepad document" }
  });
  textarea.value = uslugi.magazynProfili.getNotepadText(uslugi.getCurrentUserId());
  const status = createElement("div", { className: "notepad-status", text: "Ready" });

  let saveTimer = null;
  textarea.addEventListener("input", () => {
    status.textContent = "Modified";
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      uslugi.magazynProfili.saveNotepadText(uslugi.getCurrentUserId(), textarea.value);
      status.textContent = "Saved locally";
    }, 300);
  });

  root.append(menu, textarea, status);
  return {
    element: root,
    dispose: () => window.clearTimeout(saveTimer)
  };
}
