// Główny plik frontendu.
// Spina boot, login, callback, welcome i desktop. Jak cos nie przechodzi miedzy ekranami, to zaczynam tutaj.
import { ASSETS } from "./konfiguracja/assets.js";
import { MagazynProfili } from "./stan/profileStore.js";
import { MagazynSesji } from "./stan/sessionStore.js";
import { SerwisAutoryzacji } from "./rdzen/authService.js";
import { SynchronizacjaSesji } from "./rdzen/sessionSync.js";
import { MenedzerDzwieku } from "./rdzen/soundManager.js";
import { clearNode, createElement } from "./rdzen/dom.js";
import { utworzRejestrAplikacji } from "./aplikacje/appRegistry.js";
import { renderujEkranStartowy } from "./interfejs/bootScreen.js";
import { renderujEkranPowitania } from "./interfejs/welcomeScreen.js";
import { renderujEkranCallbackAutoryzacji } from "./interfejs/authCallbackScreen.js";
import { EkranLogowania } from "./interfejs/loginScreen.js";
import { PulpitSystemu } from "./interfejs/desktopShell.js";
import { otworzOknoZasilania } from "./interfejs/powerDialog.js";
import { SYSTEM_TRANSITION } from "./konfiguracja/system.js";

const korzenAplikacji = document.getElementById("app");
const magazynProfili = new MagazynProfili();
const magazynSesji = new MagazynSesji();
const serwisAutoryzacji = new SerwisAutoryzacji({
  magazynSesji,
  apiBaseUrl: globalThis.PORTFOLIO_XP_API_BASE_URL || ""
});
const synchronizacjaSesji = new SynchronizacjaSesji();
const menedzerDzwieku = new MenedzerDzwieku(ASSETS.sounds);

let obecnyUzytkownikId = magazynSesji.getSession().obecnyUzytkownikId;
let obecnyEkran = null;
let pulpitSystemu = null;
let timerRestartu = null;
let sprawdzanieSesjiWToku = null;
let ostatnieSprawdzenieSesji = 0;
const MIN_ODSTEP_SPRAWDZENIA_SESJI_MS = 2500;

const uslugi = {
  assets: ASSETS,
  magazynProfili,
  magazynSesji,
  serwisAutoryzacji,
  menedzerDzwieku,
  menedzerOkien: null,
  getCurrentUserId: () => obecnyUzytkownikId || magazynSesji.getSession().lastUserId || "guest",
  openApp: () => null,
  zastosujObecneUstawienia,
  odswiezPowloke
};

const rejestrAplikacji = utworzRejestrAplikacji(uslugi);
uslugi.rejestrAplikacji = rejestrAplikacji;

window.addEventListener("popstate", () => {
  void start();
});

synchronizacjaSesji.addEventListener("logout", (event) => {
  void obsluzZdalneWylogowanie(event.detail?.reason || "remote_logout");
});

synchronizacjaSesji.addEventListener("session-change", (event) => {
  void obsluzZdalnaZmianeSesji(event.detail || {});
});

synchronizacjaSesji.addEventListener("session-check", () => {
  void sprawdzAktywnaSesje({ force: true, reason: "remote_session_check" });
});

window.addEventListener("focus", () => {
  void sprawdzAktywnaSesje({ reason: "window_focus" });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    void sprawdzAktywnaSesje({ reason: "visibilitychange" });
  }
});

void start();

// Główny router frontendu. Nie mamy klasycznego SPA routera, wiec trzymam to tutaj.
async function start() {
  await odswiezZdalneProfile();

  const path = normalizujTrase(window.location.pathname);
  if (path === "/auth/callback") {
    void pokazCallbackAutoryzacji();
    return;
  }

  if (path === "/login") {
    void pokazLogowanie();
    return;
  }

  if (path === "/welcome") {
    const user = await sprawdzObecnaSesje();
    if (user) {
      magazynProfili.upsertRemoteProfile(user);
      zalogujUzytkownika(user.id, { replaceRoute: true });
      return;
    }
    przekierujDoLogowania();
    return;
  }

  if (path === "/desktop") {
    const user = await sprawdzObecnaSesje();
    if (user) {
      magazynProfili.upsertRemoteProfile(user);
      przywrocPulpit(user.id, { replaceRoute: true });
      return;
    }
    przekierujDoLogowania();
    return;
  }

  const session = magazynSesji.getSession();
  if (magazynSesji.isRestorableDesktop()) {
    const user = await sprawdzObecnaSesje(session.obecnyUzytkownikId);
    if (user) {
      magazynProfili.upsertRemoteProfile(user);
      przywrocPulpit(user.id, { replaceRoute: true });
      return;
    }
    przekierujDoLogowania();
    return;
  }

  if (session.phase === "login") {
    przekierujDoLogowania();
    return;
  }

  boot();
}

