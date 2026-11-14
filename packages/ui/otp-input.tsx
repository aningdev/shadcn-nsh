// An OTP input: the look (`otpCellLook`) and the `OtpInput` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, finish, terminal, type Tone, toneColor, toneTint } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { platform, split } from "nsh";
import { OtpInput as BaseOtpInput, type OtpInputProps as BaseOtpInputProps } from "nsh/base";

import { edgeClass } from "./input";

// @port look/field.tsx
const pointer = platform.desktop;

/** A value, or a function reading it where the look is applied (a signal). */
type Live<T> = T | (() => T);

const read = <T,>(v: Live<T> | undefined): T | undefined =>
  typeof v === "function" ? (v as () => T)() : v;

/** The cells of a code of six: 36 × 44 with a pointer, 44 × 52 on a touch screen. */
export const otpCells = pointer ? "w-9 h-11 text-lg" : "w-11 h-13 text-xl";

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
  return {
    cellClass: terminal
      ? "w-10 h-12 items-center justify-center border border-line font-semibold text-foreground focus:border-brand disabled:opacity-50"
      : `${cells} items-center justify-center rounded-lg border border-line bg-inset font-semibold text-foreground data-filled:border-input data-filled:bg-card data-filled:focus:border-brand disabled:opacity-50 ${edgeClass({ rest: "", focus: "focus" })}`,
    get cellStyle(): ViewStyle {
      const tone = read(o?.tone);
      if (terminal) return tone ? { borderColor: toneColor(tone) } : {};
      return tone
        ? { ...finish.inset, backgroundColor: toneTint(tone), borderColor: toneColor(tone) }
        : finish.inset;
    },
    caretClass: "w-0.5 h-6 rounded-full",
    get caretStyle(): ViewStyle {
      return { backgroundColor: colors.text };
    },
  };
}
// @port end

/**
 * `nsh/base`'s OtpInput in the look of `otpCellLook`. Every base prop passes through; the cell
 * and caret props go over the look's.
 */
export type OtpInputProps = BaseOtpInputProps & {
  /** A cell's size classes (`otpCells` by default). */
  cells?: string;
  /** A verdict: every cell edged and tinted in its tone. */
  tone?: Tone | (() => Tone | undefined);
};

/** A one-time code's cells. */
export function OtpInput(props: OtpInputProps) {
  const [, rest] = split(props, [
    "cells",
    "tone",
    "cellClass",
    "cellStyle",
    "caretClass",
    "caretStyle",
  ]);
  const look = otpCellLook({ cells: props.cells, tone: props.tone });
  return (
    <BaseOtpInput
      {...rest}
      cellClass={props.cellClass ? `${look.cellClass} ${props.cellClass}` : look.cellClass}
      cellStyle={[look.cellStyle, props.cellStyle ?? null]}
      caretClass={props.caretClass ? `${look.caretClass} ${props.caretClass}` : look.caretClass}
      caretStyle={[look.caretStyle, props.caretStyle ?? null]}
    />
  );
}
