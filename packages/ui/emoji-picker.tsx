// An emoji picker panel. Ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import { colors } from "@shadcn-nsh/theme";
import { platform, signal, Text, View } from "nsh";
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

import { Icon, type IconName } from "./lib/icons";

// @port emoji.tsx
/** The groups, their names and their tabs' icons. */
export const emojiGroups: { id: EmojiGroupId; label: string; icon: IconName }[] = [
  { id: "recent", label: "Frequently used", icon: "clock" },
  { id: "smileysEmotion", label: "Smileys & emotion", icon: "smile" },
  { id: "peopleBody", label: "People & body", icon: "person" },
  { id: "animalsNature", label: "Animals & nature", icon: "leaf" },
  { id: "foodDrink", label: "Food & drink", icon: "food" },
  { id: "travelPlaces", label: "Travel & places", icon: "car" },
  { id: "activities", label: "Activities", icon: "ball" },
  { id: "objects", label: "Objects", icon: "bulb" },
  { id: "symbols", label: "Symbols", icon: "heart" },
  { id: "flags", label: "Flags", icon: "flag" },
];

/** The groups' headings. */
export const emojiGroupLabels = Object.fromEntries(
  emojiGroups.map((g) => [g.id, g.label]),
) as EmojiGroupLabels;

/** The skin tones in the hand's order, and the hand that shows each. */
const TONES: { tone: EmojiSkinTone; hand: string; label: string }[] = [
  { tone: "none", hand: "✋", label: "Default skin tone" },
  { tone: "light", hand: "✋🏻", label: "Light skin tone" },
  { tone: "mediumLight", hand: "✋🏼", label: "Medium-light skin tone" },
  { tone: "medium", hand: "✋🏽", label: "Medium skin tone" },
  { tone: "mediumDark", hand: "✋🏾", label: "Medium-dark skin tone" },
  { tone: "dark", hand: "✋🏿", label: "Dark skin tone" },
];

/** The classes of the picker's parts. */
export const emojiPickerClasses = {
  searchBar: `flex-row items-center gap-2 rounded-lg bg-raised ${platform.desktop ? "mx-2.5 mt-2 h-8 pl-2.5 pr-1" : "mx-3 mt-1 h-10 pl-3 pr-1.5"}`,
  search: `flex-1 ${platform.desktop ? "text-[13px]" : "text-base"} text-foreground placeholder:text-muted-foreground`,
  list: "mt-1 flex-1",
  /** Eight points each side: some glyphs (🫡) reach past their cell. */
  row: "px-2",
  group: platform.desktop ? "px-3 pt-2.5 pb-1" : "px-3.5 pt-3 pb-1.5",
  /** A cell: quiet until the pointer or the keys are on it (one gray for both, as Slack's), sunk while pressed. */
  item: platform.desktop
    ? "size-9 items-center justify-center rounded-md text-[22px] transition-colors duration-100 motion-reduce:transition-none hover:bg-raised focus:bg-raised active:scale-90"
    : "h-12 flex-1 items-center justify-center rounded-lg text-[28px] active:bg-raised",
};

/** A group's heading: quiet semibold, as Slack's. */
export function EmojiHeading(props: { group: EmojiGroup }) {
  return (
    <Text
      style={{ fontSize: platform.desktop ? 11.5 : 13, fontWeight: "600", color: colors.muted }}
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
}) {
  return (
    <Tabs
      class={`flex-row justify-between ${platform.desktop ? "mx-2 mt-1.5 h-9 items-start" : "border-border mx-1 h-12 items-end border-t"}`}
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
          class={`hover:bg-raised focus-visible:outline-ring items-center justify-center rounded-md focus-visible:outline-2 ${platform.desktop ? "h-8 w-8" : "h-11 flex-1"}`}
        >
          <Icon
            name={g.icon}
            size={platform.desktop ? 17 : 21}
            tint={props.group === g.id ? colors.text : colors.faint}
          />
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
}) {
  const open = signal(false);
  const current = () => TONES.find((t) => t.tone === props.tone) ?? TONES[0];
  const hand = (t: (typeof TONES)[number], onPress: () => void, selected = false) => (
    <View
      role="button"
      accessibilityLabel={t.label}
      accessibilityState={{ selected }}
      onPress={onPress}
      class={`hover:bg-hover items-center justify-center rounded-md active:scale-90 ${platform.desktop ? "size-6" : "size-8"}`}
      style={selected ? { backgroundColor: colors.background } : undefined}
    >
      <Text style={{ fontSize: platform.desktop ? 15 : 19 }}>{t.hand}</Text>
    </View>
  );
  return (
    <If when={open()} else={hand(current(), () => open.set(true))}>
      <View style={{ flexDirection: "row", gap: 1 }}>
        {TONES.map((t) =>
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
export function EmojiPreview(props: { entry: EmojiEntry | null; hint: string }) {
  return (
    <View class="border-border h-12 flex-row items-center gap-2.5 border-t px-3">
      <If
        when={props.entry}
        else={<Text style={{ fontSize: 12, color: colors.faint }}>{props.hint}</Text>}
      >
        {(entry) => (
          <>
            <Text style={{ fontSize: 26 }}>{entry().emoji}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{ numberOfLines: 1, fontSize: 13, fontWeight: "500", color: colors.text }}
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

const capitalized = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

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
  class?: string;
}) {
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
      ref={(r) => (picker = r)}
      class={props.class ?? (props.fill ? "flex-1" : "h-[392px] w-[342px]")}
      recent={props.recent ?? []}
      skinTone={tone()}
      groupLabels={emojiGroupLabels}
      columns={platform.desktop ? 9 : 8}
      emojiVersion="15.1"
      autoFocus={platform.desktop}
      placeholder="Search emoji"
      accessibilityLabel="Emoji"
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
      searchPrefix={<Icon name="search" size={platform.desktop ? 14 : 16} tint={colors.faint} />}
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
          <Text style={{ fontSize: 13, color: colors.muted }}>No emoji found</Text>
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
// @port end
