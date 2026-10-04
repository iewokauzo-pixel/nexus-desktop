import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { runNexus } from "./core.js";
import { toolCatalog } from "./policy.js";

const root = join(process.cwd(), "public");
const port = Number(process.env.NEXUS_PORT || 4310);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml" };
const send = (res, status, body, type = "application/json; charset=utf-8") => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(Buffer.isBuffer(body) || typeof body === "string" ? body : JSON.stringify(body));
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") return send(res, 200, { ok: true, mode: process.env.OPENAI_API_KEY ? "openai" : "demo", tools: toolCatalog.map(({ name, risk, enabled }) => ({ name, risk, enabled })) });
    if (req.method === "POST" && url.pathname === "/api/chat") {
      let raw = ""; for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw || "{}");
      if (!body.message && !body.approvedTool) return send(res, 400, { error: "message is required" });
      const states = [];
      const result = await runNexus(body, (state, detail) => states.push({ state, detail, at: Date.now() }));
      return send(res, 200, { ...result, states });
    }
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const file = normalize(join(root, requested));
    if (!file.startsWith(root)) return send(res, 403, { error: "Forbidden" });
    return send(res, 200, await readFile(file), types[extname(file)] || "application/octet-stream");
  } catch (error) { return send(res, 500, { error: error.message }); }
}).listen(port, "127.0.0.1", () => console.log(`NEXUS Core online at http://127.0.0.1:${port}`));
