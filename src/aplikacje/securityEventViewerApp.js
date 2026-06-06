// Security Audit Viewer.
// Pobiera logi z backendu, wiec tutaj widac czy auth i audyt faktycznie zyja.
import { createButton, createElement, createImage } from "../rdzen/dom.js";
import { ASSETS } from "../konfiguracja/assets.js";

// Viewer startuje od razu od pobrania logow, bo puste okno wygladaloby jak bug.
export function renderujPodgladZdarzenBezpieczenstwa({ uslugi }) {
  const status = createElement("p", { className: "audit-viewer-status", text: "Loading security events..." });
  const tableBody = createElement("tbody");
  const root = createElement("div", { className: "app app-podglad-audytu" }, [
    createElement("header", { className: "audit-viewer-naglowek" }, [
      createImage(ASSETS.menuStart.security, "", "audit-viewer-ikona"),
      createElement("div", {}, [
        createElement("h2", { text: "Security Event Viewer" }),
        createElement("p", { text: "Project audit log viewer for authentication and authorization events." })
      ]),
      createButton("Refresh", "xp-button audit-viewer-refresh", () => loadLogs())
    ]),
    status,
    createElement("div", { className: "audit-viewer-table-wrap" }, [
      createElement("table", { className: "audit-viewer-table" }, [
        createElement("thead", {}, [
          createElement("tr", {}, [
            createElement("th", { text: "Time" }),
            createElement("th", { text: "Event" }),
            createElement("th", { text: "Severity" }),
            createElement("th", { text: "Login" }),
            createElement("th", { text: "IP" })
          ])
        ]),
        tableBody
      ])
    ])
  ]);

  // Pobranie logow idzie przez authService, wiec role i cookie sa ogarniane po drodze.
  async function loadLogs() {
    status.textContent = "Loading security events...";
    tableBody.replaceChildren();
    try {
      const data = await uslugi.serwisAutoryzacji.adminAuditLogs({ limit: 20 });
      const logs = Array.isArray(data.logs) ? data.logs : [];
      if (!logs.length) {
        status.textContent = "No audit events recorded yet.";
        return;
      }
      status.textContent = `${logs.length} recent event(s).`;
      for (const log of logs) {
        tableBody.append(createElement("tr", {}, [
          createElement("td", { text: formatDate(log.createdAt) }),
          createElement("td", { text: log.eventType || "UNKNOWN" }),
          createElement("td", { text: log.severity || "info" }),
          createElement("td", { text: log.loginAttempt || "—" }),
          createElement("td", { text: log.ipAddress || "—" })
        ]));
      }
    } catch (error) {
      status.textContent = error?.status === 403
        ? "Access denied. Administrator privileges are required."
        : "Security events are not available right now.";
    }
  }

  loadLogs();
  return { element: root };
}

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleString([], { dateStyle: "short", timeStyle: "medium" });
}
