// A calendar: the look (`CalendarItem`, `calendarLook`, `TimeSegment`) and `Calendar` that wears it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  alpha,
  colors,
  cornerCurve,
  rounded,
  terminal,
  font,
  shape,
  stroke,
} from "@shadcn-nsh/theme";
import { ChevronRight } from "lucide";
import type { ViewStyle } from "nsh";
import { computed, platform, split, Text, View } from "nsh";
import {
  Calendar as BaseCalendar,
  type CalendarEntry,
  type CalendarProps as BaseCalendarProps,
} from "nsh/base";

import { timeFieldClass } from "./input";
import { Icon } from "./lib/icons";
import { controlSize } from "./lib/surface";

// @port look/listbox.tsx
const pointer = platform.desktop;

/** The header's arrows: 16 points with a pointer (shadcn's `size-4`), 18 on a touch screen. */
const arrowIcon = pointer ? 16 : 18;

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

/** The corners of the days, the arrows and the month view's items: the
 * controls' radius, read where an item is drawn. */
const cellRadius = () => shape.control;

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

/** The weekdays over the days: two letters in the muted color, as wide as a day. */
function Weekday(props: { day: number }) {
  return (
    <Text
      style={{
        minWidth: cell,
        textAlign: "center",
        // No type role has this size: a weekday's 12.8 with a pointer.
        fontSize: pointer ? 12.8 : 13,
        color: colors.mutedForeground,
      }}
    >
      {WEEKDAYS[props.day]}
    </Text>
  );
}

/**
 * The header's Previous or Next: a ghost button of a cell at its end of the
 * header, lit in the quiet fill under the pointer, at half opacity while it
 * takes no press.
 */
function Arrow(props: { at: "start" | "end" }) {
  return (
    <View
      class={`transition-colors duration-100 motion-reduce:transition-none group-hover:${quietFill} group-disabled:bg-transparent group-disabled:opacity-50`}
      // At its end of the header, which shares out what the items leave (`calendarLook.itemClass`'s `grow`).
      style={{
        width: cell,
        height: cell,
        alignSelf: props.at === "start" ? "flex-start" : "flex-end",
        alignItems: "center",
        justifyContent: "center",
        ...rounded(cellRadius()),
      }}
    >
      <View style={{ transform: [{ rotate: props.at === "start" ? "180deg" : "0deg" }] }}>
        <Icon icon={ChevronRight} size={arrowIcon} tint={colors.foreground} />
      </View>
    </View>
  );
}

/**
 * The month view's months (rows of 3) and the year view's years (rows of 5), as
 * wide as a month: ghost buttons a week's gap apart, the shown one on
 * `primary`.
 */
function MonthOrYear(props: { kind: "month" | "year"; value: number }) {
  return (
    <View
      style={{
        width: (7 * cell) / (props.kind === "month" ? 3 : 5),
        minWidth: 0,
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
          ...rounded(cellRadius()),
        }}
      >
        <Text
          class="text-foreground group-aria-selected:text-primary-foreground"
          style={{ fontSize: controlSize.label }}
        >
          {props.kind === "month" ? MONTHS[props.value - 1].slice(0, 3) : String(props.value)}
        </Text>
      </View>
    </View>
  );
}

/**
 * The month and year toggles, which say "November 2026" between the arrows
 * (the open view's in the brand color): one month's are as wide as their words
 * and grow alike with the arrows (`grow`), the month's name at the end of its
 * share and the year at the start of its, so the two meet a word space apart
 * and the title is centered however wide the popup is. `months` over one
 * (each month's title) takes no press.
 */
function Toggle(props: CalendarItemProps & { kind: "monthToggle" | "yearToggle" }) {
  const words = heading(props);
  const title = props.kind === "monthToggle" && (props.months ?? 1) > 1;
  return (
    <Text
      class="text-foreground group-selected:text-brand"
      style={{
        minWidth: title ? 6 * cell + monthGap / 2 : undefined,
        paddingHorizontal: title ? 0 : 2,
        textAlign: title ? "center" : props.kind === "monthToggle" ? "right" : "left",
        fontSize: controlSize.label,
        fontWeight: font.weight("label"),
      }}
    >
      {words}
    </Text>
  );
}

/**
 * A day, as wide as its column (the calendar's columns share its width; a
 * column narrower than a cell, as on a narrow phone, narrows the square with
 * it), a week's gap over it. The band spans a range's middle days and reaches
 * from its ends' middles (a range of one day has none), rounded where a week
 * starts or ends. The square takes the quiet fill under the pointer and for
 * today, `primary` for the selected date and a range's ends (`aria-selected`,
 * which ranks over the hover; a range's middle days keep the band). A disabled
 * day takes no hover fill, unless it is today. The keyboard's day takes the
 * brand tint and edge; on the selected day only the
 * edge, over `primary`.
 */
