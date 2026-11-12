/** Docs nav / index: one entry per component page (from registry + ported docs). */

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

export const components: ComponentDoc[] = [
  {
    slug: "accordion",
    title: "Accordion",
    nshElement: "accordion",
    description: "List rows that reveal panels with a turning chevron.",
  },
  {
    slug: "alert-dialog",
    title: "Alert Dialog",
    nshElement: "alert-dialog",
    description: "A confirmation card that waits for an action, on the shared dialog look.",
  },
  {
    slug: "avatar",
    title: "Avatar",
    nshElement: "avatar",
    description: "A round picture or name-colored initials on the identity ring.",
  },
  {
    slug: "badge",
    title: "Badge",
    nshElement: "badge",
    description: "A small capsule label in a neutral, toned, or outline style.",
  },
  {
    slug: "button",
    title: "Button",
    nshElement: "button",
    description: "A button, an icon button, a round button, and a split button.",
  },
  {
    slug: "calendar",
    title: "Calendar",
    nshElement: "calendar",
    description: "A month of days to pick a date or a range, on the shared calendar look.",
  },
  {
    slug: "carousel",
    title: "Carousel",
    nshElement: "carousel",
    description: "Snapping slides with round arrows and a traveling dot pill.",
  },
  {
    slug: "checkbox",
    title: "Checkbox",
    nshElement: "checkbox",
    description: "A sunk box that fills in citrus, with a check or a dash springing in.",
  },
  {
    slug: "collapsible",
    title: "Collapsible",
    nshElement: "collapsible",
    description: "A disclosure row that reveals a panel beneath it.",
  },
  {
    slug: "color-picker",
    title: "ColorPicker",
    nshElement: "color-picker",
    description: "Area, sliders, joined fields, swatches, and a popover trigger.",
  },
  {
    slug: "combobox",
    title: "Combobox",
    nshElement: "combobox",
    description: "A searchable field with a list of choices, on the shared listbox look.",
  },
  {
    slug: "command",
    title: "Command",
    nshElement: "command",
    description: "A search palette with sectioned, virtualized rows.",
  },
  {
    slug: "context-menu",
    title: "Context Menu",
    nshElement: "context-menu",
    description: "A menu at the pointer, on the shared menu look.",
  },
  {
    slug: "data-table",
    title: "DataTable",
    nshElement: "data-table",
    description: "A striped table with sortable, resizable columns.",
  },
  {
    slug: "date-picker",
    title: "Date Picker",
    nshElement: "date-picker",
    description: "A calendar in a popup from a field trigger, on the shared listbox look.",
  },
  {
    slug: "dialog",
    title: "Dialog",
    nshElement: "dialog",
    description:
      "Styled dialog wrapping nsh/base Dialog — theme tokens + Trigger / Content; full base prop pass-through.",
  },
  {
    slug: "diff-view",
    title: "DiffView",
    nshElement: "diff-view",
    description: "Up and down tints for additions and deletions, with hunk actions.",
  },
  {
    slug: "dock-area",
    title: "DockArea",
    nshElement: "dock-area",
    description: "Dockable workspace chrome for tabs, splits, and edge docks.",
  },
  {
    slug: "editor",
    title: "Editor",
    nshElement: "editor",
    description: "Rich document typography and a code editor pass-through.",
  },
  {
    slug: "emoji-picker",
    title: "Emoji picker",
    nshElement: "emoji-picker",
    description: "Tabs, search, skin tones and grid styled for nsh/base EmojiPicker.",
  },
  {
    slug: "hover-card",
    title: "Hover Card",
    nshElement: "hover-card",
    description: "A preview card that grows from its trigger, on the shared popover surface.",
  },
  {
    slug: "input",
    title: "Input",
    nshElement: "input",
    description: "A sunk text field — single-line, multiline, masked, or invalid.",
  },
  {
    slug: "link",
    title: "Link",
    nshElement: "link",
    description: "A text link with underline motion, on the shared nav look.",
  },
  {
    slug: "menu",
    title: "Menu",
    nshElement: "menu",
    description: "A menu of items, separators and submenus on the shared menu look.",
  },
  {
    slug: "meter",
    title: "Meter",
    nshElement: "meter",
    description: "A horizontal meter with an optional limit marker.",
  },
  {
    slug: "number-input",
    title: "Number Input",
    nshElement: "number-input",
    description: "A sunk number field with − / + or stacked chevron steppers.",
  },
  {
    slug: "otp-input",
    title: "OTP Input",
    nshElement: "otp-input",
    description: "One-time code cells that lift out of sunk wells as digits fill in.",
  },
  {
    slug: "pagination",
    title: "Pagination",
    nshElement: "pagination",
    description: "Page numbers and chevrons with the current page lit primary.",
  },
  {
    slug: "plot",
    title: "Plot",
    nshElement: "plot",
    description: "Chart colors, grid, cross line and tooltip for nsh/base/plot.",
  },
  {
    slug: "popover",
    title: "Popover",
    nshElement: "popover",
    description: "A popup panel that grows from its trigger, on the shared menu surface.",
  },
  {
    slug: "progress",
    title: "Progress",
    nshElement: "progress",
    description: "A determinate or indeterminate bar on the shared meter rail.",
  },
  {
    slug: "radio-group",
    title: "Radio Group",
    nshElement: "radio-group",
    description:
      "A sunk ring that fills in citrus, with a dot growing in — alone or as a choice tile.",
  },
  {
    slug: "resizable",
    title: "Resizable",
    nshElement: "resizable",
    description: "Resize handles with a quiet hairline and a growing thumb.",
  },
  {
    slug: "scrollbar",
    title: "Scrollbar",
    nshElement: "scrollbar",
    description: "A hover scroll bar in the shared gallery theme.",
  },
  {
    slug: "segmented",
    title: "Segmented",
    nshElement: "segmented",
    description: "A sunk track whose raised thumb springs to the selected segment.",
  },
  {
    slug: "select",
    title: "Select",
    nshElement: "select",
    description: "A list of choices from a field trigger, on the shared listbox look.",
  },
  {
    slug: "sheet",
    title: "Sheet",
    nshElement: "sheet",
    description: "A panel that slides in from an edge of the screen over a scrim.",
  },
  {
    slug: "slider",
    title: "Slider",
    nshElement: "slider",
    description: "A sunk rail, citrus fill, and round thumb with a focus ring.",
  },
  {
    slug: "stat",
    title: "Stat",
    nshElement: "stat",
    description: "A label above a value for metric grids.",
  },
  {
    slug: "status",
    title: "Status",
    nshElement: "status",
    description: "A dot and label for quiet state in rows or headers.",
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
    description: "Composition parts for a bordered table card using the shared data-table classes.",
  },
  {
    slug: "tabs",
    title: "Tabs",
    nshElement: "tabs",
    description: "A pill track or underlined row with a traveling indicator.",
  },
  {
    slug: "text-view",
    title: "TextView",
    nshElement: "text-view",
    description: "Brand-colored links and a pulsing streaming caret.",
  },
  {
    slug: "time-field",
    title: "Time Field",
    nshElement: "time-field",
    description: "A sunk well for a time of day, one segment at a time.",
  },
  {
    slug: "toast",
    title: "Toast",
    nshElement: "toast",
    description: "A raised banner with a title, optional description, action and close.",
  },
  {
    slug: "toggle-group",
    title: "Toggle Group",
    nshElement: "toggle-group",
    description: "A row or column of toggles on the inset toolbar track.",
  },
  {
    slug: "toggle",
    title: "Toggle",
    nshElement: "toggle",
    description: "A two-state button, in two variants and three sizes.",
  },
  {
    slug: "toolbar",
    title: "Toolbar",
    nshElement: "toolbar",
    description: "An inset track of tools, with groups and hairline separators.",
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    nshElement: "tooltip",
    description: "A popover-coloured hint bubble on any element's `tooltip` prop.",
  },
  {
    slug: "tree",
    title: "Tree",
    nshElement: "tree",
    description: "A virtualized tree with chevrons and folder icons.",
  },
];
