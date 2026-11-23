// An aspect ratio: a box as wide as its column and as tall as its ratio says, holding whatever is
// put in it (a picture, a chart, a color block).

import type { ViewProps, ViewStyle } from "nsh";
import { split, View } from "nsh";

/**
 * A box's width over its height: a number (`16 / 9`, `1.5`), CSS's ratio (`"16 / 9"`, `"4/3"`), or
 * the one whose height follows its content (`"auto"`).
 */
export type AspectRatioValue = NonNullable<ViewStyle["aspectRatio"]>;

/**
 * An aspect ratio's look, after shadcn/ui's (Radix's `AspectRatio`): as wide as its column, its
 * height that width over the ratio, and its content clipped to the box. Spread it on a `View` of
 * your own.
 */
export function aspectRatioLook(ratio: AspectRatioValue = 1): ViewStyle {
  return { aspectRatio: ratio, width: "100%", overflow: "hidden" };
}

/**
 * An aspect ratio's props. Besides `ratio`, every `nsh` view prop passes through (`style`,
 * `accessibilityLabel`, `onPress`, …); `style` goes over the look's — a caller's own width, corners
 * or fill replace the look's, so the box keeps its ratio inside them.
 */
export type AspectRatioProps = ViewProps & {
  /** Width over height. Default `1`, a square. */
  ratio?: AspectRatioValue;
};

/**
 * A box whose height follows its width by `ratio`, after shadcn/ui's: as wide as the column it is
 * in, its height that width divided by the ratio, its content clipped to the box. The content is
 * drawn as given — an image stretched to the box (`width: "100%"`, `height: "100%"`), a chart, a
 * color block — so a box of pictures holds the same shape on every screen.
 */
export function AspectRatio(props: AspectRatioProps) {
  const [, rest] = split(props, ["ratio", "style"]);
  return (
    <View {...rest} style={[aspectRatioLook(props.ratio), props.style ?? null]}>
      {props.children}
    </View>
  );
}
