// Source: examples/nsh-gallery-ui/look/listbox.tsx (datePickerLook, picker trigger) @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, popupBackdrop, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, context, signal, Text, View } from "nsh";
import {
  DatePicker as BaseDatePicker,
  type CalendarEntry,
  type DateMatcher,
  type DatePickerProps as BaseDatePickerProps,
  type DatePickerValue as PickedDate,
  type DateRangePreset,
  type HourCycle,
  type OpenChangeReason,
  type TimeFieldSegmentEntry,
  type TimePrecision,
} from "nsh/base";

import { calendarChrome, CalendarItem, timeFieldChrome, TimeSegment } from "./lib/dates";
import { isPointer, touchHitSlop } from "./lib/density";
import { fieldFocusStyle } from "./lib/field";
import {
  clearButtonLook,
  listboxClearInset,
  listboxMargin,
  listboxMetrics,
  listboxOffset,
  listboxPopup,
  ListboxChevron,
} from "./lib/listbox";
import { createOpenState, createSlot, type Slot } from "./lib/open-state";
import { pressSink } from "./lib/press";

/** A preset button's label and the value it sets. Base's `DateRangePreset`. */
export type { DateRangePreset };

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

/** Wrapper default, then consumer: both set, both apply. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

type TriggerState = {
  open: () => boolean;
  disabled: () => boolean;
  clearable: () => boolean;
};

type TriggerLook = {
  style: ViewStyle;
  hoverStyle?: ViewStyle;
  focusStyle: ViewStyle;
  activeStyle: ViewStyle;
  disabledStyle: ViewStyle;
  hitSlop?: number;
};

/**
 * The same raised row as Select. `secondary` plus `finish.control.rest` stands in for the
 * reference's raised fill. The open edge is `muted-foreground`, focus is the field's 2-point
 * ring, press is `pressSink` (not a 70% fade), and disabled is the theme's 0.5.
 */
function look(state: TriggerState): TriggerLook {
  const sink = pressSink(
    0.97,
    "background-color, border-color, box-shadow, outline-color, opacity",
  );
  return {
    get style(): ViewStyle {
      const m = listboxMetrics();
      const clearable = state.clearable();
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minHeight: m.line,
        ...(isPointer() ? { minWidth: 180, flexShrink: 1 } : { flex: 1 }),
        paddingLeft: 10,
        paddingRight: clearable ? listboxClearInset() + m.clear + 8 : 10,
        borderRadius: radius.control,
        borderCurve: "continuous",
        borderWidth: 1,
        backgroundColor: colors.secondary,
        borderColor: state.open() ? colors.mutedForeground : colors.border,
        boxShadow: finish.control.rest,
        outlineStyle: "solid",
        outlineWidth: 2,
        outlineOffset: -1,
        outlineColor: "transparent",
        opacity: disabledOpacity(state.disabled()),
        ...sink.transition,
      };
    },
    get hoverStyle() {
      if (state.disabled()) return undefined;
      return { borderColor: colors.mutedForeground };
    },
    focusStyle: fieldFocusStyle(),
    activeStyle: sink.activeStyle,
    disabledStyle: { opacity: disabledOpacity() },
    hitSlop: touchHitSlop(listboxMetrics().line),
  };
}

/**
 * Trigger chrome for the current idiom. Geometry only: the gallery's touch test reads
 * `minHeight` and `minWidth`. Call it inside `computed` so tokens follow the scheme.
 */
export function datePickerVariants(options?: {
  open?: boolean;
  disabled?: boolean;
  clearable?: boolean;
}): TriggerLook {
  return look({
    open: () => !!options?.open,
    disabled: () => !!options?.disabled,
    clearable: () => !!options?.clearable,
  });
}

/**
 * Popup chrome the gallery touch test reads. Pointer is `popup|6|none`; a touch screen is the
 * bottom sheet `sheet|20|20|70%|10|34`.
 */
export function datePickerPopupChrome(): string {
  const popup = listboxPopup();
  if (isPointer()) return `popup|${popup.padding}|${popup.maxHeight ?? "none"}`;
  return `sheet|${popup.borderTopLeftRadius}|${popup.borderTopRightRadius}|${popup.maxHeight}|${popup.paddingTop}|${popup.paddingBottom}`;
}

