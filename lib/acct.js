// Which account a write was made for (2026-11-11). One cookie per browser, so another tab can sign a different account in while this tab still
// holds the first account's data. engine.js puts the account its tab booted with on every write to /api/progress and /api/me, in the
// X-Halcyon-Account header; the handlers compare it with the session's user and refuse a mismatch (409 {error:"account changed"}) before
// writing anything. The id is opaque: an HMAC of users.id (lib/server.js acctOf), sent to the page by /api/auth?action=me as user.acct.
// Never an email.
//
// A write with no header is from an app that hasn't updated yet. It is let through for now, and counted in the logs so the check can be
// made strict once they stop showing up: grep the function logs for "[acct] write with no account".
export const ACCT_HEADER = "x-halcyon-account";
let _missing = 0;

// "ok" (the header matches), "missing" (no header: an older app, let through and logged) or "mismatch" (refuse with 409, write nothing)
export function acctCheck(req, u, acctOf, log = console.warn) {
  const raw = req.headers && req.headers[ACCT_HEADER];
  const got = Array.isArray(raw) ? raw[0] : raw;
  if (got == null || got === "") {
    _missing++;
    log(`[acct] write with no account header: ${req.method} ${String(req.url || "").split("?")[0]} (${_missing} on this instance)`);
    return "missing";
  }
  return String(got) === acctOf(u.id) ? "ok" : "mismatch";
}
export const ACCT_CHANGED = { error: "account changed" };
