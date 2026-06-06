// Główny serwer Express.
// Spina API, baze, statyczne pliki frontendu i start calej aplikacji.
import compression from "compression";
import express from "express";
import helmet from "helmet";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { assertServerSecrets, projectRoot, serverConfig } from "./config.js";
import { createAuthMiddleware } from "./authMiddleware.js";
import { utworzPuleBazy } from "./baza_danych/connection.js";
import { uruchomMigracje } from "./baza_danych/migrate.js";
import { zasiejKontaStartowe } from "./baza_danych/seed.js";
import { utworzTraseAutoryzacji } from "./trasy/auth.js";
import { utworzTraseAdmina } from "./trasy/admin.js";
import { utworzTraseChroniona } from "./trasy/protected.js";

assertServerSecrets();

const db = utworzPuleBazy();
await uruchomMigracje(db);
await zasiejKontaStartowe(db);

// Od tego miejsca składam cala aplikacje Express.
const app = express();
const wymagajAutoryzacji = createAuthMiddleware(db);

app.disable("x-powered-by");
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      mediaSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: "32kb" }));

// Health check jest prosty, ale przy Dockerze od razu widac czy backend żyje.
app.get("/api/health", (request, response) => {
  response.setHeader("Cache-Control", "no-store");
  response.json({ ok: true, service: "portfolio-xp", database: "mariadb" });
});

app.use("/api", (request, response, next) => {
  response.setHeader("Cache-Control", "no-store");
  next();
});
app.use("/api/auth", utworzTraseAutoryzacji(db, wymagajAutoryzacji));
app.use("/api/protected", utworzTraseChroniona(wymagajAutoryzacji, db));
app.use("/api/admin", utworzTraseAdmina(db, wymagajAutoryzacji));
app.use("/api", (error, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  console.error(error);
  response.status(500).json({ error: "server_error", message: "The authentication server encountered an error." });
});
app.use("/api", (request, response) => {
  response.status(404).json({ error: "not_found", message: "API endpoint not found." });
});

const staticOptions = {
  etag: false,
  maxAge: serverConfig.isProduction ? "1h" : 0,
  setHeaders(response) {
    response.setHeader("Cache-Control", serverConfig.isProduction ? "public, max-age=3600" : "no-store");
  }
};

// Od tego miejsca wybieram, czy serwowac build z dist, czy pliki źródlowe.
const distRoot = join(projectRoot, "dist");
const distIndex = join(distRoot, "index.html");
const hasBuiltFrontend = existsSync(distIndex);

if (hasBuiltFrontend) {
  app.use(express.static(distRoot, staticOptions));
  app.use("/assets", express.static(join(projectRoot, "assets"), staticOptions));
} else {
  app.use("/assets", express.static(join(projectRoot, "assets"), staticOptions));
  app.use("/src", express.static(join(projectRoot, "src"), staticOptions));
}

// Trasy frontendu musza dostac index.html, bo routing dalej ogarnia JS.
app.get(["/", "/index.html", "/auth/callback", "/welcome", "/desktop", "/login"], (request, response) => {
  response.sendFile(hasBuiltFrontend ? distIndex : join(projectRoot, "index.html"));
});

app.get("*", (request, response) => {
  response.status(404).send("Not found");
});

const server = app.listen(serverConfig.port, serverConfig.host, () => {
  console.log(`PortfolioXP running at http://${serverConfig.host}:${serverConfig.port}`);
  console.log(hasBuiltFrontend ? "Serving optimized Vite build from dist/." : "Serving development sources from src/ and assets/.");
});

function wylaczKomputer() {
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.on("SIGINT", wylaczKomputer);
process.on("SIGTERM", wylaczKomputer);