function Day(props: { item: CalendarEntry; firstDayOfWeek?: number }) {
  const own = () => (props.item.outside ? "text-muted-foreground" : "text-foreground");
  // Read four times by the band's corners below, on every cell of a month: one conversion each.
  // Owned by this cell, so it goes when the cell does, and it follows the first day of the week.
  const column = computed(() =>
    props.item.date ? columnOf(props.item.date, props.firstDayOfWeek ?? 0) : -1,
  );
  return (
    <View style={{ minWidth: 0, paddingTop: weekGap }}>
      <View style={{ height: cell, alignItems: "center", justifyContent: "center" }}>
        <View
          class={
            `absolute inset-y-0 start-0 end-0 hidden ${quietFill} group-data-range-middle:flex group-data-range-start:start-1/2 group-data-range-start:flex ` +
            "group-data-range-end:end-1/2 group-data-range-end:flex group-data-range-start:group-data-range-end:hidden"
          }
          style={{
            borderTopStartRadius: column() === 0 ? cellRadius() : 0,
            borderBottomStartRadius: column() === 0 ? cellRadius() : 0,
            borderTopEndRadius: column() === 6 ? cellRadius() : 0,
            borderBottomEndRadius: column() === 6 ? cellRadius() : 0,
            ...cornerCurve,
          }}
        />
        <View
          class={
            `${props.item.today ? quietFill : "group-disabled:bg-transparent"} transition-colors duration-100 motion-reduce:transition-none ` +
            `group-hover:${quietFill} group-aria-selected:bg-primary group-focus-visible:border-brand/30 group-focus-visible:bg-brand-tint group-aria-selected:group-focus-visible:bg-primary group-data-range-middle:group-focus-visible:bg-brand-tint border border-transparent group-data-range-middle:bg-transparent`
          }
          style={{
            width: cell,
            maxWidth: "100%",
            height: cell,
            ...rounded(cellRadius()),
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
 * What a month, a year or a title says: each month's title in a calendar of
 * several ("November 2026"), else the month's name, else the number.
 */
function heading(props: CalendarItemProps) {
  return props.item.kind === "monthToggle" && (props.months ?? 1) > 1
    ? `${MONTHS[props.item.value - 1]} ${props.item.year}`
    : props.item.kind === "monthToggle"
      ? MONTHS[props.item.value - 1]
      : String(props.item.value);
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
 * muted at half opacity, and the keyboard's day in the brand tint and edge:
 * a list's highlight is the quiet fill, which a day already takes for today
 * and the hover, so the keys' day needs a mark of its own. What draws each kind
 * is a component of its own, below: `Arrow`, `Toggle`, `Weekday`,
 * `MonthOrYear` and `Day`; the terminal's labels are drawn here.
 */
export function CalendarItem(props: CalendarItemProps) {
  const kind = props.item.kind;
  if (terminal) {
    // The terminal's calendar draws its days, years and arrows itself, on its grid of two-Cell columns: the
    // labels are plain text at their own size (the painter bands the open view's toggle, from its state).
    if (kind === "weekday")
      return <Text style={{ color: colors.faint }}>{WEEKDAY_INITIALS[props.item.value]}</Text>;
    if (kind === "month") return <Text>{MONTHS[props.item.value - 1].slice(0, 3)}</Text>;
    return <Text style={{ fontWeight: font.weight("title") }}>{heading(props)}</Text>;
  }
  if (kind === "previous" || kind === "next")
    return <Arrow at={kind === "previous" ? "start" : "end"} />;
  if (kind === "monthToggle" || kind === "yearToggle") return <Toggle {...props} kind={kind} />;
  if (kind === "weekday") return <Weekday day={props.item.value} />;
  if (kind === "month" || kind === "year")
    return <MonthOrYear kind={kind} value={props.item.value} />;
  return <Day item={props.item} firstDayOfWeek={props.firstDayOfWeek} />;
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
  // A time segment's corner is its own small fixed geometry (a digit's mark inside the field's
  // well), not a theme tier.
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
        paddingEnd: 10,
        borderEndWidth: stroke.hairline,
        borderColor: colors.border,
      };
    // With a pointer a column of small ghost buttons beside the calendar, its first level with the header, parted
    // from the calendar by a hairline that holds in dark too.
    return pointer
      ? {
          gap: 2,
          paddingTop: 8,
          paddingEnd: 8,
          borderEndWidth: stroke.hairline,
          borderColor: alpha(colors.foreground, 0.1),
        }
      : { flexDirection: "row", flexWrap: "wrap", gap: 6 };
  },
  get preset() {
    // A ghost button beside the calendar: 28 points with a pointer or in the terminal, a phone's 34-point chip with
    // its hairline.
    if (terminal || pointer)
      return {
        height: 28,
        paddingHorizontal: terminal ? 8 : 10,
        ...rounded(shape.control),
        justifyContent: "center" as const,
        // No type role has this size: a preset's 13 in both tiers.
        fontSize: 13,
        color: colors.foreground,
      };
    return {
      height: 34,
      paddingHorizontal: 12,
      borderRadius: 17,
      borderWidth: stroke.hairline,
      borderColor: colors.border,
      justifyContent: "center" as const,
      // No type role has this size: a preset's 14 on a touch screen.
      fontSize: 14,
      color: colors.foreground,
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
        borderTopWidth: stroke.hairline,
        borderColor: colors.border,
        paddingHorizontal: 4,
      };
    // Under the calendar's last week, as far from the hairline as the calendar's padding is from the popup's edge.
    return {
      gap: 10,
      marginTop: pointer ? 6 : 12,
      paddingTop: 12,
      borderTopWidth: stroke.hairline,
      borderColor: alpha(colors.foreground, 0.1),
      ...(pointer ? { paddingHorizontal: 6, paddingBottom: 6 } : {}),
    };
  },
  get separator() {
    // Tight to the digits, as a time input's: the segments' padding is the room on each side.
    return terminal
      ? { color: colors.faint, fontSize: controlSize.label }
      : { color: colors.mutedForeground, fontSize: controlSize.label, marginHorizontal: -1 };
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

/** A day as the calendar hands it over (`onSelect`, `renderItem`), from `nsh/base`. */
export type { CalendarEntry };
