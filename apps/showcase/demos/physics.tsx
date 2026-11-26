// Physics: the official gallery's scene (`references/nsh/examples/gallery/demos/Physics.tsx`).
// A card dragged on the UI thread and released into a spring, a decay or the nearest corner,
// with a canvas tether drawn from the same animated values. The segmented choices, the badge
// and the figures are this library's; the spring, the decay and the pan are `nsh`'s.
import { surface, colors, terminal, tints, shape } from "@shadcn-nsh/theme";
import { Hand, Orbit } from "lucide";
import type { AnimatedValue, PanEvent } from "nsh";
import { Canvas, computed, createAnimatedValue, Scroll, signal, Text, View, windowSize } from "nsh";

import { ItemMedia } from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Stat } from "@/packages/ui/stat";

import { Appear, hint, StatusBadge } from "./motion-shared";

const CARD = 128;
/** Windows shorter than this scroll the demo, with the stage this tall. */
const SHORT_WINDOW = 640;
const SHORT_STAGE = 300;
/** Spring settings the release uses. */
const feels = {
  soft: { stiffness: 90, damping: 12 },
  bouncy: { stiffness: 180, damping: 11 },
  firm: { stiffness: 420, damping: 32 },
} as const;
type Feel = keyof typeof feels;
type Mode = "spring" | "coast" | "snap";

/**
 * A card dragged on the UI thread and released into a spring, a decay or the nearest corner.
 * A full-pane view: it fills the shell, and scrolls only when the window is too short for the
 * stage and the controls under it.
 */
