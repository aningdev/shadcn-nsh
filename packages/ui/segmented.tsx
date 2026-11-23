// A segmented control: the look (`segmentedLook`) and the parts that wear it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  controls,
  finish,
  focusRing,
  hovered,
  rounded,
  font,
  shape,
  stroke,
  dimmed,
  tints,
  type Controls,
} from "@shadcn-nsh/theme";
import { Check } from "lucide";
import type { AndroidProps, JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { cleanup, computed, context, platform, signal, split, Text, View } from "nsh";
import {
  Tab as BaseTab,
  Tabs as BaseTabs,
  type TabProps as BaseTabProps,
  type TabsProps as BaseTabsProps,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { pressHostProps, pressRipple } from "./lib/press";
import { type Live, read } from "./lib/utils";
import type { TabLook, TabState } from "./tabs";

/**
 * The hover rule `tabsLook` uses, repeated here because `tabs.tsx` does not export it: under the
 * pointer, a segment that is neither selected (its thumb shows) nor disabled.
 */
const hoverOf = (state: TabState) => {
  const selected = typeof state.selected === "function" ? state.selected() : state.selected;
  const disabled =
    state.disabled === undefined
      ? undefined
      : typeof state.disabled === "function"
        ? state.disabled()
        : state.disabled;
  return selected || disabled ? undefined : hovered();
};

const pointer = platform.desktop;

/** A segmented control's size: `default` 24 / 30 points with a pointer, 32 / 36 on a touch screen. */
export type SegmentedSize = "sm" | "default";

/** What the segments sit in: a sunk track with a traveling thumb, or joined outlined cells. */
type SegmentedStructure = "track" | "cells";

/** The segmented control each theme's `controls` preset draws. */
const segmentedPresets: Record<Controls, { structure: SegmentedStructure }> = {
  base: { structure: "track" },
  // Material 3's segmented button: 40dp connected cells, the chosen one on SecondaryContainer with
  // a leading check (SegmentedButtonTokens.kt; the ends take the theme's full corner).
  material: { structure: "cells" },
  // WinUI's SelectorBar (borderless items, a centered bottom accent) is out of scope.
  winui: { structure: "track" },
};

/** M3's cell height and label: 40dp, label large (`SegmentedButtonTokens.kt`). */
const CELL_HEIGHT = 40;
const CELL_PADDING = 12;
const CELL_GAP = 8;
const CHECK_SIZE = 18;

/** Options of `segmentedLook`. */
export interface SegmentedLookOptions {
  /** Default `default`: 30 points high with a pointer (`sm`: 24). */
  size?: SegmentedSize;
  /** Span the row, the segments sharing it equally (always on a touch screen). */
  fill?: boolean;
}

/**
 * A segmented control's look. On a track (`style`, on `Tabs` or a `RadioGroup`): sunk, as wide as
 * its labels with a pointer (30 points high, 12-point labels, the thumb's corners a step inside the
 * track's), spanning the row on a touch screen or with `fill`; the selected segment's thumb,
 * standing off the track in both appearances (`finish.raised`: a lifted surface that carries the
 * label's ink; `knob` is the switch's white disc), as `Tabs`' traveling `indicatorStyle` or as a
 * `Radio`'s `checkedStyle` (`thumbStyle`). A theme whose `controls` are `material` draws Material
 * 3's connected cells instead: 40 points high, one outline around the row, a divider between the
 * cells (none before the first), and the chosen cell on `selectedStyle` behind a leading `check`
 * (its label's `label(selected)`, `count`). Either way, each segment's props (`segment(state)`:
 * hover, the focus ring, dimmed while disabled) and `gap` are the look's. Where the theme draws
 * cells, pass `segment(state, first)` with `first` true for the row's leading cell, which draws no
 * divider of its own.
 */
export function segmentedLook(o?: SegmentedLookOptions) {
  const small = o?.size === "sm";
  const spread = !pointer || !!o?.fill;
  // The track's padding: the thumb sits inside it.
  const inset = 2;
  // Small is as tall as a small button with a pointer (24), so the two sit level in a row.
  const height = pointer ? (small ? 24 : 30) : small ? 32 : 36;
  const cells = segmentedPresets[controls()].structure === "cells";
  // The track takes the control radius; the thumb sits `inset` points inside it.
  const thumb = (): ViewStyle => ({
    ...rounded(shape.control, inset),
    borderWidth: stroke.control,
    ...finish.raised,
  });
  return {
    get style(): ViewStyle {
      if (cells) {
        return {
          height: CELL_HEIGHT,
          flexDirection: "row",
          alignSelf: spread ? "stretch" : "flex-start",
          // The ends are the theme's full corner (M3's `shape.corner.full`); the dividers between
          // the cells are straight, so only the list draws a rounded edge.
          ...rounded(shape.button),
          borderWidth: stroke.control,
          borderColor: colors.border,
          // The chosen cell's tint is clipped to the list's rounded ends, so the ends keep the
          // theme's shape.
          overflow: "hidden",
        };
      }
      return {
        height,
        flexDirection: "row",
        alignSelf: spread ? "stretch" : "flex-start",
        padding: inset,
        ...rounded(shape.control),
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
      // Connected cells have no thumb: their chosen cell is the indicator.
      return cells ? {} : { top: inset, bottom: inset, ...thumb() };
    },
    /**
     * The selected segment drawn on itself (a `Radio`'s `checkedStyle`): the track's thumb, or the
     * chosen cell's fill where the theme draws cells.
     */
    get thumbStyle(): ViewStyle {
      return cells ? { backgroundColor: tints.brand } : thumb();
    },
    /**
     * The chosen cell's fill (`Tab`'s `selectedStyle`), `undefined` on the track, whose thumb is
     * the indicator. SecondaryContainer in Material 3.
     */
    get selectedStyle(): ViewStyle | undefined {
      return cells ? { backgroundColor: tints.brand } : undefined;
    },
    segment(state: TabState, first?: Live<boolean>): TabLook {
      if (cells) {
        return {
          get style(): ViewStyle {
            // Only the cells after the first carry a divider: the list's own outline closes the
            // leading end, so a divider there would show past its rounded edge.
            const leading = first !== undefined && read(first);
            return {
              ...(spread ? { flex: 1 } : {}),
              paddingHorizontal: CELL_PADDING,
              ...(leading
                ? {}
                : {
                    borderStartWidth: stroke.control,
                    // The logical start border takes its own colour; `borderColor` does not reach
                    // it, and a divider with no colour of its own draws black.
                    borderStartColor: colors.border,
                    marginStart: -stroke.control,
                  }),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: CELL_GAP,
            };
          },
          get hoverStyle() {
            // M3 washes the chosen cell too: its state layer sits over the container, not instead
            // of it (SegmentedButtonTokens.kt's selected state layers).
            return read(state.disabled) ? undefined : hovered();
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
        style: {
          ...(spread ? { flex: 1, paddingHorizontal: 7 } : { paddingHorizontal: 9 }),
          ...rounded(shape.control, inset),
          borderWidth: stroke.control,
          borderColor: "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
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
      if (cells) {
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
        fontSize: pointer ? 12 : small ? 13 : 14,
        fontWeight: font.weight("label"),
        color: read(selected) ? colors.foreground : colors.mutedForeground,
      };
    },
    get count(): TextStyle {
      return {
        fontSize: font.size("caption"),
        color: cells ? colors.mutedForeground : colors.faint,
        fontVariant: ["tabular-nums"],
      };
    },
    /** The chosen cell's leading check (M3's selected icon); the track has none. */
    get check(): JSX.Element | null {
      return cells ? <Icon icon={Check} size={CHECK_SIZE} tint={colors.foreground} /> : null;
    },
    /** The gap between a segment's parts: the check, its label, its count. */
    get gap(): number {
      return cells ? CELL_GAP : 5;
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
 * What a segment reads from its list: the axes the list was given, and the segments it holds.
 * Registration order is render order, so the first registered segment is the first cell.
 */
type SegmentedListValue = Pick<SegmentedLookOptions, "size" | "fill"> & {
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
  const look = computed(() => segmentedLook({ size: props.size, fill: props.fill }));
  const segments = signal<string[]>([]);
  const value: SegmentedListValue = {
    size: props.size,
    fill: props.fill,
    segments,
    register: (segment) =>
      segments.update((list) => (list.includes(segment) ? list : [...list, segment])),
    unregister: (segment) => segments.update((list) => list.filter((item) => item !== segment)),
  };

  return (
    <SegmentedListContext.Provider value={value}>
      <BaseTabs
        {...rest}
        indicatorStyle={[look().indicatorStyle, props.indicatorStyle ?? null]}
        style={[look().style, props.style ?? null]}
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
  const look = computed(() => segmentedLook({ size: list?.size, fill: list?.fill }));
  const selected = () => ctx.value() === props.value;
  const segment = computed(() =>
    look().segment(
      {
        selected: () => selected(),
        disabled: () => !!props.disabled,
      },
      first,
    ),
  );

  return (
    <BaseTab
      {...rest}
      selected={selected()}
      {...pressHostProps(() => segment().android)}
      onPress={() => {
        ctx.onValueChange(props.value);
        props.onPress?.();
      }}
      style={[segment().style, props.style ?? null]}
      hoverStyle={[segment().hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[segment().activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[segment().focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[segment().disabledStyle, props.disabledStyle ?? null]}
      selectedStyle={[look().selectedStyle ?? null, props.selectedStyle ?? null]}
    >
      {(() => {
        // Read once, here where the segment is drawn (`marker.tsx` reads in the same shape): a
        // string is the label (with its count and, where the theme draws cells, a leading check),
        // anything else as it is.
        const kids = props.children;
        const check = look().check;
        return typeof kids === "string" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: look().gap }}>
            <If when={selected() && check !== null}>{check}</If>
            <Text style={look().label(selected())}>{kids}</Text>
            <If when={props.count !== undefined}>
              <Text style={look().count}>{props.count}</Text>
            </If>
          </View>
        ) : (
          kids
        );
      })()}
    </BaseTab>
  );
}
