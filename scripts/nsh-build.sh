#!/usr/bin/env bash
# Builds the NSH CLI and the web runtimes from `references/nsh` at the commit
# `port-map.json` pins, laid out as a distribution so `NSH_RUNTIME` can point at it:
#
#   <out>/bin/nsh
#   <out>/runtime/web/nsh-browser.wasm   `nsh package --target web` (the docs demos) links from it
#   <out>/runtime/web/nsh-dev.wasm       `nsh test --target web` (the render check) runs on it
#   <out>/runtime/web/nsh.js, browser/   the DOM runtime next to it
#   <out>/runtime/web/nsh-syntaxes.bin   what the editor fetches to highlight code
#
#   bash scripts/nsh-build.sh [out-dir] [--dry-run]     # default: ~/.nsh-sync
#
# A release and a nightly are both built from *some* commit; this is the only
# route to a CLI built from the pinned one (docs/toolchain.md). `.github/actions/setup-nsh`
# caches the result by commit and calls this on a cache miss.
#
# Needs Rust with the wasm32 target (`rustup target add wasm32-unknown-unknown`) and a
# clang that targets WebAssembly plus `llvm-ar` (Debian / Ubuntu: `clang llvm libclang-dev`;
# macOS: `brew install llvm` and point CC_wasm32_unknown_unknown at it).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

out="${HOME}/.nsh-sync"
dry_run=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=1 ;;
    -*) printf 'nsh-build: unknown option %s\n' "$arg" >&2; exit 2 ;;
    *) out="$arg" ;;
  esac
done

nsh_dir="$root/references/nsh"

step() { printf 'nsh-build: %s\n' "$*"; }
warn() { printf 'nsh-build: warning — %s\n' "$*" >&2; }
die() {
  printf 'nsh-build: %s\n' "$*" >&2
  exit 1
}

for tool in cargo git bun; do
  command -v "$tool" >/dev/null 2>&1 || die "$tool is not on PATH"
done

[[ -f "$nsh_dir/Cargo.toml" ]] \
  || die "references/nsh is missing: git submodule update --init --recursive"

pinned="$(bun -e 'console.log((await Bun.file("port-map.json").json()).upstream.commit)')"
head="$(git -C "$nsh_dir" rev-parse HEAD)"
[[ "$head" == "$pinned" ]] \
  || die "references/nsh is at ${head:0:7}, port-map.json pins ${pinned:0:7}: git submodule update --init references/nsh, or move the baseline with 'bun run port:bump'"
if [[ -n "$(git -C "$nsh_dir" status --porcelain)" ]]; then
  warn "references/nsh has local changes; the build is not exactly ${pinned:0:7}"
fi

wasm_cc="${CC_wasm32_unknown_unknown:-${CC:-clang}}"
wasm_ar="${AR_wasm32_unknown_unknown:-${AR:-llvm-ar}}"

# The C code the runtime depends on (zstd) is compiled for wasm32: the compiler
# has to produce a wasm32 object, and `ar` has to archive it. Apple's clang has
# no WebAssembly target; `clang --version` is no answer, compiling is.
probe_wasm_tools() {
  command -v "$wasm_cc" >/dev/null 2>&1 \
    || die "no C compiler for wasm32 ('$wasm_cc'): install clang (Debian / Ubuntu: clang llvm libclang-dev) or set CC_wasm32_unknown_unknown"
  command -v "$wasm_ar" >/dev/null 2>&1 \
    || die "no ar for wasm32 ('$wasm_ar'): install llvm (llvm-ar) or set AR_wasm32_unknown_unknown"
  local dir
  dir="$(mktemp -d)"
  if ! printf 'int nsh_wasm_probe(void) { return 0; }\n' \
    | "$wasm_cc" --target=wasm32-unknown-unknown -x c -c - -o "$dir/probe.o" 2>/dev/null; then
    rm -rf "$dir"
    die "'$wasm_cc' cannot compile for wasm32 (Apple's clang does not target WebAssembly): install an LLVM clang or point CC_wasm32_unknown_unknown at one"
  fi
  if ! "$wasm_ar" rcs "$dir/probe.a" "$dir/probe.o" 2>/dev/null; then
    rm -rf "$dir"
    die "'$wasm_ar' cannot archive a wasm32 object: install llvm (llvm-ar)"
  fi
  rm -rf "$dir"
}

