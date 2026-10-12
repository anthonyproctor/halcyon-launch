import { neon } from "@neondatabase/serverless";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt);
const COOKIE = "hl_session";
const MAX_AGE = 60 * 60 * 24 * 60;
let _sql;
export const sql = () => (_sql ||= neon(process.env.DATABASE_URL));
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET missing");
  return new TextEncoder().encode(s);
};

export async function hashPassword(pw) {
  const salt = randomBytes(16);
  const key = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}
export async function verifyPassword(pw, stored) {
  const [alg, s, k] = String(stored).split("$");
  if (alg !== "scrypt" || !s || !k) return false;
  const want = Buffer.from(k, "base64");
  const got = await scrypt(pw, Buffer.from(s, "base64"), want.length);
  return got.length === want.length && timingSafeEqual(got, want);
}
export const newToken = () => randomBytes(24).toString("base64url");

export async function startSession(res, user) {
  const token = await new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime(`${MAX_AGE}s`).sign(secret());
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
}
export function endSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
function readCookie(req, name) {
  const h = req.headers.cookie || "";
  for (const part of h.split(/;\s*/)) { const i = part.indexOf("="); if (part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1)); }
  return null;
}
// users.is_tester (approved 2026-10-12): who may use QA mode, the Flag button and the test profile besides admins. Added on first use,
// like the list and QA tables: the column is looked up once per server instance and created only if it's missing (no lock on every start).
// If that fails (say the database role can't alter tables), sign in keeps working and nobody is a tester until it's fixed; the manual
// migration is tools/migrations/2026-10-12-users-is-tester.sql.
let _cols, _colsFailedAt = 0;
export function ensureUserColumns() {
  if (!_cols && Date.now() - _colsFailedAt < 5 * 60e3) return Promise.resolve(false); // after a failure, retry every 5 minutes, not every request
  return (_cols ||= (async () => {
    const has = await sql()`select 1 from information_schema.columns where table_schema=current_schema() and table_name='users' and column_name='is_tester'`;
    if (!has.length) await sql()`alter table users add column if not exists is_tester boolean not null default false`;
    return true;
  })().catch(e => { _cols = null; _colsFailedAt = Date.now(); console.error("users.is_tester check failed:", e && e.message); return false; }));
}
export async function currentUser(req) {
  const t = readCookie(req, COOKIE);
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    const rows = (await ensureUserColumns())
      ? await sql()`select id,email,name,is_admin,is_tester,disabled,cur from users where id=${payload.sub}`
      : await sql()`select id,email,name,is_admin,false as is_tester,disabled,cur from users where id=${payload.sub}`;
    const u = rows[0];
    return u && !u.disabled ? u : null;
  } catch { return null; }
}

// Same-origin check for state-changing requests (cookie is SameSite=Lax; this adds a second guard).
export function sameOrigin(req) {
  if (req.method === "GET") return true;
  const o = req.headers.origin;
  if (!o) return false;
  try { return new URL(o).host === req.headers.host; } catch { return false; }
}
export async function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}
export function send(res, code, obj) { res.statusCode = code; res.setHeader("Content-Type", "application/json"); res.setHeader("Cache-Control", "no-store"); res.end(JSON.stringify(obj)); }
export const cleanEmail = e => String(e || "").trim().toLowerCase();
