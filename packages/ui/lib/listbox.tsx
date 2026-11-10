// Source: examples/nsh-gallery-ui/look/listbox.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, popupSurface } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { Text, View } from "nsh";
import type { SelectEntry, SelectGroup } from "nsh/base";

import { isPointer } from "./density";
import { fieldTransitionClass, fieldWell } from "./field";
import { follow } from "./follow";

/**
 * Sizes shared by the select trigger and the combobox well. Pointer heights follow the
 * reference's `controlSize`; touch uses the 44-point target for the control and the row.
 */
export function listboxMetrics() {
  const pointer = isPointer();
  return {
    line: pointer ? 32 : 44,
    label: pointer ? 14 : 15,
    check: pointer ? 12 : 16,
    clear: pointer ? 16 : 20,
    row: pointer ? 30 : 44,
    rowPad: pointer ? 3 : 7,
    search: pointer ? 32 : 40,
  };
}

/** Gap between a trigger and its popup, and the popup's distance from the safe area. */
export const listboxOffset = 4;

/** Distance the popup keeps from the edges of the safe area. */
export const listboxMargin = 8;

/**
 * How far the clear button sits from the trigger's end. The reference's inset, in our sizes.
 */
export function listboxClearInset(): number {
  const m = listboxMetrics();
  return 1 + 10 + m.check / 4 - m.clear / 2;
}

/**
 * Popup chrome. Pointer: the shared surface, padded like the reference. Touch: a bottom
 * sheet (base presents it); popover and menu do not style that sheet, so it lives here.
 */
export function listboxPopup(options?: { minWidth?: number }): ViewStyle {
  if (!isPointer()) {
    return {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 10,
      paddingTop: 10,
      paddingBottom: 34,
      maxHeight: "70%",
    };
  }
  return {
    ...popupSurface(),
    padding: 6,
    ...(options?.minWidth != null ? { minWidth: options.minWidth } : {}),
  };
}

/**
 * Row states. Base draws each row once and has no per-state item style, so the highlight,
 * the press and the dim live on `itemClass` (`focus:` / `selected:` / `disabled:`, and
 * `group-*` for the content). `accent` is the highlight fill; `ring` is its edge.
 */
export const optionClass =
  "group rounded-md border border-transparent transition-colors duration-100 motion-reduce:transition-none focus:bg-accent focus:border-ring active:opacity-70 disabled:opacity-50";

/**
 * Search field above a select's rows. The well is the shared field recess.
 * `fieldWell` copies the current tokens, so read this from a `computed` in JSX
 * (`search().searchStyle`); a plain object stays the scheme it was built in.
 */
export function listboxSearch(): { searchClass: string; searchStyle: ViewStyle } {
  const pointer = isPointer();
  const m = listboxMetrics();
  return {
    searchClass: `${pointer ? "text-sm" : "text-base"} text-foreground placeholder:text-muted-foreground ${fieldTransitionClass}`,
    searchStyle: {
      minHeight: m.search,
      paddingHorizontal: 9,
      marginBottom: 6,
      ...fieldWell({}),
    },
  };
}

/** Clear button. `over` places it on the select trigger; a combobox leaves it in the row. */
export function clearButtonLook(over?: boolean): {
  clearButtonClass: string;
  clearButtonStyle: ViewStyle;
  clearButton: JSX.Element;
} {
  const m = listboxMetrics();
  const box = { width: m.clear, height: m.clear };
  return {
    clearButtonClass:
      "items-center justify-center rounded-full enabled:hover:bg-accent active:bg-muted disabled:opacity-50",
    clearButtonStyle: over
      ? { position: "absolute", top: (m.line - m.clear) / 2, right: listboxClearInset(), ...box }
      : box,
    clearButton: (
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: isPointer() ? 14 : 16,
          lineHeight: isPointer() ? 14 : 16,
        }}
      >
        ×
      </Text>
    ),
  };
}

/** Hairline above a combobox footer. Select has no footer slot. */
export function listboxFooterStyle(): ViewStyle {
  return {
    marginTop: 6,
    paddingTop: 6,
    paddingHorizontal: 9,
    borderTopWidth: 1,
    borderColor: colors.border,
  };
}

/** Chevron on a select trigger or a combobox toggle. Points down, and up while `open()` is true. */
export function ListboxChevron(props: { open: () => boolean; hidden?: () => boolean }) {
  const turn = follow(() => (props.open() ? 1 : 0));
  const angle = turn.interpolate({ inputRange: [0, 1], outputRange: ["90deg", "-90deg"] });
  const m = listboxMetrics();
  return (
    <View
      style={{
        display: props.hidden?.() ? "none" : "flex",
        flexShrink: 0,
        marginHorizontal: -m.check / 4,
        transform: [{ rotate: angle }],
      }}
    >
      <Text style={{ fontSize: m.check, lineHeight: m.check, color: colors.mutedForeground }}>
        ›
      </Text>
    </View>
  );
}

/** One option. The check and the weight follow the row's `group-selected:`; the row owns the state. */
export function OptionRow(props: { item: SelectEntry }) {
  const m = listboxMetrics();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minHeight: m.row,
        paddingHorizontal: m.rowPad,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          class="group-selected:font-semibold font-normal"
          style={{ fontSize: 14, color: colors.foreground, numberOfLines: 1 }}
        >
          {props.item.title}
        </Text>
      </View>
      <Text
        class="group-selected:opacity-100 opacity-0"
        style={{ width: 16, textAlign: "center", fontSize: 14, color: colors.foreground }}
      >
        ✓
      </Text>
    </View>
  );
}

/** Section heading. Sentence case is the label's; this is only the muted 12/600 line. */
export function ListboxHeader(props: { group: SelectGroup }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        color: colors.mutedForeground,
        paddingHorizontal: 9,
        paddingTop: 8,
        paddingBottom: 4,
      }}
    >
      {props.group.title}
    </Text>
  );
}

/** What the list shows when nothing matches. */
export function ListboxEmpty(props: { label?: string }) {
  return (
    <Text
      style={{
        paddingVertical: 20,
        textAlign: "center",
        fontSize: 14,
        color: colors.mutedForeground,
      }}
    >
      {props.label ?? "No results"}
    </Text>
  );
}
