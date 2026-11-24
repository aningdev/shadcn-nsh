import { alpha, chart, colors, focusRing, rounded, shape } from "@shadcn-nsh/theme";
// Carousel: the official gallery's scene (`references/nsh/examples/gallery/demos/CarouselDemo.tsx`)
// with this library's parts — an onboarding the app steps through with its own buttons, a
// product's photos with thumbnails and glass arrows over them, banners that roll on by
// themselves and wait under the pointer, a row of cards three to a view, and a vertical ticker.
// `nsh/base`'s Carousel owns the scrolling, which slide shows and what screen readers hear; the
// app owns the index where it wants to, every label and every look.
import {
  ArrowDown,
  ArrowUp,
  BellRing,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  FileText,
  FolderInput,
  Inbox,
  MapPin,
  Palette,
  Pause,
  Play,
  Share2,
  Sparkles,
  Archive,
  type IconNode,
} from "lucide";
import type { ViewStyle } from "nsh";
import {
  cleanup,
  createAnimatedValue,
  effect,
  Image,
  platform,
  reduceMotion,
  signal,
  Text,
  token,
  View,
} from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselDot,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
  carouselArrowLook,
  carouselPaginationLook,
  carouselDotItemLook,
  carouselSizes,
} from "@/packages/ui/carousel";
import { Icon } from "@/packages/ui/lib/icons";
import { Pressable } from "@/packages/ui/pressable";

import { DemoCard, DemoPage } from "../kit";
import { CaptionRow, hint } from "./navigation-shared";

const pointer = platform.desktop;

/** The sizes of the page: a pointer's compact tier, a touch screen's roomier one. */
const size = pointer
  ? { title: 15, body: 13, caption: 12, thumb: 52, bar: 18, ...carouselSizes }
  : { title: 17, body: 15, caption: 13, thumb: 60, bar: 22, ...carouselSizes };

/** A fade every control here shares; nothing moves with reduced motion. */
const fade = (): ViewStyle => ({
  transitionProperty: "background-color, border-color, opacity, transform",
  transitionDuration: reduceMotion() ? 0 : 160,
  transitionTimingFunction: "ease-out",
});

/**
 * Slides that move on by themselves, the app's: a controlled index the
 * app's timer moves on every `ms`, around the ends, starting a whole
 * interval again after each change (a press of the user's included). It
 * holds while the pointer is over the carousel, while the keyboard focus
 * is in it and while the user drags it, and stays off with reduced motion
 * and while `playing` is off (the rotation control).
 */
function rotation(count: number, ms: number, onTick?: (index: number) => void) {
  const index = signal(0);
  const playing = signal(true);
  const hovered = signal(false);
  const focused = signal(false);
  const dragging = signal(false);
  const held = () => hovered() || focused() || dragging();
  const running = () => playing() && !held() && !reduceMotion();
  effect(() => {
    index();
    if (!running()) return;
    const timer = setInterval(() => {
      const next = (index() + 1) % count;
      index.set(next);
      onTick?.(next);
    }, ms);
    cleanup(() => clearInterval(timer));
  });
  return {
    index,
    playing,
    held,
    running,
    /** What the badge says: off, paused by the user, held by the user, or rolling. */
    status: () =>
      reduceMotion()
        ? "Off: reduced motion"
        : !playing()
          ? "Paused"
          : held()
            ? "On hold"
            : "Playing",
    /** The pointer's half: on a view around the carousel. */
    hover: {
      onMouseEnter: () => hovered.set(true),
      onMouseLeave: () => hovered.set(false),
    },
    /** The carousel's half: its index, its changes, its focus and drags. */
    carousel: {
      onFocus: () => focused.set(true),
      onBlur: () => focused.set(false),
      onDragStart: () => dragging.set(true),
      onDragEnd: () => dragging.set(false),
    },
  };
}

const STEPS: { icon: IconNode; title: string; body: string; tone: () => string }[] = [
  {
    icon: Sparkles,
    title: "Welcome to Field Notes",
    body: "Capture ideas the moment they arrive, from any device.",
    tone: () => chart.chart1,
  },
  {
    icon: FolderInput,
    title: "Import what you have",
    body: "Bring notes in from files, the clipboard or another app.",
    tone: () => colors.info,
  },
  {
    icon: Share2,
    title: "Share with your team",
    body: "Invite people to a notebook; edits sync as they type.",
    tone: () => colors.up,
  },
  {
    icon: BellRing,
    title: "Stay in the loop",
    body: "Get a nudge when someone mentions you or a task is due.",
    tone: () => colors.warn,
  },
];