// Boot jest tylko poczatkiem flow. Po nim user laduje na loginie.
function boot() {
  wyczyscTimerRestartu();
  wyczyscEkran();
  magazynSesji.startBoot();
  menedzerDzwieku.play("startup", {
    volume: 0.45,
    group: SYSTEM_TRANSITION.soundGroup,
    exclusive: true,
    exclusiveFadeMs: SYSTEM_TRANSITION.soundFadeMs
  });
  obecnyEkran = renderujEkranStartowy({
    assets: ASSETS,
    onComplete: () => {
      przejdzDo("/login", { replace: true });
      void pokazLogowanie();
    }
  });
  korzenAplikacji.append(obecnyEkran.element);
}

// Login screen odświeża profile i dopiero potem renderuje UI.
async function pokazLogowanie() {
  przejdzDo("/login", { replace: true });
  wyczyscEkran();
  obecnyUzytkownikId = null;
  uslugi.menedzerOkien = null;
  magazynSesji.setPhase("login");
  await odswiezZdalneProfile();
  const login = new EkranLogowania({
    serwisAutoryzacji,
    magazynProfili,
    magazynSesji,
    menedzerDzwieku,
    onLogin: zalogujUzytkownika,
    onRestart: restart,
    onShutdown: wylaczKomputer
  });
  obecnyEkran = { element: login.root, dispose: () => {} };
  korzenAplikacji.append(login.root);
}

// Po udanym auth zapisuje minimum stanu i pokazuje welcome, nie skacze od razu na pulpit.
function zalogujUzytkownika(userId, { replaceRoute = true } = {}) {
  obecnyUzytkownikId = userId;
  menedzerDzwieku.setEnabled(magazynProfili.getSettings(userId).soundsEnabled);
  magazynSesji.startWelcome(userId);
  pokazPowitanie(userId, { replaceRoute });
}

function pokazPowitanie(userId, { replaceRoute = true } = {}) {
  przejdzDo("/welcome", { replace: replaceRoute });
  const profile = magazynProfili.getProfile(userId);
  if (!profile) {
    pokazLogowanie();
    return;
  }
  wyczyscEkran();
  menedzerDzwieku.play("logon", {
    volume: 0.5,
    group: SYSTEM_TRANSITION.soundGroup,
    exclusive: true,
    exclusiveFadeMs: SYSTEM_TRANSITION.soundFadeMs
  });
  obecnyEkran = renderujEkranPowitania({
    profile,
    onComplete: () => {
      magazynSesji.startDesktop(userId);
      przejdzDo("/desktop", { replace: true });
      pokazPulpit();
    }
  });
  korzenAplikacji.append(obecnyEkran.element);
}

// Przywracanie pulpitu odpala desktop shell i podpina wszystkie uslugi.
function przywrocPulpit(userId, { replaceRoute = true } = {}) {
  przejdzDo("/desktop", { replace: replaceRoute });
  obecnyUzytkownikId = userId;
  magazynSesji.startDesktop(userId);
  menedzerDzwieku.setEnabled(magazynProfili.getSettings(userId).soundsEnabled);
  pokazPulpit();
}

function pokazPulpit() {
  przejdzDo("/desktop", { replace: true });
  wyczyscEkran();
  pulpitSystemu = new PulpitSystemu({
    rejestrAplikacji,
    uslugi,
    callbacks: {
      onLogoff: wyloguj,
      onShutdown: pokazOknoWylaczania,
      onRestart: restart
    }
  });
  obecnyEkran = pulpitSystemu;
  korzenAplikacji.append(pulpitSystemu.element);
  zastosujObecneUstawienia();
  void sprawdzAktywnaSesje({ force: true, reason: "desktop_mount" });
}

