// A checkbox: the look (`checkboxLook` and its companions) and the `Checkbox` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  alpha,
  colors,
  controls,
  type Controls,
  finish,
  focusRing,
  follow,
  isDark,
  rounded,
  stateLayerColor,
  terminal,
  TERMINAL_ROW,
  tier,
  type Tiered,
  tints,
  shape,
  stroke,
  dimmed,
} from "@shadcn-nsh/theme";
import { Check, Minus, type IconNode } from "lucide";
import type { AnimatedValue, AndroidProps, JSX, ViewStyle } from "nsh";
import { reduceMotion, split, View } from "nsh";
import { Checkbox as BaseCheckbox, type CheckboxProps as BaseCheckboxProps } from "nsh/base";

import { AsText } from "./lib/as-text";
import { Icon } from "./lib/icons";
import { pressRipple, pressSink } from "./lib/press";
import { controlSize } from "./lib/surface";
import { type Live, read } from "./lib/utils";

// @port look/choice.tsx

/** What a checkbox's box shows: a check, a dash (indeterminate) or nothing. */
export type CheckboxMarkKind = "check" | "dash" | null;

/** Options of `checkboxLook` and `CheckboxMark`; a radio's ring takes the same `scale` and `disabled`. */
export interface ChoiceOptions {
  /** Times the page's size (`controlSize.control`): 0.8, 1 or 1.25 (`ChoiceSize`'s `sm`,
   * `default`, `lg`). */
  scale?: number;
  /** A round box (a task's, as reminders draw it). */
  round?: boolean;
  /** Disabled, as the control is (`checkboxLook`): its edge stays drawn under the row's half opacity in dark. A
   * function is read where the look is applied. */
  disabled?: Live<boolean>;
}

/** A box's or ring's size: `scale` times the page's; one row high in the
 * terminal, where it is a glyph three Cells wide. */
const dims = (scale = 1) => ({
  control: Math.round(controlSize.control * scale),
  height: terminal ? TERMINAL_ROW : Math.round(controlSize.control * scale),
  check: Math.round(controlSize.check * scale),
  dot: Math.round(controlSize.dot * scale),
});

/** Surface treatment for an unchecked checkbox box or radio ring well. */
export type ChoiceWell = "well" | "inset" | "outline";

interface CheckboxPreset {
  border: number;
  corner: Tiered<number>;
  target: number;
  well: ChoiceWell;
  hasTarget: boolean;
}

const checkboxPresets: Record<Controls, CheckboxPreset> = {
  base: { border: 1, corner: { pointer: 5, touch: 7 }, target: 0, well: "well", hasTarget: false },
  // M3 Checkbox 18dp outlined box (2dp corner, 2dp outline, 40dp state-layer target; _md-comp-checkbox.scss v34.0.21:70,92 / CheckboxTokens.kt).
  material: {
    border: 2,
    corner: { pointer: 2, touch: 2 },
    target: 40,
    well: "outline",
    hasTarget: true,
  },
  // WinUI 3 CheckBox resting ControlAltFillColorSecondary well with 4px corner and 1px ControlStrongStrokeColorDefault border (CheckBox_themeresources.xaml in winui3/release/2.7.0).
  winui: {
    border: 1,
    corner: { pointer: 4, touch: 4 },
    target: 0,
    well: "inset",
    hasTarget: false,
  },
};

/** The fill of a box or ring that is off: spread it after the box's
 * `borderWidth` (a quick setting's icon lights up from it too, under a
 * `ChoiceLight`). Light, the field's well; dark, a step above the card
 * (shadcn's `dark:bg-input/30`) inside an edge a step brighter than a
 * field's, so an empty box still stands out, dimmed too: `disabled`, its
 * edge twice as strong, so the row's half opacity leaves it as strong as an
 * enabled box's (the mark and the label fade, the box stays drawn). */
export const choiceWell = (o?: { disabled?: boolean; well?: ChoiceWell }): ViewStyle => {
  const well = o?.well ?? "well";
  if (well === "inset") {
    return {
      backgroundColor: colors.track,
      backgroundImage: "none",
      borderColor: colors.input,
      boxShadow: "none",
    };
  }
  if (well === "outline") {
    return {
      backgroundColor: "transparent",
      backgroundImage: "none",
      borderColor: colors.mutedForeground,
      boxShadow: "none",
    };
  }
  return isDark()
    ? {
        backgroundColor: alpha(colors.input, 0.3),
        backgroundImage: "none",
        borderColor: alpha(colors.foreground, o?.disabled ? 0.4 : 0.2),
        boxShadow: finish.field.boxShadow,
      }
    : {
        backgroundColor: colors.field,
        backgroundImage: "none",
        borderColor: colors.input,
        boxShadow: finish.field.boxShadow,
      };
};

