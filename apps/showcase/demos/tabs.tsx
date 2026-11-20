import { colors } from "@shadcn-nsh/theme";
// Tabs: the official gallery's scene (`references/nsh/examples/gallery/demos/Controls.tsx`, the
// Tabs demo) with this library's parts — a section switcher on the pill track, its tabs sharing
// the width and their icons showing while they fit, and an underlined strip as wide as its labels
// that scrolls and carries the line to the selected tab; the rows of the tab shown settling in
// as it changes.
import {
  Bell,
  ChartColumn,
  Code,
  FileText,
  GitPullRequest,
  MessageCircle,
  Sparkles,
  type IconNode,
} from "lucide";
import { signal, Scroll, Text, View } from "nsh";

import { Icon } from "@/packages/ui/lib/icons";
import { plainRow } from "@/packages/ui/lib/surface";
import { TabTitle, TAB_ICON_ROOM, Tabs, TabsList, TabsTrigger } from "@/packages/ui/tabs";

import { DemoCard, DemoPage } from "../kit";
import { settle, settleOn } from "./navigation-shared";

const SECTIONS: { name: string; icon: IconNode; rows: [string, string][]; disabled?: boolean }[] = [
  {
    name: "Overview",
    icon: ChartColumn,
    rows: [
      ["Visitors", "12,480"],
      ["Sign-ups", "342"],
      ["Conversion", "2.74%"],
    ],
  },
  {
    name: "Activity",
    icon: Bell,
    rows: [
      ["Deployed to production", "09:41"],
      ["Invoice paid", "08:15"],
      ["A member joined", "07:02"],
    ],
  },
  {
    name: "Members",
    icon: MessageCircle,
    rows: [
      ["Ada Lovelace", "Owner"],
      ["Grace Hopper", "Admin"],
      ["Alan Turing", "Member"],
    ],
  },
  { name: "Billing", icon: FileText, rows: [], disabled: true },
];

const PROJECT: {
  name: string;
  icon: IconNode;
  count?: number;
  rows: [string, string][];
  disabled?: boolean;
}[] = [
  {
    name: "Code",
    icon: Code,
    rows: [
      ["crates/", "2 hours ago"],
      ["examples/", "yesterday"],
      ["README.md", "last week"],
    ],
  },
  {
    name: "Issues",
    icon: Sparkles,
    count: 12,
    rows: [
      ["Text clips when the window shrinks", "#482"],
      ["A slower first frame on Android 12", "#476"],
      ["Support right-to-left menus", "#451"],
    ],
  },
  {
    name: "Pull requests",
    icon: GitPullRequest,
    count: 3,
    rows: [
      ["Animate the controls' state changes", "#601"],
      ["Sort the gallery's components", "#600"],
      ["Read fonts from the bundle", "#597"],
    ],
  },
  { name: "Wiki", icon: FileText, rows: [], disabled: true },
];

/** Measures the bare width of each tab's title as it lays out, so a strip can decide on its
 * icons by them. */
function titles(count: number) {
  const bare: number[] = [];
  let reported = 0;
  const changed = signal(0);
  const room = signal(0);
  return {
    room,
    widths: () => (changed(), reported === count ? bare : []),
    report: (i: number) => (w: number) => {
      const was = bare[i];
      if (was !== undefined && Math.abs(was - w) < 0.5) return;
      if (was === undefined) reported++;
      bare[i] = w;
      if (reported === count) changed.set(changed() + 1);
    },
  };
}

/** The pill track's padding and border: a tab is a pill inside them. */
const inset = 3;

/** A section switcher: the tabs share the track's width, their icons showing while every title
 * fits its share with its icon. */
