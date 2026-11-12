#!/usr/bin/env bash
# Puts this checkout on the baseline: the CLI, the submodule, and the types hosts.
#
#   bash scripts/nsh-bootstrap.sh      # or: bun run nsh:bootstrap
#
# The baseline is one commit, `port-map.json`'s `upstream.commit`. The CLI must be
# built from it and `references/nsh` checked out at it (scripts/nsh-version.sh says
# how to fix either), and the generated `.nsh` types hosts come from it. The only
# thing this writes is `.nsh/` in `apps/gallery` and `apps/docs/demos`.
#
# Web packing (`bun run docs:demos`, `bun run port:render`) needs a runtime tree;
# the last step prints what to export as `NSH_RUNTIME` for it (docs/toolchain.md).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

base_dts="apps/gallery/.nsh/types/nsh/base.d.ts"
demos_dts="apps/docs/demos/.nsh/types/nsh/base.d.ts"

die() {
  printf 'nsh: %s\n' "$*" >&2
  exit 1
}

# Absolute path of a symlink chain (macOS's readlink has no -f).
resolve() {
  local target="$1"
  while [ -L "$target" ]; do
    local link
    link="$(readlink "$target")"
    case "$link" in
      /*) target="$link" ;;
      *) target="$(dirname "$target")/$link" ;;
    esac
  done
  printf '%s\n' "$target"
}

command -v nsh >/dev/null 2>&1 || {
  cat >&2 <<'EOF'
nsh: no CLI on PATH. This repo develops against upstream's main, not a store release:

  bun run nsh:build                                   # build the pinned commit (needs Rust)
  curl -fsSL https://nsh.dev/install.sh | sh -s -- --nightly
  curl -fsSL https://nsh.dev/install.sh | sh -s -- --source

The CLI must be built from the baseline commit (docs/toolchain.md); --nightly may
be behind it.
EOF
  exit 1
}

# The CLI's commit against the pin, then the submodule against both.
bash scripts/nsh-version.sh

# Where the web runtimes are, relative to the CLI: a distribution next to `bin/nsh`,
# an installed runtime tree, or a checkout's wasm build. NSH_RUNTIME wins if it is
# already set.
runtime=""
if [[ -n "${NSH_RUNTIME:-}" ]]; then
  runtime="$NSH_RUNTIME"
else
  cli_bin="$(resolve "$(command -v nsh)")"
  install_root="$(dirname "$(dirname "$cli_bin")")"
  for candidate in "$HOME/.nsh/runtime" "$install_root/runtime" "$install_root/target/wasm32-unknown-unknown"; do
    if [[ -f "$candidate/web/nsh-browser.wasm" ]]; then
      runtime="$candidate"
      break
    fi
  done
fi

if [[ -n "$runtime" ]]; then
  [[ -f "$runtime/web/nsh-browser.wasm" ]] \
    || die "NSH_RUNTIME=$runtime has no web/nsh-browser.wasm: \`nsh package --target web\` (the docs demos) needs it; point NSH_RUNTIME at a runtime tree or run 'bash scripts/nsh-build.sh'"
  [[ -f "$runtime/web/nsh-dev.wasm" ]] \
    || die "NSH_RUNTIME=$runtime has no web/nsh-dev.wasm: \`nsh test --target web\` (port:render) needs it; run 'bash scripts/nsh-build.sh'"
fi

printf 'nsh: regenerating .nsh types hosts (prepare:types)…\n'
bun run prepare:types

[[ -f "$base_dts" ]] || die "missing $base_dts after prepare:types"
[[ -f "$demos_dts" ]] || die "missing $demos_dts after prepare:types"

# The baseline's declarations the shell depends on: `focusVisibleStyle` is how the
# components draw focus (docs/toolchain.md), and no release before it has it.
if ! grep -q 'focusVisibleStyle' "$base_dts"; then
  die "$base_dts has no focusVisibleStyle — the CLI is not the baseline"
fi
for symbol in Button Accordion Popover; do
  grep -q "$symbol" "$base_dts" || die "$base_dts has no $symbol — unexpected CLI"
done

printf 'nsh: OK — types hosts at %s and %s\n' "$base_dts" "$demos_dts"
if [[ -n "$runtime" ]]; then
  printf 'nsh: web packing uses %s\n' "$runtime"
  if [[ -z "${NSH_RUNTIME:-}" ]]; then
    printf 'nsh: export it for `bun run docs:demos` and `bun run port:render`:\n  export NSH_RUNTIME="%s"\n' "$runtime"
  fi
else
  cat <<'EOF'
nsh: no web runtime tree found. `bun run docs:demos` and `bun run port:render`
     need one; either build and point at it:

  bash scripts/nsh-build.sh
  export NSH_RUNTIME="$HOME/.nsh-sync/runtime"

     or let the CLI build the wasm from references/nsh (needs
     `rustup target add wasm32-unknown-unknown`, a wasm32 clang and llvm-ar).
EOF
fi
printf 'nsh: next: bun run test:unit, nsh check apps/docs/demos, bun run check\n'
