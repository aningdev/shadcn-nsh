// Family 6: tooltip, popover, dialog, sheet, toast — every surface, in the first screen.
import { colors } from "@shadcn-nsh/theme";
import {
  Button,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogCardStyle,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  popoverSurface,
  SheetDescription,
  SheetTitle,
  sheetGrabberStyle,
  sheetPanelStyle,
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  tooltipBubbleStyle,
  tooltipLabelStyle,
  tooltipNoteStyle,
} from "@shadcn-nsh/ui";
import type { ViewStyle } from "nsh";
import { Text, View, mount } from "nsh";

import { Page, Panel, Row } from "./demo-kit";

/** Fixed card width: the row's label takes 84, and a 390-wide page leaves about 224. */
const box = { width: 220, flexShrink: 0 };

/**
 * The real panel is a drawer: no border on the screen edge, and a side drawer is up to 360 wide.
 * In the row that overflows and looks cut off, so the specimen keeps the chrome and corners but
 * sits inside a frame the size of the row, flush with the edge it comes from.
 */
function sheetBox(side: "bottom" | "right"): ViewStyle {
  const panel = sheetPanelStyle(side);
  return {
    backgroundColor: panel.backgroundColor,
    borderColor: panel.borderColor,
    boxShadow: panel.boxShadow,
    borderCurve: panel.borderCurve,
    borderWidth: panel.borderWidth,
    borderTopWidth: panel.borderTopWidth,
    borderBottomWidth: panel.borderBottomWidth,
    borderLeftWidth: panel.borderLeftWidth,
    borderRightWidth: panel.borderRightWidth,
    borderTopLeftRadius: panel.borderTopLeftRadius,
    borderTopRightRadius: panel.borderTopRightRadius,
    borderBottomLeftRadius: panel.borderBottomLeftRadius,
    borderBottomRightRadius: panel.borderBottomRightRadius,
    gap: panel.gap,
    paddingHorizontal: 16,
    paddingTop: side === "bottom" ? 8 : 16,
    paddingBottom: 16,
    width: side === "right" ? 156 : 220,
  };
}

function SheetFrame(props: { side: "bottom" | "right"; children: unknown }) {
  const bottom = props.side === "bottom";
  return (
    <View
      style={{
        width: 220,
        height: bottom ? 132 : 116,
        backgroundColor: colors.muted,
        borderRadius: 10,
        overflow: "hidden",
        justifyContent: bottom ? "flex-end" : "center",
        alignItems: bottom ? "stretch" : "flex-end",
      }}
    >
      {props.children as never}
    </View>
  );
}

mount(() => (
  <Page>
    <Panel title="Overlays">
      <Row label="line">
        <View style={[tooltipBubbleStyle(), box]}>
          <Text style={tooltipLabelStyle()}>Saved</Text>
        </View>
      </Row>
      <Row label="rich">
        <View style={[tooltipBubbleStyle(true), box]}>
          <Text style={tooltipLabelStyle()}>Share</Text>
          <Text style={tooltipNoteStyle()}>Anyone with the link</Text>
        </View>
      </Row>
      <Row label="popover">
        <View style={[popoverSurface(), box]}>
          <PopoverHeader>
            <PopoverTitle>Calendar</PopoverTitle>
            <PopoverDescription>Week of May 12.</PopoverDescription>
          </PopoverHeader>
        </View>
      </Row>
      <Row label="compact">
        <View style={[popoverSurface(true), box]}>
          <PopoverTitle>One short note</PopoverTitle>
        </View>
      </Row>
      <Row label="dialog">
        <View style={[dialogCardStyle(), box, { margin: 0, maxWidth: 220 }]}>
          <DialogHeader>
            <DialogTitle>Delete file?</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button size="sm" variant="outline" disabled>
              Cancel
            </Button>
            <Button size="sm">Delete</Button>
          </DialogFooter>
        </View>
      </Row>
      <Row label="bottom">
        <SheetFrame side="bottom">
          <View style={sheetBox("bottom")}>
            <View style={sheetGrabberStyle()} />
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Sort and price.</SheetDescription>
          </View>
        </SheetFrame>
      </Row>
      <Row label="right">
        <SheetFrame side="right">
          <View style={sheetBox("right")}>
            <SheetTitle>Drawer</SheetTitle>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>From the edge.</Text>
          </View>
        </SheetFrame>
      </Row>
      <Row label="toast">
        <Toast transitionStatus="present" style={box}>
          <View style={{ flex: 1, gap: 2 }}>
            <ToastTitle>Deleted</ToastTitle>
            <ToastDescription>Undo to restore.</ToastDescription>
          </View>
          <Button size="sm">Undo</Button>
          <ToastClose />
        </Toast>
      </Row>
    </Panel>
  </Page>
));
