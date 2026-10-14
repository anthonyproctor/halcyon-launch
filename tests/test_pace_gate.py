"""Unit tests for tools/pace_gate.py on synthetic page timings (no audio, no node, no Gemini).
run: python3 -m unittest tests/test_pace_gate.py"""
import json, os, sys, unittest

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools"))
import pace_gate as P


def load_fixture():
    with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "pace_ch3_open_all_day.json")) as f: return json.load(f)


def page(lines, gap=0.6):
    """lines: [(who, text, words per second)] -> (segments, timings words), each word spread evenly over its line"""
    segs, words, t = [], [], 0.2
    for who, text, wps in lines:
        segs.append({"v": who, "t": text}); segs.append({"pause": 0.5})
        toks = P.src_words(text); step = 1 / wps
        for w in toks:
            words.append([w.strip(".,?!"), round(t, 3), round(t + step * 0.85, 3)]); t += step
        t += gap
    return segs, words


def run(lines, base=None):
    segs, words = page(lines)
    L, why = P.lines_from_words(segs, words, "open")
    assert L is not None, why
    pages = {"open": L}
    return P.judge(pages, base if base is not None else P.char_baselines(L)), L


SLOW = 2.0   # a slow, deliberate scene (words per second)
BRISK = 3.6  # a quick back and forth


class PaceGate(unittest.TestCase):
    def test_rushed_short_reply_after_slow_lines_is_flagged(self):
        scene = [("Wendell", "Older revision and a different poppet spring in it.", SLOW),
                 ("Wendell", "I worked a stand in the old days and so did a lot of people.", SLOW),
                 ("narrator", "He picked up the gas bill and folded it back along its crease.", SLOW + 0.3),
                 ("Wendell", "You didn't drive out here at five in the morning for that.", SLOW),
                 ("Sam", "All day.", 6.0),
                 ("narrator", "Wendell reached under the console and came up with a shoebox of notebooks.", SLOW + 0.3)]
        flagged, L = run(scene)
        hit = [x for x in flagged if x["text"] == "All day."]
        self.assertEqual(len(hit), 1, [x["text"] for x in flagged])
        self.assertEqual(hit[0]["flag"], "fast")

    def test_normal_short_reply_in_brisk_scene_is_not_flagged(self):
        scene = [("Quinn", "Did you get the numbers from the stack lab this morning?", BRISK),
                 ("Sam", "Most of them, the rest are coming after lunch today.", BRISK),
                 ("Quinn", "Then put them on the wall before Garrett gets here.", BRISK),
                 ("Sam", "Will do.", BRISK * 0.8),
                 ("Quinn", "And tell Rafa his team is one box on that chart now.", BRISK),
                 ("narrator", "She went back to the cards and started on the red notes.", BRISK)]
        flagged, _ = run(scene)
        self.assertFalse([x for x in flagged if x["text"] == "Will do."], [x["text"] for x in flagged])

    def test_long_line_at_normal_pace_is_not_flagged(self):
        scene = [("narrator", "By seven the program room had become what Quinn called the big room.", 2.8),
                 ("Quinn", "Three numbers on every card, and nobody writes just one of them.", 3.0),
                 ("narrator", "The people who came were not the leads, they were the ones who would do the work.", 2.7),
                 ("Sam", "Thanks for coming down, all of you, I know it's early for most of you.", 2.9),
                 ("narrator", "A woman from the electrochemistry team had brought her own calculator along.", 2.8),
                 ("Quinn", "Green is if everything goes right, red is if it all goes wrong.", 3.1)]
        flagged, _ = run(scene)
        self.assertEqual(flagged, [])

    def test_slow_drag_is_flagged(self):
        scene = [("Abby", "Check the oil and then walk around the left wing to the tail.", 3.0),
                 ("Jordan", "I did the walkaround already, the fuel was clean in every sump.", 3.0),
                 ("Abby", "Good, then we can get the engine started and call ground.", 3.0),
                 ("Jordan", "Then we taxi out to the run up area and do the checklist there.", 1.4),
                 ("Abby", "Right, and read the whole checklist out loud this time, every line.", 3.1),
                 ("narrator", "She buckled in and pulled the headset down over her ears.", 2.9)]
        base = {"Abby": 3.0, "Jordan": 3.0, "narrator": 2.9}
        flagged, _ = run(scene, base)
        hit = [x for x in flagged if x["who"] == "Jordan" and x["flag"] == "slow"]
        self.assertEqual(len(hit), 1, [(x["who"], x["text"], x.get("why")) for x in flagged])

    def test_tone_cue_that_asks_for_the_pace_is_not_flagged(self):
        scene = [("Wendell", "Older revision and a different poppet spring in it.", SLOW),
                 ("Wendell", "I worked a stand in the old days and so did a lot of people.", SLOW),
                 ("narrator", "He picked up the gas bill and folded it back along its crease.", SLOW + 0.3),
                 ("Wendell", "You didn't drive out here at five in the morning for that.", SLOW),
                 ("Sam", "All day.", 6.0),
                 ("narrator", "Wendell reached under the console and came up with a shoebox of notebooks.", SLOW + 0.3)]
        segs, words = page(scene)
        segs[8]["tone"] = "Clipped, quick."
        L, _ = P.lines_from_words(segs, words, "open")
        self.assertEqual([x for x in P.judge({"open": L}, P.char_baselines(L)) if x["text"] == "All day."], [])
        segs[8]["tone"] = "Slow, tired, a little rueful."
        L, _ = P.lines_from_words(segs, words, "open")
        hit = [x for x in P.judge({"open": L}, P.char_baselines(L)) if x["text"] == "All day."]
        self.assertEqual(len(hit), 1); self.assertIn("against its tone cue", hit[0]["why"])

    def test_headings_and_codes_are_not_judged(self):
        self.assertEqual(P.skip_reason({"text": "Decision five. One body."}), "chapter or decision heading")
        self.assertEqual(P.skip_reason({"text": "METAR KAPA 141153Z 31016G27KT 10SM FEW080"}), "codes (weather, records)")
        self.assertIsNone(P.skip_reason({"text": "All day."}))

    def test_timings_that_dont_match_the_text_are_refused(self):
        segs, words = page([("Sam", "All day long.", 3.0)])
        words[1][0] = "night"; words[2][0] = "short"
        L, why = P.lines_from_words(segs, words, "open")
        self.assertIsNone(L)