/** The gallery's photographs: SpaceX's launches, as the official demo's photos. */
const PHOTOS = {
  arc: "HUgxtn0WYAAHEl8",
  booster: "HTpJzwHWMAAIOgb",
  transporter: "HTbXRu9XcAEKwGr",
  rays: "HS7_82eXsAAa-Hx",
  sunrise: "HS8AAMSWwAEg-aG",
  day: "HS8AFH2WsAASxLk",
  silver: "HS6UGjvXkAAyHtp",
  rollout: "HS6UIKjWcAAIFCz",
  liftoff: "HR4knefbgAAKXHH",
  fairing: "HQ6j_THXoAAGLRX",
} as const;

type PhotoName = keyof typeof PHOTOS;
type PhotoSize = "360x360" | "small" | "900x900" | "medium" | "large" | "4096x4096";

/** The URL of a photo at a size, as the official demo's `photoUrl` builds it. */
const photoUrl = (name: PhotoName, photoSize: PhotoSize = "medium") =>
  `https://pbs.twimg.com/media/${PHOTOS[name]}?format=jpg&name=${photoSize}`;

const PHOTOS_LIST: { name: PhotoName; caption: string }[] = [
  { name: "rays", caption: "On the pad at dusk" },
  { name: "fairing", caption: "Fairing, close up" },
  { name: "day", caption: "At the tower by day" },
  { name: "rollout", caption: "Rolled out at night" },
  { name: "transporter", caption: "On the transporter" },
  { name: "liftoff", caption: "Liftoff" },
];

const BANNERS: { tag: string; title: string; body: string; name: PhotoName }[] = [
  {
    tag: "New",
    title: "Launch season",
    body: "Watch the next flights from the beach",
    name: "arc",
  },
  { tag: "Sale", title: "Up to 40% off", body: "Viewing seats, this week only", name: "sunrise" },
  {
    tag: "Event",
    title: "Open pad day, Saturday",
    body: "Walk the pad and meet the crews",
    name: "silver",
  },
  {
    tag: "Members",
    title: "Front row, always",
    body: "Join in a minute, cancel any time",
    name: "booster",
  },
];

const COLLECTIONS: { name: string; count: number; icon: IconNode; tone: () => string }[] = [
  { name: "Reading list", count: 24, icon: FileText, tone: () => chart.chart1 },
  { name: "Recipes", count: 61, icon: Coffee, tone: () => colors.warn },
  { name: "Trips", count: 9, icon: MapPin, tone: () => colors.info },
  { name: "Inbox", count: 132, icon: Inbox, tone: () => chart.chart3 },
  { name: "Design", count: 47, icon: Palette, tone: () => colors.up },
  { name: "Archive", count: 512, icon: Archive, tone: () => chart.chart4 },
  { name: "Ideas", count: 18, icon: Sparkles, tone: () => colors.destructive },
];

/** Short enough for one line beside the arrows in a phone-wide card. */
const NEWS = [
  "Offline mode: notes sync when online",
  "Dark mode follows your system",
  "Shared notebooks show who is typing",
  "Search finds words in images and PDFs",
];

/** The arrows: raised on a card, glass over a photo. */
const raised = carouselArrowLook();
const glass = carouselArrowLook({ glass: true });
/** The ticker's smaller arrows. */
const small = carouselArrowLook({ side: size.arrow - 6 });

/** Ink over a photo. The veil is the theme's scrim. The ink is `on-media`, white in every
 * appearance, read where it is drawn so a theme switch follows. */
const veil = (share: number) => alpha(token("scrim"), share);
const whiteInk = (a: number) => alpha(colors.onMedia, a);

/** An onboarding the app steps through with its own buttons: one step per view, a pagination of
 * dots, and a finished state. */
