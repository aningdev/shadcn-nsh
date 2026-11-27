// How a field draws: the shared frame (corners, edges, the resting line, the focus ring) and the
// well, text, size and time-field classes every field control reads.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  activeSpec,
  alpha,
  colors,
  control,
  cornerCurve,
  feedback,
  font,
  metrics,
  shape,
  stroke,
  surface,
  terminal,
  TERMINAL_COLUMN,
  TERMINAL_ROW,
} from "@shadcn-nsh/theme";
import type { ResolvedControlMap } from "@shadcn-nsh/theme";
import type { InputStyle, ViewStyle } from "nsh";
import { platform, reduceMotion } from "nsh";

import { type Live, read } from "./utils";

/** A field's resolved frame (`control("field")`). */
export type FieldLook = ResolvedControlMap["field"];

/**
 * The frame a field draws, as the platform reads it: the theme's, or the terminal's box — a shell's
 * fields are its own grid's, whatever the theme says.
 */
export function fieldDrawn(field: FieldLook): FieldLook {
  if (!terminal) return field;
  return {
    ...field,
    edges: "all",
    width: stroke.control,
    radius: shape.control,
    bottomRadius: shape.control,
    sideColor: colors.input,
    bottomColor: colors.input,
  };
}

/**
 * A field's corners: the sides' corner and the bottom's, which differ where the theme draws a line
 * (an underline keeps its bottom square).
 */
export function fieldCorners(field: FieldLook): ViewStyle {
  const look = fieldDrawn(field);
  if (look.radius === look.bottomRadius) {
    return { borderRadius: look.radius, ...cornerCurve };
  }
  return {
    borderTopLeftRadius: look.radius,
    borderTopRightRadius: look.radius,
    borderBottomLeftRadius: look.bottomRadius,
    borderBottomRightRadius: look.bottomRadius,
    ...cornerCurve,
  };
}

/**
 * `fieldCorners` for a frame drawn in classes: `rounded-(--radius-md)` names the control radius
 * every theme's field corner names, and a class's corner is a circular one, the curve those frames
 * already draw. The bottom stays square where the theme draws a line under the text.
 */
export function fieldCornerClass(field: FieldLook): string {
  return fieldDrawn(field).bottomRadius === 0 ? "rounded-t-(--radius-md)" : "rounded-(--radius-md)";
}

/** A field's edge widths: every side, its bottom edge alone for a line, or none when borderless. */
export function fieldEdgeWidths(field: FieldLook): ViewStyle {
  const look = fieldDrawn(field);
  const width = look.width;
  if (width === 0) return { borderWidth: 0 };
  return look.edges === "bottom"
    ? { borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: width }
    : { borderWidth: width };
}

/** `fieldEdgeWidths` for a frame drawn in classes: `border` all round, `border-b` for a line, or empty when borderless. */
export function fieldEdgeClass(field: FieldLook): string {
  const look = fieldDrawn(field);
  if (look.width === 0) return "";
  return look.edges === "bottom" ? "border-b" : "border";
}

/** Total vertical edge thickness in points (both top and bottom, bottom alone, or 0 when borderless). */
export function fieldEdgeThickness(field: FieldLook): number {
  const look = fieldDrawn(field);
  if (look.width === 0) return 0;
  return look.width * (look.edges === "bottom" ? 1 : 2);
}

/** Whether a field draws a uniform non-zero edge across all four sides (not split-edge or borderless). */
export function fieldHasUniformEdge(field: FieldLook): boolean {
  const look = fieldDrawn(field);
  if (look.width === 0) return false;
  return (look.sideColor ?? look.bottomColor) === look.bottomColor;
}

/**
 * A field's edge at rest, in `style`: the sides in the theme's colour where it draws them, and the
 * bottom edge in its own (a box carrying an underline reads the input colour there).
 */
export function fieldRestEdge(field: FieldLook): ViewStyle {
  const look = fieldDrawn(field);
  if (look.width === 0) return {};
  const bottom = { borderBottomColor: look.bottomColor };
  return look.sideColor
    ? { borderColor: look.sideColor, ...bottom }
    : { borderColor: look.bottomColor };
}

