import { colors, disabledOpacity, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text } from "nsh";
import { Link as BaseLink } from "nsh/base";

export function Link(props: {
  href?: string;
  current?: boolean;
  disabled?: boolean;
  openWith?: "system" | "app";
  accessibilityLabel?: string | null;
  children?: string | JSX.Element;
  onOpen?: (event: { href: string }) => void;
  onPress?: () => void;
}) {
  const accessibilityLabel = () => {
    if (props.accessibilityLabel !== undefined) return props.accessibilityLabel;
    return typeof props.children === "string" ? props.children : undefined;
  };

  const content = () => {
    const children = props.children;
    if (typeof children === "string") {
      return (
        <Text
          style={{
            color: props.disabled ? colors.mutedForeground : linkColor(),
            fontSize: 14,
            fontWeight: props.current ? "600" : "500",
            textDecorationLine: "underline",
            textDecorationColor: props.disabled ? colors.mutedForeground : linkColor(),
          }}
        >
          {children}
        </Text>
      );
    }
    return children;
  };

  return (
    <BaseLink
      href={props.href}
      current={props.current}
      disabled={props.disabled}
      openWith={props.openWith}
      accessibilityLabel={accessibilityLabel()}
      onOpen={props.onOpen as never}
      onPress={props.onPress}
      focusStyle={focusRing()}
      style={{
        alignSelf: "flex-start",
        opacity: disabledOpacity(props.disabled),
      }}
      hoverStyle={props.disabled ? undefined : { opacity: 0.8 }}
      activeStyle={props.disabled ? undefined : { opacity: 0.7 }}
    >
      {content()}
    </BaseLink>
  );
}

/** Primary label color for custom `Text` children inside `Link`. */
export const linkColor = () => colors.primary;
