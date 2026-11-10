// Source: examples/nsh-gallery-ui/look/nav.tsx @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors, disabledOpacity, focusRing } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { computed, split, Text } from "nsh";
import { Link as BaseLink, type LinkProps as BaseLinkProps } from "nsh/base";

import { isPointer, touchHitSlop } from "./lib/density";
import { pressSink } from "./lib/press";

/** `quiet` is muted text. There is no visited color: this theme has no violet token. */
export type LinkVariant = "default" | "quiet";

/**
 * Theme layer on `nsh/base` Link. Base props pass through. String children
 * become the label; element children are the app's.
 */
export type LinkProps = Omit<BaseLinkProps, "children"> & {
  children?: string | JSX.Element;
  variant?: LinkVariant;
};

type LinkState = {
  disabled?: boolean;
  current?: boolean;
  variant?: LinkVariant | null;
};

type LinkChrome = {
  style: ViewStyle;
  label: TextStyle;
  hover?: ViewStyle;
  active: ViewStyle;
  focus: ViewStyle;
  disabled: ViewStyle;
  hitSlop: number | undefined;
};

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<T>(
  base?: StyleProp<T> | null,
  consumer?: StyleProp<T> | null,
): StyleProp<T> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * Label color. No arguments is `colors.primary` (custom text). A state
 * resolves disabled, current, and `quiet`.
 */
export function linkColor(state?: LinkState) {
  if (!state) return colors.primary;
  if (state.disabled) return colors.mutedForeground;
  if (state.current) return colors.foreground;
  if (state.variant === "quiet") return colors.mutedForeground;
  return colors.primary;
}

/**
 * Text-link chrome. The underline is a hairline (`alpha` 0.35) that turns
 * solid on hover — not an opacity — and the press sinks. Disabled is the
 * theme's one opacity, not a second literal.
 */
function look(variant: LinkVariant, state: { disabled?: boolean; current?: boolean }): LinkChrome {
  const pointer = isPointer();
  const fontSize = pointer ? 13 : 15;
  const minHeight = pointer ? 24 : 32;
  const color = linkColor({ ...state, variant });
  const sink = pressSink(0.97, "border-color");
  return {
    hitSlop: touchHitSlop(minHeight),
    style: {
      alignSelf: "flex-start",
      minHeight,
      justifyContent: "center",
      borderBottomWidth: 1,
      borderBottomColor: alpha(color, 0.35),
      ...sink.transition,
    },
    hover: state.disabled ? undefined : { borderBottomColor: color },
    active: sink.activeStyle,
    focus: focusRing(),
    disabled: { opacity: disabledOpacity() },
    label: {
      fontSize,
      fontWeight: state.current ? "600" : "500",
      color,
    },
  };
}

/** Sizes and colors for the current idiom. `linkColor()` with no arguments stays primary. */
export function linkVariants(options?: LinkState): LinkChrome {
  return look(options?.variant ?? "default", {
    disabled: options?.disabled,
    current: options?.current,
  });
}

/** A text link. Hover fills the underline; the press sinks. */
export function Link(props: LinkProps) {
  const [, rest] = split(props, [
    "variant",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "hitSlop",
    "accessibilityLabel",
  ]);
  const current = computed(() =>
    linkVariants({
      variant: props.variant,
      disabled: !!props.disabled,
      current: !!props.current,
    }),
  );
  const label = () => {
    const children = props.children;
    if (typeof children !== "string") return children;
    return <Text style={current().label}>{children}</Text>;
  };

  return (
    <BaseLink
      {...rest}
      accessibilityLabel={
        props.accessibilityLabel !== undefined
          ? props.accessibilityLabel
          : typeof props.children === "string"
            ? props.children
            : undefined
      }
      hitSlop={props.hitSlop ?? current().hitSlop}
      style={mergeStyle(current().style, props.style)}
      hoverStyle={mergeStyle(current().hover, props.hoverStyle)}
      activeStyle={mergeStyle(current().active, props.activeStyle)}
      focusStyle={mergeStyle(current().focus, props.focusStyle)}
      disabledStyle={mergeStyle(current().disabled, props.disabledStyle)}
    >
      {label()}
    </BaseLink>
  );
}
