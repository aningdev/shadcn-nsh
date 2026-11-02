import type { JSX, ViewStyle } from "nsh";
import { Text } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { alpha, colors, focusRing, radius } from "../../lib/theme";

export type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";

export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg";

export type ButtonProps = {
  children?: string | JSX.Element;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  selected?: boolean;
  accessibilityLabel?: string | null;
  role?: string | null;
  onPress?: () => void;
  onPressDown?: () => void;
  onPressUp?: () => void;
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
};

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
    case "link":
      return {
        backgroundColor: "transparent",
        borderColor: "transparent",
        color: colors.primary,
        borderWidth: 0,
        hover: { opacity: 0.85 },
        active: { opacity: 0.7 },
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

/**
 * Style helper aligned with shadcn `buttonVariants` (theme tokens + ViewStyle, not className).
 * Compose with `Link` for link-as-button (do not fake `asChild` on Button).
 */
export function buttonVariants(options?: {
  variant?: ButtonVariant | null;
  size?: ButtonSize | null;
}): ButtonVariantsResult {
  const variant = options?.variant ?? "default";
  const size = options?.size ?? "default";
  const s = sizeLook(size);
  const v = variantLook(variant);
  const isLink = variant === "link";

  return {
    style: {
      height: isLink ? undefined : s.height,
      minHeight: isLink ? s.height : undefined,
      width: s.icon ? s.height : undefined,
      paddingHorizontal: s.icon || isLink ? 0 : s.paddingHorizontal,
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
  };
}

export function Button(props: ButtonProps) {
  const variant = () => props.variant ?? "default";
  const size = () => props.size ?? "default";
  const look = () => buttonVariants({ variant: variant(), size: size() });
  const disabled = () => !!props.disabled;

  const accessibilityLabel = () => {
    if (props.accessibilityLabel !== undefined) return props.accessibilityLabel;
    return typeof props.children === "string" ? props.children : undefined;
  };

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
      onPress={props.onPress}
      onPressDown={props.onPressDown}
      onPressUp={props.onPressUp}
      disabled={props.disabled}
      selected={props.selected}
      accessibilityLabel={accessibilityLabel()}
      role={props.role as never}
      focusStyle={focusRing()}
      hoverStyle={disabled() ? undefined : look().hoverStyle}
      activeStyle={disabled() ? undefined : look().activeStyle}
      selectedStyle={look().selectedStyle}
      style={{
        ...look().style,
        opacity: disabled() ? 0.5 : 1,
      }}
    >
      {content()}
    </BaseButton>
  );
}
