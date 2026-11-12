#!/usr/bin/env bash
# The baseline is one commit, and three things must name it:
#
#   nsh --version   →  nsh 0.5.0 (30f87b7)
#   port-map.json   →  upstream.commit 30f87b7c53bde…
#   references/nsh  →  HEAD
#
#   bash scripts/nsh-version.sh           # check both against the pin (CI uses this)
#   bash scripts/nsh-version.sh --print   # the CLI's commit only; empty when it has none
#
# On a mismatch it exits 1 and says what to run: the CLI is installed at the pin
# (`scripts/nsh-bootstrap.sh` explains how), or the submodule is moved to it
# (`bun run port:bump`). See docs/toolchain.md.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

err() {
  if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
    printf '::error::%s\n' "$*" >&2
  else
    printf 'nsh: %s\n' "$*" >&2
  fi
}

die() {
  err "$@"
  exit 1
}

# The pin, from the only source: port-map.json.
command -v bun >/dev/null 2>&1 || die "bun is not on PATH (https://bun.com)"
pinned="$(bun -e 'console.log((await Bun.file("port-map.json").json()).upstream.commit)')"
[[ "$pinned" =~ ^[0-9a-f]{40}$ ]] || die "port-map.json has no 40-digit upstream.commit (found '${pinned}')"

# The commit the CLI was built from: the parentheses of `nsh --version`.
cli=""
if command -v nsh >/dev/null 2>&1; then
  version="$(nsh --version 2>/dev/null || nsh -V 2>/dev/null || true)"
  cli="$(printf '%s\n' "$version" | sed -n 's/.*(\([0-9a-f][0-9a-f]*\).*/\1/p' | head -n 1)"
  # stderr: `--print` writes the commit alone on stdout.
  printf 'nsh: CLI %s (%s)\n' "$version" "$(command -v nsh)" >&2
else
  printf 'nsh: no CLI on PATH\n' >&2
fi

if [[ "${1:-}" == "--print" ]]; then
  printf '%s\n' "$cli"
  [[ -n "$cli" ]] || exit 1
  exit 0
fi

if [[ -z "$cli" ]]; then
  printf 'nsh: install the CLI at the baseline %s:\n' "${pinned:0:7}" >&2
  cat >&2 <<'EOF'
  curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly   # the latest nightly
  curl -fsSL https://nsh.dev/install.sh | sh -s -- --source    # build main (Rust)

The nightly channel may be behind main: this repo develops against main, so a
nightly older than the baseline is the wrong CLI (docs/toolchain.md).
EOF
  exit 1
fi

if [[ "$pinned" != "$cli"* ]]; then
  # Which way round tells the fix: an older CLI means install one at the pin, a
  # newer one means the submodule moves to the CLI's commit.
  if git -C references/nsh cat-file -e "${cli}^{commit}" 2>/dev/null; then
    if [[ "$(git -C references/nsh rev-list --count "${pinned}..${cli}")" != "0" ]]; then
      die "the nsh CLI is built from ${cli}, ahead of the baseline ${pinned:0:7}: move the baseline to it with 'bun run port:bump'"
    fi
    if [[ "$(git -C references/nsh rev-list --count "${cli}..${pinned}")" != "0" ]]; then
      die "the nsh CLI is built from ${cli}, behind the baseline ${pinned:0:7}: install the CLI at ${pinned:0:7} (curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly, or --source when the nightly is behind main); the baseline does not move back"
    fi
  fi
  die "the nsh CLI is built from ${cli}, the baseline is ${pinned:0:7}: move the baseline to it with 'bun run port:bump' (it defaults to the CLI's commit), or install the CLI at ${pinned:0:7}"
fi

# The submodule the port reads: at the pin, or nothing builds from the pin.
head="$(git -C references/nsh rev-parse HEAD 2>/dev/null || true)"
if [[ -z "$head" ]]; then
  die "references/nsh is missing: git submodule update --init --recursive"
fi
if [[ "$head" != "$pinned" ]]; then
  die "references/nsh is at ${head:0:7}, the baseline is ${pinned:0:7}: git submodule update --init references/nsh, or move the baseline with 'bun run port:bump'"
fi

printf 'nsh: CLI and upstream at the baseline %s\n' "${pinned:0:7}"
