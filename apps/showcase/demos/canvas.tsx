import {
  alpha,
  chart,
  colors,
  finish,
  isDark,
  mono,
  terminal,
  type Tone,
  toneColor,
  shape,
} from "@shadcn-nsh/theme";
import {
  Animated,
  Canvas,
  type CanvasRenderingContext2D,
  cleanup,
  createAnimatedValue,
  Easing,
  type GestureResponderEvent,
  Path2D,
  signal,
  Text,
  token,
  View,
} from "nsh";

import { Button } from "@/packages/ui/button";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Stat } from "@/packages/ui/stat";

import logo from "../assets/logo@2x.png";
import mark from "../assets/mark.svg";
import { desktop } from "./apps-shared";
import { Caption, Figure, Legend, SceneCard, ScenePage } from "./graphics-shared";

const TAU = Math.PI * 2;
const SANS = (size: number, weight = "400") => `${weight} ${size}px system-ui`;

const accentA = (a: number) => alpha(colors.brand, a);

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hatch(
  cx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  gap = 6,
) {
  cx.strokeStyle = color;
  cx.lineWidth = 1;
  cx.beginPath();
  for (let offset = -height; offset < width; offset += gap) {
    cx.moveTo(x + offset, y + height);
    cx.lineTo(x + offset + height, y);
  }
  cx.stroke();
}

function dashed(
  cx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  color: string = colors.border,
) {
  cx.save();
  cx.setLineDash([3, 4]);
  cx.strokeStyle = color;
  cx.lineWidth = 1;
  cx.beginPath();
  cx.moveTo(x0, y0);
  cx.lineTo(x1, y1);
  cx.stroke();
  cx.restore();
}

function reveal(duration = 900) {
  const t = createAnimatedValue(0);
  const replay = () => {
    t.set(0);
    void t.timing(1, { duration, easing: Easing.out(Easing.cubic) });
  };
  replay();
  return { t, replay };
}

const presets = [
  { value: "idle", label: "Idle", load: 18 },
  { value: "cruise", label: "Cruise", load: 57 },
  { value: "peak", label: "Peak", load: 91 },
] as const;
type Preset = (typeof presets)[number]["value"];

/** The preset a segment's value names (the control's value is a string). */
const presetOf = (value: string): Preset =>
  presets.find((item) => item.value === value)?.value ?? "cruise";

/** The presets, in the gallery's segmented control. */
function PresetChoice(props: { value: Preset; onChange: (next: Preset) => void }) {
  return (
    <Segmented value={props.value} onValueChange={(next) => props.onChange(presetOf(next))}>
      <SegmentedList>
        <SegmentedItem value="idle">Idle</SegmentedItem>
        <SegmentedItem value="cruise">Cruise</SegmentedItem>
        <SegmentedItem value="peak">Peak</SegmentedItem>
      </SegmentedList>
    </Segmented>
  );
}

