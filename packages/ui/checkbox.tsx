// A checkbox: the look (`checkboxLook` and its companions) and the `Checkbox` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { alpha, colors, finish, follow, isDark, terminal, TERMINAL_ROW } from "@shadcn-nsh/theme";
import type { AnimatedValue, JSX, ViewStyle } from "nsh";
import { split, Text, View } from "nsh";
import { Checkbox as BaseCheckbox, type CheckboxProps as BaseCheckboxProps } from "nsh/base";

import { Icon } from "./lib/icons";
import { controlSize } from "./lib/surface";

// @port look/choice.tsx
/** What a checkbox's box shows: a check, a dash (indeterminate) or nothing. */
export type CheckboxMarkKind = "check" | "dash" | null;

/** Options of `checkboxLook`, `CheckboxMark` and `RadioRing`. */
export interface ChoiceOptions {
  /** Times the page's size (`controlSize.control`): 0.8 small, 1.25 large. */
  scale?: number;
  /** A round box (a task's, as reminders draw it). */
  round?: boolean;
  /** Disabled, as the control is (`checkboxLook`): its edge stays drawn under the row's half opacity in dark. */
  disabled?: boolean | (() => boolean);
}

/** A box's or ring's size: `scale` times the page's; one row high in the
 * terminal, where it is a glyph three Cells wide. */
const dims = (scale = 1) => ({
  control: Math.round(controlSize.control * scale),
  height: terminal ? TERMINAL_ROW : Math.round(controlSize.control * scale),
  check: Math.round(controlSize.check * scale),
  corner: Math.round(controlSize.corner * scale),
  dot: Math.round(controlSize.dot * scale),
});

/** The fill of a box or ring that is off: spread it after the box's
 * `borderWidth` (a quick setting's icon lights up from it too, under a
 * `ChoiceLight`). Light, the field's well; dark, a step above the card
 * (shadcn's `dark:bg-input/30`) inside an edge a step brighter than a
 * field's, so an empty box still stands out, dimmed too: `disabled`, its
 * edge twice as strong, so the row's half opacity leaves it as strong as an
 * enabled box's (the mark and the label fade, the box stays drawn). */
export const choiceWell = (o?: { disabled?: boolean }): ViewStyle =>
  isDark()
    ? {
        backgroundColor: alpha(colors.fieldBorder, 0.3),
        backgroundImage: "none",
        borderColor: alpha(colors.text, o?.disabled ? 0.4 : 0.2),
        boxShadow: finish.field.boxShadow,
      }
    : {
        backgroundColor: colors.field,
        backgroundImage: "none",
        borderColor: colors.fieldBorder,
        boxShadow: finish.field.boxShadow,
      };

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
  const d = dims(o?.scale);
  return {
    indicatorClass: choiceSink,
    get indicatorStyle(): ViewStyle {
      return {
        width: d.control,
        height: d.height,
        borderRadius: o?.round ? d.control / 2 : d.corner,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        ...choiceWell({ disabled: !!read(o?.disabled) }),
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
export function ChoiceLight(props: { on: AnimatedValue; radius: number }) {
  return (
    <View
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: -1,
        left: -1,
        right: -1,
        bottom: -1,
        borderRadius: props.radius,
        borderWidth: 1,
        ...finish.light,
        opacity: props.on,
      }}
    />
  );
}

/** The stroke of a checkbox's check and dash (about 2 points at the desktop
 * size): the bold pen of every check that marks something done. */
export const MARK_WEIGHT = 3.2;

/**
 * What a checkbox's box shows (its `indicator`): citrus with a check or a
 * dash, drawn with the same bold pen. Each part follows the value on a
 * spring of its own (`motion.control`) and grows in from 75%, so a check
 * turning into a dash crosses over on a fill that stays; at once with
 * reduced motion.
 */
export function CheckboxMark(props: { mark: CheckboxMarkKind } & ChoiceOptions) {
  const d = dims(props.scale);
  // Each part stays mounted while it fades out (unmounting it on the value
  // showed only the fade in).
  const on = follow(() => (props.mark ? 1 : 0));
  const check = follow(() => (props.mark === "check" ? 1 : 0));
  const dash = follow(() => (props.mark === "dash" ? 1 : 0));
  /** A mark: centered in the box, growing a little as it fades in. */
  const glyph = (t: AnimatedValue, name: "check" | "minus") => (
    <View
      style={{
        ...centered,
        pointerEvents: "none",
        opacity: t,
        transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1] }) }],
      }}
    >
      <Icon name={name} size={d.check} tint={colors.onAccent} weight={MARK_WEIGHT} />
    </View>
  );
  // One view as large as the box inside its border holds the layers: the
  // slot's content sits in a holder view sized to it, so layers placed only
  // absolutely made it 0 × 0 and the fill a speck at the box's middle.
  return (
    <View style={{ width: d.control - 2, height: d.height - 2 }}>
      <ChoiceLight on={on} radius={props.round ? d.control / 2 : d.corner} />
      {glyph(check, "check")}
      {glyph(dash, "minus")}
    </View>
  );
}

/** A value, or a function reading it where the look is applied (a signal). */
type Live<T> = T | (() => T);

const read = <T,>(v: Live<T> | undefined): T | undefined =>
  typeof v === "function" ? (v as () => T)() : v;
// @port end

/**
 * `nsh/base`'s Checkbox in the look of `checkboxLook`. Every base prop passes through; the
 * indicator props go over the look's. A string child is the label; anything else is drawn as given.
 */
export type CheckboxProps = Omit<BaseCheckboxProps, "children"> & {
  /** Times the page's control size (default 1): 0.8 small, 1.25 large. */
  scale?: number;
  /** A round box (a task's, as reminders draw it). */
  round?: boolean;
  /** A string is the label; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/** A checkbox. The row is the `group` the box sinks with while pressed. */
export function Checkbox(props: CheckboxProps) {
  const [, rest] = split(props, [
    "scale",
    "round",
    "children",
    "class",
    "indicatorClass",
    "indicatorStyle",
    "indicator",
  ]);
  const options: ChoiceOptions = {
    scale: props.scale,
    round: props.round,
    disabled: () => !!props.disabled,
  };
  const look = checkboxLook(options);
  const mark: CheckboxMarkKind = props.indeterminate ? "dash" : props.checked ? "check" : null;
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
        props.indicator ?? <CheckboxMark mark={mark} scale={props.scale} round={props.round} />
      }
    >
      {typeof props.children === "string" ? <Text>{props.children}</Text> : props.children}
    </BaseCheckbox>
  );
}
