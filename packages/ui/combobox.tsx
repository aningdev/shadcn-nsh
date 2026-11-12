// A combobox: the look (`comboboxLook`, `ComboToggle`) and `Combobox` that wears the listbox look.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { colors, finish, radius } from "@shadcn-nsh/theme";
import type { InputStyle, ViewStyle } from "nsh";
import { platform, split, View } from "nsh";
import { Combobox as BaseCombobox, type ComboboxProps as BaseComboboxProps } from "nsh/base";

import { edgeClass } from "./input";
import { Icon } from "./lib/icons";
import { listboxProps, ListboxEmpty, ListboxHeader, OptionRow } from "./lib/listbox";
import { controlSize, narrowWindow } from "./lib/surface";

export { listboxProps, ListboxEmpty, OptionRow } from "./lib/listbox";

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

/**
 * `nsh/base`'s Combobox with `listboxProps` and `comboboxLook` on the root. Pass `triggerButton`
 * (often a `ComboToggle`); every base prop passes through over the look's.
 */
export type ComboboxProps = BaseComboboxProps & {
  minWidth?: number;
  /** The list is open: lights the field's edge (default from `open`). */
  listOpen?: boolean;
  /** Placeholder sums up chosen values: drawn as a value, not faint. */
  filled?: boolean;
};

/** A combobox: the shared listbox popup and the field look. */
export function Combobox(props: ComboboxProps) {
  const [, rest] = split(props, [
    "minWidth",
    "listOpen",
    "filled",
    "popupStyle",
    "backdropStyle",
    "itemClass",
    "offset",
    "margin",
    "renderItem",
    "renderGroup",
    "empty",
    "class",
    "style",
    "inputClass",
    "inputStyle",
    "triggerButton",
  ]);
  const open = () => !!(props.listOpen ?? props.open);
  const look = comboboxLook(open, { filled: () => !!props.filled });
  const chrome = listboxProps({ minWidth: props.minWidth });
  return (
    <BaseCombobox
      {...rest}
      class={props.class ? `${look.class} ${props.class}` : look.class}
      style={[look.style, props.style ?? null]}
      inputClass={props.inputClass ? `${look.inputClass} ${props.inputClass}` : look.inputClass}
      inputStyle={[look.inputStyle, props.inputStyle ?? null]}
      triggerButton={props.triggerButton ?? <ComboToggle open={open()} />}
      offset={props.offset ?? chrome.offset}
      margin={props.margin ?? chrome.margin}
      popupStyle={[chrome.popupStyle, props.popupStyle ?? null]}
      backdropStyle={[chrome.backdropStyle, props.backdropStyle ?? null]}
      itemClass={props.itemClass ?? chrome.itemClass}
      renderItem={props.renderItem ?? ((item) => <OptionRow item={item} />)}
      renderGroup={props.renderGroup ?? ((group) => <ListboxHeader group={group} />)}
      empty={props.empty ?? <ListboxEmpty label="No results" />}
    />
  );
}
