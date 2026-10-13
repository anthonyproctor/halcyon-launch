import { sql, currentUser, sameOrigin, body, send, newToken, ensureUserColumns, hasLastLogin } from "../lib/server.js";
import { ensureListTables } from "../lib/list.js";

export default async function handler(req, res) {
  if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
  const u = await currentUser(req);
  if (!u || !u.is_admin) return send(res, 403, { error: "Admins only." });
  const action = new URL(req.url, "http://x").searchParams.get("action");
  try {
    if (action === "overview" && req.method === "GET") {
      const tcol = await ensureUserColumns(); // is_tester: QA mode, Flag and the test profile (admins always have them)
      const users = tcol ? await sql()`select u.id,u.email,u.name,u.is_admin,u.is_tester,u.disabled,u.cur,u.created_at from users u order by u.created_at`
        : await sql()`select u.id,u.email,u.name,u.is_admin,false as is_tester,u.disabled,u.cur,u.created_at from users u order by u.created_at`;
      // last sign in, when the column exists (lib/server.js adds it); null until someone signs in after it's added
      const logins = (await hasLastLogin()) ? await sql()`select id,last_login_at from users` : [];
      // each progress row, cut down to what the admin page shows (never the whole saved state): a chapter's place, its picks and quiz,
      // the finished date, and for history records (practice exam results, final assessment, bookmarks) how many and the newest one's score
      const rows = await sql()`select p.user_id,p.chapter,p.updated_at as updated,
        p.state->'step' as step, p.state->'score' as score, p.state->'pos' as pos, p.state->'lx' as lx, p.state->'doneAt' as done,
        case when jsonb_typeof(p.state->'picks')='object' then (select count(*) from jsonb_object_keys(p.state->'picks'))::int end as picks,
        p.state->'quiz'->'right' as qr,
        case when jsonb_typeof(p.state->'quiz'->'v')='array' then jsonb_array_length(p.state->'quiz'->'v') end as qn,
        p.state->'submitted' as sub,
        case when jsonb_typeof(p.state->'list')='array' then jsonb_array_length(p.state->'list') end as n,
        p.state->'list'-> -1 ->'right' as lr, p.state->'list'-> -1 ->'total' as lt, p.state->'list'-> -1 ->'pass' as lp
        from progress p order by p.user_id,p.chapter`;
      const byUser = new Map(), seen = new Map(logins.map(r => [r.id, r.last_login_at]));
      for (const r of rows) { const { user_id, ...rest } = r; if (!byUser.has(user_id)) byUser.set(user_id, []); byUser.get(user_id).push(rest); }
      users.forEach(x => { x.progress = byUser.get(x.id) || []; x.last_login_at = seen.get(x.id) ?? null; });
      const invites = await sql()`select i.token,i.note,i.created_at,i.expires_at,i.revoked,i.used_at,u.email as used_by from invites i left join users u on u.id=i.used_by order by i.created_at desc limit 100`;
      return send(res, 200, { users, invites, lastLogin: await hasLastLogin() });
    }
    // the "tell me when new books land" list: JSON for the page, or ?format=csv to download
    if (action === "list" && req.method === "GET") {
      await ensureListTables();
      const rows = await sql()`select email,source,created_at,unsub_token from list_signups order by created_at`;
      if (new URL(req.url, "http://x").searchParams.get("format") === "csv") {
        const q = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
        const csv = "email,source,created_at,unsubscribe_link\n" + rows.map(r => [r.email, r.source, new Date(r.created_at).toISOString(), `https://${req.headers.host}/api/unsubscribe?token=${r.unsub_token}`].map(q).join(",")).join("\n") + (rows.length ? "\n" : "");
        res.statusCode = 200; res.setHeader("Content-Type", "text/csv; charset=utf-8"); res.setHeader("Cache-Control", "no-store");
        res.setHeader("Content-Disposition", `attachment; filename="halcyon-list-${new Date().toISOString().slice(0, 10)}.csv"`);
        return res.end(csv);
      }
      return send(res, 200, { signups: rows });
    }
    if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });
    const b = await body(req);
    if (action === "invite") {
      const token = newToken(), note = String(b.note || "").slice(0, 80);
      await sql()`insert into invites(token,note,created_by) values(${token},${note},${u.id})`;
      return send(res, 200, { token });
    }
    if (action === "listremove") { await ensureListTables(); await sql()`delete from list_signups where email=${String(b.email || "").trim().toLowerCase()}`; return send(res, 200, { ok: true }); }
    if (action === "revoke") { await sql()`update invites set revoked=true where token=${String(b.token || "")} and used_by is null`; return send(res, 200, { ok: true }); }
    if (action === "disable") {
      if (b.id === u.id) return send(res, 400, { error: "You can't disable yourself." });
      await sql()`update users set disabled=${!!b.disabled} where id=${String(b.id || "")}`; return send(res, 200, { ok: true });
    }
    // who may use QA mode, the Flag button and the test profile: {id, tester: true|false}. Admins always may, so this is for everyone else.
    if (action === "tester") {
      if (typeof b.tester !== "boolean" || typeof b.id !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(b.id)) return send(res, 400, { error: "Say which player, and on or off." });
      if (!(await ensureUserColumns())) return send(res, 500, { error: "The tester setting isn't available yet. Try again in a minute." });
      const out = await sql()`update users set is_tester=${b.tester} where id=${String(b.id)} returning id,is_tester`;
      if (!out.length) return send(res, 404, { error: "No such player." });
      return send(res, 200, { ok: true, id: out[0].id, is_tester: out[0].is_tester });
    }
    return send(res, 404, { error: "Unknown action." });
  } catch (e) { console.error(e); return send(res, 500, { error: "Something went wrong." }); }
}