/**
 * A field's ring, invisible until a state lights it (`fieldFocusEdge`), sized to the theme's focus
 * ring (`feedback.focus`).
 */
export function fieldRing(tone: string): ViewStyle {
  const { width, offset } = activeSpec().feedback.focus;
  return {
    outlineStyle: "solid",
    outlineWidth: width,
    outlineOffset: offset,
    // Keep a non-zero alpha so the renderer retains `outlineStyle: solid` and interpolates from the
    // ring hue rather than flashing from 100% `currentcolor` on focus.
    outlineColor: alpha(tone, 0.004),
  };
}

/** A field's states whose edge a class can say (`fieldEdgeClass`'s `focus`). */
export type FieldState = "focus" | "focus-within" | "focus-visible";

/**
 * The line a field draws with the keys, `field.focus.width` wide, as classes: each size written
 * whole, so no class is ever assembled from a number. The scales state 3; WinUI's and M3's 2 are
 * the other step, and a theme that states anything else is a theme bug.
 */
const focusLine = {
  focus: {
    1: "focus:border-b-[1px]",
    2: "focus:border-b-[2px]",
    3: "focus:border-b-[3px]",
  },
  "focus-within": {
    1: "focus-within:border-b-[1px]",
    2: "focus-within:border-b-[2px]",
    3: "focus-within:border-b-[3px]",
  },
  "focus-visible": {
    1: "focus-visible:border-b-[1px]",
    2: "focus-visible:border-b-[2px]",
    3: "focus-visible:border-b-[3px]",
  },
} as const;

/** The line class a state draws: `field.focus.width` wide, never assembled. */
export function fieldFocusLine(state: FieldState): string {
  const width = fieldDrawn(control("field")).focusWidth;
  const line = focusLine[state][width as 1 | 2 | 3];
  if (line === undefined) {
    throw new Error(
      `the theme's \`field.focus.width\` slot is ${width} points; a line is 1, 2 or 3`,
    );
  }
  return line;
}

/** The focus colour for a field: `destructive` when invalid, `ring` when `field.focus.colour` names it, else `brand`. */
export function fieldFocusTone(field: FieldLook, invalid = false): string {
  if (invalid) return colors.destructive;
  const look = fieldDrawn(field);
  if (look.focusLine) return colors.brand;
  if (look.focusUsesRing) {
    const ring = feedback.focusRing();
    return (ring.borderColor as string | undefined) ?? (ring.outlineColor as string);
  }
  return colors.brand;
}

/**
 * A field's edge with the keys, in `style`, in `tone`: the border and the ring together, or for a
 * field whose focus is a line, its bottom edge alone, `focus.width` wide, and no ring.
 */
export function fieldFocusEdge(field: FieldLook, tone: string): ViewStyle {
  const look = fieldDrawn(field);
  if (look.focusLine) {
    return {
      outlineStyle: "none",
      outlineWidth: 0,
      borderBottomColor: tone,
      borderBottomWidth: look.focusWidth,
    };
  }
  if (!look.focusUsesRing) {
    // NSH Gallery (`color:brand`): crisp 2px outline inset by 1px over the focused border.
    return {
      outlineStyle: "solid",
      outlineWidth: 2,
      outlineOffset: -1,
      outlineColor: tone,
      ...(look.width > 0 ? { borderColor: tone } : {}),
    };
  }
  const focus = activeSpec().feedback.focus;
  return {
    ...fieldRing(tone),
    outlineColor: focus.style === "halo" ? alpha(tone, 0.3) : tone,
    ...(focus.style === "halo" && look.width > 0 ? { borderColor: tone } : {}),
  };
}

// `fieldLook` is the well; the recipe is read as `fieldRecipe`.
const fieldRecipe = () => control("field");

const pointer = platform.desktop;

