import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps } from "react";

import { sitePath } from "@/lib/base";

/**
 * Links written in markdown are site paths (`/docs/components`). The same page is served at the
 * root (a release) and under `/dev/` (`main`), so prefix them here, once, for every page.
 */
function MdxLink({ href, ...props }: ComponentProps<"a">) {
  return <a href={href ? sitePath(href) : href} {...props} />;
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    a: MdxLink,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
