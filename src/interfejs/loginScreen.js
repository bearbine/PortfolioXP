// Ekran logowania.
// Wybiera profil, przyjmuje haslo i odpala realny flow auth przez backend.
import { ASSETS, getAvatar } from "../konfiguracja/assets.js";
import { createButton, createElement, createImage, isInteractiveElement } from "../rdzen/dom.js";
import { LOGIN_CONFIG } from "../konfiguracja/system.js";
import { utworzOknoKontaLogowania } from "./loginAccountDialog.js";
import { otworzOknoZasilania } from "./powerDialog.js";

// Login screen jest duzy, bo ogarnia profile, haslo, dialog konta i power dialog.
export class EkranLogowania {
  constructor({ serwisAutoryzacji, magazynProfili, magazynSesji, menedzerDzwieku, onLogin, onRestart, onShutdown }) {
    this.serwisAutoryzacji = serwisAutoryzacji;
    this.magazynProfili = magazynProfili;
    this.magazynSesji = magazynSesji;
    this.menedzerDzwieku = menedzerDzwieku;
    this.onLogin = onLogin;
    this.onRestart = onRestart;
    this.onShutdown = onShutdown;
    this.wybranyUzytkownikId = magazynSesji.getSession().lastUserId || "admin";
    this.aktywnyDymek = null;
    this.timerAktywnegoDymka = null;
    this.czyTrwaLogowanie = false;
    this.root = createElement("section", { className: "login-screen", attrs: { "aria-label": "Windows XP login" } });
    this.render();
  }

  render() {
    this.hideLoginBalloon();
    this.root.replaceChildren();
    const centerRight = createElement("div", { className: "login-screen-prawa" });
    this.listaProfili = createElement("div", { className: "login-profiles" });
    this.listaProfili.addEventListener("scroll", () => this.hideLoginBalloon());
    const accountActions = createElement("div", { className: "login-account-actions" }, [
      createElement("button", {
        type: "button",
        className: "login-create-account",
        text: "Create a new account"
      })
    ]);
    centerRight.append(this.listaProfili, accountActions);

    this.warstwaPowiadomien = createElement("div", {
      className: "login-notification-layer",
      attrs: { "aria-live": "polite", "aria-atomic": "true" }
    });

    this.root.append(
      createElement("div", { className: "login-screen-naglowek" }),
      createElement("div", { className: "login-screen-pasek-gorny" }),
      createElement("main", { className: "login-screen-centrum" }, [
        createElement("div", { className: "login-screen-lewa" }, [
          this.createLoginBrand(),
          createElement("p", { text: "To begin, click your user name" })
        ]),
        createElement("div", { className: "login-screen-podzial" }),
        centerRight
      ]),
      createElement("div", { className: "login-screen-pasek-dolny" }),
      createElement("footer", { className: "login-screen-stopka" }, [
        createElement("button", { type: "button", className: "login-power", attrs: { "aria-label": "Turn off computer", title: "Turn off computer" } }, [
          createImage(ASSETS.login.shutdownButton, "", "login-power-ikona")
        ]),
        createElement("p", { className: "login-bug-report" }, [
          "If you found a bug and you are a good samaritan, please report it on the official ",
          createElement("a", {
            text: "GitHub repository",
            attrs: {
              href: "https://github.com/Bearbine/PortfolioXP",
              target: "_blank",
              rel: "noopener noreferrer"
            }
          }),
          "."
        ])
      ]),
      this.warstwaPowiadomien
    );
    this.root.querySelector(".login-power").addEventListener("click", () => this.otworzOknoZasilania());
    this.root.querySelector(".login-create-account").addEventListener("click", () => this.openAccountDialog());
    this.renderProfiles();
  }

  createLoginBrand() {
    return createElement("div", { className: "login-brand" }, [
      createImage(LOGIN_CONFIG.logo || ASSETS.branding.xpProductLogoHq, "Windows XP", "login-brand-obraz")
    ]);
  }

