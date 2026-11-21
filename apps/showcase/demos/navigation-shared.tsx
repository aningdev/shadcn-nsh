import { animate, colors, focusRing, motion, rounded, shape } from "@shadcn-nsh/theme";
// The Navigation batch's shared bits (its files alone): the platform's line of a hint, the caption
// row, the labeled switch a card's trailing edge shows, the settle an entrance animates with, and
// the header bar the pages of a stack draw where the app draws headers (the desktops, the web) —
// slots of its own around the back button the page hands it (`NavPageSlot`), which is what an app's
// header answers a press with. Colors come from the theme only, never a literal.
import { ChevronLeft, type IconNode } from "lucide";
import type { JSX, ViewStyle } from "nsh";
import { createAnimatedValue, effect, platform, reduceMotion, Text, View } from "nsh";
import type { AnimatedValue } from "nsh";

import { Icon } from "@/packages/ui/lib/icons";
import type { NavPageSlot } from "@/packages/ui/nav-stack";
import { Switch } from "@/packages/ui/switch";

/** The device's input: `touch` on phones and tablets, `pointer` on desktops. */
export const hint = (touch: string, pointer: string) => (platform.desktop ? pointer : touch);

/** Springs to 1 each time `key` changes (`motion.control`), so a block that re-appears settles
 * in; lands at once with reduced motion. */
export function settleOn(key: () => unknown): AnimatedValue {
  const t = createAnimatedValue(1);
  let shown = key();
  effect(() => {
    const next = key();
    if (next === shown) return;
    shown = next;
    if (reduceMotion()) return;
    t.set(0);
    void animate(t, 1, motion.control);
  });
  return t;
}

/** Content that settles in with `settleOn`'s value: it fades in and drops a few points into
 * place. */
export const settle = (t: AnimatedValue): ViewStyle => ({
  opacity: t,
  transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) }],
});

/** A caption row, as the official scenes end their cards: a label on the left, a quieter note on
 * the right. */
export function CaptionRow(props: { label: string; note?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
      <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      <If when={props.note}>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          {props.note}
        </Text>
      </If>
    </View>
  );
}

/** A switch with its label before it, for a section head's trailing edge ("Intercept", "Offline",
 * "Lock"). The switch carries the label for screen readers. */
export function LabeledToggle(props: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Switch
      accessibilityLabel={props.label}
      checked={props.value}
      onChange={({ checked }) => props.onChange(checked)}
      class="flex-row items-center gap-2"
    >
      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.label}</Text>
    </Switch>
  );
}

/** A header bar's glyph: 18 points, the theme's accent. */
const glyph = (tint: string) => ({ icon: ChevronLeft as IconNode, size: 18, tint });

/**
 * The header bar a page of a stack draws where the app draws headers (the desktops, the web;
 * phones take the system header instead): a back button while the page is above another, the
 * title — or whatever `center` replaces it with — and a trailing slot, on one row 44 points tall.
 * `background` replaces the bar's fill (a tinted header); `transparent` floats it over the
 * content with neither fill nor hairline.
 *
 * It is given the page it heads (`NavPage`'s `header` takes a function of it): Back shows while the
 * stack is above the first page and leaves the page the way the shell's own header does —
 * `onBackPress` first, then the pop `popOnBack` allows. `onBack` replaces that press where the
 * scene has its own.
 */
export function PageBar(props: {
  /** The page it heads: `NavPage` hands its `header` this. */
  page?: NavPageSlot;
  title?: string;
  /** What back does, over the page's own; leave it out and the page's runs. */
  onBack?: () => void;
  /** Replaces the back button. */
  left?: JSX.Element;
  /** Replaces the title. */
  center?: JSX.Element;
  right?: JSX.Element;
  /** The bar's fill, over the page's. */
  background?: string;
  /** The back button's color (the text's by default). */
  tint?: string;
  /** Over the content: no fill, no hairline. */
  transparent?: boolean;
}) {
  const page = props.page;
  const onBack = () => props.onBack ?? page?.back;
  /** Whether the bar offers Back: a press to answer, and a page to leave (or a press of its own). */
  const canGoBack = () => onBack() != null && (props.onBack != null || (page?.pages() ?? 1) > 1);
  const tint = () => props.tint ?? colors.foreground;
  const fill = () => (props.transparent ? "transparent" : (props.background ?? colors.background));
  return (
    <View
      style={{
        height: 44,
        flexShrink: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        backgroundColor: fill(),
        borderBottomWidth: props.transparent || props.background ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      {props.left}
      <If when={!props.left && canGoBack()}>
        <View
          onPress={() => onBack()?.()}
          role="button"
          accessibilityLabel="Back"
          hitSlop={6}
          class="hover:bg-hover active:bg-accent"
          focusVisibleStyle={focusRing()}
          style={{
            height: 28,
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            paddingLeft: 4,
            paddingRight: 8,
            ...rounded(shape.control),
          }}
        >
          <Icon {...glyph(tint())} />
          <Text style={{ fontSize: 13, fontWeight: "500", color: tint() }}>Back</Text>
        </View>
      </If>
      <View
        style={{
          flex: 1,
          minWidth: 0,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: props.left || canGoBack() ? 0 : 4,
        }}
      >
        {props.center ?? (
          <Text
            style={{
              numberOfLines: 1,
              flex: 1,
              fontSize: 15,
              fontWeight: "600",
              color: props.background || props.transparent ? tint() : colors.foreground,
            }}
          >
            {props.title ?? ""}
          </Text>
        )}
      </View>
      {props.right}
    </View>
  );
}
