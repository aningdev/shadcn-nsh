// Gestures: the official gallery's scene (`references/nsh/examples/gallery/demos/Gestures.tsx`).
// Pan, pinch and rotation on one photo, a PanResponder ball, hover, wheel, raw touches, press
// events, hit slop, pointer events and accessibility. Recognizers and the responder system are
// `nsh`'s; buttons, badges, stats and press targets are this library's.
import { alpha, colors, finish, focusRing, terminal, tints, shape } from "@shadcn-nsh/theme";
import { Bell, Play, Star, type IconNode } from "lucide";
import type { GestureResponderEvent, JSX, MouseButton } from "nsh";
import {
  Canvas,
  cleanup,
  createAnimatedValue,
  Easing,
  Image,
  PanResponder,
  signal,
  Text,
  View,
} from "nsh";
import { Animated } from "nsh";

import { Button } from "@/packages/ui/button";
import { ItemMedia } from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { pressSink } from "@/packages/ui/lib/press";
import { density } from "@/packages/ui/lib/surface";
import { pressableLook } from "@/packages/ui/pressable";
import { Stat } from "@/packages/ui/stat";

import { DemoPage } from "../kit";
import { Api, Appear, hint, knobDrop, pointer, Scene, stage, StatusBadge } from "./motion-shared";

/** The dots of a matrix `step` apart along `length`, centered. */
function along(length: number, step: number): number[] {
  const gaps = Math.max(0, Math.floor((length - 16) / step));
  const first = (length - gaps * step) / 2;
  return Array.from({ length: gaps + 1 }, (_, i) => first + i * step);
}

/** A dot matrix behind a stage, drawn once. */
function Dots() {
  return (
    <Canvas
      style={{ pointerEvents: "none", position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
      draw={(cx, { width, height }) => {
        cx.fillStyle = colors.line;
        for (const x of along(width, 14))
          for (const y of along(height, 14)) cx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
      }}
    />
  );
}

/** Drag, pinch and rotate one photo at the same time, all on the UI thread. */
function Transformable() {
  const x = createAnimatedValue(0);
  const y = createAnimatedValue(0);
  const scale = createAnimatedValue(1);
  const angle = createAnimatedValue(0);
  const last = signal({ scale: 1, angle: 0, drag: 0 });
  const reset = () => {
    void x.spring(0);
    void y.spring(0);
    void scale.spring(1);
    void angle.spring(0);
    last.set({ scale: 1, angle: 0, drag: 0 });
  };
  return (
    <Scene
      title="Pan, pinch and rotation"
      subtitle="Three recognizers on one view, driven natively"
    >
      <View style={{ ...stage(), height: 260, alignItems: "center", justifyContent: "center" }}>
        <Dots />
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            width: 200,
            height: 150,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.faint,
            borderStyle: "dashed",
          }}
        />
        <View
          testID="photo"
          pan={{ x, y }}
          pinch={{ scale }}
          rotation={{ angle }}
          onPanEnd={(e) =>
            last.set({ ...last(), drag: Math.round(Math.hypot(e.translation.x, e.translation.y)) })
          }
          onPinchEnd={(e) => last.set({ ...last(), scale: e.scale })}
          onRotationEnd={(e) => last.set({ ...last(), angle: e.rotation })}
          style={{
            width: 200,
            height: 150,
            borderRadius: 18,
            borderCurve: "continuous",
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.raised,
            transform: [{ translateX: x }, { translateY: y }, { scale }, { rotate: angle }],
          }}
        >
          <Image
            src="https://pbs.twimg.com/media/HS7_82eXsAAa-Hx?format=jpg&name=small"
            style={{ flex: 1 }}
          />
        </View>
      </View>
      <View style={{ flexDirection: "row" }}>
        <Stat width="33%" label="Drag" value={`${last().drag} pt`} />
        <Stat width="33%" label="Scale" value={`${last().scale.toFixed(2)}×`} tone="accent" />
        <Stat width="34%" label="Angle" value={`${Math.round(last().angle)}°`} tone="info" />
      </View>
      <Text style={{ fontSize: 13, lineHeight: 18, color: colors.mutedForeground }}>
        {hint(
          "Pinch and rotate with two fingers (Option-drag in the simulator).",
          "Drag with the mouse; pinch and rotate on a touchpad or a touch screen.",
        )}
      </Text>
      <Button variant="secondary" onPress={reset}>
        Reset
      </Button>
    </Scene>
  );
}

