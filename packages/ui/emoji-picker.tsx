// An emoji picker panel: the groups and their tabs, the skin tone hand, the preview, and the
// panel that composes them. All of it is look — the picker itself is `nsh/base`'s, so there is
// no shell below.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, font, terminal } from "@shadcn-nsh/theme";
import {
  Car,
  Clock,
  Flag,
  Heart,
  Leaf,
  Lightbulb,
  Search,
  Smile,
  type IconNode,
  User,
  Utensils,
  Volleyball,
} from "lucide";
import type { StyleProp, TextStyle, ViewStyle } from "nsh";
import { platform, signal, split, Text, View } from "nsh";
import {
  EmojiPicker,
  Tab,
  Tabs,
  type EmojiEntry,
  type EmojiGroup,
  type EmojiGroupId,
  type EmojiGroupLabels,
  type EmojiPickerRef,
  type EmojiSkinTone,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { joinClass } from "./lib/utils";

/** An emoji as the picker hands it over (`onSelect`, `renderItem`), from `nsh/base`. */
export type { EmojiEntry };

/** A section of the picker's tabs, from `nsh/base`. */
export type { EmojiGroup };

/** A section's id, from `nsh/base`. */
export type { EmojiGroupId };

/** The app's names for the sections, from `nsh/base`. */
export type { EmojiGroupLabels };

/** The picker's ref, from `nsh/base`. */
export type { EmojiPickerRef };

/** A skin tone of the picker, from `nsh/base`. */
export type { EmojiSkinTone };

/** A group's heading: quiet semibold, as Slack's. */
export function EmojiHeading(props: {
  group: EmojiGroup;
  /** Tailwind classes on the heading. */
  class?: string;
  /** Tailwind classes toggled on the heading. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over the heading. `style` wins over `class`. */
  style?: StyleProp<TextStyle>;
}) {
  const [, rest] = split(props, ["group", "class", "classList", "style"]);
  return (
    <Text
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[
        {
          fontSize: platform.desktop ? 11.5 : 13,
          fontWeight: font.weight("title"),
          color: colors.mutedForeground,
        },
        props.style ?? null,
      ]}
    >
      {props.group.label}
    </Text>
  );
}

/** The groups' tabs: the group at the top selected, a press scrolls there. */
export function EmojiTabs(props: {
  group: string;
  groups: typeof emojiGroups;
  onPress: (id: EmojiGroupId) => void;
  /** Tailwind classes on the tab row, after its own. */
  class?: string;
  /** Tailwind classes toggled on the tab row. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over the tab row. `style` wins over `class`. */
  style?: StyleProp<ViewStyle>;
}) {
  const [, rest] = split(props, ["group", "groups", "onPress", "class", "classList", "style"]);
  return (
    <Tabs
      {...rest}
      class={joinClass(
        `flex-row justify-between ${platform.desktop ? "mx-2 mt-1.5 h-9 items-start" : "border-border mx-1 h-12 items-end border-t"}`,
        props.class,
      )}
      classList={props.classList}
      style={props.style}
      indicatorClass={
        platform.desktop
          ? "bottom-0 mx-2 h-0.5 rounded-full bg-foreground"
          : "top-0 mx-3 h-0.5 rounded-full bg-foreground"
      }
    >
      {props.groups.map((g) => (
        <Tab
          selected={props.group === g.id}
          onPress={() => props.onPress(g.id)}
          accessibilityLabel={g.label}
          tooltip={platform.desktop ? g.label : undefined}
          class={`hover:bg-surface focus-visible:outline-ring items-center justify-center rounded-(--radius-md) focus-visible:outline-2 ${platform.desktop ? "h-8 w-8" : "h-11 flex-1"}`}
        >
          {terminal ? (
            <Text>{g.emoji}</Text>
          ) : (
            <Icon
              icon={g.icon}
              size={platform.desktop ? 17 : 21}
              tint={props.group === g.id ? colors.foreground : colors.faint}
            />
          )}
        </Tab>
      ))}
    </Tabs>
  );
}

/**
 * The skin tone hand beside the search field: a press lays the six tones
 * out beside it, a press on one takes it (Slack's).
 */
