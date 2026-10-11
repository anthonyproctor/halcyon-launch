"""Re-render some pages of a chapter after a text edit, re-render the Story only edition, and rebuild both Audiobook files.
usage: rerender_pages.py <course root or .> <chapter> <pages.json> <story.json> <pid,pid,...>"""
import json, os, subprocess, sys, tempfile
root, n, spec_p, story_p, pids = sys.argv[1], int(sys.argv[2]), os.path.abspath(sys.argv[3]), os.path.abspath(sys.argv[4]), sys.argv[5].split(",")
HERE = os.path.dirname(os.path.abspath(__file__)); PY = os.path.join(HERE, "..", ".ttsvenv", "bin", "python"); RP = os.path.join(HERE, "render_pages.py")
os.chdir(root); nn = f"{n:02d}"; tmp = tempfile.mkdtemp()
spec = json.load(open(spec_p))
def run(*a, **k): subprocess.run(a, check=True, **k)
q = dict(stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
json.dump({**spec, "pages": {p: spec["pages"][p] for p in pids}, "plan": pids[:1]}, open(f"{tmp}/some.json","w"))
run(PY, RP, f"{tmp}/some.json", env={**os.environ, "MERGE": "1"}, **q)
run(PY, RP, story_p, f"audio/story/full-ch{nn}.mp3", **q)
pdir = f"audio/pages/f{n}"; lst = []
for i, pid in enumerate(spec["plan"]):
    run("ffmpeg","-nostdin","-loglevel","error","-y","-i",f"{pdir}/{pid}.mp3","-ar","24000","-ac","1",f"{tmp}/c{i}.wav")
    run("ffmpeg","-nostdin","-loglevel","error","-y","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(4 if pid.startswith("s") else 1.2),f"{tmp}/g{i}.wav")
    lst += [f"file '{tmp}/c{i}.wav'", f"file '{tmp}/g{i}.wav'"]
open(f"{tmp}/w.txt","w").write("\n".join(lst)+"\n")
run("ffmpeg","-nostdin","-loglevel","error","-y","-f","concat","-safe","0","-i",f"{tmp}/w.txt","-c:a","libmp3lame","-b:a","80k","-metadata",f"title=The Halcyon Launch: {spec['title']}",f"audio/full-ch{nn}.mp3")
sting = os.path.relpath(os.path.join(HERE,"..","audio"), ".")
for out in [f"audio/full-ch{nn}.mp3", f"audio/story/full-ch{nn}.mp3"]:
    t2 = out[:-4]+".tmp.mp3"
    run("ffmpeg","-nostdin","-loglevel","error","-y","-i",f"{sting}/sting-open.mp3","-i",out,"-i",f"{sting}/sting-close.mp3","-filter_complex",
        "[0:a]aresample=24000,volume=0.7[a];[1:a]aresample=24000[b];[2:a]aresample=24000,volume=0.7[c];[a][b][c]concat=n=3:v=0:a=1","-ac","1","-c:a","libmp3lame","-b:a","80k",t2)
    os.replace(t2, out)
print("done", root, n, pids)
