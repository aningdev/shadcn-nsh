/** Phase-1 registry UI items for docs nav / index (excludes theme, popup-surface). */

export type ComponentDoc = {
  slug: string;
  title: string;
  /** Path under https://nsh.dev/elements/ (slug may differ, e.g. dropdown-menu → menu). */
  nshElement: string;
  description: string;
};

export function getComponentBySlug(slug: string): ComponentDoc | undefined {
  return components.find((c) => c.slug === slug);
}

export function nshElementHref(nshElement: string): string {
  return `https://nsh.dev/elements/${nshElement}`;
}

/**
 * Sidebar / index order: shadcn-ish meta filtered to components available on
 * the published store CLI `nsh` (currently 0.3.0). Newer base-only pieces
 * (Accordion, Select, Link, …) stay out until a store release exports them.
 */
export const components: ComponentDoc[] = [
  {
    slug: "button",
    title: "Button",
    nshElement: "button",
    description: "Styled button wrapping nsh/base Button.",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    nshElement: "checkbox",
    description: "Styled checkbox wrapping nsh/base Checkbox.",
  },
  {
    slug: "collapsible",
    title: "Collapsible",
    nshElement: "collapsible",
    description: "Styled collapsible wrapping nsh/base Collapsible.",
  },
  {
    slug: "context-menu",
    title: "Context Menu",
    nshElement: "menu",
    description: "Styled context menu wrapping nsh/base ContextMenu.",
  },
  {
    slug: "dialog",
    title: "Dialog",
    nshElement: "dialog",
    description: "Styled dialog wrapping nsh/base Dialog.",
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown Menu",
    nshElement: "menu",
    description: "Styled menu wrapping nsh/base Menu.",
  },
  {
    slug: "input",
    title: "Input",
    nshElement: "input",
    description: "Styled text input wrapping nsh/base Input.",
  },
  {
    slug: "popover",
    title: "Popover",
    nshElement: "popover",
    description:
      "Styled popover wrapping nsh/base Popover — theme tokens + Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "progress",
    title: "Progress",
    nshElement: "progress",
    description: "Styled progress wrapping nsh/base Progress.",
  },
  {
    slug: "radio-group",
    title: "Radio Group",
    nshElement: "radio",
    description: "Styled radio group wrapping nsh/base RadioGroup.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    nshElement: "sheet",
    description: "Styled sheet wrapping nsh/base Sheet.",
  },
  {
    slug: "toast",
    title: "Toast",
    nshElement: "toast",
    description: "Styled toast wrapping nsh/base Toast.",
  },
  {
    slug: "switch",
    title: "Switch",
    nshElement: "switch",
    description: "Styled switch wrapping nsh/base Switch.",
  },
  {
    slug: "table",
    title: "Table",
    nshElement: "table",
    description: "Styled table wrapping nsh/base Table.",
  },
  {
    slug: "tabs",
    title: "Tabs",
    nshElement: "tabs",
    description: "Styled tabs wrapping nsh/base Tabs.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    nshElement: "tooltip",
    description: "Styled tooltip wrapping nsh/base Tooltip.",
  },
];
