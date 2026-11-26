import { alpha, colors, toneColor, type Tone } from "@shadcn-nsh/theme";
// Combobox: the official gallery's four scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Tags`, `People`, `Labels`, `Commands`) with this library's parts — several topics with search, four
// assignees as chips with faces, a label created from what is typed, and grouped commands with their
// shortcuts.
import type { IconNode } from "lucide";
import {
  Check,
  FileText,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Sun,
  Terminal as TerminalIcon,
} from "lucide";
import type { JSX } from "nsh";
import { computed, platform, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
} from "@/packages/ui/combobox";
import { Icon } from "@/packages/ui/lib/icons";
import { ListboxEmpty, ListboxHeader, OptionRow } from "@/packages/ui/lib/listbox";
import { controlSize, narrowWindow, RowLabel } from "@/packages/ui/lib/surface";

import { Caption, DemoCard, DemoPage } from "../kit";

const TOPICS = [
  { value: "layout", title: "Layout", group: "Core" },
  { value: "text", title: "Text", group: "Core" },
  { value: "animation", title: "Animation", group: "Core" },
  { value: "ios", title: "iOS", group: "Platforms" },
  { value: "android", title: "Android", group: "Platforms" },
  { value: "desktop", title: "Desktop", group: "Platforms" },
  { value: "web", title: "Web", group: "Platforms" },
  { value: "legacy", title: "Legacy", group: "Platforms", disabled: true },
];

const REVIEWERS = [
  { value: "ada", title: "Ada Lovelace" },
  { value: "grace", title: "Grace Hopper" },
  { value: "linus", title: "Linus Torvalds" },
];

const PEOPLE: {
  value: string;
  title: string;
  role: string;
  tone: Tone;
  disabled?: boolean;
}[] = [
  { value: "ada", title: "Ada Lovelace", role: "Engineering", tone: "accent" },
  { value: "grace", title: "Grace Hopper", role: "Platform", tone: "info" },
  { value: "alan", title: "Alan Turing", role: "Research", tone: "warn" },
  { value: "katherine", title: "Katherine Johnson", role: "Design", tone: "up" },
  { value: "margaret", title: "Margaret Hamilton", role: "Mobile", tone: "down" },
  { value: "linus", title: "Linus Torvalds", role: "Kernel", tone: "destructive" },
  {
    value: "dennis",
    title: "Dennis Ritchie",
    role: "Away until Monday",
    tone: "neutral",
    disabled: true,
  },
];
const MAX_PEOPLE = 4;

const LABELS: { value: string; title: string; tone: Tone }[] = [
  { value: "bug", title: "bug", tone: "destructive" },
  { value: "feature", title: "feature", tone: "up" },
  { value: "docs", title: "docs", tone: "info" },
  { value: "performance", title: "performance", tone: "warn" },
  { value: "good-first-issue", title: "good first issue", tone: "accent" },
];
const NEW_TONES: Tone[] = ["accent", "info", "up", "warn", "down"];
const NEW_LABEL = "new:";

const MOD = platform.desktop ? "⌘" : "Ctrl";
const COMMANDS: {
  value: string;
  title: string;
  group: string;
  icon: IconNode;
  keys?: string;
  disabled?: boolean;
}[] = [
  { value: "new-file", title: "New file", group: "Suggestions", icon: FileText, keys: `${MOD}N` },
  {
    value: "search",
    title: "Search everywhere",
    group: "Suggestions",
    icon: Search,
    keys: `${MOD}⇧F`,
  },
  { value: "sidebar", title: "Toggle sidebar", group: "View", icon: PanelLeft, keys: `${MOD}B` },
  { value: "terminal", title: "Toggle terminal", group: "View", icon: TerminalIcon, keys: "⌃`" },
  { value: "zoom", title: "Reset zoom", group: "View", icon: Search, disabled: true },
  { value: "dark", title: "Use the dark theme", group: "Appearance", icon: Moon },
  { value: "light", title: "Use the light theme", group: "Appearance", icon: Sun },
];

