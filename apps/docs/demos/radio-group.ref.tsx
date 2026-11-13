// The reference of `radio-group.tsx`: the same scene as upstream writes it, `RadioRing` and
// `choiceTileLook` spread on `nsh/base`'s Radio. The render check requires the two to draw the
// same pixels.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Radio, RadioGroup } from "nsh/base";

import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { choiceTileLook, RadioRing } from "@/packages/ui/radio-group";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const plans = [
  { id: "starter", label: "Starter", detail: "1 project · 5 GB", price: "Free" },
  { id: "pro", label: "Pro", detail: "Unlimited projects · 100 GB", price: "$12" },
  { id: "team", label: "Team", detail: "Shared workspace · 1 TB", price: "$40", locked: true },
];
const cycles = ["Monthly", "Yearly"];

function App() {
  const plan = signal("pro");
  const cycle = signal("Monthly");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));

  return (
    <DemoPage title="Radio Group">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click an option, or Tab to a group and move with the arrow keys"
          : "Tap an option: its label checks it too"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: colors.text }}>{`${plan()} · ${cycle()}`}</Text>
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
          {/* The cycle as a pair of choice cards: the whole card is the radio. */}
          <RadioGroup>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {cycles.map((c) => (
                <Radio
                  checked={cycle() === c}
                  onChange={({ checked }) => {
                    if (checked) cycle.set(c);
                    log(`${c} → ${checked}`);
                  }}
                  class="group"
                  {...choiceTileLook(() => cycle() === c)}
                >
                  <RadioRing on={cycle() === c} />
                  <Text>{c}</Text>
                </Radio>
              ))}
            </View>
          </RadioGroup>

          {/* The plans, each row the radio: a ring that lights up, its dot growing in. */}
          <RadioGroup style={sectionSurface({ padded: true })}>
            {plans.map((item, i) => (
              <Radio
                checked={plan() === item.id}
                disabled={item.locked}
                onChange={({ checked }) => {
                  plan.set(item.id);
                  log(`${item.label} → ${checked}`);
                }}
                class="group"
                {...listRow({ first: i === 0, disabled: () => item.locked })}
              >
                <RowDivider show={i > 0} />
                <RadioRing on={plan() === item.id} disabled={item.locked} />
                <RowLabel label={item.label} detail={item.detail} />
                <Text
                  style={{
                    fontSize: 13,
                    fontVariant: ["tabular-nums"],
                    color: plan() === item.id ? colors.text : colors.muted,
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
