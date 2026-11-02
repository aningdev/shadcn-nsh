#!/usr/bin/env bash
# Ensure a usable NSH CLI for this repo, then regenerate every .nsh types host.
#
# The GitHub release CLI (currently 0.3.0) predates several nsh/base exports
# that packages/ui imports (notably Accordion). Missing `.nsh` folders are a
# separate, later step — `nsh check` creates them. Symptom of an old CLI:
#   error: `nsh/base` has no export `Accordion` in packages/ui/accordion.tsx
#
# Same requirement as .github/workflows/deploy-docs.yml (install.sh --source).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

base_dts="apps/gallery/.nsh/types/nsh/base.d.ts"

die() {
  printf '%s\n' "$*" >&2
  exit 1
}

need_source_nsh() {
  cat <<'EOF' >&2
nsh: this repo needs a source-built CLI so nsh/base exports Accordion (and peers).

The release tarball (nsh 0.3.0) is too old. Install from source (Git + Rust):

  curl -fsSL https://nsh.dev/install.sh | sh -s -- --source

Or build the pinned submodule and link it:

  (cd references/nsh && cargo build --release --locked -p nsh-cli)
  mkdir -p ~/.nsh/bin ~/.local/bin
  ln -sfn "$(pwd)/references/nsh" ~/.nsh/source
  ln -sfn "$(pwd)/references/nsh/target/release/nsh" ~/.nsh/bin/nsh
  ln -sfn ~/.nsh/bin/nsh ~/.local/bin/nsh

Then re-run: bun run nsh:bootstrap
EOF
}

command -v nsh >/dev/null 2>&1 || {
  need_source_nsh
  exit 1
}

nsh_bin="$(command -v nsh)"
printf 'nsh: %s (%s)\n' "$(nsh -V 2>/dev/null || true)" "$nsh_bin"

# Cheap probe: release 0.3.0 binaries lack Accordion; source builds embed it.
# Prefer grepping the Mach-O directly — piping `strings` can trip binary-mode grep.
if ! grep -aobF 'Accordion' "$nsh_bin" >/dev/null 2>&1; then
  need_source_nsh
  exit 1
fi

printf 'nsh: regenerating .nsh types hosts (prepare:types)…\n'
bun run prepare:types

if [[ ! -f "$base_dts" ]] || ! grep -q 'Accordion' "$base_dts"; then
  die "nsh: $base_dts still has no Accordion after prepare:types — CLI/runtime mismatch"
fi

printf 'nsh: OK — Accordion present in %s\n' "$base_dts"
printf 'nsh: next: bun run dev:gallery\n'
