// The reference of `carousel.tsx`: the same scene with the arrows', the dots' and the pagination
// indicator's looks (`carouselArrowLook`, `carouselPaginationLook`, `carouselDotItemLook`,
// `CarouselDot`) spread on `nsh/base`'s carousel parts, the way the official example
// (`references/nsh/website/demos/el-carousel.tsx`) writes it. It differs from the component page
// only in the parts it names.
import { alpha } from "@shadcn-nsh/theme";
import { Image, mount, signal, Text, token, View } from "nsh";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
} from "nsh/base";

import {
  carouselArrowLook,
  CarouselDot,
  carouselDotItemLook,
  carouselPaginationLook,
  carouselSizes,
} from "@/packages/ui/carousel";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoPage } from "./kit";
import { photoUrl, type PhotoName } from "./photos";
import { desktop, Log, Split, ui } from "./stage";

// Photos of the launch pad (the gallery's `photos.ts`), each with a caption at its foot.
const shots: { photo: PhotoName; name: string; detail: string }[] = [
  { photo: "rays", name: "On the pad", detail: "Dusk at the launch site" },
  { photo: "fairing", name: "The fairing", detail: "Close up, before stacking" },
  { photo: "day", name: "At the tower", detail: "The stack by daylight" },
  { photo: "rollout", name: "Rollout", detail: "Moved to the pad at night" },
  { photo: "liftoff", name: "Liftoff", detail: "Clear of the tower" },
];

/**
 * The photos, fetched once at load: an image already in the cache paints in the frame that places
 * it, and two runs draw the same corner pixels of the card that clips it. A download that fails
 * is not a page that never draws: the image shows its empty frame, and the page still marks
 * itself ready.
 */
const warmed = signal(false);
Promise.allSettled(shots.map((shot) => Image.prefetch(photoUrl(shot.photo)))).then(() =>
  warmed.set(true),
);

function App() {
  const shown = signal(0);
  // The render check waits for `images-ready`: five photos loaded (or failed), not one more.
  const loaded = signal(0);
  const ready = () => loaded() >= shots.length;
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const arrow = carouselArrowLook();
  const dots = carouselPaginationLook();
  const dotItem = carouselDotItemLook();

  return (
    <DemoPage title="Carousel">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Scroll with the touchpad, click the arrows or a dot, or focus it and press ← →; after the last photo comes the first"
          : "Swipe the photos, or tap the arrows or a dot; after the last photo comes the first"}
      </Text>

      <Split
        gap={14}
        inspector={
          <Log title={`onChange · ${shots[shown()].name}`} lines={events()} minHeight={76} />
        }
      >
        {/* Five cards at 85% span more than the view and a card: the loop is seamless. */}
        <Carousel
          looping
          accessibilityLabel="Photos of the launch pad"
          onChange={({ index }) => {
            shown.set(index);
            log(`index: ${index} (${shots[index].name})`);
          }}
          style={[
            { gap: 8, alignSelf: "stretch" },
            { gap: 12, borderRadius: 14 },
          ]}
        >
          {/* Each card is 85% of the view: the next one peeks in. */}
          <CarouselContent
            style={[
              { minHeight: 48, alignSelf: "stretch" },
              { height: desktop ? 150 : 170, gap: 10 },
            ]}
          >
            {shots.map((shot, i) => (
              <CarouselItem
                class="w-full"
                accessibilityLabel={`${i + 1} of ${shots.length}: ${shot.name}`}
                style={[
                  [{ flexShrink: 0, alignItems: "center", justifyContent: "center" }],
                  {
                    width: "85%",
                    height: "100%",
                    padding: 16,
                    alignItems: "stretch",
                    justifyContent: "flex-end",
                    gap: 2,
                    borderRadius: 14,
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: ui().line,
                    overflow: "hidden",
                    backgroundColor: ui().raised.backgroundColor,
                  },
                ]}
              >
                <Image
                  src={warmed() ? photoUrl(shot.photo) : undefined}
                  // Drawn at once: a fade caught halfway would differ between two runs.
                  fadeDuration={0}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    objectFit: "cover",
                  }}
                  onLoadEnd={() => loaded.update((n) => n + 1)}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    // The theme's scrim at the foot, so the caption reads on any photo.
                    backgroundImage: `linear-gradient(180deg, transparent 40%, ${token("scrim")} 100%)`,
                  }}
                />
                <Text style={{ fontSize: 20, fontWeight: "700", color: ui().caption }}>
                  {shot.name}
                </Text>
                <Text style={{ fontSize: 13, color: alpha(ui().caption, 0.82) }}>
                  {shot.detail}
                </Text>
              </CarouselItem>
            ))}
          </CarouselContent>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CarouselPrevious
              accessibilityLabel="Previous photo"
              style={arrow.style}
              hoverStyle={arrow.hoverStyle}
              activeStyle={arrow.activeStyle}
              focusVisibleStyle={arrow.focusVisibleStyle}
              disabledStyle={arrow.disabledStyle}
            >
              <Icon name="back" size={carouselSizes.arrowIcon} tint={ui().text} />
            </CarouselPrevious>
            {/* The dots: a pill springs to the one of the photo shown. */}
            <CarouselPagination
              accessibilityLabel="Choose a photo"
              style={{ ...dots.style, flex: 1, justifyContent: "center" }}
              indicatorStyle={dots.indicatorStyle}
            >
              {shots.map((shot, i) => (
                <CarouselPaginationItem
                  index={i}
                  accessibilityLabel={shot.name}
                  class={dotItem.class}
                  style={dotItem.style}
                  focusVisibleStyle={dotItem.focusVisibleStyle}
                >
                  <CarouselDot selected={i === shown()} />
                </CarouselPaginationItem>
              ))}
            </CarouselPagination>
            <CarouselNext
              accessibilityLabel="Next photo"
              style={arrow.style}
              hoverStyle={arrow.hoverStyle}
              activeStyle={arrow.activeStyle}
              focusVisibleStyle={arrow.focusVisibleStyle}
              disabledStyle={arrow.disabledStyle}
            >
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <Icon name="back" size={carouselSizes.arrowIcon} tint={ui().text} />
              </View>
            </CarouselNext>
          </View>
        </Carousel>
        {/* The render check's cue: every photo has loaded (or failed), so two pages draw the same. */}
        {() =>
          ready() ? (
            <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
          ) : null
        }
      </Split>
    </DemoPage>
  );
}

mount(App);