  renderProfiles() {
    this.hideLoginBalloon();
    this.listaProfili.replaceChildren();
    const profiles = this.magazynProfili.getProfiles();
    if (!profiles.some((profile) => profile.id === this.wybranyUzytkownikId)) {
      this.wybranyUzytkownikId = profiles[0]?.id || "admin";
    }

    for (const profile of profiles) {
      const selected = profile.id === this.wybranyUzytkownikId;
      const tile = createElement("article", {
        className: selected ? "login-profile login-profile-karta is-selected" : "login-profile login-profile-karta",
        dataset: { userId: profile.id }
      });
      const avatar = getAvatar(profile.avatarId);
      const details = createElement("div", { className: "login-profile-szczegoly" }, [
        createElement("h2", { text: profile.displayName }),
        createElement("p", { text: profile.role })
      ]);
      tile.append(
        createImage(avatar.path, "", "login-profile-avatar"),
        details
      );
      tile.addEventListener("click", (event) => {
        if (isInteractiveElement(event.target)) {
          return;
        }
        if (this.wybranyUzytkownikId === profile.id) {
          return;
        }
        this.wybranyUzytkownikId = profile.id;
        this.hideLoginBalloon();
        this.menedzerDzwieku.play("select", { volume: 0.25 });
        this.renderProfiles();
      });
      tile.addEventListener("dblclick", () => {
        if (!profile.passwordRequired) {
          void this.tryLogin(profile, "");
        }
      });
      if (selected) {
        tile.append(this.createPasswordArea(profile));
      }
      this.listaProfili.append(tile);
    }
  }

  createPasswordArea(profile) {
    const group = createElement("form", { className: "login-password" });
    group.addEventListener("click", (event) => event.stopPropagation());

    if (profile.passwordRequired) {
      const input = createElement("input", {
        type: "password",
        attrs: { "aria-label": "Password", autocomplete: "off" }
      });
      const submit = createElement("button", { type: "submit", className: "login-password-dalej", attrs: { "aria-label": "Log on" } }, [
        createImage(ASSETS.login.goButton, "", "")
      ]);
      const hintButton = createElement("button", { type: "button", className: "login-password-podpowiedz", attrs: { "aria-label": "Show password hint" } }, [
        createImage(ASSETS.login.hintButton || ASSETS.icons.help, "", "")
      ]);

      hintButton.addEventListener("click", (event) => {
        event.preventDefault();
        const hint = profile.passwordHint || "No password hint was set for this account.";
        this.menedzerDzwieku.play("menuCommand", { volume: 0.28 });
        this.showLoginBalloon({
          type: "hint",
          title: "Password hint",
          message: hint,
          icon: ASSETS.login.hintButton || ASSETS.icons.help,
          anchor: hintButton
        });
      });

      input.addEventListener("input", () => this.hideLoginBalloon("error"));
      input.addEventListener("focus", () => this.hideLoginBalloon("hint"));

      group.append(
        createElement("div", { className: "login-password-wiersz" }, [input, submit, hintButton])
      );
      window.setTimeout(() => input.focus(), 0);
      group.addEventListener("submit", (event) => {
        event.preventDefault();
        void this.tryLogin(profile, input.value, input);
      });
    } else {
      group.append(
        createButton("Log on", "login-password-przycisk", () => void this.tryLogin(profile, ""))
      );
    }
    return group;
  }