function Onboarding(props: { log: (text: string) => void }) {
  const step = signal(0);
  const done = signal(false);
  const lastStep = STEPS.length - 1;
  // The finished state pops in once.
  const pop = createAnimatedValue(1);
  const complete = () => {
    done.set(true);
    props.log("Onboarding: done");
    if (reduceMotion()) return;
    pop.set(0.6);
    void pop.spring(1, { stiffness: 420, damping: 14 });
  };
  return (
    <DemoCard
      title="Onboarding"
      subtitle="One step per view; the buttons own the index"
      style={{ gap: 12 }}
    >
      <View style={{ alignSelf: "flex-end" }}>
        <Badge tone={done() ? "up" : "neutral"}>
          {done() ? "Done" : `Step ${step() + 1} of ${STEPS.length}`}
        </Badge>
      </View>
      <If
        when={!done()}
        else={
          <View
            style={{
              height: pointer ? 236 : 268,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transform: [{ scale: pop }],
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(colors.up, 0.16),
                borderWidth: 1,
                borderColor: alpha(colors.up, 0.4),
              }}
            >
              <Icon icon={Check} size={24} tint={colors.up} />
            </View>
            <Text style={{ fontSize: size.title, fontWeight: "600", color: colors.foreground }}>
              You are all set
            </Text>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => {
                step.set(0);
                done.set(false);
                props.log("Onboarding: start over");
              }}
            >
              Start over
            </Button>
          </View>
        }
      >
        <Carousel
          index={step()}
          accessibilityLabel="Getting started"
          onChange={({ index }) => {
            step.set(index);
            props.log(`Onboarding: step ${index + 1}`);
          }}
          style={{ gap: 14 }}
        >
          <CarouselContent style={{ height: pointer ? 160 : 188 }}>
            <Each of={STEPS}>
              {(s, i) => (
                <CarouselItem
                  accessibilityLabel={`${i() + 1} of ${STEPS.length}: ${s().title}`}
                  style={{
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    paddingHorizontal: 24,
                  }}
                >
                  <View
                    style={{
                      width: pointer ? 48 : 56,
                      height: pointer ? 48 : 56,
                      borderRadius: 16,
                      borderCurve: "continuous",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(s().tone(), 0.16),
                      borderWidth: 1,
                      borderColor: alpha(s().tone(), 0.4),
                    }}
                  >
                    <Icon icon={s().icon} size={pointer ? 22 : 26} tint={s().tone()} />
                  </View>
                  <Text
                    style={{
                      fontSize: size.title,
                      fontWeight: "600",
                      color: colors.foreground,
                      textAlign: "center",
                    }}
                  >
                    {s().title}
                  </Text>
                  <Text
                    style={{
                      fontSize: size.body,
                      color: colors.mutedForeground,
                      textAlign: "center",
                      maxWidth: 320,
                    }}
                  >
                    {s().body}
                  </Text>
                </CarouselItem>
              )}
            </Each>
          </CarouselContent>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Button
              variant="ghost"
              size="sm"
              disabled={step() === 0}
              onPress={() => {
                step.set(step() - 1);
                props.log(`Onboarding: back to ${step() + 1}`);
              }}
            >
              Back
            </Button>
            <View style={{ flex: 1, alignItems: "center" }}>
              <CarouselPagination
                accessibilityLabel="Steps"
                // A pill a dot high and twice as wide, springing to the step shown.
                {...carouselPaginationLook()}
              >
                <Each of={STEPS}>
                  {(s, i) => (
                    // A touch-sized item around its dot; the dot hides under the pill.
                    <CarouselPaginationItem
                      index={i()}
                      accessibilityLabel={`Step ${i() + 1}: ${s().title}`}
                      {...carouselDotItemLook()}
                    >
                      <CarouselDot selected={i() === step()} />
                    </CarouselPaginationItem>
                  )}
                </Each>
              </CarouselPagination>
            </View>
            <Button
              size="sm"
              onPress={() => {
                if (step() === lastStep) complete();
                else {
                  step.set(step() + 1);
                  props.log(`Onboarding: next to ${step() + 1}`);
                }
              }}
            >
              {step() === lastStep ? "Done" : "Next"}
            </Button>
          </View>
        </Carousel>
      </If>
    </DemoCard>
  );
}