function Sections(props: { log: (text: string) => void }) {
  const section = signal("Overview");
  const shown = () => SECTIONS.find((s) => s.name === section())!;
  const rows = settleOn(section);
  const sized = titles(SECTIONS.length);
  // The tabs share the track equally: icons show while every title fits
  // its share with its icon (a tab's border and padding are 14).
  const icons = () => {
    const widths = sized.widths();
    const share = (sized.room() - 2 * (inset + 1) - 2 * (SECTIONS.length - 1)) / SECTIONS.length;
    return widths.length > 0 && widths.every((w) => w + TAB_ICON_ROOM + 14 <= share);
  };
  return (
    <DemoCard title="Tabs" subtitle="A section switcher: the app shows the selected one">
      <Tabs
        value={section()}
        onValueChange={(next) => {
          section.set(next);
          props.log(`Tab: ${next}`);
        }}
      >
        <TabsList onLayout={({ bounds }) => sized.room.set(bounds.size.width)}>
          <Each of={SECTIONS}>
            {(s) => (
              <TabsTrigger value={s().name} disabled={s().disabled}>
                <TabTitle
                  name={s().name}
                  icon={icons() ? s().icon : undefined}
                  selected={section() === s().name}
                  onWidth={sized.report(SECTIONS.indexOf(s()))}
                />
              </TabsTrigger>
            )}
          </Each>
        </TabsList>
        <View style={settle(rows)}>
          <Each of={shown().rows}>
            {(r, i) => (
              // The overview's figures lead, their names quieter; other sections lead with the name.
              <View style={plainRow({ first: i() === 0, dense: true })}>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: shown().name === "Overview" ? colors.mutedForeground : colors.foreground,
                  }}
                >
                  {r()[0]}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: shown().name === "Overview" ? "500" : "400",
                    color: shown().name === "Overview" ? colors.foreground : colors.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {r()[1]}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </Tabs>
    </DemoCard>
  );
}

/** An underlined strip as wide as its labels, scrolling when they do not fit; the line travels
 * to the selected tab. */
function Project(props: { log: (text: string) => void }) {
  const tab = signal("Issues");
  const shown = () => PROJECT.find((t) => t.name === tab())!;
  const rows = settleOn(tab);
  const sized = titles(PROJECT.length);
  // Icons show while the whole strip fits the card with them (a tab's
  // border and padding are 18, 2 between tabs); without them it scrolls
  // when it still does not fit.
  const icons = () => {
    const widths = sized.widths();
    return (
      widths.length > 0 &&
      widths.reduce((sum, w) => sum + w + TAB_ICON_ROOM + 18, 2 * (PROJECT.length - 1)) <=
        sized.room()
    );
  };
  return (
    <DemoCard title="Underlined" subtitle="As wide as their labels; the line travels">
      <Tabs
        value={tab()}
        onValueChange={(next) => {
          tab.set(next);
          props.log(`Project: ${next}`);
        }}
      >
        <View onLayout={({ bounds }) => sized.room.set(bounds.size.width)}>
          <Scroll horizontal scrollbar={false} style={{ flexGrow: 0 }}>
            <TabsList variant="line">
              <Each of={PROJECT}>
                {(t) => (
                  <TabsTrigger value={t().name} disabled={t().disabled}>
                    <TabTitle
                      name={t().name}
                      count={t().count}
                      icon={icons() ? t().icon : undefined}
                      selected={tab() === t().name}
                      underline
                      onWidth={sized.report(PROJECT.indexOf(t()))}
                    />
                  </TabsTrigger>
                )}
              </Each>
            </TabsList>
          </Scroll>
        </View>
        <View style={settle(rows)}>
          <Each of={shown().rows}>
            {(r, i) => (
              <View style={plainRow({ first: i() === 0, dense: true })}>
                <Icon icon={shown().icon} size={12} tint={colors.faint} />
                <Text style={{ flex: 1, numberOfLines: 1, fontSize: 13, color: colors.foreground }}>
                  {r()[0]}
                </Text>
                <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
                  {r()[1]}
                </Text>
              </View>
            )}
          </Each>
        </View>
      </Tabs>
    </DemoCard>
  );
}

export function TabsDemo() {
  const last = signal("—");
  const log = (text: string) => last.set(text);
  return (
    <DemoPage title="Tabs" note={() => `Last event: ${last()}`}>
      <Sections log={log} />
      <Project log={log} />
    </DemoPage>
  );
}
