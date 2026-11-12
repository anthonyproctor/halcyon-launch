"""Unit tests for rules in tools/render_pages_gemini.py, run on a made-up page spec and a temp cache (no Gemini, no whisper,
no audio rendered): a pace round never brings back a hinted take older than the line's base take, the option that keeps the
halves of a split said line in one run, and the page records behind the incremental render (what is reused, what is held).
run: python3 -m unittest tests/test_render_rules.py"""
import contextlib, io, json, os, shutil, sys, tempfile, unittest, wave

sys.dont_write_bytecode = True
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import gemini_tts as G
import pace_gate as PG

RPG = os.path.join(ROOT, "tools", "render_pages_gemini.py")
SRC = open(RPG).read()
UNTIL_RUN_JOBS = SRC[:SRC.index("def run_jobs")]
UNTIL_ROUNDS = SRC[:SRC.index("\nfor rnd in range(ROUNDS):")]


def silent_wav(seconds=0.5):
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(G.SR)
    w.writeframes(b"\0\0" * int(G.SR * seconds)); w.close(); return b.getvalue()


class Env:
    """a temp cache and cwd for one exec of the renderer; synth_many writes silence instead of calling Gemini"""
    def __init__(self):
        self.dir = tempfile.mkdtemp(prefix="rpgtest-"); self.cache = os.path.join(self.dir, "cache"); os.makedirs(self.cache)
        self.saved = (G.CACHE, G._TAKES_P, G.synth_many)
        G.CACHE = self.cache; G._TAKES_P = os.path.join(self.cache, "takes.json")
        self.synthesized = []
        def fake(items, workers=6, log=None):
            out = {}
            for (t, v, st) in dict.fromkeys(items):
                p = G._cache_path(t, v, st, G.current_take(t, v, st))
                if not os.path.exists(p + ".wav"):
                    os.makedirs(os.path.dirname(p), exist_ok=True); open(p + ".wav", "wb").write(silent_wav()); self.synthesized.append((t, v, st))
                out[(t, v, st)] = G._wav_to_float(open(p + ".wav", "rb").read())
            return out
        G.synth_many = fake

    def cache_take(self, k, take):
        v, st, t = k; p = G._cache_path(t, v, st, take); os.makedirs(os.path.dirname(p), exist_ok=True); open(p + ".wav", "wb").write(silent_wav())

    def set_take(self, k, take):
        v, st, t = k; d = G._load_takes(); d[G.base_hash(t, v, st)] = take; json.dump(d, open(G._TAKES_P, "w"))

    def run(self, spec, src, env=None):
        path = os.path.join(self.dir, "spec.json"); json.dump(spec, open(path, "w"))
        keep = dict(os.environ); argv = list(sys.argv); cwd = os.getcwd()
        os.environ.update({"GEMINI_COURSE": "lsat", "VOICE_GATE": "0"}); os.environ.pop("GEMINI_RUN_KEEP_SPLIT", None); os.environ.update(env or {})
        sys.argv[:] = ["x", path]; os.chdir(self.dir); tmp_was = tempfile.tempdir; tempfile.tempdir = self.dir
        try:
            g = {"__file__": RPG, "__name__": "x"}; exec(compile(src, RPG, "exec"), g); return g
        finally:
            os.chdir(cwd); sys.argv[:] = argv; os.environ.clear(); os.environ.update(keep); tempfile.tempdir = tmp_was

    def close(self):
        G.CACHE, G._TAKES_P, G.synth_many = self.saved; shutil.rmtree(self.dir, ignore_errors=True)


LUIS = {"track": "full", "num": 6, "title": "t", "plan": ["s9"], "pages": {"s9": [{"v": "narrator", "t": "He smiled at her."},
        {"v": "Luis", "t": "This the part where you get me out, mija?"}]}}


