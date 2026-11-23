// An OTP input: the cells (`otpCells`, `otpCellLook`) and the `OtpInput` that wears them.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  control,
  finish,
  terminal,
  type Tone,
  toneColor,
  toneTint,
} from "@shadcn-nsh/theme";
import type { StyleProp, ViewStyle } from "nsh";
import { platform, split } from "nsh";
import { OtpInput as BaseOtpInput, type OtpInputProps as BaseOtpInputProps } from "nsh/base";

import { edgeClass } from "./input";
import { fieldCornerClass, fieldEdgeClass } from "./lib/indicator";
import { type Live, read } from "./lib/live-value";
import { fieldLook } from "./lib/look";
import { createRejectShake } from "./lib/motion";

const pointer = platform.desktop;

/**
 * The cells of a code of six: 36 × 44 with a pointer, 44 × 52 on a touch screen. They narrow
 * together (`shrink min-w-0`) where the code is wider than the room it has, a narrow phone's card.
 */
export const otpCells = pointer
  ? "w-9 h-11 text-lg shrink min-w-0"
  : "w-11 h-13 text-xl shrink min-w-0";

/** Options of `otpCellLook`. */
export interface OtpCellOptions {
  /** A cell's size classes (`otpCells` by default; a PIN's are larger). */
  cells?: string;
  /** A verdict: every cell edged and tinted in its tone (or a function reading it). */
  tone?: Live<Tone | undefined>;
}

/**
 * A one-time code's cells (spread on `OtpInput`): wells that a digit (a
 * bullet too) lifts out of (`data-filled:`), the cell taking the next digit
 * edged in the accent while the code has the keys (the fields' focus edge),
 * a verdict's tone over all of them, every change fading; the caret a
 * rounded bar in the text color, blinking (the input's own). In a terminal a
 * cell is a framed box, its line only.
 */
export function otpCellLook(o?: OtpCellOptions) {
  const cells = o?.cells ?? otpCells;
  const field = fieldLook(control().field);
  return {
    cellClass: terminal
      ? "w-10 h-12 items-center justify-center border border-line font-semibold text-foreground focus:border-brand disabled:opacity-50"
      : `${cells} items-center justify-center ${fieldCornerClass(field)} bg-inset font-semibold text-foreground ${fieldEdgeClass(field)} border-line data-filled:border-input data-filled:bg-card data-filled:focus:border-brand disabled:opacity-50 ${edgeClass({ rest: "", focus: "focus" })}`,
    get cellStyle(): ViewStyle {
      const tone = read(o?.tone);
      if (terminal) return tone ? { borderColor: toneColor(tone) } : {};
      // A copy, as the other looks hand a finish out: `finish` reads the theme when the style is
      // applied, so a cell drawn after an appearance change wears that appearance (a shared object
      // passed as it is would keep the one of the render that made it).
      return tone
        ? { ...finish.inset, backgroundColor: toneTint(tone), borderColor: toneColor(tone) }
        : { ...finish.inset };
    },
    caretClass: "w-0.5 h-6 rounded-full",
    get caretStyle(): ViewStyle {
      return { backgroundColor: colors.foreground };
    },
  };
}

/**
 * `nsh/base`'s OtpInput in the look of `otpCellLook`. Every base prop passes through; the cell
 * and caret props go over the look's.
 */
export type OtpInputProps = BaseOtpInputProps & {
  /** A cell's size classes (`otpCells` by default). */
  cells?: string;
  /** A verdict: every cell edged and tinted in its tone. */
  tone?: Live<Tone | undefined>;
  /**
   * Shakes the cells each time this becomes a new number (a code the check refused). The tone
   * only recolours them. Less motion plays nothing.
   */
  reject?: number;
};

/**
 * The code and its groups never grow past the room they have: they shrink with the cells
 * (`otpCells`) in front of the app's own `class` / `groupClass`, which lay them out.
 */
const fit = terminal ? "" : "max-w-full shrink min-w-0";

/** A one-time code's cells. */
export function OtpInput(props: OtpInputProps) {
  const [, rest] = split(props, [
    "class",
    "groupClass",
    "cells",
    "tone",
    "reject",
    "style",
    "cellClass",
    "cellStyle",
    "caretClass",
    "caretStyle",
  ]);
  const look = otpCellLook({ cells: props.cells, tone: props.tone });
  const shake = createRejectShake(() => props.reject);
  // An idle field passes no style of its own: an empty transform would be a different box to the
  // look spread on `nsh/base` in the reference page.
  const fieldStyle = (): StyleProp<ViewStyle> | undefined => {
    const moved = shake.style();
    return props.style || moved ? [props.style ?? null, moved] : undefined;
  };
  return (
    <BaseOtpInput
      {...rest}
      style={fieldStyle()}
      class={props.class ? `${fit} ${props.class}` : fit}
      groupClass={props.groupClass ? `${fit} ${props.groupClass}` : fit}
      cellClass={props.cellClass ? `${look.cellClass} ${props.cellClass}` : look.cellClass}
      cellStyle={[look.cellStyle, props.cellStyle ?? null]}
      caretClass={props.caretClass ? `${look.caretClass} ${props.caretClass}` : look.caretClass}
      caretStyle={[look.caretStyle, props.caretStyle ?? null]}
    />
  );
}
