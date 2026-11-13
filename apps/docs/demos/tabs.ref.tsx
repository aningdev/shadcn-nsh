// The reference of `tabs.tsx`: the same scene with the two strips' looks (`tabsLook`,
// `underlineTabsLook`, `TabTitle`) spread on `nsh/base`'s Tabs, the way the official example
// (`references/nsh/website/demos/el-tabs.tsx`) writes it. It differs from the component page only
// in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Tab, Tabs } from "nsh/base";

import { controlSize, plainRow, sectionSurface } from "@/packages/ui/lib/surface";
import { TabTitle, tabsLook, underlineTabsLook } from "@/packages/ui/tabs";

import { DemoPage } from "./kit";
import { desktop, Log, Split } from "./stage";

// What each section shows: the app switches the content by its own value.
const sections = [
  {
    id: "overview",
    label: "Overview",
    rows: [
      ["Visitors", "12,480"],
      ["Sign-ups", "342"],
      ["Conversion", "2.74%"],
    ],
  },
  {
    id: "activity",
    label: "Activity",
    rows: [
      ["Deploy to production", "09:41"],
      ["Invoice paid", "08:15"],
      ["New member joined", "07:02"],
    ],
  },
  {
    id: "settings",
    label: "Settings",
    rows: [
      ["Region", "Frankfurt"],
      ["Plan", "Pro"],
      ["Seats", "8 of 10"],
    ],
  },
];
const folders = [
  { id: "inbox", label: "Inbox", count: 12 },
  { id: "archive", label: "Archive", count: 0 },
  { id: "spam", label: "Spam", count: 3, locked: true },
];

/** A pill strip that shares its row (the section switcher) and an underlined one as wide as its labels. */
const strip = tabsLook();
const underline = underlineTabsLook();

function App() {
  const section = signal("overview");
  const folder = signal("inbox");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const current = () => sections.find((s) => s.id === section())!;

  return (
    <DemoPage title="Tabs">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a tab, or Tab to a list and move with the arrow keys"
          : "Tap a tab to show its section"}
      </Text>

      <Split
        gap={14}
        inspector={
          <Log title={`onPress · ${section()}, ${folder()}`} lines={events()} minHeight={76} />
        }
      >
        {/* A tab list on a capsule track: the indicator is the raised pill inside it. */}
        <Tabs style={strip.style} indicatorStyle={strip.indicatorStyle}>
          {sections.map((s) => (
            <Tab
              selected={section() === s.id}
              onPress={() => {
                section.set(s.id);
                log(`${s.label} pressed`);
              }}
              {...strip.tab({ selected: () => section() === s.id })}
            >
              <TabTitle name={s.label} selected={section() === s.id} />
            </Tab>
          ))}
        </Tabs>

        {/* The selected section's content, which the app shows by its value. */}
        <View style={sectionSurface({ padded: true })}>
          {current().rows.map((row, i) => (
            <View style={plainRow({ first: i === 0, dense: true })}>
              <Text style={{ flex: 1, fontSize: controlSize.label, color: colors.text }}>
                {row[0]}
              </Text>
              <Text
                style={{
                  fontSize: controlSize.label,
                  fontVariant: ["tabular-nums"],
                  color: colors.muted,
                }}
              >
                {row[1]}
              </Text>
            </View>
          ))}
        </View>

        {/* Underlined tabs with counts: the line travels and stretches to the selected one; a disabled one dims. */}
        {/* Pulled out by a tab's padding, so the first label lines up with the content. */}
        <View style={{ alignSelf: "stretch", marginHorizontal: -8 }}>
          <View style={underline.rule} />
          <Tabs style={underline.style} indicatorStyle={underline.indicatorStyle}>
            {folders.map((f) => (
              <Tab
                selected={folder() === f.id}
                disabled={f.locked}
                onPress={() => {
                  folder.set(f.id);
                  log(`${f.label} pressed`);
                }}
                {...underline.tab({ selected: () => folder() === f.id, disabled: f.locked })}
              >
                <TabTitle
                  name={f.label}
                  count={f.count > 0 ? f.count : undefined}
                  selected={folder() === f.id}
                  underline
                />
              </Tab>
            ))}
          </Tabs>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
