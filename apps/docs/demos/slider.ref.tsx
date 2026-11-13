// The reference of `slider.tsx`: the same scene with `sliderLook` and `sliderFill` spread on
// `nsh/base`'s Slider, the way the official example
// (`references/nsh/website/demos/el-slider.tsx`) writes it. It differs from the component page
// only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Slider, type SliderValue } from "nsh/base";

import { controlSize, plainRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { sliderFill, sliderLook, sliderValueClass, sliderValueStyle } from "@/packages/ui/slider";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

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
            color: colors.muted,
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

/** A slider in the shared look: the rail sunk into the surface and the accent's run along it. */
function Level(props: {
  value: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  vertical?: boolean;
  withValue?: boolean;
  disabled?: boolean;
  accessibilityLabel: string;
  startAccessibilityLabel?: string;
  onChange: (value: SliderValue) => void;
  onChangeEnd?: (event: { value: SliderValue }) => void;
  children?: JSX.Element;
}) {
  const look = sliderLook({ vertical: props.vertical, value: props.withValue });
  // Where the fill ends along the track: a range's far thumb.
  const to = () => {
    const min = props.min ?? 0;
    const span = (props.max ?? 100) - min || 1;
    const value = props.value;
    return ((typeof value === "number" ? value : value[1]) - min) / span;
  };
  return (
    <Slider
      value={props.value}
      min={props.min}
      max={props.max}
      step={props.step}
      axis={props.vertical ? "vertical" : undefined}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      startAccessibilityLabel={props.startAccessibilityLabel}
      onChange={({ value }) => props.onChange(value)}
      onChangeEnd={props.onChangeEnd}
      class={look.class}
      trackClass={look.trackClass}
      indicatorClass={look.indicatorClass}
      indicatorStyle={look.indicatorStyle}
      rangeClass={look.rangeClass}
      rangeStyle={sliderFill(0, to(), !!props.vertical)}
      thumbClass={look.thumbClass}
      thumbStyle={look.thumbStyle}
    >
      {props.children}
    </Slider>
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
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Drag a thumb or click the track, or Tab to a thumb and use the arrow keys"
          : "Drag a thumb, or tap the track"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text
                style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}
              >
                {`strength ${strength()} · position ${position()} · price [${price()[0]}, ${price()[1]}]`}
              </Text>
              <Text
                style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}
              >
                {`bands ${bands.map((band) => band()).join(" / ")}`}
              </Text>
            </Panel>
            <Log title="onChangeEnd({ value })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Row first label="Option strength">
            <Level
              value={strength()}
              withValue
              onChange={(value) => strength.set(value as number)}
              onChangeEnd={log("strength")}
              accessibilityLabel="Option strength"
            >
              <Text class={sliderValueClass} style={sliderValueStyle()}>{`${strength()}%`}</Text>
            </Level>
          </Row>
          <Row label="Playback position" value={`${clock(position())} / ${clock(LENGTH)}`}>
            <Level
              value={position()}
              max={LENGTH}
              onChange={(value) => position.set(value as number)}
              onChangeEnd={log("position")}
              accessibilityLabel="Playback position"
            />
          </Row>
          <Row label="Price" value={`$${price()[0]} – $${price()[1]}`}>
            <Level
              value={price()}
              min={0}
              max={1000}
              step={10}
              onChange={(value) => price.set(value as [number, number])}
              onChangeEnd={log("price")}
              startAccessibilityLabel="Minimum price"
              accessibilityLabel="Maximum price"
            />
          </Row>
          <Row label="Locked intensity">
            <Level
              value={72}
              disabled
              withValue
              accessibilityLabel="Locked intensity"
              onChange={() => {}}
            >
              <Text class={sliderValueClass} style={sliderValueStyle()}>72%</Text>
            </Level>
          </Row>
          <Row label="Equalizer" value="dB">
            <View class="flex-row justify-around pt-1">
              {["Bass", "Mid", "Treble"].map((name, i) => (
                <View class="items-center gap-2">
                  <Level
                    value={bands[i]()}
                    min={-12}
                    max={12}
                    vertical
                    onChange={(value) => bands[i].set(value as number)}
                    onChangeEnd={log(name.toLowerCase())}
                    accessibilityLabel={name}
                  />
                  <Text
                    style={{
                      fontSize: controlSize.detail,
                      color: colors.muted,
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
