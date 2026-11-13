// The official tabs scene (`references/nsh/website/demos/el-tabs.tsx`) with this library's parts:
// a capsule strip switching a card of figures, and an underlined strip with counts (one folder
// disabled), each press added to the inspector's log.
import { mount, signal, Text, View } from "nsh";

import { controlSize, plainRow, sectionSurface } from "@/packages/ui/lib/surface";
import { TabTitle, Tabs, TabsList, TabsTrigger } from "@/packages/ui/tabs";

import { DemoPage } from "./kit";
import { desktop, Log, Split, ui } from "./stage";

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

function App() {
  const section = signal("overview");
  const folder = signal("inbox");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const current = () => sections.find((s) => s.id === section())!;

  return (
    <DemoPage title="Tabs">
      <Text style={{ color: ui().muted }}>
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
        <Tabs value={section()} onValueChange={(value) => section.set(value)}>
          {/* A tab list on a capsule track: the list's indicator is the raised pill inside it. */}
          <TabsList variant="default">
            {sections.map((s) => (
              <TabsTrigger value={s.id} onPress={() => log(`${s.label} pressed`)}>
                <TabTitle name={s.label} selected={section() === s.id} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* The selected section's content, which the app shows by its value. */}
        <View style={sectionSurface({ padded: true })}>
          {current().rows.map((row, i) => (
            <View style={plainRow({ first: i === 0, dense: true })}>
              <Text style={{ flex: 1, fontSize: controlSize.label, color: ui().text }}>
                {row[0]}
              </Text>
              <Text
                style={{
                  fontSize: controlSize.label,
                  fontVariant: ["tabular-nums"],
                  color: ui().muted,
                }}
              >
                {row[1]}
              </Text>
            </View>
          ))}
        </View>

        {/* Underlined tabs with counts: the line travels and stretches to the selected one; a disabled one dims. */}
        <View style={{ alignSelf: "stretch", marginHorizontal: -8 }}>
          <Tabs value={folder()} onValueChange={(value) => folder.set(value)}>
            <TabsList variant="line">
              {folders.map((f) => (
                <TabsTrigger
                  value={f.id}
                  disabled={f.locked}
                  onPress={() => log(`${f.label} pressed`)}
                >
                  <TabTitle
                    name={f.label}
                    count={f.count > 0 ? f.count : undefined}
                    selected={folder() === f.id}
                    underline
                  />
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
