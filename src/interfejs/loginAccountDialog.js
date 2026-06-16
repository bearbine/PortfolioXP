// Dialog tworzenia konta na ekranie logowania.
// Troche formularza, troche walidacji, bez robienia z tego osobnej podstrony.
import { ASSETS, AVATARS, getAvatar } from "../konfiguracja/assets.js";
import { SYSTEM_BRANDING } from "../konfiguracja/system.js";
import { createButton, createElement, createImage } from "../rdzen/dom.js";
import { utworzKontrolkiOkna } from "./kontrolkiOkna.js";

function ustawWidocznoscHasla(input, button, widoczne) {
  input.type = widoczne ? "text" : "password";
  button.classList.toggle("is-visible", widoczne);
  button.setAttribute("aria-pressed", String(widoczne));
  button.setAttribute("aria-label", widoczne ? "Hide password" : "Show password");
}

function utworzPoleHaslaZPodgladem({ id, autocomplete }) {
  const input = createElement("input", {
    type: "password",
    className: "login-account-password-input",
    attrs: {
      id,
      maxlength: "64",
      autocomplete
    }
  });

  const button = createElement("button", {
    type: "button",
    className: "login-account-password-reveal",
    attrs: {
      "aria-label": "Show password",
      "aria-pressed": "false"
    }
  });

  button.addEventListener("click", (event) => {
    event.preventDefault();
    ustawWidocznoscHasla(input, button, input.type !== "text");
    window.setTimeout(() => input.focus(), 0);
  });

  const wrapper = createElement("div", {
    className: "login-account-password-field"
  }, [input, button]);

  return {
    wrapper,
    input,
    button,
    ukryjPodglad: () => ustawWidocznoscHasla(input, button, false)
  };
}

function ograniczPozycjeOkna(left, top, width, height) {
  const margines = 8;
  const maxLeft = Math.max(margines, window.innerWidth - width - margines);
  const maxTop = Math.max(margines, window.innerHeight - height - margines);
  return {
    left: Math.min(Math.max(left, margines), maxLeft),
    top: Math.min(Math.max(top, margines), maxTop)
  };
}

