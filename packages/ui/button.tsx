import { alpha, colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { Text } from "nsh";
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
};

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base?: string | null, consumer?: string | null): string | undefined {
  if (base && consumer) return `${base} ${consumer}`;
  return consumer ?? base ?? undefined;
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

function variantLook(variant: ButtonVariant): {
  backgroundColor: string;
  borderColor: string;
  color: string;
  borderWidth: number;
  hover?: ViewStyle;
  active?: ViewStyle;
  selected?: ViewStyle;
} {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: colors.secondary,
        borderColor: colors.secondary,
        color: colors.secondaryForeground,
        borderWidth: 1,
        hover: { backgroundColor: alpha(colors.secondary, 0.85) },
        active: { opacity: 0.9 },
        selected: { backgroundColor: colors.accent, borderColor: colors.accent },
      };
    case "outline":
      return {
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.foreground,
        borderWidth: 1,
        hover: { backgroundColor: colors.muted, borderColor: colors.border },
        active: { opacity: 0.9 },
        selected: { backgroundColor: colors.muted, borderColor: colors.border },
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: colors.foreground,
        borderWidth: 1,
        hover: { backgroundColor: colors.muted },
        active: { opacity: 0.9 },
        selected: { backgroundColor: colors.muted },
      };
    case "destructive":
      return {
        backgroundColor: alpha(colors.destructive, 0.12),
        borderColor: "transparent",
        color: colors.destructive,
        borderWidth: 1,
        hover: { backgroundColor: alpha(colors.destructive, 0.2) },
        active: { opacity: 0.9 },
        selected: { backgroundColor: alpha(colors.destructive, 0.22) },
      };
    default:
      return {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        color: colors.primaryForeground,
        borderWidth: 1,
        hover: {
          backgroundColor: alpha(colors.primary, 0.8),
          borderColor: alpha(colors.primary, 0.8),
        },
        active: { opacity: 0.9 },
        selected: { backgroundColor: alpha(colors.primary, 0.85) },
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
  const v = variantLook(variant);

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
      transitionProperty: "background-color, border-color, opacity",
      transitionDuration: 120,
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
  };
}

export function Button(props: ButtonProps) {
  const {
    variant: variantProp,
    size: sizeProp,
    children,
    class: className,
    style,
    hoverStyle,
    activeStyle,
    focusStyle,
    selectedStyle,
    disabledStyle,
    accessibilityLabel,
    ...rest
  } = props;

  const look = () =>
    buttonVariants({
      variant: variantProp ?? "default",
      size: sizeProp ?? "default",
    });

  const resolvedAccessibilityLabel = () => {
    if (accessibilityLabel !== undefined) return accessibilityLabel;
    return typeof children === "string" ? children : undefined;
  };

  const content = () => {
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
      accessibilityLabel={resolvedAccessibilityLabel()}
      class={mergeClass(undefined, className)}
      style={mergeStyle(look().style, style)}
      hoverStyle={mergeStyle(look().hoverStyle, hoverStyle)}
      activeStyle={mergeStyle(look().activeStyle, activeStyle)}
      focusStyle={mergeStyle(focusRing(), focusStyle)}
      selectedStyle={mergeStyle(look().selectedStyle, selectedStyle)}
      disabledStyle={mergeStyle(look().disabledStyle, disabledStyle)}
    >
      {content()}
    </BaseButton>
  );
}
