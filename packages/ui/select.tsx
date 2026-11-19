// A select: the trigger's look (`pickerLook`, `Picker`) and the parts of the list (`Select`,
// `SelectTrigger`, `SelectContent`), which wear the shared listbox look.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  alpha,
  colors,
  finish,
  radius,
  terminal,
  TERMINAL_COLUMN,
  rounded,
} from "@shadcn-nsh/theme";
import type { IconNode } from "lucide";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { cleanup, context, platform, reduceMotion, signal, split, Text, View } from "nsh";
import {
  Select as BaseSelect,
  type OpenChangeReason,
  type SelectEntry,
  type SelectItem as SelectItemData,
  type SelectProps as BaseSelectProps,
} from "nsh/base";

import { fieldSize } from "./input";
import { Icon } from "./lib/icons";
import {
  Chevron,
  clearButtonLook,
  clearInset,
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
import { type Live, read } from "./lib/utils";

// @port look/listbox.tsx
const pointer = platform.desktop;

/** A trigger's least width with a pointer: room for the list's rows, which are as wide as it. */
const minTriggerWidth = 180;

/** A trigger's text inset, and the space between its icon, its title and the chevron. */
const triggerPadding = 10;
const triggerGap = 8;

/** How long a trigger's edge fades: its border, its ring and its dimming. */
const edgeFade = 120;

/** How far a pressed trigger sinks to, as a button's does. */
const pressedOpacity = 0.7;

/** A trigger's variants: `default` shadcn's field, `outline` an outline button of shadcn's, on the raised finish. */
export type PickerVariant = "default" | "outline";

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
  /** Layout over the look (a width), or a function reading it; it may be a list. */
  style?: Live<StyleProp<ViewStyle>>;
  /**
   * `default`: a select's trigger as shadcn's, the input's well
   * (the field fill, the input's edge), so it lines up with the text fields
   * of its form (a date picker's and a color picker's too: in dark
   * shadcn's outline button is the input's fill and edge as well); `outline`:
   * an outline button on the raised finish, for a trigger that is not a
   * form's field.
   */
  variant?: PickerVariant;
}

/**
 * A select's or date picker's trigger (spread it on the trigger's view): a
 * row as high as the controls around it (`controlSize.line`), on the field's
 * well (`default`) or the raised finish (`outline`), its edge stronger under
 * the pointer and while the list is open, the danger tone while invalid (each
 * after the finish, which has an edge of its own), the fields' focus edge
 * while it has the keys, sunk to 70% while pressed, 50% while disabled.
 */
export function pickerLook(o?: PickerLookOptions) {
  const invalid = () => !!read(o?.invalid);
  const outline = o?.variant === "outline";
  return {
    get style(): ViewStyle {
      const clearable = !!read(o?.clearable);
      return {
        flexDirection: "row",
        alignItems: "center",
        gap: triggerGap,
        height: controlSize.line,
        minWidth: pointer ? minTriggerWidth : undefined,
        // With a pointer its title truncates before a row's label is squeezed.
        flexShrink: pointer ? 1 : undefined,
        paddingStart: triggerPadding,
        // Room for the clear button, which goes over the trigger's end in place of the chevron. In the terminal the
        // select's own marks go over the end, each in a slot of three Cells: ` ▾ `, or ` ×  ▾ `.
        paddingEnd: terminal
          ? (clearable ? 6 : 3) * TERMINAL_COLUMN
          : clearable
            ? clearInset + controlSize.clear + 8
            : triggerPadding,
        ...rounded(radius.control),
        borderWidth: 1,
        ...(outline
          ? { backgroundColor: colors.raised, ...finish.raised }
          : { backgroundColor: colors.field, ...finish.field }),
        borderColor: invalid()
          ? colors.danger
          : read(o?.open)
            ? colors.faint
            : outline
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
        transitionDuration: reduceMotion() ? 0 : edgeFade,
        // The look is one object (it is spread on the trigger's view), so a list of styles is
        // flattened into it: the app's style still lands last, over the look's.
        ...flatStyle(read(o?.style) ?? {}),
      };
    },
    get hoverStyle(): ViewStyle | undefined {
      return read(o?.disabled) || invalid() ? undefined : { borderColor: colors.faint };
    },
    activeStyle: { opacity: pressedOpacity },
    // The border with the outline, which not every platform draws over it; `focus-visible` is above `hover` in the
    // states' order. Only for the keyboard: a click's focus, and the focus a closing list gives back, draw nothing.
    get focusVisibleStyle(): ViewStyle {
      const tone = invalid() ? colors.danger : colors.accent;
      return terminal ? { borderColor: tone } : { borderColor: tone, outlineColor: tone };
    },
    disabledStyle: { opacity: 0.5 },
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
  icon?: IconNode;
  lead?: JSX.Element;
  /** The chevron at the end (the default); a date picker's trigger has none, its calendar says what opens. */
  chevron?: boolean;
  /** `pickerLook`'s `variant`: the field's well (a select's, a date picker's: the default) or an outline button. */
  variant?: PickerVariant;
  /** Its own style, over its look: where the app places it. */
  style?: StyleProp<ViewStyle>;
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
        variant: props.variant,
        style: () => props.style ?? {},
      })}
    >
      <If when={props.icon && !terminal}>
        <Icon icon={props.icon!} size={triggerIcon} tint={colors.muted} />
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
 * The field and its list: every prop of `nsh/base`'s Select passes through but the ones the root owns;
 * `popupStyle`, `backdropStyle`, `itemClass`, `renderItem`, `renderGroup`, `empty`, `offset` and
 * `margin` go over `listboxProps`' and `OptionRow`'s, and `clearButtonClass`, `clearButtonStyle`
 * and `clearButton` over the clear button's. Its items are the `SelectItem` children unless
 * `items` is given.
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
  icon?: IconNode;
  /** Content before the title (a flag, a status's dot). */
  lead?: JSX.Element;
  /** Edged in the danger tone. */
  invalid?: boolean;
  /** The app's own clear button lies over the end: room for it. */
  clearable?: boolean;
  /** `pickerLook`'s `variant`: the field's well (the default) or an outline button. */
  variant?: PickerVariant;
  /** The chevron at the end (the default). */
  chevron?: boolean;
  /**
   * The trigger's own style, over its look. What places it where the app puts it (`flex*`, `width`,
   * `minWidth`, `maxWidth`, `alignSelf`, `margin*`) goes on the select's outermost view, the box the
   * app lays out: a trigger then stretches and shrinks like a view of the app's own. The rest (the
   * fill, the edge, the padding) stays on the trigger.
   */
  style?: StyleProp<ViewStyle>;
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

