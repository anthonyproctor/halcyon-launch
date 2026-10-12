#!/bin/zsh
# Re-voice a course's chapters with Gemini, a day's quota at a time. Safe to re-run: chapters already done are skipped,
# segments already synthesized come from the cache for free, and it stops cleanly when the daily batch quota runs out.
# usage: tools/revoice_gemini.sh <course id> <first> <last>      state: /tmp/claude-501/revoice/<course>.done
cd "$(dirname "$0")/.."
C=$1; A=$2; B=$3; S=/tmp/claude-501/revoice; mkdir -p $S; touch $S/$C.done; T=/tmp/claude-501/$C; mkdir -p $T
P=$PWD/.ttsvenv/bin/python; LOG=~/.cache/halcyon-gemini-tts/usage.log
cached(){ (cd courses/$C && GEMINI_COURSE=$C GEMINI_PREFETCH=1 $P ../../tools/render_pages_gemini.py $1 >>$T/prefetch.log 2>&1); tail -1 $LOG | grep -q " calls=0 " }
for n in $(seq $A $B); do
  grep -qx "$n" $S/$C.done && { echo "ch$n already done"; continue }
  node tools/pages.mjs full $n $T/g$n.json --course $C >/dev/null || exit 1
  echo "ch$n: filling cache"
  cached $T/g$n.json || cached $T/g$n.json || { echo "ch$n: not fully synthesized yet (daily quota?). Stopping; re-run tomorrow."; exit 2 }
  echo "ch$n: rendering from cache"
  if [[ $C == pilot ]]; then TTS=gemini zsh tools/narrate_pilot.sh $n | tail -3; else TTS=gemini zsh tools/narrate_course.sh $C $n | tail -3; fi
  echo $n >> $S/$C.done; echo "ch$n: done"
done
echo "all requested chapters done"
