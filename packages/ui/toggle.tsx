// A toggle: the look (`toggleLook` and its companions), the `Toggle` that wears it, and
// `ToggleGroup`, a row or column of them on the inset track (`toolbarTrack` in `lib/tool.ts`).
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  colors,
  finish,
  focusRing,
  hovered,
  rounded,
  stateLayer,
  style as themeStyle,
  terminal,
  font,
  stroke,
  dimmed,
} from "@shadcn-nsh/theme";
import type { AndroidProps, JSX, TextStyle, ViewStyle } from "nsh";
import { platform, split, Text } from "nsh";
import {
  Toggle as BaseToggle,
  ToggleGroup as BaseToggleGroup,
  type ToggleGroupProps as BaseToggleGroupProps,
  type ToggleProps as BaseToggleProps,
} from "nsh/base";

import { pressHostProps, pressRipple, pressSink, pressTransition, touchSlop } from "./lib/press";
import { toolbarTrack } from "./lib/tool";
import { type Live, read } from "./lib/utils";

// @port look/tool.ts
/** A toggle's size: 24 / 28 / 34 points with a pointer, 32 / 38 / 44 on a touch screen. */
export type ToggleSize = "sm" | "default" | "lg";

/** A toggle's variants: `default` bare while off, `outline` on a field's edge while off. */
export type ToggleVariant = "default" | "outline";

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

/** How far a press sinks a toggle (`activeStyle`): none with reduced motion. */
const sink = (scale: number): ViewStyle => pressSink(scale).activeStyle;

/** The properties a toggle's states change, eased as a button's press
 * (`pressTransition`): the sink (Design Guides, "Motion"), the on fill
 * fading in and out, the hover's. */
const transition = pressTransition("background-color, border-color, box-shadow, opacity");

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
        ...rounded(dims.side / 4 + 1),
        borderWidth: stroke.control,
        ...(outline
          ? { borderColor: colors.input, backgroundColor: colors.field }
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
      if (read(o?.disabled)) return undefined;
      if (themeStyle().state.overlay.hover > 0) {
        return read(o?.on) ? hovered("on-brand", finish.on.backgroundImage) : hovered();
      }
      return read(o?.on) ? undefined : hovered();
    },
    get activeStyle(): ViewStyle | undefined {
      if (read(o?.disabled)) return undefined;
      if (themeStyle().state.overlay.pressed > 0) {
        return {
          ...(read(o?.on)
            ? stateLayer("pressed", "on-brand", finish.on.backgroundImage)
            : stateLayer("pressed", "foreground")),
          ...sink(0.92),
        };
      }
      return sink(0.92);
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing(1);
    },
    get disabledStyle(): ViewStyle {
      return { opacity: dimmed.disabled };
    },
    get hitSlop(): number | undefined {
      return touchSlop(dimensions(o).side);
    },
    get android(): AndroidProps | undefined {
      return pressRipple(read(o?.on) ? "on-brand" : "foreground", o?.disabled);
    },
  };
}

/** The ink of a toggle's content: the text's color while on, muted while off. */
const ink = (pressed: Live<boolean | undefined>) =>
  read(pressed) ? colors.foreground : colors.mutedForeground;

/** The label of a `toggleLook` of the same options: 13 points with a pointer, 15 on a touch screen (`sm` 12 / 13, `lg` 14 / 16), medium weight, muted while off. */
export function toggleLabel(pressed: Live<boolean | undefined>, o?: ToggleLookOptions): TextStyle {
  return {
    get color() {
      return ink(pressed);
    },
    get fontSize() {
      return dimensions(o).text;
    },
    get fontWeight() {
      return font.weight("label");
    },
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
  /** A string is the label, in `toggleLabel`'s type; anything else is drawn as given. A string
   * label is also the toggle's name for screen readers, unless `accessibilityLabel` says otherwise. */
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
  // Read once, here where the toggle is made: a string child is the label, which makes the look a
  // text one (`options.text`), and the kind of the children never changes (a child that changes
  // arrives as a function, drawn as given below).
  const kids = props.children;
  const options: ToggleLookOptions = {
    size: () => props.size,
    variant: props.variant,
    text: props.text ?? typeof kids === "string",
    on: () => props.pressed,
    disabled: () => props.disabled,
  };
  const look = toggleLook(options);
  return (
    <BaseToggle
      {...rest}
      hitSlop={props.hitSlop ?? look.hitSlop}
      {...pressHostProps(() => look.android)}
      style={[look.style, props.style ?? null]}
      hoverStyle={[look.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[look.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[look.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      pressedStyle={[look.pressedStyle, props.pressedStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
    >
      {typeof kids === "string" ? (
        <Text style={toggleLabel(() => props.pressed, options)}>{kids}</Text>
      ) : (
        kids
      )}
    </BaseToggle>
  );
}

/**
 * `nsh/base`'s ToggleGroup. Every base prop passes through; `style` goes over the look's.
 * Put `Toggle`s inside; they keep their own look. Default `inset` wears `toolbarTrack`; set
 * `inset={false}` inside a `Toolbar` that already has the track.
 */
export type ToggleGroupProps = BaseToggleGroupProps & {
  /** A column of toggles (default a row). */
  vertical?: boolean;
  /** Default true: the inset track. False inside a Toolbar that already has the track. */
  inset?: boolean;
};

/** Tools in a row (or column), matching `toolbarTrack`'s gap when not inset. */
function groupChrome(vertical?: boolean): ViewStyle {
  return {
    flexDirection: vertical ? "column" : "row",
    alignItems: "center",
    gap: 2,
  };
}

/**
 * The track holding a row (or column) of toggles. The look is read where the style is applied,
 * not held in a variable: `toolbarTrack` reads the theme's colors and radius there (tokens are
 * values, so a look built once in the body would keep the build-time ones when the app switches
 * theme).
 */
export function ToggleGroup(props: ToggleGroupProps) {
  const [, rest] = split(props, ["style", "vertical", "inset"]);
  return (
    <BaseToggleGroup
      {...rest}
      style={[
        props.inset === false
          ? groupChrome(props.vertical)
          : toolbarTrack({ vertical: props.vertical }),
        props.style ?? null,
      ]}
    />
  );
}
