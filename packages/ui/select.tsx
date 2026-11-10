// Source: examples/nsh-gallery-ui/look/listbox.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, popupBackdrop, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { cleanup, computed, context, signal, Text, View, type Signal } from "nsh";
import {
  Select as BaseSelect,
  type OpenChangeReason,
  type SelectEntry,
  type SelectItem as SelectItemData,
} from "nsh/base";

import { isPointer, touchHitSlop } from "./lib/density";
import { fieldFocusStyle } from "./lib/field";
import {
  clearButtonLook,
  listboxClearInset,
  listboxMargin,
  listboxMetrics,
  listboxOffset,
  listboxPopup,
  listboxSearch,
  ListboxChevron,
  ListboxEmpty,
  ListboxHeader,
  optionClass,
  OptionRow,
} from "./lib/listbox";
import {
  createItemRegistry,
  createOpenState,
  createSlot,
  type ItemRegistry,
  type Slot,
} from "./lib/open-state";
import { pressSink } from "./lib/press";

export type { SelectItemData, SelectEntry };

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<T extends ViewStyle>(
  base?: StyleProp<T> | null,
  consumer?: StyleProp<T> | null,
): StyleProp<T> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

type PickerState = {
  open: () => boolean;
  invalid: () => boolean;
  disabled: () => boolean;
  clearable: () => boolean;
};

type PickerLook = {
  style: ViewStyle;
  hoverStyle?: ViewStyle;
  focusStyle: ViewStyle;
  activeStyle: ViewStyle;
  disabledStyle: ViewStyle;
  hitSlop?: number;
  rowMinHeight: number;
};

/**
 * Raised picker row. `secondary` plus `finish.control.rest` stands in for the reference's
 * `raised` (this theme has no raised fill). The open edge is `muted-foreground` (its faint),
 * danger is `destructive`, focus is the field's 2-point ring. Press is `pressSink`, not a
 * 70% fade. Disabled is the theme's 0.5.
 */
function look(state: PickerState): PickerLook {
  const sink = pressSink(
    0.97,
    "background-color, border-color, box-shadow, outline-color, opacity",
  );
  return {
    get style(): ViewStyle {
      const m = listboxMetrics();
      const clearable = state.clearable();
      const invalid = state.invalid();
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
        borderColor: invalid
          ? colors.destructive
          : state.open()
            ? colors.mutedForeground
            : colors.border,
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
      if (state.disabled() || state.invalid()) return undefined;
      return { borderColor: colors.mutedForeground };
    },
    get focusStyle() {
      return fieldFocusStyle(state.invalid());
    },
    get activeStyle() {
      return sink.activeStyle;
    },
    disabledStyle: { opacity: disabledOpacity() },
    get hitSlop() {
      return touchHitSlop(listboxMetrics().line);
    },
    get rowMinHeight() {
      return listboxMetrics().row;
    },
  };
}

/**
 * The picker's chrome. Geometry only: the gallery's touch test reads `minHeight` and `minWidth`.
 */
export function selectVariants(options?: {
  open?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  clearable?: boolean;
}): PickerLook {
  return look({
    open: () => !!options?.open,
    invalid: () => !!options?.invalid,
    disabled: () => !!options?.disabled,
    clearable: () => !!options?.clearable,
  });
}

/**
 * Popup chrome the gallery touch test reads. Pointer is `popup|6|none`; a touch screen is the
 * bottom sheet `sheet|20|20|70%|10|34`.
 */
export function selectPopupChrome(): string {
  const popup = listboxPopup();
  if (isPointer()) return `popup|${popup.padding}|${popup.maxHeight ?? "none"}`;
  return `sheet|${popup.borderTopLeftRadius}|${popup.borderTopRightRadius}|${popup.maxHeight}|${popup.paddingTop}|${popup.paddingBottom}`;
}

/** Composition root for `nsh/base` Select. `invalid` is this library's; base has no such flag. */
export type SelectProps = {
  value?: string | null;
  defaultValue?: string | null;
  open?: boolean | null;
  defaultOpen?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string | null;
  cleanable?: boolean;
  disabled?: boolean;
  /** Danger edge. Not a base prop. */
  invalid?: boolean;
  placeholder?: string;
  accessibilityLabel?: string | null;
  empty?: JSX.Element;
  children?: JSX.Element;
  /**
   * Popup chrome over the shared surface. Base Select has no `popupStarting*` / `popupEnding*`
   * hooks, so there is no entrance to set. On a touch screen the popup is base's sheet; the
   * sheet's top radius and cap are `listboxPopup`.
   */
  popupClass?: string | null;
  popupStyle?: StyleProp<ViewStyle>;
  /** Touch screens: the backdrop behind the sheet. */
  backdropClass?: string | null;
  backdropStyle?: StyleProp<ViewStyle>;
  onChange?: (event: { value: string | null }) => void;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
};

type SelectTriggerProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  focusStyle?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  hitSlop?: number;
  testID?: string;
};

type SelectContextValue = {
  items: ItemRegistry<SelectItemData>;
  trigger: Slot;
  open: () => boolean;
  setOpen: (next: boolean, reason?: string) => void;
  value: () => string | null;
  change: (event: { value: string | null }) => void;
  placeholder: () => string;
  disabled: () => boolean;
  invalid: () => boolean;
  cleanable: () => boolean;
  root: SelectProps;
};

const SelectContext = context<SelectContextValue | null>(null);
const SelectGroupContext = context<Signal<string | undefined> | null>(null);

function useSelect() {
  const ctx = SelectContext();
  if (!ctx) throw new Error("Select parts must be used within <Select>");
  return ctx;
}

