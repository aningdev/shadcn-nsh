// A spinner: a ring turning with its top arc in one color, the shape of work going on.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { alpha, iconSize } from "@shadcn-nsh/theme";
import { reduceMotion, View } from "nsh";

import { trackLook } from "./lib/look";

/** A spinner's size, on the theme's icon tiers: the ring's side is `iconSize`'s `sm`, `md` or
 * `lg` (12 / 16 / 20 points with a pointer, 16 / 20 / 24 on a touch screen). */
export type SpinnerSize = "sm" | "default" | "lg";

/** The thinnest a ring's stroke gets, in points: below it the arc stops reading as a turn. */
const MIN_STROKE = 1.5;

/** The ring's side divided by this is its stroke: a stroke at 40 points, the size it is drawn at
 * most, so a smaller ring thins down to `MIN_STROKE` and no further. */
const STROKE_SHARE = 8;

/** Where a spoke starts, as a share of the spinner's side: a gap at the hub, so the spokes read as
 * rays rather than one star. */
const HUB_SHARE = 0.16;

/** A spoke's length, as a share of the spinner's side. */
const SPOKE_SHARE = 0.3;

/** One turn, in milliseconds: fast enough to read as work going on, slow enough not to blur. */
const TURN_MS = 800;

/** A spinner's props. */
export interface SpinnerProps {
  /** The theme's icon tier (default `default`): `sm` 12, `default` 16, `lg` 20 points with a
   * pointer (16 / 20 / 24 on a touch screen). */
  size?: SpinnerSize;
  /** The ring's side in points, for a place that needs an exact size over the scale's. */
  side?: number;
  /** The moving arc's color (the theme's text, a tone); the ring behind it follows the theme's
   * `spinner.opacity` slot: an arc at that much of the tone where the theme states one, and an arc
   * alone where it states `0`. */
  tint: string;
}

/** The color of the ring behind the arc: the tone at the theme's `spinner.opacity`, transparent
 * where the theme draws no ring. */
function grooveColor(tint: string): string {
  const opacity = trackLook("progress").spinner.opacity;
  return opacity === null ? "transparent" : alpha(tint, opacity);
}

/**
 * The spokes of a spinner a theme draws as rays (`spinner.spokes`): eight bars round the hub, each
 * fainter than the one before it, the whole turning as one. Apple's indicator; every theme that asks
 * for rays gets these eight.
 *
 * The angles and the fades are written out rather than turned from a count: a style reaches the
 * view from an object literal, and `rotate` read from a row's index or a passed count does not turn
 * anything.
 */
function Spokes(props: { side: number; stroke: number; tint: string }) {
  return (
    <View
      style={{
        width: props.side,
        height: props.side,
        animationName: reduceMotion() ? undefined : "spin",
        animationDuration: TURN_MS,
        animationTimingFunction: "linear",
        animationIterationCount: "infinite",
      }}
    >
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "0deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 1,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "45deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.891,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "90deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.781,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "135deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.672,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "180deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.562,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "225deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.453,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "270deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.344,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          start: 0,
          top: 0,
          width: props.side,
          height: props.side,
          paddingTop: props.side * HUB_SHARE,
          alignItems: "center",
          rotate: "315deg",
        }}
      >
        <View
          style={{
            width: props.stroke,
            height: props.side * SPOKE_SHARE,
            borderRadius: props.stroke / 2,
            backgroundColor: props.tint,
            opacity: 0.234,
          }}
        />
      </View>
    </View>
  );
}

/**
 * A ring turning with its top arc in `tint`: work going on. Its side is `side` when given,
 * else the theme's icon tier named by `size`; the stroke is that side over `STROKE_SHARE`, no
 * thinner than `MIN_STROKE`; whether a ring shows behind the arc is the theme's `spinner.opacity`
 * slot to say; where the theme states `spinner.spokes`, it turns eight rays round the hub instead of
 * the arc. It stands still when the user asks for less motion.
 */
export function Spinner(props: SpinnerProps) {
  const side = () =>
    props.side ??
    (props.size === "sm" ? iconSize.sm : props.size === "lg" ? iconSize.lg : iconSize.md);
  const stroke = () => Math.max(MIN_STROKE, side() / STROKE_SHARE);
  // Read where `If` reads it: the theme arrives after the first mount, and a branch taken in the
  // body would keep the ring the app started under.
  const spokes = () => trackLook("progress").spinner.spokes;
  return (
    <If
      when={spokes()}
      else={
        <View
          style={{
            width: side(),
            height: side(),
            borderRadius: side() / 2,
            borderWidth: stroke(),
            borderColor: grooveColor(props.tint),
            borderTopColor: props.tint,
            animationName: reduceMotion() ? undefined : "spin",
            animationDuration: TURN_MS,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
          }}
        />
      }
    >
      {() => <Spokes side={side()} stroke={stroke()} tint={props.tint} />}
    </If>
  );
}
