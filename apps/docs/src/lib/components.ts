/** Phase-1 registry UI items for docs nav / index (excludes theme and open-state). */

export type ComponentDoc = {
  slug: string;
  title: string;
  /** Path under https://nsh.dev/elements/ (slug may differ from element name). */
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
 * Sidebar / index order: shadcn-ish meta filtered to Phase-1 components on
 * the published store CLI `nsh` (currently 0.4.0).
 */
export const components: ComponentDoc[] = [
  {
    slug: "accordion",
    title: "Accordion",
    nshElement: "accordion",
    description:
      "Styled accordion wrapping nsh/base Accordion — theme tokens + Item / Trigger / Panel; composition-only.",
  },
  {
    slug: "avatar",
    title: "Avatar",
    nshElement: "avatar",
    description: "Styled avatar wrapping nsh/base Avatar / AvatarGroup — theme tokens + fallback.",
  },
  {
    slug: "button",
    title: "Button",
    nshElement: "button",
    description: "Styled button wrapping nsh/base Button.",
  },
  {
    slug: "carousel",
    title: "Carousel",
    nshElement: "carousel",
    description:
      "Styled carousel wrapping nsh/base Carousel and its parts — theme tokens, button arrows, and pagination dots.",
  },
  {
    slug: "combobox",
    title: "Combobox",
    nshElement: "combobox",
    description:
      "Styled combobox wrapping nsh/base Combobox — theme tokens + Trigger / Content / Item; composition-only.",
  },
  {
    slug: "command",
    title: "Command",
    nshElement: "command",
    description: "Styled command palette wrapping nsh/base Command — theme tokens + default rows.",
  },
  {
    slug: "calendar",
    title: "Calendar",
    nshElement: "calendar",
    description:
      "Styled calendar wrapping nsh/base Calendar \u2014 theme tokens for days, range, today, and month toggles.",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    nshElement: "checkbox",
    description:
      "Styled checkbox wrapping nsh/base Checkbox — theme tokens + default mark; full base prop pass-through.",
  },
  {
    slug: "collapsible",
    title: "Collapsible",
    nshElement: "collapsible",
    description:
      "Styled collapsible wrapping nsh/base Collapsible — theme tokens + Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "context-menu",
    title: "Context Menu",
    nshElement: "menu",
    description:
      "Styled context menu wrapping nsh/base ContextMenu — theme tokens + Trigger / Content / Item; full base prop pass-through.",
  },
  {
    slug: "data-table",
    title: "Data Table",
    nshElement: "data-table",
    description:
      "Styled data table wrapping nsh/base DataTable — theme tokens for selection, stripe, and header chrome.",
  },
  {
    slug: "date-picker",
    title: "Date Picker",
    nshElement: "date-picker",
    description:
      "Styled date picker wrapping nsh/base DatePicker \u2014 theme tokens + Trigger; composition-only.",
  },
  {
    slug: "dialog",
    title: "Dialog",
    nshElement: "dialog",
    description:
      "Styled dialog wrapping nsh/base Dialog — theme tokens + Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "dock-area",
    title: "Dock Area",
    nshElement: "dock",
    description:
      "Styled dock workspace wrapping nsh/base DockArea — theme tokens for tabs, handles, and docks.",
  },
  {
    slug: "menu",
    title: "Menu",
    nshElement: "menu",
    description:
      "Styled menu wrapping nsh/base Menu — theme tokens + Trigger / Content / Item; full base prop pass-through.",
  },
  {
    slug: "input",
    title: "Input",
    nshElement: "input",
    description: "Styled text input wrapping nsh/base Input.",
  },
  {
    slug: "link",
    title: "Link",
    nshElement: "link",
    description: "Styled link wrapping nsh/base Link — theme tokens + underline label.",
  },
  {
    slug: "number-input",
    title: "Number Input",
    nshElement: "number-input",
    description:
      "Styled number input wrapping nsh/base NumberInput — theme tokens + stepper chrome.",
  },
  {
    slug: "otp-input",
    title: "OTP Input",
    nshElement: "otp-input",
    description: "Styled OTP input wrapping nsh/base OtpInput — theme tokens + cell chrome.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    nshElement: "pagination",
    description: "Styled pagination wrapping nsh/base Pagination — theme tokens + item chrome.",
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
    description:
      "Styled progress wrapping nsh/base Progress — theme tokens; full base prop pass-through.",
  },
  {
    slug: "radio-group",
    title: "Radio Group",
    nshElement: "radio",
    description:
      "Styled radio group wrapping nsh/base RadioGroup / Radio — theme tokens + default circle; full base prop pass-through.",
  },
  {
    slug: "resizable",
    title: "Resizable",
    nshElement: "resizable",
    description:
      "Styled resizable panels wrapping nsh/base ResizablePanelGroup / ResizablePanel — theme tokens for the handle and panel.",
  },
  {
    slug: "select",
    title: "Select",
    nshElement: "select",
    description:
      "Styled select wrapping nsh/base Select — theme tokens + Trigger / Content / Item; composition-only.",
  },
  {
    slug: "scrollbar",
    title: "Scrollbar",
    nshElement: "scrollbar",
    description:
      "Styled scrollbar wrapping nsh/base Scrollbar — theme tokens for the thumb, plus setTheme.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    nshElement: "sheet",
    description:
      "Styled sheet wrapping nsh/base Sheet — theme tokens + Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "toast",
    title: "Toast",
    nshElement: "toast",
    description:
      "Styled toast wrapping nsh/base Toast / ToastStack — theme tokens + sonner-shaped toast() / Toaster; full base prop pass-through.",
  },
  {
    slug: "slider",
    title: "Slider",
    nshElement: "slider",
    description:
      "Styled slider wrapping nsh/base Slider — theme tokens + track/range/thumb chrome.",
  },
  {
    slug: "switch",
    title: "Switch",
    nshElement: "switch",
    description:
      "Styled switch wrapping nsh/base Switch — theme tokens + size; full base prop pass-through.",
  },
  {
    slug: "table",
    title: "Table",
    nshElement: "table",
    description:
      "Styled table wrapping nsh/base Table parts — theme tokens + full base prop pass-through.",
  },
  {
    slug: "tabs",
    title: "Tabs",
    nshElement: "tabs",
    description:
      "Styled tabs wrapping nsh/base Tabs / Tab — theme tokens + List / Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "time-field",
    title: "Time Field",
    nshElement: "time-field",
    description:
      "Styled time field wrapping nsh/base TimeField \u2014 theme tokens for the well and segments.",
  },
  {
    slug: "toggle",
    title: "Toggle",
    nshElement: "toggle",
    description: "Styled toggle wrapping nsh/base Toggle — theme tokens + pressed chrome.",
  },
  {
    slug: "toggle-group",
    title: "Toggle Group",
    nshElement: "toggle",
    description:
      "Styled toggle group wrapping nsh/base ToggleGroup — muted container; re-exports Toggle.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    nshElement: "tooltip",
    description:
      "Styled tooltip wrapping nsh/base Tooltip — theme tokens + Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "tree",
    title: "Tree",
    nshElement: "tree",
    description:
      "Styled tree wrapping nsh/base Tree — theme tokens + depth, chevron, and selection.",
  },
];
