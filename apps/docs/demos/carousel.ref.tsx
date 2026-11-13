// The reference of `carousel.tsx`: the same scene with the arrows', the dots' and the pagination
// indicator's looks (`carouselArrowLook`, `carouselPaginationLook`, `carouselDotItemLook`,
// `CarouselDot`) spread on `nsh/base`'s carousel parts, the way the official example
// (`references/nsh/website/demos/el-carousel.tsx`) writes it. It differs from the component page
// only in the parts it names.
import { alpha, chart, colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
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
import { desktop, Log, Split } from "./stage";

// Photos of the launch pad, each with a caption at its foot.
const shots: { name: string; detail: string }[] = [
  { name: "On the pad", detail: "Dusk at the launch site" },
  { name: "The fairing", detail: "Close up, before stacking" },
  { name: "At the tower", detail: "The stack by daylight" },
  { name: "Rollout", detail: "Moved to the pad at night" },
  { name: "Liftoff", detail: "Clear of the tower" },
];

/** The wash of a card: the theme's chart hues, the first leading. */
const wash = (i: number) => [chart.s1, chart.s2, chart.s3, chart.s4, chart.s5][i % 5];

function App() {
  const shown = signal(0);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const arrow = carouselArrowLook();
  const dots = carouselPaginationLook();
  const dotItem = carouselDotItemLook();

  return (
    <DemoPage title="Carousel">
      <Text style={{ color: colors.muted }}>
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
                    borderColor: colors.line,
                    overflow: "hidden",
                    backgroundColor: colors.raised,
                  },
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `linear-gradient(160deg, ${alpha(wash(i), 0.42)} 0%, ${alpha(wash(i), 0.12)} 55%, ${colors.inset} 100%)`,
                  }}
                />
                <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
                  {shot.name}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>{shot.detail}</Text>
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
              <Icon name="back" size={carouselSizes.arrowIcon} tint={colors.text} />
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
                <Icon name="back" size={carouselSizes.arrowIcon} tint={colors.text} />
              </View>
            </CarouselNext>
          </View>
        </Carousel>
      </Split>
    </DemoPage>
  );
}

mount(App);