/** A ball dragged with a PanResponder (positions go through JS). Its responder blocks the page from scrolling while it is dragged. */
function Ball() {
  const pos = signal({ x: 0, y: 0 });
  const state = signal<{ label: string; tone: "neutral" | "accent" | "info" | "warn" }>({
    label: "Idle",
    tone: "neutral",
  });
  const grab = createAnimatedValue(0);
  let start = { x: 0, y: 0 };
  const pan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      start = pos();
      void grab.spring(1, { stiffness: 420, damping: 24 });
      state.set({ label: "Dragging", tone: "accent" });
    },
    onPanResponderMove: (_, g) => pos.set({ x: start.x + g.dx, y: start.y + g.dy }),
    onPanResponderRelease: (_, g) => {
      void grab.spring(0, { stiffness: 300, damping: 20 });
      state.set({ label: `${g.vx.toFixed(0)}, ${g.vy.toFixed(0)} pt/s`, tone: "info" });
    },
    onPanResponderTerminate: () => {
      void grab.spring(0);
      state.set({ label: "Taken over", tone: "warn" });
    },
  });
  return (
    <Scene
      title="PanResponder"
      subtitle="Positions through JS; the page stays put"
      right={<StatusBadge label={state().label} tone={state().tone} />}
    >
      <View style={{ ...stage(), height: 200 }}>
        <Dots />
        <View
          testID="ball"
          {...pan.panHandlers}
          style={{
            position: "absolute",
            left: "50%",
            top: 70,
            marginLeft: -30,
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: grab.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.info, colors.primary],
            }),
            ...knobDrop(),
            translate: [pos().x, pos().y],
            scale: grab.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] }),
          }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: alpha(colors.primaryForeground, 0.35),
            }}
          />
        </View>
      </View>
      <Api label="Position" api={`${Math.round(pos().x)}, ${Math.round(pos().y)}`} />
      <Button variant="secondary" onPress={() => pos.set({ x: 0, y: 0 })}>
        Center
      </Button>
    </Scene>
  );
}

