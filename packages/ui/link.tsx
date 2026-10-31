import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
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
      focusStyle={focusRing()}
      style={{
        opacity: props.disabled ? 0.5 : 1,
      }}
      hoverStyle={props.disabled ? undefined : { opacity: 0.8 }}
    >
      {props.children}
    </BaseLink>
  );
}

/** Convenience text-styled link label color. */
export const linkColor = () => colors.primary;
