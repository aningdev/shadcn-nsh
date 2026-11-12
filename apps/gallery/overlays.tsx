import type { ViewStyle } from "nsh";
import { Text, View, mount } from "nsh";

// Family 6: tooltip, popover, dialog, sheet, toast — every surface, in the first screen.
import { colors } from "../../packages/theme";
import {
  Button,
  Toast,
  dialogCard,
  dialogText,
  dialogTitle,
  popoverLook,
  sheetGrabber,
  sheetPanel,
  toastActionLabel,
  toastActionLook,
  toastCloseLook,
  toastText,
  toastTitle,
  tooltipLook,
  tooltipNote,
  tooltipText,
} from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

const box = { width: 220, flexShrink: 0 };

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
        <View class={tooltipLook().class} style={box}>
          <Text class={tooltipText}>Saved</Text>
        </View>
      </Row>
      <Row label="rich">
        <View class={tooltipLook({ rich: true }).class} style={box}>
          <Text class={tooltipText}>Share</Text>
          <Text class={tooltipNote}>Anyone with the link</Text>
        </View>
      </Row>
      <Row label="popover">
        <View style={[popoverLook(), box]}>
          <Text style={dialogTitle()}>Calendar</Text>
          <Text style={dialogText()}>Week of May 12.</Text>
        </View>
      </Row>
      <Row label="compact">
        <View style={[popoverLook({ compact: true }), box]}>
          <Text style={dialogTitle()}>One short note</Text>
        </View>
      </Row>
      <Row label="dialog">
        <View style={[dialogCard(220), box, { margin: 0, maxWidth: 220, gap: 12 }]}>
          <Text style={dialogTitle()}>Delete file?</Text>
          <Text style={dialogText()}>This cannot be undone.</Text>
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
            <Button size="small" variant="secondary" disabled>
              Cancel
            </Button>
            <Button size="small" variant="danger">
              Delete
            </Button>
          </View>
        </View>
      </Row>
      <Row label="bottom">
        <SheetFrame side="bottom">
          <View style={sheetPanel("bottom") as ViewStyle}>
            <View style={sheetGrabber()} />
            <Text style={dialogTitle()}>Filters</Text>
            <Text style={dialogText()}>Sort and price.</Text>
          </View>
        </SheetFrame>
      </Row>
      <Row label="right">
        <SheetFrame side="right">
          <View style={{ ...sheetPanel("right"), width: 156 }}>
            <Text style={dialogTitle()}>Drawer</Text>
            <Text style={dialogText()}>From the edge.</Text>
          </View>
        </SheetFrame>
      </Row>
      <Row label="toast">
        <Toast style={box}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={toastTitle()}>Deleted</Text>
            <Text style={toastText()}>Undo to restore.</Text>
          </View>
          <Button {...toastActionLook()}>
            <Text style={toastActionLabel()}>Undo</Text>
          </Button>
          <View {...toastCloseLook()} accessibilityLabel="Dismiss">
            <Text style={{ fontSize: 14 }}>×</Text>
          </View>
        </Toast>
      </Row>
    </Panel>
  </Page>
));
