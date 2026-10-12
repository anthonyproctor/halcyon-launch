import { sql } from "../lib/server.js";
import { ensureListTables } from "../lib/list.js";

// /api/unsubscribe?token=...
// GET shows a one-button confirm page (so a mail scanner that follows links can't remove anyone by accident).
// POST removes the row. It also answers one-click unsubscribe (RFC 8058), which mail apps send as a POST with no page.
// The answer is the same whether or not the token matched anything.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function page(res, code, title, inner) {
  res.statusCode = code;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>${esc(title)}</title>
<style>:root{--bg:#f3f1ec;--page:#fbfaf7;--ink:#1d2024;--muted:#5d636b;--line:#dcd8cf;--accent:#28536b;--on:#fff;color-scheme:light}
@media (prefers-color-scheme: dark){:root{--bg:#121417;--page:#1a1d21;--ink:#e7e5e0;--muted:#a0a5ab;--line:#2e3238;--accent:#8dbcd4;--on:#121417;color-scheme:dark}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif}
.wrap{max-width:520px;margin:0 auto;padding:48px 16px}h1{font:600 26px Georgia,serif;margin:0 0 10px}p{color:var(--muted)}
button{font:inherit;font-weight:600;background:var(--accent);color:var(--on);border:1px solid var(--accent);border-radius:7px;padding:9px 15px;cursor:pointer}a{color:var(--accent)}</style>
</head><body><div class="wrap"><h1>${esc(title)}</h1>${inner}</div></body></html>`);
}

export default async function handler(req, res) {
  const token = String(new URL(req.url, "http://x").searchParams.get("token") || "").slice(0, 64);
  try {
    if (req.method === "GET") {
      if (!token) return page(res, 400, "Leave the list", `<p>Link's broken, sorry. Ask Anthony and he'll take you off.</p>`);
      return page(res, 200, "Leave the list", `<p>Hit the button and your email's gone from the Halcyon list.</p>
<form method="post" action="/api/unsubscribe?token=${encodeURIComponent(token)}"><button type="submit">Remove me</button></form>`);
    }
    if (req.method !== "POST") return page(res, 405, "Leave the list", `<p>That didn't work.</p>`);
    if (token) { await ensureListTables(); await sql()`delete from list_signups where unsub_token=${token}`; }
    return page(res, 200, "You're off the list", `<p>If that email was on it, it's deleted now. We don't keep a copy.</p><p><a href="/">Back to Halcyon</a></p>`);
  } catch (e) { console.error(e); return page(res, 500, "Something went wrong", `<p>Couldn't do that just now. Try again in a minute.</p>`); }
}