/** A product's photos: the content, glass arrows on its edges, thumbnails that pick one. */
function Product(props: { log: (text: string) => void }) {
  const photo = signal(0);
  return (
    <DemoCard
      title="Photos"
      subtitle="Thumbnails pick a photo; arrows on its edges"
      style={{ gap: 12 }}
    >
      <View style={{ alignSelf: "flex-end" }}>
        <Badge>{`${photo() + 1} / ${PHOTOS_LIST.length}`}</Badge>
      </View>
      <Carousel
        accessibilityLabel="Photos of the launch pad"
        onChange={({ index }) => {
          photo.set(index);
          props.log(`Photo: ${PHOTOS_LIST[index]!.caption}`);
        }}
        style={{ gap: 10 }}
      >
        <View>
          <CarouselContent
            style={{
              aspectRatio: 4 / 3,
              ...rounded(shape.control),
              borderCurve: "continuous",
              backgroundColor: colors.raised,
            }}
          >
            <Each of={PHOTOS_LIST}>
              {(p, i) => (
                <CarouselItem
                  accessibilityLabel={`${i() + 1} of ${PHOTOS_LIST.length}: ${p().caption}`}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    src={photoUrl(p().name)}
                    style={{ width: "100%", height: "100%", backgroundColor: colors.raised }}
                  />
                </CarouselItem>
              )}
            </Each>
          </CarouselContent>
          <CarouselPrevious
            accessibilityLabel="Previous photo"
            glass
            style={{
              ...glass.style,
              position: "absolute",
              left: 10,
              top: "50%",
              marginTop: -size.arrow / 2,
            }}
          >
            <Icon icon={ChevronLeft} size={size.arrowIcon} tint={colors.foreground} />
          </CarouselPrevious>
          <CarouselNext
            accessibilityLabel="Next photo"
            glass
            style={{
              ...glass.style,
              position: "absolute",
              right: 10,
              top: "50%",
              marginTop: -size.arrow / 2,
            }}
          >
            <Icon icon={ChevronRight} size={size.arrowIcon} tint={colors.foreground} />
          </CarouselNext>
        </View>
        <CarouselPagination
          accessibilityLabel="Choose a photo"
          style={{ flexDirection: "row", gap: 8 }}
        >
          <Each of={PHOTOS_LIST}>
            {(p, i) => (
              <CarouselPaginationItem
                index={i()}
                accessibilityLabel={`Photo ${i() + 1}: ${p().caption}`}
                style={{
                  // Six share the row's width, up to their size: they
                  // fit a phone and the desktop's narrow column.
                  flex: 1,
                  maxWidth: size.thumb,
                  height: size.thumb * 0.75,
                  padding: 2,
                  ...rounded(8),
                  borderCurve: "continuous",
                  borderWidth: 2,
                  borderColor: "transparent",
                  opacity: 0.6,
                  ...fade(),
                }}
                selectedStyle={{ borderColor: colors.brand, opacity: 1 }}
                hoverStyle={{ opacity: 0.85 }}
                activeStyle={{ transform: [{ scale: 0.94 }] }}
                focusVisibleStyle={focusRing(1)}
              >
                <Image
                  src={photoUrl(p().name, "360x360")}
                  style={{ flex: 1, ...rounded(5), backgroundColor: colors.raised }}
                />
              </CarouselPaginationItem>
            )}
          </Each>
        </CarouselPagination>
      </Carousel>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text
          style={{ flex: 1, fontSize: size.title, fontWeight: "600", color: colors.foreground }}
        >
          Starbase
        </Text>
        <Text
          style={{
            fontSize: size.title,
            fontWeight: "600",
            color: colors.foreground,
            fontVariant: ["tabular-nums"],
          }}
        >
          6 photos
        </Text>
      </View>
      <CaptionRow
        label={PHOTOS_LIST[photo()]!.caption}
        note={pointer ? "← → while focused, or the touchpad" : "Swipe, or tap a thumbnail"}
      />
    </DemoCard>
  );
}

/** Banners that roll on by themselves every 4 s, holding while the pointer is over them, with
 * the rotation control WAI-ARIA's carousel has. */