const titleOf = (items: { value: string; title: string }[], value: string | null) =>
  items.find((i) => i.value === value)?.title ?? "None";
const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

/** A face: the initials of a name on its tone's tint, ringed in the surface it sits on. */
function Avatar(props: { name: string; tone: Tone; size: number; on: string }) {
  return (
    <View
      style={{
        width: props.size,
        height: props.size,
        borderRadius: props.size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: alpha(toneColor(props.tone), 0.16),
        borderWidth: 1,
        borderColor: alpha(toneColor(props.tone), 0.4),
        boxShadow: `0 0 0 2px ${props.on}`,
      }}
    >
      <Text
        style={{
          fontSize: Math.round(props.size * 0.36),
          fontWeight: "600",
          color: toneColor(props.tone),
        }}
      >
        {initials(props.name)}
      </Text>
    </View>
  );
}

/** A dot of a label's tone. */
function Dot(props: { tone: Tone }) {
  return (
    <View
      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: toneColor(props.tone) }}
    />
  );
}

/** A label and its field on one line, a hairline between the rows. */
function Row(props: { label: string; detail: string; first?: boolean; children: JSX.Element }) {
  // A combobox's trigger keeps its width: on a narrow window the label goes above it rather than
  // squeezing to a column of letters.
  const narrow = () => narrowWindow();
  return (
    <View
      style={{
        flexDirection: narrow() ? "column" : "row",
        alignItems: narrow() ? "stretch" : "center",
        gap: 8,
        paddingVertical: 10,
        borderTopWidth: props.first ? 0 : 1,
        borderColor: colors.line,
      }}
    >
      <RowLabel label={props.label} detail={props.detail} />
      {props.children}
    </View>
  );
}

/** The chips of the chosen values, under their row. */

