// A number input: the look (`numberInputClasses`, `numberInputSteps`) and the `NumberInput` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { colors, terminal } from "@shadcn-nsh/theme";
import type { InputStyle } from "nsh";
import { platform, split, Text } from "nsh";
import {
  NumberInput as BaseNumberInput,
  type NumberInputProps as BaseNumberInputProps,
} from "nsh/base";

import { edgeClass, fieldSize } from "./input";
import { Icon } from "./lib/icons";

// @port look/field.tsx
const pointer = platform.desktop;

/** The step buttons' feedback: lit under the pointer, darker while pressed, faded where a step does nothing. */
const press = terminal
  ? "justify-center disabled:opacity-50"
  : "items-center justify-center transition-colors duration-100 motion-reduce:transition-none enabled:hover:bg-accent active:bg-track disabled:opacity-50";

/**
 * A number input's parts as classes (`NumberInput`'s `class` and its
 * buttons'): `frame` the well (32 high with a pointer, 44 on a touch
 * screen; a stronger edge under the pointer, the focus edge while its field
 * edits), `stepBefore` / `stepAfter` − before the field and + after it,
 * `pair` / `pairButton` the increment over the decrement at the well's end.
 * `w` is a button's width class (`w-8`). In a terminal the input is one band
 * a row high, its steppers at the band's end.
 */
export const numberInputClasses = {
  frame: terminal
    ? "h-4 flex-row items-stretch bg-field pl-2 disabled:opacity-50"
    : [
        pointer ? "h-8 rounded-[7px]" : "h-11 rounded-lg",
        "flex-row items-stretch overflow-hidden border bg-field",
        edgeClass({ rest: "border-input", hover: "border-faint", hoverVariant: "enabled:hover" }),
      ].join(" "),
  press,
  stepBefore: (w: string) => `${w} ${press} border-r border-line`,
  stepAfter: (w: string) => `${w} ${press} border-l border-line`,
  pair: (w: string) => `${w} border-l border-line`,
  pairButton: (top: boolean) => `flex-1 ${press}${top ? " border-b border-line" : ""}`,
};

/** A number input's field (`inputStyle`): the label size, tabular figures; at the end of a terminal's band, as a column of numbers reads. */
export function numberInputText(): InputStyle {
  return {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    fontSize: fieldSize.font,
    color: colors.text,
    placeholderColor: colors.muted,
    fontVariant: ["tabular-nums"],
    ...(terminal ? { textAlign: "right" as const } : {}),
  };
}

/** A step button's text glyph in a terminal, which draws no icons. */
const STEP_GLYPHS = { plus: "+", minus: "−" } as const;

/** A step button's glyph: the icon in the muted text color; a terminal's text glyph. */
export function NumberStep(props: {
  name: "plus" | "minus" | "chevron-up" | "chevron-down";
  size: number;
}) {
  if (terminal && (props.name === "plus" || props.name === "minus"))
    return <Text style={{ color: colors.muted }}>{STEP_GLYPHS[props.name]}</Text>;
  return <Icon name={props.name} size={props.size} tint={colors.muted} />;
}

/**
 * A number input's step buttons (spread them on `NumberInput`): − before
 * the field and + after it (`split`), or a pair of chevrons at the well's
 * end (`pair`); in a terminal always − and + at the band's end, each in a
 * slot of three Cells. `w` is a button's width class, `icon` its glyph's size.
 */
export function numberInputSteps(kind: "split" | "pair", w: string, icon: number) {
  if (terminal) {
    return {
      controlsRight: true,
      controlsClass: "flex-row",
      decrementButtonClass: `w-6 shrink-0 flex-row items-center ${press}`,
      incrementButtonClass: `w-6 shrink-0 flex-row items-center ${press}`,
      decrementButton: <NumberStep name="minus" size={icon} />,
      incrementButton: <NumberStep name="plus" size={icon} />,
    };
  }
  if (kind === "split") {
    return {
      decrementButtonClass: numberInputClasses.stepBefore(w),
      incrementButtonClass: numberInputClasses.stepAfter(w),
      decrementButton: <NumberStep name="minus" size={icon} />,
      incrementButton: <NumberStep name="plus" size={icon} />,
    };
  }
  return {
    controlsRight: true,
    controlsClass: numberInputClasses.pair(w),
    incrementButtonClass: numberInputClasses.pairButton(true),
    decrementButtonClass: numberInputClasses.pairButton(false),
    incrementButton: <NumberStep name="chevron-up" size={icon - 2} />,
    decrementButton: <NumberStep name="chevron-down" size={icon - 2} />,
  };
}
// @port end

/**
 * `nsh/base`'s NumberInput in the look of `numberInputClasses` / `numberInputSteps`. Every base
 * prop passes through; `class`, `inputStyle` and the step props go over the look's.
 */
export type NumberInputProps = BaseNumberInputProps & {
  /** Default `pair`: chevrons at the end. `split`: − before the field and + after it. */
  steps?: "split" | "pair";
};

/** A number field with step buttons. */
export function NumberInput(props: NumberInputProps) {
  const [, rest] = split(props, [
    "steps",
    "class",
    "inputStyle",
    "controlsRight",
    "controlsClass",
    "decrementButtonClass",
    "incrementButtonClass",
    "decrementButton",
    "incrementButton",
  ]);
  const kind = props.steps ?? "pair";
  // Upstream's widths: a pair of chevrons sits in a narrower lane (`w-6` / `w-9`) than a − and
  // + either side of the field (`w-8` / `w-11`).
  const lanes =
    kind === "pair" ? { desktop: "w-6", touch: "w-9" } : { desktop: "w-8", touch: "w-11" };
  const w = pointer ? lanes.desktop : lanes.touch;
  const icon = pointer ? 14 : 16;
  const steps = numberInputSteps(kind, w, icon);
  return (
    <BaseNumberInput
      {...rest}
      class={props.class ? `${numberInputClasses.frame} ${props.class}` : numberInputClasses.frame}
      inputStyle={[numberInputText(), props.inputStyle ?? null]}
      controlsRight={props.controlsRight ?? steps.controlsRight}
      controlsClass={props.controlsClass ?? steps.controlsClass}
      decrementButtonClass={props.decrementButtonClass ?? steps.decrementButtonClass}
      incrementButtonClass={props.incrementButtonClass ?? steps.incrementButtonClass}
      decrementButton={props.decrementButton ?? steps.decrementButton}
      incrementButton={props.incrementButton ?? steps.incrementButton}
    />
  );
}