function Dial() {
  const preset = signal<Preset>("cruise");
  const load = () => presets.find((item) => item.value === preset())?.load ?? 0;
  const needle = createAnimatedValue(0);
  void needle.spring(load(), { stiffness: 90, damping: 9 });
  const choose = (next: Preset) => {
    preset.set(next);
    void needle.spring(load(), { stiffness: 140, damping: 11 });
  };
  const a0 = 0.75 * Math.PI;
  const a1 = 2.25 * Math.PI;
  const angle = needle.interpolate({ inputRange: [0, 100], outputRange: [a0, a1] });
  const zone = (): Tone => (load() >= 85 ? "destructive" : load() >= 60 ? "warn" : "up");
  return (
    <SceneCard
      title="Turbine 3 load"
      subtitle="Needle and sweep on one animated value"
      action={<PresetChoice value={preset()} onChange={choose} />}
    >
      <Canvas
        testID="dial"
        style={{ height: 230 }}
        draw={(cx, { width, height }) => {
          const centerX = width / 2;
          const centerY = height * 0.54;
          const r = Math.min(width / 2 - 8, height * 0.5) - 6;
          const at = (value: number) => a0 + (value / 100) * (a1 - a0);
          cx.save();
          cx.beginPath();
          cx.arc(centerX, centerY, r + 2, at(85), a1);
          cx.arc(centerX, centerY, r - 20, a1, at(85), true);
          cx.closePath();
          cx.clip();
          cx.fillStyle = alpha(colors.destructive, 0.08);
          const zoneX = centerX + 0.6 * r;
          const zoneY = centerY - 0.2 * r;
          const zoneWidth = 0.4 * r + 4;
          cx.fillRect(zoneX, zoneY, zoneWidth, r);
          hatch(cx, zoneX, zoneY, zoneWidth, r, alpha(colors.destructive, 0.55), 5);
          cx.restore();
          for (let index = 0; index <= 50; index++) {
            const a = at(index * 2);
            const major = index % 10 === 0;
            const inner = r - (major ? 14 : 8);
            cx.strokeStyle =
              index * 2 >= 85 ? colors.destructive : major ? colors.mutedForeground : colors.faint;
            cx.lineWidth = major ? 2 : 1;
            cx.lineCap = "round";
            cx.beginPath();
            cx.moveTo(centerX + Math.cos(a) * inner, centerY + Math.sin(a) * inner);
            cx.lineTo(centerX + Math.cos(a) * r, centerY + Math.sin(a) * r);
            cx.stroke();
            if (major) {
              const label = String(index * 2);
              cx.font = SANS(11);
              cx.fillStyle = colors.faint;
              cx.textAlign = "center";
              cx.textBaseline = "middle";
              cx.fillText(
                label,
                centerX + Math.cos(a) * (r - 28),
                centerY + Math.sin(a) * (r - 28),
              );
            }
          }
          const sweepRadius = r + 12;
          cx.lineWidth = 5;
          cx.lineCap = "round";
          cx.strokeStyle = colors.raised;
          cx.beginPath();
          cx.arc(centerX, centerY, sweepRadius, a0, a1);
          cx.stroke();
          const gradient = cx.createConicGradient(a0 - 0.2, centerX, centerY);
          gradient.addColorStop(0, colors.info);
          gradient.addColorStop(0.45, colors.brand);
          gradient.addColorStop(0.75, colors.warn);
          gradient.addColorStop(0.8, colors.destructive);
          cx.strokeStyle = gradient;
          cx.beginPath();
          cx.arc(centerX, centerY, sweepRadius, a0, angle);
          cx.stroke();
          cx.textAlign = "center";
          cx.textBaseline = "alphabetic";
          cx.font = SANS(40, "600");
          cx.fillStyle = colors.foreground;
          cx.fillText(String(load()), centerX, centerY + r * 0.62);
          cx.font = SANS(11);
          cx.fillStyle = colors.faint;
          cx.fillText("% load", centerX, centerY + r * 0.62 + 18);
          cx.save();
          cx.translate(centerX, centerY);
          cx.rotate(angle);
          cx.shadowColor = "rgba(0,0,0,0.5)";
          cx.shadowBlur = 6;
          cx.fillStyle = colors.foreground;
          cx.beginPath();
          cx.moveTo(-14, -3);
          cx.lineTo(r - 18, 0);
          cx.lineTo(-14, 3);
          cx.closePath();
          cx.fill();
          cx.restore();
          cx.fillStyle = colors.raised;
          cx.strokeStyle = colors.foreground;
          cx.lineWidth = 2;
          cx.beginPath();
          cx.arc(centerX, centerY, 7, 0, TAU);
          cx.fill();
          cx.stroke();
        }}
      />
      <View style={{ flexDirection: "row" }}>
        <Stat
          width="33%"
          label="Zone"
          value={zone() === "destructive" ? "Redline" : zone() === "warn" ? "High" : "Nominal"}
          tone={zone()}
        />
        <Stat width="33%" label="Spool" value={`${(load() * 128).toLocaleString()} rpm`} />
        <Stat width="33%" label="Limit" value="85 %" tone="destructive" />
      </View>
    </SceneCard>
  );
}

const fresh = (random = Math.random) =>
  Array.from({ length: 14 }, (_, index) =>
    Math.round(28 + 40 * Math.sin(index / 2.2) ** 2 + random() * 26),
  );

