// The official combobox scene (`references/nsh/website/demos/el-combobox.tsx`) with this library's
// parts: labels for an issue (several picked in one go, searchable, sections, a clear button, a
// footer counting them) and an assignee (one person replacing the last); the inspector holds what
// each field has and logs every change.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import {
  Combobox,
  ComboboxContent,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxTrigger,
  ListboxEmpty,
  OptionRow,
} from "@/packages/ui/combobox";
import { clearButtonLook, listboxFooter, ListboxHeader } from "@/packages/ui/lib/listbox";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const LABELS = [
  { value: "bug", title: "Bug", group: "Type" },
  { value: "feature", title: "Feature", group: "Type" },
  { value: "docs", title: "Docs", group: "Type" },
  { value: "ios", title: "iOS", group: "Platform" },
  { value: "android", title: "Android", group: "Platform" },
  { value: "macos", title: "macOS", group: "Platform" },
  { value: "windows", title: "Windows", group: "Platform" },
  { value: "linux", title: "Linux", group: "Platform" },
  { value: "web", title: "Web", group: "Platform" },
  { value: "wontfix", title: "Won't fix", group: "Status", disabled: true },
  { value: "blocked", title: "Blocked", group: "Status" },
];

const PEOPLE = [
  { value: "ada", title: "Ada Lovelace" },
  { value: "grace", title: "Grace Hopper" },
  { value: "linus", title: "Linus Torvalds" },
  { value: "margaret", title: "Margaret Hamilton" },
];

const titlesOf = (items: { value: string; title: string }[], values: string[]) =>
  values.map((v) => items.find((i) => i.value === v)?.title ?? v);

const SECTIONS = ["Type", "Platform", "Status"] as const;

/** A label over its control, a quieter line under the label. */
function Field(props: { label: string; detail: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>{props.label}</Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>{props.detail}</Text>
      </View>
      {props.children}
    </View>
  );
}

function App() {
  const labels = signal<string[]>(["bug", "ios"]);
  const assignee = signal<string[]>([]);
  const labelsOpen = signal(false);
  const assigneeOpen = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 8));
  const opened =
    (name: string, set: (next: boolean) => void) =>
    ({ open }: { open: boolean }) => {
      set(open);
      log(`${name} ${open ? "opened" : "closed"}`);
    };

  return (
    <DemoPage title="Combobox">
      <Text style={{ color: colors.muted }}>
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
                style={{ fontSize: 13, color: colors.text }}
              >{`labels [${labels().join(", ")}]`}</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>
                {`assignee [${assignee().join(", ")}]`}
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
                log(`Labels → ${titlesOf(LABELS, value).join(", ") || "none"}`);
              }}
              onOpenChange={opened("Labels", (next) => labelsOpen.set(next))}
            >
              <ComboboxTrigger />
              <ComboboxContent
                accessibilityLabel="Labels"
                empty={<ListboxEmpty label="No label matches" />}
                clearButtonAccessibilityLabel="Clear the labels"
                {...clearButtonLook()}
                footerStyle={listboxFooter.style}
                footer={<Text style={listboxFooter.text}>{`${labels().length} selected`}</Text>}
                onConfirm={({ value }) => log(`Confirmed ${value.length} labels`)}
                renderItem={(item) => <OptionRow item={item} />}
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
                log(`Assignee → ${titlesOf(PEOPLE, value)[0] ?? "none"}`);
              }}
              onOpenChange={opened("Assignee", (next) => assigneeOpen.set(next))}
            >
              <ComboboxTrigger />
              <ComboboxContent
                accessibilityLabel="Assignee"
                renderItem={(item) => <OptionRow item={item} />}
              >
                {PEOPLE.map((item) => (
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
