import { sql, hashPassword, verifyPassword, startSession, endSession, currentUser, sameOrigin, body, send, cleanEmail } from "../lib/server.js";

export default async function handler(req, res) {
  const action = new URL(req.url, "http://x").searchParams.get("action");
  if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
  try {
    if (action === "me" && req.method === "GET") {
      const u = await currentUser(req);
      if (!u) return send(res, 200, { user: null });
      const rows = await sql()`select chapter,state from progress where user_id=${u.id}`;
      const progress = {}; rows.forEach(r => { progress[r.chapter] = r.state; });
      return send(res, 200, { user: { email: u.email, name: u.name, admin: u.is_admin, cur: u.cur }, progress });
    }
    if (action === "invite" && req.method === "GET") {
      const token = new URL(req.url, "http://x").searchParams.get("token") || "";
      const rows = await sql()`select note from invites where token=${token} and used_by is null and not revoked and expires_at>now()`;
      return send(res, 200, { valid: rows.length > 0, note: rows[0]?.note || null });
    }
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });
    const b = await body(req);
    if (action === "signup") {
      const email = cleanEmail(b.email), name = String(b.name || "").trim().slice(0, 60), pw = String(b.password || "");
      if (!email.includes("@") || !name) return send(res, 400, { error: "Enter your name and a valid email." });
      if (pw.length < 10) return send(res, 400, { error: "Use a password of at least 10 characters." });
      const inv = await sql()`select token,make_admin from invites where token=${String(b.token || "")} and used_by is null and not revoked and expires_at>now()`;
      if (!inv.length) return send(res, 400, { error: "This invite link is no longer valid. Ask for a new one." });
      const exists = await sql()`select 1 from users where email=${email}`;
      if (exists.length) return send(res, 400, { error: "That email already has an account. Sign in instead." });
      const pwh = await hashPassword(pw);
      const u = (await sql()`insert into users(email,name,pw,is_admin) values(${email},${name},${pwh},${inv[0].make_admin}) returning id,email`)[0];
      const claimed = await sql()`update invites set used_by=${u.id},used_at=now() where token=${inv[0].token} and used_by is null returning token`;
      if (!claimed.length) { await sql()`delete from users where id=${u.id}`; return send(res, 409, { error: "This invite was just used. Ask for a new one." }); }
      await startSession(res, u);
      return send(res, 200, { ok: true });
    }
    if (action === "login") {
      const email = cleanEmail(b.email);
      const rows = await sql()`select id,email,pw,disabled,failed,locked_until from users where email=${email}`;
      const u = rows[0];
      if (u && u.locked_until && new Date(u.locked_until) > new Date()) return send(res, 429, { error: "Too many tries. Wait 15 minutes and try again." });
      const ok = u && !u.disabled && await verifyPassword(String(b.password || ""), u.pw);
      if (!ok) {
        if (u) await sql()`update users set failed=failed+1, locked_until=case when failed+1>=5 then now()+interval '15 minutes' else null end where id=${u.id}`;
        return send(res, 401, { error: "That email and password don't match." });
      }
      await sql()`update users set failed=0,locked_until=null where id=${u.id}`;
      await startSession(res, u);
      return send(res, 200, { ok: true });
    }
    if (action === "logout") { endSession(res); return send(res, 200, { ok: true }); }
    return send(res, 404, { error: "Unknown action." });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: "Something went wrong on our side. Try again." });
  }
}
