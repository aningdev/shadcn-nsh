// The official progress scene (`references/nsh/website/demos/el-progress.tsx`) with this library's
// part: a card of transfers (one counting photos as it goes, one whose size is not known yet, one
// standing for a library) with Start, Pause and Reset, a switch for the unknown size, and what the
// app heard beside them. The tones below are the axis the scene itself does not use.
import { colors, type Tone, toneColor } from "@shadcn-nsh/theme";
import { cleanup, mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  controlSize,
  listRow,
  plainRow,
  RowLabel,
  sectionSurface,
} from "@/packages/ui/lib/surface";
import { Progress, progressSweep, type ProgressSweep } from "@/packages/ui/progress";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const TONES: Tone[] = ["neutral", "accent", "info", "warn", "danger", "up", "down"];

function Transfer(props: {
  label: string;
  detail: string;
  value: number;
  indeterminate?: boolean;
  sweep: ProgressSweep;
  first?: boolean;
}) {
  return (
    // A row has no padding at its sides, so the bar's width is the track's: the sweep crosses two
    // thirds of it.
    <Progress
      value={props.value}
      indeterminate={props.indeterminate}
      sweep={props.sweep}
      style={{
        ...plainRow({ first: props.first }),
        flexDirection: "column-reverse",
        alignItems: "stretch",
        gap: controlSize.padding,
      }}
    >
      <View class="flex-row items-center gap-3">
        <RowLabel label={props.label} detail={props.detail} />
        <Text
          style={{
            fontSize: controlSize.label,
            color: colors.muted,
            fontVariant: ["tabular-nums"],
            textAlign: "right",
          }}
        >
          {props.indeterminate ? "—" : `${Math.round(props.value)}%`}
        </Text>
      </View>
    </Progress>
  );
}

function App() {
  const sent = signal(35);
  const running = signal(false);
  const unknown = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  // The sweep of the indeterminate bars, one for all of them.
  const sweep = progressSweep();
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    running.set(false);
  };
  cleanup(stop);
  const start = () => {
    if (sent() >= 100) sent.set(0);
    running.set(true);
    log(`Start at ${sent()}%`);
    timer = setInterval(() => {
      sent.set(Math.min(100, sent() + 5));
      if (sent() >= 100) {
        stop();
        log("Done: value 100");
      }
    }, 200);
  };
  return (
    <DemoPage title="Progress">
      <Text style={{ color: colors.muted }}>
        {desktop ? "Click Start, or Tab to it and press Space" : "Tap Start to send the photos"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value · indeterminate">
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {unknown()
                  ? "indeterminate (no value for screen readers)"
                  : `value ${sent()} of 100`}
              </Text>
              <View class={desktop ? "flex-row self-start gap-2" : "flex-row gap-2"}>
                <Button
                  variant="secondary"
                  disabled={unknown()}
                  style={desktop ? undefined : { flex: 1 }}
                  onPress={() => (running() ? (stop(), log(`Pause at ${sent()}%`)) : start())}
                >
                  {running() ? "Pause" : sent() >= 100 ? "Again" : "Start"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={sent() === 0}
                  style={desktop ? undefined : { flex: 1 }}
                  onPress={() => {
                    stop();
                    sent.set(0);
                    log("Reset: value 0");
                  }}
                >
                  Reset
                </Button>
              </View>
              <Switch
                checked={unknown()}
                onChange={({ checked }) => {
                  unknown.set(checked);
                  if (checked) stop();
                  log(checked ? "Size unknown: indeterminate" : `Size known: value ${sent()}`);
                }}
                {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
              >
                <RowLabel label="Size unknown" />
              </Switch>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Transfer
            first
            label="Sending 24 photos"
            detail={
              unknown()
                ? "Counting what to send"
                : sent() >= 100
                  ? "Sent"
                  : `${Math.round((sent() / 100) * 24)} of 24`
            }
            value={sent()}
            indeterminate={unknown()}
            sweep={sweep}
          />
          <Transfer
            label="Preparing the backup"
            detail="Its size is not known yet"
            value={0}
            indeterminate
            sweep={sweep}
          />
          <Transfer label="Library" detail="212 GB of 256 GB" value={83} sweep={sweep} />
        </View>
      </Split>

      {/* The scene uses the citrus run; the tones a bar can take are beside it. */}
      <DemoCard>
        <DemoSection title="Tone" axis="block">
          {TONES.map((tone, i) => (
            <View style={plainRow({ first: i === 0 })}>
              <Text style={{ width: 64, fontSize: controlSize.label, color: colors.muted }}>
                {tone}
              </Text>
              <View style={{ flex: 1 }}>
                <Progress value={72} tone={tone} />
              </View>
              <Text
                style={{ fontSize: controlSize.detail, color: toneColor(tone), width: 34 }}
              >
                {"72%"}
              </Text>
            </View>
          ))}
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
