#!/bin/zsh
# Transcribe audiobook files with whisper (cached in /tmp/claude-501/bm), then write audio/bookmarks.json
# (where each reading page starts inside each audiobook file). Used to hand off between Audiobook and reading.
# book_marks.mjs places the marks from the page word timings (forced-aligned) when they match the mp3; whisper is the fallback.
# usage: tools/book_marks.sh [course-id]   (no id = the PMP course)
#        tools/book_marks.sh --v2          (the PMP v2 preview: audio/v2/ files, full/v2/ chapters, writes audio/v2/bookmarks.json)
cd "$(dirname "$0")/.."
v=; [[ $1 == --v2 ]] && { v=v2/; shift }
c=$1; root=${c:+courses/$c/}; bm=/tmp/claude-501/bm${c:+-$c}${v:+-v2}
mkdir -p $bm
setopt null_glob
for f in ${root}audio/${v}story/full-ch*.mp3 ${root}audio/${v}full-ch*.mp3; do
  id=${${f#$root}//\//_}; out=$bm/${id%.mp3}
  [ -s $out.json ] && [ $out.json -nt $f ] && continue
  ffmpeg -nostdin -loglevel error -y -i $f -ar 16000 -ac 1 $bm/tmp.$$.wav && \
  whisper-cli -m ~/.cache/whisper/ggml-small.en.bin -f $bm/tmp.$$.wav -oj -of $out >/dev/null 2>&1 && echo "transcribed $f"
done
node tools/book_marks.mjs ${c:+--course} $c ${v:+--v2} && { node tools/book_text.mjs ${c:+--course} $c ${v:+--v2} --dirty || echo "book_text.mjs failed: Audiobook follow-along text not rebuilt" }
