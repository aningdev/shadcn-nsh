import { colors, follow, motion, toneColor, type Tone } from "@shadcn-nsh/theme";
// Progress: the official gallery's Progress scene (`Controls` `show="Progress"`: transfers, several
// files, steps, and meters). The bar is this library's `Progress`. The step dots and the check
// that pops in are the library's `ProgressSteps`.
import { Check, FileText, Film, Image as ImageIcon, type IconNode } from "lucide";
import { cleanup, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Progress,
  ProgressStep,
  ProgressSteps,
  progressStepSize,
  progressSweep,
} from "@/packages/ui/progress";

import { DemoCard, DemoPage } from "../kit";
import { pointer, SceneCard } from "./overlays-shared";

const FILES: { name: string; size: string; icon: IconNode; pace: number }[] = [
  { name: "Lisbon, 48 photos", size: "212 MB", icon: ImageIcon, pace: 9 },
  { name: "Interview.mov", size: "1.2 GB", icon: Film, pace: 4 },
  { name: "Contract.pdf", size: "2 MB", icon: FileText, pace: 25 },
];

const STEPS = ["Account", "Profile", "Team", "Review"];

const METERS: { name: string; height: number; note: (value: number) => string; limit?: number }[] =
  [
    {
      name: "Battery",
      height: 4,
      limit: 20,
      note: (value) => (value < 20 ? `${value}%, charge soon` : `${value}%`),
    },
    {
      name: "Storage",
      height: 6,
      limit: 85,
      note: (value) => (value > 85 ? `${value}% used, almost full` : `${value}% used`),
    },
    { name: "Profile", height: 10, note: (value) => `${value}% complete` },
  ];

export function ProgressDemo() {
  const last = signal("—");

  return (
    <DemoPage title="Progress" note={() => `Last event: ${last()}`}>
      <Transfers report={(line) => last.set(line)} />
      <Uploads report={(line) => last.set(line)} />
      <Steps report={(line) => last.set(line)} />
      <Meters report={(line) => last.set(line)} />
    </DemoPage>
  );
}

function Transfers(props: { report: (line: string) => void }) {
  const { report } = props;
  const sent = signal(0);
  const running = signal(false);
  const timer = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  const stop = () => {
    const id = timer();
    if (id !== undefined) clearInterval(id);
    timer.set(undefined);
    running.set(false);
  };
  cleanup(stop);
  const sweep = progressSweep();
  const start = () => {
    if (sent() >= 100) sent.set(0);
    running.set(true);
    report("Upload: started");
    timer.set(
      setInterval(() => {
        sent.set(Math.min(100, sent() + 10));
        if (sent() >= 100) {
          stop();
          report("Upload: done");
        }
      }, 300),
    );
  };

  return (
    <DemoCard title="Progress" subtitle="Transfers: the app owns the value">
      <View>
        <Transfer
          first
          label="Upload"
          detail={
            sent() >= 100 ? "24 photos sent" : running() ? "Sending 24 photos" : "24 photos to send"
          }
          value={sent()}
          sweep={sweep}
        />
        <Transfer
          label="Backup"
          detail="Preparing: its size is not known yet"
          value={0}
          indeterminate
          sweep={sweep}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 8, alignSelf: pointer ? "flex-start" : "stretch" }}>
        <Button
          size="sm"
          style={pointer ? undefined : { flex: 1 }}
          onPress={() => {
            if (running()) {
              stop();
              report("Upload: paused");
            } else start();
          }}
        >
          {running() ? "Pause" : sent() >= 100 ? "Send again" : "Send"}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={sent() === 0}
          style={pointer ? undefined : { flex: 1 }}
          onPress={() => {
            stop();
            sent.set(0);
            report("Upload: reset");
          }}
        >
          Reset
        </Button>
      </View>
    </DemoCard>
  );
}

