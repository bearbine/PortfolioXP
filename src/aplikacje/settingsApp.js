// Control Panel / ustawienia.
// Zmienia rzeczy zwiazane z wygladem pulpitu i profilem, bez dotykania prawdziwej autoryzacji.
import { AVATARS, THEMES, WALLPAPERS, getAvatar, wallpaperBackgroundImage } from "../konfiguracja/assets.js";
import { createButton, createElement, createImage } from "../rdzen/dom.js";

// Ustawienia od razu czytaja profil i zapisane preferencje aktualnego usera.
export function renderujUstawienia(context) {
  const { uslugi } = context;
  const userId = uslugi.getCurrentUserId();
  const profile = uslugi.magazynProfili.getProfile(userId);
  const settings = uslugi.magazynProfili.getSettings(userId);

  const root = createElement("div", { className: "app app-ustawienia" });
  const header = createElement("div", { className: "settings-header" }, [
    createImage(getAvatar(profile.avatarId).path, "", "settings-header-avatar"),
    createElement("div", {}, [
      createElement("h2", { text: "Control Panel" }),
      createElement("p", { text: "Appearance, sound, and local profile settings." })
    ])
  ]);

  const form = createElement("form", { className: "settings-form" });
  const displayName = createElement("input", {
    value: profile.displayName,
    attrs: { id: "display-name", maxlength: "32", autocomplete: "off" }
  });
  const avatarSelect = selectField("avatar", AVATARS, profile.avatarId);
  const wallpaperSelect = selectField("wallpaper", WALLPAPERS, settings.wallpaperId);
  const themeSelect = selectField("theme", THEMES, settings.themeId);
  const cursorSelect = selectField("cursor", [
    { id: "xp-shadow", label: "Windows XP cursor" },
    { id: "system", label: "Browser default" }
  ], settings.cursorTheme);
  const soundsEnabled = createElement("input", {
    type: "checkbox",
    checked: settings.soundsEnabled,
    attrs: { id: "sounds-enabled" }
  });

  form.append(
    field("Display name", displayName),
    field("User picture", avatarSelect),
    field("Wallpaper", wallpaperSelect),
    wallpaperPreview(settings.wallpaperId),
    field("Theme", themeSelect),
    field("Cursor", cursorSelect),
    field("Sounds", createElement("label", { className: "settings-check" }, [
      soundsEnabled,
      createElement("span", { text: "Enable Windows sounds" })
    ]))
  );

  const footer = createElement("div", { className: "settings-footer" }, [
    createButton("Apply", "xp-button", () => {
      uslugi.magazynProfili.updateProfile(userId, {
        displayName: displayName.value,
        avatarId: avatarSelect.value
      });
      uslugi.magazynProfili.updateSettings(userId, {
        wallpaperId: wallpaperSelect.value,
        themeId: themeSelect.value,
        cursorTheme: cursorSelect.value,
        soundsEnabled: soundsEnabled.checked
      });
      uslugi.menedzerDzwieku.setEnabled(soundsEnabled.checked);
      uslugi.zastosujObecneUstawienia();
      uslugi.odswiezPowloke();
      uslugi.menedzerDzwieku.play("notification", { volume: 0.4 });
    }),
    createButton("Open Help", "xp-button", () => uslugi.openApp("help"))
  ]);

  wallpaperSelect.addEventListener("change", () => {
    const preview = root.querySelector(".wallpaper-preview");
    const wallpaper = WALLPAPERS.find((item) => item.id === wallpaperSelect.value) || WALLPAPERS[0];
    preview.style.backgroundImage = wallpaperBackgroundImage(wallpaper);
  });

  root.append(header, form, footer);
  return { element: root };
}

// Helper do selecta, żeby formularz ustawien nie byl dwa razy dluzszy.
function selectField(id, items, selectedId) {
  const select = createElement("select", { attrs: { id } });
  for (const item of items) {
    const option = createElement("option", { value: item.id, text: item.label });
    if (item.id === selectedId) {
      option.selected = true;
    }
    select.append(option);
  }
  return select;
}

function field(label, control) {
  return createElement("label", { className: "settings-field" }, [
    createElement("span", { text: label }),
    control
  ]);
}

function wallpaperPreview(wallpaperId) {
  const wallpaper = WALLPAPERS.find((item) => item.id === wallpaperId) || WALLPAPERS[0];
  return createElement("div", {
    className: "wallpaper-preview",
    attrs: { role: "img", "aria-label": `${wallpaper.label} preview` },
    style: { backgroundImage: wallpaperBackgroundImage(wallpaper) }
  });
}
