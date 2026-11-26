// A collapsing header: a page's header, a picture behind its title, that shrinks into a bar as the
// page scrolls.

import { alpha, colors, font, stroke, surface, terminal, TERMINAL_ROW } from "@shadcn-nsh/theme";
import type { AnimatedNode, AnimatedValue, TextProps, TextStyle, ViewProps, ViewStyle } from "nsh";
import { context, reduceMotion, split, Text, View } from "nsh";

import { density } from "./lib/surface";
import { AsText } from "./lib/utils";

/** How much of the collapse the picture travels: half of it, so the header moves slower than the page. */
const PARALLAX = 0.5;

/** How big the picture is when the page is pulled a whole header past its top. */
const STRETCH = 2;

/** The collapse at which the description over the bar has faded out. */
const DESCRIPTION_FADE = 0.5;

/** How far over the bar the description's last line sits. */
const DESCRIPTION_LIFT = 2;

/** A collapsing header's heights as it draws them, and the scroll it collapses over. */
export interface CollapsingHeaderHeights {
  /** The header open. */
  open: number;
  /** The bar it collapses to. */
  bar: number;
  /** How far the page scrolls while it collapses: `open - bar`. */
  range: number;
}

/** A collapsing header's parts as the styles they wear: spread each one. */
export interface CollapsingHeaderLook {
  /**
   * The two heights the header draws itself with. A terminal has a character grid and no half
   * rows, so there the heights are whole rows of `TERMINAL_ROW` (the ones the app gave, rounded),
   * and the bar is never taller than the header.
   */
  heights(expandedHeight: number, collapsedHeight: number): CollapsingHeaderHeights;
  /**
   * The frame: sticky in its scroll view so the page slides under it, its picture's room and no
   * more than that, clipped, on the accent surface with the theme's inset edge under it.
   */
  root(heights: CollapsingHeaderHeights): ViewStyle;
  /**
   * The picture behind the title: `PARALLAX` of the collapse as it travels, `STRETCH` times its
   * size when the page is pulled past its top, all of it anchored at its bottom edge. Still with
   * reduced motion.
   */
  backdrop(scroll: AnimatedValue, heights: CollapsingHeaderHeights): ViewStyle;
  /** The surface that closes over the picture: the header's own fill, opaque at the bar. */
  cover(collapsed: AnimatedNode): ViewStyle;
  /** The line over the bar: it sits `DESCRIPTION_LIFT` points above it and fades out over the
   * first `DESCRIPTION_FADE` of the collapse. */
  description(collapsed: AnimatedNode, heights: CollapsingHeaderHeights): ViewStyle;
  /** The description's type: the detail's size, the label's weight, in the ink at two thirds. */
  descriptionText(): TextStyle;
  /** The bar: the header's foot, its content a row, the page's gutter either side. */
  bar(heights: CollapsingHeaderHeights): ViewStyle;
  /** The class that keeps the title's scale at the edge it reads from: the left one, or the right
   * one in a right-to-left layout. */
  readonly titleClass: string;
  /** The title: the display's size open, scaled down to the label's as the header collapses (no
   * scale in a terminal, where the size is the grid's). */
  title(collapsed: AnimatedNode): TextStyle;
  /** The ink of what stands on the header: the title, the description, and the picture's own
   * strokes. */
  ink(): string;
}

/** A height in whole terminal rows: the character grid has no half rows. */
function wholeRows(points: number): number {
  return Math.max(TERMINAL_ROW, Math.round(points / TERMINAL_ROW) * TERMINAL_ROW);
}

/**
 * A collapsing header's look: the accent's fill (`finish.accent`) as the page's header, its picture
 * travelling at half the scroll and stretching on over-scroll, a surface of the same fill closing
 * over it, the title the page's display size shrinking to a bar's, and a description just over the
 * bar fading out as the title comes down.
 *
 * Everything is an animated style: `collapsed` (0 open, 1 at the bar) comes from the scroll view's
 * value through `interpolate`, so the header moves on the UI thread and the app runs no code per
 * frame. With reduced motion the picture stands still; a terminal draws whole rows and no picture.
 */
