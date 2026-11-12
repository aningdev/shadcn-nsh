// A radio group: the look (`RadioRing`, `choiceTileLook`) and the `Radio` / `RadioGroup` that wear it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import {
  colors,
  finish,
  focusRing,
  follow,
  radius,
  terminal,
  TERMINAL_ROW,
  tints,
} from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { reduceMotion, split, Text, View } from "nsh";
import {
  Radio as BaseRadio,
  RadioGroup as BaseRadioGroup,
  type RadioGroupProps as BaseRadioGroupProps,
  type RadioProps as BaseRadioProps,
} from "nsh/base";

import { ChoiceLight, choiceSink, choiceWell } from "./checkbox";
import { pressSink } from "./lib/press";
import { controlSize } from "./lib/surface";

// @port look/choice.tsx
/** A box's or ring's size: `scale` times the page's; one row high in the
 * terminal, where it is a glyph three Cells wide. */
const dims = (scale = 1) => ({
  control: Math.round(controlSize.control * scale),
  height: terminal ? TERMINAL_ROW : Math.round(controlSize.control * scale),
  check: Math.round(controlSize.check * scale),
  corner: Math.round(controlSize.corner * scale),
  dot: Math.round(controlSize.dot * scale),
});

/**
 * A radio's ring, among the `Radio`'s children (give the radio
 * `class="group"`, so the ring sinks with it): sunk like a field, citrus
 * once checked, with a dot of the ink on the citrus growing in from half
 * its size; 16 points with a pointer, 22 on a touch screen.
 */
export function RadioRing(props: { on: boolean; scale?: number; disabled?: boolean }) {
  const d = dims(props.scale);
  const on = follow(() => (props.on ? 1 : 0));
  return (
    <View
      class={choiceSink}
      style={{
        width: d.control,
        height: d.height,
        borderRadius: d.control / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...choiceWell({ disabled: props.disabled }),
      }}
    >
      <ChoiceLight on={on} radius={d.control / 2} />
      <View
        style={{
          width: d.dot,
          height: d.dot,
          borderRadius: d.dot / 2,
          backgroundColor: colors.onAccent,
          opacity: on,
          transform: [{ scale: on.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }}
      />
    </View>
  );
}

/** A value, or a function reading it where the look is applied (a signal). */
type Live<T> = T | (() => T);

const read = <T,>(v: Live<T> | undefined): T | undefined =>
  typeof v === "function" ? (v as () => T)() : v;

/** Options of `choiceTileLook`. */
export interface ChoiceTileOptions {
  /** No hover and no press; dimmed to half. Pass the same value to the control's `disabled`. */
  disabled?: Live<boolean | undefined>;
  /** More style (a width, a gap), over the card's. */
  style?: Live<ViewStyle | undefined>;
}

/** The props `choiceTileLook` gives a choice card. */
export interface ChoiceTileLook {
  readonly style: ViewStyle;
  readonly hoverStyle: ViewStyle | undefined;
  readonly activeStyle: ViewStyle;
  readonly focusVisibleStyle: ViewStyle;
  readonly disabledStyle: ViewStyle;
}

/**
 * A choice card, whose whole surface is the checkbox or radio (spread it:
 * `<Radio {...choiceTileLook(() => on())}>`, the ring or box in its corner;
 * `on` is read where the look is applied, so a spread follows it): raised
 * while off, its edge the faint text color under the pointer; edged in the
 * accent over its tint while on, the change faded. It sinks to 97% while
 * pressed, natively (`pressSink`). Cards share a row (`flex: 1`).
 */
export function choiceTileLook(on: Live<boolean>, o?: ChoiceTileOptions): ChoiceTileLook {
  const sink = pressSink(0.97);
  const lit = () => !!read(on);
  return {
    get style(): ViewStyle {
      const on = lit();
      return {
        flex: 1,
        minWidth: 0,
        padding: 12,
        paddingTop: 14,
        borderRadius: radius.inset,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: on ? colors.accent : colors.border,
        backgroundColor: on ? tints.accent : colors.raised,
        boxShadow: on ? "none" : finish.raised.boxShadow,
        transitionProperty: "transform, border-color, background-color, box-shadow",
        transitionDuration: reduceMotion() ? 0 : 150,
        transitionTimingFunction: "ease-out",
        ...(read(o?.style) ?? {}),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      return read(o?.disabled) || lit() ? undefined : { borderColor: colors.faint };
    },
    get activeStyle(): ViewStyle {
      return sink.activeStyle;
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
    disabledStyle: { opacity: 0.5 },
  };
}
// @port end

/**
 * `nsh/base`'s RadioGroup. Every base prop passes through.
 */
export type RadioGroupProps = BaseRadioGroupProps;

/** A radio group's root. The app owns which option is checked. */
export function RadioGroup(props: RadioGroupProps) {
  return <BaseRadioGroup {...props} />;
}

/**
 * `nsh/base`'s Radio in the look of `RadioRing` (or `choiceTileLook` when `variant` is `tile`).
 * Every base prop passes through; the style props go over the look's. A string child is the label.
 */
export type RadioProps = Omit<BaseRadioProps, "children"> & {
  /** Default `ring`: a sunk ring beside the label. `tile`: the whole surface is the control. */
  variant?: "ring" | "tile";
  /** Times the page's control size (default 1): 0.8 small, 1.25 large. */
  scale?: number;
  /** A string is the label; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/** One option in a `RadioGroup` (shadcn `RadioGroupItem`). The ring sits ahead of the label. */
export function Radio(props: RadioProps) {
  const [, rest] = split(props, [
    "variant",
    "scale",
    "children",
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
  ]);
  const tile = props.variant === "tile";
  const look = tile
    ? choiceTileLook(() => !!props.checked, { disabled: () => !!props.disabled })
    : undefined;
  return (
    <BaseRadio
      {...rest}
      class={props.class ? `group ${props.class}` : "group"}
      style={[look?.style ?? null, props.style ?? null]}
      hoverStyle={[look?.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[look?.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[look?.focusVisibleStyle ?? null, props.focusVisibleStyle ?? null]}
      disabledStyle={[look?.disabledStyle ?? null, props.disabledStyle ?? null]}
    >
      <RadioRing on={!!props.checked} scale={props.scale} disabled={!!props.disabled} />
      {typeof props.children === "string" ? <Text>{props.children}</Text> : props.children}
    </BaseRadio>
  );
}

/** shadcn name for {@link Radio}. */
export const RadioGroupItem = Radio;
