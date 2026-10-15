// QA reports from testers: "this line has the wrong voice", "the highlight is off", a typo. qa.js (the page) posts them,
// api/qa-report.js stores them, tools/qa_pull.mjs pulls them for fixing. The table is created on first use (idempotent), like list_signups.
// No names, emails or IPs are stored. A tester name is stored only if the tester typed one. The rate limit keys on a salted hash of the IP,
// kept in qa_hits for a day at most, never in qa_reports.
import { createHash } from "node:crypto";

export const QA_TYPES = {
  wrong_voice: "Wrong voice",
  text_mismatch: "Text doesn't match audio",
  voice_changed: "Voice changed mid-scene",
  mispronounced: "Mispronounced",
  highlight_off: "Highlight off",
  audio_glitch: "Audio glitch",
  typo: "Typo",
  story: "Story or fact",
  other: "Other",
};
export const QA_LIMIT_PER_MIN = 10;
export const QA_LIMIT_PER_DAY = 200;
export const QA_COLUMNS = ["id", "created_at", "type", "note", "tester", "course", "book", "chapter", "page_id", "line_idx", "speaker", "voice", "line_text", "audio_src", "audio_t", "track", "mode", "route", "ua", "app_commit"];

export function qaIpHash(req) {
  const ip = String(req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "").split(",")[0].trim() || "unknown";
  return createHash("sha256").update((process.env.AUTH_SECRET || "") + "|qa|" + ip).digest("base64url").slice(0, 32);
}

export function makeEnsureQaTables(sql) {
  let ready;
  return () => (ready ||= (async () => {
    await sql()`create table if not exists qa_reports(
      id bigserial primary key,
      created_at timestamptz not null default now(),
      type text not null,
      note text not null default '',
      tester text not null default '',
      course text not null default '',
      book text not null default '',
      chapter int,
      page_id text not null default '',
      line_idx int,
      speaker text not null default '',
      voice text not null default '',
      line_text text not null default '',
      audio_src text not null default '',
      audio_t real,
      track text not null default '',
      mode text not null default '',
      route text not null default '',
      ua text not null default '',
      app_commit text not null default '')`;
    await sql()`create index if not exists qa_reports_created on qa_reports(created_at)`;
    await sql()`create table if not exists qa_hits(ip_hash text not null, at timestamptz not null default now())`;
    await sql()`create index if not exists qa_hits_ip_at on qa_hits(ip_hash, at)`;
  })().catch(e => { ready = null; throw e; }));
}

// strip control characters, trim, cap the length
const str = (v, n) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, n);
const int = (v, lo, hi) => { const x = Number(v); return Number.isInteger(x) && x >= lo && x <= hi ? x : null; };
// audio src: the path only, so a report never carries a full URL with someone's host or query string
function srcPath(v) {
  const s = str(v, 400);
  if (!s) return "";
  try { return new URL(s, "http://x").pathname.slice(0, 300); } catch { return ""; }
}

// Returns {ok:true,row} or {ok:false,error}. Unknown keys are dropped.
export function cleanReport(b, req) {
  if (!b || typeof b !== "object") return { ok: false, error: "Empty report." };
  const type = String(b.type || "");
  if (!Object.hasOwn(QA_TYPES, type)) return { ok: false, error: "Pick what kind of problem it is." };
  const note = String(b.note ?? "");
  if (note.length > 500) return { ok: false, error: "Keep the note under 500 characters." };
  const c = b.ctx && typeof b.ctx === "object" ? b.ctx : {};
  const t = Number(c.t);
  const track = ["story", "study"].includes(c.track) ? c.track : "";
  const mode = ["page", "audiobook", "car", "read"].includes(c.mode) ? c.mode : "";
  const ua = str(c.ua || (req && req.headers && req.headers["user-agent"]), 300);
  return {
    ok: true,
    row: {
      type,
      note: str(note, 500),
      tester: str(b.tester, 40),
      course: str(c.course, 40),
      book: str(c.book, 120),
      chapter: int(c.chapter, 0, 9999),
      page_id: /^[a-z0-9_ -]{0,40}$/i.test(String(c.page ?? "")) ? str(c.page, 40) : "",
      line_idx: int(c.line, 0, 100000),
      speaker: str(c.speaker, 40),
      voice: str(c.voice, 60),
      line_text: str(c.text, 300),
      audio_src: srcPath(c.src),
      audio_t: Number.isFinite(t) && t >= 0 && t < 1e6 ? Math.round(t * 100) / 100 : null,
      track,
      mode,
      route: str(c.route, 80),
      ua,
      app_commit: str(process.env.VERCEL_GIT_COMMIT_SHA, 12),
    },
  };
}

