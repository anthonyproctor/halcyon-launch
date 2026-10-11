"""Re-narrate chapter endings with the best-path state (the Audiobook's path) and rebuild both Audiobook files.
The old ending becomes end_alt (the engine plays whichever matches the reader's own ending).
usage: redo_endings.py <course root or .> <chapter> <new pages.json> <new story.json>"""
import json, os, re, subprocess, sys, tempfile
root, n, spec_p, story_p = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]
HERE = os.path.dirname(os.path.abspath(__file__)); PY = os.path.join(HERE, "..", ".ttsvenv", "bin", "python")
os.chdir(root); nn = f"{n:02d}"
spec, story = json.load(open(spec_p)), json.load(open(story_p))
pdir, sdir = f"audio/pages/f{n}", f"audio/pages/f{n}s"
T = json.load(open(f"{pdir}/timings.json"))
def run(*a, **k): subprocess.run(a, check=True, **k)
def dur(p): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))
tmp = tempfile.mkdtemp()
# 1. old ending -> end_alt, render the new ending into the page set
if "end_alt" not in T:
    os.rename(f"{pdir}/end.mp3", f"{pdir}/end_alt.mp3"); T["end_alt"] = T["end"]; json.dump(T, open(f"{pdir}/timings.json","w"), separators=(",",":"))
json.dump({**spec, "pages": {"end": spec["pages"]["end"]}, "plan": ["end"], "outkey": f"f{n}"}, open(f"{tmp}/end.json","w"))
run(PY, os.path.join(HERE,"render_pages.py"), f"{tmp}/end.json", env={**os.environ, "MERGE": "1"}, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
# 2. Story only: keep everything before the closing, append the new closing
segs = story["pages"]["story"]; closing = spec["pages"]["end"]
json.dump({**spec, "pages": {"tail": closing}, "plan": ["tail"], "outkey": f"_tail{n}"}, open(f"{tmp}/tail.json","w"))
run(PY, os.path.join(HERE,"render_pages.py"), f"{tmp}/tail.json", stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
tdir = f"audio/pages/_tail{n}"; TT = json.load(open(f"{tdir}/timings.json"))["tail"]
S = json.load(open(f"{sdir}/timings.json")); W = S["story"]["w"]
norm = lambda t: re.sub(r"[^a-z0-9]", "", t.lower())
first = [norm(w[0]) for w in T["end_alt"]["w"][:4]]   # first words of the old closing
k = next(i for i in range(len(W)-1, -1, -1) if [norm(w[0]) for w in W[i:i+4]] == first)
cut = round(W[k][1] - 0.1, 2)
run("ffmpeg","-nostdin","-loglevel","error","-y","-i",f"{sdir}/story.mp3","-t",str(cut),"-ar","24000","-ac","1",f"{tmp}/head.wav")
run("ffmpeg","-nostdin","-loglevel","error","-y","-i",f"{tdir}/tail.mp3","-ar","24000","-ac","1",f"{tmp}/tail.wav")
open(f"{tmp}/s.txt","w").write(f"file '{tmp}/head.wav'\nfile '{tmp}/tail.wav'\n")
run("ffmpeg","-nostdin","-loglevel","error","-y","-f","concat","-safe","0","-i",f"{tmp}/s.txt","-c:a","libmp3lame","-b:a","80k",f"{sdir}/story.mp3")
S["story"] = {"d": round(dur(f"{sdir}/story.mp3"),2), "w": [w for w in W if w[1] < cut] + [[w[0], round(w[1]+cut,2), round(w[2]+cut,2)] for w in TT["w"]]}
json.dump(S, open(f"{sdir}/timings.json","w"), separators=(",",":"))
subprocess.run(["rm","-rf",tdir])
# 3. whole files: page clips in plan order (4 s after a decision, 1.2 s otherwise), then the stings
def whole(parts, out, title):
    lst = []
    for i,(clip,gap) in enumerate(parts):
        run("ffmpeg","-nostdin","-loglevel","error","-y","-i",clip,"-ar","24000","-ac","1",f"{tmp}/c{i}.wav")
        run("ffmpeg","-nostdin","-loglevel","error","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(gap),f"{tmp}/g{i}.wav")
        lst += [f"file '{tmp}/c{i}.wav'", f"file '{tmp}/g{i}.wav'"]
    open(f"{tmp}/w.txt","w").write("\n".join(lst)+"\n")
    run("ffmpeg","-nostdin","-loglevel","error","-y","-f","concat","-safe","0","-i",f"{tmp}/w.txt","-c:a","libmp3lame","-b:a","80k","-metadata","title="+title,out)
    sting = os.path.relpath(os.path.join(HERE,"..","audio"), ".")
    t2 = out[:-4]+".tmp.mp3"
    run("ffmpeg","-nostdin","-loglevel","error","-y","-i",f"{sting}/sting-open.mp3","-i",out,"-i",f"{sting}/sting-close.mp3","-filter_complex",
        "[0:a]aresample=24000,volume=0.7[a];[1:a]aresample=24000[b];[2:a]aresample=24000,volume=0.7[c];[a][b][c]concat=n=3:v=0:a=1","-ac","1","-c:a","libmp3lame","-b:a","80k",t2)
    os.replace(t2, out)
title = f"The Halcyon Launch: {spec['title']}"
whole([(f"{pdir}/{pid}.mp3", 4 if pid.startswith("s") else 1.2) for pid in spec["plan"]], f"audio/full-ch{nn}.mp3", title)
whole([(f"{sdir}/story.mp3", 1.2)], f"audio/story/full-ch{nn}.mp3", title)
print("done", root, n, round(dur(f"audio/full-ch{nn}.mp3")/60,1), round(dur(f"audio/story/full-ch{nn}.mp3")/60,1))
