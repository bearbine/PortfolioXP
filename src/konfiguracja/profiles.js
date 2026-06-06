// Domyslne ustawienia profili lokalnych.
// Backend i tak jest wazniejszy dla sesji, ale UI potrzebuje sensownych danych startowych.
// Fallback profilu, gdy backend jeszcze nie dal zdalnych profili albo storage jest pusty.
export const DEFAULT_PROFILES = Object.freeze([
  {
    id: "admin",
    displayName: "Roma",
    avatarId: "chess",
    passwordRequired: true,
    passwordHint: "Domyslne haslo startowe: admin.",
    role: "Root-user"
  }
]);

export const DEFAULT_USER_SETTINGS = Object.freeze({
  wallpaperId: "bliss",
  themeId: "luna-blue",
  soundsEnabled: true,
  cursorTheme: "xp-shadow",
  desktop: Object.freeze({
    iconSize: "normal",
    showIconLabels: true
  })
});
