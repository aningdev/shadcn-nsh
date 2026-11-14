// Shared list looks: popup, rows, search, chevron, clear — used by select, combobox, calendar, date-picker.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, finish, radius, terminal } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { platform, Text, View } from "nsh";
import type { SelectEntry, SelectGroup } from "nsh/base";

import { Icon } from "./icons";
import { backdrop } from "./overlay";
import { controlSize } from "./surface";

// @port look/listbox.tsx
const pointer = platform.desktop;

/** Options of `listboxPopup` and `listboxProps`. */
export interface ListboxPopupOptions {
  /** With a pointer, at least this wide (the titles whole); a sheet spans the window anyway. */
  minWidth?: number;
}

/**
 * The list's surface: with a pointer a popup at the trigger that extends
 * it (the raised finish, corners of 10, 6 points of padding); on a touch
 * screen a sheet at the bottom, its top corners rounded, at most 70% of the
 * window high.
 */
export function listboxPopup(o?: ListboxPopupOptions): ViewStyle {
  return pointer
    ? {
        backgroundColor: colors.raised,
        borderRadius: radius.inset,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 6,
        ...finish.raised,
        ...(o?.minWidth ? { minWidth: o.minWidth } : {}),
      }
    : {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 34,
        maxHeight: "70%",
      };
}

/**
 * A row of the list, its look on the row (`itemClass`): lit in the brand
 * tint while highlighted (`focus:`, the keys or the pointer on it), the fill
 * and edge fading between rows as the highlight moves, dimmed while
 * disabled. Every state is the row's class (`group`), so the list draws a
 * row's content once per item and the highlight moves without drawing.
 */
export const optionClass =
  "group rounded-[7px] border border-transparent transition-colors duration-100 motion-reduce:transition-none focus:border-brand/30 focus:bg-brand-tint active:opacity-70 disabled:opacity-50";

/**
 * What a select's or combobox's list takes besides its items (spread it):
 * 4 points from the trigger, 8 from the window's edges, the popup or sheet,
 * the scrim behind a sheet, the rows' look.
 */
export function listboxProps(o?: ListboxPopupOptions) {
  return {
    offset: 4,
    margin: 8,
    get popupStyle() {
      return listboxPopup(o);
    },
    get backdropStyle() {
      return backdrop();
    },
    itemClass: optionClass,
  };
}

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

/** Options of `clearButtonLook`. */
export interface ClearButtonOptions {
  /** Over a `Picker`'s end, where its chevron was (a select's, a date picker's); in the row otherwise (a combobox's). */
  over?: boolean;
}

/**
 * A clear button's look (spread it with `cleanable` and the app's
 * `clearButtonAccessibilityLabel`): a round target lit under the pointer, an
 * × in the muted color (a terminal's text ×, set after the value).
 */
export function clearButtonLook(o?: ClearButtonOptions) {
  return {
    clearButtonClass:
      "items-center justify-center rounded-full enabled:hover:bg-foreground/8 active:bg-track",
    clearButtonStyle: terminal
      ? undefined
      : o?.over
        ? {
            position: "absolute" as const,
            top: (controlSize.line - controlSize.clear) / 2,
            right: clearInset,
            width: controlSize.clear,
            height: controlSize.clear,
          }
        : { width: controlSize.clear, height: controlSize.clear },
    get clearButton() {
      return terminal ? (
        <Text style={{ color: colors.muted }}>×</Text>
      ) : (
        <Icon name="close" size={controlSize.clear - 6} tint={colors.muted} />
      );
    },
  };
}

/**
 * A row's content (`renderItem`): the title, bolder with a check while
 * chosen (`group-selected:`); `lead` before it (a flag, a dot, a face, an
 * icon), `detail` under it, `note` after it.
 */
export function OptionRow(props: {
  item: SelectEntry;
  note?: string;
  lead?: JSX.Element;
  detail?: string;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        // The row's 1-point border on each side.
        height: props.detail ? (pointer ? 38 : 52) : pointer ? 30 : 44,
        // With its border and the popup's padding, the trigger's inset: a select's chosen row lies over the trigger, title on title.
        paddingHorizontal: pointer ? 3 : 7,
      }}
    >
      {props.lead}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          class="group-selected:font-semibold font-normal"
          style={{ numberOfLines: 1, fontSize: 14, color: colors.text }}
        >
          {props.item.title}
        </Text>
        <If when={props.detail}>
          <Text style={{ numberOfLines: 1, fontSize: 12, color: colors.muted }}>
            {props.detail}
          </Text>
        </If>
      </View>
      <If when={props.note}>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          {props.note}
        </Text>
      </If>
      <View
        class="group-selected:opacity-100 opacity-0"
        style={{ width: 16, alignItems: "center" }}
      >
        <Icon name="check" size={14} tint={colors.accent} />
      </View>
    </View>
  );
}

/** A group's heading in a list (`renderGroup`): quiet, in sentence case. */
export function ListboxHeader(props: { group: SelectGroup }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: colors.muted,
        paddingHorizontal: 9,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      {props.group.title}
    </Text>
  );
}

/** What a list shows while its search matches nothing (`empty`). */
export function ListboxEmpty(props: { label: string }) {
  return (
    <Text style={{ paddingVertical: 20, textAlign: "center", fontSize: 14, color: colors.muted }}>
      {props.label}
    </Text>
  );
}

/** A list's footer under a hairline (`footerStyle`), and its text. */
export const listboxFooter = {
  get style(): ViewStyle {
    return {
      marginTop: 6,
      paddingTop: 6,
      paddingHorizontal: terminal ? 0 : 9,
      borderTopWidth: 1,
      borderColor: colors.border,
    };
  },
  get text() {
    return { fontSize: 12, color: colors.muted };
  },
};

/**
 * The search well at the top of a list (spread it on a searchable
 * `Select`): the field color in a recess, 32 high with a pointer, 40 on a
 * touch screen, 6 points above the rows; the text and a muted placeholder
 * as token classes, so they follow the theme.
 */
export function listboxSearch() {
  return {
    searchClass: `${pointer ? "text-sm" : "text-base"} text-foreground placeholder:text-muted-foreground`,
    get searchStyle(): ViewStyle {
      return {
        height: pointer ? 32 : 40,
        paddingHorizontal: 9,
        marginBottom: 6,
        borderRadius: radius.control,
        borderWidth: 1,
        backgroundColor: colors.field,
        ...finish.field,
        borderColor: colors.fieldBorder,
      };
    },
  };
}
// @port end