export function collapsingHeaderLook(): CollapsingHeaderLook {
  const ink = (): string => surface("accent").ink;
  return {
    heights: (expandedHeight: number, collapsedHeight: number): CollapsingHeaderHeights => {
      const open = terminal ? wholeRows(expandedHeight) : expandedHeight;
      const bar = Math.min(terminal ? wholeRows(collapsedHeight) : collapsedHeight, open);
      return { open, bar, range: open - bar };
    },
    root: (heights: CollapsingHeaderHeights): ViewStyle => ({
      position: "sticky",
      top: -heights.range,
      height: heights.open,
      overflow: "hidden",
      ...surface("accent").style,
      borderBottomWidth: stroke.hairline,
    }),
    backdrop: (scroll: AnimatedValue, heights: CollapsingHeaderHeights): ViewStyle => ({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: heights.open,
      transformOrigin: "center bottom",
      transform: reduceMotion()
        ? undefined
        : [
            {
              translateY: scroll.interpolate({
                inputRange: [0, heights.range],
                outputRange: [0, heights.range * PARALLAX],
              }),
            },
            {
              scale: scroll.interpolate({
                inputRange: [-heights.open, 0],
                outputRange: [STRETCH, 1],
              }),
            },
          ],
    }),
    cover: (collapsed: AnimatedNode): ViewStyle => ({
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.primary,
      opacity: collapsed,
    }),
    description: (collapsed: AnimatedNode, heights: CollapsingHeaderHeights): ViewStyle => ({
      position: "absolute",
      start: density.pad,
      end: density.pad,
      bottom: heights.bar - DESCRIPTION_LIFT,
      opacity: collapsed.interpolate({
        inputRange: [0, DESCRIPTION_FADE],
        outputRange: [1, 0],
      }),
    }),
    descriptionText: (): TextStyle => ({
      fontSize: font.size("detail"),
      fontWeight: font.weight("label"),
      color: alpha(ink(), 0.62),
      numberOfLines: 1,
    }),
    bar: (heights: CollapsingHeaderHeights): ViewStyle => ({
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: heights.bar,
      flexDirection: "row",
      alignItems: "center",
      gap: density.gap,
      paddingHorizontal: density.pad,
    }),
    // The title shrinks toward the edge it starts at, as a bar's title stands.
    titleClass: "origin-left rtl:origin-right",
    title: (collapsed: AnimatedNode): TextStyle => ({
      flexGrow: 1,
      flexShrink: 1,
      fontSize: terminal ? undefined : font.size("display"),
      fontWeight: font.weight("display"),
      letterSpacing: font.letterSpacing("display"),
      color: ink(),
      numberOfLines: 1,
      scale: terminal
        ? 1
        : collapsed.interpolate({
            inputRange: [0, 1],
            outputRange: [1, font.size("label") / font.size("display")],
          }),
    }),
    ink,
  };
}

/**
 * A collapsing header's props. Besides these, every `nsh` view prop passes through; `style` goes
 * over the look's.
 */
export type CollapsingHeaderProps = ViewProps & {
  /** The `AnimatedValue` the page's scroll view feeds through `scrollValue`: the header collapses
   * over the first `expandedHeight - collapsedHeight` points of it. */
  scroll: AnimatedValue;
  /** How tall the header is open, in points: the room its picture keeps. Read once, when the
   * header is made. */
  expandedHeight: number;
  /** The height of the bar it collapses to: where the title comes to rest and where the page's
   * headings stick. Read once, when the header is made. */
  collapsedHeight: number;
};

/** What the parts under a header read. */
interface CollapsingHeaderState {
  scroll: AnimatedValue;
  heights: CollapsingHeaderHeights;
  /** 0 open, 1 at the bar. */
  collapsed: AnimatedNode;
}

const CollapsingHeaderContext = context<CollapsingHeaderState | null>(null);

/** The state the parts under a header wear. */
function collapsingHeaderState(): CollapsingHeaderState {
  const state = CollapsingHeaderContext();
  if (!state) throw new Error("CollapsingHeader parts must be used within <CollapsingHeader>");
  return state;
}

