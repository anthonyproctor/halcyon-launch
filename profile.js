/* Halcyon test profile, for QA (approved 2026-10-12). Loads before engine.js and qa.js.
   QA mode turns on with ?qa=1 (off with ?qa=0) or the Guide page switch. The test profile is a QA tool: it counts only while QA mode is on.
   It turns on with ?test=1 (which also turns QA mode on) and off with ?test=0, or the "Test profile" switch on the Guide page and the QA bar.
   Both flags work before or after the #route and are remembered on this device.

   While the test profile is on:
   - every progress key the engine reads or writes lives under "halcyon-qa-test:" instead of "halcyon." (chapter progress, mock attempts and
     history for every form, the study log, lastplace, lastch, route, cur, course, track, the library's last played list and pins, audiobook
     and car positions, readat, bookdone, handoff.seen, the final assessment and certificate name, labs). The prefix does not start with
     "halcyon." on purpose, so the engine's clearLocal() (sign in and sign out) never touches it and the real namespace never sees it.
   - nothing is written to /api/progress, and the server's copy of progress is never read into local storage (engine.js boot and listenPull).
   - "Continue", resume and lastPlaceLabel read the test namespace only, so they point at test state.
   - analytics page views are not sent (engine.js pageview).
   - QA reports still go to /api/qa-report (you must still be signed in), with test_profile:true in the payload and its context.
   Shared between the two profiles, because they are display or device preferences, not progress (SHARED below):
     amb (ambience on/off), ambvol, rate (playback speed), auto2 (auto advance), spoilers (cast), pdbg (diagnostics),
     fold.* (rail sections open or closed), bookEd.* (audiobook edition), devid (this device's id in the study log).
   storymode (Focus mode) is separate: it changes which section a saved chapter position points at, so it travels with the progress.
   qa.js's own keys (qa, showwho, qa.tester) and the test profile flag (testprofile) stay in "halcyon." and are always shared
   (engine.js DEVICE_KEYS keeps them through a sign in). Signing out clears the test namespace too.
   Switching on or off reloads the page without its #route, so in-memory state from one profile is never saved into the other,
   and each profile opens at its own saved place. */
(function(){
"use strict";
const SP="halcyon.",TP="halcyon-qa-test:";
const SHARED=["amb","ambvol","rate","auto2","spoilers","pdbg","devid","qa","showwho","qa.tester","testprofile"];
const SHARED_PREFIX=["fold.","bookEd."];
const get=k=>{try{const v=localStorage.getItem(SP+k);return v?JSON.parse(v):undefined}catch(e){return undefined}};
const set=(k,v)=>{try{localStorage.setItem(SP+k,JSON.stringify(v))}catch(e){}};
/* ?qa= and ?test= from the query string or from inside the #route; the hash copy is stripped so it doesn't stick in the address */
function fromURL(){try{const q=new URLSearchParams(location.search);const flags={qa:q.get("qa"),test:q.get("test")};let h=location.hash;
  for(const f of ["qa","test"]){const re=new RegExp("[?&]"+f+"=([01])\\b");const m=h.match(re);if(m){flags[f]=m[1];h=h.replace(re,"").replace(/[?&]$/,"")}}
  // the flags are stored, then taken out of the address, so a later reload (a profile switch) can't flip them back
  const had=q.has("qa")||q.has("test");q.delete("qa");q.delete("test");const s=q.toString();
  if(had||h!==location.hash)history.replaceState(null,"",location.pathname+(s?"?"+s:"")+h);
  if(flags.qa==="1"||flags.qa==="0")set("qa",flags.qa==="1");
  if(flags.test==="1"){set("testprofile",true);set("qa",true)}else if(flags.test==="0")set("testprofile",false)}catch(e){}}
fromURL();
const ON=!!get("qa")&&!!get("testprofile"); // fixed for the life of the page; switching reloads
const shared=k=>SHARED.includes(k)||SHARED_PREFIX.some(p=>String(k).startsWith(p));
const key=k=>(ON&&!shared(k)?TP:SP)+k;
function testKeys(){try{return Object.keys(localStorage).filter(k=>k.startsWith(TP))}catch(e){return []}}
/* reload without the #route, so the other profile opens at its own place */
function reload(hash){try{const q=new URLSearchParams(location.search);q.delete("test");q.delete("qa");const s=q.toString();history.replaceState(null,"",location.pathname+(s?"?"+s:"")+(hash||""))}catch(e){}
  (P.onLeave||[]).forEach(f=>{try{f()}catch(e){}});location.reload()} // onLeave: the engine sends progress writes still waiting (keepalive) before the page goes // replaceState then reload: a hash only change would not reload
function setTest(on){on=!!on;set("testprofile",on);if(on)set("qa",true);if((!!get("qa")&&on)!==ON)reload()}
/* clears only "halcyon-qa-test:" keys. In the test profile it then reloads to the Guide; writes are frozen first so the page's own
   pagehide saves (audiobook spot, listening state) can't put test data back on the way out */
function reset(){if(ON)P.frozen=true;testKeys().forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});if(ON)reload("#guide")}
/* an edited address that only changes the #route doesn't reload the page: a ?qa= or ?test= typed there reloads into the right profile.
   profile.js loads first, so this runs before the engine's own hashchange handler sees the address */
addEventListener("hashchange",e=>{if(/[?&](qa|test)=[01]\b/.test(location.hash)){e.stopImmediatePropagation();P.frozen=true;fromURL();location.reload()}}); // the engine must not route (and save a place) in the profile being left
const P=window.HalcyonProfile={test:ON,frozen:false,onLeave:[],wanted:()=>!!get("testprofile"),key,shared,setTest,reset,testKeys,PREFIX:TP,
  qaChanged(){if((!!get("qa")&&!!get("testprofile"))!==ON)reload()}}; // qa.js calls this when QA mode flips: the test profile follows it
})();
