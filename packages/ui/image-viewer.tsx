// An image viewer: one image full screen over the media ground, fitted, pinched, panned and
// swiped away. This library's own (drawn on `nsh`'s View, Text and Image, over `Dialog` as a
// page), so there is no port region. Yours to change.
import { alpha, animate, colors, font, motion } from "@shadcn-nsh/theme";
import { X } from "lucide";
import type { TextStyle, ViewStyle } from "nsh";
import {
  createAnimatedValue,
  effect,
  Image,
  safeArea,
  signal,
  split,
  Text,
  untracked,
  View,
} from "nsh";

import { IconButton } from "./button";
import { Dialog, DialogContent, dialogPage, type DialogContentProps } from "./dialog";
import { Icon } from "./lib/icons";
import { backdrop } from "./lib/popup";

/** The image a viewer shows: what `TextView`'s `onImagePress` reports. */
export type ImageViewerImage = {
  /** The image's address. */
  src: string;
  /** What the image shows: it names the image for screen readers and is the caption. */
  alt?: string;
};

/** An image viewer's parts as the styles they wear: spread each one. */
export interface ImageViewerLook {
  /** The dialog itself: a page with no ground of its own (the ground is `ground()`). */
  page(): ViewStyle;
  /** The ground the image sits on: the theme's `media` ground, filling the window. */
  ground(): ViewStyle;
  /** The caption's strip along the bottom, under the safe area, over a scrim of its own. */
  caption(): ViewStyle;
  /** The caption's type: `on-media` ink, centered, in the theme's `body` role. */
  captionText(): TextStyle;
  /** The close button's place: the top end, under the safe area. */
  closeCorner(): ViewStyle;
  /** The close button's chip: a faint `on-media` wash. */
  close(): ViewStyle;
  /** The close button's chip under the pointer. */
  closeHover(): ViewStyle;
}

/**
 * An image viewer's look: the dialog as a page on the theme's `media` ground, which is dark in
 * either appearance, with the ink `on-media` on it; the caption and the close chip carry a wash of
 * that ink so they read over any photograph.
 */
export function imageViewerLook(): ImageViewerLook {
  return {
    page: () => ({ ...dialogPage(), backgroundColor: "transparent" }),
    ground: () => ({
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.media,
    }),
    caption: () => ({
      pointerEvents: "none",
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: safeArea().bottom + 20,
      ...backdrop(),
    }),
    captionText: () => ({
      fontSize: font.size("body"),
      lineHeight: font.line("body"),
      textAlign: "center",
      color: colors.onMedia,
    }),
    closeCorner: () => ({
      position: "absolute",
      top: safeArea().top + 12,
      end: safeArea().right + 12,
    }),
    close: () => ({ borderRadius: 999, backgroundColor: alpha(colors.onMedia, 0.16) }),
    closeHover: () => ({ backgroundColor: alpha(colors.onMedia, 0.28) }),
  };
}

/** The deepest zoom, and where a double tap zooms in to. */
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
/** Two taps this close in time (ms) are a double tap. */
const DOUBLE_TAP_MS = 300;
/** A drag this far down (points) at 1× closes the viewer. */
const SWIPE_CLOSE = 120;

const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, value));

/**
 * An image viewer's props: `image` and `onClose`; apart from those, every prop of
 * `DialogContent` but its card's (`width`, `scroll`) passes through.
 */
export type ImageViewerProps = Omit<DialogContentProps, "children" | "scroll" | "width"> & {
  /** The image to show; the viewer is open while it is set. */
  image: ImageViewerImage | null;
  /**
   * Called when the viewer asks to close: the close button, Escape, the back button, a press on
   * the ground, a swipe down. Set `image` to `null` there.
   */
  onClose: () => void;
};

/**
 * A full-screen viewer for one image, open while `image` is set (an `onImagePress` of `TextView`
 * reports one): the image fitted over the media ground, fading and growing in. Pinch (two
 * fingers, a touchpad, or Ctrl / Cmd + wheel) zooms up to 4×, a double tap or click toggles 2.5×
 * at the point, a drag pans the zoomed image, and at 1× a drag down closes it. The `alt` text is
 * the caption.
 *
 * The gestures run natively (`pinch` and `pan` drive animated values on the UI thread); JS only
 * settles the result into bounds when one ends. The image stays while the dialog fades out.
 */
