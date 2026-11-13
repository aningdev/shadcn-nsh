// The stat has no official example, so this page is the library's own: a month's figures in a grid
// (a tone each), the display whose name runs long and ends in an ellipsis, and the period the
// inspector sets over them.
import { type Tone } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { Stat } from "@/packages/ui/stat";

import { DemoPage } from "./kit";
import { Log, Panel, Segmented, Split, ui } from "./stage";

const PERIODS = ["today", "7 days", "30 days"] as const;

type Period = (typeof PERIODS)[number];

/** The figures by period; the others hold whatever the period. */
const FIGURES: { label: string; tone: Tone; value: string | Record<Period, string> }[] = [
  {
    label: "Users",
    tone: "neutral",
    value: { today: "1.8k", "7 days": "12.4k", "30 days": "51.2k" },
  },
  { label: "Latency", tone: "accent", value: "42 ms" },
  { label: "Queue", tone: "info", value: "3" },
  { label: "Errors", tone: "warn", value: "0.2%" },
  { label: "Failures", tone: "danger", value: "2" },
  {
    label: "Growth",
    tone: "up",
    value: { today: "+2.4%", "7 days": "+8.1%", "30 days": "+22.6%" },
  },
  { label: "Churn", tone: "down", value: "−1.2%" },
];

const valueOf = (value: string | Record<Period, string>, period: Period) =>
  typeof value === "string" ? value : value[period];

function App() {
  const period = signal<Period>("7 days");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  return (
    <DemoPage title="Stat">
      <Text style={{ color: ui().muted }}>
        {"A label above a figure, for grids of them; a long value ends in an ellipsis."}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="period">
              <Segmented
                options={PERIODS}
                value={period()}
                onChange={(value) => (period.set(value), log(`period → ${value}`))}
              />
            </Panel>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`Users ${valueOf(FIGURES[0].value, period())} · Growth ${valueOf(FIGURES[5].value, period())}`}
              </Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: ui().text }}>This month</Text>
            <Text style={{ fontSize: 12, color: ui().muted }}>{period()}</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {FIGURES.map((figure) => (
              <Stat
                label={figure.label}
                value={valueOf(figure.value, period())}
                tone={figure.tone}
                width="31%"
              />
            ))}
          </View>
          <View style={{ height: 1, backgroundColor: ui().line }} />
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 12, color: ui().muted }}>The widest display in the fleet</Text>
            <View style={{ width: 180 }}>
              <Stat label="Display" value="MacBook Pro 16-inch, 2024" truncate />
            </View>
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
