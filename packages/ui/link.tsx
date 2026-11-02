import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { Link as BaseLink } from "nsh/base";

export function Link(props: {
  href?: string;
  current?: boolean;
  disabled?: boolean;
  openWith?: "system" | "app";
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onOpen?: (event: { href: string }) => void;
  onPress?: () => void;
  /** Optional look overrides — compose with `buttonVariants` for link-as-button. */
  style?: ViewStyle;
  hoverStyle?: ViewStyle;
  activeStyle?: ViewStyle;
  focusStyle?: ViewStyle;
}) {
  return (
    <BaseLink
      href={props.href}
      current={props.current}
      disabled={props.disabled}
      openWith={props.openWith}
      accessibilityLabel={props.accessibilityLabel}
      onOpen={props.onOpen as never}
      onPress={props.onPress}
      focusStyle={props.focusStyle ?? focusRing()}
      style={{
        opacity: props.disabled ? 0.5 : 1,
        ...props.style,
      }}
      hoverStyle={props.disabled ? undefined : (props.hoverStyle ?? { opacity: 0.8 })}
      activeStyle={props.disabled ? undefined : props.activeStyle}
    >
      {props.children}
    </BaseLink>
  );
}

/** Convenience text-styled link label color. */
export const linkColor = () => colors.primary;
