// A select: the look (`pickerLook`, `Picker`) and `Select` that wears the shared listbox look.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { alpha, colors, finish, radius, terminal, TERMINAL_COLUMN } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { cleanup, context, platform, reduceMotion, signal, split, Text, View } from "nsh";
import {
  Select as BaseSelect,
  type OpenChangeReason,
  type SelectEntry,
  type SelectItem as SelectItemData,
  type SelectProps as BaseSelectProps,
} from "nsh/base";

import { fieldSize } from "./input";
import { Icon, type IconName } from "./lib/icons";
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
import { controlSize } from "./lib/surface";

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

/** The clear button's inset from a trigger's end: centered where the chevron's lane is. The button is in the
 * select's view, outside the trigger, so its inset counts the trigger's 1-point border too. */
const clearInset = 1 + 10 + controlSize.check / 4 - controlSize.clear / 2;

/** Options of `pickerLook`. */
export interface PickerLookOptions {
  /** The list is open: the edge stays lit. */
  open?: Live<boolean>;
  /** Dimmed, and no hover (the select is disabled, not the trigger's view). */
  disabled?: Live<boolean>;
  /** Edged in the danger tone, its focus edge too. */
  invalid?: Live<boolean>;
  /** A clear button lies over the end in place of the chevron: room for it. */
  clearable?: Live<boolean>;
  /** Layout over the look (a width), or a function reading it. */
  style?: Live<ViewStyle>;
  /**
   * `field` (the default): a select's trigger as shadcn's, the input's well
   * (the field fill, the input's edge), so it lines up with the text fields
   * of its form (a date picker's and a color picker's too: in dark
   * shadcn's outline button is the input's fill and edge as well); `outline`:
   * an outline button on the raised finish, for a trigger that is not a
   * form's field.
   */
  kind?: "field" | "outline";
}

/**
 * A select's or date picker's trigger (spread it on the trigger's view): a
 * row as high as a text field, on the field's well (`kind: "field"`) or the
 * raised finish (`outline`), its edge stronger under the pointer and while
 * the list is open, the danger tone while invalid (each after the finish,
 * which has an edge of its own), the fields' focus edge while it has the
 * keys, sunk to 70% while pressed, 50% while disabled.
 */
export function pickerLook(o?: PickerLookOptions) {
  const invalid = () => !!read(o?.invalid);
  return {
    get style(): ViewStyle {
      const clearable = !!read(o?.clearable);
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        height: controlSize.line,
        // Room for the list's rows, which are as wide as the trigger.
        minWidth: pointer ? 180 : undefined,
        // With a pointer its title truncates before a row's label is squeezed.
        flexShrink: pointer ? 1 : undefined,
        paddingLeft: 10,
        // Room for the clear button, which goes over the trigger's end in place of the chevron. In the terminal the
        // select's own marks go over the end, each in a slot of three Cells: ` ▾ `, or ` ×  ▾ `.
        paddingRight: terminal
          ? (clearable ? 6 : 3) * TERMINAL_COLUMN
          : clearable
            ? clearInset + controlSize.clear + 8
            : 10,
        borderRadius: radius.control,
        borderWidth: 1,
        ...(o?.kind === "outline"
          ? { backgroundColor: colors.raised, ...finish.raised }
          : { backgroundColor: colors.field, ...finish.field }),
        borderColor: invalid()
          ? colors.danger
          : read(o?.open)
            ? colors.faint
            : o?.kind === "outline"
              ? colors.border
              : colors.fieldBorder,
        ...(terminal
          ? {}
          : {
              outlineStyle: "solid",
              outlineWidth: 2,
              outlineOffset: -1,
              outlineColor: alpha(invalid() ? colors.danger : colors.accent, 0),
            }),
        // Dimmed while the select is: the app knows, as it passes `disabled`.
        opacity: read(o?.disabled) ? 0.5 : 1,
        transitionProperty: "border-color, outline-color, opacity",
        transitionDuration: reduceMotion() ? 0 : 120,
        ...read(o?.style),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      return read(o?.disabled) || invalid() ? undefined : { borderColor: colors.faint };
    },
    activeStyle: { opacity: 0.7 } as ViewStyle,
    // The border with the outline, which not every platform draws over it; `focus-visible` is above `hover` in the
    // states' order. Only for the keyboard: a click's focus, and the focus a closing list gives back, draw nothing.
    get focusVisibleStyle(): ViewStyle {
      const tone = invalid() ? colors.danger : colors.accent;
      return terminal ? { borderColor: tone } : { borderColor: tone, outlineColor: tone };
    },
    disabledStyle: { opacity: 0.5 } as ViewStyle,
  };
}