// ?since= takes an ISO date or time (2026-10-11, 2026-10-11T14:00Z) or a span back from now (90m, 24h, 7d). Anything else: no filter.
export function parseSince(s, now = Date.now()) {
  s = String(s || "").trim();
  if (!s) return null;
  const m = /^(\d{1,4})([mhd])$/.exec(s);
  if (m) return new Date(now - +m[1] * { m: 60e3, h: 3600e3, d: 86400e3 }[m[2]]);
  if (!/^\d{4}-\d{2}-\d{2}/.test(s)) return null;
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

export function toCSV(rows) {
  const q = v => `"${String(v instanceof Date ? v.toISOString() : v ?? "").replace(/"/g, '""')}"`;
  return QA_COLUMNS.join(",") + "\n" + rows.map(r => QA_COLUMNS.map(k => q(k === "created_at" && r[k] ? new Date(r[k]).toISOString() : r[k])).join(",")).join("\n") + (rows.length ? "\n" : "");
}

// Player telemetry (2026-10-14): when a tester turns on "Show player diagnostics", the page sends what the audio element and the lock screen
// did, in batches, to POST /api/qa-report?action=diag. Admins and testers only. Stored: the signed in user's id, a random session id, the
// user agent, the app commit and the events. Events are capped and cleaned; nothing typed by the reader is ever in them.
export const DIAG_MAX_EVENTS = 150;
export const DIAG_LIMIT_PER_HOUR = 240;
export function makeEnsureDiagTable(sql) {
  let ready;
  return () => (ready ||= (async () => {
    await sql()`create table if not exists player_diag(
      id bigserial primary key,
      created_at timestamptz not null default now(),
      user_id text not null default '',
      sid text not null default '',
      ua text not null default '',
      standalone boolean not null default false,
      route text not null default '',
      app_commit text not null default '',
      events jsonb not null default '[]'::jsonb)`;
    await sql()`create index if not exists player_diag_created on player_diag(created_at)`;
  })().catch(e => { ready = null; throw e; }));
}
const num = (v, lo, hi) => { const x = Number(v); return Number.isFinite(x) && x >= lo && x <= hi ? Math.round(x * 100) / 100 : null; };
function cleanData(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const out = {};
  for (const [k, v] of Object.entries(d).slice(0, 8)) {
    if (!/^[a-zA-Z_]{1,20}$/.test(k)) continue;
    if (typeof v === "number") { const x = num(v, -1e7, 1e7); if (x !== null) out[k] = x; }
    else if (typeof v === "boolean") out[k] = v;
    else if (typeof v === "string") out[k] = str(v, 100);
  }
  return Object.keys(out).length ? out : null;
}
// Returns {ok:true,row} or {ok:false,error}.
export function cleanDiag(b, req) {
  if (!b || typeof b !== "object" || !Array.isArray(b.events)) return { ok: false, error: "No events." };
  if (b.events.length === 0) return { ok: false, error: "No events." };
  if (b.events.length > DIAG_MAX_EVENTS) return { ok: false, error: "Too many events in one batch." };
  const events = [];
  for (const e of b.events) {
    if (!e || typeof e !== "object") continue;
    const ev = String(e.ev || "");
    if (!/^[a-z0-9_:.-]{1,40}$/i.test(ev)) continue;
    events.push({
      t: num(e.t, 1.5e12, 4e12), ev, ct: num(e.ct, 0, 1e6), dur: num(e.dur, 0, 1e6), rs: num(e.rs, 0, 4), ns: num(e.ns, 0, 3),
      p: e.p ? 1 : 0, sk: num(e.sk, 0, 1e6), page: /^[a-z0-9_ -]{0,40}$/i.test(String(e.page ?? "")) ? str(e.page, 40) : "",
      vis: e.vis === "hidden" ? "hidden" : "visible", d: cleanData(e.d),
    });
  }
  if (!events.length) return { ok: false, error: "No usable events." };
  return { ok: true, row: {
    sid: /^[a-z0-9]{1,16}$/i.test(String(b.sid ?? "")) ? String(b.sid) : "",
    ua: str(b.ua || (req && req.headers && req.headers["user-agent"]), 300),
    standalone: b.standalone === true,
    route: str(b.route, 80),
    app_commit: str(process.env.VERCEL_GIT_COMMIT_SHA, 12),
    events,
  } };
}

// The handler, with its database and auth passed in so a unit test can run it against a fake client (tests/qa_report.test.mjs).
export function makeQaHandler({ sql, currentUser, sameOrigin, body, send }) {
  const ensure = makeEnsureQaTables(sql);
  const ensureDiag = makeEnsureDiagTable(sql);
  return async function handler(req, res) {
    try {
      if (new URL(req.url, "http://x").searchParams.get("action") === "diag") {
        if (req.method === "GET") { // read back, admins only
          const u = await currentUser(req);
          if (!u || !u.is_admin) return send(res, 403, { error: "Admins only." });
          await ensureDiag();
          const since = parseSince(new URL(req.url, "http://x").searchParams.get("since")) || new Date(Date.now() - 86400e3);
          const rows = await sql()`select * from player_diag where created_at >= ${since.toISOString()} order by created_at`;
          return send(res, 200, { batches: rows, since: since.toISOString() });
        }
        if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });
        if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
        const u = await currentUser(req);
        if (!u) return send(res, 401, { error: "Sign in first." });
        if (!u.is_admin && !u.is_tester) return send(res, 403, { error: "Player diagnostics are for testers." });
        const v = cleanDiag(await body(req), req);
        if (!v.ok) return send(res, 400, { error: v.error });
        await ensureDiag();
        const uid = String(u.id ?? "");
        const n = await sql()`select count(*)::int as h from player_diag where user_id=${uid} and created_at > now() - interval '1 hour'`;
        if (n[0].h >= DIAG_LIMIT_PER_HOUR) return send(res, 429, { error: "Too many diagnostics batches this hour." });
        const r = v.row;
        await sql()`insert into player_diag(user_id,sid,ua,standalone,route,app_commit,events) values(${uid},${r.sid},${r.ua},${r.standalone},${r.route},${r.app_commit},${JSON.stringify(r.events)}::jsonb)`;
        return send(res, 200, { ok: true, n: r.events.length });
      }
      if (req.method === "GET") { // export, admins only: the same session check as /api/admin
        const u = await currentUser(req);
        if (!u || !u.is_admin) return send(res, 403, { error: "Admins only." });
        await ensure();
        const p = new URL(req.url, "http://x").searchParams;
        const since = parseSince(p.get("since"));
        const rows = since
          ? await sql()`select * from qa_reports where created_at >= ${since.toISOString()} order by created_at`
          : await sql()`select * from qa_reports order by created_at`;
        if (p.get("format") === "csv") {
          res.statusCode = 200; res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Cache-Control", "no-store");
          res.setHeader("Content-Disposition", `attachment; filename="halcyon-qa-${new Date().toISOString().slice(0, 10)}.csv"`);
          return res.end(toCSV(rows));
        }
        return send(res, 200, { reports: rows, since: since ? since.toISOString() : null });
      }
      if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });
      if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
      const u = await currentUser(req); // testers are signed in (the site is invite only); who sent it is not stored
      if (!u) return send(res, 401, { error: "Sign in first, then send the report." });
      // QA is for admins and testers (approved 2026-10-12; testers are marked on /admin, users.is_tester)
      if (!u.is_admin && !u.is_tester) return send(res, 403, { error: "QA reports are for testers. Ask Anthony to add you." });
      const v = cleanReport(await body(req), req);
      if (!v.ok) return send(res, 400, { error: v.error });
      await ensure();
      const ip = qaIpHash(req);
      await sql()`delete from qa_hits where at < now() - interval '1 day'`;
      const hits = await sql()`select count(*) filter (where at > now() - interval '1 minute')::int as m, count(*)::int as d from qa_hits where ip_hash=${ip}`;
      if (hits[0].m >= QA_LIMIT_PER_MIN || hits[0].d >= QA_LIMIT_PER_DAY) return send(res, 429, { error: "That's a lot of reports at once. Wait a minute and send it again." });
      await sql()`insert into qa_hits(ip_hash) values(${ip})`;
      const r = v.row;
      const out = await sql()`insert into qa_reports(type,note,tester,course,book,chapter,page_id,line_idx,speaker,voice,line_text,audio_src,audio_t,track,mode,route,ua,app_commit)
        values(${r.type},${r.note},${r.tester},${r.course},${r.book},${r.chapter},${r.page_id},${r.line_idx},${r.speaker},${r.voice},${r.line_text},${r.audio_src},${r.audio_t},${r.track},${r.mode},${r.route},${r.ua},${r.app_commit}) returning id`;
      return send(res, 200, { ok: true, id: out[0] && out[0].id });
    } catch (e) { console.error(e); return send(res, 500, { error: "That didn't go through. Give it a minute and retry." }); }
  };
}
