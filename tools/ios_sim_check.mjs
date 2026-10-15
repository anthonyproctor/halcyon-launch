#!/usr/bin/env node
// iOS Simulator player check: drives REAL Mobile Safari (Xcode iOS Simulator) over the WebKit inspector protocol and reads the
// actual <audio> state (currentTime, paused, src) while scrubbing, tapping paragraphs, skipping and relaunching Safari.
// Setup (once per session; see README "iOS Simulator check"):
//   export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
//   xcrun simctl boot <UDID>            (iPhone simulator; `xcrun simctl list devices available`)
//   ios_webkit_debug_proxy -s unix:$(lsof -U | awk '/webinspectord_sim.socket/{print $NF; exit}') -F &   (brew install ios-webkit-debug-proxy)
//   PORT=4331 TEST_AUDIO_BASE=https://audio.strakesystems.com node tests/serve.mjs &   (audio from R2, cross-origin like production)
// Run:  node tools/ios_sim_check.mjs [port=4331] [--udid <UDID>]
// Limits: events are dispatched from JS (pointerdown, input, change, pointerup), not real finger touches; Safari runs as a browser tab,
// not a home-screen app; lock screen buttons can't be pressed from here. Real touches need idb (facebook/fb tap, not trusted by default).
import {execSync} from "node:child_process";
const args=process.argv.slice(2);const PORT=args.find(a=>/^\d+$/.test(a))||"4331";const ui=args.indexOf("--udid");
const U=ui>=0?args[ui+1]:(process.env.SIM_UDID||execSync("xcrun simctl list devices booted",{env:{...process.env,DEVELOPER_DIR:"/Applications/Xcode.app/Contents/Developer"}}).toString().match(/\(([0-9A-F-]{36})\) \(Booted\)/)?.[1]);
if(!U){console.error("No booted simulator. Boot one first.");process.exit(2)}
const ENV={...process.env,DEVELOPER_DIR:"/Applications/Xcode.app/Contents/Developer"};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function connect(url){const ws=new WebSocket(url);let id=0,target=null;const pend={};await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.method==="Target.targetCreated")target=m.params.targetInfo.targetId;
    else if(m.method==="Target.dispatchMessageFromTarget"){const r=JSON.parse(m.params.message);if(pend[r.id]){pend[r.id](r);delete pend[r.id]}}};
  ws.send(JSON.stringify({id:999999,method:"Target.exists"}));for(let i=0;i<50&&!target;i++)await sleep(100);
  const send=(method,params={})=>new Promise(res=>{const i=++id;pend[i]=res;ws.send(JSON.stringify({id:100000+i,method:"Target.sendMessageToTarget",params:{targetId:target,message:JSON.stringify({id:i,method,params})}}))});
  const ev=async(expr,gesture=false)=>{const r=await send("Runtime.evaluate",{expression:expr,returnByValue:true,awaitPromise:true,emulateUserGesture:gesture});
    if(r.error)throw new Error(JSON.stringify(r.error));if(r.result&&r.result.wasThrown)throw new Error(JSON.stringify(r.result.result));return r.result&&r.result.result&&r.result.result.value};
  return {ev,close:()=>ws.close()}}
const page=async()=>{for(let i=0;i<90;i++){try{const j=await (await fetch("http://localhost:9222/json")).json();const p=j.find(x=>x.url.includes(":"+PORT));if(p)return p}catch(e){}await sleep(500)}throw new Error("Safari page not listed: is ios_webkit_debug_proxy running?")};
async function open(hash){execSync(`xcrun simctl openurl ${U} "http://localhost:${PORT}/${hash}"`,{env:ENV});await sleep(4000);const c=await connect((await page()).webSocketDebuggerUrl);
  for(let i=0;i<40;i++){if(await c.ev("!!(window.__nar&&document.readyState==='complete')").catch(()=>false))break;await sleep(500)}return c}
