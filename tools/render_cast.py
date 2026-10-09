"""Render each cast member's self-introduction + signature line in their own Kokoro voice -> cast/voice/<id>.mp3"""
import json, os, re, subprocess, sys, numpy as np
from kokoro import KPipeline
sys.argv=[sys.argv[0]]
src=open("tools/render_pages.py").read()
ns={};exec(src.split("SR = 24000")[0].split('"""',2)[2], {"re":re,"json":json,"os":os,"sys":sys,"subprocess":subprocess,"np":np,"KPipeline":KPipeline}, ns)  # reuse CAST and PRON
CAST,PRON=ns["CAST"],ns["PRON"]
PRON_RE=re.compile(r"\b("+"|".join(map(re.escape,PRON))+r")\b")
pron=lambda t:PRON_RE.sub(lambda m:f"[{m.group(1)}](/{PRON[m.group(1)]}/)",t)
SR=24000;pipes={"a":KPipeline(lang_code="a"),"b":KPipeline(lang_code="b")}
data=json.loads(subprocess.check_output(["node","-e","globalThis.window={};new Function('window',require('fs').readFileSync('full/cast.js','utf8'))(globalThis.window);console.log(JSON.stringify(window.HALCYON_CAST))"]))
os.makedirs("cast/voice",exist_ok=True)
clean=lambda s:re.sub(r"<[^>]+>","",s).replace("“","").replace("”","").strip().strip('"')
for c in data:
    voice=CAST.get(c.get("speaker") or "") or CAST.get(c["name"].split()[0]) or CAST.get(c.get("voice") or "man","am_liam")
    pipe=pipes["b" if voice.startswith("b") else "a"]
    parts=[]
    for text in [clean(c["intro"]), clean(c["quote"]["text"]) if c.get("quote") else ""]:
        if not text: continue
        for r in pipe(pron(text),voice=voice,speed=1.0): parts.append(np.asarray(r.audio,np.float32))
        parts.append(np.zeros(int(SR*0.7),np.float32))
    a=np.concatenate(parts);pcm=(np.clip(a,-1,1)*32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg","-loglevel","error","-y","-f","s16le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","80k",f"cast/voice/{c['id']}.mp3"],input=pcm,check=True)
    print(c["id"],voice,round(len(a)/SR,1),"s")
