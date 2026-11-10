// Source: examples/nsh-gallery-ui/look/workspace.tsx @ 64ab8a1d (baseline), see NOTICE.
import { colors, finish, radius } from "@shadcn-nsh/theme";
import type { JSX, StyleProp, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
import {
  DockArea as BaseDockArea,
  type DockAreaProps as BaseDockAreaProps,
  type DockPanel,
  type DockTab,
} from "nsh/base";

/**
 * Theme layer on `nsh/base` DockArea. One control: panels, tabs and docks are
 * render props, not composition parts. Every base prop passes through.
 */
export type DockAreaProps = BaseDockAreaProps;

/** Classes and the few styles a class cannot recolor. */
export type DockAreaChrome = {
  groupClass: string;
  tabBarClass: string;
  tabBar: ViewStyle;
  tabClass: string;
  contentClass: string;
  handleClass: string;
  /** Same grip as `ResizablePanelGroup`. Duplicated on purpose: eight lines would not be, one class is not a shared module. */
  handleThumbClass: string;
  dockClass: string;
  dropIndicatorClass: string;
  drawer: ViewStyle;
  sheet: ViewStyle;
  backdrop: ViewStyle;
  preview: ViewStyle;
};

/** Wrapper defaults, then consumer — consumer wins per key. */
function mergeStyle(
  base?: StyleProp<ViewStyle> | null,
  consumer?: StyleProp<ViewStyle> | null,
): StyleProp<ViewStyle> | undefined {
  if (base == null && consumer == null) return undefined;
  if (base == null) return consumer ?? undefined;
  if (consumer == null) return base ?? undefined;
  return [base, consumer];
}

/** Concatenate wrapper + consumer `class` when both are set. */
function mergeClass(base: string, consumer?: string | null): string {
  return consumer ? `${base} ${consumer}` : base;
}

/**
 * The reference dock, in neutral: inset is `muted`, the brand underline and
 * drop target are `primary`, the scrim is the theme's backdrop token.
 * The thumb matches the resizable handle (hidden until hover or drag).
 */
function look(): DockAreaChrome {
  return {
    groupClass: "flex-1 bg-muted",
    tabBarClass: "flex-row",
    tabBar: {
      alignItems: "stretch",
      borderBottomWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.muted,
    },
    tabClass: "group",
    contentClass: "flex-1",
    handleClass: "bg-border group-hover:bg-ring group-active:bg-primary group-focus:bg-ring",
    handleThumbClass:
      "h-11 w-[3px] rounded-full bg-muted-foreground opacity-0 scale-y-0 transition duration-150 ease-out motion-reduce:transition-none group-hover:opacity-40 group-hover:scale-y-[0.45] group-active:opacity-90 group-active:scale-y-100 group-focus:opacity-90 group-focus:scale-y-100",
    dockClass: "bg-muted",
    dropIndicatorClass: "rounded-lg border-2 border-primary bg-accent",
    drawer: {
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    // The reference sheet's top radius (16). A chrome corner, not a text box.
    sheet: {
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderColor: colors.border,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
    },
    backdrop: { backgroundColor: colors.backdrop },
    preview: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.control,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      boxShadow: finish.control.rest,
    },
  };
}

/** Dock chrome. Call it where the theme is read. */
export function dockAreaVariants(): DockAreaChrome {
  return look();
}

/** A tab title: muted until the pointer is on it, foreground with a primary underline while shown. */
function defaultTab(tab: DockTab) {
  return (
    <View
      style={{
        minHeight: 36,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
      }}
    >
      <Text
        class={
          tab.active
            ? "text-foreground text-[13px] font-medium"
            : "text-muted-foreground group-hover:text-foreground text-[13px] font-medium"
        }
        style={{ numberOfLines: 1 }}
      >
        {tab.panel}
      </Text>
      <View
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 0,
          height: 2,
          borderRadius: 1,
          backgroundColor: colors.primary,
          opacity: tab.active ? 1 : 0,
        }}
      />
    </View>
  );
}

/** The panel's key on the muted surface. The app replaces this with `renderPanel`. */
function defaultPanel(panel: DockPanel) {
  return (
    <View style={{ flex: 1, padding: 8 }}>
      <Text style={{ fontSize: 13, color: colors.foreground, numberOfLines: 1 }}>{panel.id}</Text>
    </View>
  );
}

/** A raised chip with the tab's title, following the pointer. */
function defaultPreview(tab: DockTab) {
  const chrome = dockAreaVariants();
  return (
    <View style={chrome.preview}>
      <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>{tab.panel}</Text>
    </View>
  );
}

/** Shown when the center has no panels. */
function defaultEmpty(): JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 8 }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>No panels</Text>
    </View>
  );
}

/**
 * A dockable workspace. Tabs, splits, docks and zoom stay in `nsh/base`.
 * A close button is the app's: call `ref.closePanel` from `renderTab`.
 */
export function DockArea(props: DockAreaProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "groupClass",
    "groupStyle",
    "tabBarClass",
    "tabBarStyle",
    "tabClass",
    "tabStyle",
    "contentClass",
    "contentStyle",
    "handleClass",
    "handleStyle",
    "handleThumbClass",
    "handleThumbStyle",
    "handleAccessibilityLabel",
    "dockClass",
    "dockStyle",
    "dropIndicatorClass",
    "dropIndicatorStyle",
    "drawerClass",
    "drawerStyle",
    "sheetClass",
    "sheetStyle",
    "backdropClass",
    "backdropStyle",
    "renderTab",
    "renderPanel",
    "renderDragPreview",
    "renderEmpty",
  ]);
  const chrome = computed(() => dockAreaVariants());
  return (
    <BaseDockArea
      {...rest}
      class={props.class}
      style={props.style}
      handleAccessibilityLabel={props.handleAccessibilityLabel ?? "Resize"}
      groupClass={mergeClass(chrome().groupClass, props.groupClass)}
      groupStyle={props.groupStyle}
      tabBarClass={mergeClass(chrome().tabBarClass, props.tabBarClass)}
      tabBarStyle={mergeStyle(chrome().tabBar, props.tabBarStyle)}
      tabClass={mergeClass(chrome().tabClass, props.tabClass)}
      tabStyle={props.tabStyle}
      contentClass={mergeClass(chrome().contentClass, props.contentClass)}
      contentStyle={props.contentStyle}
      handleClass={mergeClass(chrome().handleClass, props.handleClass)}
      handleStyle={props.handleStyle}
      handleThumbClass={mergeClass(chrome().handleThumbClass, props.handleThumbClass)}
      handleThumbStyle={props.handleThumbStyle}
      dockClass={mergeClass(chrome().dockClass, props.dockClass)}
      dockStyle={props.dockStyle}
      dropIndicatorClass={mergeClass(chrome().dropIndicatorClass, props.dropIndicatorClass)}
      dropIndicatorStyle={props.dropIndicatorStyle}
      drawerClass={props.drawerClass}
      drawerStyle={mergeStyle(chrome().drawer, props.drawerStyle)}
      sheetClass={props.sheetClass}
      sheetStyle={mergeStyle(chrome().sheet, props.sheetStyle)}
      backdropClass={props.backdropClass}
      backdropStyle={mergeStyle(chrome().backdrop, props.backdropStyle)}
      renderTab={props.renderTab ?? defaultTab}
      renderPanel={props.renderPanel ?? defaultPanel}
      renderDragPreview={props.renderDragPreview ?? defaultPreview}
      renderEmpty={props.renderEmpty ?? defaultEmpty}
    />
  );
}
