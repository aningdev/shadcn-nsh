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
  },

  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["**/tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.git/**", "tests/browser/**"],
  },
});
