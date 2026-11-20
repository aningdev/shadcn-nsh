// A split view: the columns, the column header and the sidebar button, in the theme's look, over
// `nsh/base`'s SplitView. This library's own: nothing here comes from upstream, so there is no
// port region. Yours to change.
//
// The names follow the columns `nsh/base` already has (`sidebar`, `content`, `detail`) and shadcn's
// part roles (`Header`, `Trigger`). The root keeps those columns as props: each one is a `NavStack`,
// and the platform finds that stack in the slot, so a part must not wrap it. The look lives on the
// page inside the stack — the column's surface and the hairline after it — and on the header and
// the button the page puts in it.
import {
  alpha,
  colors,
  focusRing,
  header,
  hovered,
  radius,
  rounded,
  font,
} from "@shadcn-nsh/theme";
import { PanelLeft } from "lucide";
import type { JSX, StyleProp, TextStyle, ViewStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import {
  NavPage as BaseNavPage,
  type NavPageProps as BaseNavPageProps,
  SplitView as BaseSplitView,
  type ColumnVisibility,
  type SplitViewProps as BaseSplitViewProps,
} from "nsh/base";

import { Icon } from "./lib/icons";

export type { ColumnVisibility };

/** Which column a page or a header belongs to. */
export type SplitViewColumn = "sidebar" | "content" | "detail";

/** The system draws the header on iOS and Android; everywhere else the app's bar does. */
const systemHeader = platform.os === "ios" || platform.os === "android";

/**
 * The split view's own surface: it fills its parent, on the page's fill, and shrinks instead of
 * forcing the columns' widths on the parent. The columns' widths stay the platform's.
 */
export function splitViewLook() {
  return {
    root: (): ViewStyle => ({
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.background,
    }),
  };
}

/**
 * A column's page. The sidebar stands on `colors.sidebar` with `colors.sidebarBorder` after it;
 * the content column stands on the page's fill with `colors.line` after it; the detail has no
 * trailing hairline. iOS draws the columns' own edges, so the hairline is omitted there. The page
 * fills the column and shrinks with it.
 */
export function splitViewColumnLook(column: SplitViewColumn) {
  const sidebar = column === "sidebar";
  return {
    page: (): ViewStyle => ({
      flex: 1,
      minWidth: 0,
      backgroundColor: sidebar ? colors.sidebar : colors.background,
      ...(platform.os === "ios" || column === "detail"
        ? {}
        : {
            borderEndWidth: 1,
            borderEndColor: sidebar ? colors.sidebarBorder : colors.line,
          }),
    }),
  };
}

/**
 * The header bar the desktops and the web draw, the gallery's page header: 44 points, the title 15
 * semibold. The sidebar's bar is the sidebar's fill, with no hairline; the others are the page's
 * fill, with `colors.line` under them.
 */
export function splitViewHeaderLook(column: SplitViewColumn = "content") {
  const sidebar = column === "sidebar";
  return {
    bar: (): ViewStyle => ({
      height: 44,
      flexShrink: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 12,
      backgroundColor: sidebar ? colors.sidebar : colors.background,
      borderBottomWidth: sidebar ? 0 : 1,
      borderBottomColor: colors.line,
    }),
    title: (): TextStyle => ({
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 0,
      minWidth: 0,
      numberOfLines: 1,
      // No type role has this size: a pane title's 15 in both tiers.
      fontSize: 15,
      fontWeight: font.weight("title"),
      color: colors.foreground,
    }),
  };
}

/**
 * The sidebar button: a 28-point target, the theme's hover and press, the keyboard's ring. The
 * glyph is `colors.mutedForeground` either way — the button's selected state says whether the
 * sidebar is showing, as the gallery's tool button does.
 */
export function splitViewTriggerLook() {
  return {
    style: (): ViewStyle => ({
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      ...rounded(radius.control),
    }),
    hoverStyle: hovered,
    activeStyle: (): ViewStyle => ({ backgroundColor: alpha(colors.foreground, 0.09) }),
    focusVisibleStyle: focusRing,
    glyph: () => ({ size: 17, tint: colors.mutedForeground }),
  };
}

/** Every prop of `nsh/base`'s SplitView. `style` goes over the look's. */
export type SplitViewProps = BaseSplitViewProps;

/**
 * The columns. Every prop of `nsh/base`'s [`SplitView`](https://nsh.dev/elements/split-view) passes
 * through; `style` goes over `splitViewLook()`. `sidebar`, `content` and `detail` are each a
 * `NavStack`, as the platform expects — the column's look is the page inside that stack
 * (`SplitViewSidebar`, `SplitViewContent`, `SplitViewDetail`).
 */
export function SplitView(props: SplitViewProps) {
  const [, rest] = split(props, ["style"]);
  const look = splitViewLook();
  return <BaseSplitView {...rest} style={[look.root(), props.style ?? null]} />;
}

/**
 * A column's page: every prop of `nsh/base`'s NavPage, plus the header's `leading` and `trailing`
 * items. On the desktops and the web those items sit in `SplitViewHeader`; on iOS and Android they
 * are the system header's `headerLeft` and `headerRight`. `header` replaces the bar.
 */
export type SplitViewColumnProps = BaseNavPageProps & {
  /** The header's leading item: a way back, or `SplitViewTrigger`. */
  leading?: JSX.Element;
  /** The header's trailing item. */
  trailing?: JSX.Element;
};

/** One column's page: the surface, the hairline, and the header for `column`. */
function columnPage(column: SplitViewColumn, props: SplitViewColumnProps) {
  const look = splitViewColumnLook(column);
  const [, rest] = split(props, [
    "leading",
    "trailing",
    "header",
    "headerStyle",
    "headerLeft",
    "headerRight",
    "style",
    "children",
  ]);
  return (
    <BaseNavPage
      {...rest}
      headerStyle={props.headerStyle ?? header.headerStyle}
      headerLeft={systemHeader ? (props.headerLeft ?? props.leading) : props.headerLeft}
      headerRight={systemHeader ? (props.headerRight ?? props.trailing) : props.headerRight}
      header={
        props.header ??
        (systemHeader ? undefined : (
          <SplitViewHeader
            column={column}
            title={props.title}
            leading={props.leading}
            trailing={props.trailing}
          />
        ))
      }
      style={[look.page(), props.style ?? null]}
    >
      {/* The page's own fill stops at the header on the desktop host. The content sits on the
          column's surface, which is what the gallery's column paints under its rows. */}
      <View style={{ flex: 1, backgroundColor: look.page().backgroundColor }}>
        {props.children}
      </View>
    </BaseNavPage>
  );
}

/** The sidebar column's page: the sidebar's fill, and a hairline after it (not on iOS). */
export function SplitViewSidebar(props: SplitViewColumnProps) {
  return columnPage("sidebar", props);
}

/** The content column's page: the page's fill, and a hairline after it (not on iOS). */
export function SplitViewContent(props: SplitViewColumnProps) {
  return columnPage("content", props);
}

/** The detail column's page: the page's fill, with no hairline after it. */
export function SplitViewDetail(props: SplitViewColumnProps) {
  return columnPage("detail", props);
}

/** The bar `SplitViewHeader` draws: its title and the items either side of it. */
export type SplitViewHeaderProps = {
  /** Which column's bar: the sidebar's has no hairline (default the content column's). */
  column?: SplitViewColumn;
  /** The page's `title`, shown in the bar on the desktops and the web. */
  title?: string;
  /** The bar's leading item. */
  leading?: JSX.Element;
  /** The bar's trailing item. */
  trailing?: JSX.Element;
};

/**
 * The column header the desktops and the web draw. iOS and Android show the system header instead,
 * which takes the page's `title`, `leading` and `trailing` itself; a column page does not draw this
 * bar there. `splitViewHeaderLook` has the words to build a different bar that matches.
 */
export function SplitViewHeader(props: SplitViewHeaderProps) {
  const look = splitViewHeaderLook(props.column ?? "content");
  const leading = props.leading;
  const trailing = props.trailing;
  return (
    <View style={look.bar()}>
      {leading}
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: leading ? 0 : 4,
        }}
      >
        <Text style={look.title()}>{props.title ?? ""}</Text>
      </View>
      {trailing}
    </View>
  );
}

