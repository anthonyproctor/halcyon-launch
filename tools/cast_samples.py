"""Cast page voice samples ("Hear <name>") in the voice the book's narration uses now, regenerated when the casting changes.
usage: .ttsvenv/bin/python tools/cast_samples.py <course> [--check] [--force] [--only id,id] [--takes N]
  course: pmp (cast/v2/voice), pilot, cisa, ... (courses/<id>/cast/voice). Run from anywhere; paths are from the repo root.
  --check  list the samples that are stale or missing and exit 1 if any (no API calls, no model load)
  --force  remake every sample;  --only  just these ids;  --takes  takes per line to choose from (default 4)
Each voice folder has samples.json: for every cast id, the speaker key in tools/gemini_voices.json ("who"), the line the sample
reads ("line", a short line the character says in the book, ch1 to 3 where they speak there), and what the current mp3 was made
from ("made": a hash of model + voice + style + line, plus the take, similarity and pitch). A sample is stale when its character's
voice or style (courses.<id>.<who>, else default.<who>, the same lookup render_pages_gemini.py uses) or its line changed, or the
mp3 is missing. Edit a line in samples.json and re-run to change what a sample says.
Synthesis is the narration path: tools/gemini_tts.py (Batch API unless GEMINI_MODE=live, cached on disk, key from the keychain,
never printed), the same SAY respellings as render_pages_gemini.py, G.clean() loudness and trim, 24 kHz mono MP3 80k with 0.4 s
of tail. Each line gets --takes takes; the kept take is the one whisper hears fully, pitched on the cast gender, and closest to the
character's book centroid (WavLM-SV, tools/voice_gate.py, ~/.cache/halcyon-gemini-tts/voices/<course>-<audio>.json, every chapter
weighted by its line count). No centroid yet (the character hasn't been narrated): the take closest to the other takes."""
import ast, datetime, difflib, hashlib, json, os, re, subprocess, sys, tempfile
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.dont_write_bytecode = True; sys.path.insert(0, os.path.join(ROOT, "tools"))
import gemini_tts as G  # noqa: E402

WHISPER_MODEL = os.path.expanduser(os.environ.get("WHISPER_MODEL", "~/.cache/whisper/ggml-small.en.bin"))


def voice_dir(course):
    return os.path.join(ROOT, "cast", "v2", "voice") if course == "pmp" else os.path.join(ROOT, "courses", course, "cast", "voice")


def say_map():
    """the SAY respellings from render_pages_gemini.py (read, not imported: that module runs a render on import)"""
    src = open(os.path.join(ROOT, "tools", "render_pages_gemini.py")).read()
    for node in ast.parse(src).body:
        if isinstance(node, ast.Assign) and any(getattr(t, "id", "") == "SAY" for t in node.targets):
            return ast.literal_eval(node.value)
    return {}


SAY = say_map()
SAY_RE = re.compile(r"(?<![\w-])(" + "|".join(map(re.escape, sorted(SAY, key=len, reverse=True))) + r")(?![\w-])") if SAY else None


def request_text(line):
    """what goes to Gemini: the line as render_pages_gemini.gem_text() + say() would send it"""
    t = re.sub(r"[,;:]+$", ".", line.strip())
    if not re.search(r"[.!?]$", t): t += "."
    return SAY_RE.sub(lambda m: SAY[m.group(1)], t) if SAY_RE else t


def casting(course, who):
    V = json.load(open(os.path.join(ROOT, "tools", "gemini_voices.json")))
    return V["courses"].get(course, {}).get(who) or V["default"].get(who)


def spec_hash(voice, style, text):
    return hashlib.sha256(json.dumps([G.MODEL, voice, style or "", text], ensure_ascii=False).encode()).hexdigest()[:16]


