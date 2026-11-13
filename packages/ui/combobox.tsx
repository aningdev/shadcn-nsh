// A combobox: the look (`comboboxLook`, `ComboToggle`) and `Combobox` that wears the listbox look.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { colors, finish, radius } from "@shadcn-nsh/theme";
import type { InputStyle, JSX, StyleProp, ViewStyle } from "nsh";
import { cleanup, context, platform, signal, split, View } from "nsh";
import {
  Combobox as BaseCombobox,
  type ComboboxProps as BaseComboboxProps,
  type OpenChangeReason,
  type SelectItem as SelectItemData,
} from "nsh/base";

import { Button, type ButtonKind } from "./button";
import { edgeClass } from "./input";
import { Icon } from "./lib/icons";
import {
  clearButtonLook,
  listboxProps,
  ListboxEmpty,
  ListboxHeader,
  OptionRow,
} from "./lib/listbox";
import {
  createItemRegistry,
  createOpenState,
  createSlot,
  type ItemRegistry,
  type OpenState,
  type Slot,
} from "./lib/open-state";
import { controlSize, narrowWindow } from "./lib/surface";

export {
  clearButtonLook,
  listboxFooter,
  listboxProps,
  listboxSearch,
  ListboxEmpty,
  ListboxHeader,
  OptionRow,
  type ClearButtonOptions,
  type ListboxPopupOptions,
} from "./lib/listbox";

// @port look/listbox.tsx
const pointer = platform.desktop;

/** A value, or a function reading it where the look is applied (a signal). */
type Live<T> = T | (() => T);

const read = <T,>(v: Live<T> | undefined): T | undefined =>
  typeof v === "function" ? (v as () => T)() : v;

/**
 * The chevron of a trigger: its icon box takes only the room of its stroke
 * (half the box) in the row, so it turns about its own center; it points
 * down, and up while the list is open.
 */
export function Chevron(props: { open: boolean; hidden?: boolean }) {
  return (
    <View
      class="transition-transform duration-150 motion-reduce:transition-none"
      style={{
        display: props.hidden ? "none" : "flex",
        marginHorizontal: -controlSize.check / 4,
        transform: [{ rotate: props.open ? "-90deg" : "90deg" }],
      }}
    >
      <Icon name="chevron" size={controlSize.check} tint={colors.muted} />
    </View>
  );
}

/** Options of `comboboxLook`. */
export interface ComboboxLookOptions {
  /** Layout over the look, or a function reading it. */
  style?: Live<ViewStyle>;
  /** The placeholder sums up the chosen values (`"Layout, iOS"`, `"2
   * people"`): drawn in the text color, as a value, rather than faint as
   * an empty field's prompt. */
  filled?: Live<boolean>;
}

/**
 * A combobox's field, shadcn's input group (spread it on `Combobox`): the
 * root draws the well, its edge stronger under the pointer and while the
 * list is open, the fields' focus edge while its input has the keys; the
 * input types inside it in the label size, the toggle (`ComboToggle`) at
 * its end. As wide as a select's trigger with a pointer, the row's on a
 * touch screen and in a narrow window (`narrowWindow`), where its row
 * puts it under the label (`plainRow`'s `wide`). A placeholder that sums up the chosen values (`filled`)
 * reads as a value, in the text color.
 */
export function comboboxLook(open: Live<boolean>, o?: ComboboxLookOptions) {
  return {
    get style(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        // Narrower in a narrow window, beside a row's label (`RowLabel` keeps its own least width).
        ...(pointer && !narrowWindow()
          ? { width: 260, flexShrink: 1, minWidth: 160 }
          : { alignSelf: "stretch" }),
        minHeight: controlSize.line,
        paddingLeft: 10,
        paddingRight: 4,
        borderRadius: radius.control,
        borderWidth: 1,
        backgroundColor: colors.field,
        ...finish.field,
        ...read(o?.style),
      };
    },
    // The edge's states are classes, the fields' (`edgeClass`): the focus edge over the hover's.
    get class(): string {
      return edgeClass({
        rest: read(open) ? "border-faint" : "border-input",
        hover: "border-faint",
      });
    },
    get inputClass(): string {
      return `${pointer ? "text-sm" : "text-base"} text-foreground ${read(o?.filled) ? "placeholder:text-foreground" : "placeholder:text-muted-foreground"}`;
    },
    get inputStyle(): InputStyle {
      return { flex: 1, minWidth: 40, height: controlSize.line - 2 };
    },
  };
}

/** A combobox's toggle (`triggerButton`): the chevron in a square that lights under the pointer. */
export function ComboToggle(props: { open: boolean; id?: string }) {
  return (
    <View
      testID={props.id}
      style={{
        width: 24,
        height: 24,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
      }}
      hoverStyle={{ backgroundColor: colors.track }}
    >
      <Chevron open={props.open} />
    </View>
  );
}
// @port end

