// Szybki smoke test projektu.
// Ma wykryc glupie regresje typu: serwer nie startuje, strona nie odpowiada, API lezy.
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const appPort = Number.parseInt(process.env.PORTFOLIO_XP_PORT || "4173", 10);
const debugPort = Number.parseInt(process.env.PORTFOLIO_XP_DEBUG_PORT || "9333", 10);
const cdpTimeoutMs = Number.parseInt(process.env.PORTFOLIO_XP_CDP_TIMEOUT || "10000", 10);
const appUrl = `http://127.0.0.1:${appPort}`;
const edgePath = process.env.EDGE_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const results = [];
const consoleIssues = [];
const browserIssues = [];
let server;
let edge;
let userDataDir;
let cdp;

try {
  server = await startServer();
  userDataDir = await mkdtemp(join(tmpdir(), "portfolio-xp-edge-"));
  edge = startEdge(userDataDir);
  const tabInfo = await waitForTab();
  cdp = await connectCdp(tabInfo.webSocketDebuggerUrl);
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Log.enable");
  cdp.onEvent = (message) => {
    if (message.method === "Runtime.exceptionThrown") {
      consoleIssues.push(`Exception: ${message.params.exceptionDetails.text}`);
    }
    if (message.method === "Log.entryAdded" && ["error", "warning"].includes(message.params.entry.level)) {
      consoleIssues.push(`${message.params.entry.level}: ${message.params.entry.text}`);
    }
  };

  await cdp.send("Page.navigate", { url: appUrl });
  await waitFor(cdp, "document.querySelector('.boot-screen') !== null", 2500);
  pass("boot screen rendered");

  await waitFor(cdp, "document.querySelector('.login-screen') !== null", 6500);
  pass("login screen rendered after boot");

  const profileCount = await evalValue(cdp, "document.querySelectorAll('.login-profile').length");
  assert(profileCount >= 1, "login shows at least one profile");

  await evalValue(cdp, `
    const adminProfile = [...document.querySelectorAll('.login-profile')]
      .find((profile) => profile.querySelector('h2')?.textContent.trim() === 'Roma');
    adminProfile.click();
    const password = adminProfile.querySelector('input[type="password"]');
    password.value = 'admin';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    adminProfile.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    true;
  `);
  await waitFor(cdp, "document.querySelector('.desktop-shell') !== null", 3000);
  pass("Roma admin can log in to desktop");

  await evalValue(cdp, "document.querySelector('.taskbar-start').click(); true;");
  await waitFor(cdp, "document.querySelector('.start-menu.is-open') !== null", 1500);
  pass("Start menu opens");

  await evalValue(cdp, `
    document.querySelector('.start-menu').classList.remove('is-open');
    const icon = [...document.querySelectorAll('.desktop-icon')].find((button) => button.dataset.appId === 'notepad');
    icon.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    true;
  `);
  await waitFor(cdp, "document.querySelector('.xp-window[data-app-id=\"notepad\"]') !== null", 1500);
  pass("desktop icon opens Notepad window");

  await evalValue(cdp, `
    const textarea = document.querySelector('.app-notatnik textarea');
    textarea.value = 'Smoke test note';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    true;
  `);
  await delay(700);
  const savedText = await evalValue(cdp, `
    JSON.parse(localStorage.getItem('portfolio-xp:v1:settings')).users.admin.notepadText
  `);
  assert(savedText === "Smoke test note", "Notepad saves per-profile text");

  await evalValue(cdp, "document.querySelector('.xp-window-przycisk-minimalizuj').click(); true;");
  await waitFor(cdp, "document.querySelector('.xp-window.is-minimized') !== null && document.querySelector('.taskbar-button.is-minimized') !== null", 1500);
  pass("window minimize syncs taskbar");

  await evalValue(cdp, "document.querySelector('.taskbar-button').click(); true;");
  await waitFor(cdp, "!document.querySelector('.xp-window').classList.contains('is-minimized')", 1500);
  pass("taskbar restores minimized window");

  await evalValue(cdp, "document.querySelector('.xp-window-przycisk-maksymalizuj').click(); true;");
  await waitFor(cdp, "document.querySelector('.xp-window.is-maximized') !== null", 1500);
  pass("window maximizes");

  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false
  });
  await delay(500);
  const responsiveOk = await evalValue(cdp, `
    const taskbar = document.querySelector('.taskbar').getBoundingClientRect();
    const win = document.querySelector('.xp-window').getBoundingClientRect();
    taskbar.width > 300 && win.right > 0 && win.left < window.innerWidth && win.top < window.innerHeight
  `);
  assert(responsiveOk, "desktop remains usable after resize");

  await evalValue(cdp, "document.querySelector('.xp-window-przycisk-zamknij').click(); true;");
  await waitFor(cdp, "document.querySelector('.xp-window[data-app-id=\"notepad\"]') === null", 1500);
  pass("window closes cleanly");

  await evalValue(cdp, "document.querySelector('.taskbar-start').click(); true;");
  await waitFor(cdp, "document.querySelector('.start-menu.is-open') !== null", 1500);
  await evalValue(cdp, `
    [...document.querySelectorAll('.start-action')]
      .find((button) => button.textContent.includes('Turn Off Computer'))
      .click();
    true;
  `);
  await waitFor(cdp, "document.querySelector('.powered-off-screen') !== null", 1500);
  pass("shutdown/powered-off screen works");

  if (consoleIssues.length > 0) {
    throw new Error(`Console issues detected: ${consoleIssues.join(" | ")}`);
  }

  console.log(JSON.stringify({ ok: true, results }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, results, consoleIssues, browserIssues, error: error.message }, null, 2));
  process.exitCode = 1;
} finally {
  if (edge && !edge.killed) {
    edge.kill();
  }
  cdp?.close?.();
  if (server && !server.killed) {
    server.kill();
    await waitForProcessExit(server);
  }
  if (userDataDir) {
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}

// Smoke test sam odpala serwer, żeby nie wymagac ręcznego klikania przed testem.
async function startServer() {
  const child = spawn(process.execPath, ["server/server.js"], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(appPort),
      HOST: "127.0.0.1",
      JWT_SECRET: process.env.JWT_SECRET || "smoke-test-secret-for-portfolio-xp-auth-1234567890",
      JWT_EXPIRES_IN: "15m"
    },
    stdio: ["ignore", "ignore", "pipe"]
  });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    if (/error|exception|failed/i.test(text)) {
      browserIssues.push(text.trim());
    }
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`Auth server exited before smoke test with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(`${appUrl}/api/auth/profiles`, { signal: AbortSignal.timeout(700) });
      if (response.ok) {
        return child;
      }
    } catch {
      // Auth server is not ready yet.
    }
    await delay(100);
  }
  throw new Error("Timed out waiting for auth server");
}

function startEdge(profileDir) {
  if (!existsSync(edgePath)) {
    throw new Error(`Edge not found at ${edgePath}`);
  }
  const child = spawn(edgePath, [
    "--headless",
    "--disable-gpu",
    "--disable-gpu-compositing",
    "--disable-gpu-sandbox",
    "--disable-features=VizDisplayCompositor,CalculateNativeWinOcclusion",
    "--use-angle=swiftshader",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--remote-allow-origins=*",
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${debugPort}`,
    "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    if (/error|exception|failed/i.test(text) && !/DevTools listening/i.test(text)) {
      browserIssues.push(text.trim());
    }
  });
  return child;
}

