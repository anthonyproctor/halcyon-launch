"""Render each cast member's self-introduction + signature line in their own Kokoro voice -> cast/voice/<id>.mp3

Usage: render_cast.py [cast_js] [window_path] [out_dir]
  No args renders the PMP cast: full/cast.js, window.HALCYON_CAST, cast/voice.
  Example (Private Pilot): render_cast.py courses/pilot/cast.js HALCYON_DATA.pilot.cast courses/pilot/cast/voice"""
import json, os, re, subprocess, sys, numpy as np
from kokoro import KPipeline
CAST_JS,WIN_PATH,OUT_DIR=(sys.argv[1:]+["full/cast.js","HALCYON_CAST","cast/voice"][len(sys.argv[1:]):])[:3]
sys.argv=[sys.argv[0]]
src=open("tools/render_pages.py").read()
ns={};exec(src.split("SR = 24000")[0].split('"""',2)[2], {"re":re,"json":json,"os":os,"sys":sys,"subprocess":subprocess,"np":np,"KPipeline":KPipeline}, ns)  # reuse CAST and PRON
CAST,PRON=ns["CAST"],ns["PRON"]
if CAST_JS!="full/cast.js":  # extra names for other courses; the PMP run (no args) is untouched
    PRON={**PRON,"Reyes":"ɹˈAəs","Lourdes":"lˈʊɹdəs","Marisol":"mˌæɹəsˈOl","HI":"hˈI","DAD":"dˈæd","Mija":"mˈihə"}
PRON_RE=re.compile(r"\b("+"|".join(map(re.escape,PRON))+r")\b")
pron=lambda t:PRON_RE.sub(lambda m:f"[{m.group(1)}](/{PRON[m.group(1)]}/)",t)
SR=24000;pipes={"a":KPipeline(lang_code="a"),"b":KPipeline(lang_code="b")}
data=json.loads(subprocess.check_output(["node","-e","globalThis.window={};new Function('window',require('fs').readFileSync(process.argv[1],'utf8'))(globalThis.window);console.log(JSON.stringify(process.argv[2].split('.').reduce((o,k)=>o[k],window)))",CAST_JS,WIN_PATH]))
os.makedirs(OUT_DIR,exist_ok=True)
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
    subprocess.run(["ffmpeg","-loglevel","error","-y","-f","s16le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","80k",f"{OUT_DIR}/{c['id']}.mp3"],input=pcm,check=True)
    print(c["id"],voice,round(len(a)/SR,1),"s")
