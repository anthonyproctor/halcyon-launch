#!/usr/bin/env node
// Pull player telemetry (the "Show player diagnostics" switch on the Guide page) and print what the audio element and the lock screen did,
// one line per event, grouped by device session. Use it after a tester turns diagnostics on and reproduces a player bug on a phone.
//
//   node tools/diag_pull.mjs                  the last 24 hours, from https://halcyon-launch.vercel.app
//   node tools/diag_pull.mjs --since 2h       a span back from now (90m, 24h, 7d) or a date (2026-10-14)
//   node tools/diag_pull.mjs --json           the raw batches
//   node tools/diag_pull.mjs --url http://... another deployment
//
// Auth is the same as tools/qa_pull.mjs: HALCYON_SESSION, or a 5 minute admin session signed locally with AUTH_SECRET (.env.local).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] ?? d) : d; };
const BASE = String(opt("--url", process.env.HALCYON_URL || "https://halcyon-launch.vercel.app")).replace(/\/$/, "");
const SINCE = opt("--since", "24h");

function envLocal() {
  const out = {};
  try { for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) { const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line); if (m) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2"); } } catch {}
  return out;
}
const env = k => process.env[k] || envLocal()[k] || "";
async function sessionCookie() {
  if (process.env.HALCYON_SESSION) return process.env.HALCYON_SESSION;
  const secret = env("AUTH_SECRET");
  if (!secret || secret.length < 32) throw new Error("No HALCYON_SESSION and no AUTH_SECRET (env or .env.local).");
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

const r = await fetch(`${BASE}/api/qa-report?action=diag&since=${encodeURIComponent(SINCE)}`, { headers: { cookie: `hl_session=${await sessionCookie()}`, accept: "application/json" } });
if (!r.ok) { console.error(`HTTP ${r.status}: ${await r.text()}`); process.exit(1); }
const { batches } = await r.json();
if (args.includes("--json")) { console.log(JSON.stringify(batches, null, 1)); process.exit(0); }
if (!batches.length) { console.log(`No player diagnostics since ${SINCE}. Turn on "Show player diagnostics" on the Guide page, reproduce, wait 15 seconds.`); process.exit(0); }
const bySid = new Map();
for (const b of batches) { const k = b.sid || "?"; if (!bySid.has(k)) bySid.set(k, { head: b, events: [] }); bySid.get(k).events.push(...(b.events || [])); }
for (const [sid, { head, events }] of bySid) {
  console.log(`\n=== session ${sid}  user ${head.user_id}  ${head.standalone ? "home screen app" : "browser"}  commit ${head.app_commit || "?"}\n    ${head.ua}`);
  events.sort((a, b) => (a.t || 0) - (b.t || 0));
  const t0 = events[0] && events[0].t;
  for (const e of events) {
    const dt = t0 && e.t ? ((e.t - t0) / 1000).toFixed(1).padStart(7) : "      ?";
    const st = `t=${e.ct ?? "-"} rs=${e.rs ?? "-"} ns=${e.ns ?? "-"} ${e.p ? "paused" : "playing"} sk=${e.sk ?? "-"} dur=${e.dur ?? "-"}${e.vis === "hidden" ? " HIDDEN" : ""}`;
    console.log(`${dt}s  ${String(e.ev).padEnd(22)} ${st}${e.d ? "  " + JSON.stringify(e.d) : ""}`);
  }
}
