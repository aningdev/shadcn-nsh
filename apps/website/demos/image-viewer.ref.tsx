// The reference of `image-viewer.tsx`: the same page, the viewer drawn from `imageViewerLook` on
// `nsh/base`'s own Dialog instead of worn by the component (no gestures: the render check
// compares the page at rest). The render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { X } from "lucide";
import { Image, mount, signal, Text, View } from "nsh";
import { Dialog } from "nsh/base";

import { IconButton } from "@/packages/ui/button";
import { imageViewerLook, type ImageViewerImage } from "@/packages/ui/image-viewer";
import { Icon } from "@/packages/ui/lib/icons";
import { backdrop } from "@/packages/ui/lib/popup";
import { Pressable } from "@/packages/ui/pressable";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { photoUrl } from "./photos";
import { desktop, ui } from "./stage";

const PHOTOS = [
  { name: "sunrise", alt: "Sunrise over the launch pad" },
  { name: "rollout", alt: "The rocket rolls out to the pad" },
  { name: "moon", alt: "The Moon, seen from the capsule" },
] as const;

/** The photographs, fetched before the page draws them (and once more if that failed). */
const warmed = signal(false);
Promise.allSettled(PHOTOS.map((p) => Image.prefetch(photoUrl(p.name)))).then(() =>
  warmed.set(true),
);

function App() {
  const image = signal<ImageViewerImage | null>(null);
  const loaded = signal(0);
  const ready = () => loaded() >= PHOTOS.length;
  const look = imageViewerLook();
  const close = () => image.set(null);
  return (
    <DemoPage title="ImageViewer">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a photo; double click to zoom, drag to pan, Esc to close"
          : "Tap a photo; double tap or pinch to zoom, swipe down to close"}
      </Text>
      <DemoCard>
        <DemoSection title="An image viewer" axis="block">
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Each of={PHOTOS} key={(p) => p.name}>
              {(p) => (
                <Pressable
                  accessibilityLabel={p().alt}
                  onPress={() => image.set({ src: photoUrl(p().name, "large"), alt: p().alt })}
                  style={{ flex: 1, minWidth: 0, borderRadius: 10, overflow: "hidden" }}
                >
                  <Image
                    src={warmed() ? photoUrl(p().name) : undefined}
                    // Drawn at once: a fade caught halfway would differ between two runs.
                    fadeDuration={0}
                    style={{ width: "100%", height: 96, objectFit: "cover" }}
                    onLoadEnd={() => loaded.update((n) => n + 1)}
                  />
                </Pressable>
              )}
            </Each>
          </View>
        </DemoSection>
      </DemoCard>
      <Dialog
        open={!!image()}
        animation="fade"
        backdropStyle={backdrop()}
        style={look.page()}
        onOpenChange={({ open }) => !open && close()}
      >
        <View style={look.ground()}>
          <Image
            src={image()?.src ?? ""}
            accessibilityLabel={image()?.alt || "Image"}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          <If when={image()?.alt}>
            <View style={look.caption()}>
              <Text style={look.captionText()}>{image()?.alt}</Text>
            </View>
          </If>
          <View style={look.closeCorner()}>
            <IconButton
              accessibilityLabel="Close"
              size="sm"
              onPress={close}
              style={look.close()}
              hoverStyle={look.closeHover()}
            >
              <Icon icon={X} size={16} tint={colors.onMedia} />
            </IconButton>
          </View>
        </View>
      </Dialog>
      {() =>
        ready() ? (
          <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
        ) : null
      }
    </DemoPage>
  );
}

mount(App);
