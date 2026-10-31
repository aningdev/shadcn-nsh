import { Text } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { colors, focusRing, radius } from "../../lib/theme";

export type ButtonVariant = "default" | "secondary" | "outline" | "destructive" | "ghost";

export function Button(props: {
  children: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const variant = () => props.variant ?? "default";

  const look = () => {
    switch (variant()) {
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          color: colors.secondaryForeground,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.border,
          color: colors.foreground,
        };
      case "destructive":
        return {
          backgroundColor: colors.destructive,
          borderColor: colors.destructive,
          color: colors.primaryForeground,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          color: colors.foreground,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          color: colors.primaryForeground,
        };
    }
  };

  const fg = () => look().color;

  return (
    <BaseButton
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityLabel={props.children}
      focusStyle={focusRing()}
      hoverStyle={
        props.disabled
          ? undefined
          : variant() === "ghost" || variant() === "outline"
            ? { backgroundColor: colors.accent }
            : { opacity: 0.92 }
      }
      activeStyle={props.disabled ? undefined : { opacity: 0.86 }}
      style={{
        height: 36,
        paddingHorizontal: 16,
        borderRadius: radius.control,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        opacity: props.disabled ? 0.5 : 1,
        backgroundColor: look().backgroundColor,
        borderColor: look().borderColor,
        transitionProperty: "background-color, border-color, opacity",
        transitionDuration: 120,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: "500", color: fg() }}>{props.children}</Text>
    </BaseButton>
  );
}
