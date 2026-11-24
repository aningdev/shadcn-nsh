// A segmented control: the look (`segmentedLook`) and the parts that wear it.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import {
  colors,
  controlHeight,
  finish,
  focusRing,
  rounded,
  font,
  shape,
  stroke,
  dimmed,
} from "@shadcn-nsh/theme";
import type { AndroidProps, JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { context, platform, signal, split, Text, View } from "nsh";
import {
  Tab as BaseTab,
  Tabs as BaseTabs,
  type TabProps as BaseTabProps,
  type TabsProps as BaseTabsProps,
} from "nsh/base";

import { type Live, read } from "./lib/live-value";
import { pressHostProps, pressRipple } from "./lib/press";
import { hoverOf, type TabLook, type TabState } from "./tabs";

const pointer = platform.desktop;

/**
 * A segmented control's size: the theme's middle height (`height.md`) by default, its small one
 * (`height.sm`) for `sm`.
 */
export type SegmentedSize = "sm" | "default";

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
 * segment's thumb, standing off the track in both appearances (`finish.plate`: a labelled block
 * chosen inside a well), as `Tabs`' traveling `indicatorStyle` or as a `Radio`'s `checkedStyle`
 * (`thumbStyle`). Each segment's props (`segment(state)`: hover, the focus ring, dimmed while
 * disabled) and its label are the look's.
 */
export function segmentedLook(o?: SegmentedLookOptions) {
  const small = () => read(o?.size) === "sm";
  const spread = () => !pointer || !!read(o?.fill);
  // The track's padding, and the room the thumb keeps inside it: both the same step, so a segment's
  // own box is the thumb's box — the one the pointer's hover paints.
  const inset = 2;
  // The theme's height scale, read where it is drawn: the middle step, or the small one for `sm`
  // (so a small control is as tall as a small button, and the two sit level in a row).
  const height = () => (small() ? controlHeight.sm : controlHeight.md);
  // The thumb: the track's raised plate, a segment's own box (the theme's `plate`: a labelled block
  // chosen inside a well).
  const thumb = (): ViewStyle => ({
    ...rounded(shape.control, inset),
    borderWidth: stroke.control,
    // A face without an edge of its own draws none: `finish.plate` states the colour where it
    // names one, and a border with no colour of its own draws black.
    borderColor: "transparent",
    ...finish.plate,
  });
  return {
    get style(): ViewStyle {
      return {
        height: height(),
        flexDirection: "row",
        alignSelf: spread() ? "stretch" : "flex-start",
        padding: inset,
        ...rounded(shape.control, inset),
        // The channel the chosen block sits in (`channel`), not the switch's track: in dark a
        // switch's track is as raised as its thumb, which would hide the thumb.
        ...finish.channel,
        borderWidth: stroke.control,
      };
    },
    /** The thumb as `Tabs`' indicator, which the core springs to the selected tab. */
    get indicatorStyle(): ViewStyle {
      // The thumb takes a segment's box, which stands a pad in from the track's edge.
      return { top: inset, bottom: inset, ...thumb() };
    },
    /** The selected segment drawn on itself (a `Radio`'s `checkedStyle`). */
    get thumbStyle(): ViewStyle {
      return thumb();
    },
    segment(state: TabState): TabLook {
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
        color: colors.faint,
        fontVariant: ["tabular-nums"],
      };
    },
    /** The gap between a segment's parts: its label and its count. */
    get gap(): number {
      return 5;
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

/** The sink the segments sit in (`nsh/base`'s `Tabs`): the track and its thumb. */
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

/** What a segment reads from its list: the options the list was given, read where a segment is drawn. */
type SegmentedListValue = {
  size: () => SegmentedSize;
  fill: () => boolean;
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
  const value: SegmentedListValue = { size, fill };

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
  const segment = look.segment({
    selected: () => selected(),
    disabled: () => !!props.disabled,
  });

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
      selectedStyle={props.selectedStyle}
    >
      {(() => {
        // Read once, here where the segment is drawn (`marker.tsx` reads in the same shape): a
        // string is the label (with its count), anything else as it is.
        const kids = props.children;
        return typeof kids === "string" ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: look.gap }}>
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