/**
 * A text field's sizes, shared by every single-line field and picker
 * trigger (an input, a number input, a select, a combobox, a palette's
 * trigger): 32 points high, text 14 and 10 points in from its edges with a
 * pointer (shadcn's `text-sm`); the theme's touch target (`dimension.size.hit.touch`,
 * 44 on WinUI/Apple/shadcn, 48 on Material) high, text 15 and 14 in on a touch screen. In the
 * terminal a field is three rows (its border's and the text's), the text one
 * Cell inside the border's own column.
 */
export const fieldSize = terminal
  ? // The terminal's text is the character grid's size, not a type role's.
    { height: 3 * TERMINAL_ROW, font: 13, pad: 2 * TERMINAL_COLUMN - 1 }
  : {
      /** 32 points with a pointer; the theme's touch target (`dimension.size.hit.touch`) on touch. */
      get height() {
        return pointer ? 32 : metrics.hit;
      },
      /** The `label` role: 14 with a pointer, 15 on a touch screen. */
      get font() {
        return font.size("label");
      },
      pad: pointer ? 10 : 14,
    };

/** A field's variants: `default` the field's fill and edge, `ghost` neither until the keys are in it. */
export type InputVariant = "default" | "ghost";

/** Options of `fieldLook` and `inputLook`. */
export interface FieldLookOptions {
  /**
   * `default`: the field's fill and edge. `ghost`: nothing at rest — no fill, no edge — with
   * the text and the placeholder as they are and the focus ring kept (a search field, a title
   * that turns into a field); disabled and invalid still show.
   */
  variant?: Live<InputVariant | undefined>;
  /** Edged in the danger tone, its focus edge too. */
  invalid?: Live<boolean>;
  /** Read-only: lies flat (no recess) on a quieter edge. */
  readonly?: Live<boolean>;
  /** Disabled: flat on the quieter edge, as read-only; `disabledStyle` dims it. */
  disabled?: Live<boolean>;
  /** Focused: locks the focus edge/ring and suppresses hover edge overrides. */
  focused?: Live<boolean>;
  /** Several lines: the content starts at the top, in a box at least one line tall. */
  multiline?: Live<boolean>;
  /** Layout over the look (a width, a height, a margin; on an input its text too), or a function reading it. */
  style?: Live<InputStyle>;
}

/** Options of `edgeClass`. */
interface EdgeOptions {
  /** The edge at rest: a border color class (`border-input`). */
  rest: string;
  /** The edge under the pointer (`border-faint`), none for a field that takes no hover. */
  hover?: string;
  /** The variant the hover takes (`hover`, `enabled:hover`). */
  hoverVariant?: string;
  /** The focus tone: the accent, or the danger tone while invalid. */
  invalid?: boolean;
  /**
   * `focus:` for a well that has the keys itself, `focus-within:` (the default) for one around what has them,
   * `focus-visible:` for a button drawn as a field (its focus shows only after a key).
   */
  focus?: "focus" | "focus-within" | "focus-visible";
}

