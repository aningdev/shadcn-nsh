// Source: examples/nsh-gallery-ui/look/button.ts @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors, disabledOpacity, finish, focusRing, mix, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, platform, reduceMotion, split, Text } from "nsh";
import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "nsh/base";

/** shadcn `bases/base` also has `link`; this registry omits it — Link is a separate component. */
export type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive";

export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

/**
 * Theme layer on `nsh/base` Button: `variant` / `size` only.
 * All base props (behavior + style hooks) pass through; string `children` get a themed `Text`.
 */
export type ButtonProps = Omit<BaseButtonProps, "children"> & {
  children?: string | JSX.Element;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonLabelStyle = {
  color: string;
  fontSize: number;
  fontWeight: "500" | "600" | "700";
};

type ButtonVariantsResult = {
  style: ViewStyle;
  label: ButtonLabelStyle;
  hoverStyle?: ViewStyle;
  activeStyle?: ViewStyle;
  selectedStyle?: ViewStyle;
  disabledStyle?: ViewStyle;
  hitSlop?: number;
};

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

/**
 * Press feedback (NSH Design Guides "Motion"): the control sinks to `scale` while active and
 * eases back with the state changes beside it (`also`: CSS property names). Reduced motion
 * removes the sink, the movement, and keeps the short colour fade.
 */
function pressSink(scale: number, also: string) {
  return {
    get activeStyle(): ViewStyle {
      return reduceMotion() ? {} : { transform: [{ scale }] };
    },
    transition: {
      transitionProperty: `${also}, transform`,
      transitionDuration: 150,
      transitionTimingFunction: "ease-out",
    } satisfies ViewStyle,
  };
}

/** Smallest comfortable finger target (Accessibility touch targets). */
const TOUCH_TARGET = 44;

/** Hit slop so a finger gets 44pt without growing the visual control; none with a pointer. */
function touchHitSlop(height: number): number | undefined {
  if (platform.desktop) return undefined;
  const slop = Math.max(0, (TOUCH_TARGET - height) / 2);
  return slop || undefined;
}

type SizeLook = {
  /** Smallest height (smallest width and height of an icon button): the control grows with its label. */
  min: number;
  paddingHorizontal: number;
  fontSize: number;
  gap: number;
  icon: boolean;
};

/** A button grows with its label and the user's text size, so heights are minimums. */
function sizeLook(size: ButtonSize, pointer: boolean): SizeLook {
  const icon = size.startsWith("icon");
  const step = icon ? size.slice(5) || "default" : size;
  // Pointer: compact. Touch screen: roomier, with a hit slop on top (the reference's 36 / 40 / 48).
  const table = pointer
    ? {
        xs: { min: 24, pad: 8, font: 12 },
        sm: { min: 28, pad: 10, font: 13 },
        default: { min: 32, pad: 10, font: 14 },
        lg: { min: 36, pad: 10, font: 14 },
      }
    : {
        xs: { min: 32, pad: 10, font: 13 },
        sm: { min: 36, pad: 12, font: 14 },
        default: { min: 40, pad: 16, font: 15 },
        lg: { min: 48, pad: 20, font: 17 },
      };
  const s = table[step as keyof typeof table] ?? table.default;
  return {
    min: s.min,
    paddingHorizontal: icon ? 0 : s.pad,
    fontSize: s.font,
    gap: icon ? 0 : pointer ? 6 : 8,
    icon,
  };
}

type VariantLook = {
  backgroundColor: string;
  borderColor: string;
  color: string;
  boxShadow?: string;
  hover?: ViewStyle;
  active?: ViewStyle;
  selected?: ViewStyle;
};

/**
 * What a variant looks like. A raised fill steps lighter under the pointer, deeper pressed and
 * deeper again when selected (the reference's raised / hover / pressed / on), built from
 * `secondary` and the theme's two tones; a filled one dims; a bare one whispers the text color.
 */
function variantLook(variant: ButtonVariant, sink: ReturnType<typeof pressSink>): VariantLook {
  const hoverFill = mix(colors.secondary, colors.highlight, 0.5);
  const pressedFill = mix(colors.secondary, colors.shadowInk, 0.06);
  const onFill = mix(colors.secondary, colors.foreground, 0.1);
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.secondary,
        borderColor: colors.border,
        color: colors.secondaryForeground,
        boxShadow: finish.control.rest,
        hover: { backgroundColor: hoverFill },
        active: {
          backgroundColor: pressedFill,
          boxShadow: finish.control.pressed,
          ...sink.activeStyle,
        },
        selected: { backgroundColor: onFill, boxShadow: finish.control.on },
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: colors.border,
        color: colors.foreground,
        boxShadow: finish.control.flat,
        hover: { backgroundColor: colors.muted },
        active: {
          backgroundColor: pressedFill,
          boxShadow: finish.control.pressed,
          ...sink.activeStyle,
        },
        selected: { backgroundColor: onFill, boxShadow: finish.control.on },
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: colors.foreground,
        hover: { backgroundColor: alpha(colors.foreground, 0.05) },
        active: {
          backgroundColor: pressedFill,
          boxShadow: finish.control.pressed,
          ...sink.activeStyle,
        },
        selected: { backgroundColor: colors.accent },
      };
    case "destructive":
      return {
        backgroundColor: alpha(colors.destructive, 0.12),
        borderColor: alpha(colors.destructive, 0.32),
        color: colors.destructive,
        boxShadow: finish.control.flat,
        hover: { backgroundColor: alpha(colors.destructive, 0.16) },
        active: {
          backgroundColor: alpha(colors.destructive, 0.22),
          boxShadow: "none",
          ...sink.activeStyle,
        },
        selected: { backgroundColor: alpha(colors.destructive, 0.2) },
      };
    default:
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        color: colors.primaryForeground,
        boxShadow: finish.filled,
        hover: { opacity: 0.94 },
        active: { opacity: 0.88, ...sink.activeStyle },
        selected: { opacity: 0.88 },
      };
  }
}

