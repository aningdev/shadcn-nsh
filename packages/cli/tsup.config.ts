import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/index.ts"],
  format: ["esm"],
  sourcemap: false,
  minify: false,
  target: "node20",
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node",
  },
});
