import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { shikiConfig } from "./src/lib/markdown.js";
import { remarkCodeTabs } from "./src/lib/remark-code-tabs.js";

// GitHub project Pages: https://aningdev.github.io/shadcn-nsh/
export default defineConfig({
  site: "https://aningdev.github.io",
  base: "/shadcn-nsh",
  srcDir: "src",
  publicDir: "public",
  outDir: "dist",
  trailingSlash: "never",
  markdown: {
    // Sätteri is Astro 7's default and has no remark plugins — use unified
    // like references/nsh/website so `tabs` fences become CodeTabs.
    processor: unified({
      remarkPlugins: [remarkCodeTabs],
    }),
    shikiConfig,
    defaultHighlightLang: "sh",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
