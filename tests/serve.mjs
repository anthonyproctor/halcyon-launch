// Tiny static server for the smoke tests: serves the repo as Vercel does for this site (cleanUrls, index.html at /).
// Runs on localhost, which the engine treats as offline: no sign-in, progress stays in the browser.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = +(process.env.PORT || 4321);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp3": "audio/mpeg", ".txt": "text/plain; charset=utf-8", ".csv": "text/csv; charset=utf-8", ".tif": "image/tiff" };

function resolve(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const f = path.normalize(path.join(ROOT, p));
  if (!f.startsWith(ROOT + path.sep)) return null;
  for (const c of [f, f + ".html"]) { try { if (fs.statSync(c).isFile()) return c } catch (e) {} }
  return null;
}

http.createServer((req, res) => {
  const f = resolve(req.url);
  if (!f) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("not found"); return }
  const size = fs.statSync(f).size, type = TYPES[path.extname(f).toLowerCase()] || "application/octet-stream";
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (range) { // audio elements ask for byte ranges
    const start = range[1] ? +range[1] : 0, end = range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Content-Length": end - start + 1 });
    fs.createReadStream(f, { start, end }).pipe(res); return;
  }
  res.writeHead(200, { "Content-Type": type, "Content-Length": size, "Accept-Ranges": "bytes" });
  if (req.method === "HEAD") return res.end();
  fs.createReadStream(f).pipe(res);
}).listen(PORT, "localhost", () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