async function waitForTab() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (edge?.exitCode !== null) {
      throw new Error(`Edge exited before DevTools was ready with code ${edge.exitCode}`);
    }
    try {
      const tabs = await fetch(`http://127.0.0.1:${debugPort}/json/list`, {
        signal: AbortSignal.timeout(700)
      }).then((response) => response.json());
      const tab = tabs.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
      if (tab) {
        return tab;
      }
    } catch {
      // Edge DevTools endpoint is not ready yet.
    }
    await delay(100);
  }
  throw new Error("Timed out waiting for Edge DevTools tab");
}

function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const api = {
    onEvent: null,
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      socket.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`CDP command timed out: ${method}`));
        }, cdpTimeoutMs);
        pending.set(id, { resolve, reject, timer });
      });
    },
    close: () => socket.close()
  };
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result);
      }
      return;
    }
    api.onEvent?.(message);
  });
  socket.addEventListener("close", () => {
    for (const [id, { reject, timer }] of pending.entries()) {
      clearTimeout(timer);
      reject(new Error(`CDP websocket closed while waiting for command ${id}`));
    }
    pending.clear();
  });
  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => resolve(api), { once: true });
    socket.addEventListener("error", () => reject(new Error("CDP websocket error")), { once: true });
  });
}

async function evalValue(cdp, expression) {
  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }
  return result.result.value;
}

async function waitFor(cdp, expression, timeoutMs) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evalValue(cdp, `Boolean(${expression})`)) {
      return;
    }
    await delay(100);
  }
  throw new Error(`Timed out waiting for: ${expression}`);
}

function pass(name) {
  results.push(name);
}

function assert(condition, name) {
  if (!condition) {
    throw new Error(`Assertion failed: ${name}`);
  }
  pass(name);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForProcessExit(child) {
  if (child.exitCode !== null) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    child.once("exit", () => resolve());
    setTimeout(resolve, 2500);
  });
}
