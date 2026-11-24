// A segmented control: the look (`segmentedLook`) and the parts that wear it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  control,
  controlHeight,
  finish,
  focusRing,
  hovered,
  rounded,
  font,
  shape,
  stroke,
  dimmed,
  tints,
} from "@shadcn-nsh/theme";
import { Check } from "lucide";
import type { AndroidProps, JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { cleanup, context, platform, signal, split, Text, View } from "nsh";
import {
  Tab as BaseTab,
  Tabs as BaseTabs,
  type TabProps as BaseTabProps,
  type TabsProps as BaseTabsProps,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { type Live, read } from "./lib/live-value";
import { type Fill, groupLook, type Radius, type Scale } from "./lib/look";
import { pressHostProps, pressRipple } from "./lib/press";
import { hoverOf, type TabLook, type TabState } from "./tabs";

const pointer = platform.desktop;

/**
 * A segmented control's size: the theme's middle height (`height.md`) by default, its small one
 * (`height.sm`) for `sm`.
 */
export type SegmentedSize = "sm" | "default";

/** A corner the recipe names, in points: a scale's own, a capsule (half `extent`), half a line's
 * thickness (`extent` being that thickness), or the number itself. */
const radiusOf = (radius: Radius, extent: number): number =>
  radius === "shape.control"
    ? shape.control
    : radius === "pill" || radius === "half-thickness"
      ? extent / 2
      : radius;

/** What a fill paints a part with: a finish's whole layer, a palette role, or a tint. */
const paintOf = (fill: Fill): ViewStyle =>
  fill.kind === "finish"
    ? { ...finish[fill.role] }
    : fill.kind === "colour"
      ? { backgroundColor: colors[fill.role] }
      : { backgroundColor: tints[fill.role] };

/** The colour a fill paints an edge with: a palette role, a tint, or a finish's face. */
const inkOf = (fill: Fill): string | undefined =>
  fill.kind === "colour"
    ? colors[fill.role]
    : fill.kind === "tint"
      ? tints[fill.role]
      : finish[fill.role].backgroundColor;

/** A stroke the recipe names, in points: a hairline, the control stroke, or the number itself. */
const widthOf = (edge: Scale | number): number =>
  typeof edge === "number" ? edge : edge === "stroke.hairline" ? stroke.hairline : stroke.control;

/** Options of `segmentedLook`. */
export interface SegmentedLookOptions {
  /** Default `default`: the theme's `height.md` (`sm`: `height.sm`). Read where it is drawn. */
  size?: Live<SegmentedSize>;
  /** Span the row, the segments sharing it equally (always on a touch screen). */
  fill?: Live<boolean>;
}

/**
 * A segmented control's look. On a track (`style`, on `Tabs` or a `RadioGroup`): sunk, as wide as
 * its labels with a pointer (the theme's `height.md` high, 12-point labels, the thumb's corners a
 * step inside the track's), spanning the row on a touch screen or with `fill`; the selected
 * segment's thumb, standing off the track in both appearances (`finish.raised`: a lifted surface
 * that carries the label's ink; `knob` is the switch's white disc), as `Tabs`' traveling `indicatorStyle` or as a
 * `Radio`'s `checkedStyle` (`thumbStyle`). Where the theme's `group` is `cells`, as Material 3's
 * is, the control draws connected cells instead: one outline around the row, a divider between the
 * cells (none before the first), and the chosen cell on its own container behind a leading `check`
 * (its label's `label(selected)`, `count`). Either way, each segment's props (`segment(state)`:
 * hover, the focus ring, dimmed while disabled) and `gap` are the look's. Where the theme draws
 * cells, pass `segment(state, first)` with `first` true for the row's leading cell, which draws no
 * divider of its own.
 */
export function segmentedLook(o?: SegmentedLookOptions) {
  const small = () => read(o?.size) === "sm";
  const spread = () => !pointer || !!read(o?.fill);
  // The track's padding: the thumb sits inside it.
  const inset = 2;
  // The theme's height scale, read where it is drawn: the middle step, or the small one for `sm`
  // (so a small control is as tall as a small button, and the two sit level in a row).
  const height = () => (small() ? controlHeight.sm : controlHeight.md);
  // The theme's group, read where it is drawn: a change of theme redraws these parts.
  const group = () => groupLook(control().group);
  // The thumb: the track's raised face, sitting `inset` points inside the track.
  const thumb = (track: { radius: Radius; fill: Fill }): ViewStyle => ({
    ...rounded(radiusOf(track.radius, height()), inset),
    borderWidth: stroke.control,
    ...paintOf(track.fill),
  });
  return {
    get style(): ViewStyle {
      const look = group();
      if (look.form === "cells") {
        return {
          height: look.height,
          flexDirection: "row",
          alignSelf: spread() ? "stretch" : "flex-start",
          // The ends the recipe draws; the dividers between the cells are straight, so only the
          // list draws a rounded edge.
          ...rounded(radiusOf(look.corner, look.height)),
          borderWidth: widthOf(look.edge.width),
          borderColor: inkOf(look.edge.fill),
          // The chosen cell's face is clipped to the list's rounded ends, so the ends keep the
          // recipe's shape.
          overflow: "hidden",
        };
      }
      return {
        height: height(),
        flexDirection: "row",
        alignSelf: spread() ? "stretch" : "flex-start",
        padding: inset,
        ...rounded(radiusOf(look.radius, height())),
        // Sunk like the pill bar's, not the switch's track: in dark the track is
        // raised as the thumb is, which would hide the thumb.
        backgroundColor: colors.inset,
        boxShadow: finish.inset.boxShadow,
        borderWidth: stroke.control,
        borderColor: colors.border,
      };
    },
    /** The thumb as `Tabs`' indicator, which the core springs to the selected tab. */
    get indicatorStyle(): ViewStyle {
      const look = group();
      // Connected cells have no thumb: their chosen cell is the indicator.
      return look.form === "cells" ? {} : { top: inset, bottom: inset, ...thumb(look) };
    },
    /**
     * The selected segment drawn on itself (a `Radio`'s `checkedStyle`): the track's thumb, or the
     * chosen cell's face where the theme draws cells.
     */
    get thumbStyle(): ViewStyle {
      const look = group();
      return look.form === "cells" ? paintOf(look.selected) : thumb(look);
    },
    /**
     * The chosen cell's face (`Tab`'s `selectedStyle`), `undefined` on the track, whose thumb is the
     * indicator.
     */
    get selectedStyle(): ViewStyle | undefined {
      const look = group();
      return look.form === "cells" ? paintOf(look.selected) : undefined;
    },
    segment(state: TabState, first?: Live<boolean>): TabLook {
      const look = group();
      if (look.form === "cells") {
        return {
          get style(): ViewStyle {
            // Only the cells after the first carry a divider: the list's own outline closes the
            // leading end, so a divider there would show past its rounded edge.
            const leading = first !== undefined && read(first);
            const edge = widthOf(look.edge.width);
            return {
              ...(spread() ? { flex: 1 } : {}),
              paddingHorizontal: look.padding,
              ...(leading
                ? {}
                : {
                    borderStartWidth: edge,
                    // The logical start border takes its own colour; `borderColor` does not reach
                    // it, and a divider with no colour of its own draws black.
                    borderStartColor: inkOf(look.edge.fill),
                    marginStart: -edge,
                  }),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: look.gap,
            };
          },
          get hoverStyle() {
            // M3 washes the chosen cell too: its state layer sits over the container, not instead
            // of it (SegmentedButtonTokens.kt's selected state layers).
            return hovered();
          },
          get focusVisibleStyle() {
            // Inside the cell, as the split button's halves ring inside their clipping frame: a
            // ring outside would be cut by the list's outline.
            return focusRing(-2);
          },
          get disabledStyle(): ViewStyle {
            return { opacity: dimmed.disabled };
          },
          get android(): AndroidProps | undefined {
            return pressRipple("foreground", state.disabled);
          },
        };
      }
      return {
        // A clear edge the thumb's takes over, so a checked segment keeps its size.
        get style(): ViewStyle {
          return {
            ...(spread() ? { flex: 1, paddingHorizontal: 7 } : { paddingHorizontal: 9 }),
            ...rounded(shape.control, inset),
            borderWidth: stroke.control,
            borderColor: "transparent",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
          };
        },
        get hoverStyle() {
          return hoverOf(state);
        },
        get focusVisibleStyle() {
          return focusRing();
        },
        get disabledStyle(): ViewStyle {
          return { opacity: dimmed.disabled };
        },
        get android(): AndroidProps | undefined {
          return pressRipple("foreground", state.disabled);
        },
      };
    },
    label(selected: Live<boolean | undefined>): TextStyle {
      if (group().form === "cells") {
        return {
          numberOfLines: 1,
          fontSize: font.size("label"),
          fontWeight: font.weight("label"),
          letterSpacing: font.letterSpacing("label"),
          // M3's unselected ink is OnSurface; the chosen cell's OnSecondaryContainer has no role of
          // its own, so both read the theme's foreground.
          color: colors.foreground,
        };
      }
      return {
        numberOfLines: 1,
        // No type role has this size: a segment's 12, 13 or 14 follow the control's size.
        fontSize: pointer ? 12 : small() ? 13 : 14,
        fontWeight: font.weight("label"),
        color: read(selected) ? colors.foreground : colors.mutedForeground,
      };
    },
    get count(): TextStyle {
      return {
        fontSize: font.size("caption"),
        color: group().form === "cells" ? colors.mutedForeground : colors.faint,
        fontVariant: ["tabular-nums"],
      };
    },
    /** The chosen cell's leading check (M3's selected icon); the track has none. */
    get check(): JSX.Element | null {
      const look = group();
      return look.form === "cells" ? (
        <Icon icon={Check} size={look.check} tint={colors.foreground} />
      ) : null;
    },
    /** The gap between a segment's parts: the check, its label, its count. */
    get gap(): number {
      const look = group();
      return look.form === "cells" ? look.gap : 5;
    },
  };
}

/** Composition root: the selected segment value. */
export type SegmentedProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** The sink the segments sit in (`nsh/base`'s `Tabs`): the track and its thumb, or connected cells. */
export type SegmentedListProps = Omit<BaseTabsProps, "children"> & {
  size?: SegmentedSize;
  fill?: boolean;
  children?: JSX.Element;
};

/** One segment. String children are the label. */
export type SegmentedItemProps = Omit<BaseTabProps, "selected" | "children"> & {
  value: string;
  count?: number;
  children?: string | JSX.Element;
};

type SegmentedContextValue = {
  value: () => string;
  onValueChange: (value: string) => void;
};

const SegmentedContext = context<SegmentedContextValue | null>(null);

/**
 * What a segment reads from its list: the options the list was given, read where a segment is
 * drawn, and the segments it holds. Registration order is render order, so the first registered
 * segment is the first cell.
 */
type SegmentedListValue = {
  size: () => SegmentedSize;
  fill: () => boolean;
  segments: () => readonly string[];
  register: (value: string) => void;
  unregister: (value: string) => void;
};

const SegmentedListContext = context<SegmentedListValue | null>(null);

function useSegmented() {
  const ctx = SegmentedContext();
  if (!ctx) throw new Error("Segmented parts must be used within <Segmented>");
  return ctx;
}

/** Holds the selected value; wrap {@link SegmentedList} and panels. */
export function Segmented(props: SegmentedProps) {
  const [, rest] = split(props, [
    "value",
    "defaultValue",
    "onValueChange",
    "children",
    "class",
    "style",
  ]);
  const uncontrolled = signal(props.value ?? props.defaultValue ?? "");
  const value = () => (props.value != null ? props.value : uncontrolled());

  return (
    <SegmentedContext.Provider
      value={{
        value,
        onValueChange: (next) => {
          if (props.value == null) uncontrolled.set(next);
          props.onValueChange?.(next);
        },
      }}
    >
      <View {...rest} class={props.class ?? undefined} style={props.style}>
        {props.children}
      </View>
    </SegmentedContext.Provider>
  );
}

/** The track list. Pass `size` and `fill` here (they are read once per control). */
export function SegmentedList(props: SegmentedListProps) {
  const [, rest] = split(props, ["size", "fill", "style", "indicatorStyle", "children"]);
  const size = () => props.size ?? "default";
  const fill = () => !!props.fill;
  const look = segmentedLook({ size, fill });
  const segments = signal<string[]>([]);
  const value: SegmentedListValue = {
    size,
    fill,
    segments,
    register: (segment) =>
      segments.update((list) => (list.includes(segment) ? list : [...list, segment])),
    unregister: (segment) => segments.update((list) => list.filter((item) => item !== segment)),
  };

  return (
    <SegmentedListContext.Provider value={value}>
      <BaseTabs
        {...rest}
        indicatorStyle={[look.indicatorStyle, props.indicatorStyle ?? null]}
        style={[look.style, props.style ?? null]}
      >
        {props.children}
      </BaseTabs>
    </SegmentedListContext.Provider>
  );
}

/** A segment in the list. */
export function SegmentedItem(props: SegmentedItemProps) {
  const ctx = useSegmented();
  const list = SegmentedListContext();
  cleanup(() => list?.unregister(props.value));
  list?.register(props.value);
  const first = () => list?.segments()[0] === props.value;
  const [, rest] = split(props, [
    "value",
    "count",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
    "selectedStyle",
    "onPress",
    "accessibilityLabel",
  ]);
  const look = segmentedLook({
    size: () => list?.size() ?? "default",
    fill: () => !!list?.fill(),
  });
  const selected = () => ctx.value() === props.value;
  const segment = look.segment(
    {
      selected: () => selected(),
      disabled: () => !!props.disabled,
    },
    first,
  );

  return (
    <BaseTab
      {...rest}
      selected={selected()}
      {...pressHostProps(() => segment.android)}
      onPress={() => {
        ctx.onValueChange(props.value);
        props.onPress?.();
      }}
      style={[segment.style, props.style ?? null]}
      hoverStyle={[segment.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[segment.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[segment.focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[segment.disabledStyle, props.disabledStyle ?? null]}
      selectedStyle={[look.selectedStyle ?? null, props.selectedStyle ?? null]}
    >
      {(() => {
        // Read once, here where the segment is drawn (`marker.tsx` reads in the same shape): a
        // string is the label (with its count and, where the theme draws cells, a leading check),
        // anything else as it is.
        const kids = props.children;
        const check = look.check;
        return typeof kids === "string" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: look.gap }}>
            <If when={selected() && check !== null}>{check}</If>
            <Text style={look.label(selected())}>{kids}</Text>
            <If when={props.count !== undefined}>
              <Text style={look.count}>{props.count}</Text>
            </If>
          </View>
        ) : (
          kids
        );
      })()}
    </BaseTab>
  );
}
