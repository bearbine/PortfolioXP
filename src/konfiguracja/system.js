// Konfiguracja tekstow i przejsc systemowych.
// Tu sa rzeczy widoczne w UI, wiec zmiany od razu widac na ekranie.
export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = Object.freeze({
  profiles: "portfolio-xp:v1:profiles",
  settings: "portfolio-xp:v1:settings",
  session: "portfolio-xp:v1:session"
});

// Branding boot screena i loginu. To zmienia widoczne napisy, nie logike aplikacji.
export const SYSTEM_BRANDING = Object.freeze({
  productLogo: "/assets/ekran_startowy/branding/xp-product-logo-hq.png",
  loginLogo: "/assets/ekran_startowy/branding/xp-product-logo-hq.png",
  dialogLogo: "/assets/logowanie/mini-logo.png",
  brandLabel: "",
  registeredMark: "®",
  footerLeft: "Copyright © Bearbine",
  footerRight: "PortfolioXP®"
});

export const SYSTEM_TRANSITION = Object.freeze({
  soundGroup: "system-transition",
  restartBootDelayMs: 3400,
  soundFadeMs: 650
});

export const BOOT_CONFIG = Object.freeze({
  logo: SYSTEM_BRANDING.productLogo,
  brandLabel: SYSTEM_BRANDING.brandLabel,
  registeredMark: SYSTEM_BRANDING.registeredMark,
  footerLeft: SYSTEM_BRANDING.footerLeft,
  footerRight: SYSTEM_BRANDING.footerRight,
  durationMs: 4300,
  loginDelayMs: 550
});

export const LOGIN_CONFIG = Object.freeze({
  logo: SYSTEM_BRANDING.loginLogo,
  dialogLogo: SYSTEM_BRANDING.dialogLogo,
  brandLabel: SYSTEM_BRANDING.brandLabel,
  registeredMark: SYSTEM_BRANDING.registeredMark,
  welcomeDurationMs: 1900,
  welcomeFadeMs: 360,
  powerDialogFadeMs: 720
});