function pokazOknoWylaczania() {
  otworzOknoZasilania({
    mode: "turn-off",
    assets: ASSETS,
    menedzerDzwieku,
    onStandBy: () => wylaczKomputer("standby"),
    onTurnOff: () => wylaczKomputer("poweroff"),
    onRestart: restart
  });
}


function wyloguj(reason = "wyloguj") {
  void wykonajWylogowanie({
    reason,
    playSound: "wyloguj",
    afterLogout: () => pokazLogowanie()
  });
}

function restart() {
  przejdzDo("/", { replace: true });
  wyczyscTimerRestartu();
  wyczyscEkran();
  obecnyUzytkownikId = null;
  uslugi.menedzerOkien = null;
  sprawdzanieSesjiWToku = null;
  magazynSesji.startBoot();
  menedzerDzwieku.play("wylaczKomputer", {
    volume: 0.35,
    group: SYSTEM_TRANSITION.soundGroup,
    exclusive: true,
    exclusiveFadeMs: SYSTEM_TRANSITION.soundFadeMs
  });
  void wykonajWylogowanie({
    reason: "restart",
    broadcast: true,
    clearSession: false,
    afterLogout: () => {
      timerRestartu = window.setTimeout(() => {
        timerRestartu = null;
        boot();
      }, SYSTEM_TRANSITION.restartBootDelayMs);
    }
  });
}

function wylaczKomputer(mode = "poweroff") {
  pokazWylaczonyEkran(mode);
}

function pokazWylaczonyEkran(reason = "poweroff") {
  przejdzDo("/", { replace: true });
  wyczyscTimerRestartu();
  wyczyscEkran();
  obecnyUzytkownikId = null;
  uslugi.menedzerOkien = null;
  sprawdzanieSesjiWToku = null;
  magazynSesji.wylaczKomputer();
  menedzerDzwieku.play("wylaczKomputer", {
    volume: 0.45,
    group: SYSTEM_TRANSITION.soundGroup,
    exclusive: true,
    exclusiveFadeMs: SYSTEM_TRANSITION.soundFadeMs
  });
  void wykonajWylogowanie({ reason, broadcast: true, clearSession: false });

  const root = createElement("section", {
    className: "powered-off-screen",
    attrs: { "aria-label": "Computer is off" }
  });
  obecnyEkran = { element: root, dispose: () => {} };
  korzenAplikacji.append(root);
}

async function wykonajWylogowanie({ reason = "logout", playSound = null, broadcast = true, clearSession = true, afterLogout = null } = {}) {
  if (playSound === "wyloguj") {
    menedzerDzwieku.play("wyloguj", {
      volume: 0.5,
      group: SYSTEM_TRANSITION.soundGroup,
      exclusive: true,
      exclusiveFadeMs: SYSTEM_TRANSITION.soundFadeMs
    });
  }

  await serwisAutoryzacji.logout();
  if (clearSession) {
    magazynSesji.clearCurrentUser();
  }
  obecnyUzytkownikId = null;
  uslugi.menedzerOkien = null;
  sprawdzanieSesjiWToku = null;

  if (broadcast) {
    synchronizacjaSesji.broadcastLogout({ reason });
  }

  if (typeof afterLogout === "function") {
    await afterLogout();
  }
}

async function obsluzZdalneWylogowanie(reason = "remote_logout") {
  if (normalizujTrase(window.location.pathname) === "/login") {
    serwisAutoryzacji.clear();
    magazynSesji.clearCurrentUser();
    obecnyUzytkownikId = null;
    uslugi.menedzerOkien = null;
    return;
  }

  serwisAutoryzacji.clear();
  magazynSesji.clearCurrentUser();
  obecnyUzytkownikId = null;
  uslugi.menedzerOkien = null;
  sprawdzanieSesjiWToku = null;
  przejdzDo("/login", { replace: true });
  await pokazLogowanie();
}

async function obsluzZdalnaZmianeSesji({ userId = null, reason = "remote_session_change" } = {}) {
  try {
    const user = await serwisAutoryzacji.me();
    if (!user) {
      await obsluzZdalneWylogowanie(reason);
      return false;
    }

    magazynProfili.upsertRemoteProfile(user);
    const path = normalizujTrase(window.location.pathname);
    const activeUserChanged = obecnyUzytkownikId !== user.id;

    if (path === "/desktop" || path === "/welcome" || path === "/login") {
      if (activeUserChanged || path === "/login") {
        zalogujUzytkownika(user.id, { replaceRoute: true });
      } else {
        odswiezPowloke();
      }
    }

    return true;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      await obsluzZdalneWylogowanie(reason);
      return false;
    }
    return true;
  }
}

