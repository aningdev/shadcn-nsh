// A label: the visible name of a field or a choice, drawn on `nsh`'s own View and Text. This
// library's own (upstream has none, and no `nsh/base` control is its behavior): there is no port
// region. Yours to change.
import { colors } from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewProps, ViewStyle } from "nsh";
import { split, View } from "nsh";

import { AsText } from "./lib/as-text";
import { controlSize } from "./lib/surface";

/** A label's look: the row it is (a control can sit before its text) and the type of its text. */
export interface LabelLook {
  /** A row, its content a gap apart, dimmed to half while the control beside it is off. */
  readonly root: ViewStyle;
  /** The label's own type: the control labels' size, medium, in the text color. */
  readonly text: TextStyle;
}

/** Options of `labelLook`. */
export interface LabelLookOptions {
  /** The control beside it is off: the label dims with it, as shadcn's `peer-disabled` does. */
  disabled?: boolean;
}

/**
 * A label's look, after shadcn/ui's `Label`: a row, its content a small gap apart, the text in
 * the control labels' size (14 points with a pointer, 15 on a touch screen) and weight, and the
 * theme's text color. `disabled` dims the whole label to half, which is how a label says that the
 * control beside it cannot be used.
 */
export function labelLook(o?: LabelLookOptions): LabelLook {
  return {
    get root(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        opacity: o?.disabled ? 0.5 : 1,
      };
    },
    get text(): TextStyle {
      return {
        fontSize: controlSize.label,
        fontWeight: "500",
        color: colors.foreground,
      };
    },
  };
}

/** A label's props. Besides `disabled`, every `nsh` view prop passes through; `style` goes over the look's. */
export type LabelProps = Omit<ViewProps, "children"> & {
  /** A string is the label's text, in the look's type; anything else (an icon, a note) is drawn as given. */
  children?: string | JSX.Element;
  /**
   * The control beside it is off: the label dims to half, as it does in shadcn where a disabled
   * peer dims it. This library's own prop — nsh has no sibling selector to read the control's
   * state — so set it wherever the control's own `disabled` is set.
   */
  disabled?: boolean;
};

/**
 * The visible name of a field, a checkbox or a radio, after shadcn/ui's `Label`: its text in the
 * control labels' size, medium, in the text color, a row so a `Switch` or an `Icon` can sit before
 * it. Every `nsh` view prop passes through; `style` goes over the look's.
 *
 * It names nothing for screen readers: nsh has no `htmlFor` and no `labelledBy`, so give the
 * control beside it an `accessibilityLabel`, which it reads as its name — a `Checkbox` or a
 * `TextField` is also named by the texts it draws.
 */
export function Label(props: LabelProps) {
  const [, rest] = split(props, ["children", "disabled", "style"]);
  const look = labelLook({ disabled: props.disabled });
  return (
    <View {...rest} style={[look.root, props.style ?? null]}>
      <AsText style={look.text}>{props.children}</AsText>
    </View>
  );
}
