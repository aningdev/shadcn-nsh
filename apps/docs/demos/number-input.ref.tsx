// The reference of `number-input.tsx`: the same scene as upstream writes it, the well and the
// steppers spread on `nsh/base`'s NumberInput. The render check requires the two to draw the same
// pixels.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { NumberInput, Switch } from "nsh/base";

import { listRow, plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { numberInputClasses, numberInputSteps, numberInputText } from "@/packages/ui/number-input";
import { switchLook } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const show = (v: number | null) => (v === null ? "null" : `${v}`);

/** A setting: its label and detail, the field at the trailing edge, a hairline above all but the first. */
function Row(props: { label: string; detail: string; first?: boolean; children: JSX.Element }) {
  return (
    <View style={plainRow({ first: props.first })}>
      <RowLabel label={props.label} detail={props.detail} />
      <View style={{ width: desktop ? 132 : 176 }}>{props.children}</View>
    </View>
  );
}

/** A number field's steppers: − and + before and after the field (`split`), or a pair at its end. */
const split = () => numberInputSteps("split", desktop ? "w-8" : "w-11", desktop ? 14 : 16);
const pair = () => numberInputSteps("pair", desktop ? "w-6" : "w-9", desktop ? 14 : 16);
const centered = () => ({ ...numberInputText(), textAlign: "center" as const });

function App() {
  const tickets = signal<number | null>(2);
  const price = signal<number | null>(19.95);
  const temperature = signal<number | null>(null);
  const disabled = signal(false);
  const events = signal<string[]>([]);
  const change =
    (name: string, set: (next: number | null) => void) =>
    ({ value }: { value: number | null }) => {
      set(value);
      events.set([`${name} → ${show(value)}`, ...events()].slice(0, 5));
    };

  return (
    <DemoPage title="Number Input">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Type a number, click − and +, or press ↑ ↓ (Page Up / Down: ten steps) in the field"
          : "Type a number, or tap − and +"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value · disabled">
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {`tickets ${show(tickets())} · price ${show(price())} · °C ${show(temperature())}`}
                {disabled() ? " (disabled)" : ""}
              </Text>
              <Switch
                checked={disabled()}
                onChange={({ checked }) => disabled.set(checked)}
                {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
                {...switchLook(() => disabled())}
              >
                <RowLabel label="Disabled" />
              </Switch>
            </Panel>
            <Log title="onChange({ value })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Row first label="Tickets" detail="1 to 10">
            <NumberInput
              value={tickets()}
              onChange={change("tickets", (next) => tickets.set(next))}
              min={1}
              max={10}
              accessibilityLabel="Tickets"
              disabled={disabled()}
              class={numberInputClasses.frame}
              inputStyle={[numberInputText(), centered()]}
              {...split()}
            />
          </Row>
          <Row label="Price" detail="Steps of 0.05">
            <NumberInput
              value={price()}
              onChange={change("price", (next) => price.set(next))}
              min={0}
              step={0.05}
              accessibilityLabel="Price"
              disabled={disabled()}
              class={numberInputClasses.frame}
              inputStyle={numberInputText()}
              {...pair()}
              suffix={
                <Text
                  style={{
                    alignSelf: "center",
                    paddingRight: 8,
                    fontSize: 12,
                    color: colors.muted,
                  }}
                >
                  USD
                </Text>
              }
            />
          </Row>
          <Row label="Temperature" detail="−20 to 40 °C, halves">
            <NumberInput
              value={temperature()}
              onChange={change("temperature", (next) => temperature.set(next))}
              min={-20}
              max={40}
              step={0.5}
              placeholder="Not set"
              accessibilityLabel="Temperature"
              disabled={disabled()}
              class={numberInputClasses.frame}
              inputStyle={[numberInputText(), centered()]}
              {...split()}
            />
          </Row>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
