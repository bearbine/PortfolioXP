// Widoki typu My Computer, Documents i Recycle Bin.
// To bardziej prezentacja i klimat pulpitu niz prawdziwy menedzer plikow.
import { ASSETS } from "../konfiguracja/assets.js";
import { createButton, createElement, createImage } from "../rdzen/dom.js";

const EXPLORER_DATA = Object.freeze({
  computer: {
    location: "My Computer",
    helper: "System Tasks",
    summary: "View basic information about your computer and local drives.",
    items: [
      { label: "Local Disk (C:)", icon: ASSETS.icons.hardDrive, detail: "48.6 GB free of 74.4 GB" },
      { label: "DVD Drive (D:)", icon: ASSETS.icons.folder, detail: "No disc inserted" },
      { label: "Shared Documents", icon: ASSETS.icons.folder, detail: "Shared files and folders" },
      { label: "Control Panel", icon: ASSETS.icons.controlPanel, appId: "control-panel", detail: "Change settings" }
    ]
  },
  documents: {
    location: "My Documents",
    helper: "File and Folder Tasks",
    summary: "A sample documents folder for the selected profile.",
    items: [
      { label: "My Pictures", icon: ASSETS.icons.folder, detail: "Sample picture folder" },
      { label: "University Notes.txt", icon: ASSETS.icons.notepad, appId: "notepad", detail: "Editable in Notepad" },
      { label: "Project Resources", icon: ASSETS.icons.folder, detail: "Course assets and references" },
      { label: "Paint Sketch.bmp", icon: ASSETS.icons.paint, appId: "paint", detail: "Open in Paint" }
    ]
  },
  recycle: {
    location: "Recycle Bin",
    helper: "Recycle Bin Tasks",
    summary: "Deleted items are shown locally; no real files are changed.",
    items: [
      { label: "old-shortcut.lnk", icon: ASSETS.icons.recycleBinEmpty, detail: "Sample deleted shortcut" }
    ]
  }
});

// Tryb explorera wybiera dane z EXPLORER_DATA i renderuje podobny widok dla kilku aplikacji.
export function renderujEksplorator(context) {
  const data = EXPLORER_DATA[context.mode] || EXPLORER_DATA.computer;
  const root = createElement("div", { className: "app app-eksplorator" });
  const toolbar = createElement("div", { className: "explorer-toolbar" }, [
    createButton("Back", "xp-button xp-button-small", null, { disabled: "true" }),
    createButton("Search", "xp-button xp-button-small", () => context.uslugi.openApp("help")),
    createButton("Folders", "xp-button xp-button-small", null)
  ]);
  const address = createElement("div", { className: "explorer-address" }, [
    createElement("span", { text: "Address" }),
    createElement("div", { className: "explorer-address-pole", text: data.location })
  ]);
  const layout = createElement("div", { className: "explorer-layout" });
  const side = createElement("aside", { className: "explorer-side" }, [
    createElement("h3", { text: data.helper }),
    createElement("button", { type: "button", className: "link-button", text: "View system information" }),
    createElement("button", { type: "button", className: "link-button", text: "Add or remove programs" }),
    createElement("button", { type: "button", className: "link-button", text: "Change a setting" }),
    createElement("h3", { text: "Details" }),
    createElement("p", { text: data.summary })
  ]);
  const content = createElement("div", { className: "explorer-content" });
  for (const item of data.items) {
    const row = createElement("button", { type: "button", className: "explorer-item" }, [
      createImage(item.icon, "", "explorer-item-ikona"),
      createElement("span", { className: "explorer-item-etykieta", text: item.label }),
      createElement("span", { className: "explorer-item-szczegoly", text: item.detail })
    ]);
    if (item.appId) {
      row.addEventListener("dblclick", () => context.uslugi.openApp(item.appId));
      row.addEventListener("click", () => row.classList.toggle("is-selected"));
    }
    content.append(row);
  }
  layout.append(side, content);
  root.append(toolbar, address, layout);
  return { element: root };
}
