// Middleware od autoryzacji.
// Tutaj backend decyduje, czy request ma prawo isc dalej, a nie frontend na ladne oczy.
import { ALLOWED_ROLES, znajdzPoId, naPublicznegoUzytkownika } from "./baza_danych/repositories/usersRepository.js";
import { getAuthTokenFromRequest, verifyUserToken } from "./tokens.js";

// Fabryka middleware, bo potrzebuje dostepu do poola bazy.
export function createAuthMiddleware(pool) {
  return async function wymagajAutoryzacji(request, response, next) {
    const { token, source } = getAuthTokenFromRequest(request);
    if (!token) {
      response.status(401).json({ error: "missing_token", message: "A valid JWT token is required." });
      return;
    }

    try {
      const payload = verifyUserToken(token);
      const user = await znajdzPoId(pool, payload.sub);
      if (!user || !ALLOWED_ROLES.includes(user.role)) {
        response.status(401).json({ error: "invalid_token", message: "The token user is not valid." });
        return;
      }
      request.auth = {
        token,
        source,
        payload,
        user,
        publicUser: naPublicznegoUzytkownika(user)
      };
      next();
    } catch (error) {
      const expired = error && error.name === "TokenExpiredError";
      response.status(401).json({
        error: expired ? "expired_token" : "invalid_token",
        message: expired ? "The JWT token has expired." : "The JWT token is invalid."
      });
    }
  };
}

// Role sa sprawdzane po stronie backendu. Frontendowy ukryty przycisk to nie zabezpieczenie.
export function requireRole(roles) {
  const allowed = new Set(Array.isArray(roles) ? roles : [roles]);
  return function checkRole(request, response, next) {
    const role = request.auth?.user?.role;
    if (!allowed.has(role)) {
      response.status(403).json({ error: "forbidden", message: "This account does not have permission for this resource." });
      return;
    }
    next();
  };
}
