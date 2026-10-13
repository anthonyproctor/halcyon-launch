// The player's own profile page (#me, Phase 2 of badges and profiles, 2026-10-14). Private: only the player and the admin see it.
// No public URL, no share links, no leaderboard. api/me.js serves it; this file holds the logic so tests/me_api.test.mjs can run the handler
// against a fake database.
//
// GET  /api/me            the signed in player's own name, joined date and avatar. Never anyone else's: the user comes from the session.
// POST /api/me {name?, avatar?}  change the name (users.name, 1 to 60 characters) or the avatar (user_profiles.avatar). Same origin only.
//
// user_profiles(user_id text primary key, avatar jsonb, updated_at timestamptz) is created on first use, like the list and QA tables.
// user_id is text so it matches users.id whatever its type (uuid or text): every join is on u.id::text. If the table can't be made
// (say the database role can't create tables), the page still works: GET answers with avatar null and a name change still saves.
// Only an avatar change needs the table; that gets a 503 until it exists. Manual migration: tools/migrations/2026-10-14-user-profiles.sql.
//
// An avatar is one of two things, both chosen from the player's own started books (the page only offers those):
//   {kind:"card", course}       the in-world ID card for that book
//   {kind:"cast", course, id}   a main cast portrait from that book (cast/<id>.jpg or .svg), never one that would spoil
// null clears it. No photo uploads, ever.

// the shared streak rule: badges.js registers HalcyonBadges on globalThis (window in the browser). Loaded fail soft: /api/me serves every
// player's profile, so if this file ever failed to load, names and avatars must keep working and only the streak numbers go blank.
try { await import("../badges.js"); } catch (e) { console.error("badges.js failed to load; streaks are off:", e && e.message); }

export const ME_COURSES = ["pmp", "cphims", "asep", "gh300", "pilot", "cisa"];
export const NAME_MAX = 60;

export function makeEnsureMe(sql) {
  let ready, failedAt = 0;
  return () => {
    if (!ready && Date.now() - failedAt < 5 * 60e3) return Promise.resolve(false); // after a failure, try again every 5 minutes, not every request
    return (ready ||= (async () => {
      await sql()`create table if not exists user_profiles(
        user_id text primary key,
        avatar jsonb,
        updated_at timestamptz not null default now())`;
      return true;
    })().catch(e => { ready = null; failedAt = Date.now(); console.error("user_profiles check failed:", e && e.message); return false; }));
  };
}

// A display name: control characters out, runs of spaces folded, trimmed, 1 to 60 characters. Returns {ok, name} or {ok:false, error}.
export function cleanName(v) {
  if (typeof v !== "string") return { ok: false, error: "Type a name." };
  const name = v.replace(/[\p{Cc}\p{Zl}\p{Zp}]/gu, " ").replace(/\p{Cf}/gu, "").replace(/\s+/g, " ").trim(); // control and invisible format characters out
  if (!name) return { ok: false, error: "Type a name." };
  if ([...name].length > NAME_MAX) return { ok: false, error: `Keep it to ${NAME_MAX} characters or fewer.` };
  return { ok: true, name };
}

// An avatar from the page. Returns {ok, avatar} (avatar may be null to clear it) or {ok:false, error}. Unknown keys are dropped.
export function cleanAvatar(v) {
  if (v === null) return { ok: true, avatar: null };
  if (!v || typeof v !== "object" || Array.isArray(v)) return { ok: false, error: "Pick a card or a portrait." };
  const course = String(v.course || "");
  if (!ME_COURSES.includes(course)) return { ok: false, error: "That book isn't one of yours." };
  if (v.kind === "card") return { ok: true, avatar: { kind: "card", course } };
  if (v.kind === "cast") {
    const id = String(v.id || "");
    if (!/^[a-z][a-z0-9_-]{0,39}$/.test(id)) return { ok: false, error: "Pick a portrait from the list." };
    return { ok: true, avatar: { kind: "cast", course, id } };
  }
  return { ok: false, error: "Pick a card or a portrait." };
}

const iso = d => (d ? new Date(d).toISOString() : null);