/** The root: it owns the open flag, the chosen values and the items its parts register. */
export type ComboboxProps = {
  /** The chosen items' values (controlled); leave it out and the root keeps them (`defaultValue`). */
  value?: string[] | null;
  defaultValue?: string[];
  /** Several values: a choice toggles the item and the list stays open. */
  multiple?: boolean;
  /** Controlled; leave it out and the root keeps the state (`defaultOpen`). */
  open?: boolean | null;
  defaultOpen?: boolean;
  /** It does not open, and the trigger takes the disabled look. */
  disabled?: boolean;
  /** A clear button while an item is chosen. */
  cleanable?: boolean;
  /** The input's prompt while nothing is chosen. */
  placeholder?: string;
  children?: JSX.Element;
  /** The user chose or toggled items: their values. */
  onChange?: (event: { value: string[] }) => void;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The field. Every prop of `nsh/base`'s Combobox passes through but the ones the root owns;
 * its look's `class` / `style` / `inputClass` / `inputStyle` go under the app's, and
 * `listboxProps` and `OptionRow` fill the popup's defaults. Its items are the `ComboboxItem`
 * children unless `items` is given.
 */
export type ComboboxContentProps = Omit<
  BaseComboboxProps,
  | "items"
  | "multiple"
  | "value"
  | "defaultValue"
  | "open"
  | "defaultOpen"
  | "placeholder"
  | "cleanable"
  | "disabled"
  | "triggerButton"
  | "onChange"
  | "onOpenChange"
  | "onOpen"
  | "onClose"
  | "onCancel"
  | "children"
> & {
  /** The rows, when they are not `ComboboxItem` children (a list the app already holds). */
  items?: SelectItemData[];
  /** Least popup width with a pointer (forwarded to `listboxProps`). */
  minWidth?: number;
  children?: JSX.Element;
};

/** The disclosure at the field's end: the chevron in a square. */
export type ComboboxTriggerProps = {
  /** A string is a `Button`'s label; anything else is drawn as given (the default is a `ComboToggle`). */
  children?: string | JSX.Element;
  /** The button's variant, for a string child (default `secondary`). */
  variant?: ButtonKind;
  disabled?: boolean;
  /** The id UI tests find the toggle by. */
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/** One choice: the string child is the row's title. */
export type ComboboxItemProps = {
  value: string;
  disabled?: boolean;
  /** Its section, when it is not inside a `ComboboxGroup`. */
  group?: string;
  children?: string;
};

/** What the list shows while no item does; the string is the message. */
export type ComboboxEmptyProps = {
  children?: string;
};

/** A section of options under `ComboboxLabel`'s name (the list's header). */
export type ComboboxGroupProps = {
  children?: JSX.Element;
};

/** A section's name. It draws nothing itself: the list's header shows it. */
export type ComboboxLabelProps = {
  children?: string;
};

type ComboboxContextValue = OpenState & {
  items: ItemRegistry<SelectItemData>;
  trigger: Slot;
  empty: Slot;
  value: () => string[];
  change: (event: { value: string[] }) => void;
  /** The input's text: the chosen titles, or the root's placeholder. */
  prompt: () => string;
  filled: () => boolean;
  root: ComboboxProps;
};

const ComboboxContext = context<ComboboxContextValue | null>(null);
const ComboboxGroupContext = context<{ label?: string } | null>(null);

function useCombobox() {
  const ctx = ComboboxContext();
  if (!ctx) throw new Error("Combobox parts must be used within <Combobox>");
  return ctx;
}

/** What the input shows: the chosen titles, or the placeholder while there are none. */
function promptOf(ctx: ComboboxContextValue): string {
  const values = ctx.value();
  if (values.length === 0) return ctx.root.placeholder ?? "Choose…";
  return values
    .map((value) => ctx.items.items().find((item) => item.value === value)?.title ?? value)
    .join(", ");
}

/** The toggle the base root draws: the app's `ComboboxTrigger`, or a `ComboToggle`. */
function triggerOf(ctx: ComboboxContextValue): JSX.Element {
  const build = ctx.trigger.get();
  if (build) return build() as JSX.Element;
  return <ComboToggle open={ctx.open()} />;
}

/** The root of a combobox's parts. */
export function Combobox(props: ComboboxProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const items = createItemRegistry<SelectItemData>([]);
  const trigger = createSlot();
  const empty = createSlot();
  const picked = signal(false);
  const chosen = signal<string[]>([]);
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
  const filled = () => value().length > 0;
  const ctx: ComboboxContextValue = {
    ...state,
    items,
    trigger,
    empty,
    value,
    change,
    prompt: () => promptOf(ctx),
    filled,
    root: props,
  };
  return <ComboboxContext.Provider value={ctx}>{props.children}</ComboboxContext.Provider>;
}

/** The disclosure at the field's end: a `ComboToggle` unless the app gives another. */
export function ComboboxTrigger(props: ComboboxTriggerProps) {
  const ctx = useCombobox();
  ctx.trigger.set(() => {
    const disabled = props.disabled ?? ctx.root.disabled;
    if (typeof props.children === "string") {
      return (
        <Button
          variant={props.variant ?? "secondary"}
          disabled={disabled}
          testID={props.testID}
          style={props.style}
        >
          {props.children}
        </Button>
      );
    }
    return props.children ?? <ComboToggle open={ctx.open()} id={props.testID} />;
  });
  return null;
}

/**
 * The field and its list: `nsh/base`'s Combobox with `comboboxLook`, `listboxProps` and
 * `OptionRow` by default. Its children are the `ComboboxGroup`s, `ComboboxItem`s and the
 * `ComboboxEmpty`.
 */
export function ComboboxContent(props: ComboboxContentProps) {
  const ctx = useCombobox();
  const [, rest] = split(props, [
    "children",
    "items",
    "minWidth",
    "class",
    "style",
    "inputClass",
    "inputStyle",
    "popupStyle",
    "backdropStyle",
    "itemClass",
    "offset",
    "margin",
    "renderItem",
    "renderGroup",
    "empty",
    "clearButtonClass",
    "clearButtonStyle",
    "clearButton",
  ]);
  return (
    <View>
      {props.children}
      {() => {
        const look = comboboxLook(ctx.open, { filled: ctx.filled });
        const chrome = listboxProps({ minWidth: props.minWidth });
        // The clear button of a cleanable field: in the row, after the input.
        const clear = clearButtonLook();
        const empty = ctx.empty.get();
        return (
          <BaseCombobox
            {...rest}
            items={props.items ?? ctx.items.items()}
            multiple={ctx.root.multiple}
            value={ctx.value()}
            open={ctx.open()}
            placeholder={ctx.prompt()}
            disabled={ctx.root.disabled}
            cleanable={ctx.root.cleanable}
            clearButtonClass={props.clearButtonClass ?? clear.clearButtonClass}
            clearButtonStyle={props.clearButtonStyle ?? clear.clearButtonStyle}
            clearButton={props.clearButton ?? clear.clearButton}
            class={props.class ? `${look.class} ${props.class}` : look.class}
            style={[look.style, props.style ?? null]}
            inputClass={
              props.inputClass ? `${look.inputClass} ${props.inputClass}` : look.inputClass
            }
            inputStyle={[look.inputStyle, props.inputStyle ?? null]}
            triggerButton={triggerOf(ctx)}
            offset={props.offset ?? chrome.offset}
            margin={props.margin ?? chrome.margin}
            popupStyle={[chrome.popupStyle, props.popupStyle ?? null]}
            backdropStyle={[chrome.backdropStyle, props.backdropStyle ?? null]}
            itemClass={props.itemClass ?? chrome.itemClass}
            renderItem={props.renderItem ?? ((item) => <OptionRow item={item} />)}
            renderGroup={props.renderGroup ?? ((group) => <ListboxHeader group={group} />)}
            empty={(empty?.() as JSX.Element) ?? props.empty ?? <ListboxEmpty label="No results" />}
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

/** What the list shows while the query matches nothing. */
export function ComboboxEmpty(props: ComboboxEmptyProps) {
  const ctx = useCombobox();
  ctx.empty.set(() => <ListboxEmpty label={props.children ?? "No results"} />);
  return null;
}

/** A section of options: its items take `ComboboxLabel`'s name as their group. */
export function ComboboxGroup(props: ComboboxGroupProps) {
  const group: { label?: string } = {};
  return (
    <ComboboxGroupContext.Provider value={group}>{props.children}</ComboboxGroupContext.Provider>
  );
}

/** A section's name: the list's header. It draws nothing itself. */
export function ComboboxLabel(props: ComboboxLabelProps) {
  const group = ComboboxGroupContext();
  if (group) group.label = props.children;
  return null;
}

/** One choice of the list. The string child is the row's title. */
export function ComboboxItem(props: ComboboxItemProps) {
  const ctx = useCombobox();
  const group = ComboboxGroupContext();
  const item: SelectItemData = {
    value: props.value,
    title: props.children ?? props.value,
    disabled: props.disabled,
    group: props.group ?? group?.label,
  };
  ctx.items.register(item);
  cleanup(() => ctx.items.unregister(item.value));
  return null;
}
