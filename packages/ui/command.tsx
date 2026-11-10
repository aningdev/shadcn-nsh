// Source: examples/nsh-gallery-ui/command.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, finish, radius } from "@shadcn-nsh/theme";
import type { InputStyle, StyleProp, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
import {
  Command as BaseCommand,
  type CommandEntry,
  type CommandGroup,
  type CommandProps as BaseCommandProps,
} from "nsh/base";

import { isPointer } from "./lib/density";

/**
 * Theme layer on `nsh/base` Command. The palette chrome is the default;
 * every base prop passes through. Not a composition facade: base is one
 * control, and rows are `items` plus `renderItem`.
 */
export type CommandProps = BaseCommandProps;

type CommandChrome = {
  root: ViewStyle;
  searchBarClass: string;
  searchClass: string;
  searchStyle: InputStyle;
  listClass: string;
  listStyle: ViewStyle;
  groupClass: string;
  separatorClass: string;
  itemClass: string;
  rowMin: number;
  label: number;
};

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle<T>(
  base: StyleProp<T>,
  consumer?: StyleProp<T> | null,
): StyleProp<T> | undefined {
  if (consumer == null) return base;
  return [base, consumer];
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/**
 * Palette frame, search bar, and row metrics. `maxHeight` on the list is the
 * virtualized scrollport (base only mounts rows in view), not a row's box.
 * Highlight, press, and dim live on `itemClass`: base draws each row once.
 * Call `commandVariants()` inside `computed` so `token()` follows the scheme.
 */
function look(): CommandChrome {
  const pointer = isPointer();
  return {
    root: {
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      borderCurve: "continuous",
      borderRadius: radius.control,
      backgroundColor: colors.card,
    },
    searchBarClass: "flex-row items-center gap-2 border-b border-border px-3",
    searchClass: "flex-1",
    searchStyle: {
      minHeight: pointer ? 44 : 48,
      fontSize: pointer ? 14 : 16,
      color: colors.foreground,
      placeholderColor: colors.mutedForeground,
    },
    listClass: "p-1.5",
    listStyle: { maxHeight: 320 },
    groupClass: "px-2 pt-2 pb-1",
    separatorClass: "-mx-1.5 my-1 h-px bg-border",
    itemClass:
      "group rounded-md border border-transparent transition-colors duration-100 motion-reduce:transition-none hover:bg-accent focus:border-ring focus:bg-accent active:opacity-70 disabled:opacity-50",
    rowMin: pointer ? 32 : 44,
    label: pointer ? 13 : 15,
  };
}

/** Palette chrome for the current idiom. Read it inside `computed` (or JSX). */
export function commandVariants(): CommandChrome {
  return look();
}

/** A magnifying-glass mark before the field. This package has no icon set. */
function SearchMark() {
  return (
    <Text
      style={{
        width: 16,
        textAlign: "center",
        fontSize: 14,
        color: colors.mutedForeground,
      }}
    >
      ⌕
    </Text>
  );
}

/** Shortcut keys. `secondary` stands in for the reference's raised key cap. */
function CommandKeys(props: { label: string }) {
  return (
    <View
      style={{
        minHeight: 20,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        backgroundColor: colors.secondary,
        boxShadow: finish.control.rest,
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: colors.mutedForeground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.label}
      </Text>
    </View>
  );
}

/** Section heading. Sentence case; the reference's small-caps faint line is `muted-foreground`. */
function CommandHeading(props: { group: CommandGroup }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.6,
        color: colors.mutedForeground,
        numberOfLines: 1,
      }}
    >
      {props.group.heading}
    </Text>
  );
}

/** Default row: label, shortcut, and a check when the item is the one in effect. */
function CommandRow(props: { entry: CommandEntry }) {
  const chrome = look();
  return (
    <View
      style={{
        minHeight: chrome.rowMin,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 8,
      }}
    >
      <Text
        class="text-foreground group-focus:text-accent-foreground flex-1"
        style={{ fontSize: chrome.label, numberOfLines: 1 }}
      >
        {props.entry.label}
      </Text>
      {props.entry.shortcutLabel ? <CommandKeys label={props.entry.shortcutLabel} /> : null}
      {props.entry.checked ? (
        <Text
          class="text-foreground group-focus:text-accent-foreground"
          style={{ width: 16, textAlign: "center", fontSize: 14 }}
        >
          ✓
        </Text>
      ) : null}
    </View>
  );
}

/** What the palette shows while nothing matches. */
function CommandEmpty() {
  return (
    <Text
      style={{
        paddingVertical: 24,
        textAlign: "center",
        fontSize: 13,
        color: colors.mutedForeground,
      }}
    >
      No results.
    </Text>
  );
}

/** A command palette: search field over virtualized, natively filtered rows. */
export function Command(props: CommandProps) {
  const [, rest] = split(props, [
    "style",
    "searchBarClass",
    "searchClass",
    "searchStyle",
    "listClass",
    "listStyle",
    "itemClass",
    "groupClass",
    "separatorClass",
    "renderItem",
    "renderGroup",
    "empty",
    "placeholder",
    "searchPrefix",
  ]);
  const chrome = computed(() => commandVariants());
  return (
    <BaseCommand
      {...rest}
      style={mergeStyle(chrome().root, props.style)}
      searchBarClass={mergeClass(chrome().searchBarClass, props.searchBarClass)}
      searchClass={mergeClass(chrome().searchClass, props.searchClass)}
      searchStyle={mergeStyle(chrome().searchStyle, props.searchStyle)}
      listClass={mergeClass(chrome().listClass, props.listClass)}
      listStyle={mergeStyle(chrome().listStyle, props.listStyle)}
      itemClass={mergeClass(chrome().itemClass, props.itemClass)}
      groupClass={mergeClass(chrome().groupClass, props.groupClass)}
      separatorClass={mergeClass(chrome().separatorClass, props.separatorClass)}
      placeholder={
        props.placeholder === undefined ? "Type a command or search…" : props.placeholder
      }
      searchPrefix={props.searchPrefix === undefined ? <SearchMark /> : props.searchPrefix}
      renderItem={
        props.renderItem === undefined ? (entry) => <CommandRow entry={entry} /> : props.renderItem
      }
      renderGroup={
        props.renderGroup === undefined
          ? (group) => <CommandHeading group={group} />
          : props.renderGroup
      }
      empty={props.empty === undefined ? <CommandEmpty /> : props.empty}
    />
  );
}
