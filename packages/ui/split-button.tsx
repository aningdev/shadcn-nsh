// A split button: a main action and the menu of its variants in one silhouette.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  alpha,
  buttonCorner,
  colors,
  control,
  feedback,
  focusRing,
  rounded,
  stroke,
  surface,
  terminal,
  TERMINAL_COLUMN,
} from "@shadcn-nsh/theme";
import type { AnyColorKey } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, platform, signal, split, token, View } from "nsh";
import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "nsh/base";

import {
  buttonLabel,
  buttonSizes,
  type ButtonLookOptions,
  type ButtonSize,
  type ButtonVariant,
} from "./button";
import { pressTransition, touchSlop } from "./lib/motion";
import { AsText, type Live, read } from "./lib/utils";

// Public components

/** The frame of a split button: a main action and a menu half in one silhouette. */
export type SplitButtonProps = {
  /** Default `default`. */
  variant?: ButtonVariant;
  /** Default `default`. */
  size?: ButtonSize;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: JSX.Element;
};

/**
 * One half of a split button. Each string among the children is the label in `buttonLabel`;
 * anything else is drawn as given. Spread `buttonGlyph` on an icon for the menu half.
 */
export type SplitButtonSegmentProps = Omit<BaseButtonProps, "children"> & {
  children?: string | JSX.Element;
};

/** The hairline between the two halves. */
export type SplitButtonDividerProps = {
  style?: StyleProp<ViewStyle>;
};

/** The frame that clips the two halves of a split button. */
export function SplitButton(props: SplitButtonProps) {
  const variant = () => props.variant ?? "default";
  const options: ButtonLookOptions = {
    size: () => props.size,
    disabled: () => props.disabled,
  };
  const look = splitButtonLook(variant, options);
  return (
    <SplitContext.Provider value={{ look, variant, options }}>
      <View style={[look.frame.style, props.style ?? null]}>{props.children}</View>
    </SplitContext.Provider>
  );
}

