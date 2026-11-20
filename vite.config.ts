import { defineConfig } from "vite-plus";

// vp fmt already respects .gitignore + .prettierignore and skips node_modules.
// oxlint discovery also skips .gitignore matches. Only list paths that are
// tracked (or otherwise walked) but should stay out of fmt/lint.
const ignoreVendored = ["references/**", ".agents/**"];
// TanStack Router writes this file on every build in its own style and asks to
// be left out of formatters; formatting it would dirty the tree after a build.
const ignoreFmt = [...ignoreVendored, "apps/website/src/routeTree.gen.ts"];
// Docs types authority is `check:docs` (the site's own tsconfig + tsc), which
// knows Vite's `import.meta.env` and the Fumadocs MDX collections.
const ignoreLint = [...ignoreVendored, "apps/website/**"];

export default defineConfig({
  resolve: { tsconfigPaths: true },
  fmt: {
    sortPackageJson: true,
    sortScripts: true,
    sortImports: true,
    sortTailwindcss: true,
    ignorePatterns: ignoreFmt,
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
    // A `// @port` region is this library's code that began as upstream text, and it may be
    // edited (`docs/ARCHITECTURE.md`). These findings are upstream's own patterns, kept as they
    // are: each entry names the upstream file the text came from, so a change is made against
    // that look, not around a lint rule.
    overrides: [
      // theme.ts: `v.spring(next, spring)` returns the animation's promise, dropped on purpose.
      {
        files: ["packages/theme/theme.ts"],
        rules: { "typescript/no-floating-promises": "off" },
      },
      // progress.tsx's sweep (look/meter.ts upstream): `sweep.keyframes(…)` returns the animation's
      // promise, dropped on purpose.
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
