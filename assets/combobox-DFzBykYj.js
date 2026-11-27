var e=`// The official combobox scene (\`references/nsh/website/demos/el-combobox.tsx\`) with this library's
// parts and showcase-grade multi-chip ergonomics: grouped labels with tone dots, an assignee list
// with team details, creatable colored-dot tags wrapped full-width inside the field, avatar chips
// with locked items, and a disabled chip field; the inspector holds what each field has and logs
// every change.
import { colors, toneColor, type Tone } from "@shadcn-nsh/theme";
import { Plus } from "lucide";
import type { JSX } from "nsh";
import { computed, mount, signal, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
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
import { ListboxEmpty, ListboxHeader, listboxFooter, OptionRow } from "@/packages/ui/lib/listbox";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

const LABELS: { value: string; title: string; group: string; tone: Tone; disabled?: boolean }[] = [
  { value: "bug", title: "Bug", group: "Type", tone: "destructive" },
  { value: "feature", title: "Feature", group: "Type", tone: "success" },
  { value: "docs", title: "Docs", group: "Type", tone: "info" },
  { value: "ios", title: "iOS", group: "Platform", tone: "accent" },
  { value: "android", title: "Android", group: "Platform", tone: "success" },
  { value: "macos", title: "macOS", group: "Platform", tone: "accent" },
  { value: "windows", title: "Windows", group: "Platform", tone: "info" },
  { value: "linux", title: "Linux", group: "Platform", tone: "warning" },
  { value: "web", title: "Web", group: "Platform", tone: "info" },
  { value: "wontfix", title: "Won't fix", group: "Status", tone: "neutral", disabled: true },
  { value: "blocked", title: "Blocked", group: "Status", tone: "warning" },
];

const NEW_TONES: Tone[] = ["accent", "info", "success", "warning", "destructive"];
const NEW_TAG = "new:";

const PEOPLE = [
  { value: "ada", title: "Ada Lovelace", team: "Mathematics" },
  { value: "grace", title: "Grace Hopper", team: "Compilers" },
  { value: "linus", title: "Linus Torvalds", team: "Kernel" },
  { value: "margaret", title: "Margaret Hamilton", team: "Flight software" },
];

/** The line under a person's name: the team they are on. */
const teamOf = (value: string) => PEOPLE.find((person) => person.value === value)?.team;

const titlesOf = (items: { value: string; title: string }[], values: string[]) =>
  values.map((v) => items.find((i) => i.value === v)?.title ?? v);

const SECTIONS = ["Type", "Platform", "Status"] as const;

/** A tone dot used inside label/tag options and chips. */
function Dot(props: { tone: Tone }) {
  return (
    <View
      style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: toneColor(props.tone) }}
    />
  );
}

/** A label over its control, a quieter line under the label. */
function Field(props: { label: string; detail: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: ui().text }}>{props.label}</Text>
        <Text style={{ fontSize: 12, color: ui().muted }}>{props.detail}</Text>
      </View>
      {props.children}
    </View>
  );
}

function App() {
  const labels = signal<string[]>(["bug", "ios"]);
  const assignee = signal<string | null>(null);
  const tags = signal<string[]>(["bug", "docs", "ios"]);
  const customTags = signal<{ value: string; title: string; tone: Tone }[]>([]);
  const tagQuery = signal("");
  const reviewers = signal<string[]>(["ada", "grace"]);
  const archived = signal<string[]>(["wontfix"]);
  const labelsOpen = signal(false);
  const assigneeOpen = signal(false);
  const tagsOpen = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 8));
  const opened =
    (name: string, set: (next: boolean) => void) =>
    ({ open }: { open: boolean }) => {
      set(open);
      log(\`\${name} \${open ? "opened" : "closed"}\`);
    };

  const allTags = computed(() => [
    ...LABELS.map(({ value, title, tone, disabled }) => ({ value, title, tone, disabled })),
    ...customTags().map((tag) => ({ ...tag, disabled: false })),
  ]);
  const tagOf = (value: string) => allTags().find((entry) => entry.value === value);
  const typedTag = computed(() => tagQuery().trim());
  const canCreateTag = computed(
    () =>
      typedTag() !== "" &&
      !allTags().some((entry) => entry.title.toLowerCase() === typedTag().toLowerCase()),
  );
  const tagItems = computed(() => [
    ...allTags().map(({ value, title, disabled }) => ({ value, title, disabled })),
    ...(canCreateTag()
      ? [{ value: \`\${NEW_TAG}\${typedTag()}\`, title: \`Create “\${typedTag()}”\` }]
      : []),
  ]);

  return (
    <DemoPage title="Combobox">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Pick several labels without the list closing; Cmd+Return confirms"
          : "Tap labels to toggle them; tap outside to finish"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text
                style={{ fontSize: 13, color: ui().text }}
              >{\`labels [\${labels().join(", ")}]\`}</Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {\`assignee \${assignee() ?? "null"}\`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {\`tags [\${tags().join(", ")}]\`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {\`reviewers [\${reviewers().join(", ")}]\`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {\`archived [\${archived().join(", ")}]\`}
              </Text>
            </Panel>
            <Log title="onChange · onConfirm" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 20 }}>
          <Field label="Labels" detail="Several at once, with search and sections">
            <Combobox
              multiple
              cleanable
              value={labels()}
              placeholder="Add labels"
              onChange={({ value }) => {
                labels.set(value);
                log(\`Labels → \${titlesOf(LABELS, value).join(", ") || "none"}\`);
              }}
              onOpenChange={opened("Labels", (next) => labelsOpen.set(next))}
            >
              <ComboboxTrigger />
              <ComboboxContent
                accessibilityLabel="Labels"
                style={{ width: "100%" }}
                empty={<ListboxEmpty label="No label matches" />}
                clearButtonAccessibilityLabel="Clear the labels"
                footerStyle={listboxFooter.style}
                footer={<Text style={listboxFooter.text}>{\`\${labels().length} selected\`}</Text>}
                onConfirm={({ value }) => log(\`Confirmed \${value.length} labels\`)}
                renderItem={(item) => (
                  <OptionRow
                    item={item}
                    lead={
                      <View style={{ paddingStart: 2 }}>
                        <Dot tone={tagOf(item.value)?.tone ?? "neutral"} />
                      </View>
                    }
                  />
                )}
                renderGroup={(group) => <ListboxHeader group={group} />}
              >
                {SECTIONS.map((section) => (
                  <ComboboxGroup>
                    <ComboboxLabel>{section}</ComboboxLabel>
                    {LABELS.filter((label) => label.group === section).map((item) => (
                      <ComboboxItem value={item.value} disabled={item.disabled}>
                        {item.title}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                ))}
              </ComboboxContent>
            </Combobox>
          </Field>
          <Field label="Assignee" detail="One person: a choice replaces the last">
            <Combobox
              value={assignee()}
              placeholder="Assign someone"
              onChange={({ value }) => {
                assignee.set(value);
                log(\`Assignee → \${value ? titlesOf(PEOPLE, [value])[0] : "none"}\`);
              }}
              onOpenChange={opened("Assignee", (next) => assigneeOpen.set(next))}
            >
              <ComboboxTrigger testID="assignee-toggle" />
              <ComboboxContent
                accessibilityLabel="Assignee"
                style={{ width: "100%" }}
                renderItem={(item) => <OptionRow item={item} detail={teamOf(item.value)} />}
              >
                {PEOPLE.map((item) => (
                  <ComboboxItem value={item.value}>{item.title}</ComboboxItem>
                ))}
              </ComboboxContent>
            </Combobox>
          </Field>
          <Field label="Tags" detail="Search, wrap chips inside the field, or type to create one">
            <Combobox
              multiple
              value={tags()}
              placeholder="Search or create tags"
              onChange={({ value }) => {
                const created = value.find((v) => v.startsWith(NEW_TAG));
                if (created && !tagOf(created)) {
                  const title = created.slice(NEW_TAG.length);
                  customTags.set([
                    ...customTags(),
                    {
                      value: created,
                      title,
                      tone: NEW_TONES[customTags().length % NEW_TONES.length]!,
                    },
                  ]);
                  tagQuery.set("");
                }
                tags.set(value);
                log(\`Tags → \${value.map((v) => tagOf(v)?.title ?? v).join(", ") || "none"}\`);
              }}
              onOpenChange={(event) => {
                if (!event.open) tagQuery.set("");
                opened("Tags", (next) => tagsOpen.set(next))(event);
              }}
            >
              <ComboboxChips>
                {(value) => (
                  <ComboboxChip
                    value={value}
                    lead={
                      <View style={{ paddingStart: 6 }}>
                        <Dot tone={tagOf(value)?.tone ?? "neutral"} />
                      </View>
                    }
                  />
                )}
              </ComboboxChips>
              <ComboboxTrigger />
              <ComboboxContent
                accessibilityLabel="Tags"
                style={{ width: "100%" }}
                items={tagItems()}
                query={tagQuery()}
                onQueryChange={({ query: next }) => tagQuery.set(next)}
                empty={<ListboxEmpty label="No tag matches" />}
                renderItem={(item) =>
                  item.value.startsWith(NEW_TAG) && !tagOf(item.value) ? (
                    <OptionRow
                      item={item}
                      lead={<Icon icon={Plus} size={14} tint={colors.brand} />}
                      note={desktop ? "Return" : undefined}
                    />
                  ) : (
                    <OptionRow
                      item={item}
                      lead={
                        <View style={{ paddingStart: 2 }}>
                          <Dot tone={tagOf(item.value)?.tone ?? "neutral"} />
                        </View>
                      }
                      note={
                        customTags().some((entry) => entry.value === item.value) ? "New" : undefined
                      }
                    />
                  )
                }
              />
            </Combobox>
          </Field>
          <Field label="Reviewers" detail="A chip's lead marks who it is; yours keeps its value">
            <Combobox
              multiple
              value={reviewers()}
              onChange={({ value }) => {
                reviewers.set(value);
                log(\`Reviewers → \${titlesOf(PEOPLE, value).join(", ") || "none"}\`);
              }}
            >
              <ComboboxChips>
                {(value) => (
                  <ComboboxChip
                    value={value}
                    lead={
                      <Avatar
                        name={titlesOf(PEOPLE, [value])[0]}
                        style={{ width: 18, height: 18 }}
                      />
                    }
                    showRemove={value !== "ada"}
                  />
                )}
              </ComboboxChips>
              <ComboboxTrigger />
              <ComboboxContent
                accessibilityLabel="Reviewers"
                style={{ width: "100%" }}
                renderItem={(item) => <OptionRow item={item} detail={teamOf(item.value)} />}
              >
                {PEOPLE.map((item) => (
                  <ComboboxItem value={item.value}>{item.title}</ComboboxItem>
                ))}
              </ComboboxContent>
            </Combobox>
          </Field>
          <Field label="Archived" detail="Disabled: the chips dim and their remove buttons rest">
            <Combobox multiple disabled value={archived()}>
              <ComboboxChips />
              <ComboboxContent
                accessibilityLabel="Archived"
                style={{ width: "100%" }}
                renderItem={(item) => (
                  <OptionRow
                    item={item}
                    lead={
                      <View style={{ paddingStart: 2 }}>
                        <Dot tone={tagOf(item.value)?.tone ?? "neutral"} />
                      </View>
                    }
                  />
                )}
              >
                {LABELS.map((item) => (
                  <ComboboxItem value={item.value}>{item.title}</ComboboxItem>
                ))}
              </ComboboxContent>
            </Combobox>
          </Field>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};