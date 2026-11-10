// Source: examples/nsh-gallery-ui/look/listbox.tsx (calendar half), look/field.tsx (timeFieldClass) @ 64ab8a1d (baseline), see NOTICE.
import { colors, radius } from "@shadcn-nsh/theme";
import type { TextStyle, ViewStyle } from "nsh";
import { Text, View } from "nsh";
import type { CalendarEntry, TimeFieldSegmentEntry } from "nsh/base";

import { isPointer } from "./density";
import { fieldDisabledStyle, fieldHoverStyle, fieldTransitionClass, fieldWell } from "./field";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Day column and type sizes. Pointer matches the reference's 30-point cell;
 * touch uses 42 so a day is close to the 44-point target without a fixed height.
 */
export function calendarMetrics() {
  const pointer = isPointer();
  return {
    cell: pointer ? 30 : 42,
    monthGap: 16,
    day: pointer ? 13 : 15,
    label: pointer ? 14 : 15,
    check: pointer ? 12 : 16,
  };
}

/**
 * Items are drawn once, so every state is a class under `group` in `itemClass`
 * (`selected:`, `focus:`, `disabled:`, `data-range-*`, `data-today`, `data-outside`).
 * Press is `active:opacity-70`: base has no per-item style for a press sink.
 */
export const calendarItemClass = "group active:opacity-70";

/** Segment focus is a primary fill. The label follows with `group-focus:`. */
export const timeSegmentClass =
  "group items-center justify-center rounded-sm active:opacity-70 focus:bg-primary";

/** Width of one month, so a header of toggles lines up with seven day columns. */
export function monthWidth(months: number): number {
  const m = calendarMetrics();
  const n = Math.max(1, months);
  return n * 7 * m.cell + (n - 1) * m.monthGap;
}

/** Chrome shared by Calendar and the calendar inside DatePicker. Read it in render. */
export function calendarChrome(months: number) {
  const m = calendarMetrics();
  const pointer = isPointer();
  const n = Math.max(1, months);
  return {
    style: { minWidth: monthWidth(n) } satisfies ViewStyle,
    headerStyle: { marginBottom: 4 } satisfies ViewStyle,
    bodyStyle: (n > 1 ? { gap: m.monthGap } : undefined) as ViewStyle | undefined,
    calendarStyle: (pointer ? { padding: 4 } : {}) satisfies ViewStyle,
    itemClass: calendarItemClass,
    contentStyle: (pointer ? { flexDirection: "row", gap: 10 } : { gap: 12 }) satisfies ViewStyle,
    presetsStyle: (pointer
      ? {
          gap: 2,
          minWidth: 110,
          paddingRight: 10,
          borderRightWidth: 1,
          borderColor: colors.border,
        }
      : { flexDirection: "row", flexWrap: "wrap", gap: 6 }) satisfies ViewStyle,
    presetStyle: (pointer
      ? {
          minHeight: 28,
          paddingHorizontal: 8,
          borderRadius: radius.control,
          justifyContent: "center",
          fontSize: 13,
          color: colors.foreground,
        }
      : {
          minHeight: 34,
          paddingHorizontal: 12,
          borderRadius: 17,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center",
          fontSize: 14,
          color: colors.foreground,
        }) satisfies TextStyle,
    presetClass: "hover:bg-accent active:opacity-70",
    timeStyle: {
      gap: 10,
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderColor: colors.border,
      ...(pointer ? { paddingHorizontal: 4 } : {}),
    } satisfies ViewStyle,
    separatorStyle: { color: colors.mutedForeground, fontSize: m.label } satisfies TextStyle,
  };
}

/** The time well: a field recess, 32 / 44 minimum, shared by TimeField and DatePicker. */
export function timeFieldChrome() {
  const pointer = isPointer();
  const min = pointer ? 32 : 44;
  const m = calendarMetrics();
  return {
    className: `flex-row items-center ${fieldTransitionClass}`,
    style: {
      minHeight: min,
      paddingHorizontal: pointer ? 8 : 12,
      ...fieldWell({}),
    } satisfies ViewStyle,
    hoverStyle: fieldHoverStyle({}),
    disabledStyle: fieldDisabledStyle(),
    segmentClass: timeSegmentClass,
    segmentStyle: {
      minWidth: pointer ? 22 : 32,
      minHeight: pointer ? 22 : 32,
      textAlign: "center",
    } satisfies TextStyle,
    separatorStyle: { color: colors.mutedForeground, fontSize: m.label } satisfies TextStyle,
  };
}

