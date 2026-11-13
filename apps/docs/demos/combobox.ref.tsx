// The reference of `combobox.tsx`: the same scene as upstream writes it, `comboboxLook` and the
// listbox looks spread on `nsh/base`'s Combobox. The render check requires the two to draw the
// same pixels.
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Combobox } from "nsh/base";

import {
  comboboxLook,
  ComboToggle,
  ListboxEmpty,
  listboxProps,
  OptionRow,
} from "@/packages/ui/combobox";
import { clearButtonLook, listboxFooter, ListboxHeader } from "@/packages/ui/lib/listbox";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

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
              {...comboboxLook(() => labelsOpen(), { filled: () => labels().length > 0 })}
              triggerButton={<ComboToggle open={labelsOpen()} />}
              empty={<ListboxEmpty label="No label matches" />}
              clearButtonAccessibilityLabel="Clear the labels"
              footerStyle={listboxFooter.style}
              footer={<Text style={listboxFooter.text}>{`${labels().length} selected`}</Text>}
              onConfirm={({ value }) => log(`Confirmed ${value.length} labels`)}
              renderItem={(item) => <OptionRow item={item} />}
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
              {...comboboxLook(() => assigneeOpen())}
              triggerButton={<ComboToggle open={assigneeOpen()} />}
              renderItem={(item) => <OptionRow item={item} />}
              {...listboxProps()}
            />
          </Field>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
