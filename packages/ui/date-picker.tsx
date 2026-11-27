// A date picker: `DatePicker` and its parts. `datePickerLook` is private.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { terminal } from "@shadcn-nsh/theme";
import { Calendar } from "lucide";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { context, platform, signal, split, View } from "nsh";
import {
  DatePicker as BaseDatePicker,
  type CalendarEntry,
  type DatePickerProps as BaseDatePickerProps,
  type DatePickerValue,
  type OpenChangeReason,
} from "nsh/base";

import { CalendarItem, calendarLook, TimeSegment } from "./calendar";
import { timeFieldClass } from "./lib/field-look";
import { clearButtonLook, listboxPopup, listboxPopupStarting } from "./lib/listbox";
import { backdrop } from "./lib/popup";
import { createOpenState, createSlot, type OpenState, type Slot } from "./lib/state";
import { type Live, read } from "./lib/utils";
import { Picker, type PickerProps } from "./select";

/** A day as the date picker hands it over: `nsh/base`'s `CalendarEntry`, under this part's name. */
export type DatePickerEntry = CalendarEntry;

/** A chosen day, or `null` for none (`value`, `onChange`), from `nsh/base`. */
export type { DatePickerValue };

/** Why the date picker's list closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type DatePickerOpenChangeReason = OpenChangeReason;

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
  onOpenChange?: (event: { open: boolean; reason: DatePickerOpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The calendar's popup. Every prop of `nsh/base`'s DatePicker passes through but the ones the
 * root owns; `datePickerLook` fills the popup, the scrim, the calendar and the time's row by
 * default. The `DatePickerTrigger` above it opens it.
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
  /** The trigger's own style, over the look's. */
  style?: StyleProp<ViewStyle>;
  /** The id UI tests find the trigger by. */
  testID?: string;
  /** What screen readers call it (the value or the placeholder by default). */
  accessibilityLabel?: string;
};

/** The root of a date picker's parts. Put `DatePickerTrigger` before `DatePickerContent`. */
export function DatePicker(props: DatePickerProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const trigger = createSlot<JSX.Element>();
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
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the field without building it again —
  // not a thunk the field would call on every layout.
  ctx.trigger.set(
    <DateTrigger
      title={props.title ?? titleOf(ctx)}
      placeholder={props.placeholder ?? ctx.value() == null}
      open={ctx.open()}
      disabled={ctx.root.disabled}
      invalid={props.invalid}
      clearable={props.clearable ?? (ctx.root.cleanable && ctx.value() != null)}
      style={props.style}
      testID={props.testID}
      accessibilityLabel={props.accessibilityLabel}
    />,
  );
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
    "clearButtonClass",
    "clearButtonStyle",
    "clearButton",
  ]);
  return (
    <View>
      {props.children}
      {() => {
        const look = datePickerLook({
          months: () => props.numberOfMonths ?? 1,
          firstDayOfWeek: () => props.firstDayOfWeek ?? 0,
        });
        // The clear button of a cleanable trigger: over its end, where the chevron would be.
        const clear = clearButtonLook({ over: true });
        return (
          <BaseDatePicker
            {...rest}
            value={ctx.value()}
            open={ctx.open()}
            disabled={ctx.root.disabled}
            cleanable={ctx.root.cleanable}
            clearButtonClass={props.clearButtonClass ?? clear.clearButtonClass}
            clearButtonStyle={props.clearButtonStyle ?? clear.clearButtonStyle}
            clearButton={props.clearButton ?? clear.clearButton}
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

/**
 * A date picker's trigger (`DatePicker`'s `trigger`), shadcn's, under every theme: `Picker`
 * led by a calendar in the muted color, the value in the text color or a
 * muted placeholder, and no chevron (a clear button goes over the end while
 * it has a value, `clearable`).
 */
export function DateTrigger(props: Omit<PickerProps, "icon" | "chevron" | "lead">) {
  // The calendar and the missing chevron are the trigger's own: every other prop is `Picker`'s.
  return <Picker {...props} icon={Calendar} chevron={false} />;
}

// Private helpers

type DatePickerContextValue = OpenState & {
  trigger: Slot<JSX.Element>;
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
  const trigger = ctx.trigger.get();
  if (trigger) return trigger;
  return (
    <DateTrigger
      title={titleOf(ctx)}
      placeholder={ctx.value() == null}
      open={ctx.open()}
      disabled={ctx.root.disabled}
      // The clear button shows only while a value is chosen.
      clearable={ctx.root.cleanable && ctx.value() != null}
    />
  );
}

// Private helpers & looks

/** The room around the calendar in its popup (6 with a pointer) or sheet (10 on a touch screen): a
 * calendar's grid, not a list's rows, so not `listPadding`. */
const calendarRoom = platform.desktop ? 6 : 10;

/** Options of `datePickerLook`. */
interface DatePickerLookOptions {
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
function datePickerLook(o?: DatePickerLookOptions) {
  return {
    offset: 4,
    margin: 8,
    get popupStyle() {
      return listboxPopup({ padding: calendarRoom });
    },
    get popupStartingStyle() {
      return listboxPopupStarting();
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
    bodyStyle: datePickerBodyStyle(),
    itemClass: calendarLook.itemClass,
    renderItem: (item: CalendarEntry) => (
      <CalendarItem item={item} months={read(o?.months)} firstDayOfWeek={read(o?.firstDayOfWeek)} />
    ),
    get timeStyle() {
      return calendarLook.time;
    },
    get timeFieldClass(): string {
      return timeFieldClass();
    },
    segmentClass: calendarLook.segmentClass,
    get separatorStyle() {
      return calendarLook.separator;
    },
    renderSegment: (segment: { label: string }) => <TimeSegment label={segment.label} />,
  };
}

// Terminal

/** The gap between months. A terminal calendar has no extra gap between its rows. */
function datePickerBodyStyle(): ViewStyle | undefined {
  return terminal ? undefined : { gap: calendarLook.monthGap };
}
