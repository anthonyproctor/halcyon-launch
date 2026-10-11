#!/bin/zsh
# Narrate a chapter of any course in courses/<id> end to end: page clips + word timings, both Audiobook editions with stings, manifest, scene map.
# usage: tools/narrate_course.sh <course id> <chapter number>
cd "$(dirname "$0")/.."
C=$1; n=$2; nn=$(printf %02d $n); T=/tmp/claude-501/$C; mkdir -p $T
node tools/pages.mjs full $n $T/p$n.json --course $C >/dev/null && node tools/pages.mjs full $n $T/p${n}s.json --course $C --story >/dev/null || exit 1
cd courses/$C && P=../../.ttsvenv/bin/python
$P ../../tools/render_pages.py $T/p$n.json audio/full-ch$nn.mp3 2>/dev/null | grep done && $P ../../tools/render_pages.py $T/p${n}s.json audio/story/full-ch$nn.mp3 2>/dev/null | grep done || exit 1
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
zsh tools/book_marks.sh $C