/** The mouse over a view: it comes in, moves and leaves (desktops). */
function Hover() {
  const over = signal(false);
  const at = signal<{ x: number; y: number; button: MouseButton | null }>({
    x: 0,
    y: 0,
    button: null,
  });
  return (
    <Scene
      title="Hover"
      subtitle={hint("A pointer over a view: iPad, desktops", "The mouse over a view")}
      right={<StatusBadge label={over() ? "Over" : "Away"} tone={over() ? "accent" : "neutral"} />}
    >
      <View
        testID="hover-pad"
        onMouseEnter={() => over.set(true)}
        onMouseLeave={() => over.set(false)}
        onMouseMove={(e) =>
          at.set({
            x: Math.round(e.position.x),
            y: Math.round(e.position.y),
            button: e.pressedButton,
          })
        }
        hoverStyle={{ backgroundColor: colors.card }}
        style={{ ...stage(), height: 100, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          {over()
            ? `Pointer at ${at().x}, ${at().y}${at().button ? `, ${at().button} button down` : ""}`
            : "Pointer away"}
        </Text>
      </View>
      <Api label="Enter, move and leave" api="onMouseEnter · onMouseMove · onMouseLeave" />
    </Scene>
  );
}

/** A wheel over a canvas: Control + wheel zooms, the wheel pans, and the page around does not scroll. */
function WheelPad() {
  const zoom = signal(1);
  const pan = signal({ x: 0, y: 0 });
  return (
    <Scene
      title="Wheel"
      subtitle="Control + wheel zooms, the wheel pans"
      right={<StatusBadge label={`${Math.round(zoom() * 100)}%`} />}
    >
      <View
        testID="wheel-pad"
        onWheel={(e) => {
          const unit = e.deltaMode === "lines" ? 16 : 1;
          if (e.modifiers.control) {
            zoom.update((z) => Math.min(4, Math.max(0.25, z * (1 - (e.delta.y * unit) / 200))));
          } else {
            pan.update((p) => ({ x: p.x - e.delta.x * unit, y: p.y - e.delta.y * unit }));
          }
        }}
        style={{
          ...stage(),
          height: 120,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: colors.brand,
            transform: [{ translateX: pan().x }, { translateY: pan().y }, { scale: zoom() }],
          }}
        />
      </View>
      <Api label="Wheel over a view" api="onWheel" />
    </Scene>
  );
}

/** Raw touch events, every finger drawn where it is. */
function TouchPad() {
  const log = signal<{ name: string; text: string }[]>([]);
  const fingers = signal<{ id: number; x: number; y: number }[]>([]);
  const note = (name: string) => (e: GestureResponderEvent) => {
    fingers.set(
      name === "cancel" ? [] : e.touches.map((t, id) => ({ id, x: t.locationX, y: t.locationY })),
    );
    log.update((l) =>
      [
        {
          name,
          text: `${Math.round(e.locationX)}, ${Math.round(e.locationY)} · page ${Math.round(e.pageX)}, ${Math.round(e.pageY)} · ${e.touches.length} down`,
        },
        ...l,
      ].slice(0, 4),
    );
  };
  return (
    <Scene
      title="Touch events"
      subtitle={hint(
        "Start, move, end and cancel, per finger",
        "Start, move, end, cancel: mouse and fingers",
      )}
      right={
        <StatusBadge
          label={`${fingers().length} down`}
          tone={fingers().length ? "accent" : "neutral"}
        />
      }
    >
      <View
        onTouchStart={note("start")}
        onTouchMove={note("move")}
        onTouchEnd={note("end")}
        onTouchCancel={note("cancel")}
        style={{ ...stage(), height: 150, alignItems: "center", justifyContent: "center" }}
      >
        <Dots />
        <If when={fingers().length === 0}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            {hint("Touch here, try two fingers", "Press and drag here with the mouse")}
          </Text>
        </If>
        <Each of={fingers()} key={(f) => f.id}>
          {(f) => (
            <View
              style={{
                pointerEvents: "none",
                position: "absolute",
                left: f().x - 26,
                top: f().y - 26,
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 2,
                borderColor: colors.brand,
                backgroundColor: tints.brand,
              }}
            />
          )}
        </Each>
      </View>
      <View style={{ gap: 4, minHeight: 4 * 18 }}>
        <If
          when={log().length > 0}
          else={<Text style={{ fontSize: 13, color: colors.faint }}>No touches yet</Text>}
        >
          <Each of={log()}>
            {(entry, i) => (
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text
                  style={{
                    width: 52,
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: i() === 0 ? colors.brand : colors.faint,
                  }}
                >
                  {entry().name}
                </Text>
                <Text
                  style={{
                    numberOfLines: 1,
                    flex: 1,
                    fontSize: 13,
                    color: i() === 0 ? colors.foreground : colors.faint,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {entry().text}
                </Text>
              </View>
            )}
          </Each>
        </If>
      </View>
    </Scene>
  );
}

/** Each press event lights up its chip as it arrives. */
function PressEvents() {
  const names = ["pressIn", "press", "longPress", "pressOut"] as const;
  const flashes = names.map(() => createAnimatedValue(0));
  const count = signal(0);
  const log = signal<string[]>([]);
  const fire = (name: string) => {
    count.set(count() + 1);
    log.update((l) => [name, ...l].slice(0, 6));
    const i = names.indexOf(name as (typeof names)[number]);
    if (i >= 0) {
      flashes[i].set(1);
      void flashes[i].timing(0, { duration: 700, easing: Easing.out(Easing.quad) });
    }
  };
  return (
    <Scene
      title="Press events"
      subtitle="In, press, long press, out; native feedback"
      right={<StatusBadge label={`${count()}`} />}
    >
      <View
        onPressDown={() => fire("pressIn")}
        onPressUp={() => fire("pressOut")}
        onPress={() => fire("press")}
        onLongPress={() => fire("longPress")}
        hoverStyle={{ opacity: 0.94 }}
        activeStyle={{ opacity: 0.7, transform: [{ scale: 0.99 }] }}
        role="button"
        style={{
          height: pointer ? 44 : 56,
          borderRadius: shape.control,
          borderCurve: "continuous",
          borderWidth: 1,
          backgroundColor: colors.primary,
          ...finish.accent,
          alignItems: "center",
          justifyContent: "center",
          transitionProperty: "opacity, transform",
          transitionDuration: 120,
        }}
      >
        <Text
          style={{
            fontSize: pointer ? 13 : 15,
            fontWeight: "600",
            color: colors.primaryForeground,
          }}
        >
          {hint("Tap, hold, or slide off", "Click, hold, or slide off")}
        </Text>
      </View>
      <View style={{ ...stage(), padding: 3, gap: 3, flexDirection: "row" }}>
        <Each of={[...names]}>
          {(name, i) => (
            <View
              style={{
                flex: 1,
                height: pointer ? 22 : 28,
                borderRadius: 5,
                borderCurve: "continuous",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: flashes[i()].interpolate({
                  inputRange: [0, 1],
                  outputRange: [alpha(colors.foreground, 0), colors.primary],
                }),
              }}
            >
              <Text
                style={{ fontSize: 11, fontFamily: "monospace", color: colors.mutedForeground }}
              >
                {name()}
              </Text>
            </View>
          )}
        </Each>
      </View>
      <Text
        style={{
          numberOfLines: 1,
          fontSize: 11,
          fontFamily: "monospace",
          color: colors.faint,
          paddingHorizontal: 2,
        }}
      >
        {log().join(" · ") || "No events yet"}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View
          onPress={() => fire("ripple")}
          onLongPress={() => fire("fast long press")}
          delayLongPress={250}
          hoverStyle={{ ...finish.hover }}
          activeStyle={{ ...finish.pressed }}
          android={{ ripple: { color: alpha(colors.primary, 0.25) } }}
          role="button"
          style={{
            flex: 1,
            height: pointer ? 44 : 56,
            borderRadius: shape.control,
            borderCurve: "continuous",
            borderWidth: 1,
            backgroundColor: colors.raised,
            ...finish.raised,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            gap: 8,
            transitionProperty: "background-color, border-color, box-shadow",
            transitionDuration: 120,
          }}
        >
          <Text
            style={{ fontSize: pointer ? 13 : 15, fontWeight: "500", color: colors.foreground }}
          >
            Ripple
          </Text>
          <Text style={{ flex: 1, textAlign: "right", fontSize: 12, color: colors.faint }}>
            Long press after 250 ms
          </Text>
        </View>
        <View
          onPress={() => fire("borderless")}
          android={{ ripple: { borderless: true, radius: 40 } }}
          hoverStyle={{ ...finish.hover }}
          activeStyle={{ ...finish.pressed }}
          role="button"
          accessibilityLabel="Star"
          style={{
            width: pointer ? 44 : 56,
            height: pointer ? 44 : 56,
            borderRadius: shape.control,
            borderCurve: "continuous",
            borderWidth: 1,
            backgroundColor: colors.raised,
            ...finish.raised,
            alignItems: "center",
            justifyContent: "center",
            transitionProperty: "background-color, border-color, box-shadow",
            transitionDuration: 120,
          }}
        >
          <Icon icon={Star} size={18} tint={colors.warn} />
        </View>
      </View>
      <Text
        onPress={() => fire("text")}
        hoverStyle={{ textDecorationLine: "underline" }}
        activeStyle={{ opacity: 0.4 }}
        style={{
          alignSelf: "flex-start",
          fontSize: density.body,
          fontWeight: "500",
          color: colors.brand,
          paddingVertical: 2,
        }}
      >
        Pressable text, dimmed while pressed
      </Text>
    </Scene>
  );
}

/** A tiny dot with a ring showing the 30 pt around it that also takes taps. */
function HitSlop() {
  const taps = signal(0);
  const ring = createAnimatedValue(0);
  const breathe = Animated.loop(
    Animated.sequence([
      Animated.timing(ring, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(ring, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin) }),
    ]),
  );
  void breathe.start();
  cleanup(() => breathe.stop());
  return (
    <Scene
      title="Hit slop"
      subtitle={hint(
        "A 12 pt dot that takes taps 30 pt around it",
        "A 12 pt dot taking clicks 30 pt around it",
      )}
      right={<StatusBadge label={`${taps()} taps`} tone={taps() ? "accent" : "neutral"} />}
    >
      <View style={{ ...stage(), height: 140, alignItems: "center", justifyContent: "center" }}>
        <Dots />
        <View
          style={{
            pointerEvents: "none",
            position: "absolute",
            width: 72,
            height: 72,
            borderRadius: 36,
            borderWidth: 1,
            borderStyle: "dashed",
            borderColor: colors.destructive,
            backgroundColor: tints.destructive,
            opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
            scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }),
          }}
        />
        <View
          onPress={() => taps.set(taps() + 1)}
          role="button"
          hitSlop={30}
          accessibilityLabel="Tiny dot"
          hoverStyle={{ opacity: 0.86 }}
          activeStyle={pressSink(0.8).activeStyle}
          focusVisibleStyle={focusRing()}
          style={{ borderRadius: 6 }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: colors.destructive,
              ...knobDrop(),
            }}
          />
        </View>
      </View>
      <Api
        label={hint("The dashed ring is the touch area", "The dashed ring is the click area")}
        api="hitSlop={30}"
      />
    </Scene>
  );
}

