// Help and Support.
// Miesza zwykle informacje o projekcie z testem chronionego zasobu admina.
import { createButton, createElement, createImage } from "../rdzen/dom.js";
import { ASSETS } from "../konfiguracja/assets.js";

export function renderujPomoc({ uslugi }) {
  const protectedStatus = createElement("p", {
    className: "help-protected-status",
    attrs: { role: "status" },
    text: "Admin resource has not been checked yet."
  });

  const root = createElement("div", { className: "app app-pomoc" }, [
    createElement("div", { className: "help-hero" }, [
      createImage(ASSETS.icons.help, "", "help-hero-ikona"),
      createElement("div", {}, [
        createElement("h2", { text: "Help and Support Center" }),
        createElement("p", { text: "Windows XP portfolio environment." })
      ])
    ]),
    createElement("div", { className: "help-grid" }, [
      helpTopic("Window Manager", "Open, focus, drag, resize, minimize, maximize, and close app windows."),
      helpTopic("Profiles", "Database-backed profiles use the backend login flow, while display preferences remain per profile."),
      helpTopic("Settings", "Wallpaper, theme, cursor, and sound preferences are persisted per profile."),
      helpTopic("Apps", "Applications are registered in a central registry and render through isolated modules.")
    ]),
    createElement("section", { className: "help-protected" }, [
      createElement("h3", { text: "Admin resource" }),
      createElement("p", { text: "This check calls the backend admin endpoint using the current auth session." }),
      createButton("Check admin endpoint", "xp-button", async () => {
        protectedStatus.textContent = "Checking admin endpoint...";
        try {
          const result = await uslugi.serwisAutoryzacji.protectedAdmin();
          protectedStatus.textContent = `${result.message} Logged on as ${result.user.displayName}.`;
        } catch (error) {
          protectedStatus.textContent = error.message || "Admin endpoint check failed.";
        }
      }),
      protectedStatus
    ]),
    createElement("p", {
      className: "help-note",
      text: "This is not an official Microsoft product and does not provide real operating-system security."
    })
  ]);
  return { element: root };
}

function helpTopic(title, text) {
  return createElement("section", { className: "help-topic" }, [
    createElement("h3", { text: title }),
    createElement("p", { text })
  ]);
}
