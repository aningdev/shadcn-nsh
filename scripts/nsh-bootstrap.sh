#!/usr/bin/env bash
# Puts this checkout on the baseline: checks the installed CLI and generates the
# types hosts.
#
#   bash scripts/nsh-bootstrap.sh      # or: bun run nsh:bootstrap
#
# The project installs the NSH CLI with the official installer and never builds
# it (docs/toolchain.md):
#
#   curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly
#
# The baseline is `port-map.json`'s `upstream.commit`, which is the commit
# `nsh --version` prints. When they differ, move the baseline to the installed
# CLI with `bun run port:bump`. The installed distribution carries its runtimes,
# so web packing (`docs:demos`) and the render check need no `NSH_RUNTIME`.
#
# The only thing this writes is `.nsh/` in `apps/gallery` and `apps/docs/demos`.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

base_dts="apps/gallery/.nsh/types/nsh/base.d.ts"
demos_dts="apps/docs/demos/.nsh/types/nsh/base.d.ts"

die() {
  printf 'nsh: %s\n' "$*" >&2
  exit 1
}

# What to install: port-map.json's upstream.cli (a release tag, or nightly).
cli_version="$(bun -e 'console.log(require("./port-map.json").upstream.cli ?? "nightly")')"
if [[ "$cli_version" == nightly ]]; then
  install_cmd='curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly'
else
  install_cmd="curl -fsSL https://nsh.dev/install.sh | NSH_VERSION=$cli_version sh"
fi

command -v nsh >/dev/null 2>&1 || {
  cat >&2 <<EOF
nsh: no CLI on PATH. Install the one the baseline uses (port-map.json upstream.cli) — the
project never builds NSH:

  $install_cmd
  export PATH="\$HOME/.local/bin:\$PATH"     # the installer links it there
EOF
  exit 1
}

# The baseline, from the only source: port-map.json.
baseline="$(bun -e 'console.log((await Bun.file("port-map.json").json()).upstream.commit)')"
[[ "$baseline" =~ ^[0-9a-f]{40}$ ]] || die "port-map.json has no 40-digit upstream.commit (found '${baseline}')"

version="$(nsh --version)"
printf 'nsh: %s (%s)\n' "$version" "$(command -v nsh)" >&2
cli="$(printf '%s\n' "$version" | sed -n 's/.*(\([0-9a-f][0-9a-f]*\).*/\1/p' | head -n 1)"
[[ -n "$cli" ]] || die "the printed version has no commit; reinstall with install.sh (docs/toolchain.md)"

case "$baseline" in
  "$cli"*) ;;
  *)
    die "installed nightly $cli differs from the baseline ${baseline:0:7}: move the baseline to it with 'bun run port:bump', or install a CLI at ${baseline:0:7} (docs/toolchain.md)"
    ;;
esac

# `bun run port:vendor` and `port:check` read the baseline out of the submodule.
head="$(git -C references/nsh rev-parse HEAD 2>/dev/null || true)"
if [[ -z "$head" ]]; then
  die "references/nsh is missing: git submodule update --init references/nsh"
fi
if [[ "$head" != "$baseline" ]]; then
  die "references/nsh is at ${head:0:7}, the baseline is ${baseline:0:7}: git submodule update --init references/nsh, or move the baseline with 'bun run port:bump'"
fi

printf 'nsh: generating the .nsh types hosts (prepare:types)…\n'
bun run prepare:types

[[ -f "$base_dts" ]] || die "missing $base_dts after prepare:types"
[[ -f "$demos_dts" ]] || die "missing $demos_dts after prepare:types"

printf 'nsh: OK — CLI and upstream at the baseline %s\n' "${baseline:0:7}"
printf 'nsh: types hosts at %s and %s\n' "$base_dts" "$demos_dts"
printf 'nsh: next: bun run test:unit, nsh check apps/docs/demos, bun run check\n'
