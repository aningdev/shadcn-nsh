// Source: examples/nsh-gallery-ui/look/tabs.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, disabledOpacity, finish, focusRing, hovered, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, context, signal, split, Text, View } from "nsh";
import {
  Tab as BaseTab,
  Tabs as BaseTabs,
  type TabProps as BaseTabProps,
  type TabsProps as BaseTabsProps,
} from "nsh/base";

import { isPointer } from "./lib/density";
import { pressSink } from "./lib/press";

/**
 * Composition root (shadcn `Tabs`): holds the selected value and orientation.
 * `nsh/base` has no value-holding root — the list is {@link TabsList}.
 */
export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** shadcn `bases/base` orientation — root axis, and the list's. */
  orientation?: "horizontal" | "vertical";
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** shadcn `bases/base` TabsList look — `default` pill track; `line` underline. */
export type TabsListVariant = "default" | "line";

/**
 * Theme layer on `nsh/base` Tabs (the tablist). Base props pass through.
 * `variant` is wrapper-only (`default` | `line`). The traveling indicator is
 * `indicatorStyle` (base draws it behind the tabs).
 */
export type TabsListProps = BaseTabsProps & {
  variant?: TabsListVariant;
};

/**
 * Theme layer on `nsh/base` Tab as a shadcn `TabsTrigger`. `value` selects via
 * the {@link Tabs} context. `selected` is owned by that context.
 */
export type TabsTriggerProps = Omit<BaseTabProps, "selected" | "children"> & {
  value: string;
  children?: string | JSX.Element;
};

/**
 * Panel beside the list — app content, not an `nsh/base` part. Shown while
 * its `value` matches the {@link Tabs} context.
 */
