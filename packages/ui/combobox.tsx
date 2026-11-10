// Source: examples/nsh-gallery-ui/look/listbox.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, popupBackdrop, radius } from "@shadcn-nsh/theme";
import type { InputStyle, JSX, StyleProp, ViewStyle } from "nsh";
import { cleanup, context, signal, View } from "nsh";
import {
  Combobox as BaseCombobox,
  type OpenChangeReason,
  type SelectEntry,
  type SelectItem as SelectItemData,
} from "nsh/base";

import { isPointer } from "./lib/density";
import { fieldTransitionClass } from "./lib/field";
import {
  clearButtonLook,
  listboxFooterStyle,
  listboxMargin,
  listboxMetrics,
  listboxOffset,
  listboxPopup,
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

function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

type ComboState = {
  open: () => boolean;
  invalid: () => boolean;
  disabled: () => boolean;
  filled: () => boolean;
};

type ComboLook = {
  style: ViewStyle;
  fieldClass: string;
  inputClass: string;
  inputStyle: InputStyle;
  rowMinHeight: number;
  toggleActive: ViewStyle;
  toggleTransition: ViewStyle;
};

/**
 * Input-group well plus the classes that paint its edge. The border color stays on the class:
 * an inline `borderColor` would beat `focus-within`, and base has no `focusWithinStyle`.
 * The recess is `finish.control.pressed` (the reference's sunk field). Filled text uses the
 * input's placeholder, so a chosen value reads as the field's own ink.
 */
function look(state: ComboState): ComboLook {
  const sink = pressSink(0.97, "background-color, transform");
  return {
    get style(): ViewStyle {
      const m = listboxMetrics();
      const disabled = state.disabled();
      return {
        flexDirection: "row",
        alignItems: "center",
        minHeight: m.line,
        ...(isPointer() ? { minWidth: 180, flexShrink: 1 } : { flex: 1 }),
        paddingLeft: 10,
        paddingRight: 4,
        borderRadius: radius.control,
        borderCurve: "continuous",
        borderWidth: 1,
        backgroundColor: colors.background,
        ...(disabled ? {} : { boxShadow: finish.control.pressed }),
        opacity: disabledOpacity(disabled),
      };
    },
    get fieldClass() {
      const invalid = state.invalid();
      const open = state.open();
      const disabled = state.disabled();
      const rest = invalid
        ? "border-destructive"
        : open
          ? "border-muted-foreground"
          : "border-input";
      const hover = invalid || disabled ? "" : "enabled:hover:border-muted-foreground";
      const focus = invalid
        ? "focus-within:border-destructive outline-2 -outline-offset-1 outline-transparent focus-within:outline-destructive"
        : "focus-within:border-ring outline-2 -outline-offset-1 outline-transparent focus-within:outline-ring";
      return [rest, hover, focus, fieldTransitionClass].filter(Boolean).join(" ");
    },
    get inputClass() {
      const size = isPointer() ? "text-sm" : "text-base";
      const ink = state.filled()
        ? "placeholder:text-foreground"
        : "placeholder:text-muted-foreground";
      return `${size} text-foreground ${ink}`;
    },
    get inputStyle() {
      const m = listboxMetrics();
      return {
        flex: 1,
        minWidth: 40,
        minHeight: m.line - 2,
        paddingVertical: 0,
        paddingHorizontal: 0,
        fontSize: m.label,
        color: colors.foreground,
        placeholderColor: state.filled() ? colors.foreground : colors.mutedForeground,
        backgroundColor: "transparent",
        borderWidth: 0,
      };
    },
    get rowMinHeight() {
      return listboxMetrics().row;
    },
    toggleActive: sink.activeStyle,
    toggleTransition: sink.transition,
  };
}

/**
 * The well's chrome. Geometry only: the gallery's touch test reads `minHeight`.
 */
export function comboboxVariants(options?: {
  open?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  filled?: boolean;
}): ComboLook {
  return look({
    open: () => !!options?.open,
    invalid: () => !!options?.invalid,
    disabled: () => !!options?.disabled,
    filled: () => !!options?.filled,
  });
}

/** Composition root for `nsh/base` Combobox. `invalid` is this library's; base has no such flag. */
export type ComboboxProps = {
  multiple?: boolean;
  value?: string[] | null;
  defaultValue?: string[];
  open?: boolean | null;
  defaultOpen?: boolean;
  /** Filters the rows. The input shows it; `empty` shows while nothing matches. */
  query?: string | null;
  cleanable?: boolean;
  disabled?: boolean;
  /** Danger edge. Not a base prop. */
  invalid?: boolean;
  placeholder?: string;
  accessibilityLabel?: string | null;
  empty?: JSX.Element;
  /** Below the rows. Base Select has no footer; the combobox does. */
  footer?: JSX.Element;
  footerStyle?: StyleProp<ViewStyle>;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  children?: JSX.Element;
  /**
   * Popup chrome over the shared surface. Base Combobox has no `popupStarting*` / `popupEnding*`
   * hooks, so there is no entrance to set. On a touch screen the popup is base's sheet.
   */
  popupClass?: string | null;
  popupStyle?: StyleProp<ViewStyle>;
  /** Touch screens: the backdrop behind the sheet. */
  backdropClass?: string | null;
  backdropStyle?: StyleProp<ViewStyle>;
  onChange?: (event: { value: string[] }) => void;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
};

type ComboboxTriggerProps = {
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

type ComboboxContextValue = {
  items: ItemRegistry<SelectItemData>;
  trigger: Slot;
  empty: Slot;
  open: () => boolean;
  setOpen: (next: boolean, reason?: string) => void;
  value: () => string[];
  change: (event: { value: string[] }) => void;
  placeholder: () => string;
  setPlaceholder: (next: string) => void;
  disabled: () => boolean;
  invalid: () => boolean;
  filled: () => boolean;
  root: ComboboxProps;
};

const ComboboxContext = context<ComboboxContextValue | null>(null);

function useCombobox() {
  const ctx = ComboboxContext();
  if (!ctx) throw new Error("Combobox parts must be used within <Combobox>");
  return ctx;
}

function summary(ctx: ComboboxContextValue): string {
  const values = ctx.value();
  if (values.length === 0) return ctx.placeholder();
  return values
    .map((value) => ctx.items.items().find((item) => item.value === value)?.title ?? value)
    .join(", ");
}

function toggleView(ctx: ComboboxContextValue, props: ComboboxTriggerProps) {
  const chrome = look({
    open: ctx.open,
    invalid: ctx.invalid,
    disabled: ctx.disabled,
    filled: ctx.filled,
  });
  return (
    <View
      testID={props.testID}
      class={props.class ?? undefined}
      style={mergeStyle(
        {
          minWidth: 24,
          minHeight: 24,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          ...chrome.toggleTransition,
        },
        props.style,
      )}
      hoverStyle={mergeStyle({ backgroundColor: colors.accent }, props.hoverStyle)}
      activeStyle={chrome.toggleActive}
    >
      <ListboxChevron open={ctx.open} />
    </View>
  );
}

/** Root. Holds the open flag, the value mirror and the item registry. Put Trigger before Content. */
export function Combobox(props: ComboboxProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const items = createItemRegistry<SelectItemData>([]);
  const trigger = createSlot();
  const empty = createSlot();
  const picked = signal(false);
  const chosen = signal<string[]>([]);
  const prompt = signal<string | undefined>(undefined);
  const value = () => {
    if (props.value !== undefined) return props.value ?? [];
    if (picked()) return chosen();
    return props.defaultValue ?? [];
  };
  const change = (event: { value: string[] }) => {
    if (props.value === undefined) {
      picked.set(true);
      chosen.set(event.value);
    }
    props.onChange?.(event);
  };
  const ctx: ComboboxContextValue = {
    items,
    trigger,
    empty,
    open: state.open,
    setOpen: state.setOpen,
    value,
    change,
    placeholder: () => prompt() ?? props.placeholder ?? "Choose…",
    setPlaceholder: (next) => prompt.set(next),
    disabled: () => !!props.disabled,
    invalid: () => !!props.invalid,
    filled: () => value().length > 0,
    root: props,
  };
  return <ComboboxContext.Provider value={ctx}>{props.children}</ComboboxContext.Provider>;
}

/** The disclosure at the end of the well. Children register the value label; they are not the button. */
export function ComboboxTrigger(props: ComboboxTriggerProps) {
  const ctx = useCombobox();
  ctx.trigger.set(() => toggleView(ctx, props));
  return <View style={{ width: 0, height: 0 }}>{props.children}</View>;
}

/**
 * The empty prompt, and — once something is chosen — the titles the input shows as its
 * placeholder. Renders nothing of its own.
 */
export function ComboboxValue(props: { placeholder?: string }) {
  const ctx = useCombobox();
  if (props.placeholder != null) ctx.setPlaceholder(props.placeholder);
  return <View style={{ width: 0, height: 0 }} />;
}

/** Mounts base Combobox. The well is the base root; the trigger is only the chevron. */
export function ComboboxContent(props: { children?: JSX.Element }) {
  const ctx = useCombobox();
  const root = ctx.root;
  const triggerAccessor = ctx.trigger.get();
  const emptyAccessor = ctx.empty.get();
  const chrome = look({
    open: ctx.open,
    invalid: ctx.invalid,
    disabled: ctx.disabled,
    filled: ctx.filled,
  });
  const clear = clearButtonLook(false);
  const filled = ctx.filled();
  return (
    <View>
      {props.children}
      <BaseCombobox
        items={ctx.items.items()}
        multiple={root.multiple}
        value={ctx.value()}
        open={ctx.open()}
        query={root.query}
        cleanable={root.cleanable}
        disabled={ctx.disabled()}
        accessibilityLabel={root.accessibilityLabel}
        placeholder={filled ? summary(ctx) : ctx.placeholder()}
        offset={listboxOffset}
        margin={listboxMargin}
        class={mergeClass(chrome.fieldClass, root.class)}
        style={mergeStyle(chrome.style, root.style)}
        inputClass={chrome.inputClass}
        inputStyle={chrome.inputStyle}
        triggerButton={(triggerAccessor?.() as JSX.Element) ?? toggleView(ctx, {})}
        empty={(emptyAccessor?.() as JSX.Element) ?? root.empty ?? <ListboxEmpty />}
        footer={root.footer}
        footerStyle={
          root.footer != null ? mergeStyle(listboxFooterStyle(), root.footerStyle) : undefined
        }
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
        clearButtonClass={clear.clearButtonClass}
        clearButtonStyle={clear.clearButtonStyle}
        clearButton={clear.clearButton}
        onChange={ctx.change}
        onOpenChange={(event) => ctx.setOpen(event.open, event.reason)}
      />
    </View>
  );
}

/** Shown while the filter matches nothing. The string is the message. */
export function ComboboxEmpty(props: { children?: string }) {
  const ctx = useCombobox();
  ctx.empty.set(() => <ListboxEmpty label={props.children} />);
  return <View style={{ width: 0, height: 0 }} />;
}

/** One choice. The string child is the row's title. `group` puts it under a heading. */
export function ComboboxItem(props: {
  value: string;
  disabled?: boolean;
  group?: string;
  children?: string;
}) {
  const ctx = useCombobox();
  ctx.items.register({
    value: props.value,
    title: props.children ?? props.value,
    disabled: props.disabled,
    group: props.group,
  });
  cleanup(() => ctx.items.unregister(props.value));
  return <View style={{ width: 0, height: 0 }} />;
}
