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
} from "@/packages/ui/carousel";

const NAMES = ["Harbor", "Dunes", "Glacier"];

function slide(name: string, index: number) {
  return (
    <CarouselItem accessibilityLabel={`${index + 1} of ${NAMES.length}: ${name}`}>
      <Text style={{ fontSize: 16, color: colors.foreground }}>{name}</Text>
    </CarouselItem>
  );
}

function dot(index: number) {
  return <CarouselPaginationItem index={index} accessibilityLabel={`Photo ${index + 1}`} />;
}

function App() {
  const index = signal(0);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        justifyContent: "center",
      }}
    >
      <Carousel
        index={index()}
        onChange={(event) => index.set(event.index)}
        accessibilityLabel="Photos"
      >
        <CarouselContent style={{ height: 120 }}>
          {NAMES.map((name, i) => slide(name, i))}
        </CarouselContent>
        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <CarouselPrevious accessibilityLabel="Previous photo" />
          <CarouselPagination>{NAMES.map((_, i) => dot(i))}</CarouselPagination>
          <CarouselNext accessibilityLabel="Next photo" />
        </View>
      </Carousel>
    </View>
  );
}

mount(App);
