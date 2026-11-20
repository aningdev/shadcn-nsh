// An image viewer's scene: three photographs in a row, a press on one opens it full screen. Pinch
// or double tap to zoom, drag to pan, swipe down (or press Escape) to close.
//
// The photos are the gallery's URLs (`photos.ts`); the page marks itself `images-ready` once all
// three have loaded or failed, and the render check waits for that before the screenshot, so a
// demo, its reference page and the baseline draw the same row at every run.
import { Image, mount, signal, Text, View } from "nsh";

import { ImageViewer, type ImageViewerImage } from "@/packages/ui/image-viewer";
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
      <ImageViewer image={image()} onClose={() => image.set(null)} />
      {/* The render check's cue: every photo has loaded (or failed), so two pages draw the same. */}
      {() =>
        ready() ? (
          <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
        ) : null
      }
    </DemoPage>
  );
}

mount(App);
