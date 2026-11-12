/**
 * The base element page of a component whose registry name differs from the
 * element's, and `null` for a piece that has no `nsh/base` element (it is
 * built from `nsh` views and text).
 *
 * `nshElement` is what the page's "Base" link and the docs layout point at:
 * https://nsh.dev/elements/<nshElement>.
 */
export const NSH_ELEMENTS: Record<string, string | null> = {
  "context-menu": "menu",
  "dock-area": "dock",
  editor: "rich-editor",
  meter: null,
  "radio-group": "radio",
  segmented: "toggle",
  spinner: null,
  stat: null,
  status: null,
  "toggle-group": "toggle",
};
