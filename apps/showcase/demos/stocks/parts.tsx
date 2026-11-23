import {
  alpha,
  colors,
  isDark,
  TERMINAL_COLUMN,
  TERMINAL_GAP,
  TERMINAL_ROW,
  terminal,
} from "@shadcn-nsh/theme";
// The pieces the stocks screens share that no component owns: a quote's flash and blink, the live
// dot, a bar that springs to its share, a scrub gesture for a chart, and the flat section the
// details are stacked in. Ported from the gallery's `stocks/parts.tsx`, on this library's theme.
import {
  Animated,
  createAnimatedValue,
  Easing,
  effect,
  type JSX,
  PanResponder,
  signal,
  Text,
  type AnimatedNode,
  untracked,
  View,
} from "nsh";

import type { Quote } from "./market";

export { alpha };

/**
 * A background that flashes green or red when the quote changes and fades on the UI thread: JS only
 * kicks the value, it never animates it. Read it in the style: the colors follow the appearance.
 */
export function flash(quote: () => Quote): () => AnimatedNode {
  const v = createAnimatedValue(0);
  let seen = untracked(quote).changedAt;
  effect(() => {
    const q = quote();
    if (q.changedAt === seen) return;
    seen = q.changedAt;
    v.set(q.dir);
    void v.timing(0, { duration: 700, easing: Easing.out(Easing.quad) });
  });
  // A strong tint at ±1 that fades to clear at 0.
  return () =>
    v.interpolate({
      inputRange: [-1, -0.01, 0.01, 1],
      outputRange: [
        alpha(colors.destructive, 0.34),
        alpha(colors.destructive, 0),
        alpha(colors.up, 0),
        alpha(colors.up, 0.34),
      ],
    });
}

/**
 * An opacity that dips and recovers natively when the quote changes: a blink on the price text, no
 * background.
 */
export function blink(quote: () => Quote): AnimatedNode {
  const v = createAnimatedValue(1);
  let seen = untracked(quote).changedAt;
  effect(() => {
    const q = quote();
    if (q.changedAt === seen) return;
    seen = q.changedAt;
    v.set(0.45);
    void v.timing(1, { duration: 450, easing: Easing.out(Easing.quad) });
  });
  return v;
}

/**
 * A pulse that loops natively while `running()`: 0 → 1 over 1.4 s, for a ring that grows and fades
 * around a live dot.
 */
export function pulse(running: () => boolean) {
  const v = createAnimatedValue(0);
  const loop = Animated.loop(
    Animated.timing(v, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic) }),
  );
  effect(() => {
    if (running()) void loop.start();
    else {
      loop.stop();
      void v.timing(0, { duration: 200 });
    }
  });
  return v;
}

/** A dot with a ring that pulses while the market runs. */
export function LiveDot(props: { running: () => boolean; size?: number }) {
  const p = pulse(props.running);
  const size = props.size ?? 8;
  return (
    <View
      style={{
        width: size * 2.5,
        height: size * 2.5,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.brand,
          opacity: p.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
          scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }),
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: props.running() ? colors.brand : colors.faint,
        }}
      />
    </View>
  );
}

/**
 * Touch handlers for a chart that scrubs horizontally: the platform gives the chart the finger only
 * once it has moved sideways (`panActivation`, decided natively), so vertical drags still scroll the
 * page. `at(x)` gets the position along the chart, then `null` when the finger lifts.
 */
export function scrub(at: (x: number | null) => void) {
  const handlers = PanResponder.create({
    onPanResponderGrant: (e) => at(e.locationX),
    onPanResponderMove: (e) => at(e.locationX),
    onPanResponderRelease: () => at(null),
    onPanResponderTerminate: () => at(null),
    onPanResponderTerminationRequest: () => false,
  }).panHandlers;
  return { ...handlers, panActivation: { activeOffsetX: 6, failOffsetY: 8 } };
}

/** Grid lines of charts: the hairline color, a step darker on the light page. */
export const grid = () => (isDark() ? colors.line : colors.border);