class HintedTakeTests(unittest.TestCase):
    def setUp(self): self.E = Env()
    def tearDown(self): self.E.close()

    def keys(self, g):
        seg = g["spec"]["pages"]["s9"][1]; rk = g["cast_seg"](seg) + (g["request_text"]("s9", 1, seg),)
        hk = g["cast_seg"](dict(seg, pace_hint=PG.PACE_HINT["fast"])) + (g["say"](g["gem_text"](seg)),)
        return rk, hk

    def test_requested_reroll_never_gets_the_old_hinted_take(self):
        """The Appeal ch6 s9_v1, 2026-11-11: the base take was bumped to 3, the hinted take 0 was cached the day before"""
        g = self.E.run(LUIS, UNTIL_RUN_JOBS); rk, hk = self.keys(g)
        for k in range(3): self.E.cache_take(rk, k)
        self.E.cache_take(hk, 0); self.E.set_take(rk, 3)  # bump asked for: take 3 has no audio yet
        g = self.E.run(LUIS, UNTIL_ROUNDS)
        self.assertIn(rk, g["NEW_HERE"]); self.assertTrue(g["hint_is_old"](rk, hk))
        g["fresh_hint"](rk, hk)
        self.assertEqual(G.current_take(hk[2], hk[0], hk[1]), 1)
        self.assertFalse(os.path.exists(g["_take_wav"](hk)), "the hinted request now points at a take with no audio: a fresh one")
        self.assertEqual(len(g["OLD_HINTS"]), 1)

    def test_unchanged_rerender_reuses_the_hinted_take(self):
        g = self.E.run(LUIS, UNTIL_RUN_JOBS); rk, hk = self.keys(g)
        self.E.cache_take(rk, 0); self.E.cache_take(hk, 0)
        g = self.E.run(LUIS, UNTIL_ROUNDS)
        self.assertNotIn((rk[2], rk[0], rk[1]), self.E.synthesized); self.assertNotIn(rk, g["NEW_HERE"]); self.assertFalse(g["hint_is_old"](rk, hk))

    def test_record_decides_once_written(self):
        g = self.E.run(LUIS, UNTIL_RUN_JOBS); rk, hk = self.keys(g)
        self.E.cache_take(rk, 2); self.E.cache_take(hk, 0); self.E.set_take(rk, 2)
        g = self.E.run(LUIS, UNTIL_ROUNDS); bh = G.base_hash(hk[2], hk[0], hk[1])
        g["_pb_save"]({bh: {"base": 2, "hinted": 0}}); self.assertFalse(g["hint_is_old"](rk, hk), "made for base take 2, which is current")
        g["_pb_save"]({bh: {"base": 1, "hinted": 0}}); self.assertTrue(g["hint_is_old"](rk, hk), "made for base take 1, the line has take 2 now")

    def test_prefetched_reroll_still_counts_as_new(self):
        g = self.E.run(LUIS, UNTIL_RUN_JOBS); rk, hk = self.keys(g)
        self.E.cache_take(rk, 0); self.E.cache_take(hk, 0); self.E.set_take(rk, 1)
        with self.assertRaises(SystemExit), contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            self.E.run(LUIS, UNTIL_ROUNDS, {"GEMINI_PREFETCH": "1"})
        g = self.E.run(LUIS, UNTIL_ROUNDS)  # the cache is full now; the render after the prefetch
        self.assertIn(rk, g["NEW_HERE"]); self.assertTrue(g["hint_is_old"](rk, hk))


def ana_page():
    """Ana's run reaches 1,469 characters with "Ten minutes each in the morning." and 1,502 with the second half"""
    filler = "Ana read the card again and set it down by the lamp, and the clock in the hall said it was late."
    segs = []
    for n in range(13): segs += [{"v": "Ana", "t": f"Line {n}. " + filler}, {"v": "narrator", "t": "She waited."}]
    segs += [{"v": "Ana", "t": "She said it again" + " and again" * 5 + "."}, {"v": "narrator", "t": "She waited."}]
    segs += [{"v": "Ana", "t": "Ten minutes each in the morning,"}, {"v": "narrator", "t": "Ana said."}, {"v": "Ana", "t": "Where's the fight? Not the case."}]
    return {"track": "full", "num": 11, "title": "t", "plan": ["story"], "pages": {"story": segs}}


class SplitLineTests(unittest.TestCase):
    def setUp(self): self.E = Env()
    def tearDown(self): self.E.close()

    def runs(self, g):
        segs = g["spec"]["pages"]["story"]; first = len(segs) - 3; last = len(segs) - 1
        return g["RUN_OF"][("story", first)][0], g["RUN_OF"][("story", last)][0]

    def test_split_pairs_finds_the_tagged_halves(self):
        g = self.E.run(ana_page(), UNTIL_RUN_JOBS); segs = g["spec"]["pages"]["story"]
        self.assertEqual(g["split_pairs"](segs), [(len(segs) - 3, len(segs) - 1)])
        self.assertEqual(g["split_pairs"]([{"v": "Ana", "t": "Done."}, {"v": "narrator", "t": "Ana said."}, {"v": "Ana", "t": "Go."}]), [])

    def test_off_the_halves_can_fall_in_two_runs(self):
        a, b = self.runs(self.E.run(ana_page(), UNTIL_RUN_JOBS, {"GEMINI_RUN_KEEP_SPLIT": "0"}))
        self.assertNotEqual(a, b, "the page is built so the 1,500 character cut falls between the halves")

    def test_on_by_default_the_halves_share_a_run(self):
        for env in (None, {"GEMINI_RUN_KEEP_SPLIT": "1"}):
            a, b = self.runs(self.E.run(ana_page(), UNTIL_RUN_JOBS, env))
            self.assertEqual(a, b); self.assertTrue(a.startswith("Ten minutes each in the morning."))