/** An overlay that lets taps through to the button under it. */
function PointerEvents() {
  const through = signal(0);
  return (
    <Scene
      title="Pointer events"
      subtitle={hint("An overlay that lets taps through", "An overlay that lets clicks through")}
      right={<StatusBadge label={`${through()}`} tone="up" />}
    >
      <View style={{ height: 88 }}>
        <View
          onPress={() => through.set(through() + 1)}
          role="button"
          hoverStyle={{ opacity: 0.86 }}
          activeStyle={pressSink(0.98).activeStyle}
          focusVisibleStyle={focusRing()}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: shape.control,
              borderCurve: "continuous",
              backgroundColor: tints.up,
              borderWidth: 1,
              borderColor: colors.up,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.up }}>
              Button under an overlay
            </Text>
          </View>
        </View>
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
            cx.save();
            cx.beginPath();
            cx.rect(width * 0.18, 0, width * 0.64, height);
            cx.clip();
            cx.strokeStyle = alpha(colors.warn, 0.28);
            cx.lineWidth = 1;
            cx.beginPath();
            for (let i = -height; i < width; i += 8) {
              cx.moveTo(i, height);
              cx.lineTo(i + height, 0);
            }
            cx.stroke();
            cx.restore();
            cx.setLineDash([4, 4]);
            cx.strokeStyle = colors.warn;
            cx.beginPath();
            cx.roundRect(width * 0.18 + 0.5, 0.5, width * 0.64 - 1, height - 1, 10);
            cx.stroke();
          }}
        />
      </View>
      <Api
        label={hint(
          "Taps on the hatched band reach the button",
          "Clicks on the hatched band reach the button",
        )}
        api={'pointerEvents: "none"'}
      />
    </Scene>
  );
}

