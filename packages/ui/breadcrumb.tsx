// A breadcrumb: the path from where the app starts to the page it shows, as a row of links a
// separator parts, the page itself last.

import { colors, focusRing, font, rounded, shape, terminal } from "@shadcn-nsh/theme";
import { ChevronRight, Ellipsis } from "lucide";
import type { JSX, TextProps, TextStyle, ViewProps, ViewStyle } from "nsh";
import { platform, split, Text, View } from "nsh";
import { Link as BaseLink, type LinkProps as BaseLinkProps } from "nsh/base";

import { Icon } from "./lib/icons";
import { AsText, joinClass } from "./lib/utils";

/**
 * The breadcrumb's props. Besides a default name for the landmark, every `nsh` view prop passes
 * through (`style`, `role`, …); `style` goes over the look's. The content is the `BreadcrumbList`
 * and its steps.
 */
export type BreadcrumbProps = ViewProps & {
  /** What screen readers call the trail. Default `"Breadcrumb"`. */
  accessibilityLabel?: string;
};

/**
 * The trail's steps: a wrapping row. Every `nsh` view prop passes through; `style` goes over the
 * look's. No `role="list"`: `nsh` has no `listitem` role, so the steps could not be its items and
 * a list without items is worse for a screen reader than a plain row (`ItemGroup` makes the same
 * call).
 */
export type BreadcrumbListProps = ViewProps;

/** One step of the trail. Every `nsh` view prop passes through; `style` goes over the look's. */
export type BreadcrumbItemProps = ViewProps;

/**
 * A step of the trail that goes somewhere: `nsh/base`'s Link in the breadcrumb's look. It is not
 * this library's `Link` (`link.tsx`): that one is the underlined text link, in the accent color,
 * with the bar that grows under the pointer; a step here is quiet and underline-free until the
 * pointer rests on it, as shadcn's. Every `nsh/base` Link prop passes through (`href`,
 * `openWith`, `onOpen`, `onPress`, `disabled`, `hitSlop`, …); style props go over the look's.
 */
export type BreadcrumbLinkProps = Omit<BaseLinkProps, "children"> & {
  /** A string is the step's name; anything else (an icon, a row of views) is drawn as given. A
   * string name is also the link's name for screen readers unless `accessibilityLabel` says
   * otherwise. */
  children?: string | JSX.Element;
};

/**
 * The page the trail ends at: the text color, not a link. Every `nsh` Text prop passes through;
 * `style` goes over the look's. `accessibilityState.current` is `"page"` unless the caller says
 * otherwise, so screen readers announce it as where they are (ARIA's `aria-current="page"`).
 */
export type BreadcrumbPageProps = TextProps;

/**
 * What parts one step from the next: a chevron, or the children given instead. Every `nsh` view
 * prop passes through; `style` goes over the look's. It is decoration — hidden from screen readers,
 * as shadcn's is — so a trail is read as its steps.
 */
export type BreadcrumbSeparatorProps = Omit<ViewProps, "children"> & {
  /** A separator of the caller's own (a slash, a dot) instead of the chevron. In a terminal it is
   * drawn as given too: an icon shows nothing there. */
  children?: JSX.Element;
};

/**
 * The mark of the steps the trail leaves out. Every `nsh` view prop passes through (`onPress`,
 * `role`, …), so an app that opens a menu from it passes its trigger's props; `style` goes over
 * the look's. It is named `"More"` by default, unlike shadcn's, which hides it: a native screen
 * reader walking the trail then says the steps were left out rather than jumping from one name to
 * the next.
 */
export type BreadcrumbEllipsisProps = Omit<ViewProps, "children"> & {
  /** What screen readers say of it. Default `"More"`. */
  accessibilityLabel?: string;
};

/**
 * A breadcrumb, after shadcn/ui's: the trail from the app's root to the page shown, a row of links
 * a chevron parts, wrapping when it does not fit. A landmark (`role="navigation"`) named
 * `"Breadcrumb"` by default, so screen reader users can jump to it.
 */
