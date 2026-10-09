"""Render per-page narration clips + word timings + the whole-chapter episode with Kokoro.
usage: render_pages.py pages.json   (from tools/pages.mjs)"""
import json, os, re, sys, subprocess, numpy as np
from kokoro import KPipeline
CAST = {"narrator":"af_heart","ruth":"bf_emma","Ruth":"bf_emma","Sam":"am_michael","Elena":"af_sarah","Grant":"am_puck","Lena":"af_nova",
 "Theo":"am_fenrir","Priya":"af_sky","Ochoa":"am_onyx","Dana":"af_jessica","Ray":"am_eric","Tomasz":"bm_lewis","Maria":"af_kore",
 "Denise":"af_aoede","Joan":"af_river","Hal":"am_liam","Devin":"am_echo","Victor":"bm_george","Ken":"am_adam","Keisha":"af_alloy",
 "Rob":"am_liam","Nora":"af_river","Helen":"bf_isabella","Alyssa":"af_nicole","Marcus":"am_echo","Douglas":"bm_daniel","Owen":"am_adam",
 "Ben":"am_liam","Nadia":"af_kore","man":"am_liam","woman":"af_alloy"}
# word -> IPA for names and terms the voice gets wrong
PRON = {"Okafor":"oʊkˈɑfɔɹ","Okafors":"oʊkˈɑfɔɹz","LoDo":"lˈoʊdoʊ","Lindqvist":"lˈɪndkvɪst","Ochoa":"oʊtʃˈoʊə","Tomasz":"tˈɔmɑʃ",
 "Kraków":"kɹˈɑkuf","Krakow":"kɹˈɑkuf","Nowak":"nˈoʊvɑk","Adeyemi":"ˌɑdeɪjˈɛmi","ADKAR":"ˈædkɑɹ","PESTLE":"pˈɛsəl","Halcyon":"hˈælsiən"}
PRON_RE = re.compile(r"\b(" + "|".join(map(re.escape, PRON)) + r")\b")
def pron(t): return PRON_RE.sub(lambda m: f"[{m.group(1)}](/{PRON[m.group(1)]}/)", t)
SR = 24000
pipes = {"a": KPipeline(lang_code="a"), "b": KPipeline(lang_code="b")}
spec = json.load(open(sys.argv[1]))
key = ("r" if spec["track"]=="ref" else "f") + str(spec["num"])
outdir = f"audio/pages/{key}"; os.makedirs(outdir, exist_ok=True)
def enc(audio, path, title=None):
    pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes()
    cmd = ["ffmpeg","-loglevel","error","-y","-f","s16le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","80k"]
    if title: cmd += ["-metadata", "title="+title]
    subprocess.run(cmd + [path], input=pcm, check=True)
timings, clips = {}, {}
for pid, segs in spec["pages"].items():
    parts, words, t0, prev = [], [], 0.0, None
    for seg in segs:
        if "pause" in seg:
            a = np.zeros(int(SR*seg["pause"]), np.float32); parts.append(a); t0 += len(a)/SR; prev=None; continue
        voice = CAST.get(seg["v"], "af_heart")
        if prev is not None and prev != voice:
            a = np.zeros(int(SR*0.18), np.float32); parts.append(a); t0 += len(a)/SR
        pipe = pipes["b" if voice.startswith("b") else "a"]
        for r in pipe(pron(seg["t"]), voice=voice, speed=1.0):
            a = np.asarray(r.audio, np.float32)
            for tok in (r.tokens or []):
                if tok.start_ts is not None and re.search(r"\w", tok.text or ""):
                    words.append([tok.text, round(t0+tok.start_ts, 2), round(t0+(tok.end_ts or tok.start_ts), 2)])
            parts.append(a); t0 += len(a)/SR
        prev = voice
    audio = np.concatenate(parts) if parts else np.zeros(SR//10, np.float32)
    clips[pid] = audio
    enc(audio, f"{outdir}/{pid}.mp3")
    timings[pid] = {"d": round(len(audio)/SR, 2), "w": words}
json.dump(timings, open(f"{outdir}/timings.json", "w"), separators=(",", ":"))
# whole-chapter episode: page clips in plan order; after each decision, a pause to pick
ep = []
for pid in spec["plan"]:
    ep.append(clips[pid]); ep.append(np.zeros(int(SR*(4 if pid.startswith("s") else 1.2)), np.float32))
    if pid.startswith("s"): pass
whole = np.concatenate(ep)
name = f"audio/{'ch'+str(spec['num']) if spec['track']=='ref' else 'full-ch'+str(spec['num']).zfill(2)}"
dest = sys.argv[2] if len(sys.argv) > 2 else None
if dest: enc(whole, dest, title=f"The Halcyon Launch: {spec['title']}")
print("done", key, len(clips), "clips", round(len(whole)/SR/60, 1), "min")
