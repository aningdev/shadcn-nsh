// The reference of `progress.tsx`: the same scene with `progressLook` spread on `nsh/base`'s
// Progress, the way the official example (`references/nsh/website/demos/el-progress.tsx`) writes
// it. It differs from the component page only in the parts it names.
import { colors, type Tone, toneColor } from "@shadcn-nsh/theme";
import { cleanup, mount, signal, Text, View } from "nsh";
import { Progress } from "nsh/base";

import { Button } from "@/packages/ui/button";
import {
  controlSize,
  listRow,
  plainRow,
  RowLabel,
  sectionSurface,
} from "@/packages/ui/lib/surface";
import {
  progressLook,
  progressMarker,
  ProgressStepMark,
  progressStepSize,
  progressStepsLook,
  progressSweep,
  type ProgressStepState,
  type ProgressSweep,
} from "@/packages/ui/progress";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const TONES: Tone[] = ["neutral", "accent", "info", "warn", "destructive", "up", "down"];

const SETUP = ["Account", "Profile", "Team", "Review"];

/** Where step `i` stands when `current` is the one shown (past the last, all are done). */
const stateOf = (i: number, current: number): ProgressStepState =>
  i < current ? "done" : i === current ? "current" : "upcoming";

/** A bar with a limit on it: where the limit stands, and what the bar reads beside it. */
const LIMITS: { label: string; value: number; limit: number; tone?: Tone }[] = [
  { label: "Quota", value: 83, limit: 90 },
  { label: "Storage", value: 92, limit: 85, tone: "warn" },
  { label: "Performance", value: 60, limit: 100 },
];

function Transfer(props: {
  label: string;
  detail: string;
  value: number;
  indeterminate?: boolean;
  limit?: number;
  sweep: ProgressSweep;
  first?: boolean;
}) {
  const look = progressLook(() => props.value, {
    indeterminate: () => props.indeterminate,
    sweep: props.sweep,
  });
  return (
    // A row has no padding at its sides, so the bar's width is the track's: the sweep crosses two
    // thirds of it. The label is the bar's sibling above it, not a child: a limit is drawn on the
    // bar's own frame, so the rail comes first in its row.
    <View
      style={{
        ...plainRow({ first: props.first }),
        flexDirection: "column",
        alignItems: "stretch",
        gap: controlSize.padding,
      }}
    >
      <View class="flex-row items-center gap-3">
        <RowLabel label={props.label} detail={props.detail} />
        <Text
          style={{
            fontSize: controlSize.label,
            color: colors.mutedForeground,
            fontVariant: ["tabular-nums"],
            textAlign: "right",
          }}
        >
          {props.indeterminate ? "—" : `${Math.round(props.value)}%`}
        </Text>
      </View>
      <Progress
        value={props.value}
        indeterminate={props.indeterminate}
        onLayout={props.sweep.onLayout}
        trackStyle={look.trackStyle}
        indicatorClass={look.indicatorClass}
        indicatorStyle={look.indicatorStyle}
      >
        <If when={props.limit !== undefined}>
          <View style={progressMarker(props.limit ?? 0)} />
        </If>
      </Progress>
    </View>
  );
}

