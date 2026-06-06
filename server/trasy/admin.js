// Trasy administracyjne.
// Tutaj nie ma wchodzenia bez admina, bo same przyciski w UI nie sa zabezpieczeniem.
import express from "express";
import { AUDIT_EVENTS, zapiszLogAudytu } from "../audyt/auditLogger.js";
import { listRecentAuditLogs } from "../baza_danych/repositories/auditLogsRepository.js";

export function utworzTraseAdmina(pool, wymagajAutoryzacji) {
  const router = express.Router();

  router.use(wymagajAutoryzacji);
  router.use(wymagajAdmina(pool));

  // Logi audytu sa tylko dla admina, bo tam sa informacje o probach logowania i błędach.
router.get("/audit-logs", asyncHandler(async (request, response) => {
    const logs = await listRecentAuditLogs(pool, {
      limit: request.query.limit,
      offset: request.query.offset,
      eventType: request.query.eventType,
      severity: request.query.severity
    });
    response.json({ logs });
  }));

  return router;
}

export function wymagajAdmina(pool) {
  return asyncHandler(async (request, response, next) => {
    const user = request.auth?.user;
    if (user?.role !== "admin") {
      await zapiszLogAudytu(pool, {
        eventType: AUDIT_EVENTS.ADMIN_ACCESS_DENIED,
        severity: "warning",
        userId: user?.id || null,
        loginAttempt: user?.login || null,
        request,
        details: {
          requiredRole: "admin",
          actualRole: user?.role || "none"
        }
      });
      response.status(403).json({ error: "forbidden", message: "This account does not have permission for this resource." });
      return;
    }

    await zapiszLogAudytu(pool, {
      eventType: AUDIT_EVENTS.ADMIN_ACCESS_GRANTED,
      severity: "info",
      userId: user.id,
      loginAttempt: user.login,
      request
    });
    next();
  });
}

function asyncHandler(handler) {
  return function wrappedHandler(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
