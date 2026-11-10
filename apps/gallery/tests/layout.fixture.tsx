import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
  carouselVariants,
  DockArea,
  ResizablePanel,
  ResizablePanelGroup,
  resizableVariants,
} from "@shadcn-nsh/ui";
import { mount, platform, signal, Text, View } from "nsh";
import type { DockAreaLayout } from "nsh/base";

const NAMES = ["Harbor", "Dunes", "Glacier"];

const dockLayout: DockAreaLayout = {
  center: {
    type: "split",
    axis: "horizontal",
    children: [{ type: "tabs", panels: ["Readme", "Main"], activeIndex: 0 }],
  },
  left: { layout: { type: "tabs", panels: ["Files"] }, size: 100 },
};

function slide(which: string, name: string, index: number) {
  return (
    <CarouselItem accessibilityLabel={`${which} ${name}`}>
      <Text>{`${which} ${index}`}</Text>
    </CarouselItem>
  );
}

function dot(which: string, index: number) {
  return (
    <CarouselPaginationItem index={index} accessibilityLabel={`${which} slide ${index + 1}`} />
  );
}

function Photos(props: {
  which: string;
  index: () => number;
  set: (index: number) => void;
  looping?: boolean;
}) {
  return (
    <Carousel
      index={props.index()}
      looping={props.looping}
      accessibilityLabel={`${props.which} photos`}
      onChange={(event) => props.set(event.index)}
    >
      <CarouselContent style={{ width: 240, height: 48 }}>
        {NAMES.map((name, i) => slide(props.which, name, i))}
      </CarouselContent>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <CarouselPrevious accessibilityLabel={`Previous ${props.which}`} />
        <CarouselPagination>{NAMES.map((_, i) => dot(props.which, i))}</CarouselPagination>
        <CarouselNext accessibilityLabel={`Next ${props.which}`} />
      </View>
    </Carousel>
  );
}

function App() {
  const sizes = signal("none");
  const active = signal("Readme");
  const start = signal(0);
  const loop = signal(2);
  const sink = () => {
    const activeStyle = carouselVariants().arrow.activeStyle;
    return activeStyle != null && "transform" in activeStyle ? "move" : "still";
  };
  return (
    <View style={{ width: 360, gap: 8 }}>
      <Text>{`dot=${carouselVariants().dotSize}`}</Text>
      <Text>{`arrow=${carouselVariants().arrowMin}`}</Text>
      <Text>{`sink=${sink()}`}</Text>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <ResizablePanelGroup
        style={{ width: 320, height: 80 }}
        handleAccessibilityLabel="Resize the sidebar"
        onResize={(event) => sizes.set(event.sizes.map((n) => Math.round(n)).join(","))}
      >
        <ResizablePanel size={120} minSize={80}>
          <Text>Files</Text>
        </ResizablePanel>
        <ResizablePanel>
          <Text>Editor</Text>
        </ResizablePanel>
      </ResizablePanelGroup>
      <ResizablePanelGroup style={{ width: 320, height: 40 }}>
        <ResizablePanel visible={false}>
          <Text>Secret</Text>
        </ResizablePanel>
        <ResizablePanel>
          <Text>Sidebar hidden</Text>
        </ResizablePanel>
      </ResizablePanelGroup>
      <DockArea
        style={{ width: 320, height: 140 }}
        defaultLayout={dockLayout}
        onPanelActiveChange={(event) => {
          if (event.active) active.set(event.panel);
        }}
        renderPanel={(panel) => <Text>{`open ${panel.id}`}</Text>}
      />
      <Photos which="start" index={start} set={(index) => start.set(index)} />
      <Photos which="loop" index={loop} set={(index) => loop.set(index)} looping />
      <Text>{`sizes=${sizes()}`}</Text>
      <Text>{`active=${active()}`}</Text>
      <Text>{`start=${start()}`}</Text>
      <Text>{`loop=${loop()}`}</Text>
      <Text>{`secret=${false}`}</Text>
      <Text>{`across=${resizableVariants().handleClass}`}</Text>
      <Text>{`along=${resizableVariants({ axis: "vertical" }).handleClass}`}</Text>
      <Text>{`thumb=${resizableVariants().handleThumbClass}`}</Text>
    </View>
  );
}

mount(App);
