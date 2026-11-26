// What the two apps of the Apps group share: the width the demo draws into, and the shell pieces
// the gallery keeps in its own `ui.tsx` (an entering block, an icon tile, a caps label). Nothing
// here belongs to a component: it is the scene's, drawn over this library's theme.
import { surface, alpha, colors, motion, terminal } from "@shadcn-nsh/theme";
import type { IconNode } from "lucide";
import { computed, createAnimatedValue, pixelRatio, platform, View, windowSize } from "nsh";
import type { JSX, TextStyle, ViewStyle } from "nsh";

import { Icon } from "@/packages/ui/lib/icons";

/** The column the shell shows beside a demo on a desktop (`SidebarProvider`'s width). */
const SIDEBAR = 256;

/**
 * A desktop: the shell shows its sidebar and a demo gets the rest. Read it where it decides a
 * layout, so a resize redraws.
 */
export const desktop = computed(() => windowSize().width >= (platform.desktop ? 700 : 900));

/** The width the demo draws into: the window less the sidebar while the shell shows one. */
export const paneWidth = () => windowSize().width - (desktop() ? SIDEBAR : 0);

/** One device pixel, in points (reading it in a binding follows the screen). */
export const hairline = () => 1 / pixelRatio();

/**
 * Fades and lifts its content in once mounted; `index` staggers siblings (40 ms apart). `flex` lets
 * it wrap a page that fills its parent.
 */
export function Appear(props: { index?: number; flex?: boolean; children: JSX.Element }) {
  const t = createAnimatedValue(0);
  void t.timing(1, {
    duration: motion.slow.duration,
    easing: motion.slow.timingFunction,
    delay: Math.min(8, props.index ?? 0) * 40,
  });
  return (
    <View
      style={{
        flex: props.flex ? 1 : undefined,
        opacity: t,
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {props.children}
    </View>
  );
}

/** A rounded icon tile (decoration: none in the terminal). */
export function IconTile(props: { icon: IconNode; tint?: string; size?: number }) {
  if (terminal) return null;
  const size = props.size ?? 40;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...surface("raised").style,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon icon={props.icon} size={size * 0.5} tint={props.tint ?? colors.foreground} />
    </View>
  );
}

/** The modal scrim (`backdropStyle` of an overlay): the window dimmed behind a card. */
export const backdrop = (): ViewStyle => ({ backgroundColor: alpha(colors.background, 0.72) });

/** A quiet label over a group of rows ("CONVERSATIONS"): 11 points, spaced caps. */
export const capLabel = (): TextStyle => ({
  fontSize: 11,
  fontWeight: "600",
  color: colors.faint,
  letterSpacing: 0.6,
});
