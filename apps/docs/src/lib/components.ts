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

/** Sidebar / index order: shadcn radix meta filtered to Phase-1, then nsh-only `link` / `number-input`. */
export const components: ComponentDoc[] = [
  {
    slug: "accordion",
    title: "Accordion",
    nshElement: "accordion",
    description: "Styled accordion wrapping nsh/base Accordion.",
  },
  {
    slug: "avatar",
    title: "Avatar",
    nshElement: "avatar",
    description: "Styled avatar wrapping nsh/base Avatar.",
  },
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
    slug: "combobox",
    title: "Combobox",
    nshElement: "combobox",
    description: "Styled combobox wrapping nsh/base Combobox.",
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
    slug: "otp-input",
    title: "OTP Input",
    nshElement: "otp-input",
    description: "Styled OTP input wrapping nsh/base OtpInput.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    nshElement: "pagination",
    description: "Styled pagination wrapping nsh/base Pagination.",
  },
  {
    slug: "popover",
    title: "Popover",
    nshElement: "popover",
    description: "Styled popover wrapping nsh/base Popover.",
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
    slug: "select",
    title: "Select",
    nshElement: "select",
    description: "Styled select wrapping nsh/base Select.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    nshElement: "sheet",
    description: "Styled sheet wrapping nsh/base Sheet.",
  },
  {
    slug: "slider",
    title: "Slider",
    nshElement: "slider",
    description: "Styled slider wrapping nsh/base Slider.",
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
    slug: "toggle",
    title: "Toggle",
    nshElement: "toggle",
    description: "Styled toggle wrapping nsh/base Toggle.",
  },
  {
    slug: "toggle-group",
    title: "Toggle Group",
    nshElement: "toggle",
    description: "Styled toggle group wrapping nsh/base ToggleGroup.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    nshElement: "tooltip",
    description: "Styled tooltip wrapping nsh/base Tooltip.",
  },
  {
    slug: "link",
    title: "Link",
    nshElement: "link",
    description: "Styled link wrapping nsh/base Link.",
  },
  {
    slug: "number-input",
    title: "Number Input",
    nshElement: "number-input",
    description: "Styled number input wrapping nsh/base NumberInput.",
  },
];
