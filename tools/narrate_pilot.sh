#!/bin/zsh
# Narrate a Danny's Logbook chapter end to end: page clips + word timings, both Audiobook editions with stings, manifest, scene map.
# usage: tools/narrate_pilot.sh <chapter number>
cd "$(dirname "$0")/.."
n=$1; nn=$(printf %02d $n); T=/tmp/claude-501/pilot; mkdir -p $T
node tools/pages.mjs full $n $T/p$n.json --course pilot >/dev/null && node tools/pages.mjs full $n $T/p${n}s.json --course pilot --story >/dev/null || exit 1
# TTS=gemini uses tools/render_pages_gemini.py (Gemini, casting in tools/gemini_voices.json, its log in $T/tts.log); TTS=kokoro or unset = Kokoro
TTS=${TTS:-kokoro}; RP=render_pages.py; ERR=/dev/null; [[ $TTS == gemini ]] && RP=render_pages_gemini.py && ERR=$T/tts.log
cd courses/pilot && P=../../.ttsvenv/bin/python
$P ../../tools/$RP $T/p$n.json audio/full-ch$nn.mp3 2>>$ERR | grep done && $P ../../tools/$RP $T/p${n}s.json audio/story/full-ch$nn.mp3 2>>$ERR | grep done || exit 1
cd ../.. && for f in courses/pilot/audio/full-ch$nn.mp3 courses/pilot/audio/story/full-ch$nn.mp3; do ./tools/add_stings.sh $f; done
python3 - $n <<'PY'
import json,subprocess,sys
n=sys.argv[1];nn=f"{int(n):02d}";r="courses/pilot/"
d=lambda p: round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",r+p]))/60,1)
M=json.load(open(r+"audio/audiobook.json"))
M["full"][n]={"story":{"src":f"audio/story/full-ch{nn}.mp3","min":d(f"audio/story/full-ch{nn}.mp3")},"study":{"src":f"audio/full-ch{nn}.mp3","min":d(f"audio/full-ch{nn}.mp3")}}
json.dump(M,open(r+"audio/audiobook.json","w"),indent=1);print("manifest",n,M["full"][n])
PY
# copy this chapter's mp3s to R2 (docs/AUDIO_HOSTING.md); silent no-op without keychain credentials. A failed sync is never swallowed: the
# scene map is still written, then this exits 4 with the retry command
python3 tools/r2_sync.py --if-configured --quiet --course pilot --chapter $n; rc=$?
[[ -n $SKIP_MARKS ]] || zsh tools/book_marks.sh pilot # SKIP_MARKS=1 for a multi chapter pass, then run book_marks.sh once
(( rc == 0 )) || { echo "R2 SYNC FAILED pilot ch$n (exit $rc): this chapter's audio isn't on R2. Retry: python3 tools/r2_sync.py --course pilot --chapter $n" >&2; exit 4 }
