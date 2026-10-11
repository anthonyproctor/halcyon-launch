// Live METAR for the labs. aviationweather.gov doesn't allow cross-origin requests, so the page asks this function and it asks them.
// Their rules (https://aviationweather.gov/data/api/, read 2026-10-11): set a custom User-Agent, keep requests small, no more than
// 100 a minute. The response is cached at Vercel's edge for 5 minutes per station, so a whole class opening the lab at once still
// costs about one upstream request per station every 5 minutes. Most METARs only update once an hour anyway.
// GET /api/metar?ids=KAPA -> {id, raw, time} or {error}
const UA = "HalcyonLabs/1.0 (+https://halcyon-launch.vercel.app; METAR decoding lab for student pilots)";

function reply(res, code, obj, cache) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache || "no-store");
  res.end(JSON.stringify(obj));
}

export default async function handler(req, res) {
  if (req.method !== "GET") return reply(res, 405, { error: "Method not allowed." });
  const q = req.query || Object.fromEntries(new URL(req.url, "http://local").searchParams);
  const id = String(q.ids || "").trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9]{3}$/.test(id)) return reply(res, 400, { error: "One four letter station id, like KAPA." });
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`https://aviationweather.gov/api/data/metar?ids=${id}&format=json`, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctl.signal });
    clearTimeout(t);
    if (r.status === 204) return reply(res, 404, { error: "No recent report for that station." }, "public, s-maxage=120");
    if (!r.ok) return reply(res, 502, { error: "The weather feed didn't answer." });
    const j = await r.json();
    const m = Array.isArray(j) ? j[0] : null;
    if (!m || typeof m.rawOb !== "string") return reply(res, 502, { error: "The weather feed sent something unexpected." });
    return reply(res, 200, { id, raw: m.rawOb.trim(), time: m.reportTime || "" }, "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
  } catch (e) {
    return reply(res, 502, { error: "The weather feed didn't answer." });
  }
}
