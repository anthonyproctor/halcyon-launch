#!/bin/zsh
# Render audio episodes for the given chapter numbers.
cd "$(dirname "$0")/.."
for n in "$@"; do
  f=chapters/ch$n.js
  src=$(node -e "globalThis.window={};new Function('window',require('fs').readFileSync('$f','utf8'))(globalThis.window);const c=window.HALCYON[0];console.log(c.episode.src+'|'+c.title)")
  out=${src%%|*}; title=${src#*|}
  node tools/episode_script.mjs $f /tmp/claude-501/ep$n.json && \
  /Users/anthonyproctor/Documents/agentic-workspace-main/.venv/bin/python tools/render_episode.py /tmp/claude-501/ep$n.json "$out" "The Halcyon Launch, Chapter $n: $title" && \
  echo "ch$n $(ffprobe -v error -show_entries format=duration -of csv=p=0 $out)s"
done
