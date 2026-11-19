// A control's children, read once: each read of `props.children` builds them again (new native
// views), so a control that names itself after its text and also draws it asks this instead of
// reading `props.children` for each use. Yours to change.
import type { JSX } from "nsh";

import { labelOf } from "./utils";

/** What a control holds: `content` is what it draws, `text` the string it draws in its own type
 * (`undefined` when the content is not a string; an empty string is a string), and `label` what
 * screen readers say — `accessibilityLabel` when the caller gave one, else the string child (see
 * `labelOf`), so content drawn as given derives no name. */
export interface Children {
  content: JSX.Element | undefined;
  text: string | undefined;
  label: string | null | undefined;
}

/** `props`' children, read once: draw `content`, name the control `label`, and where the control
 * draws a string in its own type, ask `text !== undefined` and draw `text`. */
export function childrenOf(props: {
  accessibilityLabel?: string | null;
  children?: JSX.Element;
}): Children {
  const content = props.children;
  return {
    content,
    text: typeof content === "string" ? content : undefined,
    label: labelOf(props.accessibilityLabel, content),
  };
}
