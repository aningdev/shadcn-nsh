// Source: examples/nsh-gallery-ui/look/field.tsx (timeFieldClass), look/listbox.tsx (TimeSegment) @ 64ab8a1d (baseline), see NOTICE.
import type { StyleProp } from "nsh";
import { computed, split } from "nsh";
import { TimeField as BaseTimeField, type TimeFieldProps as BaseTimeFieldProps } from "nsh/base";

import { timeFieldChrome, TimeSegment } from "./lib/dates";

/**
 * Theme layer on `nsh/base` TimeField. One control: segments are drawn by
 * `renderSegment`. Every base prop passes through.
 */
export type TimeFieldProps = BaseTimeFieldProps;

type TimeLook = ReturnType<typeof timeFieldChrome>;

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

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
 * The time well. Minimum height is 32 with a pointer and 44 on touch.
 * Call `timeFieldVariants()` inside `computed` (or JSX) so tokens follow the scheme.
 */
export function timeFieldVariants(): TimeLook {
  return timeFieldChrome();
}

/** A time of day, one segment at a time. The focused segment fills with `primary`. */
export function TimeField(props: TimeFieldProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "hoverStyle",
    "disabledStyle",
    "segmentClass",
    "segmentStyle",
    "separatorStyle",
    "renderSegment",
  ]);
  const chrome = computed(() => timeFieldVariants());
  return (
    <BaseTimeField
      {...rest}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      hoverStyle={
        chrome().hoverStyle != null
          ? mergeStyle(chrome().hoverStyle, props.hoverStyle)
          : props.hoverStyle
      }
      disabledStyle={mergeStyle(chrome().disabledStyle, props.disabledStyle)}
      segmentClass={mergeClass(chrome().segmentClass, props.segmentClass)}
      segmentStyle={mergeStyle(chrome().segmentStyle, props.segmentStyle)}
      separatorStyle={mergeStyle(chrome().separatorStyle, props.separatorStyle)}
      renderSegment={
        props.renderSegment === undefined
          ? (entry) => <TimeSegment entry={entry} />
          : props.renderSegment
      }
    />
  );
}
