// The reference of `carousel.tsx`: carousel looks on `nsh/base`'s Carousel parts.
import { colors } from "@shadcn-nsh/theme";
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

import { DemoCard, DemoPage } from "./kit";

const SLIDES = ["Harbor", "Dunes", "Glacier"] as const;

function App() {
  const index = signal(0);
  const arrow = carouselArrowLook();
  const dots = carouselPaginationLook();
  const dotItem = carouselDotItemLook();
  const icon = carouselSizes.arrowIcon;

  return (
    <DemoPage title="Carousel" note={() => `${index() + 1} / ${SLIDES.length}`}>
      <DemoCard style={{ alignSelf: "stretch", gap: 12 }}>
        <Carousel
          index={index()}
          onChange={({ index: next }) => index.set(next)}
          accessibilityLabel="Photo slides"
          style={{ gap: 8, alignSelf: "stretch" }}
        >
          <CarouselContent
            style={[
              { minHeight: 48, alignSelf: "stretch" },
              { height: 120, borderRadius: 12, backgroundColor: colors.inset },
            ]}
          >
            {SLIDES.map((name, i) => (
              <CarouselItem
                class="w-full"
                accessibilityLabel={`${i + 1} of ${SLIDES.length}: ${name}`}
                style={[{ flexShrink: 0, alignItems: "center", justifyContent: "center" }, null]}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{name}</Text>
              </CarouselItem>
            ))}
          </CarouselContent>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CarouselPrevious
              accessibilityLabel="Previous slide"
              style={arrow.style}
              hoverStyle={arrow.hoverStyle}
              activeStyle={arrow.activeStyle}
              focusVisibleStyle={arrow.focusVisibleStyle}
              disabledStyle={arrow.disabledStyle}
            >
              <Icon name="back" size={icon} tint={colors.text} />
            </CarouselPrevious>
            <CarouselPagination
              accessibilityLabel="Choose a slide"
              style={dots.style}
              indicatorStyle={dots.indicatorStyle}
            >
              {SLIDES.map((_, i) => (
                <CarouselPaginationItem
                  index={i}
                  accessibilityLabel={`Slide ${i + 1}`}
                  class={dotItem.class}
                  style={dotItem.style}
                  focusVisibleStyle={dotItem.focusVisibleStyle}
                >
                  <CarouselDot selected={index() === i} />
                </CarouselPaginationItem>
              ))}
            </CarouselPagination>
            <CarouselNext
              accessibilityLabel="Next slide"
              style={arrow.style}
              hoverStyle={arrow.hoverStyle}
              activeStyle={arrow.activeStyle}
              focusVisibleStyle={arrow.focusVisibleStyle}
              disabledStyle={arrow.disabledStyle}
            >
              <View style={{ transform: [{ scaleX: -1 }] }}>
                <Icon name="back" size={icon} tint={colors.text} />
              </View>
            </CarouselNext>
          </View>
        </Carousel>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
