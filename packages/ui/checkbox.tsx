// Source: examples/nsh-gallery-ui/look/choice.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, focusRing } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { split, Text, View } from "nsh";
import { Checkbox as BaseCheckbox, type CheckboxProps as BaseCheckboxProps } from "nsh/base";

import { choiceBox } from "./lib/density";
import { follow } from "./lib/follow";
import { groupSink } from "./lib/press";

/**
 * Theme layer on `nsh/base` Checkbox: a box sunk into the surface that fills in when on, with
 * its mark springing in (shadcn `bases/base` Checkbox has no `variant` / `size`). All base props
 * and style hooks pass through; consumer styles win per key.
 */
export type CheckboxProps = BaseCheckboxProps;

/** What the box shows: a check, a dash (indeterminate), or nothing. */
type Mark = "check" | "dash" | null;

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/** A layer over the whole of its parent, its content centered: layers that cross over in place. */
const centered = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
} as const;

/** Row around the indicator + label — aligned with shadcn horizontal Field + checkbox. */
function rootChrome(): ViewStyle {
  return { flexDirection: "row", alignItems: "center", gap: 8 };
}

/** The empty box: sunk into the surface, edged like a field. */
function boxChrome(): ViewStyle {
  const d = choiceBox();
  return {
    width: d.control,
    height: d.control,
    borderRadius: d.corner,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.input,
    boxShadow: finish.control.pressed,
  };
}

/**
 * The box's content: the filled control's fill fading in over the empty box, and a check and a
 * dash that each follow the value on a spring of their own and grow in from 75%, so a check
 * turning into a dash crosses over on a fill that stays; at once with reduced motion.
 */
function CheckboxMark(props: { mark: () => Mark }) {
  const d = choiceBox();
  const filled = follow(() => (props.mark() ? 1 : 0));
  const check = follow(() => (props.mark() === "check" ? 1 : 0));
  const dash = follow(() => (props.mark() === "dash" ? 1 : 0));
  const layer = (t: typeof filled, child: JSX.Element) => (
    <View
      style={{
        ...centered,
        opacity: t,
        transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }],
      }}
    >
      {child}
    </View>
  );
  // One view as large as the box inside its border holds the layers: the slot's content sits in
  // a holder sized to it, so layers placed only absolutely would make it 0 × 0.
  return (
    <View style={{ width: d.control - 2, height: d.control - 2 }}>
      <View
        style={{
          ...centered,
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: d.corner,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          boxShadow: finish.filled,
          opacity: filled,
        }}
      />
      {layer(
        check,
        <Text
          style={{
            fontSize: d.check,
            fontWeight: "700",
            lineHeight: d.check + 2,
            color: colors.primaryForeground,
          }}
        >
          ✓
        </Text>,
      )}
      {layer(
        dash,
        <View
          style={{
            width: d.check * 0.8,
            height: 2,
            borderRadius: 1,
            backgroundColor: colors.primaryForeground,
          }}
        />,
      )}
    </View>
  );
}

/** A checkbox: a sunk box with the fill and the mark springing in; every base prop passes through. */
export function Checkbox(props: CheckboxProps) {
  // Props are read where used (never destructured) so `checked` / `indeterminate` follow signals.
  const [, rest] = split(props, [
    "class",
    "style",
    "focusStyle",
    "disabledStyle",
    "indicatorClass",
    "indicatorStyle",
    "indicator",
  ]);

  const mark = (): Mark => (props.indeterminate ? "dash" : props.checked ? "check" : null);

  return (
    <BaseCheckbox
      {...rest}
      // The row is the `group` the box sinks with while pressed.
      class={mergeClass("group", props.class)}
      style={mergeStyle(rootChrome(), props.style)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      disabledStyle={mergeStyle({ opacity: disabledOpacity() }, props.disabledStyle)}
      indicatorClass={mergeClass(groupSink, props.indicatorClass)}
      indicatorStyle={mergeStyle(boxChrome(), props.indicatorStyle)}
      indicator={props.indicator ?? <CheckboxMark mark={mark} />}
    />
  );
}
