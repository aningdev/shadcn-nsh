// The official slider scene (`references/nsh/website/demos/el-slider.tsx`) with this library's
// part: five levels in one card (a strength with its value column, a playback position, a price
// range, a locked one and an equalizer of three vertical bands), each named above its track, and
// what the app heard from the drags beside them.
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import type { SliderValue } from "nsh/base";

import { controlSize, plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Slider, sliderValueClass, sliderValueStyle } from "@/packages/ui/slider";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

const show = (v: SliderValue) => (typeof v === "number" ? `${v}` : `${v[0]}–${v[1]}`);

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds) % 60).padStart(2, "0")}`;

const LENGTH = 225;

/** A level: its label and value over the slider, a hairline above all but the first (`plainRow`). */
function Row(props: { label: string; value?: string; first?: boolean; children: JSX.Element }) {
  return (
    <View
      style={{
        ...plainRow({ first: props.first }),
        flexDirection: "column",
        alignItems: "stretch",
        gap: controlSize.padding,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: controlSize.gap }}>
        <RowLabel label={props.label} />
        <Text
          style={{
            fontSize: controlSize.label,
            color: ui().muted,
            fontVariant: ["tabular-nums"],
          }}
        >
          {props.value ?? ""}
        </Text>
      </View>
      {props.children}
    </View>
  );
}

function App() {
  const strength = signal(64);
  const position = signal(84);
  const price = signal<[number, number]>([200, 800]);
  const bands = [signal(0), signal(3), signal(-2)];
  const events = signal<string[]>([]);
  const log =
    (name: string) =>
    ({ value: next }: { value: SliderValue }) =>
      events.set([`${name} → ${show(next)}`, ...events()].slice(0, 5));
  return (
    <DemoPage title="Slider">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Drag a thumb or click the track, or Tab to a thumb and use the arrow keys"
          : "Drag a thumb, or tap the track"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`strength ${strength()} · position ${position()} · price [${price()[0]}, ${price()[1]}]`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`bands ${bands.map((band) => band()).join(" / ")}`}
              </Text>
            </Panel>
            <Log title="onChangeEnd({ value })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Row first label="Option strength">
            <Slider
              value={strength()}
              onChange={({ value }) => strength.set(value as number)}
              onChangeEnd={log("strength")}
              accessibilityLabel="Option strength"
              showValue
            >
              <Text class={sliderValueClass} style={sliderValueStyle()}>{`${strength()}%`}</Text>
            </Slider>
          </Row>
          <Row label="Playback position" value={`${clock(position())} / ${clock(LENGTH)}`}>
            <Slider
              value={position()}
              max={LENGTH}
              onChange={({ value }) => position.set(value as number)}
              onChangeEnd={log("position")}
              accessibilityLabel="Playback position"
            />
          </Row>
          <Row label="Price" value={`$${price()[0]} – $${price()[1]}`}>
            <Slider
              value={price()}
              min={0}
              max={1000}
              step={10}
              onChange={({ value }) => price.set(value as [number, number])}
              onChangeEnd={log("price")}
              startAccessibilityLabel="Minimum price"
              accessibilityLabel="Maximum price"
            />
          </Row>
          <Row label="Locked intensity">
            <Slider value={72} disabled accessibilityLabel="Locked intensity" showValue>
              <Text class={sliderValueClass} style={sliderValueStyle()}>
                72%
              </Text>
            </Slider>
          </Row>
          <Row label="Equalizer" value="dB">
            <View class="flex-row justify-around pt-1">
              {["Bass", "Mid", "Treble"].map((name, i) => (
                <View class="items-center gap-2">
                  <Slider
                    value={bands[i]()}
                    min={-12}
                    max={12}
                    axis="vertical"
                    onChange={({ value }) => bands[i].set(value as number)}
                    onChangeEnd={log(name.toLowerCase())}
                    accessibilityLabel={name}
                  />
                  <Text
                    style={{
                      fontSize: controlSize.detail,
                      color: ui().muted,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {`${name} ${bands[i]() > 0 ? "+" : ""}${bands[i]()}`}
                  </Text>
                </View>
              ))}
            </View>
          </Row>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