/**
 * A bar that grows from one edge of its track to `share()` (0..1) with a native spring: the bar is
 * the track's width and slides in, clipped.
 */
export function SpringBar(props: {
  share: () => number;
  color: string;
  from?: "left" | "right";
  height?: number;
  radius?: number;
}) {
  const x = createAnimatedValue(0);
  const width = signal(0);
  const placed = signal(false);
  const place = () => {
    if (!width()) return;
    const s = Math.max(0, Math.min(1, props.share()));
    const to = (props.from === "right" ? 1 : -1) * (1 - s) * width();
    if (placed()) void x.spring(to, { stiffness: 180, damping: 22 });
    else x.set(to);
    placed.set(true);
  };
  effect(() => {
    props.share();
    untracked(place);
  });
  const h = props.height ?? 8;
  const radius = props.radius ?? h / 2;
  return (
    <View
      onLayout={(e) => {
        width.set(e.bounds.size.width);
        place();
      }}
      style={{ height: h, overflow: "hidden", borderRadius: radius }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: radius,
          backgroundColor: props.color,
          translate: [x, 0],
        }}
      />
    </View>
  );
}

/**
 * An axis range that follows its data calmly: it widens at once (nothing is clipped) and narrows by
 * `rate` of the gap per call, so a redraw never jumps the scale. `reset` forgets it (another
 * period, another stock).
 */
export function calm(rate: number) {
  let lo = NaN;
  let hi = NaN;
  return {
    fit(l: number, h: number) {
      if (Number.isNaN(lo)) {
        lo = l;
        hi = h;
      } else {
        lo = l < lo ? l : lo + (l - lo) * rate;
        hi = h > hi ? h : hi + (h - hi) * rate;
      }
      return { lo, hi };
    },
    reset() {
      lo = hi = NaN;
    },
  };
}

/**
 * A flat section of a screen: a title with a faint note (or a control) on the right, the content
 * below, a hairline above all but the first. In the terminal the hairline is a row of its own, the
 * title on the row below it and the content right under the title.
 */
export function Block(props: {
  title?: string;
  note?: JSX.Element;
  right?: JSX.Element;
  first?: boolean;
  gap?: number;
  children: JSX.Element;
}) {
  return (
    <View
      style={[
        { borderTopWidth: props.first ? 0 : 1, borderTopColor: colors.line },
        terminal
          ? {
              paddingHorizontal: TERMINAL_COLUMN,
              paddingTop: props.first ? 0 : TERMINAL_ROW - 1,
              paddingBottom: TERMINAL_ROW,
            }
          : { paddingHorizontal: 16, paddingVertical: 14, gap: props.gap ?? 10 },
      ]}
    >
      <If when={props.title}>
        {/* A terminal keeps the title whole: a note with no room beside it goes to the row below. */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: terminal ? "wrap" : "nowrap",
            alignItems: "center",
            ...(terminal ? { columnGap: TERMINAL_GAP } : { gap: 8 }),
            minHeight: terminal ? TERMINAL_ROW : 22,
          }}
        >
          <Text
            style={{
              flexGrow: 1,
              flexShrink: terminal ? 0 : 1,
              flexBasis: terminal ? "auto" : 0,
              fontSize: 15,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {props.title}
          </Text>
          <If when={props.note}>
            <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
              {props.note}
            </Text>
          </If>
          {props.right}
        </View>
      </If>
      {props.children}
    </View>
  );
}

/** A quiet header for columns ("SYMBOL", "LAST"). */
export function Head(props: {
  label: string;
  width?: number;
  flex?: number;
  align?: "left" | "right" | "center";
}) {
  return (
    <Text
      style={{
        width: props.width,
        flex: props.flex,
        textAlign: props.align ?? "left",
        fontSize: 11,
        color: colors.faint,
        fontVariant: ["tabular-nums"],
        letterSpacing: 0.6,
      }}
    >
      {props.label}
    </Text>
  );
}