// Sprawdzanie sesji ma throttle, bo focus i visibility potrafia spamowac backend.
async function sprawdzAktywnaSesje({ force = false, reason = "session_check" } = {}) {
  const path = normalizujTrase(window.location.pathname);
  if (path !== "/desktop" && path !== "/welcome") {
    return true;
  }

  const now = Date.now();
  if (!force && now - ostatnieSprawdzenieSesji < MIN_ODSTEP_SPRAWDZENIA_SESJI_MS) {
    return true;
  }
  ostatnieSprawdzenieSesji = now;

  if (sprawdzanieSesjiWToku) {
    return sprawdzanieSesjiWToku;
  }

  sprawdzanieSesjiWToku = (async () => {
    try {
      const user = await serwisAutoryzacji.me();
      if (!user) {
        await obsluzZdalneWylogowanie(reason);
        return false;
      }
      magazynProfili.upsertRemoteProfile(user);
      if ((path === "/desktop" || path === "/welcome") && obecnyUzytkownikId && user.id !== obecnyUzytkownikId) {
        await obsluzZdalnaZmianeSesji({ userId: user.id, reason: "session_user_changed" });
      }
      return true;
    } catch (error) {
      if (error?.status === 401 || error?.status === 403) {
        await obsluzZdalneWylogowanie(reason);
        return false;
      }
      // Do not kick the user out for a temporary network/server hiccup.
      return true;
    } finally {
      sprawdzanieSesjiWToku = null;
    }
  })();

  return sprawdzanieSesjiWToku;
}

function zastosujObecneUstawienia() {
  if (pulpitSystemu) {
    pulpitSystemu.applySettings();
  }
}

function odswiezPowloke() {
  if (pulpitSystemu) {
    pulpitSystemu.refresh();
  }
}

function wyczyscEkran() {
  if (obecnyEkran?.dispose) {
    obecnyEkran.dispose();
  }
  pulpitSystemu = null;
  clearNode(korzenAplikacji);
}

function wyczyscTimerRestartu() {
  if (!timerRestartu) {
    return;
  }
  window.clearTimeout(timerRestartu);
  timerRestartu = null;
}

async function odswiezZdalneProfile() {
  try {
    magazynProfili.setRemoteProfiles(await serwisAutoryzacji.listProfiles());
    return true;
  } catch {
    return false;
  }
}

async function sprawdzObecnaSesje(expectedUserId = null) {
  try {
    const user = await serwisAutoryzacji.me();
    magazynProfili.upsertRemoteProfile(user);
    if (expectedUserId && user?.id !== expectedUserId) {
      return null;
    }
    return user || null;
  } catch {
    await serwisAutoryzacji.logout();
    magazynSesji.clearCurrentUser();
    return null;
  }
}

// Callback bierze code z URL i probuje zamienic go na realna sesje.
async function pokazCallbackAutoryzacji() {
  wyczyscEkran();
  magazynSesji.setPhase("welcome");
  obecnyEkran = renderujEkranCallbackAutoryzacji({ status: "Preparing your desktop..." });
  korzenAplikacji.append(obecnyEkran.element);

  try {
    const result = await serwisAutoryzacji.handleCurrentCallback();
    const user = result?.user || null;
    if (!user) {
      throw new Error("Missing authenticated user.");
    }
    magazynProfili.upsertRemoteProfile(user);
    synchronizacjaSesji.broadcastSessionChange({ userId: user.id, reason: "login" });
    przejdzDo("/welcome", { replace: true });
    zalogujUzytkownika(user.id, { replaceRoute: true });
  } catch {
    serwisAutoryzacji.clear();
    magazynSesji.clearCurrentUser();
    przekierujDoLogowania();
  }
}

function przekierujDoLogowania() {
  przejdzDo("/login", { replace: true });
  void pokazLogowanie();
}

function normalizujTrase(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path.toLowerCase();
}

function przejdzDo(path, { replace = false } = {}) {
  const normalizedPath = path || "/";
  if (window.location.pathname === normalizedPath && !window.location.search) {
    return;
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", normalizedPath);
}
