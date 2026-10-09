"""Render an episode script JSON to MP3 with Kokoro, one voice per character.
usage: render_kokoro.py script.json out.mp3 "Title" """
import json, sys, subprocess, numpy as np
from kokoro import KPipeline
CAST = {
 "narrator":"af_heart","ruth":"bf_emma","Ruth":"bf_emma",
 "Sam":"am_michael","Elena":"af_sarah","Grant":"am_puck","Lena":"af_nova","Theo":"am_fenrir","Priya":"af_sky",
 "Ochoa":"am_onyx","Dana":"af_jessica","Ray":"am_eric","Tomasz":"bm_lewis","Maria":"af_kore","Denise":"af_aoede",
 "Joan":"af_river","Hal":"am_liam","Devin":"am_echo","Victor":"bm_george","Ken":"am_adam","Keisha":"af_alloy",
 "Rob":"am_liam","Nora":"af_river","Helen":"bf_isabella","Alyssa":"af_nicole","Marcus":"am_echo","Douglas":"bm_daniel",
 "Owen":"am_adam","Ben":"am_liam","Nadia":"af_kore","man":"am_liam","woman":"af_alloy",
}
SR = 24000
pipes = {"a": KPipeline(lang_code="a"), "b": KPipeline(lang_code="b")}
script, out = sys.argv[1], sys.argv[2]
title = sys.argv[3] if len(sys.argv) > 3 else "The Halcyon Launch"
parts = []
def sil(sec): return np.zeros(int(SR*sec), dtype=np.float32)
prev = None
for seg in json.load(open(script)):
    if "pause" in seg: parts.append(sil(seg["pause"])); prev=None; continue
    voice = CAST.get(seg["v"], "af_heart")
    if prev is not None and prev != voice: parts.append(sil(0.18))
    pipe = pipes["b" if voice.startswith("b") else "a"]
    for _, _, a in pipe(seg["t"], voice=voice, speed=1.0):
        parts.append(np.asarray(a, dtype=np.float32))
    prev = voice
audio = np.concatenate(parts)
pcm = (np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes()
subprocess.run(["ffmpeg","-loglevel","error","-y","-f","s16le","-ar",str(SR),"-ac","1","-i","-",
  "-af","loudnorm=I=-16:TP=-1.5:LRA=11","-c:a","libmp3lame","-b:a","96k","-metadata","title="+title,out], input=pcm, check=True)
print("done", out, round(len(audio)/SR/60,1), "min")