export function Breadcrumb(props: BreadcrumbProps) {
  const [, rest] = split(props, ["accessibilityLabel", "class", "classList", "style", "children"]);
  return (
    <View
      role="navigation"
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "Breadcrumb"}
      class={props.class}
      classList={props.classList}
      style={[breadcrumbLook().root, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** The trail's steps side by side, a gap apart, wrapping onto a second line when narrow. */
export function BreadcrumbList(props: BreadcrumbListProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[breadcrumbLook().list, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** One step: its link or page, and the separator after it. */
export function BreadcrumbItem(props: BreadcrumbItemProps) {
  const [, rest] = split(props, ["class", "classList", "style", "children"]);
  return (
    <View
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[breadcrumbLook().item, props.style ?? null]}
    >
      {props.children}
    </View>
  );
}

/** A step that goes somewhere: quiet in the muted ink, the text color under the pointer. */
export function BreadcrumbLink(props: BreadcrumbLinkProps) {
  const [, rest] = split(props, ["children", "class", "classList", "style", "focusVisibleStyle"]);
  return (
    <BaseLink
      {...rest}
      class={joinClass(breadcrumbLook().linkClass, props.class)}
      classList={props.classList}
      style={[breadcrumbLook().link, props.style ?? null]}
      focusVisibleStyle={[breadcrumbLook().focusVisible, props.focusVisibleStyle ?? null]}
    >
      <AsText class={breadcrumbLook().linkTextClass} style={breadcrumbLook().linkText}>
        {props.children}
      </AsText>
    </BaseLink>
  );
}

/** The page the trail ends at, in the text color, announced as the current one. */
export function BreadcrumbPage(props: BreadcrumbPageProps) {
  const [, rest] = split(props, ["class", "classList", "style", "accessibilityState", "children"]);
  return (
    <Text
      {...rest}
      accessibilityState={{ current: "page", ...props.accessibilityState }}
      class={props.class}
      classList={props.classList}
      style={[breadcrumbLook().page, props.style ?? null]}
    >
      {props.children}
    </Text>
  );
}

/** What parts one step from the next: a chevron, or the children given instead. */
export function BreadcrumbSeparator(props: BreadcrumbSeparatorProps) {
  const [, rest] = split(props, ["children", "class", "classList", "style"]);
  return (
    <View
      role="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...rest}
      class={props.class}
      classList={props.classList}
      style={[breadcrumbLook().separator, props.style ?? null]}
    >
      {props.children ?? (terminal ? terminalSeparator() : separatorIcon())}
    </View>
  );
}

/** The mark of the steps the trail leaves out: an ellipsis, named `"More"`. */
export function BreadcrumbEllipsis(props: BreadcrumbEllipsisProps) {
  const [, rest] = split(props, ["accessibilityLabel", "class", "classList", "style"]);
  return (
    <View
      accessible
      {...rest}
      accessibilityLabel={props.accessibilityLabel ?? "More"}
      class={props.class}
      classList={props.classList}
      style={[breadcrumbLook().ellipsis, props.style ?? null]}
    >
      {terminal ? terminalEllipsis() : ellipsisIcon()}
    </View>
  );
}

// Shared breadcrumb primitives
// Gallery reads `breadcrumbLook`.

/** A breadcrumb's parts as the styles and classes they wear: spread each one onto the part that
 * matches its name (`breadcrumbLook().list` on `BreadcrumbList`, and so on). */
export interface BreadcrumbLook {
  /** The trail's root (`Breadcrumb`): as wide as its steps, not as wide as the column it is in. */
  readonly root: ViewStyle;
  /** The trail (`BreadcrumbList`): a row of steps, a gap apart, wrapping when the window is
   * narrow. */
  readonly list: ViewStyle;
  /** One step (`BreadcrumbItem`): its link or page and the separator after it. */
  readonly item: ViewStyle;
  /** A step's link (`BreadcrumbLink`): the `group` its label follows, its corners rounding the
   * keyboard's ring. */
  readonly linkClass: string;
  /** A step's link: the same corners, in the theme's control radius. */
  readonly link: ViewStyle;
  /** A step's link with the keyboard on it: the theme's focus ring. */
  readonly focusVisible: ViewStyle;
  /** A step's label (`BreadcrumbLink`'s text): the muted ink, the text color while the pointer is
   * on the link, fading in at the class's `fade`. */
  readonly linkTextClass: string;
  /** A step's label: small and medium, its size the trail's. */
  readonly linkText: TextStyle;
  /** The page shown (`BreadcrumbPage`): the text color, where the trail ends. */
  readonly page: TextStyle;
  /** A separator (`BreadcrumbSeparator`): the chevron's box, never shrunk by a tight row. */
  readonly separator: ViewStyle;
  /** A separator's chevron, in the muted ink. */
  readonly separatorIcon: { size: number; tint: string };
  /** A separator in the terminal, which draws no icons: `›` in the muted ink. */
  readonly separatorGlyph: TextStyle;
  /** The ellipsis (`BreadcrumbEllipsis`): a square that centers its mark. */
  readonly ellipsis: ViewStyle;
  /** The ellipsis's mark, in the muted ink. */
  readonly ellipsisIcon: { size: number; tint: string };
  /** The ellipsis in the terminal, which draws no icons: `…` in the muted ink. */
  readonly ellipsisGlyph: TextStyle;
}

/**
 * A breadcrumb's look, after shadcn/ui's: the trail a row of small muted steps, 6 points apart (10
 * on a touch screen) and wrapping, each step its link and a 14-point chevron; the link takes the
 * text color while the pointer rests on it and the theme's focus ring with the keyboard on it; the
 * page it ends at is in the text color. In a terminal the chevron and the ellipsis are their
 * marks (`›`, `…`), since a terminal draws no icons.
 */
export function breadcrumbLook(): BreadcrumbLook {
  return {
    get root(): ViewStyle {
      return { alignSelf: "flex-start", maxWidth: "100%" };
    },
    get list(): ViewStyle {
      return {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: stepGap,
      };
    },
    get item(): ViewStyle {
      return { flexDirection: "row", alignItems: "center", gap: partGap };
    },
    get linkClass(): string {
      return `group ${fade}`;
    },
    get link(): ViewStyle {
      return { ...rounded(shape.control) };
    },
    get focusVisible(): ViewStyle {
      return focusRing(2);
    },
    get linkTextClass(): string {
      return `text-muted-foreground group-hover:text-foreground ${fade}`;
    },
    get linkText(): TextStyle {
      return { fontSize: font.size("body"), fontWeight: font.weight("label"), numberOfLines: 1 };
    },
    get page(): TextStyle {
      return {
        fontSize: font.size("body"),
        fontWeight: font.weight("body"),
        color: colors.foreground,
        numberOfLines: 1,
      };
    },
    get separator(): ViewStyle {
      return {
        flexShrink: 0,
        width: terminal ? undefined : chevronSide,
        height: terminal ? undefined : chevronSide,
        alignItems: "center",
        justifyContent: "center",
      };
    },
    get separatorIcon() {
      return { size: chevronSide, tint: colors.mutedForeground };
    },
    get separatorGlyph(): TextStyle {
      return { fontSize: font.size("body"), color: colors.mutedForeground };
    },
    get ellipsis(): ViewStyle {
      return {
        width: ellipsisSide,
        height: ellipsisSide,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      };
    },
    get ellipsisIcon() {
      return { size: ellipsisMark, tint: colors.mutedForeground };
    },
    get ellipsisGlyph(): TextStyle {
      return { fontSize: font.size("body"), color: colors.mutedForeground };
    },
  };
}

// Private helpers & looks

/** A pointer's compact trail; a touch screen's roomier one, a finger's target in each step. */
const pointer = platform.desktop;

/** The gap between two steps: 6 points with a pointer, 10 on a touch screen (shadcn's `gap-1.5`,
 * `sm:gap-2.5`). */
const stepGap = pointer ? 6 : 10;

/** The gap inside a step, between its link and the separator after it (shadcn's `gap-1.5`). */
const partGap = 6;

/** The side of a separator's chevron: 14 points, shadcn's `size-3.5`. */
const chevronSide = 14;

/** The side of the ellipsis's box: 36 points, shadcn's `size-9` (a menu trigger's room). */
const ellipsisSide = 36;

/** The side of the ellipsis's mark: 16 points, shadcn's `size-4`. */
const ellipsisMark = 16;

/** A color fade that stands still with reduced motion. */
const fade = "transition-colors duration-150 motion-reduce:transition-none";

function separatorIcon() {
  return (
    <Icon
      icon={ChevronRight}
      size={breadcrumbLook().separatorIcon.size}
      tint={breadcrumbLook().separatorIcon.tint}
    />
  );
}

function ellipsisIcon() {
  return (
    <Icon
      icon={Ellipsis}
      size={breadcrumbLook().ellipsisIcon.size}
      tint={breadcrumbLook().ellipsisIcon.tint}
    />
  );
}

// Terminal

/** A separator where a terminal draws no icons: `›` in the muted ink. */
function terminalSeparator() {
  return <Text style={breadcrumbLook().separatorGlyph}>{`›`}</Text>;
}

/** An ellipsis where a terminal draws no icons: `…` in the muted ink. */
function terminalEllipsis() {
  return <Text style={breadcrumbLook().ellipsisGlyph}>{`…`}</Text>;
}
