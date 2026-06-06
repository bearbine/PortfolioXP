// Boot screen.
// Tu zaczyna sie caly klimat projektu, dlatego teksty i timingi sa trzymane dość ostroznie.
import { ASSETS } from "../konfiguracja/assets.js";
import { BOOT_CONFIG } from "../konfiguracja/system.js";
import { createElement, createImage } from "../rdzen/dom.js";

const MOBILE_BOOT_QUERY = "(max-width: 760px)";

function getBootMode() {
  return window.matchMedia(MOBILE_BOOT_QUERY).matches ? "phone" : "desktop";
}

function createBootLogo(src) {
  const image = createImage(src, "Windows XP boot logo", "boot-logo-obraz");

  return createElement("div", { className: "boot-logo" }, [image]);
}

function createBootProgress() {
  return createElement("div", { className: "boot-progress", attrs: { "aria-label": "Loading" } }, [
    createElement("div", { className: "boot-progress-tor" }, [
      createElement("div", { className: "boot-progress-klocek" })
    ])
  ]);
}

// Render boot screena dostaje callback onComplete, bo po animacji musi ruszyc kolejny ekran.
export function renderujEkranStartowy({ assets = ASSETS, onComplete, config = BOOT_CONFIG }) {
  const mode = getBootMode();
  const logoSrc = config.logo || assets.branding.xpProductLogoHq;

  const root = createElement("section", {
    className: `boot-screen boot-screen-${mode}`,
    attrs: {
      "aria-label": "Boot screen",
      "data-screen-mode": mode
    }
  });

  const center = createElement("div", { className: "boot-screen-centrum" }, [
    createBootLogo(logoSrc),
    createBootProgress()
  ]);

  const footerNodes = [];

  if (config.footerLeft) {
    footerNodes.push(createElement("p", {
      className: "boot-screen-stopka boot-screen-stopka-lewa",
      text: config.footerLeft
    }));
  }

  if (config.footerRight) {
    footerNodes.push(createElement("p", {
      className: "boot-screen-stopka boot-screen-stopka-prawa"
    }, [
      createElement("span", { className: "boot-stopka-brand", text: config.footerRight.replace(/®/g, "") }),
      createElement("sup", { className: "boot-stopka-znak", text: "®" })
    ]));
  }

  root.append(center, ...footerNodes);

  const completeTimer = window.setTimeout(() => {
    root.classList.add("is-complete");
    window.setTimeout(onComplete, config.loginDelayMs);
  }, config.durationMs);

  return {
    element: root,
    dispose: () => {
      window.clearTimeout(completeTimer);
    }
  };
}
