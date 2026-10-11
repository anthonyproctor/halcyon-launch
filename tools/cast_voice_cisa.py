"""Render a short voice sample for each CISA cast member ("Exception Noted") -> courses/cisa/cast/voice/<id>.mp3.
Same output format as tools/render_cast.py (Kokoro, 24 kHz mono, MP3 80k), but each sample is one short line the
character actually says in chapter 1 (courses/cisa/full/ch01.js), picked to avoid spoilers, rather than the cast.js
intro. Run from the repo root with the TTS venv: .ttsvenv/bin/python tools/cast_voice_cisa.py"""
import os, re, subprocess, numpy as np
from kokoro import KPipeline

SR = 24000
OUT = "courses/cisa/cast/voice"
# id: (Kokoro voice, line from chapter 1)
LINES = {
 "henry": ("bm_lewis", "Breakfast. Most Saturdays, at a diner on Colfax. She taught me how you lot audit things."),
 "dot": ("af_nicole", "Lime Street. It's Dot. I know it's late, go back to sleep after this. Bring a pen. Bring two."),  # her voicemail
 "lou": ("am_onyx", "Plenty of people dislike me, and my wife's one of them. Give me names or it's just weather."),
 "giles": ("bm_daniel", "Pop down to Meridian this afternoon, have a poke about, see what they've got, and give me a view by Friday."),
 "nkechi": ("af_alloy", "I'd like your claim file, and anything Ms. Kessler sent you. Informally. Today."),
 "maisie": ("af_sky", "Mum said to ask if you want to come to the science fair. It's Thursday. Six. You don't have to."),
 "arthur": ("bm_fable", "They rang the Lutine today. Twice. Good news. Somebody's ship came home."),
 "precious": ("bf_isabella", "He's had a good day, Henry. He's been asking for you. I'll hold the phone, he keeps dropping it."),
 "leonard": ("am_adam", "Great catch, and thanks for flagging! I've asked IT to disable the account and look into it first thing."),
 "laura": ("af_nova", "She has her science fair Thursday at six. She wanted to ask you herself this morning. Just so you know."),  # her text
}
PRON = {"Kessler": "kˈɛslɚ", "Lutine": "lˈuːtiːn", "Meridian": "məɹˈɪdiən"}
PRON_RE = re.compile(r"\b(" + "|".join(map(re.escape, PRON)) + r")\b")
pron = lambda t: PRON_RE.sub(lambda m: f"[{m.group(1)}](/{PRON[m.group(1)]}/)", t)

pipes = {"a": KPipeline(lang_code="a"), "b": KPipeline(lang_code="b")}
os.makedirs(OUT, exist_ok=True)
for cid, (voice, text) in LINES.items():
    pipe = pipes["b" if voice.startswith("b") else "a"]
    parts = [np.asarray(r.audio, np.float32) for r in pipe(pron(text), voice=voice, speed=1.0)]
    parts.append(np.zeros(int(SR * 0.5), np.float32))
    a = np.concatenate(parts); pcm = (np.clip(a, -1, 1) * 32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-c:a", "libmp3lame", "-b:a", "80k", f"{OUT}/{cid}.mp3"], input=pcm, check=True)
    print(cid, voice, round(len(a) / SR, 1), "s")