/**
 * Centered circular state-layer halo for M3 checkboxes and radios (40dp target around 18dp/20dp indicator).
 * Zero layout impact and opacity 0 at rest; lights up with theme hover overlay on group hover/press.
 */
export function ChoiceTarget(props: {
  target: number;
  innerW: number;
  innerH: number;
  checked: boolean;
}) {
  return (
    <View
      class="pointer-events-none rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100 motion-reduce:transition-none"
      style={{
        position: "absolute",
        width: props.target,
        height: props.target,
        start: (props.innerW - props.target) / 2,
        top: (props.innerH - props.target) / 2,
        backgroundColor: stateLayerColor("hover", props.checked ? "primary" : "foreground"),
      }}
    />
  );
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
} as const;

/**
 * The press feedback of a box or a ring: it sinks to 90% while its row is
 * pressed (the row is the `group`: give it `class="group"`), and eases back;
 * still with reduced motion.
 */
export const choiceSink =
  "transition-transform duration-150 ease-out group-active:scale-90 motion-reduce:transition-none";

/** The props `checkboxLook` gives a `Checkbox`'s indicator. */
export interface CheckboxLook {
  readonly indicatorClass: string;
  readonly indicatorStyle: ViewStyle;
}

/**
 * A checkbox's box, as the props of `Checkbox`'s indicator (spread them:
 * `<Checkbox class="group" {...checkboxLook()} indicator={<CheckboxMark mark={..} />}>`):
 * sunk like a field (`choiceWell`), 16 points with a pointer,
 * 22 on a touch screen, its corners 5 / 7 (`round`: a circle), sinking to
 * 90% while its row (the `group`) is pressed. `CheckboxMark` fills it.
 */
export function checkboxLook(o?: ChoiceOptions): CheckboxLook {
  return {
    indicatorClass: choiceSink,
    get indicatorStyle(): ViewStyle {
      const { control, height } = dims(o?.scale);
      const g = checkboxPresets[controls()];
      const corner = Math.round(g.corner[tier] * (o?.scale ?? 1));
      return {
        width: control,
        height,
        borderRadius: o?.round ? control / 2 : corner,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: g.border,
        ...choiceWell({ well: g.well, disabled: !!read(o?.disabled) }),
      };
    },
  };
}

/**
 * The fill of a box or ring that is on (the main button's citrus finish:
 * its darker olive edge and lit top), over the empty one and covering its
 * edge: it fades in and out as the value changes. Gradients do not
 * interpolate, so the finish fades whole rather than its colors.
 */
export function ChoiceLight(props: { on: AnimatedValue; radius: number; border?: number }) {
  const b = props.border ?? stroke.control;
  return (
    <View
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: -b,
        left: -b,
        right: -b,
        bottom: -b,
        borderRadius: props.radius,
        borderWidth: stroke.control,
        ...finish.light,
        opacity: props.on,
      }}
    />
  );
}

/** The stroke of a checkbox's check and dash (about 2 points at the desktop
 * size): the bold pen of every check that marks something done. */
const MARK_WEIGHT = 3.84;

/**
 * What a checkbox's box shows (its `indicator`): citrus with a check or a
 * dash, drawn with the same bold pen. Each part follows the value on a
 * spring of its own (`motion.control`) and grows in from 75%, so a check
 * turning into a dash crosses over on a fill that stays; at once with
 * reduced motion.
 */
