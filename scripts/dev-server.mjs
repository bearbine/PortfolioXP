// Prosty serwer statyczny do sprawdzania gotowego buildu.
// Nie jest to główny backend, tylko pomocniczy skrypt kiedy trzeba szybko podejrzec dist.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number.parseInt(process.argv[2] || "4173", 10);
const host = "127.0.0.1";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".wav", "audio/wav"]
]);

// Minimalny HTTP server. Wystarczy do podgladu statycznych plikow bez calego Expressa.
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${host}:${port}`);
    const relativePath = decodeURIComponent(url.pathname) === "/"
      ? "index.html"
      : decodeURIComponent(url.pathname).replace(/^\/+/, "");
    const candidate = normalize(join(root, relativePath));

    if (!candidate.startsWith(root)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    const fileStat = await stat(candidate).catch(() => null);
    const filePath = fileStat?.isDirectory() ? join(candidate, "index.html") : candidate;
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(extname(filePath).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`PortfolioXP running at http://${host}:${port}`);
});