/**
 * A page's header that collapses to a bar as the page scrolls, after the gallery's scene: the
 * picture behind the title travels at half the scroll and stretches when the page is pulled past
 * its top, a surface of the header's fill closes over it, the title shrinks into the bar, and a
 * description over the bar fades out. All of it an animated style, so no code of the app's runs
 * per frame; the scroll link is `nsh`'s (`scrollValue`, `interpolate`).
 *
 * Put it first in the scroll view it follows, and give that scroll view the same value:
 *
 * ```tsx
 * const scroll = createAnimatedValue(0);
 * <Scroll scrollValue={scroll}>
 *   <CollapsingHeader scroll={scroll} expandedHeight={220} collapsedHeight={56}>
 *     <CollapsingHeaderBackdrop>{picture}</CollapsingHeaderBackdrop>
 *     <CollapsingHeaderDescription>160 entries, by week</CollapsingHeaderDescription>
 *     <CollapsingHeaderBar>
 *       <CollapsingHeaderTitle>Recent</CollapsingHeaderTitle>
 *     </CollapsingHeaderBar>
 *   </CollapsingHeader>
 *   {page}
 * </Scroll>;
 * ```
 *
 * The header keeps the page's room for the bar: a list under it sticks its headings below the bar
 * with `stickyHeaderOffset`.
 */
export function CollapsingHeader(props: CollapsingHeaderProps) {
  const [mine, rest] = split(props, ["scroll", "expandedHeight", "collapsedHeight", "style"]);
  const look = collapsingHeaderLook();
  const heights = look.heights(mine.expandedHeight, mine.collapsedHeight);
  const collapsed = mine.scroll.interpolate({
    inputRange: [0, Math.max(1, heights.range)],
    outputRange: [0, 1],
  });
  return (
    <CollapsingHeaderContext.Provider value={{ scroll: mine.scroll, heights, collapsed }}>
      <View {...rest} style={[look.root(heights), mine.style ?? null]}>
        {props.children}
      </View>
    </CollapsingHeaderContext.Provider>
  );
}

/**
 * The header's backdrop: the picture behind the title, and the surface of the header's fill that
 * fades in over it as the header collapses. The picture moves and stretches as the page scrolls;
 * draw it in `collapsingHeaderLook().ink()`, or in a color of the app's that reads on the accent.
 * A terminal draws no picture (nothing is drawn, and the space is the header's own).
 */
export function CollapsingHeaderBackdrop(props: ViewProps) {
  const state = collapsingHeaderState();
  const look = collapsingHeaderLook();
  const [, rest] = split(props, ["style"]);
  if (terminal) return null;
  return (
    <>
      <View {...rest} style={[look.backdrop(state.scroll, state.heights), props.style ?? null]}>
        {props.children}
      </View>
      <View style={look.cover(state.collapsed)} />
    </>
  );
}

/**
 * The line over the bar: a count, a subtitle, anything that says what the page holds. A string is
 * drawn in the look's type and ink; anything else is laid out as given. It fades out over the
 * first half of the collapse, and is gone by the time the bar stands on its own.
 */
export function CollapsingHeaderDescription(props: ViewProps) {
  const state = collapsingHeaderState();
  const look = collapsingHeaderLook();
  const [, rest] = split(props, ["style", "children"]);
  return (
    <View {...rest} style={[look.description(state.collapsed, state.heights), props.style ?? null]}>
      <AsText style={look.descriptionText()}>{props.children}</AsText>
    </View>
  );
}

/**
 * The bar the header collapses to: a row at its foot, `collapsedHeight` points tall, the page's
 * gutter either side. The title comes to rest in it, and so does whatever stays in reach of the
 * page — an action, a search button. Its content is centered in the bar, so it does not move as
 * the header collapses.
 */
export function CollapsingHeaderBar(props: ViewProps) {
  const state = collapsingHeaderState();
  const look = collapsingHeaderLook();
  const [, rest] = split(props, ["style"]);
  return (
    <View {...rest} style={[look.bar(state.heights), props.style ?? null]}>
      {props.children}
    </View>
  );
}

/**
 * The header's title: the page's display size while the header is open, shrinking to the size of a
 * bar's title as it collapses, its scale anchored at the edge it starts at. It takes the room the
 * bar's other content leaves (`flexGrow`), and stays on one line.
 */
export function CollapsingHeaderTitle(props: TextProps) {
  const state = collapsingHeaderState();
  const look = collapsingHeaderLook();
  const [mine, rest] = split(props, ["style", "class"]);
  return (
    <Text
      {...rest}
      class={mine.class ? `${look.titleClass} ${mine.class}` : look.titleClass}
      style={[look.title(state.collapsed), mine.style ?? null]}
    >
      {props.children}
    </Text>
  );
}
