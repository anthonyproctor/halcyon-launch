#!/bin/zsh
# Transcribe audiobook files with whisper (cached in /tmp/claude-501/bm), then write audio/bookmarks.json
# (where each reading page starts inside each audiobook file). Used to hand off between Audiobook and reading.
cd "$(dirname "$0")/.."
mkdir -p /tmp/claude-501/bm
for f in audio/story/full-ch*.mp3 audio/full-ch*.mp3; do
  id=${f//\//_}; out=/tmp/claude-501/bm/${id%.mp3}
  [ -s $out.json ] && [ $out.json -nt $f ] && continue
  ffmpeg -nostdin -loglevel error -y -i $f -ar 16000 -ac 1 /tmp/claude-501/bm/tmp.wav && \
  whisper-cli -m ~/.cache/whisper/ggml-small.en.bin -f /tmp/claude-501/bm/tmp.wav -oj -of $out >/dev/null 2>&1 && echo "transcribed $f"
done
node tools/book_marks.mjs