function Transfer(props: {
  label: string;
  detail: string;
  value: number;
  indeterminate?: boolean;
  first?: boolean;
  sweep?: ReturnType<typeof progressSweep>;
}) {
  return (
    <Progress
      value={props.value}
      indeterminate={props.indeterminate}
      sweep={props.indeterminate ? props.sweep : undefined}
      accessibilityLabel={props.label}
      style={{
        flexDirection: "column-reverse",
        alignItems: "stretch",
        gap: 8,
        paddingVertical: 8,
        borderTopWidth: props.first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ flex: 1, gap: 1 }}>
          <Text style={{ fontSize: pointer ? 13 : 15, color: colors.foreground }}>
            {props.label}
          </Text>
          <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
            {props.detail}
          </Text>
        </View>
        <Text
          style={{
            fontSize: pointer ? 13 : 15,
            color: colors.mutedForeground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {props.indeterminate ? "—" : `${props.value}%`}
        </Text>
      </View>
    </Progress>
  );
}

function Uploads(props: { report: (line: string) => void }) {
  const { report } = props;
  const sent = signal(FILES.map(() => 0));
  const running = signal(false);
  const timer = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  const stop = () => {
    const id = timer();
    if (id !== undefined) clearInterval(id);
    timer.set(undefined);
    running.set(false);
  };
  cleanup(stop);
  const all = () => sent().every((value) => value >= 100);
  const start = () => {
    sent.set(FILES.map(() => 0));
    running.set(true);
    report("Uploads: started");
    timer.set(
      setInterval(() => {
        sent.set(sent().map((value, index) => Math.min(100, value + FILES[index]!.pace)));
        if (all()) {
          stop();
          report("Uploads: done");
        }
      }, 200),
    );
  };

  return (
    <SceneCard
      title="Several files"
      subtitle="Each at its own pace, checked when sent"
      right={
        <Badge tone={all() ? "up" : "neutral"}>
          {`${sent().filter((value) => value >= 100).length} of ${FILES.length}`}
        </Badge>
      }
    >
      <View>
        <Each of={FILES}>
          {(file, index) => (
            <FileRow
              name={file().name}
              size={file().size}
              icon={file().icon}
              value={sent()[index()] ?? 0}
              first={index() === 0}
            />
          )}
        </Each>
      </View>
      <View style={{ flexDirection: "row", alignSelf: pointer ? "flex-start" : "stretch" }}>
        <Button
          size="sm"
          disabled={running()}
          style={pointer ? undefined : { flex: 1 }}
          onPress={start}
        >
          {running() ? "Uploading…" : all() ? "Upload again" : "Upload all"}
        </Button>
      </View>
    </SceneCard>
  );
}

function FileRow(props: {
  name: string;
  size: string;
  icon: IconNode;
  value: number;
  first: boolean;
}) {
  const done = follow(() => (props.value >= 100 ? 1 : 0), motion.fast);
  return (
    <Progress
      value={props.value}
      height={4}
      tone={props.value >= 100 ? "up" : undefined}
      accessibilityLabel={props.name}
      style={{
        flexDirection: "column-reverse",
        alignItems: "stretch",
        gap: 8,
        paddingVertical: 8,
        borderTopWidth: props.first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Icon icon={props.icon} size={pointer ? 16 : 20} tint={colors.mutedForeground} />
        <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
          <Text style={{ numberOfLines: 1, fontSize: pointer ? 13 : 15, color: colors.foreground }}>
            {props.name}
          </Text>
          <Text style={{ fontSize: pointer ? 12 : 13, color: colors.mutedForeground }}>
            {props.size}
          </Text>
        </View>
        <View style={{ width: 40, height: 20, alignItems: "flex-end", justifyContent: "center" }}>
          <If
            when={props.value >= 100}
            else={
              <Text
                style={{
                  fontSize: pointer ? 12 : 13,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {`${props.value}%`}
              </Text>
            }
          >
            <View style={{ opacity: done, transform: [{ scale: done }] }}>
              <Icon icon={Check} size={14} tint={toneColor("up")} />
            </View>
          </If>
        </View>
      </View>
    </Progress>
  );
}

function Steps(props: { report: (line: string) => void }) {
  const { report } = props;
  const step = signal(1);
  const value = () => (Math.min(step(), STEPS.length - 1) / (STEPS.length - 1)) * 100;

  return (
    <SceneCard
      title="Steps"
      subtitle="The bar fills to the step you are on"
      right={
        <Badge tone={step() >= STEPS.length ? "up" : "neutral"}>
          {step() >= STEPS.length ? "Done" : `Step ${step() + 1} of ${STEPS.length}`}
        </Badge>
      }
    >
      <View style={{ paddingHorizontal: progressStepSize() / 2, marginTop: 8 }}>
        <Progress value={value()} height={4} accessibilityLabel="Setup">
          <ProgressSteps>
            <Each of={STEPS}>
              {(name, index) => (
                <ProgressStep
                  state={index() < step() ? "done" : index() === step() ? "current" : "upcoming"}
                >
                  {name()}
                </ProgressStep>
              )}
            </Each>
          </ProgressSteps>
        </Progress>
      </View>
      <View style={{ flexDirection: "row", gap: 8, alignSelf: pointer ? "flex-start" : "stretch" }}>
        <Button
          variant="secondary"
          size="sm"
          disabled={step() === 0}
          accessibilityLabel="Previous step"
          style={pointer ? undefined : { flex: 1 }}
          onPress={() => {
            step.set(Math.min(step(), STEPS.length) - 1);
            report(`Setup: ${STEPS[step()]}`);
          }}
        >
          Previous step
        </Button>
        <Button
          size="sm"
          style={pointer ? undefined : { flex: 1 }}
          onPress={() => {
            step.set(step() >= STEPS.length ? 0 : step() + 1);
            report(step() >= STEPS.length ? "Setup: done" : `Setup: ${STEPS[step()]}`);
          }}
        >
          {step() < STEPS.length - 1
            ? "Next step"
            : step() === STEPS.length - 1
              ? "Finish"
              : "Start over"}
        </Button>
      </View>
    </SceneCard>
  );
}

function Meters(props: { report: (line: string) => void }) {
  const { report } = props;
  const values = signal([14, 92, 60]);
  const tone = (index: number, value: number): Tone | undefined =>
    index === 0 && value < 20 ? "destructive" : index === 1 && value > 85 ? "warn" : undefined;
  return (
    <DemoCard title="Sizes and tones" subtitle="Thin, regular and thick; a tone when it matters">
      <View style={{ gap: 14 }}>
        <Each of={METERS}>
          {(meter, index) => (
            <View style={{ alignItems: "stretch", gap: 6 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={{ flex: 1, fontSize: pointer ? 13 : 15, color: colors.foreground }}>
                  {meter().name}
                </Text>
                <Text
                  style={{
                    fontSize: pointer ? 12 : 13,
                    color: tone(index(), values()[index()] ?? 0)
                      ? toneColor(tone(index(), values()[index()] ?? 0)!)
                      : colors.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {meter().note(values()[index()] ?? 0)}
                </Text>
              </View>
              <Progress
                value={values()[index()] ?? 0}
                height={meter().height}
                marker={meter().limit}
                tone={() => tone(index(), values()[index()] ?? 0) ?? "accent"}
                accessibilityLabel={meter().name}
              />
            </View>
          )}
        </Each>
      </View>
      <View style={{ flexDirection: "row", alignSelf: pointer ? "flex-start" : "stretch" }}>
        <Button
          variant="secondary"
          size="sm"
          style={pointer ? undefined : { flex: 1 }}
          onPress={() => {
            values.set(values().map(() => Math.round(5 + Math.random() * 93)));
            report(`Meters: ${values().join(", ")}`);
          }}
        >
          Shuffle
        </Button>
      </View>
    </DemoCard>
  );
}