# The CLI, then the two web runtimes (`runtime::WebKind`): the browser one apps are
# linked from, and the development host's `nsh test --target web` runs.
cargo_release=(cargo build --release --locked -p nsh-cli)
cargo_browser=(cargo build --profile web -p nsh-platform-web --no-default-features --features browser,linkable --target wasm32-unknown-unknown)
cargo_dev=(cargo build --profile web -p nsh-platform-web --no-default-features --features dev --target wasm32-unknown-unknown)

# A docs build needs nothing of the release profile's link-time optimization, and
# optimizing it turns a cold build into tens of minutes. Callers may ask for the
# upstream defaults (the distributed web runtime is built with LTO on).
export CARGO_PROFILE_RELEASE_LTO="${CARGO_PROFILE_RELEASE_LTO:-off}"
export CARGO_PROFILE_WEB_LTO="${CARGO_PROFILE_WEB_LTO:-off}"
export CC_wasm32_unknown_unknown="$wasm_cc"
export AR_wasm32_unknown_unknown="$wasm_ar"

target="${CARGO_TARGET_DIR:-$nsh_dir/target}"
case "$target" in /*) ;; *) target="$nsh_dir/$target" ;; esac
web_out="$target/wasm32-unknown-unknown/web"
runtime="$out/runtime/web"
source_dir="$nsh_dir/crates/nsh-platform-web/web"

if [[ -n "$dry_run" ]]; then
  cat <<EOF
at ${pinned:0:7} (references/nsh), into $out:
  (cd $nsh_dir && ${cargo_release[*]})
  (cd $nsh_dir && ${cargo_browser[*]})
  (cd $nsh_dir && ${cargo_dev[*]})
  cp $target/release/nsh $out/bin/nsh
  cp $web_out/nsh_platform_web.wasm $runtime/nsh-browser.wasm   # after the browser build
  cp $web_out/nsh_platform_web.wasm $runtime/nsh-dev.wasm       # after the dev build
  cp $source_dir/nsh.js $runtime/nsh.js
  cp -R $source_dir/browser $runtime/browser
  copy two-face's syntaxes dump (cargo metadata) to $runtime/nsh-syntaxes.bin
with CC_wasm32_unknown_unknown=$wasm_cc AR_wasm32_unknown_unknown=$wasm_ar
EOF
  exit 0
fi

probe_wasm_tools

rm -rf "$out"
mkdir -p "$out/bin" "$runtime"

step "building the CLI at ${pinned:0:7}…"
(cd "$nsh_dir" && "${cargo_release[@]}")
cp "$target/release/nsh" "$out/bin/nsh"
chmod +x "$out/bin/nsh"

step "building the browser web runtime (wasm32)…"
(cd "$nsh_dir" && "${cargo_browser[@]}")
cp "$web_out/nsh_platform_web.wasm" "$runtime/nsh-browser.wasm"

step "building the development web runtime (wasm32)…"
(cd "$nsh_dir" && "${cargo_dev[@]}")
cp "$web_out/nsh_platform_web.wasm" "$runtime/nsh-dev.wasm"

cp "$source_dir/nsh.js" "$runtime/nsh.js"
cp -R "$source_dir/browser" "$runtime/browser"

# What the editor and text views fetch to highlight code: two-face's dump, which the
# CLI writes from the crate the workspace resolves (`runtime::write_syntaxes`).
two_face="$(cd "$nsh_dir" && cargo metadata --format-version 1 2>/dev/null \
  | bun -e 'const m = await Bun.stdin.json(); const p = m.packages.find((p) => p.name === "two-face"); if (p) console.log(p.manifest_path)' \
  || true)"
syntaxes=""
[[ -n "$two_face" ]] && syntaxes="$(dirname "$two_face")/generated/syntaxes-fancy-newlines.bin"
if [[ -f "$syntaxes" ]]; then
  cp "$syntaxes" "$runtime/nsh-syntaxes.bin"
else
  warn "no two-face syntaxes dump: the editor demos will highlight nothing (docs still build)"
fi

"$out/bin/nsh" --version
step "built into $out"
step "use it: export PATH=\"$out/bin:\$PATH\" NSH_RUNTIME=\"$out/runtime\""