export function CheckboxMark(props: { mark: CheckboxMarkKind } & ChoiceOptions) {
  const { control, height, check: checkSize } = dims(props.scale);
  // Each part stays mounted while it fades out (unmounting it on the value
  // showed only the fade in).
  const on = follow(() => (props.mark ? 1 : 0));
  const check = follow(() => (props.mark === "check" ? 1 : 0));
  const dash = follow(() => (props.mark === "dash" ? 1 : 0));
  /** A mark: centered in the box, growing a little as it fades in. */
  const glyph = (amount: AnimatedValue, icon: IconNode) => (
    <View
      style={{
        ...centered,
        pointerEvents: "none",
        opacity: amount,
        transform: [{ scale: amount.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }],
      }}
    >
      <Icon icon={icon} size={checkSize} tint={colors.primaryForeground} weight={MARK_WEIGHT} />
    </View>
  );
  const cb = checkboxPresets[controls()];
  const innerW = control - 2 * cb.border;
  const innerH = height - 2 * cb.border;
  // One view as large as the box inside its border holds the layers: the
  // slot's content sits in a holder view sized to it, so layers placed only
  // absolutely made it 0 × 0 and the fill a speck at the box's middle.
  return (
    <View style={{ width: innerW, height: innerH }}>
      {cb.hasTarget ? (
        <ChoiceTarget
          target={Math.round(cb.target * (props.scale ?? 1))}
          innerW={innerW}
          innerH={innerH}
          checked={!!props.mark}
        />
      ) : null}
      <ChoiceLight
        on={on}
        radius={props.round ? control / 2 : Math.round(cb.corner[tier] * (props.scale ?? 1))}
        border={cb.border}
      />
      {glyph(check, Check)}
      {glyph(dash, Minus)}
    </View>
  );
}
// @port end

/**
 * A choice control's size: what a checkbox's box or a radio's ring is drawn at, `sm` 0.8,
 * `default` 1, `lg` 1.25 times the page's control size. The look takes the number
 * (`ChoiceOptions.scale`); this is the shell's word for it.
 */
export type ChoiceSize = "sm" | "default" | "lg";

/** What a `ChoiceSize` multiplies the page's control size by: 0.8, 1, 1.25. */
export const choiceScales: Record<ChoiceSize, number> = { sm: 0.8, default: 1, lg: 1.25 };

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
  readonly android?: AndroidProps;
}

/**
 * A choice card, whose whole surface is the checkbox or radio (spread it:
 * `<Checkbox {...choiceTileLook(() => on())} indicator={<CheckboxMark … />}>`, or
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
        ...rounded(shape.control),
        borderWidth: stroke.control,
        borderColor: on ? colors.brand : colors.border,
        backgroundColor: on ? tints.brand : colors.raised,
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
    get disabledStyle(): ViewStyle {
      return { opacity: dimmed.disabled };
    },
    get android(): AndroidProps | undefined {
      return pressRipple(lit() ? "accent-foreground" : "foreground", o?.disabled);
    },
  };
}

/** The mark a checkbox's props show: a dash while it is indeterminate, a check when it is checked. */
const markOf = (props: Pick<BaseCheckboxProps, "checked" | "indeterminate">): CheckboxMarkKind =>
  props.indeterminate ? "dash" : props.checked ? "check" : null;

/**
 * `nsh/base`'s Checkbox in the look of `checkboxLook`. Every base prop passes through; the
 * indicator props go over the look's. A string child is the label; anything else is drawn as given.
 */
export type CheckboxProps = Omit<BaseCheckboxProps, "children"> & {
  /** `sm` (0.8), `default` (1) or `lg` (1.25) times the page's control size. */
  size?: ChoiceSize;
  /** A round box (a task's, as reminders draw it). */
  round?: boolean;
  /** A string is the label; anything else is drawn as given. A string label is also the
   * checkbox's name for screen readers, unless `accessibilityLabel` says otherwise. */
  children?: string | JSX.Element;
};

/** A checkbox. The row is the `group` the box sinks with while pressed. */
export function Checkbox(props: CheckboxProps) {
  const [, rest] = split(props, [
    "size",
    "round",
    "children",
    "class",
    "indicatorClass",
    "indicatorStyle",
    "indicator",
  ]);
  const scale = choiceScales[props.size ?? "default"];
  const options: ChoiceOptions = {
    scale,
    round: props.round,
    disabled: () => !!props.disabled,
  };
  const look = checkboxLook(options);
  return (
    <BaseCheckbox
      {...rest}
      class={props.class ? `group ${props.class}` : "group"}
      indicatorClass={
        props.indicatorClass
          ? `${look.indicatorClass} ${props.indicatorClass}`
          : look.indicatorClass
      }
      indicatorStyle={[look.indicatorStyle, props.indicatorStyle ?? null]}
      indicator={
        props.indicator ?? (
          <CheckboxMark
            // Read here, where the mark is made, so it follows a value the app changes.
            mark={markOf(props)}
            scale={scale}
            round={props.round}
          />
        )
      }
    >
      {/* The page's ink, read here so it follows the appearance: a bare Text is nsh's black. */}
      <AsText style={{ color: colors.foreground }}>{props.children}</AsText>
    </BaseCheckbox>
  );
}
