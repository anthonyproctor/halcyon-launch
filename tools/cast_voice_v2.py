"""Render a short voice sample for each cast member of The Halcyon Launch v2 (the PMP book) -> cast/v2/voice/<id>.mp3.
Same output format as the other books' cast samples (24 kHz mono, MP3 80k). Voices and delivery come from the PMP
casting in tools/gemini_voices.json (courses.pmp, then default), the same lookup the narration uses, so a reader hears
the voice they'll hear in the chapters. Each sample is a line the character says in the book, picked to avoid
spoilers; Hollis, Chiamaka, and Emmett speak through their written reports, packet, and letter, and Simon only
says one word on the page, so his is the opening of his own cast intro. Characters with no PMP casting yet (no
narrated chapter decides their voice) get no sample, and the cast page hides the Hear button for them.
Synthesis goes through tools/gemini_tts.py (Batch API by default, cached on disk; the key is read from the keychain
and never printed). Run from the repo root with the TTS venv: .ttsvenv/bin/python tools/cast_voice_v2.py"""
import json, os, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
import gemini_tts as G  # noqa: E402

OUT = os.path.join(ROOT, "cast", "v2", "voice")
V = json.load(open(os.path.join(ROOT, "tools", "gemini_voices.json")))
PMP, DEF = V["courses"].get("pmp", {}), V["default"]

# id: (speaker key in the casting, line)
LINES = {
 "sam": ("Sam", "It's not a stakeholder. It's a constraint. It doesn't read email."),
 "ada": ("Ada", "Don't do the voice, Dad. I'm an engineer on a planet that's trying to kill me. I can take a number."),
 "ruth": ("Ruth", "I sit on the board that decides whether your ship flies. That's a different job, and I only do one at a time."),
 "imogen": ("Imogen", "You run the building. Garrett tells me nothing in it has fallen over in nineteen years."),
 "garrett": ("Garrett", "We are on track for February 18, 2063. I want every person on this floor to hear me say that."),
 "quinn": ("Quinn", "Then your red's big. That's information too."),
 "hana": ("Hana", "You can't iterate a pressure vessel. I need the valve commands defined by June and never touched again."),
 "rafa": ("Rafa", "The hardware schedule is a fiction we all agreed to believe. At least my backlog admits what it doesn't know."),
 "wendell": ("Wendell", "Stand's down for a seal change the week you've got the hot fire. It's not in there. Bea knew. Ask people things."),
 "bea": ("Bea", "I can't make this true."),
 "ray": ("Ray", "You didn't read the card. I could tell. You've got a face for when you're not reading the card."),
 "hollis": ("Hollis", "Oxygen plant operating within projected degradation. Morale strong."),  # his weekly report to the ARA
 "frances": ("Frances", "That's the first time anybody from Tallgrass has told us something we didn't want to hear."),
 "yusra": ("Yusra", "I signed up for one way in 2059. I'd like my husband to hear it from you before he reads it."),
 "paloma": ("Paloma", "That's the first time anybody's put my eleven in a schedule without yelling at me."),
 "nell": ("Nell", "Nell Garrity. Aldergrove's account lead. We talked once on the phone, or we didn't. Either way."),
 "arlo": ("Arlo", "Got most of it. My hands are bad. I can't see your lights."),
 "peg": ("Peg", "Aldergrove wants the root cause work pulled out of their fixed price. They put a number on it. I've read the number twice, once sitting down."),
 "calvin": ("Calvin", "That's the first answer this morning that didn't try to sell me anything."),
 "chiamaka": ("Chiamaka", "Five of us want in. We'll be the ones running this plant for twenty years."),  # her engineering packet
 "thandi": ("Thandi", "A1 was done by this definition on September 23, and it flew once in nine. I'd like done to mean flown."),
 "emmett": ("Emmett", "We're still asking about cycle three."),  # his yearly letter to the investigation board
 "corinne": ("Corinne", "I can do all of it. I can't do all of it today."),
 "delphine": ("Delphine", "Your lander isn't ready and neither is my rocket."),
}


def simon_line():
    js = "global.window={};require(process.argv[1]);const c=window.HALCYON_CAST.find(x=>x.id==='simon');console.log(c?c.intro:'')"
    intro = subprocess.check_output(["node", "-e", js, os.path.join(ROOT, "full", "v2", "cast.js")]).decode().strip()
    parts = [p.strip() + "." for p in intro.split(".") if p.strip()]
    return " ".join(parts[:2])


def cast(who):
    return PMP.get(who) or DEF.get(who)


if __name__ == "__main__":
    LINES["simon"] = ("Simon", simon_line())
    os.makedirs(OUT, exist_ok=True)
    jobs = {}
    for cid, (who, text) in LINES.items():
        c = cast(who)
        if not c:
            print(cid, "no PMP casting for", who, "- skipped"); continue
        jobs[cid] = (text, c["voice"], c.get("style", ""))
    try:
        audio = G.synth_many(list(jobs.values()), log=print)
    except G.QuotaExhausted as e:
        sys.exit(f"quota exhausted, no samples written: {e}")
    for cid, item in jobs.items():
        a = G.clean(audio[item])
        a = np.concatenate([a, np.zeros(int(G.SR * 0.4), np.float32)])
        pcm = (np.clip(a, -1, 1) * 32767).astype("<i2").tobytes()
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(G.SR), "-ac", "1", "-i", "-",
                        "-c:a", "libmp3lame", "-b:a", "80k", os.path.join(OUT, f"{cid}.mp3")], input=pcm, check=True)
        print(cid, item[1], round(len(a) / G.SR, 1), "s")
    print(G.log_usage("cast_voice_v2"))
