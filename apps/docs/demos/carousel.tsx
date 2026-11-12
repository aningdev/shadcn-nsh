import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Carousel,
  CarouselContent,
  CarouselDot,
  carouselSizes,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
} from "@/packages/ui/carousel";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage } from "./kit";

const SLIDES = ["Harbor", "Dunes", "Glacier"] as const;

function App() {
  const index = signal(0);
  const icon = carouselSizes.arrowIcon;

  return (
    <DemoPage title="Carousel" note={() => `${index() + 1} / ${SLIDES.length}`}>
      <DemoCard style={{ alignSelf: "stretch", gap: 12 }}>
        <Carousel
          index={index()}
          onChange={({ index: next }) => index.set(next)}
          accessibilityLabel="Photo slides"
        >
          <CarouselContent style={{ height: 120, borderRadius: 12, backgroundColor: colors.inset }}>
            {SLIDES.map((name, i) => (
              <CarouselItem accessibilityLabel={`${i + 1} of ${SLIDES.length}: ${name}`}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{name}</Text>
              </CarouselItem>
            ))}
          </CarouselContent>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CarouselPrevious accessibilityLabel="Previous slide">
              <Icon name="back" size={icon} tint={colors.text} />
            </CarouselPrevious>
            <CarouselPagination accessibilityLabel="Choose a slide">
              {SLIDES.map((_, i) => (
                <CarouselPaginationItem index={i} accessibilityLabel={`Slide ${i + 1}`}>
                  <CarouselDot selected={index() === i} />
                </CarouselPaginationItem>
              ))}
            </CarouselPagination>
            <CarouselNext accessibilityLabel="Next slide">
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
