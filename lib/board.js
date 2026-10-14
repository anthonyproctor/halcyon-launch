// The production board on /admin (2026-10-14): where every chapter of every book stands (written, exam checked, audio, heard by
// the admin, live) and the ear list, the lines waiting for him to hear, each marked OK or Redo with an optional note.
// Admins only, served through api/admin.js (actions board, board_put, ear_verdict, ear_note); no new Vercel function. Claude pushes the board
// from a private file with tools/board.mjs, and reads the verdicts back the same way. Tables are made on first use, like the list tables.
// A push never overwrites a verdict or note the admin gave, unless that ear carries reset:true (a re-recorded line to hear again).

export const STAGES = ["text", "exam", "audio", "heard", "live"];
export const STATUS = ["done", "partial", "running", "queued", "todo", "na"];
const ID = /^[A-Za-z0-9_.:-]{1,80}$/;
const str = (v, n) => String(v ?? "").slice(0, n);

// one book: {id, ord, title, cert, planned, note, chapters:[{n, title, text, exam, audio, heard, live, note}]}; anything else dropped
export function cleanBook(b) {
  if (!b || typeof b !== "object" || !ID.test(String(b.id || ""))) return null;
  const chapters = (Array.isArray(b.chapters) ? b.chapters : []).slice(0, 60).map(c => {
    const o = { n: Number.isFinite(+c?.n) ? Math.trunc(+c.n) : 0, title: str(c?.title, 120), note: str(c?.note, 400) };
    STAGES.forEach(s => { o[s] = STATUS.includes(c?.[s]) ? c[s] : "todo"; });
    return o;
  });
  const planned = Number.isFinite(+b.planned) && +b.planned > 0 ? Math.min(99, Math.trunc(+b.planned)) : chapters.length;
  const ordRaw = b.ord ?? b.order;
  return { id: String(b.id), ord: ordRaw != null && Number.isFinite(+ordRaw) ? Math.trunc(+ordRaw) : 0, title:str(b.title, 120), cert: str(b.cert, 60), planned, note: str(b.note, 400), chapters };
}
// one ear item: {id, ord, book, where, at, line, listen_for, url, reset?}; only https audio links are kept
export function cleanEar(e) {
  if (!e || typeof e !== "object" || !ID.test(String(e.id || ""))) return null;
  let url = str(e.url, 400);
  try { if (url && new URL(url).protocol !== "https:") url = ""; } catch { url = ""; }
  return { id: String(e.id), ord: Number.isFinite(+e.ord) ? Math.trunc(+e.ord) : 0, reset: e.reset === true,
    data: { book: str(e.book, 120), where: str(e.where, 200), at: str(e.at, 20), line: str(e.line, 600), listen_for: str(e.listen_for, 400), url } };
}

export function makeBoard(sql) {
  let ready;
  const ensure = () => (ready ||= (async () => {
    await sql()`create table if not exists production_books(id text primary key, ord int not null default 0, data jsonb not null, updated_at timestamptz not null default now())`;
    await sql()`create table if not exists production_ears(id text primary key, ord int not null default 0, data jsonb not null, verdict text not null default '', note text not null default '', verdict_at timestamptz, updated_at timestamptz not null default now())`;
    await sql()`create table if not exists production_meta(k text primary key, v text not null default '')`;
  })().catch(e => { ready = null; throw e; }));

  async function get() {
    await ensure();
    const books = (await sql()`select id, ord, data from production_books order by ord, id`).map(r => ({ ...(r.data || {}), id: r.id, ord: r.ord }));
    const ears = (await sql()`select id, ord, data, verdict, note, verdict_at from production_ears order by ord, id`)
      .map(r => ({ ...(r.data || {}), id: r.id, ord: r.ord, verdict: r.verdict || "", note: r.note || "", verdict_at: r.verdict_at || null }));
    const m = await sql()`select v from production_meta where k = 'updated'`;
    return { books, ears, updated: m[0] ? m[0].v : null };
  }

  async function put(b) {
    await ensure();
    const books = (Array.isArray(b?.books) ? b.books : []).slice(0, 40).map(cleanBook).filter(Boolean);
    const ears = (Array.isArray(b?.ears) ? b.ears : []).slice(0, 300).map(cleanEar).filter(Boolean);
    const remove = (Array.isArray(b?.remove_ears) ? b.remove_ears : []).map(String).filter(x => ID.test(x)).slice(0, 300);
    for (const k of books) {
      const { id, ord, ...data } = k;
      await sql()`insert into production_books(id, ord, data, updated_at) values(${id}, ${ord}, ${JSON.stringify(data)}::jsonb, now()) on conflict(id) do update set ord = excluded.ord, data = excluded.data, updated_at = now()`;
    }
    for (const e of ears) {
      if (e.reset) await sql()`insert into production_ears(id, ord, data, updated_at) values(${e.id}, ${e.ord}, ${JSON.stringify(e.data)}::jsonb, now()) on conflict(id) do update set ord = excluded.ord, data = excluded.data, verdict = '', note = '', verdict_at = null, updated_at = now()`;
      else await sql()`insert into production_ears(id, ord, data, updated_at) values(${e.id}, ${e.ord}, ${JSON.stringify(e.data)}::jsonb, now()) on conflict(id) do update set ord = excluded.ord, data = excluded.data, updated_at = now()`;
    }
    for (const id of remove) await sql()`delete from production_ears where id = ${id}`;
    if (b && b.updated != null) await sql()`insert into production_meta(k, v) values('updated', ${str(b.updated, 80)}) on conflict(k) do update set v = excluded.v`;
    return { ok: true, books: books.length, ears: ears.length, removed: remove.length };
  }

  async function verdict(b) {
    await ensure();
    const id = String(b?.id || "");
    if (!ID.test(id)) return { status: 400, body: { error: "Say which line." } };
    if (!["ok", "redo", ""].includes(b?.verdict)) return { status: 400, body: { error: "Mark it OK or Redo." } };
    const out = typeof b.note === "string"
      ? await sql()`update production_ears set verdict = ${b.verdict}, note = ${str(b.note, 1000)}, verdict_at = ${b.verdict ? new Date().toISOString() : null} where id = ${id} returning id, verdict, note`
      : await sql()`update production_ears set verdict = ${b.verdict}, verdict_at = ${b.verdict ? new Date().toISOString() : null} where id = ${id} returning id, verdict, note`;
    if (!out.length) return { status: 404, body: { error: "That line isn't on the list anymore." } };
    return { status: 200, body: { ok: true, ...out[0] } };
  }

  async function note(b) {
    await ensure();
    const id = String(b?.id || "");
    if (!ID.test(id) || typeof b?.note !== "string") return { status: 400, body: { error: "Say which line and the note." } };
    const out = await sql()`update production_ears set note = ${str(b.note, 1000)} where id = ${id} returning id, verdict, note`;
    if (!out.length) return { status: 404, body: { error: "That line isn't on the list anymore." } };
    return { status: 200, body: { ok: true, ...out[0] } };
  }

  return { ensure, get, put, verdict, note };
}