function Banners(props: { log: (text: string) => void }) {
  const roll = rotation(BANNERS.length, 4000, (i) => props.log(`Banner: ${BANNERS[i]!.title}`));
  const { playing } = roll;
  const shown = roll.index;
  return (
    <DemoCard
      title="Banners"
      subtitle={
        pointer
          ? "Rolls every 4 s; holds under the pointer"
          : "Rolls every 4 s; holds while you swipe"
      }
      style={{ gap: 12 }}
    >
      <View style={{ alignSelf: "flex-end" }}>
        <Badge tone={roll.running() ? "accent" : "neutral"}>{roll.status()}</Badge>
      </View>
      {/* The pointer over the banners holds them: a view of the app's around the carousel. */}
      <View {...roll.hover}>
        <Carousel
          looping
          index={shown()}
          accessibilityLabel="Promotions"
          onChange={({ index }) => {
            shown.set(index);
            props.log(`Banner: ${BANNERS[index]!.title}`);
          }}
          {...roll.carousel}
          style={{ gap: 10 }}
        >
          <CarouselContent
            style={{
              height: pointer ? 132 : 156,
              ...rounded(shape.control),
              borderCurve: "continuous",
            }}
          >
            <Each of={BANNERS}>
              {(b, i) => (
                <CarouselItem
                  accessibilityLabel={`${i() + 1} of ${BANNERS.length}: ${b().title}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    padding: pointer ? 18 : 20,
                    justifyContent: "flex-end",
                    gap: 4,
                    backgroundColor: colors.raised,
                  }}
                >
                  <Image
                    src={photoUrl(b().name)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      objectFit: "cover",
                    }}
                  />
                  {/* A shade so the title keeps its contrast over a bright photo's right half:
                      the theme's scrim, as every overlay's dimming. */}
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `linear-gradient(90deg, ${veil(1)} 0%, ${veil(0.42)} 58%, ${veil(0)} 100%)`,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `linear-gradient(0deg, ${veil(0.83)} 0%, ${veil(0)} 70%)`,
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      top: 14,
                      left: pointer ? 18 : 20,
                      paddingHorizontal: 8,
                      height: 20,
                      borderRadius: 10,
                      justifyContent: "center",
                      backgroundColor: whiteInk(0.18),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: colors.onMedia,
                        letterSpacing: 0.4,
                      }}
                    >
                      {b().tag.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: pointer ? 20 : 22,
                      fontWeight: "700",
                      color: colors.onMedia,
                    }}
                  >
                    {b().title}
                  </Text>
                  <Text style={{ fontSize: size.body, color: whiteInk(0.82) }}>{b().body}</Text>
                </CarouselItem>
              )}
            </Each>
          </CarouselContent>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {/* The rotation control, first, as WAI-ARIA's carousel has it. */}
            <Pressable
              accessibilityLabel={playing() ? "Pause slides" : "Play slides"}
              onPress={() => {
                playing.set(!playing());
                props.log(`Banners: ${playing() ? "playing" : "paused"}`);
              }}
              style={raised.style}
              hoverStyle={raised.hoverStyle}
            >
              <Icon
                icon={playing() ? Pause : Play}
                size={size.arrowIcon - 4}
                tint={colors.foreground}
              />
            </Pressable>
            <CarouselPagination
              accessibilityLabel="Choose a promotion"
              style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 4 }}
              // A bar 4 high on the item of the banner shown, gliding to the next.
              indicatorStyle={{
                top: (size.hit - 4) / 2,
                bottom: (size.hit - 4) / 2,
                borderRadius: 2,
                backgroundColor: colors.primary,
              }}
            >
              <Each of={BANNERS}>
                {(b, i) => (
                  // A touch-sized item around its bar.
                  <CarouselPaginationItem
                    index={i()}
                    accessibilityLabel={b().title}
                    class="group"
                    style={{
                      width: size.bar,
                      height: size.hit,
                      justifyContent: "center",
                      ...rounded(4),
                    }}
                    focusVisibleStyle={focusRing()}
                  >
                    <View
                      class="group-selected:opacity-0 opacity-70 group-hover:opacity-100"
                      style={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(colors.foreground, 0.22),
                        ...fade(),
                      }}
                    />
                  </CarouselPaginationItem>
                )}
              </Each>
            </CarouselPagination>
            <Text
              style={{
                fontSize: size.caption,
                color: colors.faint,
                fontVariant: ["tabular-nums"],
              }}
            >{`${shown() + 1} / ${BANNERS.length}`}</Text>
          </View>
        </Carousel>
      </View>
    </DemoCard>
  );
}

/** A row of cards three to a view with a pointer, a card and a peek on a touch screen. */
function Collections(props: { log: (text: string) => void }) {
  const first = signal(0);
  // Three to a view with a pointer, a card and a peek on a touch screen; the content's
  // negative margin and each card's padding make the gaps.
  const basis = pointer ? "33.333%" : "78%";
  const gap = 12;
  return (
    <DemoCard
      title="Collections"
      subtitle={
        pointer ? "Three to a view; the last ones rest together" : "One and a peek of the next"
      }
    >
      <Carousel
        accessibilityLabel="Collections"
        onChange={({ index }) => {
          first.set(index);
          props.log(`Collections: from ${COLLECTIONS[index]!.name}`);
        }}
        style={{ gap: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text
            style={{
              flex: 1,
              fontSize: size.caption,
              color: colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >{`${COLLECTIONS.length} collections · from ${COLLECTIONS[first()]!.name}`}</Text>
          <CarouselPrevious accessibilityLabel="Previous collections" {...raised}>
            <Icon icon={ChevronLeft} size={size.arrowIcon} tint={colors.foreground} />
          </CarouselPrevious>
          <CarouselNext accessibilityLabel="Next collections" {...raised}>
            <Icon icon={ChevronRight} size={size.arrowIcon} tint={colors.foreground} />
          </CarouselNext>
        </View>
        <CarouselContent style={{ marginLeft: -gap, height: pointer ? 112 : 128 }}>
          <Each of={COLLECTIONS}>
            {(c, i) => (
              <CarouselItem
                accessibilityLabel={`${i() + 1} of ${COLLECTIONS.length}: ${c().name}`}
                style={{ flexBasis: basis, paddingLeft: gap, height: "100%" }}
              >
                <View
                  style={{
                    flex: 1,
                    padding: 12,
                    justifyContent: "space-between",
                    ...rounded(shape.control),
                    borderCurve: "continuous",
                    borderWidth: 1,
                    borderColor: colors.line,
                    backgroundColor: colors.inset,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      ...rounded(9),
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: alpha(c().tone(), 0.16),
                    }}
                  >
                    <Icon icon={c().icon} size={16} tint={c().tone()} />
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text
                      style={{
                        fontSize: size.body,
                        fontWeight: "600",
                        color: colors.foreground,
                        numberOfLines: 1,
                      }}
                    >
                      {c().name}
                    </Text>
                    <Text
                      style={{
                        fontSize: size.caption,
                        color: colors.mutedForeground,
                        fontVariant: ["tabular-nums"],
                      }}
                    >{`${c().count} notes`}</Text>
                  </View>
                </View>
              </CarouselItem>
            )}
          </Each>
        </CarouselContent>
      </Carousel>
    </DemoCard>
  );
}

/** A vertical ticker: the next line rolls up every 3 s, looping. */
function Ticker() {
  const roll = rotation(NEWS.length, 3000);
  const shown = roll.index;
  return (
    <DemoCard title="What's new" subtitle="Rolls the next line up every 3 s, looping">
      <View {...roll.hover}>
        <Carousel
          axis="vertical"
          looping
          index={shown()}
          accessibilityLabel="Announcements"
          onChange={({ index }) => shown.set(index)}
          {...roll.carousel}
          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Icon icon={BellRing} size={16} tint={colors.brand} />
          <CarouselContent style={{ flex: 1, height: pointer ? 28 : 36 }}>
            <Each of={NEWS}>
              {(n, i) => (
                <CarouselItem
                  accessibilityLabel={`${i() + 1} of ${NEWS.length}`}
                  style={{ height: "100%", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: size.body, color: colors.foreground, numberOfLines: 1 }}>
                    {n()}
                  </Text>
                </CarouselItem>
              )}
            </Each>
          </CarouselContent>
          <CarouselPrevious accessibilityLabel="Previous announcement" {...small}>
            <Icon icon={ArrowUp} size={size.arrowIcon - 4} tint={colors.foreground} />
          </CarouselPrevious>
          <CarouselNext accessibilityLabel="Next announcement" {...small}>
            <Icon icon={ArrowDown} size={size.arrowIcon - 4} tint={colors.foreground} />
          </CarouselNext>
        </Carousel>
      </View>
      <CaptionRow
        label={pointer ? "↑ ↓ while focused" : "Swipe up or down"}
        note={`${shown() + 1} of ${NEWS.length}`}
      />
    </DemoCard>
  );
}

export function CarouselDemo() {
  const last = signal("—");
  const log = (text: string) => last.set(text);
  return (
    <DemoPage
      title="Carousel"
      note={hint(
        "Swipe the slides, or their dots",
        "Drag the slides, click the arrows, or focus and use the keys",
      )}
    >
      <Onboarding log={log} />
      <Product log={log} />
      <Banners log={log} />
      <Collections log={log} />
      <Ticker />
    </DemoPage>
  );
}