/** The sidebar button. Pressing it hides the sidebar, or shows every column. */
export type SplitViewTriggerProps = {
  /**
   * Which columns show. The sidebar is showing for `"automatic"` and `"all"` (and when this is
   * left out). A press reports `"doubleColumn"` then, and `"all"` when it is hidden.
   */
  columnVisibility?: ColumnVisibility;
  /** The press chose which columns show. The app owns the value, as `SplitView` does. */
  onColumnVisibilityChange?: (event: { columnVisibility: ColumnVisibility }) => void;
  /** Runs on the press, before `onColumnVisibilityChange`. */
  onPress?: () => void;
  /** What screen readers say. Defaults to "Hide the sidebar" or "Show the sidebar". */
  accessibilityLabel?: string;
  /** Over the look's. */
  style?: StyleProp<ViewStyle>;
};

/** Whether `columnVisibility` leaves the sidebar showing beside the other columns. */
function sidebarShown(columnVisibility: ColumnVisibility | undefined) {
  return columnVisibility == null || columnVisibility === "automatic" || columnVisibility === "all";
}

/**
 * The button that hides and shows the sidebar. It does not change what the split shows: the app
 * sets `columnVisibility` from `onColumnVisibilityChange`, the same value `SplitView` takes. iOS
 * draws the system's sidebar button, so a page leaves this one out there.
 */
export function SplitViewTrigger(props: SplitViewTriggerProps) {
  const shown = () => sidebarShown(props.columnVisibility);
  const look = splitViewTriggerLook();
  const glyph = look.glyph();
  return (
    <View
      onPress={() => {
        props.onPress?.();
        props.onColumnVisibilityChange?.({
          columnVisibility: shown() ? "doubleColumn" : "all",
        });
      }}
      role="button"
      accessibilityLabel={
        props.accessibilityLabel ?? (shown() ? "Hide the sidebar" : "Show the sidebar")
      }
      accessibilityState={{ selected: shown() }}
      hitSlop={6}
      hoverStyle={look.hoverStyle()}
      activeStyle={look.activeStyle()}
      focusVisibleStyle={look.focusVisibleStyle()}
      style={[look.style(), props.style ?? null]}
    >
      <Icon icon={PanelLeft} size={glyph.size} tint={glyph.tint} />
    </View>
  );
}
