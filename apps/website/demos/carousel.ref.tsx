// The reference of `carousel.tsx`: the same scene with the arrows', the dots' and the pagination
// indicator's looks (`carouselArrowLook`, `carouselPaginationLook`, `carouselDotItemLook`,
// `CarouselDot`) spread on `nsh/base`'s carousel parts, the way the official example
// (`references/nsh/website/demos/el-carousel.tsx`) writes it. It differs from the component page
// only in the parts it names.
import { alpha, colors } from "@shadcn-nsh/theme";
import { ChevronLeft, Pause, Play } from "lucide";
import { cleanup, effect, Image, mount, reduceMotion, signal, Text, token, View } from "nsh";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
} from "nsh/base";

import { IconButton } from "@/packages/ui/button";
import {
  carouselArrowLook,
  CarouselDot,
  carouselDotItemLook,
  carouselPaginationLook,
} from "@/packages/ui/carousel";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
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

// Announcements that roll on by themselves (see `rotation`).
const NEWS: { tag: string; title: string; body: string }[] = [
  { tag: "Release", title: "Notes sync offline", body: "Edits land when the connection does" },
  { tag: "Event", title: "Open pad day", body: "Saturday from 10:00; meet the crews" },
  { tag: "Members", title: "Front row, always", body: "Join in a minute, cancel any time" },
];

/** How long one announcement stays before the next rolls in. */
const TURN = 4000;

/**
 * Slides that move on by themselves, the app's: a controlled index its timer moves on every `ms`,
 * around the ends, a whole interval starting again after each change (a press of the user's too).
 * It holds while the pointer is over the carousel, while the keyboard focus is in it and while the
 * user drags it, and it stays off with reduced motion and while `playing` is off (the rotation
 * control). `nsh/base`'s `Carousel` owns the rest: the index it is given is the slide it shows.
 */