/**
 * One calendar item. States stay on the item's classes: today is `accent` (the quiet
 * fill; the reference's brand tint), a selected day and a range end are `primary`,
 * a range's middle is an `accent` band, other months and disabled days are
 * `muted-foreground`, and the keyboard day gets a `ring` edge. Disabled is 0.5.
 * Names are English; pass `renderItem` for another language.
 */
export function CalendarItem(props: { item: CalendarEntry; months?: number }) {
  const kind = props.item.kind;
  const m = calendarMetrics();
  if (kind === "previous" || kind === "next") {
    return (
      <View
        class="group-disabled:opacity-50"
        style={{
          minWidth: m.cell,
          minHeight: m.cell,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ transform: [{ rotate: kind === "previous" ? "180deg" : "0deg" }] }}>
          <Text class="text-muted-foreground" style={{ fontSize: m.check, lineHeight: m.check }}>
            ›
          </Text>
        </View>
      </View>
    );
  }
  if (kind === "monthToggle" || kind === "yearToggle") {
    const title = kind === "monthToggle" && (props.months ?? 1) > 1;
    const label = title
      ? `${MONTHS[props.item.value - 1]} ${props.item.year}`
      : kind === "monthToggle"
        ? MONTHS[props.item.value - 1]
        : String(props.item.value);
    return (
      <Text
        class="text-foreground group-selected:text-primary"
        style={{
          alignSelf: "stretch",
          minWidth: title
            ? 6 * m.cell + m.monthGap / 2
            : kind === "monthToggle"
              ? 3 * m.cell
              : 2 * m.cell,
          paddingHorizontal: 3,
          textAlign: title ? "center" : kind === "monthToggle" ? "right" : "left",
          fontSize: m.label,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    );
  }
  if (kind === "weekday") {
    return (
      <Text
        class="text-muted-foreground"
        style={{
          alignSelf: "stretch",
          minWidth: m.cell,
          paddingVertical: 4,
          textAlign: "center",
          fontSize: 11,
          fontWeight: "600",
        }}
      >
        {WEEKDAYS[props.item.value]}
      </Text>
    );
  }
  if (kind === "month" || kind === "year") {
    return (
      <View
        class="group-selected:bg-primary"
        style={{
          alignSelf: "stretch",
          minWidth: (7 * m.cell) / (kind === "month" ? 3 : 5),
          minHeight: m.cell + 6,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius.control,
        }}
      >
        <Text
          class="text-foreground group-selected:text-primary-foreground"
          style={{ fontSize: m.label }}
        >
          {kind === "month" ? MONTHS[props.item.value - 1].slice(0, 3) : String(props.item.value)}
        </Text>
      </View>
    );
  }
  const own = props.item.outside ? "text-muted-foreground" : "text-foreground";
  return (
    <View
      style={{
        alignSelf: "stretch",
        minWidth: m.cell,
        minHeight: m.cell,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        class={
          "bg-accent absolute inset-y-0.5 right-0 left-0 hidden group-data-range-middle:flex " +
          "group-data-range-end:flex group-data-range-start:left-1/2 group-data-range-start:flex " +
          "group-data-range-end:right-1/2 group-data-range-start:group-data-range-end:hidden"
        }
      />
      <View
        class={`${props.item.today ? "bg-accent" : ""} group-focus:border-ring group-selected:bg-primary border-[1.5px] border-transparent group-data-range-middle:bg-transparent`}
        style={{
          minWidth: m.cell - 4,
          minHeight: m.cell - 4,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          class={
            `${own} ${props.item.today ? "font-semibold" : "font-normal"} group-selected:font-semibold ` +
            `group-selected:text-primary-foreground group-data-range-middle:${own} ` +
            "group-disabled:text-muted-foreground group-disabled:opacity-50"
          }
          style={{ fontSize: m.day, fontVariant: ["tabular-nums"] }}
        >
          {String(props.item.value)}
        </Text>
      </View>
    </View>
  );
}

/** A time segment's digits or AM / PM. Focus color is `group-focus:` so moving segments redraws nothing. */
export function TimeSegment(props: { entry: TimeFieldSegmentEntry }) {
  const m = calendarMetrics();
  return (
    <Text
      class="text-foreground group-focus:text-primary-foreground"
      style={{
        paddingHorizontal: 3,
        fontSize: m.label,
        fontVariant: ["tabular-nums"],
      }}
    >
      {props.entry.label}
    </Text>
  );
}