export function PhysicsDemo() {
  const x = createAnimatedValue(0);
  const y = createAnimatedValue(0);
  const pressed = createAnimatedValue(0);
  const lift = createAnimatedValue(0);
  const mode = signal<Mode>("spring");
  const feel = signal<Feel>("bouncy");
  const stage = signal({ width: 0, height: 0 });
  const releases = signal(0);
  const speed = signal(0);
  const corner = signal("—");

  const settle = (v: AnimatedValue, to: number, velocity: number) =>
    void v.spring(to, { velocity, ...feels[feel()] });
  const corners = () => ({
    x: Math.max(0, stage().width / 2 - CARD / 2 - 14),
    y: Math.max(0, stage().height / 2 - CARD / 2 - 14),
  });

  const release = (e: PanEvent) => {
    void lift.spring(0, { stiffness: 300, damping: 24 });
    releases.set(releases() + 1);
    speed.set(Math.round(Math.hypot(e.velocity.x, e.velocity.y)));
    switch (mode()) {
      case "spring":
        settle(x, 0, e.velocity.x);
        settle(y, 0, e.velocity.y);
        corner.set("—");
        break;
      case "coast":
        // Coast with the release velocity, then spring home unless grabbed again.
        void x.decay({ velocity: e.velocity.x, deceleration: 0.992 }).then(({ finished }) => {
          if (finished) settle(x, 0, 0);
        });
        void y.decay({ velocity: e.velocity.y, deceleration: 0.992 }).then(({ finished }) => {
          if (finished) settle(y, 0, 0);
        });
        corner.set("—");
        break;
      case "snap": {
        const px = (e.value?.x ?? 0) + e.velocity.x * 0.2;
        const py = (e.value?.y ?? 0) + e.velocity.y * 0.2;
        const c = corners();
        settle(x, px < 0 ? -c.x : c.x, e.velocity.x);
        settle(y, py < 0 ? -c.y : c.y, e.velocity.y);
        corner.set(`${py < 0 ? "top" : "bottom"} ${px < 0 ? "left" : "right"}`);
        break;
      }
    }
  };
  const pulse = async () => {
    await pressed.timing(1, { duration: 120, easing: "easeOut" });
    await pressed.timing(0, { duration: 320, easing: "easeInOut" });
  };
  const reset = () => {
    releases.set(0);
    speed.set(0);
    corner.set("—");
    settle(x, 0, 0);
    settle(y, 0, 0);
  };
  const follow = [{ translateX: x }, { translateY: y }] as const;
  const short = computed(() => windowSize().height < SHORT_WINDOW);

  const body = (compact: boolean) => (
    <View
      style={
        compact
          ? { padding: 16, gap: 12 }
          : { flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }
      }
    >
      <Appear index={0}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <If when={!terminal}>
            <ItemMedia variant="icon" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <Icon icon={Orbit} size={20} tint={colors.brand} />
            </ItemMedia>
          </If>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.foreground }}>
              Drag and release
            </Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              {hint("Tap to pulse, long press to reset", "Click to pulse, press and hold to reset")}
            </Text>
          </View>
          <StatusBadge label="UI thread" tone="accent" />
        </View>
      </Appear>
      <View
        onLayout={({ bounds }) =>
          stage.set({ width: bounds.size.width, height: bounds.size.height })
        }
        style={{
          flex: compact ? undefined : 1,
          height: compact ? SHORT_STAGE : undefined,
          overflow: "hidden",
          borderRadius: shape.container,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.muted,
          ...surface("inset").style,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Canvas
          style={{
            pointerEvents: "none",
            position: "absolute",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
          }}
          draw={(cx, { width, height }) => {
            const centerX = width / 2;
            const cy = height / 2;
            cx.fillStyle = colors.line;
            for (let gx = 10; gx < width; gx += 16)
              for (let gy = 10; gy < height; gy += 16) cx.fillRect(gx, gy, 1.5, 1.5);
            cx.setLineDash([3, 5]);
            cx.strokeStyle = colors.border;
            cx.lineWidth = 1;
            cx.beginPath();
            cx.moveTo(centerX, 0);
            cx.lineTo(centerX, height);
            cx.moveTo(0, cy);
            cx.lineTo(width, cy);
            cx.stroke();
            if (mode() === "snap") {
              const c = corners();
              cx.strokeStyle = colors.faint;
              for (const sx of [-1, 1])
                for (const sy of [-1, 1]) {
                  cx.beginPath();
                  cx.roundRect(
                    centerX + sx * c.x - CARD / 2,
                    cy + sy * c.y - CARD / 2,
                    CARD,
                    CARD,
                    26,
                  );
                  cx.stroke();
                }
            }
            cx.setLineDash([]);
            cx.strokeStyle = colors.brand;
            cx.globalAlpha = 0.45;
            cx.lineWidth = 1.5;
            cx.beginPath();
            cx.moveTo(centerX, cy);
            cx.lineTo(x.add(centerX), y.add(cy));
            cx.stroke();
            cx.globalAlpha = 1;
            cx.fillStyle = colors.brand;
            cx.beginPath();
            cx.arc(centerX, cy, 4, 0, Math.PI * 2);
            cx.fill();
          }}
        />
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            width: CARD,
            height: CARD,
            borderRadius: 30,
            backgroundColor: tints.brand,
            opacity: lift,
            translate: [x, y],
            scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.32] }),
          }}
        />
        <View
          pan={{ x, y }}
          onPanStart={() => void lift.spring(1, { stiffness: 400, damping: 26 })}
          onPanEnd={release}
          onPress={() => void pulse()}
          onLongPress={reset}
          role="button"
          accessibilityLabel="Draggable card"
          style={{
            width: CARD,
            height: CARD,
            borderRadius: 30,
            borderCurve: "continuous",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: pressed.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.primary, colors.info],
            }),
            boxShadow: surface("accent").style.boxShadow,
            transform: [
              ...follow,
              { scale: pressed.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
              { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) },
              { rotate: x.interpolate({ inputRange: [-200, 200], outputRange: [-14, 14] }) },
            ],
          }}
        >
          <Icon icon={Hand} size={28} tint={colors.primaryForeground} />
          <Text style={{ color: colors.primaryForeground, fontSize: 15, fontWeight: "700" }}>
            Drag me
          </Text>
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors.card,
          ...surface("card").style,
          borderRadius: shape.container,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          gap: 12,
        }}
      >
        <Segmented value={mode()} onValueChange={(next) => mode.set(next as Mode)}>
          <SegmentedList>
            <SegmentedItem value="spring">Spring</SegmentedItem>
            <SegmentedItem value="coast">Coast</SegmentedItem>
            <SegmentedItem value="snap">Snap</SegmentedItem>
          </SegmentedList>
        </Segmented>
        <Segmented value={feel()} onValueChange={(next) => feel.set(next as Feel)}>
          <SegmentedList size="sm">
            <SegmentedItem value="soft">Soft</SegmentedItem>
            <SegmentedItem value="bouncy">Bouncy</SegmentedItem>
            <SegmentedItem value="firm">Firm</SegmentedItem>
          </SegmentedList>
        </Segmented>
        <View style={{ flexDirection: "row", paddingHorizontal: 4 }}>
          <Stat width="30%" label="Releases" value={String(releases())} />
          <Stat
            width="34%"
            label="Speed"
            value={`${speed()} pt/s`}
            tone={speed() > 1500 ? "warning" : undefined}
          />
          <Stat
            width="36%"
            label={mode() === "snap" ? "Corner" : "Spring"}
            value={
              mode() === "snap" ? corner() : `${feels[feel()].stiffness} / ${feels[feel()].damping}`
            }
          />
        </View>
        <View
          style={{ flexDirection: "row", alignItems: "baseline", gap: 8, paddingHorizontal: 4 }}
        >
          <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>
            {mode() === "spring"
              ? "Springs home with the release velocity"
              : mode() === "coast"
                ? "Coasts to a stop, then springs home"
                : "Springs to the corner the fling points at"}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: "monospace", color: colors.faint }}>
            {mode() === "coast" ? "decay" : "spring"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <If when={short()} else={body(false)}>
      <Scroll style={{ flex: 1, backgroundColor: colors.background }}>{body(true)}</Scroll>
    </If>
  );
}