function AreaChart() {
  const data = signal(fresh(seeded(7)));
  const sweep = reveal(1100);
  const last = () => data()[data().length - 1];
  const avg = () => Math.round(data().reduce((sum, value) => sum + value, 0) / data().length);
  return (
    <SceneCard
      title="Relay throughput"
      subtitle="Area · average · hatching"
      action={
        <Button
          size="sm"
          variant="secondary"
          onPress={() => {
            data.set(fresh());
            sweep.replay();
          }}
        >
          New
        </Button>
      }
    >
      <Figure
        value={`${last()}.${(last() * 7) % 10}`}
        unit="k/s"
        note={`${last() >= avg() ? "+" : "−"}${Math.abs(last() - avg())} vs. average`}
        tone={last() >= avg() ? "up" : "down"}
      />
      <Canvas
        style={{ height: 180 }}
        draw={(cx, { width, height }) => {
          const values = data();
          cx.font = SANS(11);
          const labelWidth = cx.measureText("100").width;
          const pad = { left: labelWidth + 8, right: 4, top: 16, bottom: 20 };
          const innerWidth = width - pad.left - pad.right;
          const innerHeight = height - pad.top - pad.bottom;
          const x = (index: number) => pad.left + (index / (values.length - 1)) * innerWidth;
          const y = (value: number) => pad.top + innerHeight - (value / 100) * innerHeight;
          cx.textBaseline = "middle";
          for (const value of [0, 50, 100]) {
            dashed(cx, pad.left, y(value), width - pad.right, y(value), colors.line);
            const label = String(value);
            cx.fillStyle = colors.faint;
            cx.fillText(label, pad.left - 8 - cx.measureText(label).width, y(value));
          }
          const windowX = x(9);
          const windowWidth = x(11) - x(9);
          cx.save();
          cx.beginPath();
          cx.rect(windowX, pad.top, windowWidth, innerHeight);
          cx.clip();
          hatch(cx, windowX, pad.top, windowWidth, innerHeight, alpha(colors.warn, 0.28), 6);
          cx.restore();
          cx.fillStyle = colors.warn;
          cx.textBaseline = "alphabetic";
          cx.fillText("deploy", windowX + 2, pad.top - 4);
          cx.fillStyle = colors.faint;
          for (const index of [0, 7, 13]) {
            const label = index === 13 ? "now" : `d-${13 - index}`;
            const textWidth = cx.measureText(label).width;
            cx.fillText(
              label,
              Math.min(width - pad.right - textWidth, Math.max(pad.left, x(index) - textWidth / 2)),
              height - 4,
            );
          }
          cx.save();
          cx.beginPath();
          cx.rect(pad.left - 6, 0, sweep.t.mul(innerWidth + 12), height);
          cx.clip();
          const area = cx.createLinearGradient(0, pad.top, 0, pad.top + innerHeight);
          area.addColorStop(0, accentA(0.26));
          area.addColorStop(1, accentA(0));
          cx.beginPath();
          cx.moveTo(x(0), y(values[0]));
          values.forEach((value, index) => index > 0 && cx.lineTo(x(index), y(value)));
          cx.lineTo(x(values.length - 1), pad.top + innerHeight);
          cx.lineTo(x(0), pad.top + innerHeight);
          cx.closePath();
          cx.fillStyle = area;
          cx.fill();
          cx.beginPath();
          values.forEach((value, index) =>
            index === 0 ? cx.moveTo(x(index), y(value)) : cx.lineTo(x(index), y(value)),
          );
          cx.strokeStyle = colors.brand;
          cx.lineWidth = 2;
          cx.lineJoin = "round";
          cx.stroke();
          values.forEach((value, index) => {
            cx.beginPath();
            cx.arc(x(index), y(value), index === values.length - 1 ? 4.5 : 2.5, 0, TAU);
            cx.fillStyle = colors.inset;
            cx.fill();
            cx.strokeStyle = colors.brand;
            cx.lineWidth = 1.5;
            cx.stroke();
          });
          cx.restore();
          const mean = avg();
          dashed(cx, pad.left, y(mean), width - pad.right, y(mean), colors.mutedForeground);
          const label = `avg ${mean}`;
          const textWidth = cx.measureText(label).width + 12;
          cx.fillStyle = colors.raised;
          cx.beginPath();
          cx.roundRect(width - pad.right - textWidth, y(mean) - 9, textWidth, 18, 9);
          cx.fill();
          cx.fillStyle = colors.foreground;
          cx.textBaseline = "middle";
          cx.fillText(label, width - pad.right - textWidth + 6, y(mean));
        }}
      />
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Legend color={colors.brand} label="Messages" />
        <Legend color={colors.mutedForeground} label="Average" />
        <Legend color={colors.warn} label="Deploy" />
      </View>
    </SceneCard>
  );
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ridges = days.map((_, day) => {
  const random = seeded(100 + day);
  const peaks = [6 + random() * 4, 12 + random() * 3, 17 + random() * 4];
  const weights = [0.5 + random() * 0.5, 0.4 + random() * 0.6, 0.3 + random() * 0.7].map((weight) =>
    day >= 5 ? weight * 0.55 : weight,
  );
  return Array.from({ length: 25 }, (_, hour) =>
    peaks.reduce(
      (sum, peak, index) => sum + weights[index] * Math.exp(-((hour - peak) ** 2) / 6),
      0.04,
    ),
  );
});

const ridgePeak = Math.max(...ridges.flat());

/** Seven days, six hue roles: chart-1, up, info, warn, muted-foreground, destructive, then brand again. */
const dayColors = [
  chart.chart1,
  colors.up,
  colors.info,
  colors.warn,
  colors.mutedForeground,
  colors.destructive,
  colors.brand,
];
const dayColor = (day: number, a = 1) => alpha(dayColors[day], a);

function Ridgeline() {
  const sweep = reveal(1400);
  return (
    <SceneCard
      title="Footfall by hour"
      subtitle="Ridgeline, one curve a day"
      action={
        <Button size="sm" variant="secondary" onPress={sweep.replay}>
          Replay
        </Button>
      }
    >
      <Caption label="Gate B, last week" note="Peak 12:00–14:00" />
      <Canvas
        style={{ height: 230 }}
        draw={(cx, { width, height }) => {
          cx.font = SANS(11);
          const left = cx.measureText("Mon").width + 10;
          const bottom = 22;
          const amplitude = 40;
          const top = amplitude + 6;
          const step = (height - bottom - top) / (days.length - 1);
          const x = (hour: number) => left + (hour / 24) * (width - left);
          cx.fillStyle = colors.faint;
          cx.textBaseline = "alphabetic";
          for (const hour of [0, 6, 12, 18, 24]) {
            const label = String(hour).padStart(2, "0");
            const textWidth = cx.measureText(label).width;
            cx.fillText(
              label,
              Math.min(width - textWidth, Math.max(left, x(hour) - textWidth / 2)),
              height - 3,
            );
          }
          cx.save();
          cx.beginPath();
          cx.rect(0, 0, sweep.t.mul(width), height);
          cx.clip();
          ridges.forEach((series, day) => {
            const base = top + day * step;
            const y = (value: number) => base - (value / ridgePeak) * amplitude;
            const curve = () => {
              cx.moveTo(x(0), y(series[0]));
              for (let hour = 1; hour < series.length; hour++) {
                const midX = (x(hour - 1) + x(hour)) / 2;
                cx.quadraticCurveTo(
                  x(hour - 1),
                  y(series[hour - 1]),
                  midX,
                  (y(series[hour - 1]) + y(series[hour])) / 2,
                );
              }
              cx.lineTo(x(24), y(series[24]));
            };
            cx.beginPath();
            curve();
            cx.lineTo(x(24), base);
            cx.lineTo(x(0), base);
            cx.closePath();
            cx.fillStyle = colors.inset;
            cx.fill();
            const fade = cx.createLinearGradient(0, base - amplitude, 0, base - amplitude * 0.3);
            fade.addColorStop(0, dayColor(day, 0.34));
            fade.addColorStop(1, dayColor(day, 0));
            cx.fillStyle = fade;
            cx.fill();
            cx.strokeStyle = dayColor(day);
            cx.lineWidth = 1.5;
            cx.lineJoin = "round";
            cx.beginPath();
            curve();
            cx.stroke();
          });
          dashed(cx, x(12), 0, x(12), height - bottom, alpha(colors.mutedForeground, 0.35));
          dashed(cx, x(14), 0, x(14), height - bottom, alpha(colors.mutedForeground, 0.35));
          cx.restore();
          days.forEach((day, index) => {
            cx.fillStyle = dayColor(index);
            cx.fillText(day, 0, top + index * step - 2);
          });
        }}
      />
    </SceneCard>
  );
}

const levels = () => [colors.raised, accentA(0.22), accentA(0.45), accentA(0.7), colors.brand];

function DotMatrix() {
  const pulse = createAnimatedValue(0);
  const loop = Animated.loop(
    Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad) }),
  );
  void loop.start();
  cleanup(() => loop.stop());
  return (
    <SceneCard title="Beacon uptime" subtitle="Dot matrix, one column a day">
      <Figure value="99.94" unit="%" note="3 incidents" tone="destructive" />
      <Canvas
        style={{ height: 96 }}
        draw={(cx, { width, height }) => {
          const rows = 7;
          const gap = 12.5;
          const cols = Math.floor(width / gap);
          const originX = (width - (cols - 1) * gap) / 2;
          const originY = (height - (rows - 1) * gap) / 2;
          const random = seeded(42);
          let lastX = 0;
          let lastY = 0;
          for (let column = 0; column < cols; column++) {
            for (let row = 0; row < rows; row++) {
              const value = random();
              const incident =
                (column === 6 && row === 2) ||
                (column === 17 && row === 5) ||
                (column === cols - 4 && row === 3);
              cx.fillStyle = incident
                ? colors.destructive
                : levels()[Math.min(4, Math.floor(value * value * 5 + (column / cols) * 1.6))];
              cx.beginPath();
              cx.arc(originX + column * gap, originY + row * gap, 3.6, 0, TAU);
              cx.fill();
              lastX = originX + column * gap;
              lastY = originY + row * gap;
            }
          }
          cx.save();
          cx.globalAlpha = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 0] });
          cx.strokeStyle = colors.brand;
          cx.lineWidth = 1.5;
          cx.beginPath();
          cx.arc(
            lastX,
            lastY,
            pulse.interpolate({ inputRange: [0, 1], outputRange: [4, 11] }),
            0,
            TAU,
          );
          cx.stroke();
          cx.restore();
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Less</Text>
        <Each of={levels()}>
          {(color) => (
            <View style={{ width: 9, height: 9, borderRadius: 2.5, backgroundColor: color() }} />
          )}
        </Each>
        <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>More</Text>
        <Legend color={colors.destructive} label="Incident" />
      </View>
    </SceneCard>
  );
}