/** The props of `Picker`. */
export interface PickerProps {
  title: string;
  open: boolean;
  disabled?: boolean;
  /** The title stands in for a value (`"No due date"`): in the muted color, as shadcn's placeholders. */
  placeholder?: boolean;
  clearable?: boolean;
  invalid?: boolean;
  /** An icon before the title, in the muted color (none in the terminal). */
  icon?: IconName;
  lead?: JSX.Element;
  /** The chevron at the end (the default); a date picker's trigger has none, its calendar says what opens. */
  chevron?: boolean;
  /** `pickerLook`'s `kind`: the field's well (a select's, a date picker's: the default) or an outline button. */
  kind?: "field" | "outline";
  style?: ViewStyle;
}

/** The icon of a trigger: 16 points with a pointer (shadcn's `size-4`), 18 on a touch screen. */
const triggerIcon = pointer ? 16 : 18;

/**
 * A trigger (`Select`'s or `DatePicker`'s `trigger`): `pickerLook` with the
 * title (muted while it is a placeholder) and the chevron; `icon` and `lead`
 * go before the title (a calendar; a flag, a status's dot, faces). The
 * terminal's select draws its own `▾`.
 */
export function Picker(props: PickerProps) {
  return (
    <View
      {...pickerLook({
        open: () => props.open,
        disabled: () => !!props.disabled,
        invalid: () => !!props.invalid,
        clearable: () => !!props.clearable,
        kind: props.kind,
        style: () => props.style ?? {},
      })}
    >
      <If when={props.icon && !terminal}>
        <Icon name={props.icon!} size={triggerIcon} tint={colors.muted} />
      </If>
      {props.lead}
      <Text
        style={{
          flex: 1,
          numberOfLines: 1,
          fontSize: fieldSize.font,
          color: props.placeholder ? colors.muted : colors.text,
        }}
      >
        {props.title}
      </Text>
      <Chevron open={props.open} hidden={props.clearable || props.chevron === false || terminal} />
    </View>
  );
}
// @port end

