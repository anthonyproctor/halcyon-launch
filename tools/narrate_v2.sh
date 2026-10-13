#!/bin/zsh
# Narrate PMP v2 (full/v2/chNN.js, the unlisted /?v2 preview) with Gemini, end to end, resumable like revoice_gemini.sh:
# page clips + word timings (audio/v2/pages/fN, story edition fNs), both Audiobook editions with stings
# (audio/v2/full-chNN.mp3, audio/v2/story/full-chNN.mp3), the manifest audio/v2/audiobook.json, and scene maps audio/v2/bookmarks.json.
# Casting: GEMINI_COURSE=pmp in tools/gemini_voices.json (courses.pmp, then default). v1 audio under audio/ is never touched.
# Safe to re-run: chapters already done are skipped, synthesized segments come from the cache for free, and it stops cleanly
# (exit 2) when the daily batch quota runs out. Re-run the same command the next day to resume.
# usage: tools/narrate_v2.sh <first> [last]      state: /tmp/claude-501/revoice/pmp-v2.done (FORCE=1 redoes listed chapters)
cd "$(dirname "$0")/.."
A=$1; B=${2:-$1}; [[ -z $A ]] && { echo "usage: tools/narrate_v2.sh <first> [last]"; exit 1 }
S=/tmp/claude-501/revoice; mkdir -p $S; touch $S/pmp-v2.done; T=/tmp/claude-501/pmp-v2; mkdir -p $T audio/v2/story
P=$PWD/.ttsvenv/bin/python; export GEMINI_COURSE=pmp
# fill the cache for one spec; true only when this run's own usage line says nothing was left to synthesize
prefetch(){ GEMINI_PREFETCH=1 $P tools/render_pages_gemini.py $1 >/dev/null 2>$T/pf.err; local rc=$?; cat $T/pf.err >>$T/prefetch.log
  (( rc == 0 )) && grep "prefetch model=" $T/pf.err | tail -1 | grep -q " calls=0 " }
for n in $(seq $A $B); do
  nn=$(printf %02d $n)
  [[ -z $FORCE ]] && grep -qx "$n" $S/pmp-v2.done && { echo "ch$n already done"; continue }
  node tools/pages.mjs full $n $T/p$n.json --v2 >/dev/null && node tools/pages.mjs full $n $T/p${n}s.json --v2 --story >/dev/null || exit 1
  for sp in $T/p$n.json $T/p${n}s.json; do
    echo "ch$n: filling cache (${sp:t})"
    prefetch $sp || prefetch $sp || { echo "ch$n: not fully synthesized yet (daily quota?). See $T/prefetch.log. Stopping; re-run tomorrow."; exit 2 }
  done
  echo "ch$n: rendering from cache"
  $P tools/render_pages_gemini.py $T/p$n.json audio/v2/full-ch$nn.mp3 2>>$T/tts.log | grep done || { echo "ch$n: study render failed, see $T/tts.log"; exit 1 }
  $P tools/render_pages_gemini.py $T/p${n}s.json audio/v2/story/full-ch$nn.mp3 2>>$T/tts.log | grep done || { echo "ch$n: story render failed, see $T/tts.log"; exit 1 }
  for f in audio/v2/full-ch$nn.mp3 audio/v2/story/full-ch$nn.mp3; do ./tools/add_stings.sh $f || exit 1; done
  python3 - $n <<'PY' || exit 1
import json,os,subprocess,sys
n=sys.argv[1];nn=f"{int(n):02d}";m="audio/v2/audiobook.json"
d=lambda p: round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p]))/60,1)
M=json.load(open(m)) if os.path.exists(m) else {"full":{}}
M["full"][n]={"story":{"src":f"audio/v2/story/full-ch{nn}.mp3","min":d(f"audio/v2/story/full-ch{nn}.mp3")},"study":{"src":f"audio/v2/full-ch{nn}.mp3","min":d(f"audio/v2/full-ch{nn}.mp3")}}
M["full"]=dict(sorted(M["full"].items(),key=lambda kv:int(kv[0])))
json.dump(M,open(m,"w"),indent=1);print("manifest",n,M["full"][n])
PY
  zsh tools/book_marks.sh --v2 || exit 1
  python3 tools/r2_sync.py --if-configured --quiet --course pmp --chapter $n || true # copy this chapter's mp3s to R2 (docs/AUDIO_HOSTING.md); silent no-op without keychain credentials
  grep -qx "$n" $S/pmp-v2.done || echo $n >> $S/pmp-v2.done; echo "ch$n: done"
done
echo "all requested chapters done"
