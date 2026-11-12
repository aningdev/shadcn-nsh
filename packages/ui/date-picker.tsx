// A date picker: the look (`DateTrigger`, `datePickerLook`) and `DatePicker` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { terminal } from "@shadcn-nsh/theme";
import { split } from "nsh";
import {
  DatePicker as BaseDatePicker,
  type CalendarEntry,
  type DatePickerProps as BaseDatePickerProps,
} from "nsh/base";

import { CalendarItem, calendarLook, TimeSegment } from "./calendar";
import { listboxPopup } from "./lib/listbox";
import { backdrop } from "./lib/overlay";
import { Picker, type PickerProps } from "./select";
import { timeFieldClass } from "./time-field";

// @port look/listbox.tsx
/** A value, or a function reading it where the look is applied (a signal). */
type Live<T> = T | (() => T);

const read = <T,>(v: Live<T> | undefined): T | undefined =>
  typeof v === "function" ? (v as () => T)() : v;

/**
 * A date picker's trigger (`DatePicker`'s `trigger`), shadcn's: `Picker`
 * led by a calendar in the muted color, the value in the text color or a
 * muted placeholder, and no chevron (a clear button goes over the end while
 * it has a value, `clearable`).
 */
export function DateTrigger(props: Omit<PickerProps, "icon" | "chevron" | "lead">) {
  return (
    <Picker
      title={props.title}
      open={props.open}
      disabled={props.disabled}
      placeholder={props.placeholder}
      clearable={props.clearable}
      invalid={props.invalid}
      icon="calendar"
      chevron={false}
      style={props.style}
    />
  );
}

/** The gap between the months of a calendar of two (shadcn's `gap-4`). */
const monthGap = 16;

/** Options of `datePickerLook`. */
export interface DatePickerLookOptions {
  /** Months side by side (`numberOfMonths`), or a function reading it: each month's title over its month. */
  months?: Live<number>;
  /** The picker's `firstDayOfWeek` (`0` Sunday, the default), or a function reading it: the range's band rounds at its weeks' ends. */
  firstDayOfWeek?: Live<number>;
}

/**
 * What a `DatePicker` takes besides its value and trigger (spread it): the
 * list's popup or sheet and scrim, the calendar's padding, header and
 * items (`CalendarItem`), the presets and the time's row, segments and
 * well. Parts a picker does not show (presets, the time) are unused.
 */
export function datePickerLook(o?: DatePickerLookOptions) {
  return {
    offset: 4,
    margin: 8,
    get popupStyle() {
      return listboxPopup();
    },
    get backdropStyle() {
      return backdrop();
    },
    contentStyle: calendarLook.content,
    get presetsStyle() {
      return calendarLook.presets;
    },
    get presetStyle() {
      return calendarLook.preset;
    },
    presetClass: calendarLook.presetClass,
    calendarStyle: calendarLook.calendar,
    headerStyle: calendarLook.header,
    bodyStyle: terminal ? undefined : { gap: monthGap },
    itemClass: calendarLook.itemClass,
    renderItem: (item: CalendarEntry) => (
      <CalendarItem item={item} months={read(o?.months)} firstDayOfWeek={read(o?.firstDayOfWeek)} />
    ),
    get timeStyle() {
      return calendarLook.time;
    },
    timeFieldClass,
    segmentClass: calendarLook.segmentClass,
    get separatorStyle() {
      return calendarLook.separator;
    },
    renderSegment: (segment: { label: string }) => <TimeSegment label={segment.label} />,
  };
}
// @port end

/**
 * `nsh/base`'s DatePicker with `datePickerLook` defaults. Pass `trigger` (often a `DateTrigger`).
 */
/** `nsh/base`'s DatePicker with `datePickerLook` defaults. Pass `trigger` (often a `DateTrigger`). */
export type DatePickerProps = BaseDatePickerProps;

/** A date picker: calendar in a listbox popup, field trigger. */
export function DatePicker(props: DatePickerProps) {
  const [, rest] = split(props, [
    "popupStyle",
    "backdropStyle",
    "offset",
    "margin",
    "contentStyle",
    "presetsStyle",
    "presetStyle",
    "presetClass",
    "calendarStyle",
    "headerStyle",
    "bodyStyle",
    "itemClass",
    "renderItem",
    "timeStyle",
    "timeFieldClass",
    "segmentClass",
    "separatorStyle",
    "renderSegment",
    "numberOfMonths",
    "firstDayOfWeek",
  ]);
  const look = datePickerLook({
    months: () => props.numberOfMonths ?? 1,
    firstDayOfWeek: () => props.firstDayOfWeek ?? 0,
  });
  return (
    <BaseDatePicker
      {...rest}
      numberOfMonths={props.numberOfMonths}
      firstDayOfWeek={props.firstDayOfWeek}
      offset={props.offset ?? look.offset}
      margin={props.margin ?? look.margin}
      popupStyle={[look.popupStyle, props.popupStyle ?? null]}
      backdropStyle={[look.backdropStyle, props.backdropStyle ?? null]}
      contentStyle={[look.contentStyle, props.contentStyle ?? null]}
      presetsStyle={[look.presetsStyle, props.presetsStyle ?? null]}
      presetStyle={[look.presetStyle, props.presetStyle ?? null]}
      presetClass={props.presetClass ?? look.presetClass}
      calendarStyle={[look.calendarStyle, props.calendarStyle ?? null]}
      headerStyle={[look.headerStyle, props.headerStyle ?? null]}
      bodyStyle={[look.bodyStyle, props.bodyStyle ?? null]}
      itemClass={props.itemClass ?? look.itemClass}
      renderItem={props.renderItem ?? look.renderItem}
      timeStyle={[look.timeStyle, props.timeStyle ?? null]}
      timeFieldClass={props.timeFieldClass ?? look.timeFieldClass}
      segmentClass={props.segmentClass ?? look.segmentClass}
      separatorStyle={[look.separatorStyle, props.separatorStyle ?? null]}
      renderSegment={props.renderSegment ?? look.renderSegment}
    />
  );
}