export function ImageViewer(props: ImageViewerProps) {
  const [, rest] = split(props, ["image", "onClose", "style", "animation"]);
  const look = imageViewerLook();
  const shown = signal<ImageViewerImage | null>(null);
  const natural = signal<{ width: number; height: number } | null>(null);
  const viewport = signal({ width: 0, height: 0 });
  const scale = createAnimatedValue(1);
  const x = createAnimatedValue(0);
  const y = createAnimatedValue(0);
  const enter = createAnimatedValue(0);
  // Where the animated values settle, the gestures' starting points. Signals, so a handler can
  // write them after render.
  const atScale = signal(1);
  const atX = signal(0);
  const atY = signal(0);
  const lastTap = signal(0);
  const tapX = signal(0);
  const tapY = signal(0);
  const tapAt = signal(0);
  const src = signal("");

  effect(() => {
    const image = props.image;
    if (!image) return;
    if (image.src !== untracked(src)) natural.set(null);
    src.set(image.src);
    shown.set(image);
    atScale.set(1);
    atX.set(0);
    atY.set(0);
    scale.set(1);
    x.set(0);
    y.set(0);
    enter.set(0);
    void animate(enter, 1, motion.settle);
  });

  /** The image's box at 1×: its aspect ratio fitted into the viewport. */
  const box = () => {
    const v = viewport();
    const n = natural();
    if (!n || !n.width || !n.height || !v.width) return v;
    const k = Math.min(v.width / n.width, v.height / n.height);
    return { width: n.width * k, height: n.height * k };
  };

  /** Springs to `next`, within the zoom limits and the image's edges. */
  const settle = (next: { scale: number; x: number; y: number }) => {
    const s = Math.max(1, Math.min(MAX_ZOOM, next.scale));
    const b = box();
    const v = viewport();
    const nextX = clamp(next.x, Math.max(0, (b.width * s - v.width) / 2));
    const nextY = clamp(next.y, Math.max(0, (b.height * s - v.height) / 2));
    atScale.set(s);
    atX.set(nextX);
    atY.set(nextY);
    void animate(scale, s, motion.settle);
    void animate(x, nextX, motion.settle);
    void animate(y, nextY, motion.settle);
  };

  /** A press on the image: the second of two zooms in at the point, or back out. */
  const pressImage = (e: { clickCount?: number }) => {
    const now = tapAt();
    const previous = lastTap();
    const doubled = (e.clickCount ?? 0) >= 2 || (previous > 0 && now - previous <= DOUBLE_TAP_MS);
    if (!doubled) {
      if (now > 0) lastTap.set(now);
      return;
    }
    lastTap.set(0);
    if (atScale() > 1.01) return settle({ scale: 1, x: 0, y: 0 });
    // The tapped point (from the box's middle, unzoomed) stays under the finger.
    const b = box();
    const dx = tapX() - b.width / 2;
    const dy = tapY() - b.height / 2;
    settle({
      scale: DOUBLE_TAP_ZOOM,
      x: atX() + (atScale() - DOUBLE_TAP_ZOOM) * dx,
      y: atY() + (atScale() - DOUBLE_TAP_ZOOM) * dy,
    });
  };

  return (
    <Dialog open={!!props.image} onOpenChange={({ open }) => !open && props.onClose()}>
      <DialogContent
        {...rest}
        animation={props.animation ?? "fade"}
        scroll={false}
        style={[look.page(), props.style ?? null]}
      >
        <View
          testID="image-viewer"
          focusable={false}
          onPress={props.onClose}
          onLayout={({ bounds }) =>
            viewport.set({ width: bounds.size.width, height: bounds.size.height })
          }
          pinch={{ scale }}
          pan={{ x, y }}
          onPinchEnd={async () => settle({ scale: await scale.getValue(), x: atX(), y: atY() })}
          onPanEnd={(e) => {
            const dy = (e.value?.y ?? atY()) - atY();
            if (atScale() <= 1.01 && (dy > SWIPE_CLOSE || e.velocity.y > 1200))
              return props.onClose();
            settle({ scale: atScale(), x: e.value?.x ?? atX(), y: e.value?.y ?? atY() });
          }}
          style={look.ground()}
        >
          <View
            accessibilityLabel={shown()?.alt || "Image"}
            role="image"
            onTouchStart={(e) => {
              tapX.set(e.locationX);
              tapY.set(e.locationY);
              tapAt.set(e.timestamp);
            }}
            onPress={pressImage}
            style={{
              width: box().width,
              height: box().height,
              opacity: enter,
              translate: [x, y],
              scale: scale.mul(enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })),
            }}
          >
            <Image
              src={shown()?.src ?? ""}
              onLoad={({ size }) => natural.set({ width: size.width, height: size.height })}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </View>
          <If when={shown()?.alt}>
            <View style={look.caption()}>
              <Text style={look.captionText()}>{shown()?.alt}</Text>
            </View>
          </If>
          <View style={look.closeCorner()}>
            <IconButton
              accessibilityLabel="Close"
              size="sm"
              onPress={props.onClose}
              style={look.close()}
              hoverStyle={look.closeHover()}
            >
              <Icon icon={X} size={16} tint={colors.onMedia} />
            </IconButton>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}