function triggerView(ctx: SelectContextValue, props: SelectTriggerProps) {
  const chrome = look({
    open: ctx.open,
    invalid: ctx.invalid,
    disabled: ctx.disabled,
    clearable: ctx.cleanable,
  });
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
      <View style={{ flex: 1, minWidth: 0 }}>{props.children ?? <SelectValue />}</View>
      <ListboxChevron open={ctx.open} hidden={ctx.cleanable} />
    </View>
  );
}

/** Root. Holds the open flag, the value mirror and the item registry. Put Trigger before Content. */
export function Select(props: SelectProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const items = createItemRegistry<SelectItemData>([]);
  const trigger = createSlot();
  const picked = signal(false);
  const chosen = signal<string | null>(null);
  const value = () => {
    if (props.value !== undefined) return props.value ?? null;
    if (picked()) return chosen();
    return props.defaultValue ?? null;
  };
  const change = (event: { value: string | null }) => {
    if (props.value === undefined) {
      picked.set(true);
      chosen.set(event.value);
    }
    props.onChange?.(event);
  };
  const ctx: SelectContextValue = {
    items,
    trigger,
    open: state.open,
    setOpen: state.setOpen,
    value,
    change,
    placeholder: () => props.placeholder ?? "Select…",
    disabled: () => !!props.disabled,
    invalid: () => !!props.invalid,
    cleanable: () => !!props.cleanable,
    root: props,
  };
  return <SelectContext.Provider value={ctx}>{props.children}</SelectContext.Provider>;
}

/** The pressed row. Children are the value; the chevron is ours. */
export function SelectTrigger(props: SelectTriggerProps) {
  const ctx = useSelect();
  ctx.trigger.set(() => triggerView(ctx, props));
  return <View style={{ width: 0, height: 0 }} />;
}

/** The chosen title, or a placeholder. Reads the root's value, including an uncontrolled one. */
export function SelectValue(props: { placeholder?: string }) {
  const ctx = useSelect();
  // Read in the tree, not before it: the items register as Content's children, after a
  // body read would have snapshotted an empty list and left the placeholder up.
  const shown = () => {
    const value = ctx.value();
    if (value == null) return props.placeholder ?? ctx.placeholder();
    return ctx.items.items().find((item) => item.value === value)?.title ?? value;
  };
  return (
    <Text
      style={{
        fontSize: listboxMetrics().label,
        get color() {
          return ctx.value() == null ? colors.mutedForeground : colors.foreground;
        },
        numberOfLines: 1,
      }}
    >
      {shown()}
    </Text>
  );
}

/** Mounts base Select. Popup props stay on the root; this part is where the list is built. */
export function SelectContent(props: { children?: JSX.Element }) {
  const ctx = useSelect();
  const root = ctx.root;
  const triggerAccessor = ctx.trigger.get();
  const clear = clearButtonLook(true);
  // `fieldWell` copies token strings. A computed read in JSX rebuilds them when the scheme changes;
  // a plain object decoded once stays the scheme the popup first opened in.
  const search = computed(listboxSearch);
  return (
    <View>
      {props.children}
      <BaseSelect
        items={ctx.items.items()}
        value={ctx.value()}
        open={ctx.open()}
        searchable={root.searchable}
        searchPlaceholder={root.searchPlaceholder}
        cleanable={root.cleanable}
        disabled={ctx.disabled()}
        accessibilityLabel={root.accessibilityLabel}
        offset={listboxOffset}
        margin={listboxMargin}
        trigger={(triggerAccessor?.() as JSX.Element) ?? triggerView(ctx, {})}
        empty={root.empty ?? <ListboxEmpty />}
        popupClass={root.popupClass}
        popupStyle={mergeStyle(
          listboxPopup(isPointer() ? { minWidth: 180 } : undefined),
          root.popupStyle,
        )}
        backdropClass={root.backdropClass}
        backdropStyle={mergeStyle(popupBackdrop(), root.backdropStyle)}
        listStyle={isPointer() ? { maxHeight: 240 } : undefined}
        itemClass={optionClass}
        itemStyle={{ fontSize: 14, color: colors.foreground, borderRadius: radius.control }}
        renderItem={(item) => <OptionRow item={item} />}
        renderGroup={(group) => <ListboxHeader group={group} />}
        searchClass={search().searchClass}
        searchStyle={search().searchStyle}
        clearButtonClass={clear.clearButtonClass}
        clearButtonStyle={clear.clearButtonStyle}
        clearButton={clear.clearButton}
        onChange={ctx.change}
        onOpenChange={(event) => ctx.setOpen(event.open, event.reason)}
      />
    </View>
  );
}

/** A section. `SelectLabel` names it; the items inside join that section. */
export function SelectGroup(props: { children?: JSX.Element }) {
  const label = signal<string | undefined>(undefined);
  return <SelectGroupContext.Provider value={label}>{props.children}</SelectGroupContext.Provider>;
}

/** The section's name. Renders nothing; the popup header shows it. */
export function SelectLabel(props: { children?: string }) {
  const label = SelectGroupContext();
  label?.set(props.children);
  return <View style={{ width: 0, height: 0 }} />;
}

/** One choice. The string child is the row's title. `group` overrides the section it sits in. */
export function SelectItem(props: {
  value: string;
  disabled?: boolean;
  group?: string;
  children?: string;
}) {
  const ctx = useSelect();
  const groupLabel = SelectGroupContext();
  ctx.items.register({
    value: props.value,
    title: props.children ?? props.value,
    disabled: props.disabled,
    group: props.group ?? groupLabel?.(),
  });
  cleanup(() => ctx.items.unregister(props.value));
  return <View style={{ width: 0, height: 0 }} />;
}

/**
 * Kept so the composition matches the usual select parts. Base Select has no row separator;
 * sections are `SelectGroup`.
 */
export function SelectSeparator() {
  return <View style={{ width: 0, height: 0 }} />;
}
