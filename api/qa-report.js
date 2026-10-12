import { sql, currentUser, sameOrigin, body, send } from "../lib/server.js";
import { makeQaHandler } from "../lib/qa.js";

// POST /api/qa-report {type, note, tester, ctx}: a tester flags a problem with a line (qa.js sends it). Signed in, same origin, rate limited.
// GET  /api/qa-report[?since=7d|2026-10-11][&format=csv]: the reports, for admins only (same session check as /api/admin).
export default makeQaHandler({ sql, currentUser, sameOrigin, body, send });
