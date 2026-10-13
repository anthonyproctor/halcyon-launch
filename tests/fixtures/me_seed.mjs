// Made-up progress for the profile page tests (tests/me.spec.mjs): finished chapters, badges records with readiness snapshots, and study
// logs across two books. Runs in the page (page.evaluate). prefix: "halcyon." or the test profile's "halcyon-qa-test:".
// lead: "pmp" (PMP-heavy: 3 of 15 chapters, CISA 1 of 12) or "cisa" (CISA-heavy: 2 of 12, PMP 1 of 15).
export function seedMe({ prefix = "halcyon.", lead = "pmp" } = {}) {
  const day = k => { const d = new Date(Date.now() - k * 864e5); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const at = k => Date.now() - k * 864e5;
  const set = (k, v) => localStorage.setItem(prefix + k, JSON.stringify(v));
  const ch = (n, k) => ({ pos: 999, max: 999, picks: {}, m: { trust: 50, conf: 50, health: 50 }, score: 0, flags: {}, dom: {}, drills: {}, ex: null, quiz: null, doneAt: new Date(at(k)).toISOString(), n });
  const pmpN = lead === "pmp" ? 3 : 1, cisaN = lead === "pmp" ? 1 : 2;
  for (let n = 1; n <= pmpN; n++) set("c" + (200 + n), ch(n, 20 - n));
  for (let n = 1; n <= cisaN; n++) set("c" + (50100 + n), ch(n, 12 - n));
  // badges records: what each book has earned, and the readiness snapshot from the last visit
  const pmpGot = { "pmp-ch01": { at: at(19), back: 1 }, "pmp-streak-3": { at: at(14), seen: 1 } };
  if (pmpN >= 2) Object.assign(pmpGot, { "pmp-ch02": { at: at(18), seen: 1 }, "pmp-ch03": { at: at(17), seen: 1 }, "pmp-clean-run": { at: at(17), seen: 1, ch: [2, 3] } });
  set("c908", { v: 1, since: at(20), at: at(2), got: pmpGot, snap: { ready: lead === "pmp" ? 58 : null, parts: { x: null, s: 58, a: 74, k: 78, n: 60, t: 0 }, ch: [pmpN, 15], at: at(2) } });
  const cisaGot = { "cisa-ch01": { at: at(11), seen: 1 } };
  if (cisaN >= 2) Object.assign(cisaGot, { "cisa-ch02": { at: at(10), seen: 1 }, "cisa-clean-run": { at: at(10), seen: 1, ch: [2] }, "cisa-streak-3": { at: at(1), seen: 1 }, "cisa-rang-her": { at: at(11), seen: 1 } });
  set("c50908", { v: 1, since: at(12), at: at(1), got: cisaGot, snap: { ready: 64, parts: { x: 70, s: 55, a: 76, k: 72, n: 120, t: 1 }, ch: [cisaN, 12], at: at(1) } });
  // study logs: today, yesterday and the day before have 10+ minutes of audio across the two books (a 3 day streak, and the PMP part
  // alone is under 10 minutes on day 1, so the books are added up); a 5 day run two weeks back is the best
  const log = days => ({ v: 1, days: Object.fromEntries(days.map(([k, r, l]) => [day(k), { t: { dev1: [r, l] }, a: ["c1"] }])) });
  set("c905", log([[0, 300, 400], [1, 600, 300], [2, 1200, 900], [14, 0, 700], [15, 0, 700], [16, 900, 700], [17, 0, 700], [18, 0, 700], [30, 1800, 0]]));
  set("c50905", log([[0, 0, 400], [1, 300, 400], [9, 1500, 2400]]));
  set("course", lead);
  // read: 300+600+1200+900+1800 + 300+1500 = 6600 s; listened: 400+300+900+700*5 + 400+400+2400 = 8300 s
  return { read: 6600, listen: 8300, first: day(30) };
}
