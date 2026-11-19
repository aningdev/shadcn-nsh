// A control's children drawn as its text, where the control draws them. This library's own: no
// upstream file holds it, so there is no port region. Yours to change.
import type { JSX, StyleProp, TextStyle } from "nsh";
import { Text } from "nsh";

/** What `AsText` takes: the `Text` a string child draws in, its class and its style. */
export type AsTextProps = {
  class?: string;
  style?: StyleProp<TextStyle>;
  children?: string | number | JSX.Element;
};

/**
 * A control's children, drawn as its text: a string or number child is a `Text`, and anything
 * else is drawn as it is — an element the control lays out itself, or a child that changes, which
 * arrives as a getter the renderer follows. A component, so its props are getters, read where
 * they are applied: place it where the children are drawn, `<AsText style={look()}>{props.children}</AsText>`,
 * and the one read of `props.children` is the child position — a look in `style` is re-read on
 * every style the `Text` applies, and a child that reads a signal updates where it is drawn
 * (`references/nsh/website/docs/jsx-and-components.md`, "read it once, in the place where the
 * children go"). A control hands screen readers its name through `accessibilityLabel`; a view
 * with none is read as the texts inside it, which is what the children drawn here say.
 */
export function AsText(props: AsTextProps) {
  return (
    <>
      {(() => {
        // Read once, here where the children are drawn: a string is the text, anything else as
        // it is.
        const kids = props.children;
        return typeof kids === "string" || typeof kids === "number" ? (
          <Text class={props.class} style={props.style}>
            {kids}
          </Text>
        ) : (
          kids
        );
      })()}
    </>
  );
}