def plan(course, M, force=False, only=None):
    """[(id, who, text, voice, style, hash, cast entry)] for the samples to make now"""
    out, d = [], voice_dir(course)
    for cid, s in M["samples"].items():
        if only and cid not in only: continue
        c = casting(course, s["who"])
        if not c: print(f"{cid}: no casting for {s['who']}, skipped"); continue
        text = request_text(s["line"]); h = spec_hash(c["voice"], c.get("style", ""), text)
        if force or not os.path.exists(os.path.join(d, cid + ".mp3")) or (s.get("made") or {}).get("hash") != h:
            out.append((cid, s["who"], text, c["voice"], c.get("style", ""), h, c))
    return out


def fill(items, log=print):
    """items: [(text, voice, style, take)]; makes every uncached take (batch or live, like gemini_tts.synth_many)"""
    need = []
    for (t, v, st, tk) in items:
        p = G._cache_path(t, v, st, tk)
        if not os.path.exists(p + ".wav"): need.append((p, t, v, st, tk))
        else: G.STATS["cached"] += 1
    if need and G.MODE == "batch":
        for _ in range(3):
            need = G._batch_run(need, log)
            if not need: break
    for it in need: G._live(*it)
    return {it: G._wav_to_float(open(G._cache_path(*it) + ".wav", "rb").read()) for it in items}


def centroid(course, who, audio_key):
    p = os.path.join(G.CACHE, "voices", f"{course}-{audio_key}.json")
    try: d = json.load(open(p)).get(who) or {}
    except Exception: return None, 0
    if not d: return None, 0
    vs = np.array([v for v, n in d.values()]); ws = np.array([n for v, n in d.values()], float)
    c = np.average(vs, axis=0, weights=ws); return c / np.linalg.norm(c), int(ws.sum())


def letters(t): return re.sub(r"[^a-z0-9]", "", t.lower())