// The handler, with its database and auth passed in (tests/me_api.test.mjs runs it on a fake client).
export function makeMeHandler({ sql, currentUser, sameOrigin, body, send, ensure }) {
  ensure ||= makeEnsureMe(sql);
  async function read(u) {
    const id = String(u.id);
    if (await ensure()) {
      const rows = await sql()`select u.name, u.created_at, p.avatar from users u left join user_profiles p on p.user_id = u.id::text where u.id = ${u.id}`;
      const r = rows[0] || {};
      return { name: r.name ?? u.name ?? "", joined: iso(r.created_at), avatar: r.avatar ?? null };
    }
    const rows = await sql()`select name, created_at from users where id = ${u.id}`;
    const r = rows[0] || {};
    return { name: r.name ?? u.name ?? "", joined: iso(r.created_at), avatar: null };
  }
  return async function handler(req, res) {
    try {
      if (req.method !== "GET" && req.method !== "POST") return send(res, 405, { error: "Method not allowed." });
      if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
      const u = await currentUser(req);
      if (!u) return send(res, 401, { error: "Sign in first." });
      if (req.method === "GET") return send(res, 200, { me: await read(u) });
      const b = await body(req);
      if (!b || typeof b !== "object") return send(res, 400, { error: "Nothing to change." });
      const hasName = Object.hasOwn(b, "name"), hasAvatar = Object.hasOwn(b, "avatar");
      if (!hasName && !hasAvatar) return send(res, 400, { error: "Nothing to change." });
      let name, avatar;
      if (hasName) { const v = cleanName(b.name); if (!v.ok) return send(res, 400, { error: v.error }); name = v.name; }
      if (hasAvatar) { const v = cleanAvatar(b.avatar); if (!v.ok) return send(res, 400, { error: v.error }); avatar = v.avatar; }
      if (hasAvatar && !(await ensure())) return send(res, 503, { error: "Your picture didn't save. Give it a minute and try again." });
      const id = String(u.id);
      if (hasName) await sql()`update users set name = ${name} where id = ${u.id}`;
      if (hasAvatar) await sql()`insert into user_profiles(user_id, avatar, updated_at) values(${id}, ${avatar === null ? null : JSON.stringify(avatar)}::jsonb, now())
        on conflict(user_id) do update set avatar = excluded.avatar, updated_at = now()`;
      return send(res, 200, { ok: true, me: await read(u) });
    } catch (e) { console.error(e); return send(res, 500, { error: "That didn't save. Give it a minute and try again." }); }
  };
}

/* ===== the admin page's study and badges view (Phase 3, 2026-10-14) =====
   /api/admin?action=overview adds, per player: avatar (user_profiles, cleaned like a save), study (every book's 905 study log summed up:
   current and best listening streak, seconds listened and read, listened in the last 7 days) and books (per course base: that book's
   seconds listened and read, and the 908 badges record cut down to got ids with at and back, and the readiness snapshot).
   The whole 905 log never leaves the database: the query sends only each day's per device [read, listen] pairs, and the response only
   the sums. The streak rule is badges.js HalcyonBadges.streak, loaded here, so the game, the profile page and the admin page can't drift. */