const FOCUS_CLASSES = {
  focus: {
    border: {
      brand: "focus:border-brand",
      ring: "focus:border-ring",
      destructive: "focus:border-destructive",
    },
    bottom: { brand: "focus:border-b-brand", destructive: "focus:border-b-destructive" },
    hoverBorder: {
      hover: {
        brand: "hover:focus:border-brand",
        ring: "hover:focus:border-ring",
        destructive: "hover:focus:border-destructive",
      },
      "enabled:hover": {
        brand: "enabled:hover:focus:border-brand",
        ring: "enabled:hover:focus:border-ring",
        destructive: "enabled:hover:focus:border-destructive",
      },
    },
    hoverBottom: {
      hover: {
        brand: "hover:focus:border-b-brand",
        destructive: "hover:focus:border-b-destructive",
      },
      "enabled:hover": {
        brand: "enabled:hover:focus:border-b-brand",
        destructive: "enabled:hover:focus:border-b-destructive",
      },
    },
    solidOutline: {
      brand: "outline-2 -outline-offset-1 outline-brand/0 focus:outline-brand",
      destructive: "outline-2 -outline-offset-1 outline-destructive/0 focus:outline-destructive",
    },
    haloOutline: {
      ring: "outline-3 outline-offset-0 outline-ring/0 focus:outline-ring/30",
      destructive: "outline-3 outline-offset-0 outline-destructive/30 focus:outline-destructive/30",
    },
  },
  "focus-within": {
    border: {
      brand: "focus-within:border-brand",
      ring: "focus-within:border-ring",
      destructive: "focus-within:border-destructive",
    },
    bottom: {
      brand: "focus-within:border-b-brand",
      destructive: "focus-within:border-b-destructive",
    },
    hoverBorder: {
      hover: {
        brand: "hover:focus-within:border-brand",
        ring: "hover:focus-within:border-ring",
        destructive: "hover:focus-within:border-destructive",
      },
      "enabled:hover": {
        brand: "enabled:hover:focus-within:border-brand",
        ring: "enabled:hover:focus-within:border-ring",
        destructive: "enabled:hover:focus-within:border-destructive",
      },
    },
    hoverBottom: {
      hover: {
        brand: "hover:focus-within:border-b-brand",
        destructive: "hover:focus-within:border-b-destructive",
      },
      "enabled:hover": {
        brand: "enabled:hover:focus-within:border-b-brand",
        destructive: "enabled:hover:focus-within:border-b-destructive",
      },
    },
    solidOutline: {
      brand: "outline-2 -outline-offset-1 outline-brand/0 focus-within:outline-brand",
      destructive:
        "outline-2 -outline-offset-1 outline-destructive/0 focus-within:outline-destructive",
    },
    haloOutline: {
      ring: "outline-3 outline-offset-0 outline-ring/0 focus-within:outline-ring/30",
      destructive:
        "outline-3 outline-offset-0 outline-destructive/30 focus-within:outline-destructive/30",
    },
  },
  "focus-visible": {
    border: {
      brand: "focus-visible:border-brand",
      ring: "focus-visible:border-ring",
      destructive: "focus-visible:border-destructive",
    },
    bottom: {
      brand: "focus-visible:border-b-brand",
      destructive: "focus-visible:border-b-destructive",
    },
    hoverBorder: {
      hover: {
        brand: "hover:focus-visible:border-brand",
        ring: "hover:focus-visible:border-ring",
        destructive: "hover:focus-visible:border-destructive",
      },
      "enabled:hover": {
        brand: "enabled:hover:focus-visible:border-brand",
        ring: "enabled:hover:focus-visible:border-ring",
        destructive: "enabled:hover:focus-visible:border-destructive",
      },
    },
    hoverBottom: {
      hover: {
        brand: "hover:focus-visible:border-b-brand",
        destructive: "hover:focus-visible:border-b-destructive",
      },
      "enabled:hover": {
        brand: "enabled:hover:focus-visible:border-b-brand",
        destructive: "enabled:hover:focus-visible:border-b-destructive",
      },
    },
    solidOutline: {
      brand: "outline-2 -outline-offset-1 outline-brand/0 focus-visible:outline-brand",
      destructive:
        "outline-2 -outline-offset-1 outline-destructive/0 focus-visible:outline-destructive",
    },
    haloOutline: {
      ring: "outline-3 outline-offset-0 outline-ring/0 focus-visible:outline-ring/30",
      destructive:
        "outline-3 outline-offset-0 outline-destructive/30 focus-visible:outline-destructive/30",
    },
  },
} as const;

const HOVER_EDGE_CLASS = {
  hover: "hover:border-faint",
  "enabled:hover": "enabled:hover:border-faint",
} as const;

/**
 * A well's edge as static Tailwind classes: used by terminal fields and class-based wells
 * (`NumberInput`, `timeFieldClass`). Keeps literal class names for Tailwind scanning.
 */
