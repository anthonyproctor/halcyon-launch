// The "tell me when new books land" list. Tables are created on first use (idempotent), like a one-step migration.
// No email is ever sent from here; sending would be a later decision with a mail provider.
import { createHash } from "node:crypto";
import { sql } from "./server.js";

let _ready;
export function ensureListTables() {
  return (_ready ||= (async () => {
    await sql()`create table if not exists list_signups(
      id bigserial primary key,
      email text not null unique,
      source text not null default '',
      unsub_token text not null unique,
      created_at timestamptz not null default now())`;
    // naive rate limit: one row per attempt, keyed by a salted hash of the IP (the raw IP is never stored)
    await sql()`create table if not exists list_hits(ip_hash text not null, at timestamptz not null default now())`;
    await sql()`create index if not exists list_hits_ip_at on list_hits(ip_hash, at)`;
  })().catch(e => { _ready = null; throw e; }));
}

export const LIMIT_PER_HOUR = 5;
export function ipHash(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "").split(",")[0].trim() || "unknown";
  return createHash("sha256").update((process.env.AUTH_SECRET || "") + "|list|" + ip).digest("base64url").slice(0, 32);
}

// Plain format check: something@something.tld, no spaces, sane lengths.
export function validEmail(e) {
  if (typeof e !== "string" || e.length > 254) return false;
  return /^[^\s@<>()",;]{1,64}@[^\s@<>()",;]+\.[a-z]{2,}$/i.test(e);
}

// Where the signup came from: "upcoming" or "about:<course id>". Anything else is stored as "other".
export function cleanSource(s) {
  s = String(s || "").toLowerCase();
  return /^(upcoming|about:[a-z0-9-]{1,24})$/.test(s) ? s : "other";
}
