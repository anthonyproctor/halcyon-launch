#!/usr/bin/env node
// The production board on /admin (lib/board.js): push where every chapter stands, and read back the admin's OK or Redo on the ear list.
//
//   node tools/board.mjs push [file.json]   send the board (books, ears, remove_ears, updated) to /api/admin?action=board_put
//                                           default file: ~/Documents/halcyon-private/board/board.json (private, never in this repo)
//   node tools/board.mjs pull [--json]      print the board and every ear verdict and note (--json: the raw response)
//   --url http://...                        another deployment (a preview, say); default https://halcyon-launch.vercel.app
//
// A push never overwrites a verdict or note the admin gave; an ear with "reset": true clears them (a re-recorded line to hear again).
// Auth is the admin page's own check, the same as tools/qa_pull.mjs: an admin's hl_session cookie.
//   HALCYON_SESSION=<hl_session cookie value>  use that cookie as is, or
//   otherwise a 5 minute session is signed locally with AUTH_SECRET (the site's existing secret) for an admin user:
//   AUTH_SECRET and DATABASE_URL come from the environment or .env.local (vercel env pull), and the admin is
//   HALCYON_ADMIN_ID if set, else the first admin in the users table. No new secret.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? (args[i + 1] ?? d) : d; };
const flag = k => args.includes(k);
const BASE = String(opt("--url", process.env.HALCYON_URL || "https://halcyon-launch.vercel.app")).replace(/\/$/, "");
const DEFAULT_FILE = path.join(os.homedir(), "Documents", "halcyon-private", "board", "board.json");

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

async function call(action, payload) {
  const headers = { cookie: `hl_session=${await sessionCookie()}`, accept: "application/json" };
  const init = payload ? { method: "POST", headers: { ...headers, "content-type": "application/json", origin: BASE }, body: JSON.stringify(payload) } : { headers };
  const r = await fetch(`${BASE}/api/admin?action=${action}`, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${r.status} from ${BASE}/api/admin?action=${action}: ${j.error || "no detail"}${r.status === 403 ? " (the session isn't an admin's here, or AUTH_SECRET in .env.local isn't this deployment's)" : ""}`);
  return j;
}

const MARK = { done: "done", partial: "partly", running: "running", queued: "queued", todo: "-", na: "n/a" };
function print(b) {
  console.log(`Production board${b.updated ? `, updated ${b.updated}` : ""}\n`);
  for (const k of b.books || []) {
    const n = k.planned || k.chapters.length, c = s => k.chapters.filter(x => x[s] === "done").length;
    console.log(`=== ${k.title} (${k.cert})  written ${c("text")}/${n}  audio ${c("audio")}/${n}  heard ${c("heard")}/${n}  live ${c("live")}/${n}`);
    for (const ch of k.chapters) console.log(`  ${String(ch.n).padStart(2)} ${ch.title.padEnd(28).slice(0, 28)} text ${MARK[ch.text]}  exam ${MARK[ch.exam]}  audio ${MARK[ch.audio]}  heard ${MARK[ch.heard]}  live ${MARK[ch.live]}${ch.note ? `\n       ${ch.note}` : ""}`);
  }
  const ears = b.ears || [];
  console.log(`\n=== Ear list: ${ears.filter(e => !e.verdict).length} open, ${ears.filter(e => e.verdict === "ok").length} OK, ${ears.filter(e => e.verdict === "redo").length} Redo`);
  for (const e of ears) console.log(`  [${e.verdict ? e.verdict.toUpperCase() : "open"}] ${e.id}  ${e.book}, ${e.where}\n       ${e.line}${e.note ? `\n       note: ${e.note}` : ""}`);
}

try {
  const cmd = args[0];
  if (cmd === "push") {
    const file = args[1] && !args[1].startsWith("--") ? args[1] : DEFAULT_FILE;
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const r = await call("board_put", data);
    console.log(`Pushed ${r.books} book${r.books === 1 ? "" : "s"} and ${r.ears} ear line${r.ears === 1 ? "" : "s"}${r.removed ? `, removed ${r.removed}` : ""} to ${BASE}.`);
  } else if (cmd === "pull") {
    const b = await call("board");
    if (flag("--json")) console.log(JSON.stringify(b, null, 2)); else print(b);
  } else {
    console.log("usage: node tools/board.mjs push [file.json] | pull [--json]  [--url https://...]"); process.exit(2);
  }
} catch (e) { console.error(e.message || e); process.exit(1); }
