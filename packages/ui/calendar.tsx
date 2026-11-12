// A calendar: the look (`CalendarItem`, `calendarLook`, `TimeSegment`) and `Calendar` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { alpha, colors, radius, terminal } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import {
  Calendar as BaseCalendar,
  type CalendarEntry,
  type CalendarProps as BaseCalendarProps,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { controlSize } from "./lib/surface";
import { timeFieldClass } from "./time-field";

// @port look/listbox.tsx
const pointer = platform.desktop;

/** The icon of a trigger: 16 points with a pointer (shadcn's `size-4`), 18 on a touch screen. */
const triggerIcon = pointer ? 16 : 18;

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

/** The weekdays' initials in the terminal, one to its two-Cell column. */
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

/** The weekdays over the days elsewhere, shadcn's two letters. */
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * A day's cell, shadcn's `--cell-size`: 32 with a pointer (the days, the
 * arrows and the header's height), 42 across a phone's sheet.
 */
const cell = pointer ? 32 : 42;

/** The gap between the months of a calendar of two (shadcn's `gap-4`). */
const monthGap = 16;

/** The gap over each week: rows of 36 with a pointer, as shadcn's Base UI calendar's (28-point cells, `mt-2`). */
const weekGap = 4;

/** The corners of the days, the arrows and the month view's items: the controls' (shadcn's `rounded-md`). */
const cellRadius = () => radius.control;

/**
 * The quiet fill of today, the hover, a range's band and the arrows' and
 * presets' hover (shadcn's `accent`): the text color at 8%, which stands
 * off the popup in both appearances as shadcn's does (the theme's `accent`
 * is all but the popup's own color in dark); `pressedFill` a step further.
 */
const quietFill = "bg-foreground/8";

const pressedFill = "bg-foreground/14";

/** The column of an ISO date in weeks that start on `firstDay` (`0` Sunday). */
function columnOf(date: string, firstDay: number) {
  const day = new Date(
    Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10))),
  ).getUTCDay();
  return (day - firstDay + 7) % 7;
}

/** Options of `CalendarItem`. */
export interface CalendarItemProps {
  item: CalendarEntry;
  /** Months side by side (`numberOfMonths`): each month's title over its month. */
  months?: number;
  /** The calendar's `firstDayOfWeek` (`0` Sunday, the default): a range's band rounds at its weeks' ends. */
  firstDayOfWeek?: number;
}

/**
 * An item of the calendar (`renderItem`), shadcn/ui's calendar: drawn once
 * from what it is, its states the item's classes. Previous and Next are
 * ghost buttons of a cell at the header's ends, lit in the quiet fill under
 * the pointer, at half opacity while they take no press; the month and
 * year toggles (or each month's title, with `months` over one) read
 * "November 2026" centered between them, the open view's toggle in the
 * brand color; the weekdays are two letters in the muted color. A day is a
 * square of a cell with the controls' corners: the quiet fill (shadcn's
 * `accent`) under the pointer and for today, `primary` with its foreground
 * for the selected date and a range's ends, the range's other days on a
 * band of the quiet fill from end to end (`data-range-*`) whose corners
 * round at the weeks' ends, the other months' days muted, the disabled ones
 * muted at half opacity, and the keyboard's day lit as a list's highlighted
 * row is (`optionClass`: the brand tint and edge), so Select, Combobox,
 * Command and the calendar move one kind of highlight.
 */