def two_pages():
    return {"track": "full", "num": 6, "title": "t", "plan": ["s0", "o0_0"], "pages": {
        "s0": [{"v": "narrator", "t": "Decision one. The hearing."}, {"pause": 0.5}, {"v": "narrator", "t": "The room went quiet when she stood."},
               {"v": "Ana", "t": "We are not done here, not by a long way."}],
        "o0_0": [{"v": "narrator", "t": "She waited for the answer."}, {"pause": 0.5}, {"v": "narrator", "t": "That was the right call to make."}]}}


class IncrementalTests(unittest.TestCase):
    """the page records behind the incremental render: what makes a page reusable, what is held, and the episode join"""
    def setUp(self): self.E = Env()
    def tearDown(self): self.E.close()

    def record(self, g, pid, hints=()):
        """write what a render of page pid leaves on disk: its mp3, timings entry, samples and record"""
        out = os.path.join(self.E.dir, g["outdir"]); os.makedirs(out, exist_ok=True); os.makedirs(g["STATE_DIR"], exist_ok=True)
        mp3 = f"mp3 of {pid}".encode(); open(os.path.join(out, pid + ".mp3"), "wb").write(mp3)
        tp = os.path.join(out, "timings.json"); t = json.load(open(tp)) if os.path.exists(tp) else {}
        t[pid] = {"d": 1.5, "w": [["word", 0.1, 0.4]]}; json.dump(t, open(tp, "w"), separators=(",", ":"))
        pcm = bytes(range(200)) * 10; cwd = os.getcwd(); os.chdir(self.E.dir)
        try: g["flac_write"](pcm, os.path.join(g["STATE_DIR"], pid + ".flac"))
        finally: os.chdir(cwd)
        keys = [list(k) + [g["_take"](k)] for _, k in g["BASE_KEYS"][pid]]
        st = {"v": g["RENDER_VERSION"], "fp": g["page_fp"](pid), "deps": keys, "keys": keys, "mp3": g["_sha"](mp3), "tim": g["tim_sha"](t[pid]),
              "report": {"round": 0, "bad": [], "low": [], "missing_words": 0.0, "coverage_fail": []}, "spans": [], "emb": [], "pace": [],
              "hints": [list(h) for h in hints], "pcm": g["_sha"](pcm)}
        json.dump(st, open(os.path.join(g["STATE_DIR"], pid + ".json"), "w"))

    def first(self, spec, env=None):
        g = self.E.run(spec, UNTIL_RUN_JOBS, env)
        for pid in spec["pages"]: self.record(g, pid)
        return g

    def test_unchanged_pages_are_reused_and_load_nothing(self):
        spec = two_pages(); self.first(spec)
        g = self.E.run(spec, UNTIL_ROUNDS)
        self.assertEqual(set(g["REUSED"]), {"s0", "o0_0"}); self.assertEqual(g["jobs"], {})
        self.assertEqual(g["PCM"]["s0"], bytes(range(200)) * 10, "the episode gets the recorded samples back exactly")

    def test_a_cue_change_renders_only_its_page(self):
        spec = two_pages(); self.first(spec)
        spec["pages"]["s0"][3]["tone"] = "Quiet, certain."
        g = self.E.run(spec, UNTIL_ROUNDS)
        self.assertEqual(set(g["REUSED"]), {"o0_0"}); self.assertIn("s0", g["WHY_NOT"])
        self.assertTrue(all(k[2] != "She waited for the answer." for k in g["jobs"]), "the reused page's requests are not loaded")

    def test_a_take_bump_renders_its_page(self):
        spec = two_pages(); g = self.first(spec)
        k = g["BASE_KEYS"]["o0_0"][0][1]; self.E.set_take(k, 1)
        g = self.E.run(spec, UNTIL_ROUNDS)
        self.assertEqual(set(g["REUSED"]), {"s0"})

    def test_casting_change_changes_the_fingerprint(self):
        spec = two_pages(); g = self.E.run(spec, UNTIL_RUN_JOBS); fp = g["page_fp"]("o0_0")
        g["CMAP"]["narrator"] = dict(g["_cfg"]("narrator"), sim_min=0.99)
        self.assertNotEqual(g["page_fp"]("o0_0"), fp, "a gate bar on the cast entry is part of the page")

    def test_a_page_whose_files_changed_is_rendered(self):
        spec = two_pages(); g = self.first(spec)
        open(os.path.join(self.E.dir, g["outdir"], "s0.mp3"), "wb").write(b"rendered by something else")
        t = os.path.join(self.E.dir, g["outdir"], "timings.json"); d = json.load(open(t)); d["o0_0"]["d"] = 9.0; json.dump(d, open(t, "w"))
        g = self.E.run(spec, UNTIL_ROUNDS)
        self.assertEqual(g["REUSED"], {}); self.assertIn("mp3", g["WHY_NOT"]["s0"]); self.assertIn("timings", g["WHY_NOT"]["o0_0"])

    def test_full_and_gate_settings_ignore_records(self):
        spec = two_pages(); self.first(spec)
        self.assertEqual(self.E.run(spec, UNTIL_ROUNDS, {"FULL": "1"})["REUSED"], {})
        self.assertEqual(self.E.run(spec, UNTIL_ROUNDS, {"GEMINI_REROLL": "0"})["REUSED"], {}, "a page gated another way is not reused")

    def test_only_new_requests_may_reroll(self):
        spec = two_pages(); self.first(spec)
        spec["pages"]["s0"].append({"v": "narrator", "t": "A new line the fix added."})
        g = self.E.run(spec, UNTIL_ROUNDS)
        new = [k for k in g["jobs"] if k[2] == "A new line the fix added."][0]
        old = [k for k in g["jobs"] if k[2] == "The room went quiet when she stood."][0]
        self.assertTrue(g["may_reroll"]("s0", new)); self.assertFalse(g["may_reroll"]("s0", old), "an unchanged line is held")
        self.assertFalse(g["may_reroll"]("o0_0", new), "nothing on a reused page re-rolls")
        g = self.E.run(spec, UNTIL_ROUNDS, {"REROLL_HELD": "1"}); self.assertTrue(g["may_reroll"]("s0", old))

    def test_a_changed_page_gets_its_pace_hints_back(self):
        spec = two_pages(); g = self.E.run(spec, UNTIL_RUN_JOBS)
        k = dict(g["BASE_KEYS"]["s0"])[2]; hint = PG.PACE_HINT["fast"]
        for pid in spec["pages"]: self.record(g, pid, hints=[[2, hint, list(k), 0]] if pid == "s0" else ())
        spec["pages"]["s0"][0]["t"] = "Decision one. The hearing room."
        g = self.E.run(spec, UNTIL_ROUNDS)
        self.assertEqual(g["spec"]["pages"]["s0"][2].get("pace_hint"), hint); self.assertIn(("s0", 2), g["PACE_ORIG"])
        self.assertIn(g["seg_key"]("s0", 2, g["spec"]["pages"]["s0"][2]), g["jobs"], "the hinted request is what the page sends")
        self.E.set_take(k, 1); g = self.E.run(spec, UNTIL_ROUNDS)
        self.assertIsNone(g["spec"]["pages"]["s0"][2].get("pace_hint"), "a hint made for another take is dropped")

    def test_ctc_memo_aligns_the_same_samples_once(self):
        g = self.E.run(two_pages(), UNTIL_ROUNDS); import numpy as np, types
        calls = []
        fake = types.ModuleType("align_ctc"); fake.align_words = lambda a, sr, src, said: calls.append(len(a)) or [(0.1 * k, 0.1 * k + 0.08) for k in range(len(src))]
        keep = sys.modules.get("align_ctc"); sys.modules["align_ctc"] = fake
        try:
            audio = np.random.default_rng(3).uniform(-0.5, 0.5, G.SR * 3).astype(np.float32)
            sp = {"src": "The room went quiet.", "sent": "The room went quiet.", "s": 1.0, "e": 2.0}
            w1 = g["ctc_words"](audio, [sp]); w2 = g["ctc_words"](audio, [sp])
            self.assertEqual(w1, w2); self.assertEqual(len(calls), 1, "the same samples and words are aligned once")
            audio[int(G.SR * 1.5)] += 0.01; g["ctc_words"](audio, [sp]); self.assertEqual(len(calls), 2, "one changed sample aligns again")
        finally:
            if keep is None: sys.modules.pop("align_ctc", None)
            else: sys.modules["align_ctc"] = keep

    def test_episode_join_by_samples_matches_the_float_join(self):
        g = self.E.run(two_pages(), UNTIL_RUN_JOBS); import numpy as np
        rng = np.random.default_rng(7); a, b = (rng.uniform(-1.2, 1.2, 4801).astype(np.float32) for _ in range(2)); z = np.zeros(2880, np.float32)
        self.assertEqual(g["q16"](np.concatenate([a, z, b, z])), g["q16"](a) + b"\0\0" * 2880 + g["q16"](b) + b"\0\0" * 2880)


if __name__ == "__main__":
    unittest.main()