export type TabsContentProps = {
  value: string;
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/**
 * Theme layer on the `nsh/base` {@link Tab} symbol for direct use (no composition
 * value). Prefer {@link TabsTrigger} inside {@link TabsList}.
 */
export type TabProps = Omit<BaseTabProps, "children"> & {
  children?: string | JSX.Element;
};

type TabsContextValue = {
  value: () => string;
  onValueChange: (value: string) => void;
  orientation: () => "horizontal" | "vertical";
};

const TabsContext = context<TabsContextValue | null>(null);
const ListVariantContext = context<TabsListVariant>("default");

function useTabs() {
  return TabsContext();
}

/** Wrapper defaults, then consumer — consumer wins per key (StyleProp list L→R). */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

type TabsChrome = {
  track: ViewStyle;
  indicator: ViewStyle;
  tab: ViewStyle;
  hover: ViewStyle;
  active: ViewStyle;
  focus: ViewStyle;
  disabled: ViewStyle;
  labelSize: number;
};

/**
 * Pill track or underline row. The thumb stands in for gallery `finish.thumb`
 * (`colors.background` + `finish.control.rest`); the sunk track stands in for
 * `finish.track` (`colors.muted` + `finish.control.pressed`). The underline is
 * `colors.primary` (gallery accent, which this theme does not have).
 */
function look(variant: TabsListVariant, orientation: "horizontal" | "vertical"): TabsChrome {
  const pointer = isPointer();
  // Touch: 52, so a tab inside the 3-point inset and 1-point border is a 44-point target.
  const trackMin = pointer ? 30 : 52;
  const inset = 3;
  const horizontal = orientation !== "vertical";
  const sink = pressSink(0.97, "background-color, border-color, opacity");
  const pill = variant !== "line";
  const thumbRadius = (trackMin - 2 * (inset + 1)) / 2;

  const track: ViewStyle = pill
    ? {
        flexDirection: horizontal ? "row" : "column",
        alignItems: "stretch",
        alignSelf: "stretch",
        minHeight: horizontal ? trackMin : undefined,
        minWidth: horizontal ? undefined : trackMin,
        padding: inset,
        gap: 2,
        borderRadius: trackMin / 2,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.muted,
        boxShadow: finish.control.pressed,
      }
    : {
        flexDirection: horizontal ? "row" : "column",
        alignItems: "stretch",
        alignSelf: "stretch",
        gap: 2,
        paddingTop: horizontal ? 3 : 0,
        paddingLeft: horizontal ? 0 : 3,
        borderBottomWidth: horizontal ? 1 : 0,
        borderRightWidth: horizontal ? 0 : 1,
        borderColor: colors.border,
      };

  const indicator: ViewStyle = pill
    ? {
        ...(horizontal ? { top: inset, bottom: inset } : { left: inset, right: inset }),
        borderRadius: thumbRadius,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        boxShadow: finish.control.rest,
      }
    : horizontal
      ? { bottom: 0, height: 2, borderRadius: 1, backgroundColor: colors.primary }
      : { right: 0, width: 2, borderRadius: 1, backgroundColor: colors.primary };

  const tab: ViewStyle = {
    // Share extra track width, but never shrink below the label. `flexBasis: 0`
    // collapses the tab when the list's width is its content.
    flexGrow: pill ? 1 : 0,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    ...(pill
      ? { paddingHorizontal: 6, borderWidth: 1, borderColor: "transparent" }
      : {
          minHeight: horizontal ? trackMin : undefined,
          minWidth: horizontal ? undefined : trackMin,
          paddingHorizontal: horizontal ? 8 : 6,
          paddingVertical: horizontal ? 0 : 8,
          marginBottom: horizontal ? 4 : 0,
          marginRight: horizontal ? 0 : 4,
          borderRadius: radius.control,
          borderCurve: "continuous" as const,
        }),
    ...sink.transition,
  };

  return {
    track,
    indicator,
    tab,
    hover: hovered(),
    active: sink.activeStyle,
    focus: focusRing(),
    disabled: { opacity: disabledOpacity() },
    labelSize: 13,
  };
}

/** Pill-track height for the current idiom. Tabs have no `hitSlop`; the track itself grows on touch. */
export function tabsMetrics() {
  return { minHeight: look("default", "horizontal").track.minHeight as number };
}

/** Composition root: the selected value, then the list and panels. */
export function Tabs(props: TabsProps) {
  const [, rest] = split(props, [
    "value",
    "defaultValue",
    "onValueChange",
    "orientation",
    "children",
    "class",
    "style",
  ]);
  const uncontrolled = signal(props.value ?? props.defaultValue ?? "");
  const value = () => (props.value != null ? props.value : uncontrolled());
  const orientation = () => props.orientation ?? "horizontal";

  return (
    <TabsContext.Provider
      value={{
        value,
        orientation,
        onValueChange: (next) => {
          if (props.value == null) uncontrolled.set(next);
          props.onValueChange?.(next);
        },
      }}
    >
      <View
        {...rest}
        class={props.class ?? undefined}
        style={mergeStyle(
          {
            flexDirection: orientation() === "vertical" ? "row" : "column",
            alignItems: "stretch",
            gap: 8,
          },
          props.style,
        )}
      >
        {props.children}
      </View>
    </TabsContext.Provider>
  );
}

/** The tab list: pill track or underline, with the traveling indicator behind the tabs. */
export function TabsList(props: TabsListProps) {
  const ctx = useTabs();
  const [, rest] = split(props, ["variant", "style", "indicatorStyle", "children"]);
  const variant = () => props.variant ?? "default";
  const chrome = computed(() => look(variant(), ctx?.orientation() ?? "horizontal"));

  return (
    <ListVariantContext.Provider value={variant()}>
      <BaseTabs
        {...rest}
        indicatorStyle={mergeStyle(chrome().indicator, props.indicatorStyle)}
        style={mergeStyle(chrome().track, props.style)}
      >
        {props.children}
      </BaseTabs>
    </ListVariantContext.Provider>
  );
}

function tabLabel(children: string | JSX.Element | undefined, selected: boolean, size: number) {
  if (typeof children !== "string") return children;
  return (
    <Text
      style={{
        numberOfLines: 1,
        flexShrink: 0,
        fontSize: size,
        fontWeight: "500",
        color: selected ? colors.foreground : colors.mutedForeground,
      }}
    >
      {children}
    </Text>
  );
}

/** A tab in the list. String children become the label; selection follows the root value. */
export function TabsTrigger(props: TabsTriggerProps) {
  const ctx = useTabs();
  const variant = ListVariantContext();
  const [, rest] = split(props, [
    "value",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "selectedStyle",
    "onPress",
    "accessibilityLabel",
  ]);
  const chrome = computed(() => look(variant, ctx?.orientation() ?? "horizontal"));
  const selected = () => (ctx ? ctx.value() === props.value : false);

  return (
    <BaseTab
      {...rest}
      selected={selected()}
      accessibilityLabel={
        props.accessibilityLabel !== undefined
          ? props.accessibilityLabel
          : typeof props.children === "string"
            ? props.children
            : undefined
      }
      onPress={() => {
        ctx?.onValueChange(props.value);
        props.onPress?.();
      }}
      style={mergeStyle(chrome().tab, props.style)}
      hoverStyle={mergeStyle(
        selected() || props.disabled ? null : chrome().hover,
        props.hoverStyle,
      )}
      activeStyle={mergeStyle(chrome().active, props.activeStyle)}
      focusStyle={mergeStyle(chrome().focus, props.focusStyle)}
      disabledStyle={mergeStyle(chrome().disabled, props.disabledStyle)}
      selectedStyle={props.selectedStyle}
    >
      {tabLabel(props.children, selected(), chrome().labelSize)}
    </BaseTab>
  );
}

/** A `nsh/base` tab with the same chrome, for a list whose value the app owns. */
export function Tab(props: TabProps) {
  const ctx = useTabs();
  const variant = ListVariantContext();
  const [, rest] = split(props, [
    "children",
    "selected",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusStyle",
    "disabledStyle",
    "selectedStyle",
    "accessibilityLabel",
  ]);
  const chrome = computed(() => look(variant, ctx?.orientation() ?? "horizontal"));

  return (
    <BaseTab
      {...rest}
      selected={props.selected}
      accessibilityLabel={
        props.accessibilityLabel !== undefined
          ? props.accessibilityLabel
          : typeof props.children === "string"
            ? props.children
            : undefined
      }
      style={mergeStyle(chrome().tab, props.style)}
      hoverStyle={mergeStyle(
        props.selected || props.disabled ? null : chrome().hover,
        props.hoverStyle,
      )}
      activeStyle={mergeStyle(chrome().active, props.activeStyle)}
      focusStyle={mergeStyle(chrome().focus, props.focusStyle)}
      disabledStyle={mergeStyle(chrome().disabled, props.disabledStyle)}
      selectedStyle={props.selectedStyle}
    >
      {tabLabel(props.children, !!props.selected, chrome().labelSize)}
    </BaseTab>
  );
}

/** The panel for one value. Hidden, not unmounted, while another value is selected. */
export function TabsContent(props: TabsContentProps) {
  const ctx = useTabs();
  const shown = () => (ctx ? ctx.value() === props.value : false);
  return (
    <View
      class={props.class ?? undefined}
      style={mergeStyle({ display: shown() ? "flex" : "none" }, props.style)}
    >
      {props.children}
    </View>
  );
}