// Dialog rejestracji ma własna walidacje, ale backend i tak sprawdza wszystko drugi raz.
export function utworzOknoKontaLogowania({ serwisAutoryzacji, magazynProfili, menedzerDzwieku, onCreated, onClose }) {
  const state = {
    avatarId: AVATARS[0]?.id || "guest"
  };
  let czyZamkniete = false;
  let windowElement = null;

  const overlay = createElement("div", { className: "login-account-overlay" });
  const error = createElement("div", { className: "login-account-form-blad", attrs: { role: "alert" } });

  const displayNameInput = createElement("input", {
    type: "text",
    attrs: {
      id: "login-account-display-name",
      maxlength: "32",
      autocomplete: "off",
      placeholder: "Roman Kozar"
    }
  });

  const loginNameInput = createElement("input", {
    type: "text",
    attrs: {
      id: "login-account-login-name",
      maxlength: "42",
      autocomplete: "off",
      placeholder: "jujbnm"
    }
  });

  const passwordToggle = createElement("input", {
    type: "checkbox",
    checked: false,
    attrs: {
      id: "login-account-password-toggle",
      "aria-describedby": "login-account-password-toggle-text"
    }
  });

  const passwordField = utworzPoleHaslaZPodgladem({
    id: "login-account-password",
    autocomplete: "new-password"
  });
  const passwordRepeatField = utworzPoleHaslaZPodgladem({
    id: "login-account-password-repeat",
    autocomplete: "new-password"
  });
  const passwordInput = passwordField.input;
  const passwordRepeatInput = passwordRepeatField.input;

  const passwordGroup = createElement("div", { className: "login-account-password is-hidden" }, [
    createElement("label", { text: "Password", attrs: { for: "login-account-password" } }),
    passwordField.wrapper,
    createElement("label", { text: "Confirm password", attrs: { for: "login-account-password-repeat" } }),
    passwordRepeatField.wrapper
  ]);

  const brandPanel = createElement("div", { className: "login-account-brand-panel" }, [
    createElement("div", {
      className: "login-account-brand-logo",
      attrs: { "aria-label": "Windows XP" }
    }, [
      createImage(ASSETS.login.accountDialogLogo, "", "login-account-brand-flag"),
      createElement("div", { className: "login-account-brand-text" }, [
        createImage(ASSETS.login.accountDialogWordmark, "Windows XP", "login-account-brand-wordmark")
      ])
    ]),
    createElement("div", { className: "login-account-brand-left", text: SYSTEM_BRANDING.footerLeft }),
    createElement("div", { className: "login-account-brand-right" }, [
      createElement("span", {
        className: "login-account-brand-right-text",
        text: SYSTEM_BRANDING.footerRight.replace(/®/g, "")
      }),
      createElement("sup", {
        className: "login-account-brand-right-mark",
        text: SYSTEM_BRANDING.registeredMark
      })
    ])
  ]);

  const avatarPreview = createImage(getAvatar(state.avatarId).path, "", "login-account-avatar-preview-obraz");
  const avatarPickerGrid = createElement("div", {
    className: "login-account-avatar-grid",
    attrs: { role: "listbox", "aria-label": "Choose account picture" }
  });

  const closeAvatarPicker = () => {
    avatarPicker.classList.remove("is-open");
  };

  const avatarButtons = AVATARS.map((avatar) => {
    const button = createElement("button", {
      type: "button",
      className: avatar.id === state.avatarId ? "login-account-avatar is-selected" : "login-account-avatar",
      attrs: {
        "aria-label": avatar.label,
        "aria-selected": avatar.id === state.avatarId ? "true" : "false"
      }
    }, [
      createImage(avatar.path, "", ""),
      createElement("span", { className: "login-account-avatar-nazwa", text: avatar.label })
    ]);

    button.addEventListener("click", () => {
      state.avatarId = avatar.id;
      avatarPreview.src = avatar.path;
      for (const item of avatarButtons) {
        item.classList.remove("is-selected");
        item.setAttribute("aria-selected", "false");
      }
      button.classList.add("is-selected");
      button.setAttribute("aria-selected", "true");
      menedzerDzwieku.play("select", { volume: 0.25 });
      closeAvatarPicker();
    });

    return button;
  });

  avatarPickerGrid.append(...avatarButtons);

  const close = () => {
    if (czyZamkniete) {
      return;
    }
    czyZamkniete = true;
    closeAvatarPicker();
    overlay.classList.remove("is-visible");
    window.setTimeout(() => {
      overlay.remove();
      onClose?.();
    }, 180);
  };

  const ustawPozycjeAvatarPickera = () => {
    if (!windowElement) {
      return;
    }
    const rect = windowElement.getBoundingClientRect();
    const pickerWidth = Math.min(340, window.innerWidth - 16);
    const left = Math.min(Math.max(rect.left + 22, 8), window.innerWidth - pickerWidth - 8);
    const top = Math.min(Math.max(rect.top + 82, 8), Math.max(8, window.innerHeight - 290));
    avatarPicker.style.left = `${Math.round(left)}px`;
    avatarPicker.style.top = `${Math.round(top)}px`;
    avatarPicker.style.width = `${Math.round(pickerWidth)}px`;
  };

  const ustawPozycjeOkna = (left, top) => {
    if (!windowElement) {
      return;
    }
    const rect = windowElement.getBoundingClientRect();
    const pozycja = ograniczPozycjeOkna(left, top, rect.width, rect.height);
    windowElement.classList.add("is-dragged");
    windowElement.style.left = `${Math.round(pozycja.left)}px`;
    windowElement.style.top = `${Math.round(pozycja.top)}px`;
    if (avatarPicker.classList.contains("is-open")) {
      ustawPozycjeAvatarPickera();
    }
  };

  const startDragOkna = (event) => {
    if (event.button !== 0 || event.target.closest("button")) {
      return;
    }
    event.preventDefault();
    closeAvatarPicker();
    const rect = windowElement.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const abort = new AbortController();
    const onMove = (moveEvent) => ustawPozycjeOkna(moveEvent.clientX - offsetX, moveEvent.clientY - offsetY);
    const onEnd = () => abort.abort();
    window.addEventListener("pointermove", onMove, { signal: abort.signal });
    window.addEventListener("pointerup", onEnd, { once: true, signal: abort.signal });
  };

  const openAvatarPickerButton = createElement("button", {
    type: "button",
    className: "login-account-avatar-link",
    text: "Change picture..."
  });

  const avatarPanel = createElement("aside", { className: "login-account-avatar-panel" }, [
    createElement("div", { className: "login-account-avatar-preview" }, [
      avatarPreview,
      createElement("span", { text: "Account picture" }),
      openAvatarPickerButton
    ])
  ]);

  const passwordToggleRow = createElement("label", { className: "login-account-checkbox" }, [
    passwordToggle,
    createElement("span", {
      text: "Use password for this account",
      attrs: { id: "login-account-password-toggle-text" }
    })
  ]);

  const form = createElement("form", { className: "login-account-form" }, [
    createElement("div", { className: "login-account-form-tresc" }, [
      avatarPanel,
      createElement("section", { className: "login-account-fields", attrs: { "aria-label": "Account details" } }, [
        createElement("div", { className: "login-account-form-siatka" }, [
          createElement("label", { text: "User name", attrs: { for: "login-account-display-name" } }),
          displayNameInput,
          createElement("label", { text: "Login name", attrs: { for: "login-account-login-name" } }),
          loginNameInput
        ]),
        passwordToggleRow,
        passwordGroup,
        error
      ])
    ]),
    createElement("div", { className: "login-account-form-akcje" }, [
      createButton("Create Account", "xp-button login-account-submit", null, { type: "submit" })
    ])
  ]);
  const submitButton = form.querySelector(".login-account-submit");

  const avatarPicker = createElement("section", {
    className: "login-avatar-picker-window",
    attrs: { role: "dialog", "aria-label": "Choose account picture" }
  }, [
    createElement("div", { className: "login-avatar-picker-titlebar" }, [
      createElement("span", { text: "Choose account picture" }),
      utworzKontrolkiOkna({
        onClose: closeAvatarPicker,
        showMinimize: false,
        showMaximize: false,
        closeLabel: "Close picture chooser",
        closeTitle: "Close"
      })
    ]),
    createElement("div", { className: "login-avatar-picker-body" }, [
      createElement("p", { className: "login-avatar-picker-help", text: "Select a picture for this account." }),
      avatarPickerGrid
    ])
  ]);

  openAvatarPickerButton.addEventListener("click", () => {
    ustawPozycjeAvatarPickera();
    avatarPicker.classList.add("is-open");
    menedzerDzwieku.play("click", { volume: 0.2 });
  });

  avatarPicker.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  passwordToggle.addEventListener("change", () => {
    const enabled = passwordToggle.checked;
    passwordGroup.classList.toggle("is-hidden", !enabled);
    passwordInput.disabled = !enabled;
    passwordRepeatInput.disabled = !enabled;
    passwordField.button.disabled = !enabled;
    passwordRepeatField.button.disabled = !enabled;
    if (enabled) {
      window.setTimeout(() => passwordInput.focus(), 0);
    } else {
      passwordField.ukryjPodglad();
      passwordRepeatField.ukryjPodglad();
    }
  });

  passwordInput.disabled = true;
  passwordRepeatInput.disabled = true;
  passwordField.button.disabled = true;
  passwordRepeatField.button.disabled = true;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";

    const displayName = displayNameInput.value.trim();
    const loginName = loginNameInput.value.trim();
    const passwordRequired = passwordToggle.checked;
    const password = passwordInput.value;
    const passwordRepeat = passwordRepeatInput.value;

    if (!displayName) {
      error.textContent = "Type a user name first.";
      menedzerDzwieku.play("error", { volume: 0.4 });
      displayNameInput.focus();
      return;
    }

    if (passwordRequired) {
      if (!password) {
        error.textContent = "Type a password for this account.";
        menedzerDzwieku.play("error", { volume: 0.4 });
        passwordInput.focus();
        return;
      }

      if (password.length < 4) {
        error.textContent = "Use at least 4 characters for the password.";
        menedzerDzwieku.play("error", { volume: 0.4 });
        passwordInput.focus();
        return;
      }

      if (password !== passwordRepeat) {
        error.textContent = "The passwords do not match.";
        menedzerDzwieku.play("error", { volume: 0.4 });
        passwordRepeatInput.focus();
        return;
      }
    }

    submitButton.disabled = true;
    try {
      const user = await serwisAutoryzacji.register({
        displayName,
        username: displayName,
        login: loginName || displayName,
        password,
        passwordRequired,
        avatarId: state.avatarId
      });
      const profile = magazynProfili.upsertRemoteProfile(user);
      menedzerDzwieku.play("menuCommand", { volume: 0.35 });
      onCreated?.(profile || user);
      close();
    } catch (apiError) {
      error.textContent = apiError.message || "Could not create account. Try another login name.";
      menedzerDzwieku.play("error", { volume: 0.4 });
      submitButton.disabled = false;
    }
  });

  const titlebar = createElement("div", { className: "xp-window-belka login-account-titlebar" }, [
    createElement("div", { className: "xp-window-tytul login-account-titlebar-tytul" }, [
      createImage(ASSETS.login.accountDialogIcon, "", "xp-window-ikona login-account-titlebar-ikona"),
      createElement("span", { text: "Create a new account" })
    ]),
    utworzKontrolkiOkna({
      onMinimize: close,
      onClose: close,
      canMaximize: false,
      minimizeLabel: "Hide",
      minimizeTitle: "Hide"
    })
  ]);

  windowElement = createElement("section", {
    className: "xp-window login-account-window",
    attrs: { role: "dialog", "aria-label": "Create a new account" }
  }, [
    titlebar,
    createElement("div", { className: "xp-window-tresc login-account-tresc" }, [
      brandPanel,
      form
    ])
  ]);

  titlebar.addEventListener("pointerdown", startDragOkna);

  overlay.append(windowElement, avatarPicker);
  window.requestAnimationFrame(() => {
    const rect = windowElement.getBoundingClientRect();
    ustawPozycjeOkna(rect.left, rect.top);
    overlay.classList.add("is-visible");
  });
  window.setTimeout(() => displayNameInput.focus(), 0);

  return {
    element: overlay,
    close
  };
}
