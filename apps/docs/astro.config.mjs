import { defineConfig } from "astro/config";

// GitHub project Pages: https://aningdev.github.io/shadcn-nsh/
export default defineConfig({
  site: "https://aningdev.github.io",
  base: "/shadcn-nsh",
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
