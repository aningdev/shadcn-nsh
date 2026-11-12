// A date picker: the look (`DateTrigger`, `datePickerLook`) and `DatePicker` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { terminal } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { context, signal, split, View } from "nsh";
import {
  DatePicker as BaseDatePicker,
  type CalendarEntry,
  type DatePickerProps as BaseDatePickerProps,
  type DatePickerValue,
  type OpenChangeReason,
} from "nsh/base";

import { CalendarItem, calendarLook, TimeSegment } from "./calendar";
import { listboxPopup } from "./lib/listbox";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/open-state";
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

/** The root: it owns the open flag and the value its parts show. */
export type DatePickerProps = {
  /** The value (controlled); leave it out and the root keeps it (`defaultValue`). */
  value?: DatePickerValue;
  defaultValue?: DatePickerValue;
  /** Controlled; leave it out and the root keeps the state (`defaultOpen`). */
  open?: boolean | null;
  defaultOpen?: boolean;
  /** It does not open, and the trigger takes the disabled look. */
  disabled?: boolean;
  /** A clear button while there is a value. */
  cleanable?: boolean;
  /** The trigger's words while there is no value (default "Pick a date"). */
  placeholder?: string;
  children?: JSX.Element;
  onChange?: (event: { value: DatePickerValue }) => void;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The calendar's popup. Every prop of `nsh/base`'s DatePicker passes through but the ones the
 * root owns; `datePickerLook` fills the popup, the scrim, the calendar and the time's row by
 * default. Its parts are the `DatePickerTrigger` above it.
 */
export type DatePickerContentProps = Omit<
  BaseDatePickerProps,
  | "value"
  | "defaultValue"
  | "open"
  | "defaultOpen"
  | "disabled"
  | "cleanable"
  | "trigger"
  | "onChange"
  | "onOpenChange"
  | "onOpen"
  | "onClose"
  | "onCancel"
  | "children"
> & {
  children?: JSX.Element;
};

/** The pressed field: a `DateTrigger` (a calendar, the value or the placeholder, no chevron). */
export type DatePickerTriggerProps = {
  /** What it says instead of the value (default: the value, else the root's `placeholder`). */
  title?: string;
  /** Draw the title as a placeholder (muted), whatever the value. */
  placeholder?: boolean;
  /** Edged in the danger tone. */
  invalid?: boolean;
  /** The app's own clear button lies over the end: room for it (default: the root's `cleanable`). */
  clearable?: boolean;
  style?: ViewStyle;
};

type DatePickerContextValue = OpenState & {
  trigger: Slot;
  value: () => DatePickerValue;
  change: (event: { value: DatePickerValue }) => void;
  root: DatePickerProps;
};

const DatePickerContext = context<DatePickerContextValue | null>(null);

function useDatePicker() {
  const ctx = DatePickerContext();
  if (!ctx) throw new Error("DatePicker parts must be used within <DatePicker>");
  return ctx;
}

/** The trigger's words: a date as it is (the time space-separated), a range's two ends, else the placeholder. */
function titleOf(ctx: DatePickerContextValue): string {
  const value = ctx.value();
  if (typeof value === "string") return value.replace("T", " ");
  if (Array.isArray(value)) return `${value[0] ?? "…"} – ${value[1] ?? "…"}`;
  return ctx.root.placeholder ?? "Pick a date";
}

/** The trigger the base root draws: the app's `DatePickerTrigger`, or a `DateTrigger` of the value. */
function triggerOf(ctx: DatePickerContextValue): JSX.Element {
  const build = ctx.trigger.get();
  if (build) return build() as JSX.Element;
  return (
    <DateTrigger
      title={titleOf(ctx)}
      placeholder={ctx.value() == null}
      open={ctx.open()}
      disabled={ctx.root.disabled}
      clearable={ctx.root.cleanable}
    />
  );
}

/** The root of a date picker's parts. Put `DatePickerTrigger` before `DatePickerContent`. */
export function DatePicker(props: DatePickerProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const trigger = createSlot();
  const picked = signal(false);
  const chosen = signal<DatePickerValue>(null);
  const value = () => {
    if (props.value !== undefined) return props.value ?? null;
    if (picked()) return chosen();
    return props.defaultValue ?? null;
  };
  const change = (event: { value: DatePickerValue }) => {
    if (props.value === undefined) {
      picked.set(true);
      chosen.set(event.value);
    }
    props.onChange?.(event);
  };
  const ctx: DatePickerContextValue = {
    ...state,
    trigger,
    value,
    change,
    root: props,
  };
  return <DatePickerContext.Provider value={ctx}>{props.children}</DatePickerContext.Provider>;
}

/** The pressed field: a `DateTrigger` that follows the root's open state, value and `disabled`. */
export function DatePickerTrigger(props: DatePickerTriggerProps) {
  const ctx = useDatePicker();
  ctx.trigger.set(() => (
    <DateTrigger
      title={props.title ?? titleOf(ctx)}
      placeholder={props.placeholder ?? ctx.value() == null}
      open={ctx.open()}
      disabled={ctx.root.disabled}
      invalid={props.invalid}
      clearable={props.clearable ?? ctx.root.cleanable}
      style={props.style}
    />
  ));
  return null;
}

/** The calendar in its popup, opened by the `DatePickerTrigger` above it. */
export function DatePickerContent(props: DatePickerContentProps) {
  const ctx = useDatePicker();
  const [, rest] = split(props, [
    "children",
    "numberOfMonths",
    "firstDayOfWeek",
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
  ]);
  return (
    <View>
      {props.children}
      {() => {
        const look = datePickerLook({
          months: () => props.numberOfMonths ?? 1,
          firstDayOfWeek: () => props.firstDayOfWeek ?? 0,
        });
        return (
          <BaseDatePicker
            {...rest}
            value={ctx.value()}
            open={ctx.open()}
            disabled={ctx.root.disabled}
            cleanable={ctx.root.cleanable}
            trigger={triggerOf(ctx)}
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
            onChange={ctx.change}
            onOpenChange={({ open, reason }) => ctx.setOpen(open, reason)}
            onOpen={ctx.root.onOpen}
            onClose={ctx.root.onClose}
            onCancel={ctx.root.onCancel}
          />
        );
      }}
    </View>
  );
}
