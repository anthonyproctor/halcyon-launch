import { sql, currentUser, sameOrigin, body, send } from "../lib/server.js";

export default async function handler(req, res) {
  if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
  const u = await currentUser(req);
  if (!u) return send(res, 401, { error: "Sign in first." });
  if (req.method !== "PUT") return send(res, 405, { error: "Method not allowed." });
  const b = await body(req);
  const chapter = Number(b.chapter);
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 999) return send(res, 400, { error: "Bad chapter." });
  const state = b.state;
  const json = JSON.stringify(state || {});
  if (json.length > 60000) return send(res, 400, { error: "Too large." });
  await sql()`insert into progress(user_id,chapter,state,updated_at) values(${u.id},${chapter},${json}::jsonb,now())
    on conflict(user_id,chapter) do update set state=excluded.state,updated_at=now()`;
  await sql()`update users set cur=${chapter} where id=${u.id}`;
  return send(res, 200, { ok: true });
}
