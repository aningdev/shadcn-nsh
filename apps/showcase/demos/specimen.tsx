// Theme Specimen: the six built-in themes beside one L1 paradigm, switched live.
// ThemeTransition has no children; it sits beside the page and watches `shown`.
import {
  activeSpec,
  activeTheme,
  colors,
  defineTheme,
  isDark,
  selectTheme,
  shape,
  type SurfaceRole,
} from "@shadcn-nsh/theme";
import { ALL_THEMES, nshGallery } from "@shadcn-nsh/theme/themes";
import { signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Checkbox } from "@/packages/ui/checkbox";
import { Input } from "@/packages/ui/input";
import { ThemeTransition } from "@/packages/ui/lib/motion";
import { ThemedSurface } from "@/packages/ui/lib/surface";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Slider } from "@/packages/ui/slider";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoRow } from "../kit";

/** L1 showcase theme: hairline paper, sharp type, fluid motion, airy touch targets. */
const editorialPaper = defineTheme({
  id: "editorial-paper",
  label: "Editorial Paper",
  extends: nshGallery.spec,
  paradigm: {
    depth: "hairline",
    shape: "sharp",
    stroke: "crisp",
    motion: "fluid",
    feedback: "underline",
    density: "airy",
  },
  surfaces: {
    card: { effect: { kind: "paper-grain" } },
    plate: { effect: { kind: "paper-grain" } },
  },
});

const CHOICES = [
  ...ALL_THEMES.map((theme) => ({ name: theme.label, theme })),
  { name: "Editorial Paper (L1 Paradigm)", theme: editorialPaper },
] as const;

const ROLES = ["glass", "overlay", "card", "plate"] as const satisfies readonly SurfaceRole[];

function layerOf(role: SurfaceRole) {
  const spec = activeSpec().surfaces[role];
  return { ...spec, ...(isDark() ? spec.dark : spec.light) };
}

function materialLabel(role: SurfaceRole): string {
  const material = layerOf(role).material;
  if (material == null) return "none";
  return typeof material === "string" ? material : material.kind;
}

function effectLabel(role: SurfaceRole): string {
  return layerOf(role).effect?.kind ?? "none";
}

function opacityLabel(role: SurfaceRole): string {
  const background = layerOf(role).background;
  if (background == null) return "none";
  if (typeof background !== "object") return "solid";
  return "alpha" in background ? String(background.alpha) : "solid";
}

function optics(role: SurfaceRole): string {
  const blur = layerOf(role).backdropFilter ?? "none";
  return `${role}: material ${materialLabel(role)}, effect ${effectLabel(role)}, blur ${blur}, opacity ${opacityLabel(role)}`;
}

function motionLine(): string {
  const motion = activeSpec().motion;
  const spring = motion.spring;
  if (spring) return `Spring: ${spring.stiffness}/${spring.damping}/${spring.mass ?? 1}`;
  return `Easing: ${motion.default.easing}`;
}

/** Live theme contract: built-in themes and the Editorial Paper paradigm, read as they switch. */
export function SpecimenDemo() {
  const shown = signal(activeTheme().id);
  const title = signal("Morning edition");
  const alerts = signal(true);
  const publish = signal(false);
  const volume = signal(40);
  const column = signal("type");

  return (
    <DemoPage title="Theme Specimen">
      <View style={{ gap: 16 }}>
        <ThemeTransition value={shown()} />
        <DemoCard title="Themes" subtitle="Six built-in themes and one L1 paradigm">
          <DemoRow>
            <Each of={CHOICES} key="index">
              {(choice) => (
                <Button
                  variant="outline"
                  accessibilityLabel={`Theme ${choice().theme.label}`}
                  onPress={() => {
                    shown.set(choice().theme.id);
                    selectTheme(choice().theme);
                  }}
                >
                  {choice().name}
                </Button>
              )}
            </Each>
          </DemoRow>
        </DemoCard>
        <DemoCard title="Optical materials" subtitle="Glass, overlay, card, and plate">
          <DemoRow>
            <Each of={ROLES} key="index">
              {(role) => (
                <View style={{ gap: 6, width: 200 }}>
                  <View style={{ borderRadius: shape.control, overflow: "hidden" }}>
                    <ThemedSurface role={role()} style={{ minHeight: 88, padding: 12 }}>
                      <Text style={{ color: colors.foreground, fontWeight: "600" }}>{role()}</Text>
                    </ThemedSurface>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {() => optics(role())}
                  </Text>
                </View>
              )}
            </Each>
          </DemoRow>
        </DemoCard>
        <DemoCard title="Controls" subtitle="The same controls, in the theme just chosen">
          <DemoRow>
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Destructive</Button>
            <Badge>Badge</Badge>
          </DemoRow>
          <DemoRow>
            <Switch checked={alerts()} onChange={({ checked }) => alerts.set(checked)}>
              Alerts
            </Switch>
            <Checkbox checked={publish()} onChange={({ checked }) => publish.set(checked)}>
              Publish
            </Checkbox>
          </DemoRow>
          <Slider
            value={volume()}
            onChange={({ value }) => volume.set(typeof value === "number" ? value : value[0])}
            style={{ width: 220 }}
          />
          <Input value={title()} placeholder="Title" onChange={({ value }) => title.set(value)} />
          <Segmented value={column()} onValueChange={(value) => column.set(value)}>
            <SegmentedList>
              <SegmentedItem value="type">Type</SegmentedItem>
              <SegmentedItem value="write">Write</SegmentedItem>
            </SegmentedList>
          </Segmented>
        </DemoCard>
        <DemoCard title="Theme contract" subtitle="Resolved from the active theme">
          <View style={{ gap: 4 }}>
            <Text style={{ color: colors.foreground }}>
              {() => `Theme: ${activeTheme().label}`}
            </Text>
            <Text style={{ color: colors.foreground }}>
              {() => `Radius: ${activeSpec().tokens.radius.control}`}
            </Text>
            <Text style={{ color: colors.foreground }}>
              {() => `Switch: ${activeSpec().motion.presets.themeSwitch.kind}`}
            </Text>
            <Text style={{ color: colors.foreground }}>{() => motionLine()}</Text>
            <Text style={{ color: colors.foreground }}>
              {() =>
                `Pointer height: ${activeSpec().metrics.height.pointer.md} Touch height: ${activeSpec().metrics.height.touch.md}`
              }
            </Text>
            <Text style={{ color: colors.foreground }}>
              {() => `Glass effect: ${effectLabel("glass")}`}
            </Text>
          </View>
        </DemoCard>
      </View>
    </DemoPage>
  );
}