const st=c=>c.ev("(()=>{const a=window.__nar.audio;return {t:+a.currentTime.toFixed(2),p:a.paused,d:+(a.duration||0).toFixed(1),src:(a.src||'').replace(/^.*\\//,'')}})()");
const samples=async(c,n=5)=>{const o=[];for(let i=0;i<n;i++){o.push((await st(c)).t);await sleep(1000)}return o};
const click=(c,sel)=>c.ev(`(document.querySelector(${JSON.stringify(sel)})||{click(){}}).click(),true`,true);
const chapter1=c=>c.ev(`(()=>{const b=[...document.querySelectorAll('#page button')].find(x=>/^1\\s*\\D/.test(x.textContent.trim()));b&&b.click();return !!b})()`,true);
const drag=(c,vals)=>c.ev(`(async()=>{const r=document.getElementById('narseek');const P=t=>r.dispatchEvent(new PointerEvent(t,{bubbles:true,pointerType:'touch',isPrimary:true}));P('pointerdown');for(const v of ${JSON.stringify(vals)}){r.value=v;r.dispatchEvent(new Event('input',{bubbles:true}));await new Promise(x=>setTimeout(x,60))}r.dispatchEvent(new Event('change',{bubbles:true}));P('pointerup');return true})()`,true);
const near=(xs,t,tol=8)=>xs.length>1&&Math.abs(xs[0]-t)<tol&&xs.every((x,i)=>!i||x>=xs[i-1]-0.5)&&xs[xs.length-1]-xs[0]>=1.5; // lands near the target, never jumps back, and keeps playing
const out=[];const rec=(name,ok,detail)=>{out.push({name,ok,detail});console.log(`${ok?"PASS":"FAIL"}  ${name}  ${JSON.stringify(detail)}`)};
let c=await open("#pilot/listen");await c.ev("localStorage.clear();sessionStorage.clear();true");c.close();c=await open("#pilot/listen");
await chapter1(c);await sleep(3000);let s=await st(c);if(s.p){await click(c,"#narplay");await sleep(3000);s=await st(c)}
rec("plays from the audio host",!s.p&&s.t>0.5,s);
await drag(c,[300,400,500]);await sleep(1500);let xs=await samples(c);rec("scrub while playing lands and stays",near(xs,s.d/2),{target:s.d/2,xs});
const pt=await c.ev(`(()=>{const ps=[...document.querySelectorAll('#bftext [data-t]')];if(!ps.length)return null;const p=ps[Math.floor(ps.length*0.75)];p.click();return +p.dataset.t})()`,true);
await sleep(1500);xs=await samples(c);rec("paragraph tap seeks",pt!=null&&near(xs,pt),{target:pt,xs});
const b0=(await st(c)).t;await click(c,"#narfwd");await sleep(1500);xs=await samples(c,3);rec("forward 30 seconds",near(xs,b0+31.5,6),{from:b0,xs});
await click(c,"#narplay");await sleep(1500);const paused=await st(c);
c.close();execSync(`xcrun simctl terminate ${U} com.apple.mobilesafari`,{env:ENV});await sleep(2000);c=await open("#pilot/listen");await sleep(2000);
const resume=await c.ev(`(()=>{const b=[...document.querySelectorAll('#page button')].find(x=>/Resume/i.test(x.textContent));return b?b.textContent.trim():null})()`);
const m=resume&&resume.match(/at (\d+):(\d\d)/);rec("resume offered at the saved spot after Safari is killed",!!m&&Math.abs((+m[1])*60+(+m[2])-paused.t)<10,{saved:paused.t,resume});
await chapter1(c);await sleep(2500);s=await st(c);if(!s.p){await click(c,"#narplay");await sleep(1000)}
await drag(c,[150,200,250]);await sleep(800);await click(c,"#narplay");await sleep(2000);xs=await samples(c);rec("scrub before play, then play",near(xs,s.d/4),{target:s.d/4,xs});
const ms=await c.ev("JSON.stringify({state:navigator.mediaSession&&navigator.mediaSession.playbackState,title:navigator.mediaSession&&navigator.mediaSession.metadata&&navigator.mediaSession.metadata.title})");
rec("lock screen metadata and state set (buttons not pressable here)",/playing/.test(ms),JSON.parse(ms));
await click(c,"#narplay");c.close();const fails=out.filter(x=>!x.ok).length;console.log(fails?`${fails} FAILED`:"ALL PASS");process.exit(fails?1:0);
