// Okno Run.
// Na razie sluzy głównie jako element klimatu i prosty launcher/komunikat.
import { createButton, createElement, createImage } from "../rdzen/dom.js";
import { ASSETS } from "../konfiguracja/assets.js";

const COMMANDS = Object.freeze({
  explorer: "my-computer",
  "my computer": "my-computer",
  documents: "my-documents",
  notepad: "notepad",
  mspaint: "paint",
  paint: "paint",
  iexplore: "internet-explorer",
  control: "control-panel",
  settings: "control-panel",
  help: "help"
});

// Run sprawdza wpisana komende w malej mapie, bez odpalania czegokolwiek z systemu.
export function renderujUruchom(context) {
  const root = createElement("form", { className: "app app-uruchom" });
  const input = createElement("input", {
    attrs: { "aria-label": "Open", autocomplete: "off" }
  });
  const message = createElement("div", { className: "run-message" });
  root.append(
    createElement("div", { className: "run-copy" }, [
      createImage(ASSETS.icons.run, "", "run-copy-ikona"),
      createElement("p", { text: "Type the name of a program, folder, document, or Internet resource, and Windows will open it for you." })
    ]),
    createElement("label", { className: "run-field" }, [
      createElement("span", { text: "Open:" }),
      input
    ]),
    message,
    createElement("div", { className: "run-actions" }, [
      createButton("OK", "xp-button", () => submit(context, input, message)),
      createButton("Cancel", "xp-button", () => context.closeWindow()),
      createButton("Browse...", "xp-button", () => context.uslugi.openApp("my-computer"))
    ])
  );
  root.addEventListener("submit", (event) => {
    event.preventDefault();
    submit(context, input, message);
  });
  window.setTimeout(() => input.focus(), 0);
  return { element: root };
}

// Jak komenda nie istnieje, pokazujemy komunikat zamiast robic ciche nic.
function submit(context, input, message) {
  const command = input.value.trim().toLowerCase();
  const appId = COMMANDS[command];
  if (!appId) {
    message.textContent = "Windows cannot find the command.";
    context.uslugi.menedzerDzwieku.play("error");
    return;
  }
  context.uslugi.openApp(appId);
  context.closeWindow();
}