/** The root: it owns the open flag, the value and the items its parts register. */
export type SelectProps = {
  /** Controlled; leave it out and the root keeps the state (`defaultValue`). */
  value?: string | null;
  defaultValue?: string | null;
  /** Controlled; leave it out and the root keeps the state (`defaultOpen`). */
  open?: boolean | null;
  defaultOpen?: boolean;
  /** It does not open, and the trigger takes the disabled look. */
  disabled?: boolean;
  /** A clear button while an item is chosen. */
  cleanable?: boolean;
  /** What the trigger says when nothing is chosen; `SelectValue`'s `placeholder` wins. */
  placeholder?: string;
  children?: JSX.Element;
  /** The user chose another item: its value, `null` when the clear button cleared it. */
  onChange?: (event: { value: string | null }) => void;
  onOpenChange?: (event: { open: boolean; reason: OpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * The field. Every prop of `nsh/base`'s Select passes through but the ones the root owns;
 * `popupStyle`, `backdropStyle`, `itemClass`, `renderItem`, `renderGroup`, `empty`, `offset` and
 * `margin` go over `listboxProps`' and `OptionRow`'s. Its items are the `SelectItem` children
 * unless `items` is given.
 */
export type SelectContentProps = Omit<
  BaseSelectProps,
  | "items"
  | "value"
  | "defaultValue"
  | "open"
  | "defaultOpen"
  | "placeholder"
  | "cleanable"
  | "disabled"
  | "trigger"
  | "onChange"
  | "onOpenChange"
  | "onOpen"
  | "onClose"
  | "onCancel"
  | "children"
> & {
  /** The rows, when they are not `SelectItem` children (a list the app already holds). */
  items?: SelectItemData[];
  /** Least popup width with a pointer (forwarded to `listboxProps`). */
  minWidth?: number;
  children?: JSX.Element;
};

/** The pressed row: a `Picker` whose title is the chosen title or the placeholder. */
export type SelectTriggerProps = {
  /** A `SelectValue` (its placeholder); a string is the placeholder itself. */
  children?: string | JSX.Element;
  /** An icon before the title, in the muted color (none in the terminal). */
  icon?: IconName;
  /** Content before the title (a flag, a status's dot). */
  lead?: JSX.Element;
  /** Edged in the danger tone. */
  invalid?: boolean;
  /** The app's own clear button lies over the end: room for it. */
  clearable?: boolean;
  /** `pickerLook`'s `kind`: the field's well (the default) or an outline button. */
  kind?: "field" | "outline";
  /** The chevron at the end (the default). */
  chevron?: boolean;
  style?: ViewStyle;
};

/** The chosen title, or the placeholder: set by `SelectValue`, else the root's `placeholder`. */
export type SelectValueProps = {
  placeholder?: string;
};

/** One choice: the string child is its title and what the trigger shows while it is chosen. */
export type SelectItemProps = {
  value: string;
  disabled?: boolean;
  /** Its section, when it is not inside a `SelectGroup`. */
  group?: string;
  children?: string;
};

/** A section of items under `SelectLabel`'s name (the list's header). */
export type SelectGroupProps = {
  children?: JSX.Element;
};

/** A section's name. It draws nothing itself: the list's header shows it. */
export type SelectLabelProps = {
  children?: string;
};

type SelectContextValue = OpenState & {
  items: ItemRegistry<SelectItemData>;
  trigger: Slot;
  value: () => string | null;
  change: (event: { value: string | null }) => void;
  /** The placeholder: `SelectValue`'s, else the root's, else "Select…". */
  prompt: () => string;
  setPrompt: (next: string | undefined) => void;
  root: SelectProps;
};

const SelectContext = context<SelectContextValue | null>(null);
const SelectGroupContext = context<{ label?: string } | null>(null);

function useSelect() {
  const ctx = SelectContext();
  if (!ctx) throw new Error("Select parts must be used within <Select>");
  return ctx;
}

/** The title of the trigger: the chosen item's title, else the placeholder. */
function titleOf(ctx: SelectContextValue): string {
  const value = ctx.value();
  if (value == null) return ctx.prompt();
  return ctx.items.items().find((item) => item.value === value)?.title ?? value;
}

/** The trigger the base root renders: the app's `SelectTrigger`, or a `Picker` of the value. */
function triggerOf(ctx: SelectContextValue): JSX.Element {
  const build = ctx.trigger.get();
  if (build) return build() as JSX.Element;
  return (
    <Picker
      title={titleOf(ctx)}
      placeholder={ctx.value() == null}
      open={ctx.open()}
      disabled={ctx.root.disabled}
      // The clear button shows only while an item is chosen; until then the chevron stays.
      clearable={ctx.root.cleanable && ctx.value() != null}
    />
  );
}

/** The root of a select's parts. Put `SelectTrigger` before `SelectContent`. */
export function Select(props: SelectProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const items = createItemRegistry<SelectItemData>([]);
  const trigger = createSlot();
  const prompt = signal<string | undefined>(undefined);
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
  return (
    <SelectContext.Provider
      value={{
        ...state,
        items,
        trigger,
        value,
        change,
        prompt: () => prompt() ?? props.placeholder ?? "Select…",
        setPrompt: (next) => prompt.set(next),
        get root() {
          return props;
        },
      }}
    >
      {props.children}
    </SelectContext.Provider>
  );
}

/**
 * The pressed field: a `Picker` that follows the root's open state, value and `disabled`. Its
 * child is a `SelectValue` (the placeholder while nothing is chosen).
 */
export function SelectTrigger(props: SelectTriggerProps) {
  const ctx = useSelect();
  ctx.trigger.set(() => (
    <Picker
      title={titleOf(ctx)}
      placeholder={ctx.value() == null}
      open={ctx.open()}
      disabled={ctx.root.disabled}
      invalid={props.invalid}
      clearable={props.clearable ?? (ctx.root.cleanable && ctx.value() != null)}
      icon={props.icon}
      lead={props.lead}
      kind={props.kind}
      chevron={props.chevron}
      style={props.style}
    />
  ));
  if (typeof props.children === "string") {
    ctx.setPrompt(props.children);
    return null;
  }
  return props.children;
}

/** Sets the trigger's placeholder. It draws nothing of its own. */
export function SelectValue(props: SelectValueProps) {
  const ctx = useSelect();
  ctx.setPrompt(props.placeholder);
  return null;
}

/**
 * The list: `nsh/base`'s Select with `listboxProps` and `OptionRow` by default, opened by the
 * `SelectTrigger` above it. Its children are the `SelectGroup`s and `SelectItem`s.
 */
export function SelectContent(props: SelectContentProps) {
  const ctx = useSelect();
  const [, rest] = split(props, [
    "children",
    "items",
    "minWidth",
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
        const chrome = listboxProps({ minWidth: props.minWidth });
        // The clear button of a cleanable trigger: over its end, in place of the chevron.
        const clear = clearButtonLook({ over: true });
        return (
          <BaseSelect
            {...rest}
            items={props.items ?? ctx.items.items()}
            value={ctx.value()}
            open={ctx.open()}
            disabled={ctx.root.disabled}
            cleanable={ctx.root.cleanable}
            clearButtonClass={props.clearButtonClass ?? clear.clearButtonClass}
            clearButtonStyle={props.clearButtonStyle ?? clear.clearButtonStyle}
            clearButton={props.clearButton ?? clear.clearButton}
            placeholder={ctx.prompt()}
            trigger={triggerOf(ctx)}
            offset={props.offset ?? chrome.offset}
            margin={props.margin ?? chrome.margin}
            popupStyle={[chrome.popupStyle, props.popupStyle ?? null]}
            backdropStyle={[chrome.backdropStyle, props.backdropStyle ?? null]}
            itemClass={props.itemClass ?? chrome.itemClass}
            renderItem={props.renderItem ?? ((item: SelectEntry) => <OptionRow item={item} />)}
            renderGroup={props.renderGroup ?? ((group) => <ListboxHeader group={group} />)}
            empty={props.empty ?? <ListboxEmpty label="No results" />}
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

/** A section of a list: its items take `SelectLabel`'s name as their group. */
export function SelectGroup(props: SelectGroupProps) {
  const group: { label?: string } = {};
  return <SelectGroupContext.Provider value={group}>{props.children}</SelectGroupContext.Provider>;
}

/** A section's name: the list's header. It draws nothing itself. */
export function SelectLabel(props: SelectLabelProps) {
  const group = SelectGroupContext();
  if (group) group.label = props.children;
  return null;
}

/** One choice of a list. The string child is the row's title. */
export function SelectItem(props: SelectItemProps) {
  const ctx = useSelect();
  const group = SelectGroupContext();
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

/** A hairline between sections. `nsh/base`'s Select separates them by their headers alone. */
export function SelectSeparator() {
  return null;
}
