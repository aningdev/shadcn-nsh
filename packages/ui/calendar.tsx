// Source: examples/nsh-gallery-ui/look/listbox.tsx (calendar half) @ 64ab8a1d (baseline), see NOTICE.
import type { StyleProp } from "nsh";
import { computed, split } from "nsh";
import { Calendar as BaseCalendar, type CalendarProps as BaseCalendarProps } from "nsh/base";

import { calendarChrome, calendarMetrics, CalendarItem } from "./lib/dates";

/**
 * Theme layer on `nsh/base` Calendar. One control, not a composition facade:
 * days are drawn by `renderItem`. Every base prop passes through.
 */
export type CalendarProps = BaseCalendarProps;

type CalendarLook = ReturnType<typeof calendarChrome> & {
  cell: number;
  monthGap: number;
  day: number;
};

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
 * Cell size and the calendar's chrome. `cell` is 30 with a pointer and 42 on touch.
 * Call `calendarVariants()` inside `computed` (or JSX) so tokens follow the scheme.
 */
export function calendarVariants(options?: { months?: number }): CalendarLook {
  const metrics = calendarMetrics();
  return {
    ...calendarChrome(options?.months ?? 1),
    cell: metrics.cell,
    monthGap: metrics.monthGap,
    day: metrics.day,
  };
}

/** A month of days. Selection, the range band, today, and the keyboard ring are the item classes. */
export function Calendar(props: CalendarProps) {
  const [, rest] = split(props, [
    "style",
    "headerStyle",
    "bodyStyle",
    "itemClass",
    "itemStyle",
    "renderItem",
    "numberOfMonths",
    "previousAccessibilityLabel",
    "nextAccessibilityLabel",
  ]);
  const chrome = computed(() => calendarVariants({ months: props.numberOfMonths ?? 1 }));
  return (
    <BaseCalendar
      {...rest}
      numberOfMonths={props.numberOfMonths}
      previousAccessibilityLabel={
        props.previousAccessibilityLabel === undefined
          ? "Previous month"
          : props.previousAccessibilityLabel
      }
      nextAccessibilityLabel={
        props.nextAccessibilityLabel === undefined ? "Next month" : props.nextAccessibilityLabel
      }
      style={mergeStyle(chrome().style, props.style)}
      headerStyle={mergeStyle(chrome().headerStyle, props.headerStyle)}
      bodyStyle={
        chrome().bodyStyle != null
          ? mergeStyle(chrome().bodyStyle, props.bodyStyle)
          : props.bodyStyle
      }
      itemClass={mergeClass(chrome().itemClass, props.itemClass)}
      itemStyle={props.itemStyle}
      renderItem={
        props.renderItem === undefined
          ? (item) => <CalendarItem item={item} months={props.numberOfMonths ?? 1} />
          : props.renderItem
      }
    />
  );
}
