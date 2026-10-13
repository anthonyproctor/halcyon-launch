-- When each player last signed in or signed up, shown on /admin (2026-10-13).
-- You do NOT need to run this: lib/server.js adds the column on first use (ensureUserColumns), like users.is_tester.
-- It's here only for the case where the app's database role can't alter tables. Safe to run more than once.
alter table users add column if not exists last_login_at timestamptz;
