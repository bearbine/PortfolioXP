// Uslugi motywu.
// Ma trzymac logike wygladu w jednym miejscu, zamiast rozsypywac CSS zmienne po calym projekcie.
import { getWallpaper, isKnownTheme, wallpaperBackgroundImage } from "../konfiguracja/assets.js";

export function applyUserSettings(settings, desktopElement = null) {
  const themeId = isKnownTheme(settings.themeId) ? settings.themeId : "luna-blue";
  document.body.dataset.theme = themeId;
  document.body.dataset.cursorTheme = settings.cursorTheme === "system" ? "system" : "xp-shadow";

  if (desktopElement) {
    const wallpaper = getWallpaper(settings.wallpaperId);
    desktopElement.style.setProperty("--desktop-wallpaper", wallpaperBackgroundImage(wallpaper));
    desktopElement.style.setProperty("--desktop-wallpaper-fit", wallpaper.fit || "cover");
  }
}
