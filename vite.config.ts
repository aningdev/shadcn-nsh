import { defineConfig } from "vite-plus";

const ignorePatterns = [".agents/skills", "references/**", "**/.nsh/**"];

export default defineConfig({
  resolve: { tsconfigPaths: true },

  fmt: {
    sortPackageJson: true,
    sortScripts: true,
    sortImports: true,
    sortTailwindcss: true,
    ignorePatterns: ignorePatterns,
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {},
    options: { typeAware: true, typeCheck: true },
    plugins: ["eslint", "typescript", "react", "import", "promise", "node", "vitest"],
    ignorePatterns: ignorePatterns,
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.git/**", "tests/browser/**"],
  },
});