/** Everything a button looks like at one variant and size: geometry first, then the variant. */
function look(variant: ButtonVariant, size: ButtonSize): ButtonVariantsResult {
  const pointer = platform.desktop;
  const s = sizeLook(size, pointer);
  // An icon-only button sinks further (90%): there is less of it to move.
  const sink = pressSink(
    s.icon ? 0.9 : 0.97,
    "background-color, border-color, box-shadow, opacity",
  );
  const v = variantLook(variant, sink);
  return {
    style: {
      minHeight: s.min,
      minWidth: s.icon ? s.min : undefined,
      paddingHorizontal: s.paddingHorizontal,
      borderRadius: radius.control,
      borderCurve: "continuous",
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      backgroundColor: v.backgroundColor,
      borderColor: v.borderColor,
      boxShadow: v.boxShadow,
      ...sink.transition,
    },
    label: { color: v.color, fontSize: s.fontSize, fontWeight: "500" },
    hoverStyle: v.hover,
    activeStyle: v.active,
    selectedStyle: v.selected,
    disabledStyle: { opacity: disabledOpacity() },
    hitSlop: touchHitSlop(s.min),
  };
}

/** Style helper aligned with shadcn `buttonVariants` (theme tokens + ViewStyle, not className). */
export function buttonVariants(options?: {
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
}): ButtonVariantsResult {
  return look(options?.variant ?? "default", options?.size ?? "default");
}

export function Button(props: ButtonProps) {
  // Props are read where used (never destructured) so `variant` / `size` / `style` follow signals.
  const [, rest] = split(props, [
    "variant",
    "size",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "selectedStyle",
    "disabledStyle",
    "hitSlop",
  ]);

  const current = computed(() =>
    buttonVariants({ variant: props.variant ?? "default", size: props.size ?? "default" }),
  );

  const content = () => {
    const children = props.children;
    if (typeof children === "string") {
      const label = current().label;
      return (
        <Text
          style={{
            fontSize: label.fontSize,
            fontWeight: label.fontWeight,
            color: label.color,
          }}
        >
          {children}
        </Text>
      );
    }
    return children;
  };

  return (
    <BaseButton
      {...rest}
      hitSlop={props.hitSlop ?? current().hitSlop}
      style={mergeStyle(current().style, props.style)}
      hoverStyle={mergeStyle(current().hoverStyle, props.hoverStyle)}
      activeStyle={mergeStyle(current().activeStyle, props.activeStyle)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      selectedStyle={mergeStyle(current().selectedStyle, props.selectedStyle)}
      disabledStyle={mergeStyle(current().disabledStyle, props.disabledStyle)}
    >
      {content()}
    </BaseButton>
  );
}
