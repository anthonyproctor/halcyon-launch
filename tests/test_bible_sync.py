"""tools/bible_sync.py on temp folders only (python3 -m unittest tests/test_bible_sync.py)."""
import os, sys, tempfile, time, unittest, glob, io, contextlib
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import bible_sync as B

def w(p, s, t=None):
    os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "w").write(s)
    if t: os.utime(p, (t, t))
def r(p): return open(p).read()

class SyncTest(unittest.TestCase):
    def setUp(self):
        self.t = tempfile.mkdtemp(); self.repo = os.path.join(self.t, "repo"); self.priv = os.path.join(self.t, "private", "bibles")
        os.makedirs(self.repo); os.makedirs(self.priv); os.makedirs(os.path.join(self.t, "private", "canon"))
        w(os.path.join(self.t, "private", "canon", "w.json"), "{}")
    def run_sync(self, *a):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return B.main(["--repo", self.repo, "--private", self.priv, *a])
    def hist(self): return glob.glob(os.path.join(self.priv, ".history", "*.bak"))

    def test_first_sync_newest_wins_and_backs_up_the_loser(self):
        now = time.time()
        w(f"{self.repo}/courses/x/BIBLE.md", "new", now); w(f"{self.priv}/courses/x/BIBLE.md", "old", now - 3600)
        self.assertEqual(self.run_sync(), 0)
        self.assertEqual(r(f"{self.priv}/courses/x/BIBLE.md"), "new")
        self.assertEqual([r(h) for h in self.hist()], ["old"])
        self.assertTrue(glob.glob(os.path.join(self.priv, ".history", "canon-*", "w.json")))

    def test_one_side_changed_after_a_sync_copies_that_side(self):
        w(f"{self.repo}/full/BIBLE.md", "a"); w(f"{self.priv}/full/BIBLE.md", "a"); self.run_sync()
        w(f"{self.priv}/full/BIBLE.md", "b", time.time() - 99999)  # older mtime, but it's the side that changed
        self.assertEqual(self.run_sync(), 0)
        self.assertEqual(r(f"{self.repo}/full/BIBLE.md"), "b")

    def test_both_changed_is_a_conflict_and_copies_nothing(self):
        w(f"{self.repo}/full/BIBLE.md", "a"); w(f"{self.priv}/full/BIBLE.md", "a"); self.run_sync()
        w(f"{self.repo}/full/BIBLE.md", "repo edit"); w(f"{self.priv}/full/BIBLE.md", "private edit")
        self.assertEqual(self.run_sync(), 2)
        self.assertEqual(r(f"{self.repo}/full/BIBLE.md"), "repo edit"); self.assertEqual(r(f"{self.priv}/full/BIBLE.md"), "private edit")

    def test_missing_side_is_created(self):
        w(f"{self.repo}/courses/y/BIBLE_v1.md", "only here")
        self.run_sync(); self.assertEqual(r(f"{self.priv}/courses/y/BIBLE_v1.md"), "only here")

    def test_check_changes_nothing(self):
        now = time.time(); w(f"{self.repo}/full/BIBLE.md", "new", now); w(f"{self.priv}/full/BIBLE.md", "old", now - 10)
        self.assertEqual(self.run_sync("--check"), 0)
        self.assertEqual(r(f"{self.priv}/full/BIBLE.md"), "old"); self.assertEqual(self.hist(), [])

if __name__ == "__main__": unittest.main()

class ArchiveTest(SyncTest):
    def test_private_only_archive_copies_stay_private(self):
        w(f"{self.priv}/courses/x/BIBLE.pre-depth.md", "old archive")
        self.run_sync(); self.assertFalse(os.path.exists(f"{self.repo}/courses/x/BIBLE.pre-depth.md"))