function App() {
  const sent = signal(35);
  const running = signal(false);
  const unknown = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 5));
  // The step shown: 0 to 3, and 4 once all are done.
  const step = signal(1);
  const stepValue = () => (Math.min(step(), SETUP.length - 1) / (SETUP.length - 1)) * 100;
  const stepsLook = progressStepsLook();
  const barLook = progressLook(() => stepValue(), { height: 4 });
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
      <Text style={{ color: colors.mutedForeground }}>
        {desktop ? "Click Start, or Tab to it and press Space" : "Tap Start to send the photos"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value · indeterminate">
              <Text
                style={{ fontSize: 13, color: colors.foreground, fontVariant: ["tabular-nums"] }}
              >
                {unknown()
                  ? "indeterminate (no value for screen readers)"
                  : `value ${sent()} of 100`}
              </Text>
              <View class={desktop ? "flex-row gap-2 self-start" : "flex-row gap-2"}>
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
          <Transfer label="Library" detail="212 GB of 256 GB" value={83} limit={90} sweep={sweep} />
        </View>
      </Split>

      {/* The scene uses the citrus run; the tones a bar can take are beside it. */}
      <DemoCard>
        <DemoSection title="Tone" axis="block">
          {TONES.map((tone, i) => {
            const look = progressLook(72, { tone });
            return (
              <View style={plainRow({ first: i === 0 })}>
                <Text
                  style={{ width: 96, fontSize: controlSize.label, color: colors.mutedForeground }}
                >
                  {tone}
                </Text>
                <View style={{ flex: 1 }}>
                  <Progress
                    value={72}
                    trackStyle={look.trackStyle}
                    indicatorClass={look.indicatorClass}
                    indicatorStyle={look.indicatorStyle}
                  />
                </View>
                <Text style={{ fontSize: controlSize.detail, color: toneColor(tone), width: 34 }}>
                  {"72%"}
                </Text>
              </View>
            );
          })}
        </DemoSection>

        {/* Steps on a bar: the bar runs from the first mark's middle to the last's, so the
            Progress keeps half a mark at either side. */}
        <DemoSection title="Steps" axis="block">
          <View style={{ paddingHorizontal: progressStepSize() / 2 }}>
            <Progress
              value={stepValue()}
              accessibilityLabel="Setup"
              trackStyle={barLook.trackStyle}
              indicatorClass={barLook.indicatorClass}
              indicatorStyle={barLook.indicatorStyle}
            >
              <View style={stepsLook.steps(4)}>
                {SETUP.map((name, i) => (
                  <View style={stepsLook.step}>
                    <ProgressStepMark state={() => stateOf(i, step())} />
                    <View
                      style={stepsLook.labelBox(
                        i === 0 ? "first" : i === SETUP.length - 1 ? "last" : "middle",
                      )}
                    >
                      <Text style={stepsLook.label(stateOf(i, step()))}>{name}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Progress>
          </View>
          <View class={desktop ? "flex-row gap-2 self-start" : "flex-row gap-2"}>
            <Button
              variant="secondary"
              disabled={step() === 0}
              style={desktop ? undefined : { flex: 1 }}
              onPress={() => {
                step.set(Math.min(step(), SETUP.length) - 1);
                log(`Back to ${SETUP[step()]}`);
              }}
            >
              Back
            </Button>
            <Button
              style={desktop ? undefined : { flex: 1 }}
              onPress={() => {
                step.set(step() >= SETUP.length ? 0 : step() + 1);
                log(step() >= SETUP.length ? "All steps done" : `Next: ${SETUP[step()]}`);
              }}
            >
              {step() < SETUP.length - 1
                ? "Next"
                : step() === SETUP.length - 1
                  ? "Finish"
                  : "Start over"}
            </Button>
          </View>
        </DemoSection>

        {/* A bar can stand a limit on it: a hairline where the limit is. */}
        <DemoSection title="Limit" axis="block">
          {LIMITS.map((limit, i) => {
            const look = progressLook(limit.value, { tone: limit.tone });
            return (
              <View style={plainRow({ first: i === 0 })}>
                <Text
                  style={{ width: 96, fontSize: controlSize.label, color: colors.mutedForeground }}
                >
                  {limit.label}
                </Text>
                <View style={{ flex: 1 }}>
                  <Progress
                    value={limit.value}
                    trackStyle={look.trackStyle}
                    indicatorClass={look.indicatorClass}
                    indicatorStyle={look.indicatorStyle}
                  >
                    <View style={progressMarker(limit.limit)} />
                  </Progress>
                </View>
                <Text
                  style={{
                    fontSize: controlSize.detail,
                    color: colors.mutedForeground,
                    width: 34,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {`${limit.limit}`}
                </Text>
              </View>
            );
          })}
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
