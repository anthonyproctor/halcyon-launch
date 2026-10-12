-- Testers for QA mode, the Flag button and the test profile (approved 2026-10-12).
-- You do NOT need to run this: lib/server.js adds the column on first use (ensureUserColumns), like the list and QA tables.
-- It's here only for the case where the app's database role can't alter tables. Safe to run more than once.
alter table users add column if not exists is_tester boolean not null default false;
