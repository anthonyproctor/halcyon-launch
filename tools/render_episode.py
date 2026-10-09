"""Render an episode script (JSON from episode_script.mjs) to MP3 with macOS voices + ffmpeg."""
import json, subprocess, sys, tempfile, os
VOICES = {"narrator": ("Ava (Premium)", 172), "ruth": ("Samantha (Enhanced)", 165)}
script, out = sys.argv[1], sys.argv[2]
segs = json.load(open(script))
tmp = tempfile.mkdtemp()
files = []
def silence(sec, i):
    f = f"{tmp}/s{i}.wav"
    subprocess.run(["ffmpeg","-loglevel","error","-f","lavfi","-i","anullsrc=r=24000:cl=mono","-t",str(sec),"-c:a","pcm_s16le",f],check=True)
    return f
for i, s in enumerate(segs):
    if "pause" in s:
        files.append(silence(s["pause"], i)); continue
    voice, rate = VOICES[s["v"]]
    aiff = f"{tmp}/v{i}.aiff"; wav = f"{tmp}/v{i}.wav"
    subprocess.run(["say","-v",voice,"-r",str(rate),"-o",aiff,s["t"]],check=True)
    subprocess.run(["ffmpeg","-loglevel","error","-i",aiff,"-ar","24000","-ac","1","-c:a","pcm_s16le",wav],check=True)
    files.append(wav)
lst = f"{tmp}/list.txt"
open(lst,"w").write("".join(f"file '{f}'\n" for f in files))
subprocess.run(["ffmpeg","-loglevel","error","-y","-f","concat","-safe","0","-i",lst,"-af","loudnorm=I=-16:TP=-1.5:LRA=11","-c:a","libmp3lame","-b:a","96k","-ac","1",
                "-metadata","title=The Halcyon Launch, Chapter 1: The Promotion","-metadata","artist=The Halcyon Launch",out],check=True)
print("done", out)
