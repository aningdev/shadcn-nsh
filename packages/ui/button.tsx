import { alpha, colors, finish, focusRing, pressSink, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, platform, split, Text } from "nsh";
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
  fontWeight: "500";
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

/** Smallest comfortable finger target (Accessibility touch targets). */
const TOUCH_TARGET = 44;

/** Hit slop so a finger gets 44pt without growing the visual control; none on desktop. */
function touchHitSlop(height: number): number | undefined {
  if (platform.desktop) return undefined;
  const slop = Math.max(0, (TOUCH_TARGET - height) / 2);
  return slop || undefined;
}

/** Sizes aligned with shadcn `bases/base` + nova token scale (not CSS-pixel locked). */
function sizeLook(size: ButtonSize): {
  height: number;
  paddingHorizontal: number;
  fontSize: number;
  gap: number;
  icon: boolean;
} {
  switch (size) {
    case "xs":
      return { height: 24, paddingHorizontal: 8, fontSize: 12, gap: 4, icon: false };
    case "sm":
      return { height: 28, paddingHorizontal: 10, fontSize: 13, gap: 4, icon: false };
    case "lg":
      return { height: 36, paddingHorizontal: 10, fontSize: 14, gap: 6, icon: false };
    case "icon-xs":
      return { height: 24, paddingHorizontal: 0, fontSize: 12, gap: 0, icon: true };
    case "icon-sm":
      return { height: 28, paddingHorizontal: 0, fontSize: 13, gap: 0, icon: true };
    case "icon":
      return { height: 32, paddingHorizontal: 0, fontSize: 14, gap: 0, icon: true };
    case "icon-lg":
      return { height: 36, paddingHorizontal: 0, fontSize: 14, gap: 0, icon: true };
    default:
      return { height: 32, paddingHorizontal: 10, fontSize: 14, gap: 6, icon: false };
  }
}

function variantLook(
  variant: ButtonVariant,
  sink: ReturnType<typeof pressSink>,
): {
  backgroundColor: string;
  borderColor: string;
  color: string;
  borderWidth: number;
  boxShadow?: string;
  hover?: ViewStyle;
  active?: ViewStyle;
  selected?: ViewStyle;
} {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.secondary,
        borderColor: colors.border,
        color: colors.secondaryForeground,
        borderWidth: 1,
        boxShadow: finish.raised.boxShadow,
        hover: {
          backgroundColor: alpha(colors.secondary, 0.85),
          boxShadow: finish.hover.boxShadow,
        },
        active: {
          backgroundColor: colors.secondary,
          boxShadow: finish.pressed.boxShadow,
          ...sink.activeStyle,
        },
        selected: {
          backgroundColor: colors.accent,
          borderColor: colors.border,
          boxShadow: finish.on.boxShadow,
        },
      };
    case "outline":
      return {
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.foreground,
        borderWidth: 1,
        boxShadow: finish.card.boxShadow,
        hover: { backgroundColor: colors.muted, borderColor: colors.border },
        active: { opacity: 0.9, ...sink.activeStyle },
        selected: {
          backgroundColor: colors.muted,
          borderColor: colors.border,
          boxShadow: finish.on.boxShadow,
        },
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: colors.foreground,
        borderWidth: 1,
        hover: { backgroundColor: colors.muted },
        active: { opacity: 0.9, ...sink.activeStyle },
        selected: { backgroundColor: colors.muted, boxShadow: finish.on.boxShadow },
      };
    case "destructive":
      return {
        backgroundColor: alpha(colors.destructive, 0.12),
        borderColor: "transparent",
        color: colors.destructive,
        borderWidth: 1,
        boxShadow: finish.card.boxShadow,
        hover: { backgroundColor: alpha(colors.destructive, 0.2) },
        active: { opacity: 0.9, ...sink.activeStyle },
        selected: {
          backgroundColor: alpha(colors.destructive, 0.22),
          boxShadow: finish.on.boxShadow,
        },
      };
    default:
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        color: colors.primaryForeground,
        borderWidth: 1,
        boxShadow: finish.accent.boxShadow,
        hover: {
          backgroundColor: alpha(colors.primary, 0.8),
          borderColor: alpha(colors.primary, 0.8),
        },
        active: {
          opacity: 0.88,
          ...sink.activeStyle,
        },
        selected: {
          backgroundColor: alpha(colors.primary, 0.85),
          boxShadow: finish.accent.boxShadow,
        },
      };
  }
}

/** Style helper aligned with shadcn `buttonVariants` (theme tokens + ViewStyle, not className). */
export function buttonVariants(options?: {
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
}): ButtonVariantsResult {
  const variant = options?.variant ?? "default";
  const size = options?.size ?? "default";
  const s = sizeLook(size);
  const sink = pressSink(0.97, "background-color, border-color, box-shadow, opacity");
  const v = variantLook(variant, sink);

  return {
    style: {
      height: s.height,
      width: s.icon ? s.height : undefined,
      paddingHorizontal: s.icon ? 0 : s.paddingHorizontal,
      borderRadius: radius.control,
      borderWidth: v.borderWidth,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      backgroundColor: v.backgroundColor,
      borderColor: v.borderColor,
      boxShadow: v.boxShadow,
      ...sink.transition,
    },
    label: {
      color: v.color,
      fontSize: s.fontSize,
      fontWeight: "500",
    },
    hoverStyle: v.hover,
    activeStyle: v.active,
    selectedStyle: v.selected,
    disabledStyle: { opacity: 0.5 },
    hitSlop: touchHitSlop(s.height),
  };
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

  const look = computed(() =>
    buttonVariants({ variant: props.variant ?? "default", size: props.size ?? "default" }),
  );

  const content = () => {
    const children = props.children;
    if (typeof children === "string") {
      const label = look().label;
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
      hitSlop={props.hitSlop ?? look().hitSlop}
      style={mergeStyle(look().style, props.style)}
      hoverStyle={mergeStyle(look().hoverStyle, props.hoverStyle)}
      activeStyle={mergeStyle(look().activeStyle, props.activeStyle)}
      focusStyle={mergeStyle(focusRing(), props.focusStyle)}
      selectedStyle={mergeStyle(look().selectedStyle, props.selectedStyle)}
      disabledStyle={mergeStyle(look().disabledStyle, props.disabledStyle)}
    >
      {content()}
    </BaseButton>
  );
}
