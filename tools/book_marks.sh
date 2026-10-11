#!/bin/zsh
# Transcribe audiobook files with whisper (cached in /tmp/claude-501/bm), then write audio/bookmarks.json
# (where each reading page starts inside each audiobook file). Used to hand off between Audiobook and reading.
# usage: tools/book_marks.sh [course-id]   (no id = the PMP course)
cd "$(dirname "$0")/.."
c=$1; root=${c:+courses/$c/}; bm=/tmp/claude-501/bm${c:+-$c}
mkdir -p $bm
for f in ${root}audio/story/full-ch*.mp3 ${root}audio/full-ch*.mp3; do
  id=${${f#$root}//\//_}; out=$bm/${id%.mp3}
  [ -s $out.json ] && [ $out.json -nt $f ] && continue
  ffmpeg -nostdin -loglevel error -y -i $f -ar 16000 -ac 1 $bm/tmp.wav && \
  whisper-cli -m ~/.cache/whisper/ggml-small.en.bin -f $bm/tmp.wav -oj -of $out >/dev/null 2>&1 && echo "transcribed $f"
done
node tools/book_marks.mjs ${c:+--course} $c
