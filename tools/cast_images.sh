#!/bin/zsh
# Convert portraits in cast-src/<id>.png to web-sized cast/<id>.jpg (400px square).
cd "$(dirname "$0")/.."; mkdir -p cast
for f in cast-src/*.(png|jpg|jpeg|webp)(N); do id=${${f:t}:r}; sips -s format jpeg -s formatOptions 82 -Z 400 "$f" --out "cast/$id.jpg" >/dev/null && echo "cast/$id.jpg"; done
