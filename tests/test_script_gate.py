"""Unit tests for tools/script_gate.py alignment on made-up text and transcripts (no audio, no whisper, no Gemini).
run: python3 -m unittest tests/test_script_gate.py"""
import os, sys, unittest

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "tools"))
import script_gate as SG

SAY = {"Teo": "TAY-oh", "AFOQT": "A F O Q T", "KC-135": "K C one thirty five", "86400000": "eighty six million, four hundred thousand"}


def flags(sent, heard, say=SAY, course="zz-none"):
    """sent: the request text (respellings already in it); heard: what whisper wrote -> [(kind, words)]"""
    F = SG.Forms(say, course); S = F.source(sent)
    words = [(w, n * 0.3, n * 0.3 + 0.25) for n, w in enumerate(heard.split())]
    return [(f["kind"], f["words"]) for f in SG.check(S, sent.split(), words, lambda si: 0)]


LESSON = ("Absolute value is distance from zero, so it's never negative. Call it miles from the field. Nobody's ever minus six miles out, "
          "though I've flown with a few who acted like it. Work inside the bars first: the absolute value of 3 minus 11 is 8.")


class ScriptGateTests(unittest.TestCase):
    def test_clean_read_passes(self):
        heard = LESSON.replace("3 minus 11 is 8", "three minus eleven is eight").replace(":", ".")
        self.assertEqual(flags(LESSON, heard), [])

    def test_paragraph_read_twice_is_a_repeat(self):
        """Commission ch6 lesson, take 0 (q22 R2): breaks off at "minus" and reads the paragraph again from the top"""
        heard = "Absolute value is distance from zero, so it's never negative. Call it miles from the field. Nobody's ever minus " + LESSON
        got = flags(LESSON, heard)
        self.assertEqual(len(got), 1); self.assertEqual(got[0][0], "REPEAT"); self.assertGreaterEqual(got[0][1], 15)

    def test_ad_lib_is_an_insert(self):
        """Commission ch10 lesson (q22 R1): an added sentence between two of the text's"""
        sent = "Nobody has to have the conversation. Two more patterns."
        heard = "Nobody has to have the conversation. So that's how to hand off and manage. Two more patterns."
        self.assertEqual(flags(sent, heard), [("INSERT", 8)])

    def test_two_extra_words_are_not_flagged(self):
        self.assertEqual(flags("Call it miles from the field.", "Call it miles out from the field, okay."), [])

    def test_dropped_stretch_is_a_drop(self):
        sent = "Work inside the bars first, then take the absolute value, and only then compare the two numbers."
        heard = "Work inside the bars first, and only then compare the two numbers."
        self.assertEqual(flags(sent, heard), [("DROP", 5)])

    def test_three_dropped_words_are_not_flagged(self):
        self.assertEqual(flags("Work inside the bars first, then compare them.", "Work inside the bars, then compare them."), [])

    def test_respellings_and_spoken_forms_match(self):
        self.assertEqual(flags("TAY-oh took the A F O Q T on the K C one thirty five line.", "Teo took the AFOQT on the KC-135 line."), [])
        self.assertEqual(flags("It counts eighty six million, four hundred thousand milliseconds.", "It counts 86,400,000 milliseconds."), [])

    def test_pron_list_ok_forms_count(self):
        """afoqt's list says Pruett is heard as Pruitt; that's a match, not a swap"""
        self.assertEqual(flags("Pruitt signed it and Darrow filed it.", "Pruett signed it and Daro filed it.", say={"Pruett": "Pruitt"}, course="afoqt"), [])


if __name__ == "__main__":
    unittest.main()