export function EmojiTones(props: {
  tone: EmojiSkinTone;
  onChange: (tone: EmojiSkinTone) => void;
  /** Tailwind classes on the root (the hand while closed, the row while open), after its own. */
  class?: string;
  /** Tailwind classes toggled on that root. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over that root. `style` wins over `class`. */
  style?: StyleProp<ViewStyle>;
}) {
  const [, rest] = split(props, ["tone", "onChange", "class", "classList", "style"]);
  const open = signal(false);
  const current = () => tones.find((t) => t.tone === props.tone) ?? tones[0];
  // One hand: the chosen one sits on the page's fill, cut out of the panel — `selectedStyle`,
  // the same state it announces (`accessibilityState.selected`).
  const hand = (t: (typeof tones)[number], onPress: () => void, selected = false, root = false) => (
    <View
      {...(root ? rest : {})}
      role="button"
      accessibilityLabel={t.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      class={joinClass(
        `hover:bg-accent items-center justify-center rounded-(--radius-md) active:scale-90 ${platform.desktop ? "size-6" : "size-8"}`,
        root ? props.class : undefined,
      )}
      classList={root ? props.classList : undefined}
      style={root ? props.style : undefined}
      selectedStyle={{ backgroundColor: colors.background }}
    >
      <Text style={{ fontSize: platform.desktop ? 15 : 19 }}>{t.hand}</Text>
    </View>
  );
  return (
    <If when={open()} else={hand(current(), () => open.set(true), false, true)}>
      <View
        {...rest}
        class={props.class}
        classList={props.classList}
        style={[{ flexDirection: "row", gap: 1 }, props.style ?? null]}
      >
        {tones.map((t) =>
          hand(
            t,
            () => {
              props.onChange(t.tone);
              open.set(false);
            },
            t.tone === props.tone,
          ),
        )}
      </View>
    </If>
  );
}

/** The emoji under the pointer or the keys, named; a hint while none is. */
export function EmojiPreview(props: {
  entry: EmojiEntry | null;
  hint: string;
  /** Tailwind classes on the preview, after its own. */
  class?: string;
  /** Tailwind classes toggled on the preview. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over the preview. `style` wins over `class`. */
  style?: StyleProp<ViewStyle>;
}) {
  const [, rest] = split(props, ["entry", "hint", "class", "classList", "style"]);
  return (
    <View
      {...rest}
      class={joinClass(
        "border-border h-12 flex-row items-center gap-2.5 border-t px-3",
        props.class,
      )}
      classList={props.classList}
      style={props.style}
    >
      <If
        when={props.entry}
        else={<Text style={{ fontSize: 12, color: colors.faint }}>{props.hint}</Text>}
      >
        {(entry) => (
          <>
            <Text style={{ fontSize: 26 }}>{entry().emoji}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  numberOfLines: 1,
                  fontSize: 13,
                  fontWeight: font.weight("label"),
                  color: colors.foreground,
                }}
              >
                {capitalized(entry().label)}
              </Text>
              <Text style={{ numberOfLines: 1, fontSize: 11.5, color: colors.faint }}>
                {emojiGroups.find((g) => g.id === entry().group)?.label}
              </Text>
            </View>
          </>
        )}
      </If>
    </View>
  );
}

/**
 * The whole picker: tabs, search with the skin tone hand, the grid, the
 * preview on a desktop (the tabs at the bottom on a phone, `fill`ing the
 * sheet). `recent` leads; the skin tone is kept here for the demo's life.
 */
export function EmojiPanel(props: {
  onSelect: (e: { emoji: string; base: string }) => void;
  onCancel?: () => void;
  recent?: string[];
  fill?: boolean;
  /** Tailwind classes on the picker, after its size. */
  class?: string;
  /** Tailwind classes toggled on the picker. */
  classList?: Record<string, boolean | null | undefined>;
  /** Style over the picker. `style` wins over `class`. */
  style?: StyleProp<ViewStyle>;
  /** The id UI tests find the picker by. */
  testID?: string;
  /** What screen readers call the grid and its search field (default "Emoji"). */
  accessibilityLabel?: string;
}) {
  const [, rest] = split(props, [
    "onSelect",
    "onCancel",
    "recent",
    "fill",
    "class",
    "classList",
    "style",
    "testID",
    "accessibilityLabel",
  ]);
  const tone = signal<EmojiSkinTone>("none");
  const group = signal<string>("");
  const active = signal<EmojiEntry | null>(null);
  let picker: EmojiPickerRef | undefined;
  const groups = () =>
    emojiGroups.filter((g) => g.id !== "recent" || (props.recent?.length ?? 0) > 0);
  const tabs = () => (
    <EmojiTabs
      group={group() || groups()[0].id}
      groups={groups()}
      onPress={(id) => picker?.scrollToGroup(id)}
    />
  );
  return (
    <EmojiPicker
      {...rest}
      ref={(r) => (picker = r)}
      // In the terminal as wide as its grid: twelve cells of three columns and the rows' padding.
      class={joinClass(
        props.fill ? "flex-1" : terminal ? "h-[392px] w-[304px]" : "h-[392px] w-[342px]",
        props.class,
      )}
      classList={props.classList}
      style={props.style}
      recent={props.recent ?? []}
      skinTone={tone()}
      groupLabels={emojiGroupLabels}
      columns={terminal ? 12 : platform.desktop ? 9 : 8}
      emojiVersion="15.1"
      autoFocus={platform.desktop}
      placeholder="Search emoji"
      testID={props.testID}
      accessibilityLabel={props.accessibilityLabel ?? "Emoji"}
      searchAccessibilityLabel="Search emoji"
      onSelect={({ emoji, base }) => props.onSelect({ emoji, base })}
      onCancel={props.onCancel}
      onGroupChange={({ group: next }) => group.set(next)}
      onHighlightChange={({ highlighted }) => active.set(highlighted)}
      searchBarClass={emojiPickerClasses.searchBar}
      searchClass={emojiPickerClasses.search}
      listClass={emojiPickerClasses.list}
      rowClass={emojiPickerClasses.row}
      groupClass={emojiPickerClasses.group}
      itemClass={emojiPickerClasses.item}
      searchPrefix={<Icon icon={Search} size={platform.desktop ? 14 : 16} tint={colors.faint} />}
      searchSuffix={<EmojiTones tone={tone()} onChange={(next) => tone.set(next)} />}
      header={props.fill ? undefined : tabs()}
      footer={props.fill ? tabs() : <EmojiPreview entry={active()} hint="Pick an emoji…" />}
      empty={
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingBottom: 24,
          }}
        >
          <Text style={{ fontSize: 28 }}>🔍</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>No emoji found</Text>
        </View>
      }
      loading={
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 13, color: colors.faint }}>Loading emoji…</Text>
        </View>
      }
      renderGroup={(g) => <EmojiHeading group={g} />}
    />
  );
}