const HB = globalThis.HalcyonBadges; // badges.js, loaded at the top; undefined if that failed
const DAY_KEY = /^\d{4}-\d\d-\d\d$/;
const secs = v => (typeof v === "number" && isFinite(v) && v > 0 ? Math.min(v, 16 * 3600) : 0); // engine.js caps a device at 16 hours a day
const dayNum = k => { const [y, m, d] = k.split("-").map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
// today's date key in Mountain time, the admin page's clock (players' day keys are their own local dates; this only decides "today")
export function denverToday(now = Date.now()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Denver", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
}
// One or more 905 study logs ({days:{"YYYY-MM-DD":{t:{device:[readSecs, listenSecs]}, a}}}) summed up: every device and every log added
// per day, as engine.js does for the profile page. Odd shapes count as nothing. Returns whole seconds.
// {read, listen, current, best, days (listening days), week (seconds listened today and the 6 days before), last (newest day with any study)}
export function summarizeLog(logs, today = denverToday()) {
  const list = Array.isArray(logs) ? logs : [logs], heard = {};
  let read = 0, listen = 0, last = null;
  for (const L of list) {
    const D = L && typeof L === "object" && L.days && typeof L.days === "object" && !Array.isArray(L.days) ? L.days : null;
    if (!D) continue;
    for (const [d, day] of Object.entries(D)) {
      if (!DAY_KEY.test(d) || !day || typeof day !== "object" || !day.t || typeof day.t !== "object") continue;
      let r = 0, l = 0;
      for (const x of Object.values(day.t)) if (Array.isArray(x)) { r += secs(x[0]); l += secs(x[1]); }
      read += r; listen += l; heard[d] = (heard[d] || 0) + l;
      if (r + l > 0 && (!last || d > last)) last = d;
    }
  }
  const st = HB && HB.streak ? HB.streak(heard, today) : { current: null, best: null, days: null }, t = DAY_KEY.test(today || "") ? dayNum(today) : null;
  let week = 0;
  if (t != null) for (const [d, l] of Object.entries(heard)) { const n = dayNum(d); if (n <= t && n > t - 7) week += l; }
  return { read: Math.round(read), listen: Math.round(listen), current: st.current, best: st.best, days: st.days, week: Math.round(week), last };
}
// a 908 badges record's small parts, cleaned: got {id: {at, back?}} (at most 300) and snap {ready, ch: [done, planned], at}
const okNum = v => (typeof v === "number" && isFinite(v) ? v : null);
export function slimBadges(got, snap) {
  const out = { got: {}, snap: null };
  if (got && typeof got === "object" && !Array.isArray(got)) {
    for (const [id, g] of Object.entries(got).slice(0, 300)) {
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(id) || !g || typeof g !== "object") continue;
      out.got[id] = { at: okNum(g.at) }; if (g.back) out.got[id].back = 1;
    }
  }
  if (snap && typeof snap === "object") {
    const r = okNum(snap.ready), a = okNum(snap.ch0), b = okNum(snap.ch1);
    out.snap = { ready: r == null ? null : Math.max(0, Math.min(100, Math.round(r))), ch: a == null || b == null ? null : [a, b], at: okNum(snap.at) };
  }
  return out;
}
// Adds avatar, study and books to each of the overview's users (matched on String(id)). sql is lib/server.js sql (tests pass a fake or pglite),
// ensure the user_profiles check (makeEnsureMe). A failure in any of these leaves the players list working: that part is just left empty.
export async function attachStudy(users, { sql, ensure, today = denverToday() }) {
  ensure ||= makeEnsureMe(sql);
  const safe = (p, what) => p.catch(e => { console.error(`admin ${what} failed:`, e && e.message); return []; });
  const [avs, logs, recs] = await Promise.all([
    safe((async () => (await ensure()) ? sql()`select u.id, p.avatar from users u left join user_profiles p on p.user_id = u.id::text where jsonb_typeof(p.avatar) = 'object'` : [])(), "avatars"),
    // each book's study log, cut to the per device [read, listen] pairs of each day (no activity notes)
    safe(sql()`select p.user_id, p.chapter, jsonb_build_object('days', coalesce((select jsonb_object_agg(d.key, jsonb_build_object('t', d.value->'t'))
        from jsonb_each(case when jsonb_typeof(p.state->'days') = 'object' then p.state->'days' else '{}'::jsonb end) d
        where jsonb_typeof(d.value) = 'object' and jsonb_typeof(d.value->'t') = 'object'), '{}'::jsonb)) as log
      from progress p where p.chapter % 10000 = 905 and jsonb_typeof(p.state) = 'object'`, "study logs"),
    // each book's badges record: the ids earned with when and whether it was a backfill, and the readiness snapshot's small fields
    safe(sql()`select p.user_id, p.chapter,
        (select jsonb_object_agg(g.key, jsonb_build_object('at', g.value->'at', 'back', g.value->'back'))
          from jsonb_each(case when jsonb_typeof(p.state->'got') = 'object' then p.state->'got' else '{}'::jsonb end) g
          where jsonb_typeof(g.value) = 'object') as got,
        case when jsonb_typeof(p.state->'snap') = 'object' then jsonb_build_object('ready', p.state->'snap'->'ready', 'at', p.state->'snap'->'at',
          'ch0', case when jsonb_typeof(p.state->'snap'->'ch') = 'array' then p.state->'snap'->'ch'->0 end,
          'ch1', case when jsonb_typeof(p.state->'snap'->'ch') = 'array' then p.state->'snap'->'ch'->1 end) end as snap
      from progress p where p.chapter % 10000 = 908 and jsonb_typeof(p.state) = 'object'`, "badge records"),
  ]);
  const json = v => { if (typeof v !== "string") return v; try { return JSON.parse(v); } catch { return null; } };
  const av = new Map(), logsBy = new Map(), books = new Map();
  for (const r of avs) { const c = cleanAvatar(json(r.avatar)); if (c.ok && c.avatar) av.set(String(r.id), c.avatar); }
  const book = (uid, chapter) => {
    const base = Number(chapter) - (Number(chapter) % 10000);
    if (!books.has(uid)) books.set(uid, {});
    return (books.get(uid)[base] ||= { read: 0, listen: 0, got: {}, snap: null });
  };
  for (const r of logs) {
    const uid = String(r.user_id), log = json(r.log), b = book(uid, r.chapter), s = summarizeLog(log, today);
    b.read = s.read; b.listen = s.listen;
    if (!logsBy.has(uid)) logsBy.set(uid, []); logsBy.get(uid).push(log);
  }
  for (const r of recs) Object.assign(book(String(r.user_id), r.chapter), slimBadges(json(r.got), json(r.snap)));
  for (const u of users) {
    const id = String(u.id), L = logsBy.get(id);
    u.avatar = av.get(id) ?? null;
    u.study = L ? summarizeLog(L, today) : null;
    u.books = books.get(id) || {};
  }
  return users;
}