export function ComboboxDemo() {
  const last = signal("—");
  const topics = signal<string[]>(["layout", "ios"]);
  const reviewer = signal<string | null>(null);
  const people = signal<string[]>([]);
  const labels = signal<string[]>(["bug"]);
  const made = signal<{ value: string; title: string; tone: Tone }[]>([]);
  const query = signal("");
  const ran = signal<string | null>(null);

  const names = (items: { value: string; title: string }[], values: string[]) =>
    values.map((v) => titleOf(items, v));
  const topicsTitle = () => {
    const all = names(TOPICS, topics());
    return all.length <= 2 ? all.join(", ") : `${all.length} topics`;
  };
  const person = (value: string) => PEOPLE.find((p) => p.value === value)!;
  const full = computed(() => people().length >= MAX_PEOPLE);
  const peopleItems = computed(() =>
    PEOPLE.map((p) => ({
      value: p.value,
      title: p.title,
      disabled: p.disabled || (full() && !people().includes(p.value)),
    })),
  );
  const setPeople = (next: string[]) => {
    people.set(next);
    last.set(`Assignees: ${next.map((v) => person(v).title).join(", ") || "nobody"}`);
  };

  const allLabels = computed(() => [...LABELS, ...made()]);
  const label = (value: string) => allLabels().find((l) => l.value === value);
  const typed = computed(() => query().trim());
  const fresh = computed(
    () =>
      typed() !== "" && !allLabels().some((l) => l.title.toLowerCase() === typed().toLowerCase()),
  );
  const labelItems = computed(() => [
    ...allLabels().map(({ value, title }) => ({ value, title })),
    ...(fresh() ? [{ value: `${NEW_LABEL}${typed()}`, title: `Create “${typed()}”` }] : []),
  ]);
  const setLabels = (next: string[]) => {
    labels.set(next);
    last.set(`Labels: ${next.map((v) => label(v)?.title ?? v).join(", ") || "none"}`);
  };
  const chosen = computed(() => COMMANDS.find((c) => c.value === ran()));

  return (
    <DemoPage title="Combobox" note={() => last()}>
      <DemoCard title="Combobox" subtitle="Several values from a list: the app owns them">
        <View>
          <Row first label="Topics" detail="Several, with search">
            <Combobox
              multiple
              value={topics()}
              cleanable
              placeholder={topics().length ? topicsTitle() : "Add topics"}
              onChange={({ value }) => {
                topics.set(value);
                last.set(`Topics: ${names(TOPICS, value).join(", ") || "none"}`);
              }}
            >
              <ComboboxTrigger testID="topics-toggle" />
              <ComboboxContent items={TOPICS} accessibilityLabel="Topics" minWidth={220}>
                <Each of={["Core", "Platforms"]}>
                  {(group) => (
                    <ComboboxGroup>
                      <ComboboxLabel>{group()}</ComboboxLabel>
                      <Each of={TOPICS.filter((t) => t.group === group())}>
                        {(item) => (
                          <ComboboxItem value={item().value} disabled={item().disabled}>
                            {item().title}
                          </ComboboxItem>
                        )}
                      </Each>
                    </ComboboxGroup>
                  )}
                </Each>
              </ComboboxContent>
            </Combobox>
          </Row>
          <Row label="Reviewer" detail="One person at a time">
            <Combobox
              value={reviewer()}
              placeholder="Nobody"
              onChange={({ value }) => {
                reviewer.set(value);
                last.set(`Reviewer: ${value ? (names(REVIEWERS, [value])[0] ?? "none") : "none"}`);
              }}
            >
              <ComboboxTrigger />
              <ComboboxContent
                accessibilityLabel="Reviewer"
                minWidth={180}
                empty={<ListboxEmpty label="Nobody by that name" />}
              >
                <Each of={REVIEWERS}>
                  {(item) => <ComboboxItem value={item().value}>{item().title}</ComboboxItem>}
                </Each>
              </ComboboxContent>
            </Combobox>
          </Row>
        </View>
      </DemoCard>

      <DemoCard title="Assignees" subtitle="Up to four people, each a chip">
        <Row
          first
          label="Assignees"
          detail={full() ? "Four people at most" : "Who works on the task"}
        >
          <Combobox
            multiple
            value={people()}
            placeholder={
              people().length
                ? `${people().length} ${people().length === 1 ? "person" : "people"}`
                : "Assign"
            }
            onChange={({ value }) => setPeople(value)}
          >
            <ComboboxTrigger />
            <ComboboxChips>
              {(value) => (
                <ComboboxChip
                  value={value}
                  lead={
                    <Avatar
                      name={person(value).title}
                      tone={person(value).tone}
                      size={16}
                      on={colors.field}
                    />
                  }
                />
              )}
            </ComboboxChips>
            <ComboboxContent
              items={peopleItems()}
              accessibilityLabel="Assignees"
              minWidth={240}
              renderItem={(item) => (
                <OptionRow
                  item={item}
                  lead={
                    <Avatar
                      name={item.title}
                      tone={person(item.value).tone}
                      size={platform.desktop ? 24 : 30}
                      on={colors.raised}
                    />
                  }
                  note={person(item.value).role}
                />
              )}
              footer={
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  {full()
                    ? "Four assigned: take one off to add another"
                    : `${MAX_PEOPLE - people().length} more can be added`}
                </Text>
              }
              empty={<ListboxEmpty label="Nobody by that name" />}
            />
          </Combobox>
        </Row>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
          <Badge
            tone={full() ? "warn" : "neutral"}
          >{`${people().length} of ${MAX_PEOPLE} assigned`}</Badge>
          <Text style={{ flex: 1, fontSize: controlSize.detail, color: colors.mutedForeground }}>
            {full() ? "Take one off to add another" : "Faces, chips and a search over the team"}
          </Text>
        </View>
        {people().length === 0 ? <Caption>Nobody is on it yet</Caption> : null}
      </DemoCard>

      <DemoCard title="Labels" subtitle="Type a new label and Return creates it">
        <Row first label="Labels" detail="Search them, or create one">
          <Combobox
            multiple
            value={labels()}
            placeholder="Search or create labels"
            onChange={({ value }) => {
              const created = value.find((v) => v.startsWith(NEW_LABEL));
              if (created) {
                const title = created.slice(NEW_LABEL.length);
                made.set([
                  ...made(),
                  { value: created, title, tone: NEW_TONES[made().length % NEW_TONES.length] },
                ]);
                query.set("");
              }
              setLabels(value);
            }}
            onOpenChange={({ open }) => {
              if (!open) query.set("");
            }}
          >
            <ComboboxTrigger />
            <ComboboxChips>
              {(value) => (
                <ComboboxChip
                  value={value}
                  lead={
                    <View style={{ paddingLeft: 7 }}>
                      <Dot tone={label(value)?.tone ?? "neutral"} />
                    </View>
                  }
                />
              )}
            </ComboboxChips>
            <ComboboxContent
              items={labelItems()}
              accessibilityLabel="Labels"
              minWidth={240}
              query={query()}
              onQueryChange={({ query: q }) => query.set(q)}
              renderItem={(item) =>
                item.value.startsWith(NEW_LABEL) && !label(item.value) ? (
                  <OptionRow
                    item={item}
                    lead={<Icon icon={Plus} size={14} tint={colors.brand} />}
                    note={platform.desktop ? "Return" : undefined}
                  />
                ) : (
                  <OptionRow
                    item={item}
                    lead={
                      <View style={{ paddingLeft: 2 }}>
                        <Dot tone={label(item.value)?.tone ?? "neutral"} />
                      </View>
                    }
                    note={
                      label(item.value) && made().includes(label(item.value)!) ? "New" : undefined
                    }
                  />
                )
              }
            />
          </Combobox>
        </Row>
        <Caption>
          {labels().length ? "Chips sit in the field; a press on one takes it off" : "No label yet"}
        </Caption>
      </DemoCard>

      <DemoCard title="Command list" subtitle="Grouped actions with icons and shortcuts">
        <Combobox
          value={null}
          placeholder="Search commands…"
          onChange={({ value }) => {
            if (value == null) return;
            ran.set(value);
            last.set(`Command: ${titleOf(COMMANDS, value)}`);
          }}
        >
          <ComboboxTrigger />
          <ComboboxContent
            accessibilityLabel="Command"
            minWidth={240}
            empty={<ListboxEmpty label="No command matches" />}
            renderGroup={(group) => <ListboxHeader group={group} />}
            renderItem={(item) => (
              <OptionRow
                item={item}
                lead={
                  <Icon
                    icon={COMMANDS.find((c) => c.value === item.value)!.icon}
                    size={14}
                    tint={colors.mutedForeground}
                  />
                }
                note={
                  item.disabled
                    ? "At 100%"
                    : platform.desktop
                      ? COMMANDS.find((c) => c.value === item.value)!.keys
                      : undefined
                }
              />
            )}
          >
            <Each of={["Suggestions", "View", "Appearance"]}>
              {(group) => (
                <ComboboxGroup>
                  <ComboboxLabel>{group()}</ComboboxLabel>
                  <Each of={COMMANDS.filter((c) => c.group === group())}>
                    {(item) => (
                      <ComboboxItem value={item().value} disabled={item().disabled}>
                        {item().title}
                      </ComboboxItem>
                    )}
                  </Each>
                </ComboboxGroup>
              )}
            </Each>
          </ComboboxContent>
        </Combobox>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 }}>
          {chosen() ? (
            <>
              <Icon icon={Check} size={14} tint={toneColor("up")} />
              <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                {`Ran “${chosen()!.title}”`}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
              Nothing run yet
            </Text>
          )}
        </View>
      </DemoCard>
    </DemoPage>
  );
}