function rotation(count: number, ms: number) {
  const index = signal(0);
  const playing = signal(true);
  const hovered = signal(false);
  const focused = signal(false);
  const dragging = signal(false);
  const held = () => hovered() || focused() || dragging();
  const running = () => playing() && !held() && !reduceMotion();
  effect(() => {
    // A change of slide (anyone's) and a change of what holds it start the interval again.
    index();
    if (!running()) return;
    const timer = setInterval(() => index.set((index() + 1) % count), ms);
    cleanup(() => clearInterval(timer));
  });
  return {
    index,
    playing,
    /** What the caption says: off, paused by the user, held by the user, or rolling. */
    status: () =>
      reduceMotion()
        ? "Off: reduced motion"
        : !playing()
          ? "Paused"
          : held()
            ? "On hold"
            : "Playing",
    /** The pointer's half: on a view of the app's around the carousel. */
    hover: {
      onMouseEnter: () => hovered.set(true),
      onMouseLeave: () => hovered.set(false),
    },
    /** The carousel's half: its keyboard focus and its drags. */
    carousel: {
      onFocus: () => focused.set(true),
      onBlur: () => focused.set(false),
      onDragStart: () => dragging.set(true),
      onDragEnd: () => dragging.set(false),
    },
  };
}

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
  const roll = rotation(NEWS.length, TURN);
  // The arrows, named once: a theme's preset puts them beside the dots or over the viewport's
  // edges (`placement`).
  const Previous = () => (
    <CarouselPrevious
      accessibilityLabel="Previous photo"
      style={arrow.style}
      hoverStyle={arrow.hoverStyle}
      activeStyle={arrow.activeStyle}
      focusVisibleStyle={arrow.focusVisibleStyle}
      disabledStyle={arrow.disabledStyle}
    >
      <Icon icon={ChevronLeft} size={arrow.icon.size} tint={arrow.icon.tint} />
    </CarouselPrevious>
  );
  const Next = () => (
    <CarouselNext
      accessibilityLabel="Next photo"
      style={arrow.style}
      hoverStyle={arrow.hoverStyle}
      activeStyle={arrow.activeStyle}
      focusVisibleStyle={arrow.focusVisibleStyle}
      disabledStyle={arrow.disabledStyle}
    >
      <View style={{ transform: [{ scaleX: -1 }] }}>
        <Icon icon={ChevronLeft} size={arrow.icon.size} tint={arrow.icon.tint} />
      </View>
    </CarouselNext>
  );

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
          <View style={{ position: "relative" }}>
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
                  <Text style={{ fontSize: 20, fontWeight: "700", color: colors.onMedia }}>
                    {shot.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: alpha(colors.onMedia, 0.82) }}>
                    {shot.detail}
                  </Text>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* WinUI's chevrons are flush to the viewport's edges, centred vertically; the row
                lets the touches fall through to the photos between them. */}
            {() =>
              arrow.placement === "over" ? (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    start: 0,
                    end: 0,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pointerEvents: "box-none",
                  }}
                >
                  <Previous />
                  <Next />
                </View>
              ) : null
            }
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {() => (arrow.placement === "over" ? null : <Previous />)}
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
            {() => (arrow.placement === "over" ? null : <Next />)}
          </View>
        </Carousel>
        {/* The render check's cue: every photo has loaded (or failed), so two pages draw the same. */}
        {() =>
          ready() ? (
            <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
          ) : null
        }
      </Split>

      <DemoCard>
        <DemoSection title="Autoplay" axis="block">
          <Text style={{ color: ui().muted }}>
            {`A timer the app owns moves a controlled index every ${TURN / 1000} s, around the ends. It holds while the pointer is over the carousel, while the keyboard focus is in it and while you drag, and it stays off with reduced motion.`}
          </Text>

          {/* The pointer over the announcements holds them: a view of the app's around the carousel. */}
          <View {...roll.hover} style={{ gap: 8 }}>
            <Carousel
              looping
              index={roll.index()}
              accessibilityLabel="Announcements"
              onChange={({ index }) => roll.index.set(index)}
              {...roll.carousel}
              style={[{ gap: 8, alignSelf: "stretch" }, { gap: 10 }]}
            >
              <CarouselContent
                style={[
                  { minHeight: 48, alignSelf: "stretch" },
                  {
                    height: desktop ? 136 : 158,
                    borderRadius: 14,
                    borderCurve: "continuous",
                    gap: 10,
                  },
                ]}
              >
                {NEWS.map((news, i) => (
                  <CarouselItem
                    class="w-full"
                    accessibilityLabel={`${i + 1} of ${NEWS.length}: ${news.title}`}
                    style={[
                      [{ flexShrink: 0, alignItems: "center", justifyContent: "center" }],
                      {
                        width: "100%",
                        height: "100%",
                        padding: 18,
                        alignItems: "flex-start",
                        justifyContent: "flex-end",
                        gap: 2,
                        borderRadius: 14,
                        borderCurve: "continuous",
                        borderWidth: 1,
                        borderColor: ui().line,
                        backgroundColor: ui().raised.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        position: "absolute",
                        top: 16,
                        left: 18,
                        fontSize: 11,
                        fontWeight: "600",
                        letterSpacing: 0.6,
                        color: ui().accent,
                      }}
                    >
                      {news.tag.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: "700", color: ui().text }}>
                      {news.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: ui().muted }}>{news.body}</Text>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {/* The rotation control, first, where WAI-ARIA's carousel puts it. */}
                <IconButton
                  accessibilityLabel={roll.playing() ? "Pause announcements" : "Play announcements"}
                  size="sm"
                  onPress={() => roll.playing.set(!roll.playing())}
                >
                  <Icon icon={roll.playing() ? Pause : Play} size={14} tint={ui().text} />
                </IconButton>
                <CarouselPagination
                  accessibilityLabel="Choose an announcement"
                  style={{ ...dots.style, flex: 1, justifyContent: "center" }}
                  indicatorStyle={dots.indicatorStyle}
                >
                  {NEWS.map((news, i) => (
                    <CarouselPaginationItem
                      index={i}
                      accessibilityLabel={news.title}
                      class={dotItem.class}
                      style={dotItem.style}
                      focusVisibleStyle={dotItem.focusVisibleStyle}
                    >
                      <CarouselDot selected={i === roll.index()} />
                    </CarouselPaginationItem>
                  ))}
                </CarouselPagination>
                <Text style={{ fontSize: 12, color: ui().faint, fontVariant: ["tabular-nums"] }}>
                  {`${roll.index() + 1} / ${NEWS.length}`}
                </Text>
              </View>
            </Carousel>
            <Text style={{ fontSize: 12, color: ui().muted }}>
              {`${roll.status()} · holds under the pointer, on focus and while dragging`}
            </Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
