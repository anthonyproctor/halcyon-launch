#!/bin/zsh
# Render Full Course audio for the given chapter numbers.
cd "$(dirname "$0")/.."
for n in "$@"; do
  nn=$(printf %02d $n); f=full/ch$nn.js
  title=$(node -e "globalThis.window={};new Function('window',require('fs').readFileSync('$f','utf8'))(globalThis.window);console.log(window.HALCYON_FULL[0].title)")
  node tools/episode_full.mjs $f /tmp/claude-501/full$nn.json && \
  /Users/anthonyproctor/Documents/agentic-workspace-main/.venv/bin/python tools/render_episode.py /tmp/claude-501/full$nn.json audio/full-ch$nn.mp3 "The Halcyon Launch Full Course, Chapter $n: $title" && \
  echo "full ch$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 audio/full-ch$nn.mp3)s"
done
