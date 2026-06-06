// Zapisywanie logow audytu.
// Nie wrzucamy tu hasel ani tokenow, bo logi maja pomagac, a nie robic wyciek danych.
import { createAuditLog } from "../baza_danych/repositories/auditLogsRepository.js";

export const AUDIT_EVENTS = Object.freeze({
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  REGISTER_SUCCESS: "REGISTER_SUCCESS",
  REGISTER_FAILED: "REGISTER_FAILED",
  AUTH_CODE_ISSUED: "AUTH_CODE_ISSUED",
  AUTH_CODE_EXCHANGED: "AUTH_CODE_EXCHANGED",
  AUTH_CODE_REUSED_BLOCKED: "AUTH_CODE_REUSED_BLOCKED",
  AUTH_CODE_EXPIRED: "AUTH_CODE_EXPIRED",
  AUTH_CODE_INVALID: "AUTH_CODE_INVALID",
  LOGOUT: "LOGOUT",
  CSRF_INVALID: "CSRF_INVALID",
  RATE_LIMIT_HIT: "RATE_LIMIT_HIT",
  ADMIN_ACCESS_GRANTED: "ADMIN_ACCESS_GRANTED",
  ADMIN_ACCESS_DENIED: "ADMIN_ACCESS_DENIED"
});

export async function zapiszLogAudytu(pool, {
  eventType,
  severity = "info",
  userId = null,
  loginAttempt = null,
  request = null,
  details = {}
}) {
  try {
    await createAuditLog(pool, {
      eventType,
      severity,
      userId,
      loginAttempt,
      ipAddress: getRequestIp(request),
      userAgent: request?.get?.("user-agent") || null,
      details: {
        ...details,
        method: request?.method,
        path: request?.path || request?.originalUrl
      }
    });
  } catch (error) {
    console.error("Audit log write failed:", error);
  }
}

export function getAuthenticatedUserId(request) {
  return request?.auth?.user?.id || request?.auth?.payload?.sub || null;
}

function getRequestIp(request) {
  return request?.ip || request?.socket?.remoteAddress || "unknown";
}
