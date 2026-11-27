// The reference of `combobox.tsx`: the same scene as upstream writes it, `comboboxLook`, `chipLook`
// and the listbox looks spread on `nsh/base`'s Combobox. The render check requires the two to draw
// the same pixels.
import { colors, terminal, toneColor, type Tone } from "@shadcn-nsh/theme";
import { Plus, X } from "lucide";
import type { JSX } from "nsh";
import { computed, mount, signal, Text, View } from "nsh";
import { Button as BaseButton, Combobox } from "nsh/base";

import { Avatar } from "@/packages/ui/avatar";
import { chipLook, chipsLook, comboboxLook, ComboToggle } from "@/packages/ui/combobox";
import { Icon } from "@/packages/ui/lib/icons";
import {
  clearButtonLook,
  ListboxEmpty,
  ListboxHeader,
  listboxFooter,
  listboxProps,
  OptionRow,
} from "@/packages/ui/lib/listbox";
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

/** One chosen value as a chip: `chipLook` spread on a View with its remove button. */
function Chip(props: {
  title: string;
  lead?: JSX.Element;
  disabled?: boolean;
  showRemove?: boolean;
  onRemove: () => void;
}) {
  const showRemove = props.showRemove ?? true;
  const look = chipLook({
    disabled: () => props.disabled,
    hasLead: () => props.lead != null,
    removable: () => showRemove,
  });
  return (
    <View style={look.style}>
      {props.lead ?? null}
      <Text style={look.textStyle}>{props.title}</Text>
      {showRemove ? (
        <BaseButton
          accessibilityLabel={`Remove ${props.title}`}
          disabled={props.disabled}
          class={look.removeClass}
          style={look.removeStyle}
          focusVisibleStyle={look.focusVisibleStyle}
          onPress={props.onRemove}
        >
          {terminal ? (
            <Text style={{ color: look.removeGlyph.tint }}>×</Text>
          ) : (
            <Icon icon={X} size={look.removeGlyph.size} tint={look.removeGlyph.tint} />
          )}
        </BaseButton>
      ) : null}
    </View>
  );
}

