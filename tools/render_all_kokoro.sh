#!/bin/zsh
# Full-cast Kokoro audio. usage: render_all_kokoro.sh ref 1 2 ...   or   render_all_kokoro.sh full 1 2 ...
cd "$(dirname "$0")/.."
track=$1; shift
for n in "$@"; do
  if [ "$track" = ref ]; then f=chapters/ch$n.js; gen=tools/episode_script.mjs
    out=$(node -e "globalThis.window={};new Function('window',require('fs').readFileSync('$f','utf8'))(globalThis.window);console.log(window.HALCYON[0].episode.src)")
  else nn=$(printf %02d $n); f=full/ch$nn.js; gen=tools/episode_full.mjs; out=audio/full-ch$nn.mp3; fi
  title=$(node -e "globalThis.window={};new Function('window',require('fs').readFileSync('$f','utf8'))(globalThis.window);const c=(window.HALCYON||window.HALCYON_FULL)[0];console.log(c.title)")
  j=/tmp/claude-501/k-$track-$n.json
  node $gen $f $j >/dev/null && .ttsvenv/bin/python tools/render_kokoro.py $j $out "The Halcyon Launch, $track chapter $n: $title" 2>/dev/null | grep done
done
