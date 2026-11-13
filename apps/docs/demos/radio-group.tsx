// The official radio scene (`references/nsh/website/demos/el-radio.tsx`) with this library's parts:
// the billing cycle as two choice cards, the plans as a list of rows with their prices (Team
// locked), and the inspector holding both values beside the log of every change.
import { mount, signal, Text, View } from "nsh";

import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Radio, RadioGroup } from "@/packages/ui/radio-group";
import { segmentedLook } from "@/packages/ui/segmented";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

const plans = [
  { id: "starter", label: "Starter", detail: "1 project · 5 GB", price: "Free" },
  { id: "pro", label: "Pro", detail: "Unlimited projects · 100 GB", price: "$12" },
  { id: "team", label: "Team", detail: "Shared workspace · 1 TB", price: "$40", locked: true },
];
const cycles = ["Monthly", "Yearly"];

/** The cycle's look: the group is a segmented track, the checked radio its thumb. */
const segments = segmentedLook();

function App() {
  const plan = signal("pro");
  const cycle = signal("Monthly");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));

  return (
    <DemoPage title="Radio Group">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click an option, or Tab to a group and move with the arrow keys"
          : "Tap an option: its label checks it too"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: ui().text }}>{`${plan()} · ${cycle()}`}</Text>
            </Panel>
            <Log
              title={`onChange({ checked }) · ${plan()}, ${cycle()}`}
              lines={events()}
              minHeight={76}
            />
          </>
        }
      >
        <View style={{ gap: 14 }}>
          {/* A segmented choice: each radio is a segment, `checkedStyle` raises the checked one. */}
          <RadioGroup style={segments.style}>
            {cycles.map((c) => (
              <Radio
                indicator={false}
                checked={cycle() === c}
                onChange={({ checked }) => {
                  if (checked) cycle.set(c);
                  log(`${c} → ${checked}`);
                }}
                {...segments.segment({ selected: () => cycle() === c })}
                checkedStyle={segments.thumbStyle}
              >
                <Text style={segments.label(cycle() === c)}>{c}</Text>
              </Radio>
            ))}
          </RadioGroup>

          {/* The plans, each row the radio: a ring that lights up, its dot growing in. */}
          <RadioGroup style={sectionSurface({ padded: true })}>
            {plans.map((item, i) => (
              <Radio
                variant="ring"
                checked={plan() === item.id}
                disabled={item.locked}
                onChange={({ checked }) => {
                  plan.set(item.id);
                  log(`${item.label} → ${checked}`);
                }}
                {...listRow({ first: i === 0, disabled: () => item.locked })}
              >
                <RowDivider show={i > 0} />
                <RowLabel label={item.label} detail={item.detail} />
                <Text
                  style={{
                    fontSize: 13,
                    fontVariant: ["tabular-nums"],
                    color: plan() === item.id ? ui().text : ui().muted,
                  }}
                >
                  {item.price}
                </Text>
              </Radio>
            ))}
          </RadioGroup>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
