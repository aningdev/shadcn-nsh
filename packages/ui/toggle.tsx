// A toggle: the look (`toggleLook` and its companions) and the `Toggle` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, finish, focusRing, hovered, terminal } from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewStyle } from "nsh";
import { platform, split, Text } from "nsh";
import { Toggle as BaseToggle, type ToggleProps as BaseToggleProps } from "nsh/base";

import { pressSink, pressTransition } from "./lib/press";

// @port look/tool.ts
/** A toggle's size: 24 / 28 / 34 points with a pointer, 32 / 38 / 44 on a touch screen. */
export type ToggleSize = "sm" | "default" | "lg";

/** A toggle's variants: `default` bare while off, `outline` on a field's edge while off. */
export type ToggleVariant = "default" | "outline";

/** A value, or a function reading it where the look is applied (a signal). */
type Live<T> = T | (() => T);

/** Options of `toggleLook`, `toggleLabel` and `toggleGlyph` (the same object for all three). */
export interface ToggleLookOptions {
  /** Default `default`. */
  size?: Live<ToggleSize | undefined>;
  /** `default`: bare while off, a toolbar's tool. `outline`: on a field's
   * edge while off, a toggle standing on its own among buttons. */
  variant?: ToggleVariant;
  /** It carries a text label (beside its icon or alone): padded at its
   * sides rather than a square. */
  text?: boolean;
  /** For a `Button` or a popup's trigger that shows as on (what it opens
   * is open, a mode it starts is running): the on fill in `style`, no
   * hover. A `Toggle` needs none of it: its `pressedStyle` follows its
   * `pressed`. */
  on?: Live<boolean | undefined>;
  /** No hover and no press feedback; dimmed to 50% (`disabledStyle`). */
  disabled?: Live<boolean | undefined>;
  /** More style (a flex, a width, a margin), over the look's. */
  style?: Live<ViewStyle | undefined>;
}

/** The sizes of a size: the side (the height, and the width of an icon-only toggle), the icon's and the label's size, the padding of a toggle with text. */
export interface ToggleDimensions {
  side: number;
  icon: number;
  text: number;
  pad: number;
}

const pointer = platform.desktop;

/** A toggle's sides, icon and label sizes and paddings, by size: compact with a pointer, roomier on a touch screen. */
export const toggleSizes: Record<ToggleSize, ToggleDimensions> = pointer
  ? {
      sm: { side: 24, icon: 14, text: 12, pad: 8 },
      default: { side: 28, icon: 16, text: 13, pad: 10 },
      lg: { side: 34, icon: 18, text: 14, pad: 12 },
    }
  : {
      sm: { side: 32, icon: 16, text: 13, pad: 10 },
      default: { side: 38, icon: 18, text: 15, pad: 12 },
      lg: { side: 44, icon: 20, text: 16, pad: 14 },
    };

/** The smallest target a finger gets (Accessibility, "Touch targets"). */
const TOUCH_TARGET = 44;

/** How far presses count past a toggle `side` tall, so a finger gets 44
 * points without the toggle looking bigger: none with a pointer. */
const slop = (side: number) =>
  pointer || terminal ? undefined : Math.max(0, (TOUCH_TARGET - side) / 2) || undefined;

/** How far a press sinks a toggle (`activeStyle`): none with reduced motion. */
const sink = (scale: number): ViewStyle => pressSink(scale).activeStyle;

/** The properties a toggle's states change, eased as a button's press
 * (`pressTransition`): the sink (Design Guides, "Motion"), the on fill
 * fading in and out, the hover's. */
const transition: ViewStyle = pressTransition(
  "background-color, border-color, box-shadow, opacity",
);

const read = <T,>(v: Live<T> | undefined): T | undefined =>
  typeof v === "function" ? (v as () => T)() : v;

const dimensions = (o?: ToggleLookOptions) => toggleSizes[read(o?.size) ?? "default"];

/**
 * A toggle's props (spread them: `<Toggle pressed={..} {...toggleLook()}>`,
 * or on a toolbar's `Button` or trigger with `on`): its style and its
 * states. A square 28 points across with a pointer, 38 on a touch screen
 * (`sm` 24 / 32, `lg` 34 / 44), padded at its sides when it carries
 * text, its corners a quarter of its side; a hit slop makes a touch target
 * 44 points. Off, a default toggle is bare and an `outline` sits on a
 * field's edge; on (`pressedStyle`), it takes `finish.on`, a fill that stands off
 * its surface in both appearances, further than the hover's whisper of the
 * text color. Pressed it sinks to 92% (none with reduced motion). Keyboard
 * focus: `focusRing(1)`. Disabled: 50%, no hover or press. Pair it with
 * `toggleLabel` for a label and `toggleGlyph` for an icon: muted while
 * off, the text's color while on.
 */
