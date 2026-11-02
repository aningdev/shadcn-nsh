#!/usr/bin/env bash
# Ensure a usable NSH CLI for this repo, then regenerate every .nsh types host.
#
# This repo targets the **store / GitHub release CLI** (currently 0.3.0), not
# `install.sh --source`. Phase-1 `@shadcn-nsh/ui` only wraps `nsh/base` exports
# present in that release. Missing `.nsh` folders are a separate step —
# `nsh check` creates them.
#
# Same install path as .github/workflows/deploy-docs.yml.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

base_dts="apps/gallery/.nsh/types/nsh/base.d.ts"

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

need_store_nsh() {
  cat <<'EOF' >&2
nsh: install the published store CLI (release tarball), not --source:

  curl -fsSL https://nsh.dev/install.sh | sh

Then ensure ~/.local/bin (or ~/.nsh/bin) is on PATH and re-run:
  bun run nsh:bootstrap
EOF
}

command -v nsh >/dev/null 2>&1 || {
  need_store_nsh
  exit 1
}

nsh_bin="$(command -v nsh)"
printf 'nsh: %s (%s)\n' "$(nsh -V 2>/dev/null || true)" "$nsh_bin"

# Reject source-checkout installs that point at a cargo-built binary under ~/.nsh/source
# when the user still thinks they need main — we want the store release for CI parity.
if [[ -L "$nsh_bin" ]]; then
  target="$(readlink -f "$nsh_bin" 2>/dev/null || readlink "$nsh_bin" || true)"
  if [[ "${target:-}" == *'/.nsh/source/'* ]] || [[ "${target:-}" == *'/target/release/nsh' ]]; then
    printf 'nsh: warning — %s looks like a source build; prefer store CLI for this repo\n' "$nsh_bin" >&2
  fi
fi

printf 'nsh: regenerating .nsh types hosts (prepare:types)…\n'
bun run prepare:types

if [[ ! -f "$base_dts" ]]; then
  die "nsh: missing $base_dts after prepare:types"
fi

# Sanity: store 0.3.0 has Button; Accordion is intentionally out of Phase-1.
if ! grep -q 'Button' "$base_dts"; then
  die "nsh: $base_dts has no Button — unexpected CLI/runtime"
fi
if grep -q 'Accordion' "$base_dts"; then
  printf 'nsh: note — Accordion present in types (newer than store 0.3.0 pin); Phase-1 still omits it until we re-expand\n'
fi

printf 'nsh: OK — types host ready at %s\n' "$base_dts"
printf 'nsh: next: bun run check:gallery / bun run dev:gallery\n'
