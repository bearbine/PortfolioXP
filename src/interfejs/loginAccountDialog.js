// Dialog tworzenia konta na ekranie logowania.
// Troche formularza, troche walidacji, bez robienia z tego osobnej podstrony.
import { AVATARS, getAvatar } from "../konfiguracja/assets.js";
import { createButton, createElement, createImage } from "../rdzen/dom.js";

// Dialog rejestracji ma własna walidacje, ale backend i tak sprawdza wszystko drugi raz.
export function utworzOknoKontaLogowania({ serwisAutoryzacji, magazynProfili, menedzerDzwieku, onCreated, onClose }) {
  const state = {
    avatarId: AVATARS[0]?.id || "guest"
  };

  const overlay = createElement("div", { className: "login-account-overlay" });
  const error = createElement("div", { className: "login-account-form-blad", attrs: { role: "alert" } });

  const displayNameInput = createElement("input", {
    type: "text",
    attrs: {
      id: "login-account-display-name",
      maxlength: "32",
      autocomplete: "off",
      placeholder: "User"
    }
  });

  const loginNameInput = createElement("input", {
    type: "text",
    attrs: {
      id: "login-account-login-name",
      maxlength: "42",
      autocomplete: "off",
      placeholder: "user"
    }
  });

  const passwordToggle = createElement("input", {
    type: "checkbox",
    checked: true,
    attrs: {
      id: "login-account-password-toggle",
      "aria-describedby": "login-account-password-toggle-text"
    }
  });

  const passwordInput = createElement("input", {
    type: "password",
    attrs: {
      id: "login-account-password",
      maxlength: "64",
      autocomplete: "new-password"
    }
  });

  const passwordRepeatInput = createElement("input", {
    type: "password",
    attrs: {
      id: "login-account-password-repeat",
      maxlength: "64",
      autocomplete: "new-password"
    }
  });

  const passwordGroup = createElement("div", { className: "login-account-password" }, [
    createElement("label", { text: "Password", attrs: { for: "login-account-password" } }),
    passwordInput,
    createElement("label", { text: "Confirm password", attrs: { for: "login-account-password-repeat" } }),
    passwordRepeatInput
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
    overlay.classList.remove("is-visible");
    window.setTimeout(() => {
      overlay.remove();
      onClose?.();
    }, 180);
  };

  const fakeWindowButton = (label, title) => {
    const button = createElement("button", {
      type: "button",
      className: "login-account-titlebar-przycisk is-disabled",
      text: label,
      attrs: { title, "aria-disabled": "true" }
    });
    button.addEventListener("click", (event) => {
      event.preventDefault();
      menedzerDzwieku.play("click", { volume: 0.18 });
    });
    return button;
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

  const passwordToggleRow = createElement("div", { className: "login-account-checkbox" }, [
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
      createButton("X", "login-avatar-picker-close", closeAvatarPicker, { "aria-label": "Close picture chooser" })
    ]),
    createElement("div", { className: "login-avatar-picker-body" }, [
      createElement("p", { className: "login-avatar-picker-help", text: "Select a picture for this account." }),
      avatarPickerGrid
    ])
  ]);

  openAvatarPickerButton.addEventListener("click", () => {
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
    if (enabled) {
      window.setTimeout(() => passwordInput.focus(), 0);
    } else {
      passwordInput.value = "";
      passwordRepeatInput.value = "";
    }
  });

  passwordInput.disabled = false;
  passwordRepeatInput.disabled = false;

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

  const windowElement = createElement("section", {
    className: "login-account-window",
    attrs: { role: "dialog", "aria-label": "Create a new account" }
  }, [
    createElement("div", { className: "login-account-titlebar" }, [
      createElement("span", { className: "login-account-titlebar-tytul", text: "Create a new account" }),
      createElement("div", { className: "login-account-titlebar-przyciski" }, [
        fakeWindowButton("_", "Minimize is locked in this window"),
        fakeWindowButton("[]", "Maximize is locked in this window"),
        createButton("X", "login-account-titlebar-przycisk", close, { "aria-label": "Close" })
      ])
    ]),
    form,
    avatarPicker
  ]);

  overlay.append(windowElement);
  window.requestAnimationFrame(() => overlay.classList.add("is-visible"));
  window.setTimeout(() => displayNameInput.focus(), 0);

  return {
    element: overlay,
    close
  };
}