// Private helpers & looks

/**
 * The groups, their names and their tabs' icons; in the terminal, which draws no icons, an emoji of
 * the group (two Cells, no variation selector, whose width terminals disagree on).
 */
const emojiGroups: { id: EmojiGroupId; label: string; icon: IconNode; emoji: string }[] = [
  { id: "recent", label: "Frequently used", icon: Clock, emoji: "🕘" },
  { id: "smileysEmotion", label: "Smileys & emotion", icon: Smile, emoji: "😀" },
  { id: "peopleBody", label: "People & body", icon: User, emoji: "👋" },
  { id: "animalsNature", label: "Animals & nature", icon: Leaf, emoji: "🐻" },
  { id: "foodDrink", label: "Food & drink", icon: Utensils, emoji: "🍔" },
  { id: "travelPlaces", label: "Travel & places", icon: Car, emoji: "🚗" },
  { id: "activities", label: "Activities", icon: Volleyball, emoji: "⚽" },
  { id: "objects", label: "Objects", icon: Lightbulb, emoji: "💡" },
  { id: "symbols", label: "Symbols", icon: Heart, emoji: "🔣" },
  { id: "flags", label: "Flags", icon: Flag, emoji: "🏁" },
];

/** The groups' headings. */
const emojiGroupLabels = Object.fromEntries(
  emojiGroups.map((g) => [g.id, g.label]),
) as EmojiGroupLabels;

/** The skin tones in the hand's order, and the hand that shows each. */
const tones: { tone: EmojiSkinTone; hand: string; label: string }[] = [
  { tone: "none", hand: "✋", label: "Default skin tone" },
  { tone: "light", hand: "✋🏻", label: "Light skin tone" },
  { tone: "mediumLight", hand: "✋🏼", label: "Medium-light skin tone" },
  { tone: "medium", hand: "✋🏽", label: "Medium skin tone" },
  { tone: "mediumDark", hand: "✋🏾", label: "Medium-dark skin tone" },
  { tone: "dark", hand: "✋🏿", label: "Dark skin tone" },
];

/** The classes of the picker's parts. */
const emojiPickerClasses = {
  searchBar: `flex-row items-center gap-2 rounded-(--radius-md) bg-surface ${platform.desktop ? "mx-2.5 mt-2 h-8 pl-2.5 pr-1" : "mx-3 mt-1 h-10 pl-3 pr-1.5"}`,
  search: `flex-1 ${platform.desktop ? "text-[13px]" : "text-base"} text-foreground placeholder:text-muted-foreground`,
  list: "mt-1 flex-1",
  /** Eight points each side: some glyphs (🫡) reach past their cell. */
  row: "px-2",
  group: platform.desktop ? "px-3 pt-2.5 pb-1" : "px-3.5 pt-3 pb-1.5",
  /**
   * A cell: quiet until the pointer or the keys are on it (one gray for both, as Slack's), sunk
   * while pressed; in the terminal three Cells, the emoji's two and a column between them.
   */
  item: terminal
    ? "w-6 h-4 items-center justify-center focus:bg-surface"
    : platform.desktop
      ? "size-9 items-center justify-center rounded-(--radius-md) text-[22px] transition-colors duration-100 motion-reduce:transition-none hover:bg-surface focus:bg-surface active:scale-90"
      : "h-12 flex-1 items-center justify-center rounded-(--radius-md) text-[28px] active:bg-surface",
};

/** A label's first letter up: the emoji's name as a sentence. */
const capitalized = (s: string) => (s ? s[0].toLocaleUpperCase() + s.slice(1) : s);
