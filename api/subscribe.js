import { sql, sameOrigin, body, send, newToken, cleanEmail } from "../lib/server.js";
import { ensureListTables, ipHash, validEmail, cleanSource, LIMIT_PER_HOUR } from "../lib/list.js";

// POST /api/subscribe {email, source}. Same answer whether or not the email is already on the list.
export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });
  if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
  try {
    const b = await body(req);
    const email = cleanEmail(b.email);
    if (!validEmail(email)) return send(res, 400, { error: "Hmm, that email doesn't look right. Mind checking it?" });
    await ensureListTables();
    const ip = ipHash(req);
    await sql()`delete from list_hits where at < now() - interval '1 day'`;
    const hits = await sql()`select count(*)::int as n from list_hits where ip_hash=${ip} and at > now() - interval '1 hour'`;
    if (hits[0].n >= LIMIT_PER_HOUR) return send(res, 429, { error: "Too many tries from here. Try again in an hour." });
    await sql()`insert into list_hits(ip_hash) values(${ip})`;
    await sql()`insert into list_signups(email,source,unsub_token) values(${email},${cleanSource(b.source)},${newToken()}) on conflict(email) do nothing`;
    return send(res, 200, { ok: true });
  } catch (e) { console.error(e); return send(res, 500, { error: "That didn't go through. Give it a minute and retry." }); }
}