def heard(paths):
    """whisper.cpp transcripts, path -> text"""
    out = {}
    if not os.path.exists(WHISPER_MODEL): return out
    args = ["whisper-cli", "-m", WHISPER_MODEL, "-np", "-nt", "-t", "8", "-oj"]
    for p in paths: args += ["-f", p]
    subprocess.run(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for p in paths:
        try: out[p] = " ".join(s["text"] for s in json.load(open(p + ".json"))["transcription"])
        except Exception: pass
    return out


def write_wav(a, p):
    import wave
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(G.SR); w.writeframes((np.clip(a, -1, 1) * 32767).astype("<i2").tobytes())


def decode_mp3(p):
    raw = subprocess.check_output(["ffmpeg", "-loglevel", "error", "-i", p, "-f", "s16le", "-ac", "1", "-ar", str(G.SR), "-"])
    return np.frombuffer(raw, "<i2").astype(np.float32) / 32768


def main():
    a = sys.argv[1:]
    if not a or a[0].startswith("-"): sys.exit(__doc__)
    course = a[0]; check = "--check" in a; force = "--force" in a
    only = set(a[a.index("--only") + 1].split(",")) if "--only" in a else None
    takes = int(a[a.index("--takes") + 1]) if "--takes" in a else 4
    d = voice_dir(course); mp = os.path.join(d, "samples.json")
    if not os.path.exists(mp): sys.exit(f"no {os.path.relpath(mp, ROOT)}: nothing to make for {course}")
    M = json.load(open(mp))
    todo = plan(course, M, force, only)
    if check:
        for t in todo: print("stale", t[0], t[1], t[3])
        print(f"{course}: {len(todo)} of {len(M['samples'])} samples stale"); sys.exit(1 if todo else 0)
    if not todo: print(f"{course}: all {len(M['samples'])} samples current"); return
    import warnings; warnings.filterwarnings("ignore")
    import voice_gate as VG
    jobs = [(t[2], t[3], t[4], k) for t in todo for k in range(takes)]
    print(f"{course}: {len(todo)} samples, {len(jobs)} takes")
    audio = fill(jobs)
    tmp = tempfile.mkdtemp(prefix="cast-samples-")
    report = []
    for (cid, who, text, voice, style, h, c) in todo:
        g = c.get("gender"); cen, nlines = centroid(course, who, M.get("audio", "audio"))
        cand = []
        for k in range(takes):
            x = G.clean(audio[(text, voice, style, k)]); p = os.path.join(tmp, f"{cid}-{k}.wav"); write_wav(x, p)
            cand.append({"take": k, "a": x, "wav": p, "emb": VG.embed(x, G.SR), "f0": VG.f0(x, G.SR), "s": len(x) / G.SR})
        H = heard([q["wav"] for q in cand])
        for q in cand:
            q["cov"] = difflib.SequenceMatcher(None, letters(text), letters(H.get(q["wav"], "")), autojunk=False).ratio() if H else None
            q["sim"] = float(q["emb"] @ cen) if cen is not None else None
            q["peer"] = float(np.mean([q["emb"] @ o["emb"] for o in cand if o is not q])) if len(cand) > 1 else 1.0
            q["on_gender"] = not (q["f0"] and ((g == "f" and q["f0"] < VG.F_LOW) or (g == "m" and q["f0"] > VG.M_HIGH)))
        pool = [q for q in cand if q["cov"] is None or q["cov"] >= 0.85] or cand
        pool = [q for q in pool if q["on_gender"]] or pool
        best = max(pool, key=lambda q: q["sim"] if q["sim"] is not None else q["peer"])
        old = os.path.join(d, cid + ".mp3"); prev = None
        if os.path.exists(old) and cen is not None:
            try: prev = round(float(VG.embed(decode_mp3(old), G.SR) @ cen), 3)
            except Exception: prev = None
        out = np.concatenate([best["a"], np.zeros(int(G.SR * 0.4), np.float32)])
        pcm = (np.clip(out, -1, 1) * 32767).astype("<i2").tobytes()
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(G.SR), "-ac", "1", "-i", "-",
                        "-c:a", "libmp3lame", "-b:a", "80k", old], input=pcm, check=True)
        r = lambda v: round(v, 3) if v is not None else None
        M["samples"][cid]["made"] = {"hash": h, "model": G.MODEL, "voice": voice, "style": style, "take": best["take"], "takes": takes,
                                     "sim": r(best["sim"]), "prev_sim": prev, "centroid_lines": nlines,
                                     "f0": round(best["f0"]) if best["f0"] else None, "gender": g, "heard": r(best["cov"]),
                                     "seconds": round(best["s"], 1), "date": datetime.date.today().isoformat()}
        lo = c.get("sim_min", VG.SIM_MIN)
        warn = [] if best["sim"] is None or best["sim"] >= lo else [f"sim {best['sim']:.3f} < {lo}"]
        if not best["on_gender"]: warn.append(f"pitch {best['f0']:.0f} Hz off gender {g}")
        if best["cov"] is not None and best["cov"] < 0.85: warn.append(f"heard {best['cov']:.2f}")
        if not 3.5 <= best["s"] <= 10.5: warn.append(f"{best['s']:.1f} s")
        report.append((cid, who, voice, prev, r(best["sim"]), [r(q["sim"]) for q in cand], best["take"], best["f0"], best["s"], warn))
        tmpf = mp + ".tmp"; json.dump(M, open(tmpf, "w"), indent=1, ensure_ascii=False); open(tmpf, "a").write("\n"); os.replace(tmpf, mp)
    print(f"{'id':10} {'who':9} {'voice':22} {'old':>6} {'new':>6}  takes                         take  f0    sec")
    for (cid, who, voice, prev, sim, sims, tk, f0, s, warn) in report:
        f = lambda v: f"{v:.3f}" if v is not None else "  -  "
        print(f"{cid:10} {who:9} {voice:22} {f(prev):>6} {f(sim):>6}  {' '.join(f(x) for x in sims):30} {tk:>4} {int(f0) if f0 else '-':>4} {s:5.1f}"
              + (("  ! " + "; ".join(warn)) if warn else ""))
    print(G.log_usage(f"cast samples {course}"))


if __name__ == "__main__":
    main()
