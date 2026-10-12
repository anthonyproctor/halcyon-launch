#!/usr/bin/env node
// Pull tester QA reports (QA mode, qa.js) from the admin export and print them grouped by book, chapter, page and line, so fixes can be batched.
//
//   node tools/qa_pull.mjs                     reports from the last 14 days, from https://halcyon-launch.vercel.app
//   node tools/qa_pull.mjs --since 2026-10-01  since a date (or 90m, 24h, 7d; --since all for everything)
//   node tools/qa_pull.mjs --json              the raw rows as JSON instead of the grouped list
//   node tools/qa_pull.mjs --file x.csv        group an export you already downloaded (Admin page, QA reports), no network
//   node tools/qa_pull.mjs --url http://...    another deployment (a preview, say)
//
// Auth is the admin export's own check (/api/qa-report GET, same as /api/admin): an admin's hl_session cookie.
//   HALCYON_SESSION=<hl_session cookie value>  use that cookie as is, or
//   otherwise a 5 minute session is signed locally with AUTH_SECRET (the site's existing secret) for an admin user:
//   AUTH_SECRET and DATABASE_URL come from the environment or .env.local (vercel env pull), and the admin is
//   HALCYON_ADMIN_ID if set, else the first admin in the users table. No new secret.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] ?? d) : d; };
const flag = k => args.includes(k);
const BASE = String(opt("--url", process.env.HALCYON_URL || "https://halcyon-launch.vercel.app")).replace(/\/$/, "");
const SINCE = opt("--since", "14d");

function envLocal() {
  const out = {};
  try {
    for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  } catch {}
  return out;
}
const env = k => process.env[k] || envLocal()[k] || "";

async function sessionCookie() {
  if (process.env.HALCYON_SESSION) return process.env.HALCYON_SESSION;
  const secret = env("AUTH_SECRET");
  if (!secret || secret.length < 32) throw new Error("No HALCYON_SESSION and no AUTH_SECRET (env or .env.local). Run `vercel env pull .env.local` or set HALCYON_SESSION.");
  let id = process.env.HALCYON_ADMIN_ID, email = "";
  if (!id) {
    const url = env("DATABASE_URL");
    if (!url) throw new Error("Set HALCYON_ADMIN_ID, or DATABASE_URL so the admin can be looked up.");
    const { neon } = await import("@neondatabase/serverless");
    const rows = await neon(url)`select id,email from users where is_admin and not disabled order by created_at limit 1`;
    if (!rows.length) throw new Error("No admin user in the users table.");
    id = rows[0].id; email = rows[0].email;
  }
  const { SignJWT } = await import("jose");
  return new SignJWT({ email }).setProtectedHeader({ alg: "HS256" }).setSubject(String(id)).setIssuedAt().setExpirationTime("5m").sign(new TextEncoder().encode(secret));
}

// small CSV reader for the export's format (every field quoted, "" for a quote)
function parseCSV(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else if (c !== "\r") f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [head, ...body] = rows;
  const num = k => ["id", "chapter", "line_idx", "audio_t"].includes(k);
  return body.filter(r => r.length > 1).map(r => Object.fromEntries(head.map((k, i) => [k, num(k) && r[i] !== "" ? Number(r[i]) : r[i]])));
}

async function load() {
  const file = opt("--file", "");
  if (file) {
    const text = fs.readFileSync(file, "utf8");
    return text.trim().startsWith("{") || text.trim().startsWith("[") ? [].concat(JSON.parse(text).reports || JSON.parse(text)) : parseCSV(text);
  }
  const q = SINCE === "all" ? "" : `?since=${encodeURIComponent(SINCE)}`;
  const r = await fetch(`${BASE}/api/qa-report${q}`, { headers: { cookie: `hl_session=${await sessionCookie()}`, accept: "application/json" } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} from ${BASE}/api/qa-report: ${j.error || "no detail"}${r.status === 403 ? " (the session isn't an admin's here, or AUTH_SECRET in .env.local isn't this deployment's)" : ""}`);
  return j.reports || [];
}

const TYPE = { wrong_voice: "Wrong voice", text_mismatch: "Text doesn't match audio", voice_changed: "Voice changed mid-scene", mispronounced: "Mispronounced", highlight_off: "Highlight off", audio_glitch: "Audio glitch", typo: "Typo", story: "Story or fact", other: "Other" };
const mmss = t => t == null || t === "" ? "" : `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, "0")}`;
const day = d => d ? new Date(d).toISOString().slice(0, 16).replace("T", " ") : "";

function print(rows) {
  if (!rows.length) { console.log(`No QA reports${SINCE === "all" || opt("--file", "") ? "" : ` since ${SINCE}`}.`); return; }
  const counts = {};
  rows.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
  console.log(`${rows.length} report${rows.length > 1 ? "s" : ""}: ${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${TYPE[k] || k} ${n}`).join(", ")}\n`);
  const key = r => [r.book || r.course || "(no book)", r.chapter ?? "", r.page_id || "", r.line_idx ?? ""];
  const cmp = (a, b) => { const x = key(a), y = key(b); for (let i = 0; i < 4; i++) { if (x[i] === y[i]) continue; if (typeof x[i] === "number" && typeof y[i] === "number") return x[i] - y[i]; return String(x[i]).localeCompare(String(y[i]), "en", { numeric: true }); } return String(a.created_at).localeCompare(String(b.created_at)); };
  let book, chap, pageId, line;
  for (const r of [...rows].sort(cmp)) {
    const [b, c, p, l] = key(r);
    if (b !== book) { console.log(`=== ${b}`); book = b; chap = pageId = line = undefined; }
    if (c !== chap) { console.log(`  Chapter ${c === "" ? "?" : c}${r.track ? `  (${r.track})` : ""}`); chap = c; pageId = line = undefined; }
    if (p !== pageId) { console.log(`    Page ${p || "?"}${r.audio_src ? `  ${r.audio_src}` : ""}`); pageId = p; line = undefined; }
    if (l !== line) { console.log(`      Line ${l === "" ? "?" : l}${r.speaker ? ` [${r.speaker}${r.voice ? " / " + r.voice : ""}]` : ""}${r.line_text ? `: ${r.line_text}` : ""}`); line = l; }
    const bits = [`#${r.id}`, day(r.created_at), TYPE[r.type] || r.type, r.audio_t != null && r.audio_t !== "" ? `at ${mmss(+r.audio_t)}` : "", r.mode && r.mode !== "page" ? r.mode : "", r.tester ? `by ${r.tester}` : ""].filter(Boolean);
    console.log(`        ${bits.join("  ")}${r.note ? `\n          "${r.note}"` : ""}`);
  }
}

try {
  const rows = await load();
  if (flag("--json")) console.log(JSON.stringify(rows, null, 2)); else print(rows);
} catch (e) { console.error(e.message || e); process.exit(1); }
