// A select: the look (`pickerLook`, `Picker`) and `Select` that wears the shared listbox look.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { alpha, colors, finish, radius, terminal, TERMINAL_COLUMN } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { platform, reduceMotion, split, Text, View } from "nsh";
import {
  Select as BaseSelect,
  type SelectEntry,
  type SelectProps as BaseSelectProps,
} from "nsh/base";

import { fieldSize } from "./input";
import { Icon, type IconName } from "./lib/icons";
import { listboxProps, ListboxEmpty, ListboxHeader, OptionRow } from "./lib/listbox";
import { controlSize } from "./lib/surface";

export {
  clearButtonLook,
  listboxProps,
  listboxPopup,
  listboxSearch,
  ListboxEmpty,
  ListboxHeader,
  OptionRow,
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

/**
 * `nsh/base`'s Select with `listboxProps` and `OptionRow` by default. Pass `trigger` (often a
 * `Picker`); every base prop passes through over the look's.
 */
export type SelectProps = BaseSelectProps & {
  /** Least popup width with a pointer (forwarded to `listboxProps`). */
  minWidth?: number;
};

/** A select: the shared listbox popup and rows, with the app's trigger. */
export function Select(props: SelectProps) {
  const [, rest] = split(props, [
    "minWidth",
    "popupStyle",
    "backdropStyle",
    "itemClass",
    "offset",
    "margin",
    "renderItem",
    "renderGroup",
    "empty",
  ]);
  const chrome = listboxProps({ minWidth: props.minWidth });
  return (
    <BaseSelect
      {...rest}
      offset={props.offset ?? chrome.offset}
      margin={props.margin ?? chrome.margin}
      popupStyle={[chrome.popupStyle, props.popupStyle ?? null]}
      backdropStyle={[chrome.backdropStyle, props.backdropStyle ?? null]}
      itemClass={props.itemClass ?? chrome.itemClass}
      renderItem={props.renderItem ?? ((item: SelectEntry) => <OptionRow item={item} />)}
      renderGroup={props.renderGroup ?? ((group) => <ListboxHeader group={group} />)}
      empty={props.empty ?? <ListboxEmpty label="No results" />}
    />
  );
}
