import { defineConfig } from "vite-plus";

// vp fmt already respects .gitignore + .prettierignore and skips node_modules.
// oxlint discovery also skips .gitignore matches. Only list paths that are
// tracked (or otherwise walked) but should stay out of fmt/lint.
const ignoreVendored = ["references/**", ".agents/skills"];

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
    options: { typeAware: true, typeCheck: true },
    plugins: ["eslint", "typescript", "react", "import", "promise", "node", "vitest"],
    ignorePatterns: ignoreVendored,
  },

  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["**/tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.git/**", "tests/browser/**"],
  },
});
