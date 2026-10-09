import sys, numpy as np, soundfile as sf
from kokoro import KPipeline
pipe = KPipeline(lang_code='a')
NARR = ("The email came in at 6:12 on a Monday morning, which was how Sam Okafor knew it was bad news. "
        "Nobody at Halcyon AI sent good news before seven. By 8:30 he was in Elena Vasquez's office, and the CEO didn't sit down.")
RUTH = ("At NASA we had a saying. Failure is not an option. Everybody quotes it. Nobody remembers that it only worked "
        "because the flight directors told the truth about the numbers, every single day.")
for voice, text, tag in [(v, NARR, 'narrator') for v in sys.argv[1].split(',')] + [(v, RUTH, 'ruth') for v in sys.argv[2].split(',')]:
    audio = np.concatenate([a for _, _, a in pipe(text, voice=voice, speed=1.0)])
    sf.write(f'voice-samples/{tag}-{voice}.wav', audio, 24000)
    print(tag, voice, round(len(audio)/24000, 1), 's')