export function edgeClass(o: EdgeOptions): string {
  const focus = o.focus ?? "focus-within";
  const hover = o.hoverVariant === "enabled:hover" ? "enabled:hover" : "hover";
  const classes = FOCUS_CLASSES[focus];
  const drawn = fieldDrawn(fieldRecipe());
  const sideFill = drawn.sideColor ?? drawn.bottomColor ?? "transparent";
  const split = drawn.sideColor !== null && drawn.sideColor !== drawn.bottomColor;
  const sides = sideFill;
  const own = o.rest === "border-input";
  const line = drawn.focusLine;
  const borderless = drawn.width === 0;
  const usesRing = !line && drawn.focusUsesRing;
  const lineTone = o.invalid ? "destructive" : "brand";
  const ringTone = o.invalid ? "destructive" : usesRing ? "ring" : "brand";
  const hoverEdge = own && (split || borderless) ? undefined : o.hover;
  const restClass = borderless && own ? "" : own ? sides : o.rest;
  const focusEdge = line ? classes.bottom[lineTone] : classes.border[ringTone];
  const hoverFocusEdge = line
    ? classes.hoverBottom[hover][lineTone]
    : classes.hoverBorder[hover][ringTone];
  const focusRingClass =
    terminal || line
      ? ""
      : usesRing
        ? classes.haloOutline[o.invalid ? "destructive" : "ring"]
        : classes.solidOutline[o.invalid ? "destructive" : "brand"];
  return [
    restClass,
    hoverEdge ? `${HOVER_EDGE_CLASS[hover]} ${borderless ? "" : hoverFocusEdge}`.trim() : "",
    borderless ? "" : focusEdge,
    line ? fieldFocusLine(focus) : "",
    focusRingClass,
    "transition-colors duration-150 motion-reduce:transition-none",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Resolved boolean state flags of `FieldLookOptions`. */
function fieldFlags(o: FieldLookOptions | undefined) {
  const invalid = !!read(o?.invalid);
  const ghost = (read(o?.variant) ?? "default") === "ghost";
  const disabled = !!read(o?.disabled);
  const readonly = !!read(o?.readonly);
  const flat = readonly || disabled;
  const focused = !!read(o?.focused);
  return { invalid, ghost, disabled, flat, focused };
}

/**
 * A field's edge in terminal mode: the danger tone while invalid, the line while read-only or
 * disabled, and transparent while `ghost` or painted by `field.disabled.face`.
 */
function fieldEdge(o: FieldLookOptions | undefined): string {
  const { invalid, ghost, disabled, flat } = fieldFlags(o);
  if (invalid) return edgeClass({ rest: "border-destructive", invalid });
  if (ghost) return edgeClass({ rest: "border-transparent" });
  if (disabled && feedback.disabled.replaceFace) {
    return edgeClass({ rest: "border-transparent" });
  }
  return flat
    ? edgeClass({ rest: "border-line" })
    : edgeClass({ rest: "border-input", hover: "border-faint" });
}

/**
 * The inset shade without `border*Color` overrides so the frame's own rest, hover, focus, and
 * invalid edge colours stay in control.
 */
/** The inset surface's shade without its border colours, so field edge slots govern the rest border. */
export function insetShade(): ViewStyle {
  const {
    borderColor: _bc,
    borderBottomColor: _bbc,
    ...rest
  } = {
    ...surface("inset").style,
  };
  return rest as ViewStyle;
}

function fieldFocus(o: FieldLookOptions | undefined): ViewStyle {
  const field = fieldDrawn(fieldRecipe());
  const tone = fieldFocusTone(field, !!read(o?.invalid));
  return terminal ? { borderColor: tone } : fieldFocusEdge(field, tone);
}

/**
 * The well's frame without its row layout or the caller's style: corners, edge, face, rest edge,
 * focus ring and inset shade. `fieldLook` adds the row; `inputLook` spreads this under the text.
 */
export function fieldFrame(o: FieldLookOptions | undefined): ViewStyle {
  const { invalid, ghost, disabled, flat, focused } = fieldFlags(o);
  const field = fieldDrawn(fieldRecipe());
  // A theme that states the ground a field that cannot be used turns over to draws the whole box in
  // it (edge and all) rather than fading it, as WinUI's disabled brushes do.
  const off = !ghost && disabled && feedback.disabled.replaceFace;
  const face = ghost ? { backgroundColor: "transparent" } : { backgroundColor: field.ground };
  const restEdge: ViewStyle =
    field.width === 0 || off
      ? {}
      : invalid
        ? { borderColor: colors.destructive }
        : ghost
          ? { borderColor: "transparent" }
          : flat
            ? { borderColor: colors.line }
            : fieldRestEdge(field);
  const tone = fieldFocusTone(field, invalid);
  const ringInit: ViewStyle = terminal
    ? {}
    : field.focusLine
      ? { outlineStyle: "none", outlineWidth: 0 }
      : focused
        ? {}
        : invalid && field.width === 0
          ? fieldFocusEdge(field, tone)
          : fieldRing(tone);
  return {
    ...fieldCorners(field),
    ...fieldEdgeWidths(field),
    ...(off ? feedback.disabled.style : face),
    ...restEdge,
    ...ringInit,
    ...(focused ? fieldFocus(o) : {}),
    transitionProperty: "border-color, opacity",
    transitionDuration: reduceMotion() ? 0 : 150,
    // Recessed while editable; a read-only, disabled or ghost field lies flat.
    ...(off || flat || ghost ? {} : insetShade()),
  };
}

/**
 * The well around a field's input (and its prefix, suffix, icons): spread
 * it on the view holding them. Its states (`hoverStyle`, `focusWithinStyle`, `disabledStyle`):
 * a stronger edge under the pointer (none while invalid, read-only, disabled, focused, or split-edge),
 * the theme's focus edge/ring while a control in it has focus, and 50% (or `field.disabled.face`)
 * while disabled.
 */
export function fieldLook(o?: FieldLookOptions) {
  return {
    get class(): string {
      return terminal ? fieldEdge(o) : "";
    },
    get style(): InputStyle {
      return {
        flexDirection: "row",
        alignItems: read(o?.multiline) ? "flex-start" : "center",
        ...fieldFrame(o),
        ...read(o?.style),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      const { invalid, ghost, flat, focused } = fieldFlags(o);
      if (focused || invalid || ghost || flat) return undefined;
      return fieldHasUniformEdge(fieldRecipe()) ? { borderColor: colors.faint } : undefined;
    },
    get focusStyle(): ViewStyle {
      return fieldFocus(o);
    },
    get focusWithinStyle(): ViewStyle {
      return fieldFocus(o);
    },
    get disabledStyle(): ViewStyle {
      // A box drawn over to the disabled brushes dims nothing: its fill and its ink are the theme's.
      return feedback.disabled.replaceFace ? {} : { opacity: feedback.disabled.contentOpacity };
    },
  };
}

/** Options of `fieldText`. */
export interface FieldTextOptions {
  /** Read-only: the value keeps the text color, as shadcn's read-only input (the well lies flat: `fieldLook`). */
  readonly?: boolean;
  /** Several lines: a least height and the padding above and below instead of a set height. */
  multiline?: boolean;
  /** Inside a `fieldLook` well, whose 1-point edge is part of the field's height: the text is that much shorter, so the
   * whole field is as tall as a lone input, a select or a number input. */
  inWell?: boolean;
  /** Disabled: takes the ink of the theme's disabled field, where it states one. */
  disabled?: boolean;
}

/**
 * An input's text in a field: the field's size and padding, the text color
 * (read-only too: the flat well tells it apart, and disabled dims to 50%),
 * the placeholder in the muted color (shadcn's `muted-foreground`), the
 * caret and selection in the accent. Call it where the style is read, so it
 * follows the theme.
 */
export function fieldText(o?: FieldTextOptions): InputStyle {
  const field = fieldDrawn(fieldRecipe());
  // The well's edge above and below (0, 1, or 2 points depending on the theme's edges).
  const edge = o?.inWell && !terminal ? fieldEdgeThickness(field) : 0;
  // A disabled field drawn over to the theme's disabled box takes that box's ink, not a fade.
  const ink = o?.disabled && feedback.disabled.replaceFace ? feedback.disabled.ink : null;
  const box = terminal
    ? o?.multiline
      ? {
          minHeight: 3 * TERMINAL_ROW,
          paddingTop: TERMINAL_ROW - 1,
          paddingBottom: TERMINAL_ROW - 1,
        }
      : { height: 3 * TERMINAL_ROW }
    : o?.multiline
      ? pointer
        ? {
            minHeight: fieldSize.height - edge,
            paddingTop: 7 - edge / 2,
            paddingBottom: 7 - edge / 2,
          }
        : {
            minHeight: fieldSize.height - edge,
            paddingTop: 13 - edge / 2,
            paddingBottom: 13 - edge / 2,
          }
      : { height: fieldSize.height - edge };
  return {
    flex: 1,
    paddingHorizontal: fieldSize.pad,
    fontSize: fieldSize.font,
    color: ink ?? colors.foreground,
    placeholderColor: colors.mutedForeground,
    caretColor: colors.brand,
    selectionColor: colors.brand,
    ...box,
  };
}

/** The room a multiline field keeps around the text it reports: padding above and below, and the
 * well's own edge (the terminal's edge is a cell, already inside the row). */
export function multilineFieldPad(): number {
  const text = fieldText({ multiline: true });
  const room = (value: string | number | undefined) => (typeof value === "number" ? value : 0);
  return (
    room(text.paddingTop) +
    room(text.paddingBottom) +
    (terminal ? 0 : fieldEdgeThickness(fieldRecipe()))
  );
}

/**
 * How tall a multiline field is for a reported content height: the text plus `multilineFieldPad`,
 * and no taller than `maxLines` field-heights (five, about the notes a form keeps on screen).
 */
export function grownFieldHeight(contentHeight: number, maxLines = 5): number {
  return Math.min(contentHeight + multilineFieldPad(), maxLines * fieldSize.height);
}

/**
 * A time field's well, the same one in `TimeField` and in the date picker's time row: a number input's frame, the
 * field's segments inside. It sits in the calendar's popup, so in dark it is shadcn's input there (`bg-input/30`, a
 * shade over the popup) rather than the field color, which is the page's and would read as a hole. Its corners and
 * edge are the preset's, so read it where it is used: the preset is the theme's, which changes at runtime.
 */
export function timeFieldClass(): string {
  const field = fieldRecipe();
  return [
    pointer ? "h-8 px-2" : "h-11 px-3",
    fieldCornerClass(field),
    terminal ? "items-center bg-card" : "items-center bg-card dark:bg-input/30",
    fieldEdgeClass(field),
    edgeClass({ rest: "border-input", hover: "border-faint", hoverVariant: "enabled:hover" }),
  ].join(" ");
}

/**
 * A time field's props (`style`, `hoverStyle`, `focusWithinStyle`, `disabledStyle`, and `class` in a
 * terminal): aligns the well with `fieldLook()` so segments share the theme's field fill, corners,
 * edge widths, and smooth focus halo.
 */
export function timeFieldLook(o?: { disabled?: Live<boolean>; style?: Live<ViewStyle> }) {
  const well = fieldLook({
    disabled: o?.disabled,
    style: () => ({
      height: fieldSize.height,
      paddingHorizontal: pointer ? 8 : 12,
      ...read(o?.style),
    }),
  });
  return {
    get class(): string {
      return terminal ? timeFieldClass() : "";
    },
    get style(): ViewStyle {
      return well.style;
    },
    get hoverStyle(): ViewStyle | undefined {
      return well.hoverStyle;
    },
    get focusWithinStyle(): ViewStyle {
      return well.focusWithinStyle;
    },
    get disabledStyle(): ViewStyle {
      return well.disabledStyle;
    },
  };
}
