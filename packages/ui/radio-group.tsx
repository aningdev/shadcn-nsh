// Source: examples/nsh-gallery-ui/look/choice.tsx (`RadioRing`) @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, focusRing } from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { split, View } from "nsh";
import {
  Radio as BaseRadio,
  RadioGroup as BaseRadioGroup,
  type RadioGroupProps as BaseRadioGroupProps,
  type RadioProps as BaseRadioProps,
} from "nsh/base";

import { choiceBox } from "./lib/density";
import { follow } from "./lib/follow";
import { groupSink } from "./lib/press";

/**
 * Theme layer on `nsh/base` RadioGroup: the column gap only (shadcn `bases/base` RadioGroup has
 * no `variant` / `size`). All base props and style hooks pass through; consumer styles win per key.
 */
export type RadioGroupProps = BaseRadioGroupProps;

/**
 * Theme layer on `nsh/base` Radio: a ring sunk into the surface that fills in when checked, with
 * a dot growing in from half its size. shadcn name: `RadioGroupItem`; `Radio` is the
 * nsh/base-aligned alias.
 */
export type RadioProps = BaseRadioProps;
export type RadioGroupItemProps = RadioProps;

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

/** Group column gap — aligned with shadcn `cn-radio-group` stack spacing. */
function groupChrome(): ViewStyle {
  return { gap: 8 };
}

/** Row around the ring + label — aligned with shadcn horizontal Field + item. */
function rootChrome(): ViewStyle {
  return { flexDirection: "row", alignItems: "center", gap: 8 };
}

/**
 * The ring, as the first child of the radio (the radio is the `group` it sinks with): sunk into
 * the surface, filled in once checked, with a dot of the fill's foreground growing in from half
 * its size; at once with reduced motion.
 */
function RadioRing(props: { on: () => boolean }) {
  const d = choiceBox();
  const on = follow(() => (props.on() ? 1 : 0));
  return (
    <View
      class={groupSink}
      style={{
        width: d.control,
        height: d.control,
        borderRadius: d.control / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.input,
        boxShadow: finish.control.pressed,
      }}
    >
      <View
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: -1,
          left: -1,
          right: -1,
          bottom: -1,
          borderRadius: d.control / 2,
          borderWidth: 1,
          borderColor: colors.primary,
          backgroundColor: colors.primary,
          boxShadow: finish.filled,
          opacity: on,
        }}
      />
      <View
        style={{
          width: d.dot,
          height: d.dot,
          borderRadius: d.dot / 2,
          backgroundColor: colors.primaryForeground,
          opacity: on,
          transform: [{ scale: on.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }}
      />
    </View>
  );
}

export function RadioGroup(props: RadioGroupProps) {
  const [, rest] = split(props, ["style"]);

  return <BaseRadioGroup {...rest} style={mergeStyle(groupChrome(), props.style)} />;
}

/**
 * One option in a `RadioGroup` (shadcn `RadioGroupItem`). Composes the ring ahead of the label
 * `children`: base has no `indicator` prop, so the look is children content.
 */
export function RadioGroupItem(props: RadioGroupItemProps) {
  const [, rest] = split(props, ["class", "style", "focusStyle", "disabledStyle", "children"]);

  return (
    <BaseRadio
      {...rest}
      // The row is the `group` the ring sinks with while pressed.
      class={mergeClass("group", props.class)}
      style={mergeStyle(rootChrome(), props.style)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      disabledStyle={mergeStyle({ opacity: disabledOpacity() }, props.disabledStyle)}
    >
      <RadioRing on={() => !!props.checked} />
      {props.children}
    </BaseRadio>
  );
}

/** nsh/base-aligned alias for {@link RadioGroupItem}. */
export const Radio = RadioGroupItem;