/** A pressable half of a `SplitButton`. */
export function SplitButtonSegment(props: SplitButtonSegmentProps) {
  const ctx = useSplit();
  const [, rest] = split(props, [
    ...STYLE_KEYS,
    "disabled",
    "children",
    "onPressDown",
    "onPressUp",
  ]);
  const pressing = signal(false);
  const segmentDisabled = () => !!read(ctx.options.disabled) || !!props.disabled;
  const segmentOptions: ButtonLookOptions = {
    ...ctx.options,
    disabled: segmentDisabled,
    selected: () => props.selected,
    pressed: pressing,
  };
  const segment = ctx.look.segment({
    selected: () => props.selected,
    disabled: segmentDisabled,
  });
  return (
    <BaseButton
      {...rest}
      disabled={segmentDisabled()}
      hitSlop={props.hitSlop ?? segment.hitSlop}
      onPressDown={() => {
        if (!read(segmentOptions.disabled)) pressing.set(true);
        props.onPressDown?.();
      }}
      onPressUp={() => {
        pressing.set(false);
        props.onPressUp?.();
      }}
      style={[segment.style, props.style ?? null]}
      hoverStyle={[segment.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[segment.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[segment.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[segment.disabledStyle, props.disabledStyle ?? null]}
    >
      <AsText style={buttonLabel(ctx.variant, segmentOptions)}>{props.children}</AsText>
    </BaseButton>
  );
}

/** The hairline between a split button's halves. */
export function SplitButtonDivider(props: SplitButtonDividerProps = {}) {
  const ctx = useSplit();
  return <View style={[ctx.look.divider, props.style ?? null]} />;
}

// Private helpers
// The frame fill matches the button variant's rest look. Kept here so the face stays
// private to this file and identical to `button.tsx`.

/**
 * The resting fill of a ghost control: none, bare until the pointer is over
 * it; in the terminal, which shows no hover until the pointer is there and no
 * outline to hint at one, a faint `secondary` band, so it reads as pressable.
 */
const ghostFill = () => (terminal ? token("secondary") : "transparent");

const pointer = platform.desktop;

/** How far a selected filled control rests: the theme dims a press of its accent by
 * `finish.accent.pressedOpacity`, and a selected one holds the same dim in every theme (Material and WinUI
 * paint their press instead of dimming it, so the press opacity is not the selected one's). */
const SELECTED_OPACITY = 0.88;

/** The properties a button's states change, eased over 150 ms: the press's
 * sink (Design Guides, "Motion") and the hover's and press's colors. */
const transition = pressTransition("background-color, border-color, box-shadow, opacity");

/** The style props a look fills: the shell writes each as its own prop, never as a
 * spread object, which is read once and keeps the appearance it was built in. */
const STYLE_KEYS = [
  "style",
  "hoverStyle",
  "activeStyle",
  "focusVisibleStyle",
  "disabledStyle",
  "hitSlop",
] as const;

const dimensions = (o?: ButtonLookOptions) => buttonSizes[read(o?.size) ?? "default"];

const filled = (variant: ButtonVariant) => variant === "default";

/** A button's label ink, as the token the state layers mix (a theme that swaps fills draws none). */
const buttonInk = (variant: ButtonVariant, selected = false): AnyColorKey =>
  filled(variant)
    ? "primary-foreground"
    : variant === "destructive"
      ? "destructive"
      : (variant === "secondary" || variant === "outline") && selected
        ? "primary-foreground"
        : "foreground";

/** A secondary button's resting layer: its face, edge, and shade (`none` where flat). */
function secondaryStyle(): ViewStyle {
  return control("button").secondary.style;
}

/** Opacity fade for disabled controls in themes without a dedicated disabled surface. */
const disabledDimmed = (): ViewStyle =>
  feedback.disabled.replaceFace ? {} : { opacity: feedback.disabled.contentOpacity };

/** The fill, edge and shadow of a variant at rest (or selected). A disabled filled button falls back
 * to the secondary surface (or the face the theme's `feedback.disabled` states). */
function restLook(variant: ButtonVariant, selected: boolean, disabled = false): ViewStyle {
  if (disabled && feedback.disabled.replaceFace) {
    if (variant === "ghost") {
      return {
        backgroundColor: ghostFill(),
        borderColor: "transparent",
        boxShadow: "none",
      };
    }
    if (variant === "outline") {
      return {
        backgroundColor: ghostFill(),
        borderColor: control("button").outlineEdge,
        boxShadow: "none",
      };
    }
    return feedback.disabled.style;
  }
  if (filled(variant) && disabled) return secondaryStyle();
  if (filled(variant))
    return { ...surface("accent").style, opacity: selected ? SELECTED_OPACITY : 1 };
  if (variant === "destructive") {
    const look = control("button").destructive;
    if (selected)
      return {
        boxShadow: look.style.boxShadow,
        backgroundColor: alpha(colors.destructive, 0.2),
        backgroundImage: "none",
        borderColor: look.edge ?? "transparent",
      };
    return look.style;
  }
  if (selected) {
    return control("button").selected.style;
  }
  if (variant === "outline")
    return {
      backgroundColor: ghostFill(),
      borderColor: control("button").outlineEdge,
      boxShadow: "none",
    };
  if (variant === "ghost")
    return {
      backgroundColor: ghostFill(),
      borderColor: "transparent",
    };
  return secondaryStyle();
}

/** The color of a variant's label and icon across rest, selected, pressed and disabled states. */
function ink(live: Live<ButtonVariant>, o?: ButtonLookOptions) {
  const variant = read(live) ?? "secondary";
  const disabled = !!read(o?.disabled);
  if (disabled) return feedback.disabled.ink;
  if (filled(variant))
    return read(o?.pressed) ? feedback.pressedInk("accent") : surface("accent").ink;
  if (variant === "destructive") return control("button").destructive.ink;
  if ((variant === "secondary" || variant === "outline") && read(o?.selected))
    return control("button").selected.ink;
  if (read(o?.pressed)) return feedback.pressedInk("surface");
  return colors.foreground;
}

/** Options of `splitButtonLook`'s halves. */
interface SplitSegmentOptions {
  /** Shaded as pressed while what it opens is open (the menu half's menu). */
  selected?: Live<boolean | undefined>;
  /** No hover and no press feedback. */
  disabled?: Live<boolean | undefined>;
  /** More style (a width, a padding), over the look's. */
  style?: Live<ViewStyle | undefined>;
}

/**
 * A split button: a main action and the menu of its variants in one
 * silhouette of a variant's finish (`frame`, a row clipping its halves), the
 * two halves (`segment()`, each a pressable with its own hover, press and
 * focus) and the hairline between them (`divider`). A half carries no fill
 * of its own: under the pointer it takes a whisper of the label's color, a
 * deeper one pressed or while its menu is open, so the pair keeps one
 * fill. The frame and the halves are a `buttonLook` of the same variant and
 * size; the label and icons take `buttonLabel` / `buttonGlyph`.
 */
function splitButtonLook(variant: Live<ButtonVariant> = "default", o?: ButtonLookOptions) {
  const shade = (a: number) => alpha(ink(variant, o), a);
  return {
    frame: {
      get style(): ViewStyle {
        return {
          flexDirection: "row",
          alignItems: "stretch",
          ...rounded(buttonCorner(read(o?.size) ?? "default")),
          borderWidth: stroke.control,
          overflow: "hidden",
          ...restLook(read(variant) ?? "default", false, !!read(o?.disabled)),
          ...(read(o?.disabled) ? disabledDimmed() : {}),
          ...transition,
          ...read(o?.style),
        };
      },
    },
    segment(s?: SplitSegmentOptions) {
      const segmentDisabled = () => !!read(o?.disabled) || !!read(s?.disabled);
      return {
        get style(): ViewStyle {
          const dims = dimensions(o);
          return {
            height: dims.height,
            paddingHorizontal: terminal ? TERMINAL_COLUMN : dims.pad,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: pointer ? 6 : 8,
            backgroundColor: read(s?.selected) ? shade(0.12) : "transparent",
            ...transition,
            ...read(s?.style),
          };
        },
        get hoverStyle(): ViewStyle | undefined {
          if (segmentDisabled() || read(s?.selected)) return undefined;
          if (feedback.hoverOverlay > 0) {
            return feedback.hoverStyle(buttonInk(read(variant) ?? "default"));
          }
          return { backgroundColor: shade(0.06) };
        },
        get activeStyle(): ViewStyle | undefined {
          if (segmentDisabled()) return undefined;
          if (feedback.pressOverlay > 0) {
            return feedback.press("sinkOnly", { ink: buttonInk(read(variant) ?? "default") })
              .activeStyle;
          }
          return { backgroundColor: shade(0.12) };
        },
        get focusVisibleStyle(): ViewStyle {
          return focusRing(-2);
        },
        get disabledStyle(): ViewStyle {
          return read(o?.disabled) ? {} : disabledDimmed();
        },
        // Taller only: the halves touch, so a finger's slop stays off their shared edge.
        get hitSlop() {
          const v = touchSlop(dimensions(o).height);
          return v ? { top: v, bottom: v } : undefined;
        },
      };
    },
    get divider(): ViewStyle {
      return { width: stroke.hairline, backgroundColor: shade(0.22) };
    },
  };
}

type SplitContextValue = {
  look: ReturnType<typeof splitButtonLook>;
  variant: () => ButtonVariant;
  options: ButtonLookOptions;
};

const SplitContext = context<SplitContextValue | null>(null);

function useSplit() {
  const ctx = SplitContext();
  if (!ctx) throw new Error("SplitButton parts must be used within <SplitButton>");
  return ctx;
}
