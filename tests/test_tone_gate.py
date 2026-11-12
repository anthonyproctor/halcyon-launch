"""Unit tests for tools/tone_gate.py rules on made-up line features (no audio, no node, no Gemini).
run: python3 -m unittest tests/test_tone_gate.py"""
import os, sys, unittest

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools"))
import tone_gate as T


def line(who, hz, tone=None, n=0, rng=3.0, tilt=-20.0, text="A plain line of speech."):
    return {"who": who, "f0_med": hz, "tone": tone, "n": n, "n_voiced": 80, "text": text, "dup": False, "st_range": rng, "tilt_db": tilt,
            "voiced_frac": 0.8, "wps": 3.0, "st_sd": 1.0}


def base_lines(who, hz, k, spread=0.0, rng=3.0):
    return [line(who, hz * (1 + spread * ((i % 5) - 2) / 10), rng=rng + spread * ((i % 3) - 1)) for i in range(k)]


class PitchTests(unittest.TestCase):
    def setUp(self):
        self.B = T.baselines(base_lines("Teo", 100, 40, spread=0.3))

    def test_low_cue_read_far_above_base_is_flagged(self):
        """Teo, The Appeal Study ch10 o4_1 before its fix: "Low, insistent, shaken." at 181 Hz against a base near 100"""
        L = line("Teo", 181, "Low, insistent, shaken.")
        self.assertEqual(T.pitch_high(L, self.B["Teo"], [L], "Ana")[0], "PITCH")

    def test_lift_above_the_line_next_to_it_is_flagged(self):
        """Jordan, Danny's Logbook ch8: "It's on yours too." 5 st over "Fatigue's on here." two lines before"""
        a = line("Teo", 100, "Low, plain, serious.", n=0); b = line("Teo", 135, "Low, plain, serious.", n=2)
        self.assertEqual(T.pitch_high(b, self.B["Teo"], [a, b], "Ana")[0], "PITCH")

    def test_cues_that_ask_for_a_raised_voice_and_mentors_are_not_judged(self):
        self.assertIsNone(T.pitch_high(line("Teo", 181, "Surprised, glad."), self.B["Teo"], [], "Ana")[0])
        self.assertIsNone(T.pitch_high(line("Teo", 181, "Sharp, urgent."), self.B["Teo"], [], "Ana")[0])
        self.assertIsNone(T.pitch_high(line("Teo", 181, "Quiet, plain."), self.B["Teo"], [], "Teo")[0])

    def test_a_modest_lift_alone_passes(self):
        self.assertIsNone(T.pitch_high(line("Teo", 125, "Quiet, plain."), self.B["Teo"], [], "Ana")[0])


class SmallBaselineTests(unittest.TestCase):
    def test_small_baseline_borrows_the_other_edition(self):
        """Teo's first Story baseline had 10 lines; Study had more"""
        story = base_lines("Teo", 100, 10, spread=0.0); study = base_lines("Teo", 100, 40, spread=0.4)
        B = T.baselines(story, study)
        self.assertTrue(B["Teo"].get("borrowed")); self.assertEqual(B["Teo"]["lines"], 40)

    def test_small_baseline_gets_wider_floors(self):
        B = T.baselines(base_lines("Teo", 100, 10), [])
        self.assertGreaterEqual(B["Teo"]["f0st"][1], T.SMALL_FLOORS["f0st"]); self.assertGreaterEqual(B["Teo"]["st_range"][1], T.SMALL_FLOORS["st_range"])

    def test_solid_baseline_keeps_its_own(self):
        B = T.baselines(base_lines("Teo", 100, 40), base_lines("Teo", 100, 60))
        self.assertFalse(B["Teo"].get("borrowed")); self.assertEqual(B["Teo"]["f0st"][1], T.FLOORS["f0st"])


if __name__ == "__main__":
    unittest.main()