/** A row of a list, with a hairline above all but the first. */
function Row(props: { first?: boolean; children: JSX.Element }) {
  return (
    <View
      style={{
        minHeight: density.row,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderTopWidth: props.first ? 0 : 1,
        borderTopColor: colors.line,
      }}
    >
      {props.children}
    </View>
  );
}

/** Elements labelled for VoiceOver / TalkBack. */
function Accessibility() {
  const last = signal("");
  const items: { label: string; hint: string; icon: IconNode }[] = [
    { label: "Play", hint: "Starts the song", icon: Play },
    { label: "Like", hint: "Adds to favorites", icon: Star },
    { label: "Notify", hint: "Turns on alerts", icon: Bell },
  ];
  return (
    <Scene
      title="Accessibility"
      subtitle="Roles, labels and hints for screen readers"
      right={
        <If when={last()}>
          <StatusBadge label={last()} tone="info" />
        </If>
      }
    >
      <Each of={items}>
        {(item, i) => (
          <View
            accessible
            role="button"
            accessibilityLabel={item().label}
            accessibilityHint={item().hint}
            onPress={() => last.set(item().label)}
            {...pressableLook({ style: { borderRadius: 0 } })}
          >
            <Row first={i() === 0}>
              <If when={!terminal}>
                <ItemMedia
                  variant="icon"
                  style={{ width: pointer ? 28 : 36, height: pointer ? 28 : 36 }}
                >
                  <Icon
                    icon={item().icon}
                    size={(pointer ? 28 : 36) * 0.5}
                    tint={last() === item().label ? colors.brand : colors.foreground}
                  />
                </ItemMedia>
              </If>
              <View style={{ flex: 1, gap: 1 }}>
                <Text
                  style={{ fontSize: density.body, fontWeight: "500", color: colors.foreground }}
                >
                  {item().label}
                </Text>
                <Text style={{ fontSize: density.note, color: colors.mutedForeground }}>
                  {item().hint}
                </Text>
              </View>
              <Text style={{ fontSize: 11, fontFamily: "monospace", color: colors.faint }}>
                button
              </Text>
            </Row>
          </View>
        )}
      </Each>
    </Scene>
  );
}

/** The gallery's Gestures page. */
export function GesturesDemo() {
  return (
    <DemoPage title="Gestures">
      <Appear index={0}>
        <Transformable />
      </Appear>
      <Appear index={1}>
        <Ball />
      </Appear>
      <Appear index={2}>
        <Hover />
      </Appear>
      <Appear index={3}>
        <WheelPad />
      </Appear>
      <Appear index={4}>
        <TouchPad />
      </Appear>
      <Appear index={5}>
        <PressEvents />
      </Appear>
      <Appear index={6}>
        <HitSlop />
      </Appear>
      <Appear index={7}>
        <PointerEvents />
      </Appear>
      <Appear index={8}>
        <Accessibility />
      </Appear>
    </DemoPage>
  );
}
