// Dev server with proxy — lets the browser version fetch external sites
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const WWW = path.join(__dirname, "www");
const PORT = 4321;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function fetchUrl(targetUrl, ms, redirects) {
  return new Promise((resolve, reject) => {
    if (redirects > 6) return reject(new Error("Too many redirects"));
    let u;
    try { u = new URL(targetUrl); } catch (e) { return reject(e); }
    const mod = u.protocol === "https:" ? https : http;
    const options = {
      hostname: u.hostname,
      port: u.port || (u.protocol === "https:" ? 443 : 80),
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: ms,
    };
    const req = mod.request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        const next = new URL(res.headers.location, targetUrl).href;
        res.resume();
        return fetchUrl(next, ms, redirects + 1).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        resolve({
          status: res.statusCode,
          finalUrl: targetUrl,
          headers: res.headers,
          text: Buffer.concat(chunks).toString("utf8"),
        });
      });
    });
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
    req.on("error", reject);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Expose-Headers", "X-Final-Url,X-Status");

  if (req.url.startsWith("/proxy?")) {
    const qs = req.url.slice("/proxy?".length);
    const params = new URLSearchParams(qs);
    const target = params.get("url");
    if (!target) { res.writeHead(400); res.end("no url"); return; }
    try {
      const r = await fetchUrl(target, 20000, 0);
      res.writeHead(r.status, {
        "Content-Type": r.headers["content-type"] || "text/html; charset=utf-8",
        "X-Final-Url": r.finalUrl,
        "X-Status": String(r.status),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "X-Final-Url,X-Status",
      });
      res.end(r.text);
    } catch (e) {
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end(e.message);
    }
    return;
  }

  // Serve static files
  let filePath = path.join(WWW, req.url === "/" ? "index.html" : req.url.split("?")[0]);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(filePath);
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (ext === ".html") headers["Cache-Control"] = "no-store";
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, () => console.log("Dev server: http://localhost:" + PORT));