/**
 * Composition root for `nsh/base` DatePicker. The trigger is `DatePickerTrigger`, not a
 * `trigger` prop. `placeholder` is this library's; base has no such flag.
 */
export type DatePickerProps = {
  value?: PickedDate;
  defaultValue?: PickedDate;
  /** Shown by `DatePickerValue` while nothing is chosen. */
  placeholder?: string;
  range?: boolean;
  open?: boolean | null;
  defaultOpen?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  dateFormat?: string | null;
  timePrecision?: TimePrecision | null;
  hourCycle?: HourCycle;
  defaultTime?: string | null;
  cleanable?: boolean;
  presets?: DateRangePreset[];
  numberOfMonths?: number;
  firstDayOfWeek?: number;
  disabledMatcher?: DateMatcher | null;
  yearRange?: [number, number] | null;
  previousAccessibilityLabel?: string | null;
  nextAccessibilityLabel?: string | null;
  placement?: BaseDatePickerProps["placement"];
  align?: BaseDatePickerProps["align"];
  popupClass?: string | null;
  popupStyle?: StyleProp<ViewStyle>;
  backdropClass?: string | null;
  backdropStyle?: StyleProp<ViewStyle>;
  contentClass?: string | null;
  contentStyle?: StyleProp<ViewStyle>;
  presetsClass?: string | null;
  presetsStyle?: StyleProp<ViewStyle>;
  presetClass?: string | null;
  presetStyle?: BaseDatePickerProps["presetStyle"];
  calendarClass?: string | null;
  calendarStyle?: StyleProp<ViewStyle>;
  headerClass?: string | null;
  headerStyle?: StyleProp<ViewStyle>;
  bodyClass?: string | null;
  bodyStyle?: StyleProp<ViewStyle>;
  monthClass?: string | null;
  monthStyle?: StyleProp<ViewStyle>;
  rowClass?: string | null;
  rowStyle?: StyleProp<ViewStyle>;
  itemClass?: string | null;
  itemStyle?: BaseDatePickerProps["itemStyle"];
  renderItem?: (value: CalendarEntry) => JSX.Element;
  timeClass?: string | null;
  timeStyle?: StyleProp<ViewStyle>;
  timeLabel?: JSX.Element;
  timeFieldClass?: string | null;
  timeFieldStyle?: StyleProp<ViewStyle>;
  timeAccessibilityLabel?: string | null;
  segmentClass?: string | null;
  segmentStyle?: BaseDatePickerProps["segmentStyle"];
  separatorClass?: string | null;
  separatorStyle?: BaseDatePickerProps["separatorStyle"];
  renderSegment?: (value: TimeFieldSegmentEntry) => JSX.Element;
  clearButtonClass?: string | null;
  clearButtonStyle?: StyleProp<ViewStyle>;
  clearButton?: JSX.Element;
  clearButtonAccessibilityLabel?: string | null;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  children?: JSX.Element;
  onChange?: (event: { value: PickedDate }) => void;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

type DatePickerTriggerProps = {
  /** A string replaces the value label. Any other child is rendered as the label. */
  children?: string | JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  focusStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  hitSlop?: number;
  testID?: string;
};

type DatePickerContextValue = {
  trigger: Slot;
  open: () => boolean;
  setOpen: (next: boolean, reason?: string) => void;
  value: () => PickedDate;
  placeholder: () => string;
  disabled: () => boolean;
  cleanable: () => boolean;
  root: DatePickerProps;
  change: (event: { value: PickedDate }) => void;
};

const DatePickerContext = context<DatePickerContextValue | null>(null);

function useDatePicker() {
  const ctx = DatePickerContext();
  if (!ctx) throw new Error("DatePicker parts must be used within <DatePicker>");
  return ctx;
}

function formatValue(value: PickedDate): string {
  if (value == null) return "";
  if (typeof value === "string") return value.replace("T", " ");
  const start = value[0] ?? "…";
  const end = value[1] ?? "…";
  return `${start} – ${end}`;
}

function triggerView(ctx: DatePickerContextValue, props: DatePickerTriggerProps) {
  const chrome = look({
    open: ctx.open,
    disabled: ctx.disabled,
    clearable: ctx.cleanable,
  });
  const label =
    props.children == null ? (
      <DatePickerValue />
    ) : typeof props.children === "string" ? (
      <Text
        style={{
          fontSize: listboxMetrics().label,
          color: colors.foreground,
          numberOfLines: 1,
        }}
      >
        {props.children}
      </Text>
    ) : (
      props.children
    );
  return (
    <View
      testID={props.testID}
      hitSlop={props.hitSlop ?? chrome.hitSlop}
      class={props.class ?? undefined}
      style={mergeStyle(chrome.style, props.style)}
      hoverStyle={
        chrome.hoverStyle != null
          ? mergeStyle(chrome.hoverStyle, props.hoverStyle)
          : props.hoverStyle
      }
      focusStyle={mergeStyle(chrome.focusStyle, props.focusStyle)}
      activeStyle={mergeStyle(chrome.activeStyle, props.activeStyle)}
      disabledStyle={mergeStyle(chrome.disabledStyle, props.disabledStyle)}
    >
      <View style={{ flex: 1, minWidth: 0 }}>{label}</View>
      <ListboxChevron open={ctx.open} hidden={ctx.cleanable} />
    </View>
  );
}

/** Root. Holds the open flag and the value mirror. Put `DatePickerTrigger` inside. */
export function DatePicker(props: DatePickerProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const trigger = createSlot();
  const picked = signal(false);
  const chosen = signal<PickedDate>(null);
  const value = () => {
    if (props.value !== undefined) return props.value ?? null;
    if (picked()) return chosen();
    return props.defaultValue ?? null;
  };
  const change = (event: { value: PickedDate }) => {
    if (props.value === undefined) {
      picked.set(true);
      chosen.set(event.value);
    }
    props.onChange?.(event);
  };
  const ctx: DatePickerContextValue = {
    trigger,
    open: state.open,
    setOpen: state.setOpen,
    value,
    placeholder: () => props.placeholder ?? "Pick a date",
    disabled: () => !!props.disabled,
    cleanable: () => !!props.cleanable,
    root: props,
    change,
  };
  return (
    <DatePickerContext.Provider value={ctx}>
      {props.children}
      <DatePickerPopup />
    </DatePickerContext.Provider>
  );
}

/** The pressed row. Children replace the value; the chevron is ours. */
export function DatePickerTrigger(props: DatePickerTriggerProps) {
  const ctx = useDatePicker();
  ctx.trigger.set(() => triggerView(ctx, props));
  return <View style={{ width: 0, height: 0 }} />;
}

/** The chosen date, or a placeholder. Reads the root's value, including an uncontrolled one. */
export function DatePickerValue(props: { placeholder?: string }) {
  const ctx = useDatePicker();
  const shown = () => {
    const text = formatValue(ctx.value());
    return text || (props.placeholder ?? ctx.placeholder());
  };
  return (
    <Text
      style={{
        fontSize: listboxMetrics().label,
        get color() {
          return formatValue(ctx.value()) ? colors.foreground : colors.mutedForeground;
        },
        numberOfLines: 1,
      }}
    >
      {shown()}
    </Text>
  );
}

/** Mounts base DatePicker once the trigger slot is filled. */
function DatePickerPopup() {
  const ctx = useDatePicker();
  const root = ctx.root;
  const triggerAccessor = ctx.trigger.get();
  const months = root.numberOfMonths ?? 1;
  const chrome = computed(() => calendarChrome(months));
  const time = computed(() => timeFieldChrome());
  const clear = clearButtonLook(true);
  const timeLabel = (
    <Text style={{ fontSize: listboxMetrics().label, color: colors.foreground }}>Time</Text>
  );
  return (
    <BaseDatePicker
      value={ctx.value()}
      range={root.range}
      open={ctx.open()}
      disabled={ctx.disabled()}
      accessibilityLabel={root.accessibilityLabel}
      dateFormat={root.dateFormat}
      timePrecision={root.timePrecision}
      hourCycle={root.hourCycle}
      defaultTime={root.defaultTime}
      cleanable={root.cleanable}
      presets={root.presets}
      numberOfMonths={root.numberOfMonths}
      firstDayOfWeek={root.firstDayOfWeek}
      disabledMatcher={root.disabledMatcher}
      yearRange={root.yearRange}
      previousAccessibilityLabel={
        root.previousAccessibilityLabel === undefined
          ? "Previous month"
          : root.previousAccessibilityLabel
      }
      nextAccessibilityLabel={
        root.nextAccessibilityLabel === undefined ? "Next month" : root.nextAccessibilityLabel
      }
      placement={root.placement}
      align={root.align}
      offset={listboxOffset}
      margin={listboxMargin}
      class={root.class ?? undefined}
      style={root.style}
      trigger={(triggerAccessor?.() as JSX.Element) ?? triggerView(ctx, {})}
      popupClass={root.popupClass}
      popupStyle={mergeStyle(
        listboxPopup(isPointer() ? { minWidth: 180 } : undefined),
        root.popupStyle,
      )}
      backdropClass={root.backdropClass}
      backdropStyle={mergeStyle(popupBackdrop(), root.backdropStyle)}
      contentStyle={mergeStyle(chrome().contentStyle, root.contentStyle)}
      contentClass={root.contentClass}
      presetsClass={root.presetsClass}
      presetsStyle={mergeStyle(chrome().presetsStyle, root.presetsStyle)}
      presetClass={mergeClass(chrome().presetClass, root.presetClass)}
      presetStyle={mergeStyle(chrome().presetStyle, root.presetStyle)}
      calendarClass={root.calendarClass}
      calendarStyle={mergeStyle(chrome().calendarStyle, root.calendarStyle)}
      headerClass={root.headerClass}
      headerStyle={mergeStyle(chrome().headerStyle, root.headerStyle)}
      bodyClass={root.bodyClass}
      bodyStyle={
        chrome().bodyStyle != null ? mergeStyle(chrome().bodyStyle, root.bodyStyle) : root.bodyStyle
      }
      monthClass={root.monthClass}
      monthStyle={root.monthStyle}
      rowClass={root.rowClass}
      rowStyle={root.rowStyle}
      itemClass={mergeClass(chrome().itemClass, root.itemClass)}
      itemStyle={root.itemStyle}
      renderItem={
        root.renderItem === undefined
          ? (item) => <CalendarItem item={item} months={months} />
          : root.renderItem
      }
      timeClass={root.timeClass}
      timeStyle={mergeStyle(chrome().timeStyle, root.timeStyle)}
      timeLabel={root.timeLabel === undefined ? timeLabel : root.timeLabel}
      timeFieldClass={mergeClass(time().className, root.timeFieldClass)}
      timeFieldStyle={mergeStyle(time().style, root.timeFieldStyle)}
      timeAccessibilityLabel={root.timeAccessibilityLabel}
      segmentClass={mergeClass(time().segmentClass, root.segmentClass)}
      segmentStyle={mergeStyle(time().segmentStyle, root.segmentStyle)}
      separatorClass={root.separatorClass}
      separatorStyle={mergeStyle(time().separatorStyle, root.separatorStyle)}
      renderSegment={
        root.renderSegment === undefined
          ? (entry) => <TimeSegment entry={entry} />
          : root.renderSegment
      }
      clearButtonClass={mergeClass(clear.clearButtonClass, root.clearButtonClass)}
      clearButtonStyle={mergeStyle(clear.clearButtonStyle, root.clearButtonStyle)}
      clearButton={root.clearButton === undefined ? clear.clearButton : root.clearButton}
      clearButtonAccessibilityLabel={
        root.clearButtonAccessibilityLabel === undefined
          ? "Clear date"
          : root.clearButtonAccessibilityLabel
      }
      onChange={ctx.change}
      onOpenChange={(event) => ctx.setOpen(event.open, event.reason)}
      onOpen={root.onOpen}
      onClose={root.onClose}
      onCancel={root.onCancel}
    />
  );
}
