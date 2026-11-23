// Tabs: the looks (`tabsLook`, `underlineTabsLook`, `TabTitle`) and the parts that wear them.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  colors,
  finish,
  focusRing,
  follow,
  hovered,
  motion,
  terminal,
  rounded,
  font,
  shape,
  stroke,
  dimmed,
  controls,
  type Controls,
} from "@shadcn-nsh/theme";
import type { IconNode } from "lucide";
import type { AndroidProps, JSX, StyleProp, ViewStyle } from "nsh";
import { computed, context, signal, split, Text, View } from "nsh";
import {
  Tab as BaseTab,
  Tabs as BaseTabs,
  type TabProps as BaseTabProps,
  type TabsProps as BaseTabsProps,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { pressHostProps, pressRipple } from "./lib/press";
import { controlSize } from "./lib/surface";
import { type Live, read } from "./lib/utils";

// @port look/tabs.tsx

/** The state of one tab or segment, read where the look is applied. */
export interface TabState {
  selected: Live<boolean | undefined>;
  disabled?: Live<boolean | undefined>;
}

/** The props a tab's or segment's look gives it (a `Tab`, a `Radio`). */
export interface TabLook {
  readonly style: ViewStyle;
  readonly hoverStyle: ViewStyle | undefined;
  readonly activeStyle?: ViewStyle;
  readonly focusVisibleStyle: ViewStyle;
  readonly disabledStyle: ViewStyle;
  readonly android?: AndroidProps;
}

/** Under the pointer, a tab that is neither selected (its thumb shows) nor disabled. */
const hoverOf = (state: TabState) =>
  read(state.selected) || read(state.disabled) ? undefined : hovered();

/**
 * A tab strip's look, the gallery's section switcher: a capsule track
 * `controlSize.tabs` high (30 with a pointer, 40 on a touch screen), sunk
 * into the surface with a hairline edge, the tabs sharing its width; the
 * selected tab's pill (`indicatorStyle`, `finish.knob`) springs to the next
 * one natively. `tab(state)`: a tab's props (hover on the others, the focus
 * ring, dimmed while disabled). Pair each tab with a `TabTitle`.
 */
export function tabsLook() {
  // The track's padding and border: a tab is a pill inside them.
  const inset = 3;
  const inner = () => controlSize.tabs - 2 * (inset + 1);
  return {
    get style(): ViewStyle {
      return {
        height: controlSize.tabs,
        flexDirection: "row",
        gap: 2,
        padding: inset,
        borderRadius: controlSize.tabs / 2,
        borderWidth: stroke.control,
        borderColor: colors.border,
        backgroundColor: colors.inset,
        boxShadow: finish.inset.boxShadow,
      };
    },
    get indicatorStyle(): ViewStyle {
      return {
        top: inset,
        bottom: inset,
        borderRadius: inner() / 2,
        borderWidth: stroke.control,
        ...finish.knob,
      };
    },
    tab(state: TabState): TabLook {
      return {
        get style(): ViewStyle {
          return {
            flex: 1,
            paddingHorizontal: 6,
            borderRadius: inner() / 2,
            borderWidth: stroke.control,
            borderColor: "transparent",
            alignItems: "center",
            justifyContent: "center",
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
  };
}

/**
 * An underlined tab strip's look: tabs as wide as their labels
 * (`controlSize.tabs` high), a 2-point accent line (`indicatorStyle`) at the
 * strip's bottom that travels and stretches to the selected tab, over a
 * hairline (`rule`, a view under the strip: outside a scroll view holding
 * it, so its clipping never cuts the line). `tab(state)`: a tab's props
 * (hover on the others, a press that dims, the focus ring, dimmed while
 * disabled).
 */
interface TabsPreset {
  indicator: "pill" | "underline";
  indicatorThickness: number;
  padX: number;
  indicatorSpan: "tab" | "label";
  indicatorCorners: "pill" | "top";
}

const tabsPresets: Record<Controls, TabsPreset> = {
  base: {
    indicator: "pill",
    indicatorThickness: 2,
    padX: 8,
    indicatorSpan: "tab",
    indicatorCorners: "pill",
  },
  // M3 PrimaryNavigationTab label-width 3dp indicator with top-only corners (PrimaryNavigationTabTokens.kt, _md-comp-primary-navigation-tab.scss:28, _tab.scss:92-103).
  material: {
    indicator: "underline",
    indicatorThickness: 3,
    padX: 8,
    indicatorSpan: "label",
    indicatorCorners: "top",
  },
  // WinUI 3 SelectorBar underline tab geometry with 3px pill-capped active indicator.
  winui: {
    indicator: "underline",
    indicatorThickness: 3,
    padX: 8,
    indicatorSpan: "tab",
    indicatorCorners: "pill",
  },
};

export function underlineTabsLook() {
  return {
    get style(): ViewStyle {
      return { flexDirection: "row", gap: 2, paddingTop: 3 };
    },
    get indicatorStyle(): ViewStyle {
      const g = tabsPresets[controls()];
      const corners: ViewStyle =
        g.indicatorCorners === "top"
          ? {
              borderTopLeftRadius: g.indicatorThickness,
              borderTopRightRadius: g.indicatorThickness,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          : { borderRadius: g.indicatorThickness / 2 };
      return {
        bottom: 0,
        height: g.indicatorThickness,
        ...(g.indicatorSpan === "label" ? { marginHorizontal: g.padX } : {}),
        ...corners,
        backgroundColor: colors.brand,
      };
    },
    get rule(): ViewStyle {
      return {
        pointerEvents: "none",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: stroke.hairline,
        backgroundColor: colors.line,
      };
    },
    tab(state: TabState): TabLook {
      return {
        get style(): ViewStyle {
          return {
            height: controlSize.tabs,
            paddingHorizontal: tabsPresets[controls()].padX,
            marginBottom: 4,
            ...rounded(shape.control),
            borderWidth: stroke.control,
            borderColor: "transparent",
            justifyContent: "center",
          };
        },
        get hoverStyle() {
          return hoverOf(state);
        },
        get activeStyle(): ViewStyle {
          return { opacity: dimmed.pressed };
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
  };
}

/** A tab title's icon: 14 points square. */
const TAB_ICON = 14;

/** The room a tab title's icon takes: the icon and the gap after it. */
export const TAB_ICON_ROOM = TAB_ICON + 6;

/**
 * A tab's label (and icon, and a count in a capsule): the text color while
 * selected, fading in as the indicator arrives (`motion.default`), the icon's
 * two tints crossing over. It keeps its natural width (never truncated) and
 * reports it without the icon (`onWidth`): the same whether the icon shows
 * or not, so a row deciding on its icons by it never flips back.
 * `underline`: a terminal marks the selected tab of an underlined strip by
 * underlining its label, where the strip's indicator, thinner than a Cell,
 * does not show.
 */
export function TabTitle(props: {
  name: string;
  selected: boolean;
  count?: number;
  icon?: IconNode;
  underline?: boolean;
  onWidth?: (bare: number) => void;
}) {
  const on = follow(() => (props.selected ? 1 : 0), motion.default);
  const listVariant = ListVariantContext();
  // A preset that marks the chosen tab with an underline also sets its label in the accent.
  const chosenInk = () =>
    tabsPresets[controls()].indicator === "underline" && (listVariant === "line" || props.underline)
      ? colors.brand
      : colors.foreground;
  const away = on.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  return (
    <View
      onLayout={({ bounds }) =>
        props.onWidth?.(bounds.size.width - (props.icon ? TAB_ICON_ROOM : 0))
      }
      style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 }}
    >
      <If when={props.icon}>
        <View style={{ width: TAB_ICON, height: TAB_ICON }}>
          <View style={{ position: "absolute", opacity: away }}>
            <Icon icon={props.icon!} size={TAB_ICON} tint={colors.mutedForeground} />
          </View>
          <View style={{ position: "absolute", opacity: on }}>
            <Icon icon={props.icon!} size={TAB_ICON} tint={chosenInk()} />
          </View>
        </View>
      </If>
      <Text
        style={{
          numberOfLines: 1,
          // No type role has this size: a tab's label is 13 in both tiers (`label` is 14 / 15).
          fontSize: 13,
          fontWeight: font.weight("label"),
          color: on.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.mutedForeground, chosenInk()],
          }),
          textDecorationLine: terminal && props.underline && props.selected ? "underline" : "none",
        }}
      >
        {props.name}
      </Text>
      <If when={props.count !== undefined}>
        <View
          style={{
            minWidth: 18,
            height: 16,
            paddingHorizontal: 5,
            ...rounded(shape.control),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.inset,
            borderWidth: stroke.control,
            borderColor: colors.line,
          }}
        >
          <Text
            style={{
              // No type role has this size: a tab's count is 10.
              fontSize: 10,
              fontWeight: font.weight("title"),
              color: colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {props.count}
          </Text>
        </View>
      </If>
    </View>
  );
}
// @port end

/** Pill track (`default`) or underlined (`line`) tab list. */
export type TabsListVariant = "default" | "line";

/**
 * Composition root: the selected tab value, then lists and panels. `nsh/base`
 * has no value-holding root — the list is {@link TabsList}.
 */
export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** `nsh/base`'s Tabs (the tablist). Base props pass through. */
export type TabsListProps = BaseTabsProps & {
  variant?: TabsListVariant;
};

/** A tab in the list. String children become the label. */
export type TabsTriggerProps = Omit<BaseTabProps, "selected" | "children"> & {
  value: string;
  children?: string | JSX.Element;
};

/** Panel for one `value`. Hidden while another value is selected. */
export type TabsContentProps = {
  value: string;
  children?: JSX.Element;
  class?: string | null;
  style?: StyleProp<ViewStyle>;
};

/** `nsh/base`'s Tab with the same chrome, when the app owns `selected`. */
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

/** The variant a list wears when it names none: `tabsPresets[controls()].indicator` (an underline, or the pill's capsule). */
const themeVariant = (): TabsListVariant =>
  tabsPresets[controls()].indicator === "underline" ? "line" : "default";

function useTabs() {
  return TabsContext();
}

/** Composition root: selected value, then list and content. */
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
        style={[
          {
            // The list, then the panel, a gap apart — a row of the two when the list is vertical.
            flexDirection: orientation() === "vertical" ? "row" : "column",
            alignItems: "stretch",
            gap: 8,
          },
          props.style ?? null,
        ]}
      >
        {props.children}
      </View>
    </TabsContext.Provider>
  );
}

function listLook(variant: TabsListVariant) {
  return variant === "line" ? underlineTabsLook() : tabsLook();
}

/** The tab list: capsule track or underline, with the traveling indicator. */
export function TabsList(props: TabsListProps) {
  const [, rest] = split(props, ["variant", "style", "indicatorStyle", "children"]);
  const variant = () => props.variant ?? themeVariant();
  const look = computed(() => listLook(variant()));
  // The frame is chosen when the list is made, so a theme switched later shows on the next mount.

  const list = (
    <ListVariantContext.Provider value={variant()}>
      <BaseTabs
        {...rest}
        indicatorStyle={[look().indicatorStyle, props.indicatorStyle ?? null]}
        style={[look().style, props.style ?? null]}
      >
        {props.children}
      </BaseTabs>
    </ListVariantContext.Provider>
  );

  if (variant() !== "line") return list;
  return (
    <View style={{ alignSelf: "stretch" }}>
      <View testID="tabs-rule" style={underlineTabsLook().rule} />
      {list}
    </View>
  );
}

/** A tab in the list. Selection follows the root {@link Tabs} value. */
export function TabsTrigger(props: TabsTriggerProps) {
  const ctx = useTabs();
  const variant = ListVariantContext();
  const [, rest] = split(props, [
    "value",
    "children",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
    "selectedStyle",
    "onPress",
  ]);
  const look = computed(() => listLook(variant));
  const selected = () => (ctx ? ctx.value() === props.value : false);
  const tab = computed(() =>
    look().tab({
      selected: () => selected(),
      disabled: () => !!props.disabled,
    }),
  );

  return (
    <BaseTab
      {...rest}
      selected={selected()}
      {...pressHostProps(() => tab().android)}
      onPress={() => {
        ctx?.onValueChange(props.value);
        props.onPress?.();
      }}
      style={[tab().style, props.style ?? null]}
      hoverStyle={[tab().hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[tab().activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[tab().focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[tab().disabledStyle, props.disabledStyle ?? null]}
      selectedStyle={props.selectedStyle}
    >
      {(() => {
        // Read once, here where the tab is drawn (`marker.tsx` reads in the same shape): a
        // string is `TabTitle`, anything else as it is.
        const kids = props.children;
        return typeof kids === "string" ? <TabTitle name={kids} selected={selected()} /> : kids;
      })()}
    </BaseTab>
  );
}

/** `nsh/base`'s Tab with list chrome when used inside {@link TabsList}. */
export function Tab(props: TabProps) {
  const variant = ListVariantContext();
  const [, rest] = split(props, [
    "children",
    "selected",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
    "selectedStyle",
  ]);
  const look = computed(() => listLook(variant));
  const tab = computed(() =>
    look().tab({
      selected: () => !!props.selected,
      disabled: () => !!props.disabled,
    }),
  );

  return (
    <BaseTab
      {...rest}
      selected={props.selected}
      {...pressHostProps(() => tab().android)}
      style={[tab().style, props.style ?? null]}
      hoverStyle={[tab().hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[tab().activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[tab().focusVisibleStyle, props.focusVisibleStyle ?? null]}
      disabledStyle={[tab().disabledStyle, props.disabledStyle ?? null]}
      selectedStyle={props.selectedStyle}
    >
      {(() => {
        // Read once, here where the tab is drawn (`marker.tsx` reads in the same shape): a
        // string is `TabTitle`, anything else as it is.
        const kids = props.children;
        return typeof kids === "string" ? (
          <TabTitle name={kids} selected={!!props.selected} />
        ) : (
          kids
        );
      })()}
    </BaseTab>
  );
}

/** Content for one value. Hidden, not unmounted, while another value is selected. */
export function TabsContent(props: TabsContentProps) {
  const ctx = useTabs();
  const shown = () => (ctx ? ctx.value() === props.value : false);
  return (
    <View
      class={props.class ?? undefined}
      style={[{ display: shown() ? "flex" : "none" }, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}
