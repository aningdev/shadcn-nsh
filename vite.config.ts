import { defineConfig } from "vite-plus";

// vp fmt already respects .gitignore + .prettierignore and skips node_modules.
// oxlint discovery also skips .gitignore matches. Only list paths that are
// tracked (or otherwise walked) but should stay out of fmt/lint.
const ignoreVendored = ["references/**", ".agents/**"];
// Docs types authority is `check:docs` (astro sync + tsc); vp type-aware lint
// does not load `astro/client`, so `import.meta.env` fails without this exclude.
const ignoreLint = [...ignoreVendored, "apps/docs/**", "scripts/sync-registry-deps.ts"];

export default defineConfig({
  resolve: { tsconfigPaths: true },
  fmt: {
    astro: true,
    sortPackageJson: true,
    sortScripts: true,
    sortImports: true,
    sortTailwindcss: true,
    ignorePatterns: ignoreVendored,
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {},
    // NSH's JSX runtime provides exactly two globals, `<If>` and `<Each>`; they
    // are never imported. Listing them keeps `react(jsx-no-undef)` on for every
    // other name. See https://nsh.dev/llms.txt.
    globals: { If: "readonly", Each: "readonly" },
    options: { typeAware: true, typeCheck: true },
    plugins: ["eslint", "typescript", "react", "import", "promise", "node", "vitest"],
    ignorePatterns: ignoreLint,
    // Upstream text inside `// @port` regions is written by `bun run port:vendor`
    // and must stay byte-identical to its source, so a finding there cannot be
    // fixed in place: it would come back on the next vendor run and `port:check`
    // would fail. Each entry names the upstream file that holds the text. Fix it
    // upstream, or in the shell around it.
    overrides: [
      // theme.ts: `v.spring(next, spring)` returns the animation's promise, dropped on purpose.
      {
        files: ["packages/theme/theme.ts"],
        rules: { "typescript/no-floating-promises": "off" },
      },
      // look/meter.ts: `sweep.keyframes(…)` returns the animation's promise, dropped on purpose.
      {
        files: ["packages/ui/progress.tsx"],
        rules: { "typescript/no-floating-promises": "off" },
      },
      // emoji.tsx: tabs mapped without keys; a ref callback assigns a `let` declared in the body.
      {
        files: ["packages/ui/emoji-picker.tsx"],
        rules: { "react/immutability": "off", "react/jsx-key": "off" },
      },
      // look/color.tsx: menus and swatches mapped without keys; a `let` timer is reassigned in `onPress`.
      {
        files: ["packages/ui/color-picker.tsx"],
        rules: { "react/immutability": "off", "react/jsx-key": "off" },
      },
    ],
  },

  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["**/tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.git/**", "tests/browser/**"],
  },
});
