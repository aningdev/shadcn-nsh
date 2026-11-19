// A control's children, read once: each read of `props.children` builds them again (new native
// views), so a control that uses them for more than one thing asks this instead of reading
// `props.children` for each use. One `computed` holds them: built when the control first draws
// them, and built again when what they read changes — a child that reads a signal
// (`{on() ? "Pinned" : "Pin"}`) stays live instead of freezing at its first value. Yours to change.
import { computed } from "nsh";
import type { JSX } from "nsh";

import { labelOf } from "./utils";

/** What a control holds, read where it is used: `content` is what it draws, `text` the string it
 * draws in its own type (`undefined` when the content is not a string; an empty string is a
 * string), and `label` what screen readers say — `accessibilityLabel` when the caller gave one,
 * else the string child (see `labelOf`), so content drawn as given derives no name. */
export interface Children {
  content: () => JSX.Element | undefined;
  text: () => string | undefined;
  label: () => string | null | undefined;
}

/** `props`' children, built once and kept live: call `content()` to draw them, `text()` to ask
 * whether they are a string and to draw it in the control's own type, and `label()` to name the
 * control. Call the accessors where the value is used — a constant taken from them in the body
 * would hold the first value and freeze the child. */
export function childrenOf(props: {
  accessibilityLabel?: string | null;
  children?: JSX.Element;
}): Children {
  // One read of `props.children`, on first draw and again when what the children read changes;
  // the rest is derived from it, so all three accessors see the same content.
  const held = computed(() => {
    const content = props.children;
    return {
      content,
      text: typeof content === "string" ? content : undefined,
      label: labelOf(props.accessibilityLabel, content),
    };
  });
  return { content: () => held().content, text: () => held().text, label: () => held().label };
}