class RealData(unittest.TestCase):
    """PMP v2 ch3, page open: the rushed "All day." heard by ear on 2026-10-13, frozen as text and timings (no audio)."""
    def test_all_day_on_ch3_open_is_flagged(self):
        fx = load_fixture()
        segs, words = [], []
        for x in fx["lines"]:
            segs.append({"v": x["who"], "t": x["text"], **({"tone": x["tone"]} if x["tone"] else {})}); words += x["words"]
        L, why = P.lines_from_words(segs, words, "open")
        self.assertIsNotNone(L, why)
        for line, x in zip(L, fx["lines"]): line["start"], line["end"] = x["start"], x["end"]  # the spoken part from the page mp3
        P.finish(L)
        hit = [x for x in P.judge({"open": L}, fx["character_baselines"]) if x["text"] == "All day."]
        self.assertEqual(len(hit), 1)
        self.assertEqual(hit[0]["flag"], "fast")
        self.assertGreaterEqual(hit[0]["expected"] / hit[0]["dur"], 2.0)  # well over the SHORT_FAST_X bar, not scraping it
        self.assertEqual([x["text"] for x in P.judge({"open": L}, fx["character_baselines"])], ["All day."])  # and nothing else here


class RenderHooks(unittest.TestCase):
    """the pure pieces render_pages_gemini.py uses for its pace pass (no TTS, no audio)"""
    def fixture_page(self, tone=None):
        fx = load_fixture()
        segs, words = [], []
        for x in fx["lines"]:
            t = tone if (tone is not None and x["text"] == "All day.") else x["tone"]
            segs.append({"v": x["who"], "t": x["text"], **({"tone": t} if t else {})}); words += x["words"]
        L, why = P.lines_from_words(segs, words, "open")
        for line, x in zip(L, fx["lines"]): line["start"], line["end"] = x["start"], x["end"]
        P.finish(L)
        # the spans assemble() would hand the loop: one per said segment, keyed like the renderer's request keys
        spans = [{"i": line["i"], "v": line["who"], "voice": "V_" + line["who"], "style": "style of " + line["who"],
                  "src": line["text"], "req": line["text"]} for line in L]
        return {"open": L}, {"open": spans}

    def test_refine_with_array_finds_the_voiced_audio(self):
        try: import numpy as np
        except ImportError: self.skipTest("numpy")
        sr = 24000; a = np.zeros(sr * 3, np.float32)
        a[int(0.9 * sr):int(1.6 * sr)] = 0.3 * np.sin(np.arange(int(0.7 * sr)) * 2 * np.pi * 180 / sr)  # speech from 0.9 to 1.6 s
        segs, words = [{"v": "Sam", "t": "All day."}], [["All", 0.95, 1.05], ["day", 1.1, 1.3]]
        L, _ = P.lines_from_words(segs, words, "open")
        self.assertTrue(P.refine_with_array(L, a, sr))
        self.assertAlmostEqual(L[0]["start"], 0.9, delta=0.02); self.assertAlmostEqual(L[0]["end"], 1.6, delta=0.02)

    def test_hint_builder(self):
        self.assertEqual(P.hint_for("fast"), "Unhurried, matching the room.")
        self.assertEqual(P.with_hint("", P.hint_for("fast")), "Unhurried, matching the room.")
        self.assertEqual(P.with_hint("Slow, tired, a little rueful.", P.hint_for("fast")), "Slow, tired, a little rueful. Unhurried, matching the room.")
        self.assertEqual(P.with_hint("Dry and calm", P.hint_for("slow")), "Dry and calm. Keep it moving, at the pace of the room.")

    def test_keep_best_order(self):
        H = P.new_hist
        def h(**k):
            x = H(); names = ["whisper", "cov", "sim", "share", "pace", "dist"]
            for n, v in k.items(): x[names.index(n)] = v
            return x
        # whisper and coverage come first, then pace ok, then pace distance, then voice similarity
        self.assertGreater(P.take_rank(h(whisper=True, pace=False)), P.take_rank(h(whisper=False, pace=True)))
        self.assertGreater(P.take_rank(h(cov=True, pace=False)), P.take_rank(h(cov=False, pace=True)))
        self.assertGreater(P.take_rank(h(pace=True, sim=0.90)), P.take_rank(h(pace=False, sim=0.99)))
        self.assertGreater(P.take_rank(h(dist=0.1, sim=0.90)), P.take_rank(h(dist=0.6, sim=0.99)))
        self.assertGreater(P.take_rank(h(dist=0.12, sim=0.97)), P.take_rank(h(dist=0.08, sim=0.93)))  # same pace to 0.1: voice decides
        self.assertEqual(P.take_rank([True, True, 0.95, 1.0]), P.take_rank([True, True, 0.95, 1.0, True, 0.0]))  # old 4 field records

    def test_loop_bumps_all_day_with_a_pace_hint(self):
        pages, spans = self.fixture_page()
        flags, scores = P.check_pages(pages, spans)
        self.assertEqual([f["src"] for f in flags], ["All day."])
        f = flags[0]
        self.assertEqual((f["flag"], f["hint"], f["report_only"]), ("fast", "Unhurried, matching the room.", False))
        self.assertEqual(f["req"], ("V_Sam", "style of Sam", "All day."))
        self.assertIn(("open", f["i"], False), [(p, i, ok) for p, i, ok, _ in scores])
        self.assertTrue(all(ok for p, i, ok, _ in scores if i != f["i"]))

    def test_reroll_skip_speaker_is_report_only(self):
        pages, spans = self.fixture_page()
        flags, _ = P.check_pages(pages, spans, skip={"Sam"})
        self.assertTrue(flags[0]["report_only"])

    def test_tone_asking_for_quick_suppresses_the_flag(self):
        pages, spans = self.fixture_page(tone="Clipped, quick.")
        flags, scores = P.check_pages(pages, spans)
        self.assertEqual(flags, [])
        self.assertTrue(all(ok for *_, ok, _ in scores))


if __name__ == "__main__":
    unittest.main()
