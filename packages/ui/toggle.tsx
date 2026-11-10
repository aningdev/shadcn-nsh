// Source: examples/nsh-gallery-ui/look/tool.ts @ 64ab8a1d (baseline), see NOTICE.
import {
  colors,
  controlFill,
  disabledOpacity,
  finish,
  focusRing,
  hovered,
} from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, split, Text } from "nsh";
import { Toggle as BaseToggle, type ToggleProps as BaseToggleProps } from "nsh/base";

import { isPointer, touchHitSlop } from "./lib/density";
import { pressSink } from "./lib/press";

/** `default` is bare while off (a toolbar's tool); `outline` sits on an edge while off. */
export type ToggleVariant = "default" | "outline";

export type ToggleSize = "default" | "sm" | "lg";

/**
 * Theme layer on `nsh/base` Toggle: `variant` / `size` only. All base props (behavior + style
 * hooks) pass through; string `children` get a themed `Text`.
 */
export type ToggleProps = Omit<BaseToggleProps, "children"> & {
  children?: string | JSX.Element;
  variant?: ToggleVariant;
  size?: ToggleSize;
};

type ToggleVariantsResult = {
  style: ViewStyle;
  pressedStyle: ViewStyle;
  hoverStyle: ViewStyle;
  activeStyle: ViewStyle;
  disabledStyle: ViewStyle;
  hitSlop?: number;
  label: { fontSize: number; fontWeight: "500" };
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

/** A toggle's side (its height, and its width when it holds an icon), label size and padding. */
function sizeLook(size: ToggleSize, pointer: boolean) {
  const table = pointer
    ? {
        sm: { side: 24, text: 12, pad: 8 },
        default: { side: 28, text: 13, pad: 10 },
        lg: { side: 34, text: 14, pad: 12 },
      }
    : {
        sm: { side: 32, text: 13, pad: 10 },
        default: { side: 38, text: 15, pad: 12 },
        lg: { side: 44, text: 16, pad: 14 },
      };
  return table[size] ?? table.default;
}

/**
 * What a toggle looks like. Off, `default` is bare and `outline` sits on an edge; on
 * (`pressedStyle`) it takes the deeper raised fill and `finish.control.on`, which stands off its
 * surface in both appearances, further than the hover's whisper of the text colour. Pressed it
 * sinks to 92%. `text`: it holds a text label, padded at its sides rather than square.
 */
export function toggleVariants(options?: {
  variant?: ToggleVariant | null;
  size?: ToggleSize | null;
  text?: boolean;
}): ToggleVariantsResult {
  const s = sizeLook(options?.size ?? "default", isPointer());
  const sink = pressSink(0.92, "background-color, border-color, box-shadow, opacity");
  return {
    style: {
      minWidth: s.side,
      minHeight: s.side,
      paddingHorizontal: options?.text ? s.pad : 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: s.side / 4 + 1,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: options?.variant === "outline" ? colors.input : "transparent",
      backgroundColor: "transparent",
      ...sink.transition,
    },
    pressedStyle: { backgroundColor: controlFill.on, boxShadow: finish.control.on },
    hoverStyle: hovered(),
    activeStyle: sink.activeStyle,
    disabledStyle: { opacity: disabledOpacity() },
    hitSlop: touchHitSlop(s.side),
    label: { fontSize: s.text, fontWeight: "500" },
  };
}

export function Toggle(props: ToggleProps) {
  // Props are read where used (never destructured) so `variant` / `size` / `pressed` follow signals.
  const [, rest] = split(props, [
    "variant",
    "size",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "pressedStyle",
    "disabledStyle",
    "hitSlop",
  ]);

  const current = computed(() =>
    toggleVariants({
      variant: props.variant ?? "default",
      size: props.size ?? "default",
      text: typeof props.children === "string",
    }),
  );

  const content = () => {
    const children = props.children;
    if (typeof children !== "string") return children;
    // The text is muted while off and the text colour while on.
    const label = current().label;
    return (
      <Text
        style={{
          fontSize: label.fontSize,
          fontWeight: label.fontWeight,
          color: props.pressed ? colors.foreground : colors.mutedForeground,
        }}
      >
        {children}
      </Text>
    );
  };

  return (
    <BaseToggle
      {...rest}
      hitSlop={props.hitSlop ?? current().hitSlop}
      style={mergeStyle(current().style, props.style)}
      hoverStyle={mergeStyle(current().hoverStyle, props.hoverStyle)}
      activeStyle={mergeStyle(current().activeStyle, props.activeStyle)}
      focusStyle={mergeStyle(focusRing(1), props.focusStyle)}
      pressedStyle={mergeStyle(current().pressedStyle, props.pressedStyle)}
      disabledStyle={mergeStyle(current().disabledStyle, props.disabledStyle)}
    >
      {content()}
    </BaseToggle>
  );
}
