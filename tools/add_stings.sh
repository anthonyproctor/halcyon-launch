#!/bin/zsh
# Wrap a whole-chapter or story-edition file with the open and close stings.
f=$1; tmp=${f%.mp3}.tmp.mp3
ffmpeg -loglevel error -y -i audio/sting-open.mp3 -i "$f" -i audio/sting-close.mp3 -filter_complex "[0:a]aresample=24000,volume=0.7[a];[1:a]aresample=24000[b];[2:a]aresample=24000,volume=0.7[c];[a][b][c]concat=n=3:v=0:a=1" -ac 1 -c:a libmp3lame -b:a 80k "$tmp" && mv "$tmp" "$f"
