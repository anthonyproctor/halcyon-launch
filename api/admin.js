import { sql, currentUser, sameOrigin, body, send, newToken } from "../lib/server.js";
import { ensureListTables } from "../lib/list.js";

export default async function handler(req, res) {
  if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
  const u = await currentUser(req);
  if (!u || !u.is_admin) return send(res, 403, { error: "Admins only." });
  const action = new URL(req.url, "http://x").searchParams.get("action");
  try {
    if (action === "overview" && req.method === "GET") {
      const users = await sql()`select u.id,u.email,u.name,u.is_admin,u.disabled,u.cur,u.created_at,
        coalesce((select json_agg(json_build_object('chapter',p.chapter,'step',p.state->'step','score',p.state->'score','updated',p.updated_at) order by p.chapter) from progress p where p.user_id=u.id),'[]') as progress
        from users u order by u.created_at`;
      const invites = await sql()`select i.token,i.note,i.created_at,i.expires_at,i.revoked,i.used_at,u.email as used_by from invites i left join users u on u.id=i.used_by order by i.created_at desc limit 100`;
      return send(res, 200, { users, invites });
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
    return send(res, 404, { error: "Unknown action." });
  } catch (e) { console.error(e); return send(res, 500, { error: "Something went wrong." }); }
}
