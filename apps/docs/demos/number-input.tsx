// The official number input scene (`references/nsh/website/demos/el-number-input.tsx`) with this
// library's parts: tickets (− and + beside the field), a price (steppers at the end, its currency
// beside the field) and a temperature that allows halves and nothing at first; a switch disables
// all three, and the inspector says what each holds and logs every change.
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { listRow, plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { NumberInput } from "@/packages/ui/number-input";
import { Switch } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

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
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Type a number, click − and +, or press ↑ ↓ (Page Up / Down: ten steps) in the field"
          : "Type a number, or tap − and +"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value · disabled">
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`tickets ${show(tickets())} · price ${show(price())} · °C ${show(temperature())}`}
                {disabled() ? " (disabled)" : ""}
              </Text>
              <Switch
                checked={disabled()}
                onChange={({ checked }) => disabled.set(checked)}
                {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
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
              steps="split"
              value={tickets()}
              onChange={change("tickets", (next) => tickets.set(next))}
              min={1}
              max={10}
              accessibilityLabel="Tickets"
              disabled={disabled()}
              inputStyle={{ textAlign: "center" }}
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
              suffix={
                <Text
                  style={{
                    alignSelf: "center",
                    paddingRight: 8,
                    fontSize: 12,
                    color: ui().muted,
                  }}
                >
                  USD
                </Text>
              }
            />
          </Row>
          <Row label="Temperature" detail="−20 to 40 °C, halves">
            <NumberInput
              steps="split"
              value={temperature()}
              onChange={change("temperature", (next) => temperature.set(next))}
              min={-20}
              max={40}
              step={0.5}
              placeholder="Not set"
              accessibilityLabel="Temperature"
              disabled={disabled()}
              inputStyle={{ textAlign: "center" }}
            />
          </Row>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
