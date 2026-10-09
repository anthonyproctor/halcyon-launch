"""Synthesize a short original chapter sting (open + close)."""
import numpy as np, subprocess
SR=44100
def note(fr,dur,amp,partials=((1,1),(2,.4),(3,.2),(4.2,.1)),decay=3.0,attack=.005):
    k=np.arange(int(dur*SR))/SR;env=np.minimum(k/attack,1)*np.exp(-k*decay);return amp*env*sum(a*np.sin(2*np.pi*fr*m*k) for m,a in partials)
def pad(freqs,dur,amp):
    k=np.arange(int(dur*SR))/SR;env=np.minimum(k/1.2,1)*np.minimum((dur-k)/1.5,1);return amp*env*sum(np.sin(2*np.pi*f*k)+.5*np.sin(2*np.pi*f*1.003*k)+.25*np.sin(2*np.pi*2*f*k) for f in freqs)/len(freqs)
def mix(total,parts):
    out=np.zeros(int(total*SR))
    for start,x in parts: i=int(start*SR);n=min(len(x),len(out)-i);out[i:i+n]+=x[:n]
    return out
hz=lambda m:440*2**((m-69)/12)
def write(name,x):
    x=x/np.max(np.abs(x))*.6;pcm=(x*32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg","-loglevel","error","-y","-f","s16le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","96k",f"audio/{name}.mp3"],input=pcm,check=True);print(name,round(len(x)/SR,1),"s")
D=[hz(50),hz(57),hz(64),hz(66)]  # D3 A3 E4 F#4
opening=mix(6.5,[(0,pad(D,6.5,.8))]+[(0.6+i*0.45,note(hz(m),2.5,.5)) for i,m in enumerate([69,74,78,81])]+[(2.6,note(hz(86),3,.35))])
closing=mix(5.5,[(0,pad([hz(47),hz(54),hz(62),hz(66)],5.5,.8))]+[(0.4+i*0.5,note(hz(m),2.5,.45)) for i,m in enumerate([81,78,74])]+[(2.1,note(hz(69),3,.5))])
write("sting-open",opening);write("sting-close",closing)
