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