/**
 * The keys of a trigger's `style` that place it where the app puts it. They go on `SelectContent`'s
 * view, the select's box in the app's layout, which `nsh/base`'s Select fills: the trigger alone
 * could take neither the room a row leaves nor less room than its look asks for.
 */
const triggerLayoutKeys: readonly string[] = [
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "width",
  "maxWidth",
  "alignSelf",
  "margin",
  "marginHorizontal",
  "marginVertical",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginStart",
  "marginEnd",
];

/** A style list as the one style its entries make, each over the last: the object a split reads keys of. */
function flatStyle(style: StyleProp<ViewStyle>): ViewStyle {
  const one: Record<string, unknown> = {};
  const merge = (part: StyleProp<ViewStyle>) => {
    if (!part) return;
    if (Array.isArray(part)) {
      for (const entry of part) merge(entry);
      return;
    }
    Object.assign(one, part);
  };
  merge(style);
  return one as ViewStyle;
}

/**
 * A trigger's `style`, in two: what the select's box wears (where it sits in the app's layout) and
 * what the trigger itself wears. `minWidth` goes to both: the look gives a trigger a `minWidth` of
 * its own (room for the list's rows, with a pointer), and a squeezed select cannot be narrower than
 * that, so the app's `minWidth` has to reach the trigger as well.
 */
function splitTriggerStyle(style: StyleProp<ViewStyle>): { layout: ViewStyle; look: ViewStyle } {
  const flat = flatStyle(style);
  const layout: Record<string, unknown> = {};
  const look: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    (triggerLayoutKeys.includes(key) ? layout : look)[key] = value;
  }
  if (flat.minWidth !== undefined) {
    layout.minWidth = flat.minWidth;
    look.minWidth = flat.minWidth;
  }
  return { layout: layout as ViewStyle, look: look as ViewStyle };
}

type SelectContextValue = OpenState & {
  items: ItemRegistry<SelectItemData>;
  trigger: Slot<JSX.Element>;
  /** Where the trigger sits: `SelectTrigger`'s layout, for `SelectContent`'s view to wear. */
  triggerLayout: Slot<ViewStyle>;
  value: () => string | null;
  change: (event: { value: string | null }) => void;
  /** The placeholder: `SelectValue`'s, else the root's, else "Select…". */
  prompt: () => string;
  setPrompt: (next: string | undefined) => void;
  root: SelectProps;
};

const SelectContext = context<SelectContextValue | null>(null);

/** A section's name, which its items take as their group. */
type SelectGroupValue = { label?: string };

const SelectGroupContext = context<SelectGroupValue | null>(null);

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
  const trigger = createSlot<JSX.Element>();
  const triggerLayout = createSlot<ViewStyle>();
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
        triggerLayout,
        value,
        change,
        prompt: () => prompt() ?? props.placeholder ?? "Select…",
        setPrompt: (next) => prompt.set(next),
        root: props,
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
  // Split where it is read, in the two thunks below, so a style that reads the appearance follows
  // it (P5): each of them runs in a reactive scope, a component's body does not.
  ctx.triggerLayout.set(() => splitTriggerStyle(props.style).layout);
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
      variant={props.variant}
      chevron={props.chevron}
      style={splitTriggerStyle(props.style).look}
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
    // The select's box in the app's layout: `nsh/base`'s Select fills it, and the trigger's own
    // layout goes on it, since base's view sizes to its content.
    <View style={ctx.triggerLayout.get()?.()}>
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
  const group: SelectGroupValue = {};
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
