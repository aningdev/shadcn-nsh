import { colors } from "@shadcn-nsh/theme";
// ColorPicker: the official gallery's color scenes (`references/nsh/website/demos/el-color-picker.tsx`) with this
// library's parts — an area with its sliders, hue and opacity, the fields in the format the menu picks, presets, a
// field that opens the picker in a popover, and an overlay read over artwork.
import type { JSX } from "nsh";
import { signal, Text, View } from "nsh";
import { type ColorFormat, ColorPicker } from "nsh/base";

import { ColorPanel, ColorPopover } from "@/packages/ui/color-picker";
import { formatColor, inkOn } from "@/packages/ui/lib/color-format";
import { insetSurface } from "@/packages/ui/lib/surface";

import { Caption, DemoCard, DemoPage } from "../kit";

// The presets are the app's content, not the interface's look.
const SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const FORMATS: ColorFormat[] = ["hex", "rgb", "hsl", "hsb", "oklch"];

/** One format's text, named over it. */
function FormatLine(props: { format: ColorFormat; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, minHeight: 26 }}>
      <Text style={{ width: 52, fontSize: 12, color: colors.mutedForeground }}>{props.format}</Text>
      <Text
        style={{
          flex: 1,
          fontSize: 12.5,
          fontVariant: ["tabular-nums"],
          color: colors.foreground,
        }}
      >
        {formatColor(props.value, props.format)}
      </Text>
    </View>
  );
}

/** A label over its control. */
function Field(props: { label: string; detail: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12.5, fontWeight: "500", color: colors.foreground }}>
        {props.label}
      </Text>
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.detail}</Text>
      {props.children}
    </View>
  );
}

/** A wide swatch of the color at hand, on the checkerboard where it is translucent. */
function Preview(props: { value: string; height?: number; children?: JSX.Element }) {
  return (
    <View
      style={{
        height: props.height ?? 64,
        borderRadius: 10,
        backgroundColor: props.value,
        borderWidth: 1,
        borderColor: colors.line,
        justifyContent: "flex-end",
        padding: 10,
      }}
    >
      {props.children}
    </View>
  );
}

export function ColorPickerDemo() {
  const last = signal("—");

  const fill = signal("#6366f1ff");
  const fillFormat = signal<ColorFormat>("hex");

  const accent = signal("#0ea5e9ff");
  const accentFormat = signal<ColorFormat>("rgb");

  const overlay = signal("#0f172a8c");

  return (
    <DemoPage title="Color Picker" note={() => last()}>
      <DemoCard title="Fill" subtitle="The area, its sliders, the fields, the presets">
        <View style={{ gap: 12 }}>
          <Preview value={fill()}>
            <Text
              style={{ fontSize: 11, fontWeight: "600", letterSpacing: 0.6, color: inkOn(fill()) }}
            >
              {fillFormat() === "hex"
                ? formatColor(fill(), "hex")
                : formatColor(fill(), fillFormat())}
            </Text>
          </Preview>
          <ColorPicker
            value={fill()}
            format={fillFormat()}
            onChange={({ value }) => fill.set(value)}
            onChangeEnd={({ formatted }) => last.set(`Fill color: ${formatted}`)}
          >
            <ColorPanel
              name="Fill color"
              value={fill()}
              format={fillFormat()}
              onFormatChange={(format) => {
                fillFormat.set(format);
                last.set(`Fill fields: ${format}`);
              }}
              alpha
              swatches={SWATCHES}
            />
          </ColorPicker>
        </View>
      </DemoCard>

      <DemoCard title="Formats" subtitle="One color read five ways; the field opens the picker">
        <View style={{ gap: 12 }}>
          <View>
            <Each of={FORMATS}>
              {(format) => <FormatLine format={format()} value={accent()} />}
            </Each>
          </View>
          <Field label="Accent color" detail="Links, focus rings and primary buttons">
            <ColorPopover
              name="Accent color"
              value={accent()}
              format={accentFormat()}
              onChange={(value) => accent.set(value)}
              onFormatChange={(format) => accentFormat.set(format)}
              onChangeEnd={(formatted) => last.set(`Accent ${formatted}`)}
            />
          </Field>
        </View>
      </DemoCard>

      <DemoCard title="Overlay" subtitle="Darken what is under it so the headline still reads">
        <View
          style={{
            ...insetSurface(),
            height: 150,
            justifyContent: "flex-end",
            padding: 16,
            overflow: "hidden",
            borderRadius: 10,
          }}
        >
          {/* The artwork is drawn from the theme, so the page paints the same every run. */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.brand,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.track,
              opacity: 0.35,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: overlay(),
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.6,
              color: inkOn(overlay()),
              opacity: 0.8,
            }}
          >
            NEW SEASON
          </Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: inkOn(overlay()) }}>
            Spring collection
          </Text>
        </View>
        <View style={{ gap: 10, marginTop: 12 }}>
          <ColorPopover
            name="Banner overlay"
            value={overlay()}
            format="rgb"
            alpha
            onChange={(value) => overlay.set(value)}
            onFormatChange={() => {}}
            onChangeEnd={(formatted) => last.set(`Overlay ${formatted}`)}
          />
          <Caption>{`Overlay ${formatColor(overlay(), "rgb")}; the headline's ink follows it`}</Caption>
        </View>
      </DemoCard>
    </DemoPage>
  );
}
