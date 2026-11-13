// The official color picker scene (`references/nsh/website/demos/el-color-picker.tsx`): a fill picked
// in place (area, eyedropper, hue and opacity, the copy button, the fields in the format its menu
// picks, eight presets), an accent whose field opens the picker in a popover, and a banner's
// overlay over artwork, its opacity included. The artwork is drawn from the theme rather than
// fetched, so the page draws the same before and after the network; the headline's ink is the one
// that reads over the overlay the user picks.
import type { JSX } from "nsh";
import { Image, mount, signal, Text, View } from "nsh";
import { type ColorFormat, ColorPicker } from "nsh/base";

import { ColorPanel, ColorPopover } from "@/packages/ui/color-picker";
import { inkOn } from "@/packages/ui/lib/color-format";
import { insetSurface, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { photoUrl } from "./photos";
import { desktop, Log, Panel, Split, ui } from "./stage";

// The preset swatches and the overlay's color are the user's content, not the interface's look.
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

/** A label over its control, a quieter line under the label. */
function Field(props: { label: string; detail: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ gap: 2 }}>
        <Text style={{ fontSize: 14, fontWeight: "500", color: ui().text }}>{props.label}</Text>
        <Text style={{ fontSize: 12, color: ui().muted }}>{props.detail}</Text>
      </View>
      {props.children}
    </View>
  );
}

/** A trigger's width: set with a pointer, the field's on a touch screen. */
const trigger = desktop ? { width: 260 } : undefined;

/**
 * The artwork, fetched once at load: in the cache, it paints in the frame that places it. A
 * download that fails is not a page that never draws: the artwork is blank, and the page still
 * marks itself ready.
 */
const warmed = signal(false);
Promise.allSettled([Image.prefetch(photoUrl("sunrise"))]).then(() => warmed.set(true));

function App() {
  // The render check waits for `images-ready`: the artwork has loaded (or failed).
  const loaded = signal(false);
  const fill = signal("#6366f1ff");
  const fillFormat = signal<ColorFormat>("hex");
  const accent = signal("#0ea5e9ff");
  const accentFormat = signal<ColorFormat>("hex");
  // rgb(15 23 42 / 0.55): slate at 55%.
  const overlay = signal("#0f172a8c");
  const overlayFormat = signal<ColorFormat>("rgb");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  return (
    <DemoPage title="Color picker">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Drag the area or a slider, type a color, or pick a swatch"
          : "Drag the area or a slider, or tap a swatch"}
      </Text>
      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`fill ${fill()}`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`accent ${accent()}`}
              </Text>
              <Text style={{ fontSize: 13, color: ui().text, fontVariant: ["tabular-nums"] }}>
                {`overlay ${overlay()}`}
              </Text>
            </Panel>
            <Log title="onChangeEnd({ formatted })" lines={events()} minHeight={120} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 24 }}>
          <Field label="Fill color" detail="In place: opacity, the format's fields and presets">
            <ColorPicker
              value={fill()}
              format={fillFormat()}
              onChange={({ value }) => fill.set(value)}
              onChangeEnd={({ formatted }) => log(`Fill ${formatted}`)}
            >
              <ColorPanel
                name="Fill color"
                value={fill()}
                format={fillFormat()}
                onFormatChange={(format) => fillFormat.set(format)}
                alpha
                swatches={SWATCHES}
              />
            </ColorPicker>
          </Field>
          <Field label="Accent color" detail="Used for links, focus rings and primary buttons.">
            <ColorPopover
              name="Accent color"
              value={accent()}
              format={accentFormat()}
              style={trigger}
              onChange={(value) => accent.set(value)}
              onFormatChange={(format) => accentFormat.set(format)}
              onChangeEnd={(formatted) => log(`Accent ${formatted}`)}
            />
          </Field>
          <Field label="Banner overlay" detail="Darken the artwork so the headline stays readable.">
            {/* The artwork under the overlay the picker sets: the headline stays readable as it
                darkens. */}
            <View
              style={{
                ...insetSurface(),
                height: 140,
                justifyContent: "flex-end",
                padding: 16,
                overflow: "hidden",
              }}
            >
              <Image
                src={warmed() ? photoUrl("sunrise") : undefined}
                // Drawn at once: a fade caught halfway would differ between two runs.
                fadeDuration={0}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  objectFit: "cover",
                }}
                onLoadEnd={() => loaded.set(true)}
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
            <ColorPopover
              name="Banner overlay"
              value={overlay()}
              format={overlayFormat()}
              alpha
              style={trigger}
              onChange={(value) => overlay.set(value)}
              onFormatChange={(format) => overlayFormat.set(format)}
              onChangeEnd={(formatted) => log(`Overlay ${formatted}`)}
            />
          </Field>
        </View>
      </Split>
      {/* The render check's cue: the artwork has loaded (or failed), so a run draws the same. */}
      {() =>
        loaded() ? (
          <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
        ) : null
      }
    </DemoPage>
  );
}

mount(App);
