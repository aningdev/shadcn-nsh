// Source: examples/nsh-gallery-ui/look/field.tsx @ 64ab8a1d (baseline), see NOTICE.
import { alpha, colors, finish, radius } from "@shadcn-nsh/theme";
import type { StyleProp, TextStyle, ViewStyle } from "nsh";
import { computed, split } from "nsh";
import { OtpInput as BaseOtpInput, type OtpInputProps as BaseOtpInputProps } from "nsh/base";

import { isPointer } from "./lib/density";
import { fieldDisabledStyle, fieldTransitionClass } from "./lib/field";

/**
 * Theme layer on `nsh/base` OtpInput. No `variant` / `size`. `invalid` paints every
 * cell in the danger tone (the reference's verdict tone). Every base prop passes
 * through; consumer styles win per key.
 */
export type OtpInputProps = BaseOtpInputProps & {
  /** Danger edge and tint on every cell, over the empty / filled look. */
  invalid?: boolean;
};

type OtpLook = {
  style: ViewStyle;
  disabledStyle: ViewStyle;
  groupStyle: ViewStyle;
  cellClass: string;
  cellStyle: TextStyle;
  caretStyle: ViewStyle;
};

/**
 * Empty / filled / focus live on the class: `cellStyle` wins over `cellClass`, so a
 * resting border or fill in the style would hide `data-filled:` and `focus:`.
 * Invalid is the exception — it is a style, so it wins over those classes.
 */
const CELL_CLASS = [
  "items-center justify-center border border-border bg-muted font-semibold text-foreground",
  "data-filled:border-input data-filled:bg-card data-filled:focus:border-ring",
  "focus:border-ring outline-2 -outline-offset-1 outline-ring/0 focus:outline-ring",
  fieldTransitionClass,
].join(" ");

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<S>(
  base?: StyleProp<S> | null,
  consumer?: StyleProp<S> | null,
): StyleProp<S> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/**
 * Cells: 36×44, text 18, with a pointer; 44×52, text 20, on a touch screen
 * (the reference's `w-9 h-11 text-lg` / `w-11 h-13 text-xl`). Widths and heights
 * are minimums (R5).
 */
function look(invalid: boolean): OtpLook {
  const pointer = isPointer();
  const cell = pointer
    ? { minWidth: 36, minHeight: 44, fontSize: 18 }
    : { minWidth: 44, minHeight: 52, fontSize: 20 };
  return {
    style: { flexDirection: "row", gap: 8 },
    disabledStyle: fieldDisabledStyle(),
    groupStyle: { flexDirection: "row", gap: 8 },
    cellClass: CELL_CLASS,
    cellStyle: {
      minWidth: cell.minWidth,
      minHeight: cell.minHeight,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.control,
      fontSize: cell.fontSize,
      fontWeight: "600",
      textAlign: "center",
      color: colors.foreground,
      boxShadow: finish.control.pressed,
      ...(invalid
        ? {
            borderColor: colors.destructive,
            backgroundColor: alpha(colors.destructive, 0.12),
          }
        : {}),
    },
    caretStyle: {
      width: 2,
      height: 24,
      borderRadius: 999,
      backgroundColor: colors.foreground,
    },
  };
}

/** The cells' chrome. Call it where the props are read. */
export function otpInputVariants(options?: { invalid?: boolean }): OtpLook {
  return look(!!options?.invalid);
}

/** A one-time code: cells on `nsh/base` OtpInput. Every base prop passes through. */
export function OtpInput(props: OtpInputProps) {
  const [, rest] = split(props, [
    "style",
    "disabledStyle",
    "groupStyle",
    "cellClass",
    "cellStyle",
    "caretStyle",
    "invalid",
  ]);

  const current = computed(() => otpInputVariants({ invalid: props.invalid }));

  return (
    <BaseOtpInput
      {...rest}
      style={mergeStyle(current().style, props.style)}
      disabledStyle={mergeStyle(current().disabledStyle, props.disabledStyle)}
      groupStyle={mergeStyle(current().groupStyle, props.groupStyle)}
      cellClass={mergeClass(current().cellClass, props.cellClass)}
      cellStyle={mergeStyle(current().cellStyle, props.cellStyle)}
      caretStyle={mergeStyle(current().caretStyle, props.caretStyle)}
    />
  );
}