function App() {
  const labels = signal<string[]>(["bug", "ios"]);
  const assignee = signal<string[]>([]);
  const tags = signal<string[]>(["bug", "docs", "ios"]);
  const customTags = signal<{ value: string; title: string; tone: Tone }[]>([]);
  const tagQuery = signal("");
  const reviewers = signal<string[]>(["ada", "grace"]);
  const archived = signal<string[]>(["wontfix"]);
  const labelsOpen = signal(false);
  const assigneeOpen = signal(false);
  const tagsOpen = signal(false);
  const reviewersOpen = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 8));
  const opened =
    (name: string, set: (next: boolean) => void) =>
    ({ open }: { open: boolean }) => {
      set(open);
      log(`${name} ${open ? "opened" : "closed"}`);
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
      ? [{ value: `${NEW_TAG}${typedTag()}`, title: `Create “${typedTag()}”` }]
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
              >{`labels [${labels().join(", ")}]`}</Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`assignee ${assignee()[0] ?? "null"}`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`tags [${tags().join(", ")}]`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`reviewers [${reviewers().join(", ")}]`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`archived [${archived().join(", ")}]`}
              </Text>
            </Panel>
            <Log title="onChange · onConfirm" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 20 }}>
          <Field label="Labels" detail="Several at once, with search and sections">
            <Combobox
              items={LABELS}
              multiple
              cleanable
              value={labels()}
              placeholder={titlesOf(LABELS, labels()).join(", ") || "Add labels"}
              accessibilityLabel="Labels"
              onChange={({ value }) => {
                labels.set(value);
                log(`Labels → ${titlesOf(LABELS, value).join(", ") || "none"}`);
              }}
              onOpenChange={opened("Labels", (next) => labelsOpen.set(next))}
              {...comboboxLook(() => labelsOpen(), {
                filled: () => labels().length > 0,
                style: { width: "100%" },
              })}
              triggerButton={<ComboToggle open={labelsOpen()} />}
              empty={<ListboxEmpty label="No label matches" />}
              clearButtonAccessibilityLabel="Clear the labels"
              footerStyle={listboxFooter.style}
              footer={<Text style={listboxFooter.text}>{`${labels().length} selected`}</Text>}
              onConfirm={({ value }) => log(`Confirmed ${value.length} labels`)}
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
              {...clearButtonLook()}
              {...listboxProps()}
            />
          </Field>
          <Field label="Assignee" detail="One person: a choice replaces the last">
            <Combobox
              items={PEOPLE}
              value={assignee()}
              placeholder={titlesOf(PEOPLE, assignee()).join(", ") || "Assign someone"}
              accessibilityLabel="Assignee"
              onChange={({ value }) => {
                assignee.set(value);
                log(`Assignee → ${titlesOf(PEOPLE, value)[0] ?? "none"}`);
              }}
              onOpenChange={opened("Assignee", (next) => assigneeOpen.set(next))}
              {...comboboxLook(() => assigneeOpen(), { style: { width: "100%" } })}
              triggerButton={<ComboToggle id="assignee-toggle" open={assigneeOpen()} />}
              renderItem={(item) => <OptionRow item={item} detail={teamOf(item.value)} />}
              {...listboxProps()}
            />
          </Field>
          <Field label="Tags" detail="Search, wrap chips inside the field, or type to create one">
            <Combobox
              items={tagItems()}
              multiple
              value={tags()}
              placeholder={tags().length > 0 ? "" : "Search or create tags"}
              accessibilityLabel="Tags"
              query={tagQuery()}
              onQueryChange={({ query: next }) => tagQuery.set(next)}
              prefix={
                <View style={chipsLook()}>
                  <Each of={tags()} key={(value) => value}>
                    {(value) => (
                      <Chip
                        title={tagOf(value())?.title ?? value()}
                        lead={
                          <View style={{ paddingStart: 6 }}>
                            <Dot tone={tagOf(value())?.tone ?? "neutral"} />
                          </View>
                        }
                        onRemove={() => {
                          tags.set(tags().filter((tag) => tag !== value()));
                          log(
                            `Tags → ${
                              tags()
                                .map((v) => tagOf(v)?.title ?? v)
                                .join(", ") || "none"
                            }`,
                          );
                        }}
                      />
                    )}
                  </Each>
                </View>
              }
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
                log(`Tags → ${value.map((v) => tagOf(v)?.title ?? v).join(", ") || "none"}`);
              }}
              onOpenChange={(event) => {
                if (!event.open) tagQuery.set("");
                opened("Tags", (next) => tagsOpen.set(next))(event);
              }}
              {...comboboxLook(() => tagsOpen(), {
                filled: () => tags().length > 0,
                hasChips: () => tags().length > 0,
                style: { width: "100%" },
              })}
              triggerButton={<ComboToggle open={tagsOpen()} />}
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
              {...listboxProps()}
            />
          </Field>
          <Field label="Reviewers" detail="A chip's lead marks who it is; yours keeps its value">
            <Combobox
              items={PEOPLE}
              multiple
              value={reviewers()}
              placeholder={reviewers().length > 0 ? "" : "Add reviewers"}
              accessibilityLabel="Reviewers"
              prefix={
                <View style={chipsLook()}>
                  <Each of={reviewers()} key={(value) => value}>
                    {(value) => (
                      <Chip
                        title={titlesOf(PEOPLE, [value()])[0]}
                        lead={
                          <Avatar
                            name={titlesOf(PEOPLE, [value()])[0]}
                            style={{ width: 18, height: 18 }}
                          />
                        }
                        showRemove={value() !== "ada"}
                        onRemove={() =>
                          reviewers.set(reviewers().filter((person) => person !== value()))
                        }
                      />
                    )}
                  </Each>
                </View>
              }
              onChange={({ value }) => {
                reviewers.set(value);
                log(`Reviewers → ${titlesOf(PEOPLE, value).join(", ") || "none"}`);
              }}
              onOpenChange={opened("Reviewers", (next) => reviewersOpen.set(next))}
              {...comboboxLook(() => reviewersOpen(), {
                filled: () => reviewers().length > 0,
                hasChips: () => reviewers().length > 0,
                style: { width: "100%" },
              })}
              triggerButton={<ComboToggle open={reviewersOpen()} />}
              renderItem={(item) => <OptionRow item={item} detail={teamOf(item.value)} />}
              {...listboxProps()}
            />
          </Field>
          <Field label="Archived" detail="Disabled: the chips dim and their remove buttons rest">
            <Combobox
              items={LABELS}
              multiple
              disabled
              value={archived()}
              placeholder=""
              accessibilityLabel="Archived"
              prefix={
                <View style={chipsLook()}>
                  <Each of={archived()} key={(value) => value}>
                    {(value) => (
                      <Chip title={titlesOf(LABELS, [value()])[0]} disabled onRemove={() => {}} />
                    )}
                  </Each>
                </View>
              }
              {...comboboxLook(() => false, {
                filled: () => archived().length > 0,
                hasChips: () => archived().length > 0,
                style: { width: "100%" },
              })}
              triggerButton={<ComboToggle open={false} />}
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
              {...listboxProps()}
            />
          </Field>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
