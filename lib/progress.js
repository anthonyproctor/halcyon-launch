// PUT /api/progress {chapter, state}: save one progress record for the signed in player. api/progress.js serves it; the logic lives here so
// tests/progress_api.test.mjs can run the handler against a fake database. A write made for another account than the session's (another tab
// signed someone else in, lib/acct.js) gets 409 and nothing is written.
import { acctCheck, ACCT_CHANGED } from "./acct.js";

export function makeProgressHandler({ sql, currentUser, sameOrigin, body, send, acctOf, log }) {
  return async function handler(req, res) {
    if (!sameOrigin(req)) return send(res, 403, { error: "Bad origin." });
    const u = await currentUser(req);
    if (!u) return send(res, 401, { error: "Sign in first." });
    if (req.method !== "PUT") return send(res, 405, { error: "Method not allowed." });
    if (acctCheck(req, u, acctOf, log) === "mismatch") return send(res, 409, ACCT_CHANGED);
    const b = await body(req);
    const chapter = Number(b.chapter);
    if (!Number.isInteger(chapter) || chapter < 1 || chapter > 99999) return send(res, 400, { error: "Bad chapter." });
    const state = b.state;
    const json = JSON.stringify(state || {});
    if (json.length > 60000) return send(res, 400, { error: "Too large." });
    await sql()`insert into progress(user_id,chapter,state,updated_at) values(${u.id},${chapter},${json}::jsonb,now())
      on conflict(user_id,chapter) do update set state=excluded.state,updated_at=now()`;
    // 901+ in each course block are side records (mock history, practice, listening position), not a place to resume
    if (chapter % 10000 < 901) await sql()`update users set cur=${chapter} where id=${u.id}`;
    return send(res, 200, { ok: true });
  };
}
