// Przykladowe chronione zasoby.
// Dobre miejsce do sprawdzenia, czy rola admin faktycznie działa po stronie backendu.
import express from "express";
import { wymagajAdmina } from "./admin.js";

export function utworzTraseChroniona(wymagajAutoryzacji, pool) {
  const router = express.Router();

  router.use(wymagajAutoryzacji);

  // Prosty endpoint testowy dla roli admin. Przydaje sie w UI i testach.
router.get("/admin", wymagajAdmina(pool), (request, response) => {
    response.json({
      message: "This admin-only resource is available only to administrator accounts.",
      user: request.auth.publicUser,
      permissions: {
        role: request.auth.publicUser.role,
        canOpenAdminResource: true
      }
    });
  });

  return router;
}