const routes = [
  { name: "North Gate", before: 182, after: 96 },
  { name: "Harbor", before: 240, after: 131 },
  { name: "Old Mill", before: 128, after: 104 },
  { name: "Ridge", before: 205, after: 88 },
  { name: "Lowfield", before: 96, after: 71 },
  { name: "Quarry", before: 151, after: 160 },
];

function Dumbbell() {
  const t = createAnimatedValue(0);
  const play = () => {
    t.set(0);
    void t.timing(1, { duration: 1500, easing: Easing.out(Easing.cubic) });
  };
  play();
  return (
    <SceneCard
      title="Route latency"
      subtitle="Dumbbell, before → after"
      action={
        <Button size="sm" variant="secondary" onPress={play}>
          Replay
        </Button>
      }
    >
      <Canvas
        style={{ height: 30 * routes.length + 24 }}
        draw={(cx, { width, height }) => {
          cx.font = SANS(13);
          const left = Math.max(...routes.map((route) => cx.measureText(route.name).width)) + 12;
          cx.font = SANS(11);
          const right = cx.measureText("+00%").width + 10;
          const max = 250;
          const x = (ms: number) => left + (ms / max) * (width - left - right);
          cx.textBaseline = "alphabetic";
          for (const ms of [0, 100, 200]) {
            dashed(cx, x(ms), 0, x(ms), height - 18, colors.line);
            cx.fillStyle = colors.faint;
            const label = String(ms);
            cx.fillText(label, x(ms) - cx.measureText(label).width / 2, height - 3);
          }
          routes.forEach((route, index) => {
            const centerY = 15 + index * 30;
            const start = index * 0.07;
            const after = t.interpolate({
              inputRange: [start, start + 0.6],
              outputRange: [x(route.before), x(route.after)],
            });
            const worse = route.after > route.before;
            const tone = worse ? colors.destructive : colors.brand;
            cx.font = SANS(13);
            cx.fillStyle = colors.mutedForeground;
            cx.textBaseline = "middle";
            cx.fillText(route.name, 0, centerY);
            cx.strokeStyle = worse ? alpha(colors.destructive, 0.5) : accentA(0.45);
            cx.lineWidth = 3;
            cx.lineCap = "round";
            cx.beginPath();
            cx.moveTo(x(route.before), centerY);
            cx.lineTo(after, centerY);
            cx.stroke();
            cx.fillStyle = colors.inset;
            cx.strokeStyle = colors.mutedForeground;
            cx.lineWidth = 1.5;
            cx.beginPath();
            cx.arc(x(route.before), centerY, 4.5, 0, TAU);
            cx.fill();
            cx.stroke();
            cx.fillStyle = tone;
            cx.beginPath();
            cx.arc(after, centerY, 5.5, 0, TAU);
            cx.fill();
            const pct = Math.round(((route.after - route.before) / route.before) * 100);
            const label = `${pct > 0 ? "+" : ""}${pct}%`;
            cx.font = SANS(11);
            cx.fillStyle = tone;
            cx.fillText(label, width - cx.measureText(label).width, centerY);
          });
        }}
      />
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Legend color={colors.mutedForeground} label="Before" />
        <Legend color={colors.brand} label="After" />
        <Legend color={colors.destructive} label="Regressed" />
      </View>
    </SceneCard>
  );
}

