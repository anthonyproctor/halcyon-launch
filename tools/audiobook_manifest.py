"""Scan rendered audio and write audio/audiobook.json (which chapters have which edition, and lengths)."""
import glob, json, os, re, subprocess
def dur(p): return round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))/60,1)
M={"full":{},"ref":{}}
for p in sorted(glob.glob("audio/story/full-ch*.mp3")): n=int(re.findall(r"ch(\d+)",p)[-1]); M["full"].setdefault(n,{})["story"]={"src":p,"min":dur(p)}
for p in sorted(glob.glob("audio/story/ref-ch*.mp3")): n=int(re.findall(r"ch(\d+)",p)[-1]); M["ref"].setdefault(n,{})["story"]={"src":p,"min":dur(p)}
for p in sorted(glob.glob("audio/full-ch*.mp3")):
    n=int(re.findall(r"ch(\d+)",p)[-1])
    if os.path.exists(f"audio/pages/f{n}/timings.json"): M["full"].setdefault(n,{})["study"]={"src":p,"min":dur(p)}  # only Kokoro-era files
json.dump(M,open("audio/audiobook.json","w"),indent=1);print(json.dumps(M)[:400])
