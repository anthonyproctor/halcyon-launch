import { sql, currentUser, sameOrigin, body, send, acctOf } from "../lib/server.js";
import { makeProgressHandler } from "../lib/progress.js";

// PUT /api/progress {chapter, state}. Signed in, same origin, and for the session's own account (X-Halcyon-Account). The logic lives in lib/progress.js.
export default makeProgressHandler({ sql, currentUser, sameOrigin, body, send, acctOf });
