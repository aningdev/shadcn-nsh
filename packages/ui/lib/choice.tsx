// What a checkbox and a radio share: the choice recipe's well, edge, press, fill and tile.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  control,
  feedback,
  focusRing,
  motion,
  rounded,
  shape,
  stroke,
  surface,
  tints,
} from "@shadcn-nsh/theme";
import type { ResolvedControlMap } from "@shadcn-nsh/theme";
import type { AnimatedValue, ViewStyle } from "nsh";
import { reduceMotion, View } from "nsh";

import { cssMotion, pressSink } from "./motion";
import { type Live, read } from "./utils";

/** A choice control resolved recipe (`control("choice")`). */
export type ChoiceLook = ResolvedControlMap["choice"];

/** The choice resting recipe, read where the control is drawn so it follows `selectTheme`. */
export const choiceLook = (): ChoiceLook => control("choice");

/** The choice corner in points. */
export const choiceCorner = (look: ChoiceLook): number => look.corner;

/**
 * The edge's width a choice states: its own points, zero where the theme draws no edge.
 */
export const choiceEdge = (look: ChoiceLook): number => look.edgeWidth;

/**
 * The fill of a box or ring that is off, as the theme's `choice.*` slots state it: a face where it
 * paints that layer, an edge in the colour the theme gives (a stronger one on a disabled box), and
 * the `boxShadow` of the finish its face hangs off. An empty box still stands out: light, the
 * field's well; dark, a step above the card (`color:input@0.3` in the base theme's slots).
 */
export const choiceWell = (o?: { disabled?: boolean; look?: ChoiceLook }): ViewStyle => {
  const look = o?.look ?? choiceLook();
  return {
    backgroundColor: look.face ?? "transparent",
    backgroundImage: "none",
    borderColor: (o?.disabled === true ? look.disabledEdgeColor : look.edgeColor) ?? "transparent",
    boxShadow: look.shadeShadow,
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
        backgroundColor: feedback.hoverLayerColor(props.checked ? "primary" : "foreground"),
      }}
    />
  );
}

/**
 * The press feedback of a box or a ring: it sinks to 90% while its row is
 * pressed (the row is the `group`: give it `class="group"`), and eases back;
 * still with reduced motion.
 */
export const choiceSink =
  "transition-transform duration-150 ease-out group-active:scale-90 motion-reduce:transition-none";

/** A face that states no edge colour, or a transparent one, over a solid background. */
const edgeless = (face: ViewStyle): boolean =>
  typeof face.backgroundColor === "string" &&
  (face.borderColor === undefined || face.borderColor === "transparent");

/**
 * The fill of a box or ring that is on, over the empty one and covering its edge: it fades in and out
 * as the value changes. Gradients do not interpolate, so the finish fades whole rather than its
 * colors.
 */
export function ChoiceLight(props: {
  on: AnimatedValue;
  radius: number;
  border?: number;
  /** The face the recipe turns over to (`ChoiceLook.checkedStyle`); the accent where it states none. */
  fill?: ViewStyle | null;
}) {
  const b = () => props.border ?? stroke.control;
  const face = () => props.fill ?? surface("accent").style;
  return (
    <View
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: -b(),
        left: -b(),
        right: -b(),
        bottom: -b(),
        borderRadius: props.radius,
        borderWidth: stroke.control,
        ...face(),
        // A face with no edge of its own (a colour, or a finish whose edge is transparent) fills its
        // edge too: a transparent ring would let the empty box's edge show round the fill.
        ...(edgeless(face()) ? { borderColor: face().backgroundColor } : {}),
        opacity: props.on,
      }}
    />
  );
}

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
      const glide = motion.indicatorGlide;
      const timed =
        glide.spring && !reduceMotion()
          ? cssMotion(glide.timing, glide.spring)
          : {
              transitionDuration: reduceMotion() ? 0 : 150,
              transitionTimingFunction: "ease-out" as const,
            };
      return {
        flex: 1,
        minWidth: 0,
        padding: 12,
        paddingTop: 14,
        ...rounded(shape.control),
        borderWidth: stroke.control,
        borderColor: on ? colors.brand : colors.border,
        backgroundColor: on ? tints.brand : colors.surface,
        boxShadow: on ? "none" : surface("raised").style.boxShadow,
        transitionProperty: "transform, border-color, background-color, box-shadow",
        ...timed,
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
      return { opacity: feedback.disabled.contentOpacity };
    },
  };
}
