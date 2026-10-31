import { defineConfig } from "astro/config";

export default defineConfig({
  srcDir: "src",
  publicDir: "public",
  outDir: "dist",
  trailingSlash: "never",
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
});
