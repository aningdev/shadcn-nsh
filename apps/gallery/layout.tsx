// Layout family: resizable handles, a dock's tab group, carousel ends and loop.
// The shot window is 390×844, so every state sits in that first screen.
import { colors } from "@shadcn-nsh/theme";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPagination,
  CarouselPaginationItem,
  CarouselPrevious,
  DockArea,
  ResizablePanel,
  ResizablePanelGroup,
  resizableVariants,
} from "@shadcn-nsh/ui";
import { mount, Text, View } from "nsh";
import type { DockAreaLayout } from "nsh/base";

import { Flow, Page, Panel, Row } from "./demo-kit";

const NAMES = ["Harbor", "Dunes", "Glacier"];

const dockLayout: DockAreaLayout = {
  center: {
    type: "split",
    axis: "horizontal",
    children: [{ type: "tabs", panels: ["Readme", "Main"], activeIndex: 0 }],
  },
  left: { layout: { type: "tabs", panels: ["Files", "Git"] }, size: 120 },
};

function Quiet(props: { children: string }) {
  return (
    <Text style={{ fontSize: 13, color: colors.foreground, numberOfLines: 1 }}>
      {props.children}
    </Text>
  );
}

/** A still grip. The live handle only shows these once the pointer is on it. */
function Grip(props: { label: string; kind: "hover" | "drag" | "focus" }) {
  const chrome = () => resizableVariants();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 16, height: 36, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            position: "absolute",
            width: 1,
            top: 0,
            bottom: 0,
            backgroundColor: colors.border,
          }}
        />
        <View style={chrome()[props.kind]} />
      </View>
      <Quiet>{props.label}</Quiet>
    </View>
  );
}

function slide(name: string) {
  return (
    <CarouselItem>
      <Quiet>{name}</Quiet>
    </CarouselItem>
  );
}

function dot(which: string, index: number) {
  return (
    <CarouselPaginationItem index={index} accessibilityLabel={`${which} slide ${index + 1}`} />
  );
}

function Slides(props: { which: string; index: number; looping?: boolean }) {
  return (
    <Carousel
      index={props.index}
      looping={props.looping}
      accessibilityLabel={`${props.which} photos`}
    >
      <CarouselContent style={{ height: 44 }}>{NAMES.map((name) => slide(name))}</CarouselContent>
      <View
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
      >
        <CarouselPrevious accessibilityLabel={`Previous ${props.which}`} />
        <CarouselPagination accessibilityLabel={`Choose ${props.which}`}>
          {NAMES.map((_, i) => dot(props.which, i))}
        </CarouselPagination>
        <CarouselNext accessibilityLabel={`Next ${props.which}`} />
      </View>
    </Carousel>
  );
}

function LayoutPage() {
  return (
    <Page>
      <Panel title="Resizable">
        <Row label="states">
          <Flow>
            <Grip label="hover" kind="hover" />
            <Grip label="drag" kind="drag" />
            <Grip label="focus" kind="focus" />
          </Flow>
        </Row>
        <Row label="split">
          <ResizablePanelGroup
            style={{ height: 44, flex: 1 }}
            handleAccessibilityLabel="Resize the sidebar"
          >
            <ResizablePanel size={120} minSize={80}>
              <Quiet>Files</Quiet>
            </ResizablePanel>
            <ResizablePanel>
              <Quiet>Editor</Quiet>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Row>
        <Row label="collapsed">
          <ResizablePanelGroup style={{ height: 44, flex: 1 }}>
            <ResizablePanel visible={false}>
              <Quiet>Secret</Quiet>
            </ResizablePanel>
            <ResizablePanel>
              <Quiet>Sidebar hidden</Quiet>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Row>
      </Panel>
      <Panel title="Dock">
        <DockArea style={{ height: 120, alignSelf: "stretch" }} defaultLayout={dockLayout} />
      </Panel>
      <Panel title="Carousel">
        <Row label="start">
          <View style={{ flex: 1 }}>
            <Slides which="start" index={0} />
          </View>
        </Row>
        <Row label="end">
          <View style={{ flex: 1 }}>
            <Slides which="end" index={2} />
          </View>
        </Row>
        <Row label="loop">
          <View style={{ flex: 1 }}>
            <Slides which="loop" index={2} looping />
          </View>
        </Row>
      </Panel>
    </Page>
  );
}

mount(LayoutPage);
