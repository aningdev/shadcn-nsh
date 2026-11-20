// A combobox: the field's and a chip's look (`comboboxLook`, `ComboToggle`, `chipLook`, `chipsLook`)
// and the parts that wear them (`Combobox`, `ComboboxTrigger`, `ComboboxContent`, `ComboboxChip`).
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, finish, focusRing, radius, rounded, terminal } from "@shadcn-nsh/theme";
import { X } from "lucide";
import type { InputStyle, JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import {
  cleanup,
  context,
  createMotion,
  platform,
  reduceMotion,
  signal,
  split,
  Text,
  View,
} from "nsh";
import {
  Button as BaseButton,
  Combobox as BaseCombobox,
  type ComboboxProps as BaseComboboxProps,
  type OpenChangeReason,
  type SelectItem as SelectItemData,
} from "nsh/base";

import { Button, type ButtonVariant } from "./button";
import { edgeClass } from "./input";
import { Icon } from "./lib/icons";
import {
  Chevron,
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
import { type Live, read } from "./lib/utils";

// @port look/listbox.tsx
const pointer = platform.desktop;

/** Options of `comboboxLook`. */
export interface ComboboxLookOptions {
  /** Layout over the look, or a function reading it. */
  style?: Live<ViewStyle>;
  /** The placeholder sums up the chosen values (`"Layout, iOS"`, `"2
   * people"`): drawn in the text color, as a value, rather than faint as
   * an empty field's prompt. */
  filled?: Live<boolean>;
}

/** As wide as a select's trigger with a pointer, and no narrower than its rows. */
const fieldWidth = 260;
const fieldMinWidth = 160;

/**
 * A combobox's field, shadcn's input group (spread it on `Combobox`): the root draws the well, its edge
 * stronger under the pointer and while the list is open, the fields' focus edge while its input has the
 * keys; the input types inside it in the label size, the toggle (`ComboToggle`) at its end. As wide as a
 * select's trigger with a pointer, the row's on a touch screen and in a narrow window (`narrowWindow`),
 * where its row puts it under the label (`plainRow`'s `wide`). A placeholder that sums up the chosen
 * values (`filled`) reads as a value, in the text color.
 */
export function comboboxLook(open: Live<boolean>, o?: ComboboxLookOptions) {
  return {
    get style(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        // Narrower in a narrow window, beside a row's label (`RowLabel` keeps its own least width).
        ...(pointer && !narrowWindow()
          ? { width: fieldWidth, flexShrink: 1, minWidth: fieldMinWidth }
          : { alignSelf: "stretch" }),
        minHeight: controlSize.line,
        // The query starts where a select's title does, and stops 4 points short of the toggle.
        paddingStart: 10,
        paddingEnd: 4,
        ...rounded(radius.control),
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
      // A least width for the query, so a row of chips leaves it room at the row's end.
      return { flex: 1, minWidth: 40, height: controlSize.line - 2 };
    },
  };
}

/** A toggle's square: as tall as a step (`controlSize.check`) sits, 24 points with a pointer and a touch screen. */
const toggleSide = 24;

/** A combobox's toggle (`triggerButton`): the chevron in a square that lights under the pointer. */
export function ComboToggle(props: { open: boolean; id?: string }) {
  return (
    <View
      testID={props.id}
      style={{
        width: toggleSide,
        height: toggleSide,
        alignItems: "center",
        justifyContent: "center",
        // A step inside a control's corners (`radius-control`).
        ...rounded(radius.control - 1),
      }}
      hoverStyle={{ backgroundColor: colors.track }}
    >
      <Chevron open={props.open} />
    </View>
  );
}
// @port end

// @port examples/gallery/demos/Controls.tsx
/** Options of `chipLook`. */
export interface ChipLookOptions {
  /** The root is disabled: the chip dims, and its remove button takes no press. */
  disabled?: Live<boolean | undefined>;
}

/**
 * A chip's look (the gallery's `Chip`): one chosen value as a label of its own, on the theme's
 * `chip` finish (its fill, edge and shadow — a raised label in the default theme, a flat grey one
 * in shadcn, glass in Solid Glass), its corners half its height. `lead` goes at the start, the
 * remove button at the end: a round target lit under the pointer, a muted × (a terminal's text ×).
 * A disabled chip dims to half.
 */
export function chipLook(o?: ChipLookOptions) {
  const height = pointer ? 26 : 32;
  // A round target 8 points inside a pointer chip's edge, 4 inside a touch chip's.
  const remove = height - (pointer ? 8 : 4);
  return {
    get style(): ViewStyle {
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: terminal ? undefined : height,
        paddingLeft: 3,
        paddingRight: 3,
        borderRadius: terminal ? 0 : height / 2,
        borderWidth: 1,
        ...finish.chip,
        opacity: read(o?.disabled) ? 0.5 : 1,
      };
    },
    get textStyle(): TextStyle {
      return { fontSize: pointer ? 12 : 14, color: colors.foreground };
    },
    get removeClass(): string {
      return terminal
        ? ""
        : "items-center justify-center rounded-full enabled:hover:bg-foreground/8 active:bg-track";
    },
    get removeStyle(): ViewStyle | undefined {
      return terminal ? undefined : { width: remove, height: remove };
    },
    get focusVisibleStyle(): ViewStyle {
      return focusRing();
    },
    get removeGlyph(): JSX.Element {
      return terminal ? (
        <Text style={{ color: colors.mutedForeground }}>×</Text>
      ) : (
        <Icon icon={X} size={pointer ? 10 : 12} tint={colors.mutedForeground} />
      );
    },
  };
}

/**
 * A chips row's look: the chosen values wrapped inside the field's start, so a field with more
 * chips than fit grows down instead of hiding them, and the input keeps its own width beside them.
 */
export function chipsLook(): ViewStyle {
  return {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 0,
    paddingVertical: 3,
    paddingEnd: 6,
  };
}
// @port end

/** Why a combobox's list closed (`onOpenChange`'s `reason`): `nsh/base`'s `OpenChangeReason`, under this part's name. */
export type ComboboxOpenChangeReason = OpenChangeReason;

/** An option of the list (`items`): `nsh/base`'s `SelectItem`, under this part's name. */
export type ComboboxSelectItem = SelectItemData;

/** What every combobox root takes, apart from the value `multiple` decides. */
type ComboboxSharedProps = {
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
  onOpenChange?: (event: { open: boolean; reason: ComboboxOpenChangeReason }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
};

/**
 * One value, shadcn's combobox without `multiple`: `value` is the chosen item or `null`.
 * An empty string is not a value.
 */
export type ComboboxSingleProps = ComboboxSharedProps & {
  /** Leave it out (or `false`): one value, and a choice replaces it and closes the list. */
  multiple?: false;
  /** The chosen item (controlled); leave it out and the root keeps it (`defaultValue`). */
  value?: string | null;
  defaultValue?: string | null;
  /** The user chose an item, or cleared it: the value, or `null`. */
  onChange?: (event: { value: string | null }) => void;
};

/**
 * Several values, shadcn's combobox with `multiple`: `value` is the chosen items.
 * A choice toggles an item and the list stays open.
 */
export type ComboboxMultipleProps = ComboboxSharedProps & {
  multiple: true;
  /** The chosen items (controlled); leave it out and the root keeps them (`defaultValue`). */
  value?: string[] | null;
  defaultValue?: string[];
  /** The user chose or toggled items: their values. */
  onChange?: (event: { value: string[] }) => void;
};

/** The root: it owns the open flag, the chosen values and the items its parts register. */
export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

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
  items?: ComboboxSelectItem[];
  /** Least popup width with a pointer (forwarded to `listboxProps`). */
  minWidth?: number;
  children?: JSX.Element;
};

/** The disclosure at the field's end: the chevron in a square. */
export type ComboboxTriggerProps = {
  /** A string is a `Button`'s label; anything else is drawn as given (the default is a `ComboToggle`). */
  children?: string | JSX.Element;
  /** The button's variant, for a string child (default `secondary`). */
  variant?: ButtonVariant;
  disabled?: boolean;
  /** The id UI tests find the toggle by. */
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/** The chosen values as chips, before the input (`prefix`). */
export type ComboboxChipsProps = {
  /** One chip per chosen value; a function draws each (the default is a `ComboboxChip`). */
  children?: (value: string) => JSX.Element;
};

/** One chosen value as a chip: its title, a mark at the start, a remove button at the end. */
export type ComboboxChipProps = {
  /** The value it holds: its remove button takes it from the root's value, its text is the item's title. */
  value: string;
  /** The chip's text (default: the item's title, else the value). */
  children?: string;
  /** A mark at its start (an avatar, a dot). */
  lead?: JSX.Element;
  /** The remove button (default `true`). */
  showRemove?: boolean;
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
  trigger: Slot<JSX.Element>;
  chips: Slot<() => JSX.Element>;
  empty: Slot<() => JSX.Element>;
  value: () => string[];
  change: (event: { value: string[] }) => void;
  /** The input's text: the chosen titles, or the root's placeholder. */
  prompt: () => string;
  filled: () => boolean;
  root: ComboboxProps;
};

const ComboboxContext = context<ComboboxContextValue | null>(null);

/** A group's name, which its items take as their group. */
type ComboboxGroupValue = { label?: string };

const ComboboxGroupContext = context<ComboboxGroupValue | null>(null);

function useCombobox() {
  const ctx = ComboboxContext();
  if (!ctx) throw new Error("Combobox parts must be used within <Combobox>");
  return ctx;
}

/** One controlled value as the list `nsh/base` keeps: a string is one item, and null or "" is none. */
function listed(value: string | readonly string[] | null | undefined): string[] {
  if (typeof value === "string") return value === "" ? [] : [value];
  return value == null ? [] : [...value];
}

/** The title an item gives its value: a chip's text when the app gives none. */
function titleOf(ctx: ComboboxContextValue, value: string): string {
  return ctx.items.items().find((item) => item.value === value)?.title ?? value;
}

/** What the input shows: the chosen titles, or the placeholder while there are none. */
function promptOf(ctx: ComboboxContextValue): string {
  const values = ctx.value();
  if (values.length === 0) return ctx.root.placeholder ?? "Choose…";
  return values.map((value) => titleOf(ctx, value)).join(", ");
}

/** The toggle the base root draws: the app's `ComboboxTrigger`, or a `ComboToggle`. */
function triggerOf(ctx: ComboboxContextValue): JSX.Element {
  const trigger = ctx.trigger.get();
  if (trigger) return trigger;
  return <ComboToggle open={ctx.open()} />;
}

/** The root of a combobox's parts. */
export function Combobox(props: ComboboxProps) {
  const state = createOpenState<OpenChangeReason>(props);
  const items = createItemRegistry<SelectItemData>([]);
  const trigger = createSlot<JSX.Element>();
  const chips = createSlot<() => JSX.Element>();
  const empty = createSlot<() => JSX.Element>();
  const picked = signal(false);
  const chosen = signal<string[]>([]);
  // `nsh/base` always stores a list. Without `multiple` the root's value is one string or null,
  // and the list holds that one item.
  const value = (): string[] => {
    if (props.multiple === true) {
      if (props.value !== undefined) return props.value ?? [];
      if (picked()) return chosen();
      return props.defaultValue ?? [];
    }
    if (props.value !== undefined) return listed(props.value);
    if (picked()) return chosen();
    return listed(props.defaultValue);
  };
  const change = (event: { value: string[] }) => {
    if (props.multiple === true) {
      if (props.value === undefined) {
        picked.set(true);
        chosen.set(event.value);
      }
      props.onChange?.(event);
      return;
    }
    const next = event.value.find((item) => item !== "") ?? null;
    if (props.value === undefined) {
      picked.set(true);
      chosen.set(next == null ? [] : [next]);
    }
    props.onChange?.({ value: next });
  };
  const filled = () => value().length > 0;
  const ctx: ComboboxContextValue = {
    ...state,
    items,
    trigger,
    chips,
    empty,
    value,
    change,
    prompt: () => promptOf(ctx),
    filled,
    root: props,
  };
  return <ComboboxContext.Provider value={ctx}>{props.children}</ComboboxContext.Provider>;
}

/**
 * The disclosure at the field's end: a `ComboToggle` unless the app gives another (a string is drawn
 * as a `Button`). It registers with the root and draws nothing itself.
 */
export function ComboboxTrigger(props: ComboboxTriggerProps) {
  const ctx = useCombobox();
  // The trigger is an element, as an app hands one to `nsh/base` (`trigger={<View …>}`, the shape
  // upstream's demos use): built once, here, and placed by the field without building it again
  // on every layout. The kind is read once, here — it picks the host, and never changes; a
  // string child is read where it is drawn (the `Button`'s own read, through the spread's getter,
  // so a child that reads a signal stays live), and an element is handed as it is.
  const kids = props.children;
  const disabled = props.disabled ?? ctx.root.disabled;
  ctx.trigger.set(
    typeof kids === "string" ? (
      <Button
        {...props}
        variant={props.variant ?? "secondary"}
        disabled={disabled}
        testID={props.testID}
      />
    ) : (
      (kids ?? <ComboToggle open={ctx.open()} id={props.testID} />)
    ),
  );
  return null;
}

/**
 * The chosen values as chips. It registers with the root and draws nothing itself, as
 * `ComboboxTrigger` does: `ComboboxContent` hands it to the field's `prefix`, where NSH puts the
 * chips of a multiple combobox (the input keeps the query). Without children every value gets a
 * `ComboboxChip`; a function draws each value's chip instead.
 */
export function ComboboxChips(props: ComboboxChipsProps) {
  const ctx = useCombobox();
  // The render prop itself, read once: the chips draw it per value when the field lays them out.
  const render = props.children;
  ctx.chips.set(() => {
    // A loop rather than `.map`, which the linter reads as a keyed list: NSH rebuilds these by
    // position, so no chip needs a key.
    const chips: JSX.Element[] = [];
    for (const value of ctx.value()) {
      chips.push(render ? render(value) : <ComboboxChip value={value} />);
    }
    return <View style={chipsLook()}>{chips}</View>;
  });
  return null;
}

/**
 * One chosen value as a chip, on `chipLook`: its title (or the app's string), an optional `lead`,
 * and a remove button whose label is `Remove <title>` — a press hands the root its value without
 * this one. It pops in when it appears (still, with reduced motion). While the root is disabled
 * the chip dims and the button takes no press.
 */
export function ComboboxChip(props: ComboboxChipProps) {
  const ctx = useCombobox();
  const title = props.children ?? titleOf(ctx, props.value);
  const look = chipLook({ disabled: () => ctx.root.disabled });
  const pop = terminal || reduceMotion() ? null : createMotion({ enter: "popIn", duration: 320 });
  cleanup(() => pop?.stop());
  const remove = () => ctx.change({ value: ctx.value().filter((value) => value !== props.value) });
  return (
    <View style={[look.style, pop?.style ?? null, props.style ?? null]}>
      {props.lead ?? null}
      <Text style={look.textStyle}>{title}</Text>
      {(props.showRemove ?? true) ? (
        <BaseButton
          accessibilityLabel={`Remove ${title}`}
          disabled={ctx.root.disabled}
          class={look.removeClass}
          style={look.removeStyle}
          focusVisibleStyle={look.focusVisibleStyle}
          onPress={remove}
        >
          {look.removeGlyph}
        </BaseButton>
      ) : null}
    </View>
  );
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
        const chips = ctx.chips.get()?.();
        return (
          <BaseCombobox
            {...rest}
            items={props.items ?? ctx.items.items()}
            multiple={ctx.root.multiple === true}
            value={ctx.value()}
            open={ctx.open()}
            // Chips hold the chosen values: the input keeps the query, and its prompt is
            // the empty field's alone (NSH's convention for a multiple combobox).
            placeholder={chips && ctx.value().length > 0 ? "" : ctx.prompt()}
            prefix={chips}
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
            empty={empty?.() ?? props.empty ?? <ListboxEmpty label="No results" />}
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
  const label = props.children ?? "No results";
  ctx.empty.set(() => <ListboxEmpty label={label} />);
  return null;
}

/** A section of options: its items take `ComboboxLabel`'s name as their group. */
export function ComboboxGroup(props: ComboboxGroupProps) {
  const group: ComboboxGroupValue = {};
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