export function toggleLook(o?: ToggleLookOptions) {
  const outline = o?.variant === "outline";
  return {
    get style(): ViewStyle {
      const dims = dimensions(o);
      return {
        // The terminal sizes it to its label, which it never breaks: a
        // track too narrow for its tools wraps them instead.
        minWidth: terminal ? undefined : dims.side,
        height: terminal ? undefined : dims.side,
        flexShrink: terminal ? 0 : undefined,
        paddingHorizontal: o?.text ? dims.pad : 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: dims.side / 4 + 1,
        borderCurve: "continuous",
        borderWidth: 1,
        ...(outline
          ? { borderColor: colors.fieldBorder, backgroundColor: colors.field }
          : { borderColor: "transparent" }),
        ...(read(o?.on) ? finish.on : {}),
        ...transition,
        ...read(o?.style),
      };
    },
    get pressedStyle(): ViewStyle {
      return { ...finish.on };
    },
    get hoverStyle(): ViewStyle | undefined {
      return read(o?.on) || read(o?.disabled) ? undefined : hovered();
    },
    get activeStyle(): ViewStyle | undefined {
      return read(o?.disabled) ? undefined : sink(0.92);
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing(1);
    },
    disabledStyle: { opacity: 0.5 } as ViewStyle,
    get hitSlop(): number | undefined {
      return slop(dimensions(o).side);
    },
  };
}

/** The ink of a toggle's content: the text's color while on, muted while off. */
const ink = (pressed: Live<boolean | undefined>) => (read(pressed) ? colors.text : colors.muted);

/** The label of a `toggleLook` of the same options: 13 points with a pointer, 15 on a touch screen (`sm` 12 / 13, `lg` 14 / 16), medium weight, muted while off. */
export function toggleLabel(pressed: Live<boolean | undefined>, o?: ToggleLookOptions): TextStyle {
  return {
    get color() {
      return ink(pressed);
    },
    get fontSize() {
      return dimensions(o).text;
    },
    fontWeight: "500",
  };
}

/** An icon in a `toggleLook` (`<Icon {...toggleGlyph(pressed)} />`): 16 points with a pointer, 18 on a touch screen (`sm` 14 / 16, `lg` 18 / 20), muted while off. */
export function toggleGlyph(pressed: Live<boolean | undefined>, o?: ToggleLookOptions) {
  return {
    get size() {
      return dimensions(o).icon;
    },
    get tint() {
      return ink(pressed);
    },
  };
}
// @port end

/**
 * `nsh/base`'s Toggle in the look of `toggleLook`. Every base prop passes through; the style
 * props go over the look's. A string child is the label; anything else is drawn as given.
 */
export type ToggleProps = Omit<BaseToggleProps, "children"> & {
  /** Default `default`: bare while off. `outline`: on a field's edge while off. */
  variant?: ToggleVariant;
  /** Default `default`. */
  size?: ToggleSize;
  /**
   * It carries a text label, beside its icon or alone: padded at its sides rather than a
   * square (`toggleLook`'s `text`). A string child says so; an icon and a label drawn as
   * children say it here.
   */
  text?: boolean;
  /** A string is the label, in `toggleLabel`'s type; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/** A toggle of a `variant` and a `size`. `pressed` (a base prop) shows it as on. */
export function Toggle(props: ToggleProps) {
  const [, rest] = split(props, [
    "variant",
    "size",
    "text",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "pressedStyle",
    "disabledStyle",
    "hitSlop",
  ]);
  const options: ToggleLookOptions = {
    size: () => props.size,
    variant: props.variant,
    text: props.text ?? typeof props.children === "string",
    disabled: () => props.disabled,
  };
  const look = toggleLook(options);
  return (
    <BaseToggle
      {...rest}
      hitSlop={props.hitSlop ?? look.hitSlop}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[look.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      pressedStyle={[look.pressedStyle, props.pressedStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
    >
      {typeof props.children === "string" ? (
        <Text style={toggleLabel(() => props.pressed, options)}>{props.children}</Text>
      ) : (
        props.children
      )}
    </BaseToggle>
  );
}
