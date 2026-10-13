import { sql, currentUser, sameOrigin, body, send } from "../lib/server.js";
import { makeMeHandler } from "../lib/me.js";

// GET  /api/me: the signed in player's own name, joined date and avatar (the private #me page reads it).
// POST /api/me {name?, avatar?}: change them. Signed in, same origin. The logic and the user_profiles table live in lib/me.js.
export default makeMeHandler({ sql, currentUser, sameOrigin, body, send });