  showLoginBalloon({ type = "info", title, message, icon, anchor }) {
    if (!this.warstwaPowiadomien || !anchor) {
      return;
    }

    this.hideLoginBalloon();

    const typeClass = type === "hint"
      ? "login-balloon-podpowiedz"
      : type === "error"
        ? "login-balloon-blad"
        : `login-balloon-${type}`;

    const balloon = createElement("div", {
      className: ["login-balloon", typeClass],
      attrs: { role: "status" }
    }, [
      createImage(icon, "", "login-balloon-ikona"),
      createElement("div", { className: "login-balloon-tekst" }, [
        createElement("strong", { text: title }),
        createElement("span", { text: message })
      ])
    ]);

    this.warstwaPowiadomien.append(balloon);

    const anchorRect = anchor.getBoundingClientRect();
    const width = balloon.offsetWidth;
    const viewportPadding = 10;
    const targetCenterX = anchorRect.left + (anchorRect.width / 2);
    const preferredLeft = type === "hint"
      ? anchorRect.right - width + 28
      : anchorRect.left;
    const left = Math.max(viewportPadding, Math.min(preferredLeft, window.innerWidth - width - viewportPadding));
    const top = anchorRect.bottom + 13;

    balloon.classList.add("is-below-anchor");

    const arrowLeft = Math.max(22, Math.min(targetCenterX - left - 8, width - 34));
    balloon.style.left = `${Math.round(left)}px`;
    balloon.style.top = `${Math.round(top)}px`;
    balloon.style.setProperty("--balloon-arrow-left", `${Math.round(arrowLeft)}px`);

    this.aktywnyDymek = { element: balloon, type };
    window.requestAnimationFrame(() => balloon.classList.add("is-visible"));
    this.timerAktywnegoDymka = window.setTimeout(() => this.hideLoginBalloon(type), 3000);
  }

  hideLoginBalloon(type = null) {
    if (!this.aktywnyDymek) {
      return;
    }
    if (type && this.aktywnyDymek.type !== type) {
      return;
    }

    if (this.timerAktywnegoDymka) {
      window.clearTimeout(this.timerAktywnegoDymka);
      this.timerAktywnegoDymka = null;
    }

    const { element } = this.aktywnyDymek;
    this.aktywnyDymek = null;
    element.classList.remove("is-visible");
    element.classList.add("is-hiding");
    window.setTimeout(() => element.remove(), 240);
  }

  // Tutaj zaczyna sie realny login flow. Jak sie uda, backend da redirect do callbacka.
  async tryLogin(profile, password, errorAnchor = null) {
    if (this.czyTrwaLogowanie) {
      return;
    }
    this.czyTrwaLogowanie = true;
    this.root.classList.add("is-authenticating");

    try {
      const redirectTo = await this.serwisAutoryzacji.login({
        profileId: profile.id,
        password
      });
      this.hideLoginBalloon();
      this.serwisAutoryzacji.redirectToCallback(redirectTo);
    } catch (apiError) {
      this.menedzerDzwieku.play("error");
      this.showLoginBalloon({
        type: "error",
        title: apiError.status === 0 ? "Logon server unavailable" : "Unable to log on",
        message: apiError.message || "Please type your password again. Be sure to use the correct uppercase and lowercase letters.",
        icon: ASSETS.login.error,
        anchor: errorAnchor || this.root.querySelector(`[data-user-id=\"${profile.id}\"]`)
      });
    } finally {
      this.czyTrwaLogowanie = false;
      this.root.classList.remove("is-authenticating");
    }
  }

  openAccountDialog() {
    if (this.root.querySelector(".login-account-overlay")) {
      return;
    }

    this.hideLoginBalloon();
    this.menedzerDzwieku.play("menuCommand", { volume: 0.35 });
    const dialog = utworzOknoKontaLogowania({
      serwisAutoryzacji: this.serwisAutoryzacji,
      magazynProfili: this.magazynProfili,
      menedzerDzwieku: this.menedzerDzwieku,
      onCreated: (profile) => {
        this.wybranyUzytkownikId = profile.id;
        this.renderProfiles();
      }
    });
    this.root.append(dialog.element);
  }

  otworzOknoZasilania() {
    this.hideLoginBalloon();
    otworzOknoZasilania({
      mode: "turn-off",
      assets: ASSETS,
      menedzerDzwieku: this.menedzerDzwieku,
      onStandBy: () => this.onShutdown("standby"),
      onTurnOff: () => this.onShutdown("poweroff"),
      onRestart: () => this.onRestart()
    });
  }

}
