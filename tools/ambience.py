"""Synthesize seamless ambient loops (original sounds, no licensing). FFT-shaped noise is circular, so loops are seamless."""
import numpy as np, subprocess
SR=22050; L=40; N=SR*L; rng=np.random.default_rng(7)
f=np.fft.rfftfreq(N,1/SR)
def shaped(curve,seed=0):
    r=np.random.default_rng(seed); spec=(r.normal(size=f.size)+1j*r.normal(size=f.size))*curve; x=np.fft.irfft(spec,n=N); return x/np.max(np.abs(x))
def band(lo,hi,tilt=0.0): c=((f>lo)&(f<hi)).astype(float); c[1:]*=f[1:]**(-tilt); return c
t=np.arange(N)/SR
def env_events(times,length,shape="exp"):
    e=np.zeros(N); n=int(length*SR); k=np.arange(n)/SR
    w=np.exp(-k/ (length/4)) if shape=="exp" else np.sin(np.pi*k/length)**2
    for s in times:
        i=int(s*SR)%N; idx=(i+np.arange(n))%N; e[idx]+=w
    return e
def chirp(start,dur,f0,f1,amp):
    out=np.zeros(N); n=int(dur*SR); k=np.arange(n)/SR; fr=np.linspace(f0,f1,n)+400*np.sin(2*np.pi*30*k)
    ph=2*np.pi*np.cumsum(fr)/SR; w=np.sin(np.pi*k/dur)**2; idx=(int(start*SR)+np.arange(n))%N; out[idx]+=amp*w*np.sin(ph); return out
def write(name,x,gain=0.5):
    x=x/np.max(np.abs(x))*gain; pcm=(x*32767).astype("<i2").tobytes()
    subprocess.run(["ffmpeg","-loglevel","error","-y","-f","s16le","-ar",str(SR),"-ac","1","-i","-","-c:a","libmp3lame","-b:a","64k",f"audio/amb/{name}.mp3"],input=pcm,check=True); print(name)
# murmur: band-limited noise modulated at syllable rate
def murmur(seed): m=shaped(band(250,2500,0.6),seed); mod=0.5+0.5*shaped(band(2,6),seed+1); return m*mod
roomtone=shaped(band(20,600,1.0),1)
# servers
write("servers", 0.7*shaped(band(20,300,1.2),2)+0.25*shaped(band(800,6000,0.3),3)+0.15*np.sin(2*np.pi*120*t)+0.07*np.sin(2*np.pi*240*t))
# office: room tone, murmur, keyboard clicks
clicks=shaped(band(2000,8000),4)*np.clip(env_events(rng.uniform(0,L,160),0.03),0,1)
write("office", 0.5*roomtone+0.35*murmur(5)+0.4*clicks,0.4)
# boardroom: quiet HVAC
write("boardroom", 0.8*roomtone+0.2*shaped(band(100,900,0.8),6),0.3)
# morning kitchen: room tone + birds
birds=sum(chirp(s,rng.uniform(.08,.2),rng.uniform(2800,4200),rng.uniform(3500,6000),rng.uniform(.3,1)) for s in rng.uniform(0,L,70))
write("morning", 0.35*roomtone+0.6*birds/np.max(np.abs(birds)),0.35)
# rain
drops=shaped(band(1500,9000),8)*np.clip(env_events(rng.uniform(0,L,900),0.015),0,1)
write("rain", 0.8*shaped(band(300,8000,0.4),7)+0.4*drops,0.45)
# night: wind + crickets
cr=np.zeros(N)
for s in rng.uniform(0,L,60):
    for k in range(3): cr+=chirp(s+k*0.06,0.04,4600,4700,0.6)
write("night", 0.6*shaped(band(30,400,1.2),9)+0.5*cr/np.max(np.abs(cr)),0.3)
# hospital: HVAC + monitor beep + murmur
beep=np.zeros(N); 
for s in np.arange(0,L,1.25): n=int(.09*SR); i=int(s*SR); beep[(i+np.arange(n))%N]+=np.sin(2*np.pi*988*np.arange(n)/SR)*np.hanning(n)
write("hospital", 0.6*roomtone+0.25*murmur(10)+0.18*beep,0.35)
# jet: wind + periodic flyover roar
fly=shaped(band(60,3000,0.7),11)*env_events([8,28],9,"sin")
write("jet", 0.3*shaped(band(30,500,1),12)+0.9*fly,0.5)
# coffee shop: murmur + cups
cups=np.zeros(N)
for s in rng.uniform(0,L,25): n=int(.25*SR); i=int(s*SR); k=np.arange(n)/SR; cups[(i+np.arange(n))%N]+=np.sin(2*np.pi*rng.uniform(2500,3500)*k)*np.exp(-k*25)
write("coffee", 0.4*roomtone+0.5*murmur(13)+0.25*cups,0.4)
# car: road rumble
write("car", 0.8*shaped(band(25,400,1.4),14)+0.25*shaped(band(500,3000,0.6),15),0.4)
