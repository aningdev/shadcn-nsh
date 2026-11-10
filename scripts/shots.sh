#!/usr/bin/env bash
# Light and dark screenshots of a gallery page, for the visual check of a family.
#   scripts/shots.sh <entry> <out-dir> [name]
# Needs the Screen Recording and Accessibility permissions (nsh test --target macos).
set -euo pipefail

entry=${1:?usage: scripts/shots.sh <entry> <out-dir> [name]}
out=${2:?usage: scripts/shots.sh <entry> <out-dir> [name]}
name=${3:-$(basename "$entry" .tsx)}

mkdir -p "$out"
out=$(cd "$out" && pwd)

nsh test "$entry" --target macos <<STEPS
await app.setColorScheme("light"); await app.wait(400);
await app.screenshot("$out/$name-light.png");
await app.setColorScheme("dark"); await app.wait(400);
await app.screenshot("$out/$name-dark.png");
STEPS
echo "wrote $out/$name-light.png and $out/$name-dark.png"