function Clock() {
  const seconds = createAnimatedValue(0);
  const loop = Animated.loop(
    Animated.timing(seconds, { toValue: 60, duration: 60_000, easing: Easing.linear }),
  );
  void loop.start();
  cleanup(() => loop.stop());
  return (
    <SceneCard title="Transforms" subtitle="translate · rotate · save / restore">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Canvas
          style={{ width: 150, height: 150 }}
          draw={(cx, { width }) => {
            const r = width / 2;
            cx.translate(r, r);
            cx.fillStyle = colors.card;
            cx.strokeStyle = colors.border;
            cx.lineWidth = 1.5;
            cx.beginPath();
            cx.arc(0, 0, r - 2, 0, TAU);
            cx.fill();
            cx.stroke();
            for (let index = 0; index < 60; index++) {
              cx.save();
              cx.rotate((index / 60) * TAU);
              cx.strokeStyle = index % 5 === 0 ? colors.mutedForeground : colors.faint;
              cx.lineWidth = index % 5 === 0 ? 2 : 1;
              cx.beginPath();
              cx.moveTo(r - 8, 0);
              cx.lineTo(r - (index % 5 === 0 ? 17 : 12), 0);
              cx.stroke();
              cx.restore();
            }
            const hand = (angle: number, length: number, strokeWidth: number) => {
              cx.save();
              cx.rotate(angle - Math.PI / 2);
              cx.strokeStyle = colors.foreground;
              cx.lineWidth = strokeWidth;
              cx.lineCap = "round";
              cx.beginPath();
              cx.moveTo(-8, 0);
              cx.lineTo(length, 0);
              cx.stroke();
              cx.restore();
            };
            hand((10 / 12) * TAU, r * 0.48, 4.5);
            hand((10 / 60) * TAU, r * 0.7, 3);
            cx.save();
            cx.rotate(seconds.mul(TAU / 60));
            cx.rotate(-Math.PI / 2);
            cx.strokeStyle = colors.brand;
            cx.lineWidth = 1.5;
            cx.beginPath();
            cx.moveTo(-14, 0);
            cx.lineTo(r * 0.8, 0);
            cx.stroke();
            cx.restore();
            cx.fillStyle = colors.brand;
            cx.beginPath();
            cx.arc(0, 0, 4, 0, TAU);
            cx.fill();
          }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <Caption label="Ticks" note="60 rotations" />
          <Caption label="Hands" note="save, restore" />
          <Caption label="Second hand" note="Native loop" />
        </View>
      </View>
    </SceneCard>
  );
}

const GLYPH = terminal ? 64 : 30;

const glyphs: { name: string; path: Path2D; color: Tone; stroke?: boolean }[] = [
  {
    name: "Heart",
    path: new Path2D(
      "M12 21s-7-4.35-9.5-8.5C.5 8.5 3 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 4 0 6.5 4.5 4.5 8.5C19 16.65 12 21 12 21z",
    ),
    color: "destructive",
  },
  {
    name: "Star",
    path: new Path2D(
      "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z",
    ),
    color: "warn",
  },
  { name: "Bolt", path: new Path2D("M13 2L3 14h7l-1 8 10-12h-7z"), color: "info" },
  { name: "Check", path: new Path2D("M20 6L9 17l-5-5"), color: "accent", stroke: true },
];

function Glyphs() {
  return (
    <SceneCard title="Path2D" subtitle="SVG path data, parsed natively">
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Each of={glyphs}>
          {(glyph) => (
            <View style={{ alignItems: "center", gap: 8 }}>
              <View
                style={
                  terminal
                    ? { alignItems: "center" }
                    : {
                        width: 60,
                        height: 60,
                        borderRadius: 18,
                        borderCurve: "continuous",
                        backgroundColor: colors.raised,
                        ...finish.raised,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }
                }
              >
                <Canvas
                  style={{ width: GLYPH, height: GLYPH }}
                  draw={(cx) => {
                    cx.scale(GLYPH / 24, GLYPH / 24);
                    if (glyph().stroke) {
                      cx.strokeStyle = toneColor(glyph().color);
                      cx.lineWidth = 2.5;
                      cx.lineCap = "round";
                      cx.lineJoin = "round";
                      cx.stroke(glyph().path);
                    } else {
                      cx.fillStyle = toneColor(glyph().color);
                      cx.fill(glyph().path);
                    }
                  }}
                />
              </View>
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{glyph().name}</Text>
            </View>
          )}
        </Each>
      </View>
    </SceneCard>
  );
}

function Compositing() {
  const label = {
    flex: 1,
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: "center",
  } as const;
  return (
    <SceneCard title="Compositing" subtitle="Clip, shadow, destination-out, dashes">
      <Canvas
        style={{ height: 132 }}
        draw={(cx, { width, height }) => {
          const centerY = height / 2;
          const shadow = isDark() ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.2)";
          const first = width / 6;
          cx.save();
          cx.shadowColor = shadow;
          cx.shadowBlur = 16;
          cx.shadowOffsetY = 6;
          cx.fillStyle = colors.raised;
          cx.beginPath();
          cx.arc(first, centerY, 40, 0, TAU);
          cx.fill();
          cx.restore();
          cx.save();
          cx.beginPath();
          cx.arc(first, centerY, 40, 0, TAU);
          cx.clip();
          const disc = cx.createLinearGradient(first - 40, centerY - 40, first + 40, centerY + 40);
          disc.addColorStop(0, colors.raised);
          disc.addColorStop(1, colors.inset);
          cx.fillStyle = disc;
          cx.fillRect(first - 40, centerY - 40, 80, 80);
          cx.drawImage(logo, first - 46, centerY - 46, 92, 92);
          cx.restore();
          cx.strokeStyle = accentA(0.55);
          cx.lineWidth = 1.5;
          cx.beginPath();
          cx.arc(first, centerY, 44, 0, TAU);
          cx.stroke();
          const second = width / 2;
          cx.save();
          cx.shadowColor = shadow;
          cx.shadowBlur = 16;
          cx.shadowOffsetY = 6;
          const paper = cx.createLinearGradient(
            second - 52,
            centerY - 36,
            second + 52,
            centerY + 36,
          );
          paper.addColorStop(0, colors.primary);
          paper.addColorStop(1, colors.up);
          cx.fillStyle = paper;
          cx.beginPath();
          cx.roundRect(second - 52, centerY - 36, 104, 72, 14);
          cx.fill();
          cx.restore();
          cx.globalCompositeOperation = "destination-out";
          cx.beginPath();
          cx.arc(second + 20, centerY - 36, 8, 0, TAU);
          cx.arc(second + 20, centerY + 36, 8, 0, TAU);
          cx.fill();
          cx.beginPath();
          cx.arc(second - 16, centerY, 13, 0, TAU);
          cx.fill();
          cx.setLineDash([4, 4]);
          cx.lineWidth = 2;
          cx.beginPath();
          cx.moveTo(second + 20, centerY - 26);
          cx.lineTo(second + 20, centerY + 26);
          cx.stroke();
          cx.setLineDash([]);
          cx.globalCompositeOperation = "source-over";
          const third = (5 * width) / 6;
          const glow = cx.createRadialGradient(third, centerY, 22, third, centerY, 52);
          glow.addColorStop(0, alpha(colors.warn, 0.32));
          glow.addColorStop(1, alpha(colors.warn, 0));
          cx.fillStyle = glow;
          cx.beginPath();
          cx.arc(third, centerY, 52, 0, TAU);
          cx.fill();
          const lit = cx.createRadialGradient(third - 10, centerY - 12, 2, third, centerY, 30);
          lit.addColorStop(0, colors.primary);
          lit.addColorStop(0.35, colors.warn);
          lit.addColorStop(0.75, colors.destructive);
          lit.addColorStop(1, colors.destructive);
          cx.fillStyle = lit;
          cx.beginPath();
          cx.arc(third, centerY, 30, 0, TAU);
          cx.fill();
          cx.setLineDash([3, 5]);
          cx.strokeStyle = alpha(colors.warn, 0.6);
          cx.lineWidth = 1.25;
          cx.beginPath();
          cx.arc(third, centerY, 42, 0, TAU);
          cx.stroke();
          cx.setLineDash([]);
          cx.fillStyle = colors.warn;
          cx.beginPath();
          cx.arc(third + 42 * Math.cos(-0.7), centerY + 42 * Math.sin(-0.7), 4, 0, TAU);
          cx.fill();
        }}
      />
      <View style={{ flexDirection: "row" }}>
        <Text style={label}>Clipped image</Text>
        <Text style={label}>Cut-out</Text>
        <Text style={label}>Radial gradient</Text>
      </View>
    </SceneCard>
  );
}

