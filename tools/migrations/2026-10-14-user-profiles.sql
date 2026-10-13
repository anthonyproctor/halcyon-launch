-- The private profile page's avatar (#me, 2026-10-14): which ID card or main cast portrait each player picked.
-- You do NOT need to run this: lib/me.js creates the table on first use (makeEnsureMe), like the list and QA tables.
-- It's here only for the case where the app's database role can't create tables. Safe to run more than once.
-- user_id is text so it matches users.id whatever its type; join with users on u.id::text = user_profiles.user_id.
create table if not exists user_profiles(
  user_id text primary key,
  avatar jsonb,
  updated_at timestamptz not null default now()
);
