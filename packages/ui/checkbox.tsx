// A checkbox: the look (`checkboxLook` and its companions) and the `Checkbox` that wears it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  control,
  feedback,
  focusRing,
  follow,
  metrics,
  motion,
  press,
  surface,
  terminal,
  TERMINAL_ROW,
} from "@shadcn-nsh/theme";
import { Check, Minus, type IconNode } from "lucide";
import type { AnimatedValue, JSX, ViewStyle } from "nsh";
import { reduceMotion, split, View } from "nsh";
import { Checkbox as BaseCheckbox, type CheckboxProps as BaseCheckboxProps } from "nsh/base";

import {
  choiceCorner,
  choiceEdge,
  ChoiceLight,
  choiceLook,
  choiceScales,
  choiceSink,
  choiceWell,
  type ChoiceSize,
} from "./lib/choice";
import { Icon } from "./lib/icons";
import { cssMotion } from "./lib/motion";
import { AsText, joinClass, type Live, read } from "./lib/utils";

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
    "focusVisibleStyle",
    "disabledStyle",
    "indicatorClass",
    "indicatorStyle",
    "indicator",
  ]);
  const scale = choiceScales[props.size ?? "default"];
  const options: ChoiceOptions = {
    scale,
    round: props.round,
    disabled: () => !!props.disabled,
    lit: () => !!markOf(props),
  };
  const look = checkboxLook(options);
  return (
    <BaseCheckbox
      {...rest}
      class={joinClass("group", props.class)}
      focusVisibleStyle={[focusRing(), props.focusVisibleStyle ?? null]}
      disabledStyle={props.disabledStyle ?? { opacity: feedback.disabled.contentOpacity }}
      indicatorClass={joinClass(look.indicatorClass, props.indicatorClass)}
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

// Shared checkbox primitives
// `progress` draws `CheckboxMark` for a finished step.

/**
 * What a checkbox's box shows (its `indicator`): citrus with a check or a
 * dash, drawn with the same bold pen. Each part follows the value on a
 * timing of its own (`motion.fast`) and grows in from 75%, so a check
 * turning into a dash crosses over on a fill that stays; at once with
 * reduced motion.
 */
export function CheckboxMark(props: { mark: CheckboxMarkKind } & ChoiceOptions) {
  const look = () => choiceLook();
  const d = () => dims(props.scale);
  const border = () => choiceEdge(look());
  const innerW = () => d().control - 2 * border();
  const innerH = () => d().height - 2 * border();
  const radius = () =>
    props.round ? d().control / 2 : Math.round(choiceCorner(look()) * (props.scale ?? 1));
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
      <Icon icon={icon} size={d().check} tint={surface("accent").ink} weight={MARK_WEIGHT} />
    </View>
  );
  // One view as large as the box inside its border holds the layers: the
  // slot's content sits in a holder view sized to it, so layers placed only
  // absolutely made it 0 × 0 and the fill a speck at the box's middle.
  return (
    <View style={{ width: innerW(), height: innerH() }}>
      <ChoiceLight
        on={on}
        // `ChoiceLight` expands over the indicator's border (`top/left/right/bottom: -b`), so it
        // wears the outer box's corner radius rather than subtracting `border`.
        radius={radius()}
        border={border()}
        fill={look().checkedStyle}
      />
      {glyph(check, Check)}
      {glyph(dash, Minus)}
    </View>
  );
}

// Private helpers

/** What a checkbox's box shows: a check, a dash (indeterminate) or nothing. */
type CheckboxMarkKind = "check" | "dash" | null;

/** Options of `checkboxLook` and `CheckboxMark`; a radio's ring takes the same `scale` and `disabled`. */
interface ChoiceOptions {
  /** Times the page's size (`controlSize.control`): 0.8, 1 or 1.25 (`ChoiceSize`'s `sm`,
   * `default`, `lg`). */
  scale?: number;
  /** A round box (a task's, as reminders draw it). */
  round?: boolean;
  /** Disabled, as the control is (`checkboxLook`): its edge stays drawn under the row's half opacity in dark. A
   * function is read where the look is applied. */
  disabled?: Live<boolean>;
  /** True while checked or indeterminate, so the resting unchecked border does not bleed around `ChoiceLight`. */
  lit?: Live<boolean>;
}

/** A box's or ring's size: `scale` times the page's; one row high in the
 * terminal, where it is a glyph three Cells wide. */
const dims = (scale = 1) => ({
  control: Math.round(control("choice").box * scale),
  height: terminal ? TERMINAL_ROW : Math.round(control("choice").box * scale),
  check: Math.round((terminal ? 12 : metrics.icon.sm) * scale),
});

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

/** The props `checkboxLook` gives a `Checkbox`'s indicator. */
interface CheckboxLook {
  readonly indicatorClass: string;
  readonly indicatorStyle: ViewStyle;
}

/**
 * A checkbox's box, as the props of `Checkbox`'s indicator (spread them:
 * `<Checkbox class="group" {...checkboxLook()} indicator={<CheckboxMark mark={..} />}>`):
 * the theme's choice slots (`choiceLook()`), its box `choice.box` (16 points
 * with a pointer, 20 on a touch screen, unless the theme states its own), its
 * corner the recipe's (`round`: a circle),
 * sinking to 90% while its row (the `group`) is pressed. `CheckboxMark` fills it.
 */
function checkboxLook(o?: ChoiceOptions): CheckboxLook {
  /** A box whose chosen face is a palette colour turns its edge to that colour as it is chosen
   * (`choice.checked.face`, an edge equal to the fill): the fill sits inside the edge, so an edge
   * left in the empty box's colour would ring it. A class, so the indicator's `checked` state drives it. */
  const lit = () => read(o?.lit);
  return {
    get indicatorClass(): string {
      return press.scale < 1 ? choiceSink : "";
    },
    get indicatorStyle(): ViewStyle {
      const { control: box, height } = dims(o?.scale);
      const look = choiceLook();
      const corner = Math.round(choiceCorner(look) * (o?.scale ?? 1));
      const glide = motion.indicatorGlide;
      return {
        width: box,
        height,
        borderRadius: o?.round ? box / 2 : corner,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: choiceEdge(look),
        ...choiceWell({ look, disabled: !!read(o?.disabled) }),
        ...(lit() && !read(o?.disabled) && look.checkedStyle !== null
          ? { borderColor: "transparent" }
          : {}),
        ...(glide.spring && !reduceMotion()
          ? {
              transitionProperty: "background-color, border-color, box-shadow",
              ...cssMotion(glide.timing, glide.spring),
            }
          : {}),
      };
    },
  };
}

/** The stroke of a checkbox's check and dash (about 2 points at the desktop
 * size): the bold pen of every check that marks something done. */
const MARK_WEIGHT = 3.84;

/** The mark a checkbox's props show: a dash while it is indeterminate, a check when it is checked. */
const markOf = (props: Pick<BaseCheckboxProps, "checked" | "indeterminate">): CheckboxMarkKind =>
  props.indeterminate ? "dash" : props.checked ? "check" : null;