const SAMPLE: { letter: number; points: [number, number][] }[] = [
  {
    letter: 0,
    points: [
      [0, 1],
      [0, 0],
      [1, 1],
      [1, 0],
    ],
  },
  {
    letter: 1,
    points: [
      [0.95, 0.16],
      [0.8, 0.05],
      [0.55, 0],
      [0.3, 0.02],
      [0.1, 0.12],
      [0.05, 0.26],
      [0.15, 0.4],
      [0.4, 0.49],
      [0.7, 0.57],
      [0.92, 0.7],
      [0.95, 0.84],
      [0.8, 0.95],
      [0.5, 1],
      [0.22, 0.97],
      [0.05, 0.84],
    ],
  },
  {
    letter: 2,
    points: [
      [0, 0],
      [0, 1],
    ],
  },
  {
    letter: 2,
    points: [
      [1, 0],
      [1, 1],
    ],
  },
  {
    letter: 2,
    points: [
      [0, 0.5],
      [1, 0.5],
    ],
  },
];
const samplePoints = SAMPLE.reduce((total, stroke) => total + stroke.points.length, 0);

function Sketch() {
  const strokes = signal<[number, number][][]>([]);
  const sample = signal(true);
  const point = (event: GestureResponderEvent): [number, number] => [
    event.locationX,
    event.locationY,
  ];
  return (
    <SceneCard
      title="Sketch"
      subtitle={desktop() ? "Drag → draw from JS" : "Touch → draw from JS"}
      action={
        <Button
          size="sm"
          variant="secondary"
          disabled={!sample() && strokes().length === 0}
          onPress={() => {
            sample.set(false);
            strokes.set([]);
          }}
        >
          Clear
        </Button>
      }
    >
      <Canvas
        style={{ height: 200 }}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(event) => {
          strokes.set([...strokes(), [point(event)]]);
          return true;
        }}
        onResponderTerminationRequest={() => false}
        onResponderMove={(event) => {
          const all = strokes();
          const last = all[all.length - 1];
          strokes.set([...all.slice(0, -1), [...last, point(event)]]);
        }}
        draw={(cx, { width, height }) => {
          cx.fillStyle = colors.border;
          for (let x = 8; x < width; x += 16) {
            for (let y = 8; y < height; y += 16) cx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
          }
          if (!sample() && strokes().length === 0) {
            cx.font = SANS(14);
            cx.fillStyle = colors.faint;
            cx.textAlign = "center";
            cx.textBaseline = "middle";
            cx.fillText("Draw here", width / 2, height / 2);
          }
          cx.strokeStyle = colors.brand;
          cx.lineWidth = 3;
          cx.lineCap = "round";
          cx.lineJoin = "round";
          if (sample()) {
            const widthSample = 50;
            const heightSample = 72;
            const gap = 24;
            const originX = (width - (3 * widthSample + 2 * gap)) / 2;
            const originY = (height - heightSample) / 2;
            for (const stroke of SAMPLE) {
              const at = ([x, y]: [number, number]): [number, number] => [
                originX + stroke.letter * (widthSample + gap) + x * widthSample,
                originY + y * heightSample,
              ];
              const points = stroke.points.map(at);
              cx.beginPath();
              cx.moveTo(points[0][0], points[0][1]);
              if (points.length > 4) {
                for (let index = 1; index < points.length - 1; index++) {
                  cx.quadraticCurveTo(
                    points[index][0],
                    points[index][1],
                    (points[index][0] + points[index + 1][0]) / 2,
                    (points[index][1] + points[index + 1][1]) / 2,
                  );
                }
                cx.lineTo(points[points.length - 1][0], points[points.length - 1][1]);
              } else {
                for (const [x, y] of points.slice(1)) cx.lineTo(x, y);
              }
              cx.stroke();
            }
          }
          for (const stroke of strokes()) {
            cx.beginPath();
            stroke.forEach(([x, y], index) => (index === 0 ? cx.moveTo(x, y) : cx.lineTo(x, y)));
            cx.stroke();
          }
        }}
      />
      <Caption
        label="Strokes"
        note={`${strokes().length + (sample() ? SAMPLE.length : 0)} · ${strokes().reduce((total, stroke) => total + stroke.length, 0) + (sample() ? samplePoints : 0)} points`}
      />
    </SceneCard>
  );
}

function SvgImage() {
  return (
    <SceneCard title="SVG on a canvas" subtitle="An imported SVG drawn with drawImage">
      <Canvas
        style={{ height: 132 }}
        draw={(cx, { width, height }) => {
          cx.fillStyle = colors.raised;
          cx.beginPath();
          cx.roundRect(12, 12, width - 24, height - 24, shape.container);
          cx.fill();
          const scale = Math.min((width - 48) / 120, (height - 48) / 60);
          const imageWidth = 120 * scale;
          const imageHeight = 60 * scale;
          cx.drawImage(
            mark,
            (width - imageWidth) / 2,
            (height - imageHeight) / 2,
            imageWidth,
            imageHeight,
          );
        }}
      />
      <Caption label="drawImage" note={`SVG 120 × 60${terminal ? ` · ${mono()}` : ""}`} />
    </SceneCard>
  );
}

const cards = [
  Dial,
  AreaChart,
  Ridgeline,
  DotMatrix,
  Dumbbell,
  Clock,
  Glyphs,
  Compositing,
  SvgImage,
  Sketch,
];

export function CanvasDemo() {
  return (
    <ScenePage
      detail="2D context: paths, gradients, text, images, native animation"
      max={3}
      cards={cards}
    />
  );
}
