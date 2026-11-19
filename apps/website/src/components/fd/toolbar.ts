/**
 * What the demo panel's toolbar controls share (`demo-panel.tsx`, `palette-switch.tsx`): one width,
 * so a narrow screen that wraps the row stacks them in one even column, and one focus ring.
 */

/** The width every toolbar control takes: the longest palette name and its chevron fit in it. */
export const CONTROL_WIDTH = "w-40";

/** The ring a control shows while the keyboard's focus is on it; a click leaves none behind. */
export const CONTROL_FOCUS = "outline-none focus-visible:ring-2 focus-visible:ring-fd-ring";