export function CalendarItem(props: CalendarItemProps) {
  const kind = props.item.kind;
  if (terminal) {
    // The terminal's calendar draws its days, years and arrows itself, on its grid of two-Cell columns: the
    // labels are plain text at their own size (the painter bands the open view's toggle, from its state).
    if (kind === "weekday")
      return <Text style={{ color: colors.faint }}>{WEEKDAY_INITIALS[props.item.value]}</Text>;
    if (kind === "month") return <Text>{MONTHS[props.item.value - 1].slice(0, 3)}</Text>;
    const title = kind === "monthToggle" && (props.months ?? 1) > 1;
    return (
      <Text style={{ fontWeight: "600" }}>
        {title
          ? `${MONTHS[props.item.value - 1]} ${props.item.year}`
          : kind === "monthToggle"
            ? MONTHS[props.item.value - 1]
            : String(props.item.value)}
      </Text>
    );
  }
  if (kind === "previous" || kind === "next") {
    return (
      <View
        class={`transition-colors duration-100 motion-reduce:transition-none group-hover:${quietFill} group-disabled:bg-transparent group-disabled:opacity-50`}
        // At its end of the header, which shares out what the items leave (`calendarLook.itemClass`'s `grow`).
        style={{
          width: cell,
          height: cell,
          alignSelf: kind === "previous" ? "flex-start" : "flex-end",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: cellRadius(),
        }}
      >
        <View style={{ transform: [{ rotate: kind === "previous" ? "180deg" : "0deg" }] }}>
          <Icon name="chevron" size={triggerIcon} tint={colors.text} />
        </View>
      </View>
    );
  }
  if (kind === "monthToggle" || kind === "yearToggle") {
    // A month's title in a calendar of several takes no press: the month and its year, over the month. One month's
    // toggles are as wide as their words and grow alike with the arrows (`grow`), the month's name at the end of
    // its share and the year at the start of its: the two meet a word space apart, and "November 2026" is centered
    // between the arrows however wide the popup is.
    const title = kind === "monthToggle" && (props.months ?? 1) > 1;
    return (
      <Text
        class="text-foreground group-selected:text-brand"
        style={{
          minWidth: title ? 6 * cell + monthGap / 2 : undefined,
          paddingHorizontal: title ? 0 : 2,
          textAlign: title ? "center" : kind === "monthToggle" ? "right" : "left",
          fontSize: controlSize.label,
          fontWeight: "500",
        }}
      >
        {title
          ? `${MONTHS[props.item.value - 1]} ${props.item.year}`
          : kind === "monthToggle"
            ? MONTHS[props.item.value - 1]
            : String(props.item.value)}
      </Text>
    );
  }
  if (kind === "weekday") {
    return (
      <Text
        style={{
          minWidth: cell,
          textAlign: "center",
          fontSize: pointer ? 12.8 : 13,
          color: colors.muted,
        }}
      >
        {WEEKDAYS[props.item.value]}
      </Text>
    );
  }
  if (kind === "month" || kind === "year") {
    // The month view's months (rows of 3) and the year view's years (rows of 5), as wide as a month: ghost buttons
    // a week's gap apart, the shown one on `primary`.
    return (
      <View
        style={{
          minWidth: (7 * cell) / (kind === "month" ? 3 : 5),
          paddingTop: weekGap,
          paddingHorizontal: 2,
        }}
      >
        <View
          class={`transition-colors duration-100 motion-reduce:transition-none group-hover:${quietFill} group-aria-selected:bg-primary group-disabled:opacity-50`}
          style={{
            height: cell,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: cellRadius(),
          }}
        >
          <Text
            class="text-foreground group-aria-selected:text-primary-foreground"
            style={{ fontSize: controlSize.label }}
          >
            {kind === "month" ? MONTHS[props.item.value - 1].slice(0, 3) : String(props.item.value)}
          </Text>
        </View>
      </View>
    );
  }
  // A day, as wide as its column (the calendar's columns share its width), a week's gap over it. The band spans a
  // range's middle days and reaches from its ends' middles (a range of one day has none), rounded where a week
  // starts or ends. The square takes the quiet fill under the pointer and for today, `primary` for the selected
  // date and a range's ends (`aria-selected`, which ranks over the hover; a range's middle days keep the band). A
  // disabled day takes no hover fill, unless it is today. The keyboard's day takes the lists' highlight (the brand
  // tint and edge); on the selected day only the edge, over `primary`.
  const own = () => (props.item.outside ? "text-muted-foreground" : "text-foreground");
  const column = () =>
    props.item.date ? columnOf(props.item.date, props.firstDayOfWeek ?? 0) : -1;
  return (
    <View style={{ minWidth: cell, paddingTop: weekGap }}>
      <View style={{ height: cell, alignItems: "center", justifyContent: "center" }}>
        <View
          class={
            `absolute inset-y-0 right-0 left-0 hidden ${quietFill} group-data-range-middle:flex group-data-range-start:left-1/2 group-data-range-start:flex ` +
            "group-data-range-end:right-1/2 group-data-range-end:flex group-data-range-start:group-data-range-end:hidden"
          }
          style={{
            borderTopLeftRadius: column() === 0 ? cellRadius() : 0,
            borderBottomLeftRadius: column() === 0 ? cellRadius() : 0,
            borderTopRightRadius: column() === 6 ? cellRadius() : 0,
            borderBottomRightRadius: column() === 6 ? cellRadius() : 0,
          }}
        />
        <View
          class={
            `${props.item.today ? quietFill : "group-disabled:bg-transparent"} transition-colors duration-100 motion-reduce:transition-none ` +
            `group-hover:${quietFill} group-aria-selected:bg-primary group-focus-visible:border-brand/30 group-focus-visible:bg-brand-tint group-aria-selected:group-focus-visible:bg-primary group-data-range-middle:group-focus-visible:bg-brand-tint border border-transparent group-data-range-middle:bg-transparent`
          }
          style={{
            width: cell,
            height: cell,
            borderRadius: cellRadius(),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            class={
              `${own()} group-aria-selected:text-primary-foreground font-normal group-data-range-middle:${own()} ` +
              "group-disabled:text-muted-foreground group-disabled:opacity-50"
            }
            style={{ fontSize: pointer ? 14 : 16, fontVariant: ["tabular-nums"] }}
          >
            {String(props.item.value)}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * A time segment's digits or AM / PM (`renderSegment`), in the color on
 * the fill while it has the keys (`group-focus:`), so moving between the
 * segments draws nothing.
 */
export function TimeSegment(props: { label: string }) {
  return (
    <Text
      class="text-foreground group-focus:text-on-brand"
      style={{
        paddingHorizontal: terminal ? 3 : 2,
        fontSize: controlSize.label,
        fontVariant: ["tabular-nums"],
      }}
    >
      {props.label}
    </Text>
  );
}

/**
 * The calendar's parts, besides its popup: `itemClass` its items (pressed
 * at 70%, `group` for what they draw), `segmentClass` the time's segments
 * (filled while they have the keys), the popup's layout (`content`: the
 * presets beside the calendar with a pointer, above it on a phone), the
 * presets' column of ghost buttons or chips, the header's gap over the
 * weekdays (shadcn's `gap-4`), the calendar's padding (with the popup's,
 * shadcn's `p-3`), the time's row under a hairline, its well
 * (`timeFieldClass`, the number inputs'), the time's `:` in the muted
 * color, and `cell` / `monthGap`, a day's side and the gap between two
 * months. The terminal keeps its own grid.
 */
export const calendarLook = {
  cell,
  monthGap,
  // `grow`: the header's arrows and toggles share out what their content leaves alike (the days' columns share the
  // width already), which keeps the title centered between the arrows at their ends.
  itemClass: terminal ? "group active:opacity-70" : "group grow active:opacity-70",
  segmentClass: "group rounded-[4px] active:opacity-70 focus:bg-brand-fill",
  timeFieldClass,
  content: terminal
    ? { flexDirection: "row" as const, gap: 10 }
    : pointer
      ? { flexDirection: "row" as const, gap: 6 }
      : { gap: 12 },
  get presets(): ViewStyle {
    if (terminal)
      return {
        gap: 2,
        minWidth: 110,
        paddingRight: 10,
        borderRightWidth: 1,
        borderColor: colors.border,
      };
    // With a pointer a column of small ghost buttons beside the calendar, its first level with the header, parted
    // from the calendar by a hairline that holds in dark too.
    return pointer
      ? {
          gap: 2,
          paddingTop: 8,
          paddingRight: 8,
          borderRightWidth: 1,
          borderColor: alpha(colors.text, 0.1),
        }
      : { flexDirection: "row", flexWrap: "wrap", gap: 6 };
  },
  get preset() {
    if (terminal)
      return {
        height: 28,
        paddingHorizontal: 8,
        borderRadius: radius.control,
        justifyContent: "center" as const,
        fontSize: 13,
        color: colors.text,
      };
    return pointer
      ? {
          height: 28,
          paddingHorizontal: 10,
          borderRadius: radius.control,
          justifyContent: "center" as const,
          fontSize: 13,
          color: colors.text,
        }
      : {
          height: 34,
          paddingHorizontal: 12,
          borderRadius: 17,
          borderWidth: 1,
          borderColor: colors.border,
          justifyContent: "center" as const,
          fontSize: 14,
          color: colors.text,
        };
  },
  presetClass: terminal
    ? "enabled:hover:bg-accent active:opacity-70"
    : `transition-colors duration-100 motion-reduce:transition-none enabled:hover:${quietFill} enabled:active:${pressedFill}`,
  header: { marginBottom: terminal ? 4 : pointer ? 12 : 8 },
  calendar: terminal ? { padding: 4 } : pointer ? { padding: 6 } : {},
  get time(): ViewStyle {
    if (terminal)
      return {
        gap: 10,
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 4,
      };
    // Under the calendar's last week, as far from the hairline as the calendar's padding is from the popup's edge.
    return {
      gap: 10,
      marginTop: pointer ? 6 : 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderColor: alpha(colors.text, 0.1),
      ...(pointer ? { paddingHorizontal: 6, paddingBottom: 6 } : {}),
    };
  },
  get separator() {
    // Tight to the digits, as a time input's: the segments' padding is the room on each side.
    return terminal
      ? { color: colors.faint, fontSize: controlSize.label }
      : { color: colors.muted, fontSize: controlSize.label, marginHorizontal: -1 };
  },
};
// @port end

/** `nsh/base`'s Calendar with `calendarLook` defaults. Every base prop passes through over the look's. */
export type CalendarProps = BaseCalendarProps;

/** A calendar grid in the shared listbox calendar look. */
export function Calendar(props: CalendarProps) {
  const [, rest] = split(props, [
    "style",
    "headerStyle",
    "bodyStyle",
    "itemClass",
    "renderItem",
    "numberOfMonths",
    "firstDayOfWeek",
  ]);
  return (
    <BaseCalendar
      {...rest}
      numberOfMonths={props.numberOfMonths}
      firstDayOfWeek={props.firstDayOfWeek}
      style={[calendarLook.calendar, props.style ?? null]}
      headerStyle={[calendarLook.header, props.headerStyle ?? null]}
      bodyStyle={[terminal ? null : { gap: monthGap }, props.bodyStyle ?? null]}
      itemClass={props.itemClass ?? calendarLook.itemClass}
      renderItem={
        props.renderItem ??
        ((item: CalendarEntry) => (
          <CalendarItem
            item={item}
            months={props.numberOfMonths}
            firstDayOfWeek={props.firstDayOfWeek}
          />
        ))
      }
    />
  );
}
