import { alpha, colors, toneColor } from "@shadcn-nsh/theme";
// Slider: the official gallery's two scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Levels`, `Equalizer`) with this library's parts — a volume that can be muted, a price range over
// a histogram of what each price holds, and five vertical bands lit from 0 dB (`sliderFill`) with
// the value above each rail (`showValue`).
import { Volume1, Volume2 } from "lucide";
import { signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { controlSize, RowLabel } from "@/packages/ui/lib/surface";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Slider, sliderFill, sliderValueStyle } from "@/packages/ui/slider";

import { Caption, DemoCard, DemoPage } from "../kit";

const HISTOGRAM = [3, 6, 11, 18, 26, 31, 34, 29, 24, 22, 19, 15, 12, 10, 8, 6, 5, 3, 2, 1];
const HISTOGRAM_MAX = Math.max(...HISTOGRAM);
/** A bar covers 25 of the 500: lit while a price of the range falls in it, both ends included. */
const inRange = (i: number, [from, to]: [number, number]) => (i + 1) * 25 > from && i * 25 <= to;
const listings = (range: [number, number]) =>
  HISTOGRAM.reduce((n, c, i) => (inRange(i, range) ? n + c : n), 0);

const BANDS = ["60", "250", "1k", "4k", "16k"];
const PRESETS = {
  Flat: [0, 0, 0, 0, 0],
  Bass: [8, 5, 0, -2, -1],
  Vocal: [-3, 0, 5, 4, 1],
} as const;
type Preset = keyof typeof PRESETS;
const PRESET_OPTIONS: { value: Preset; label: string }[] = [
  { value: "Flat", label: "Flat" },
  { value: "Bass", label: "Bass" },
  { value: "Vocal", label: "Vocal" },
];

const db = (n: number) => `${n > 0 ? "+" : ""}${n}`;

/** Where a band sits on its rail: 0 at −12 dB, 0.5 at 0 dB, 1 at +12 dB. */
const bandAt = (value: number) => (value + 12) / 24;

export function SliderDemo() {
  const last = signal("—");
  const volume = signal(60);
  const muted = signal(false);
  const price = signal<[number, number]>([100, 400]);
  const bands = BANDS.map(() => signal(0));
  const preset = signal<Preset>("Flat");

  return (
    <DemoPage title="Slider" note={() => last()}>
      <DemoCard title="Levels" subtitle="Levels and a range: the app owns the value">
        <View style={{ flexDirection: "column", gap: 14 }}>
          <View style={{ flexDirection: "column", gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <RowLabel label="Volume" detail={muted() ? "Muted" : "Media and alerts"} />
              <Text
                style={{
                  fontSize: controlSize.label,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {muted() ? "—" : `${volume()}%`}
              </Text>
            </View>
            {/* Quieter and louder at the ends; the louder one lights up near the top. */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                opacity: muted() ? 0.35 : 1,
              }}
            >
              <Icon icon={Volume1} size={controlSize.control} tint={colors.mutedForeground} />
              <Slider
                value={volume()}
                step={5}
                accessibilityLabel="Volume"
                onChange={({ value }) => volume.set(value as number)}
                onChangeEnd={({ value }) => last.set(`Volume: ${String(value)}`)}
                disabled={muted()}
                style={{ flex: 1 }}
              />
              <Icon
                icon={Volume2}
                size={controlSize.control}
                tint={volume() >= 80 && !muted() ? toneColor("accent") : colors.mutedForeground}
              />
              {/* The mute sits on the volume's own row, not at the card's foot under the price range. */}
              <Button
                variant="secondary"
                size="sm"
                onPress={() => {
                  muted.set(!muted());
                  last.set(muted() ? "Volume: muted" : "Volume: unmuted");
                }}
              >
                {muted() ? "Unmute" : "Mute"}
              </Button>
            </View>
          </View>

          <View style={{ flexDirection: "column", gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <RowLabel label="Price" detail={`${listings(price())} listings between the two`} />
              <Text
                style={{
                  fontSize: controlSize.label,
                  color: colors.mutedForeground,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {`$${price()[0]} – $${price()[1]}`}
              </Text>
            </View>
            {/* How many listings each price holds: the bars in the range light up as the thumbs move. */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-end",
                gap: 2,
                height: 36,
                paddingHorizontal: 7,
                marginBottom: -4,
              }}
            >
              <Each of={HISTOGRAM} key="index">
                {(n, i) => (
                  <View
                    class="transition-colors duration-150 motion-reduce:transition-none"
                    style={{
                      flex: 1,
                      height: `${Math.round((n() / HISTOGRAM_MAX) * 100)}%`,
                      minHeight: 2,
                      borderTopLeftRadius: 2,
                      borderTopRightRadius: 2,
                      backgroundColor: inRange(i(), price())
                        ? colors.primary
                        : alpha(colors.foreground, 0.1),
                    }}
                  />
                )}
              </Each>
            </View>
            <Slider
              value={price()}
              min={0}
              max={500}
              step={10}
              startAccessibilityLabel="Minimum price"
              accessibilityLabel="Maximum price"
              onChange={({ value }) => price.set(value as [number, number])}
              onChangeEnd={({ value }) =>
                last.set(`Price: ${(value as [number, number]).join(" to ")}`)
              }
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: controlSize.detail, color: colors.faint }}>
                Minimum price
              </Text>
              <Text style={{ fontSize: controlSize.detail, color: colors.faint }}>
                Maximum price
              </Text>
            </View>
          </View>
        </View>
      </DemoCard>

      <DemoCard title="Vertical" subtitle="Five bands from −12 to +12 dB">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ flex: 1, fontSize: controlSize.detail, color: colors.mutedForeground }}>
            Presets
          </Text>
          <Segmented
            value={preset()}
            onValueChange={(name) => {
              const next = name as Preset;
              preset.set(next);
              PRESETS[next].forEach((v, i) => bands[i].set(v));
              last.set(`Equalizer: ${next}`);
            }}
          >
            <SegmentedList size="sm">
              <Each of={PRESET_OPTIONS}>
                {(option) => <SegmentedItem value={option().value}>{option().label}</SegmentedItem>}
              </Each>
            </SegmentedList>
          </Segmented>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", paddingTop: 4 }}>
          <Each of={BANDS} key="index">
            {(name, i) => (
              <View style={{ alignItems: "center", gap: 6 }}>
                <Slider
                  value={bands[i()]()}
                  min={-12}
                  max={12}
                  axis="vertical"
                  showValue
                  accessibilityLabel={`${name()} band`}
                  onChange={({ value }) => {
                    bands[i()].set(value as number);
                    preset.set("Flat");
                  }}
                  onChangeEnd={({ value }) => last.set(`${name()}: ${String(value)} dB`)}
                  rangeStyle={sliderFill(
                    Math.max(0.5, bandAt(bands[i()]())),
                    Math.min(0.5, bandAt(bands[i()]())),
                    true,
                  )}
                >
                  <Text
                    class="text-center font-mono text-[11px] leading-none"
                    style={sliderValueStyle()}
                  >
                    {db(bands[i()]())}
                  </Text>
                </Slider>
                <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                  {name()}
                </Text>
              </View>
            )}
          </Each>
        </View>
        <Caption>A band set by hand leaves the preset at Flat</Caption>
      </DemoCard>
    </DemoPage>
  );
}
