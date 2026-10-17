#!/bin/zsh
# Narrate a chapter of any course in courses/<id> end to end: page clips + word timings, both Audiobook editions with stings, manifest, scene map.
# usage: tools/narrate_course.sh <course id> <chapter number>
cd "$(dirname "$0")/.."
C=$1; n=$2; nn=$(printf %02d $n); T=/tmp/claude-501/$C; mkdir -p $T
mkdir -p courses/$C/audio/story # a new course has no story edition folder yet (the Hearth ch1 render failed on it, 2026-10-17)
node tools/pages.mjs full $n $T/p$n.json --course $C >/dev/null && node tools/pages.mjs full $n $T/p${n}s.json --course $C --story >/dev/null || exit 1
# TTS=gemini uses tools/render_pages_gemini.py (Gemini, casting in tools/gemini_voices.json, its log in $T/tts.log); TTS=kokoro or unset = Kokoro
TTS=${TTS:-kokoro}; RP=render_pages.py; ERR=/dev/null; [[ $TTS == gemini ]] && RP=render_pages_gemini.py && ERR=$T/tts.log
cd courses/$C && P=../../.ttsvenv/bin/python
$P ../../tools/$RP $T/p$n.json audio/full-ch$nn.mp3 2>>$ERR | grep done && $P ../../tools/$RP $T/p${n}s.json audio/story/full-ch$nn.mp3 2>>$ERR | grep done || exit 1
cd ../.. && for f in courses/$C/audio/full-ch$nn.mp3 courses/$C/audio/story/full-ch$nn.mp3; do ./tools/add_stings.sh $f; done
python3 - $n $C <<'PY'
import json,subprocess,sys
n=sys.argv[1];nn=f"{int(n):02d}";r=f"courses/{sys.argv[2]}/"
d=lambda p: round(float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",r+p]))/60,1)
import os
M=json.load(open(r+"audio/audiobook.json")) if os.path.exists(r+"audio/audiobook.json") else {"full":{}}
M["full"][n]={"story":{"src":f"audio/story/full-ch{nn}.mp3","min":d(f"audio/story/full-ch{nn}.mp3")},"study":{"src":f"audio/full-ch{nn}.mp3","min":d(f"audio/full-ch{nn}.mp3")}}
json.dump(M,open(r+"audio/audiobook.json","w"),indent=1);print("manifest",n,M["full"][n])
PY
python3 tools/r2_sync.py --if-configured --quiet --course $C --chapter $n || true # copy this chapter's mp3s to R2 (docs/AUDIO_HOSTING.md); silent no-op without keychain credentials
zsh tools/book_marks.sh $C
