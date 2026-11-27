import type { TextStyle, ViewStyle } from "nsh";
import { Text, View, mount, platform, safeArea, windowSize } from "nsh";

// Family 6: tooltip, popover, dialog, sheet, toast — every surface, in the first screen.
import {
  alpha,
  colors,
  control,
  feedback,
  font,
  rounded,
  shape,
  stroke,
  surface,
  surfaceBorderWidth,
  terminal,
} from "../../packages/theme";
import {
  Button,
  Toast,
  buttonLabel,
  buttonLook,
  dialogText,
  dialogTitle,
  popoverLook,
  pressSink,
  pressTransition,
  sheetPanel,
  tooltipNote,
} from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

const box = { width: 220, flexShrink: 0 };

/** The card a dialog wears, from the public theme roles `dialogCard` reads. The look itself stays in `dialog.tsx`. */
function dialogFace(width: number): ViewStyle {
  const modal = surface("modal").style;
  const glass: ViewStyle = {};
  if (modal.backdropFilter !== undefined) glass.backdropFilter = modal.backdropFilter;
  if (modal.glassEffect !== undefined) glass.glassEffect = modal.glassEffect;
  if (modal.glassTintColor !== undefined) glass.glassTintColor = modal.glassTintColor;
  return {
    margin: "auto",
    width,
    maxWidth: "90%",
    ...rounded(shape.modal),
    borderWidth: terminal
      ? stroke.hairline
      : surfaceBorderWidth(modal.borderColor as string | undefined),
    padding: 20,
    gap: 12,
    maxHeight: windowSize().height - safeArea().top - safeArea().bottom - 48,
    ...(terminal
      ? { borderColor: colors.border }
      : {
          backgroundColor: modal.backgroundColor,
          boxShadow: modal.boxShadow,
          borderColor: modal.borderColor,
          ...glass,
        }),
  };
}

/** The tooltip bubble's class. The page paints `box` over the inverse surface, so only the class shows. */
function tooltipClass(rich?: boolean) {
  return rich
    ? "gap-2 rounded-(--radius-lg) p-2.5"
    : "flex-row items-center gap-2 rounded-(--radius-md) px-2 py-1";
}

/** The sheet grabber: one 36×5 pill, private to `sheet.tsx`. */
function sheetGrabberFace(): ViewStyle {
  const height = 5;
  return {
    width: 36,
    height,
    borderRadius: Math.ceil(height / 2),
    alignSelf: "center",
    backgroundColor: alpha(colors.mutedForeground, 0.4),
  };
}

/** A toast's title: 14 points semibold, the inverse ink. Private to `toast.tsx`. */
function toastTitleFace(): TextStyle {
  return { fontSize: 14, fontWeight: font.weight("title"), color: surface("inverse").ink };
}

/** A toast's description: 13 points, tabular, the inverse ink. */
function toastTextFace(): TextStyle {
  return { fontSize: 13, color: surface("inverse").ink, fontVariant: ["tabular-nums"] };
}

const toastActionSize = platform.desktop
  ? { style: { paddingHorizontal: 10 } }
  : { size: "sm" as const };

function toastActionFace() {
  return buttonLook("default", toastActionSize);
}

function toastActionLabelFace(): TextStyle {
  const label = buttonLabel("default", toastActionSize);
  return {
    get color() {
      return control("button").selected.ink;
    },
    get fontSize() {
      return label.fontSize;
    },
    get fontWeight() {
      return label.fontWeight;
    },
  };
}

function toastCloseFace() {
  return {
    style: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
      ...rounded(shape.container),
      ...pressTransition("background-color"),
    } as ViewStyle,
    get hoverStyle(): ViewStyle {
      return feedback.hoverStyle("foreground");
    },
    get activeStyle(): ViewStyle {
      return {
        ...(feedback.pressOverlay > 0
          ? feedback.press("surface", { ink: "foreground" }).activeStyle
          : { backgroundColor: alpha(surface("inverse").ink, 0.1) }),
        ...pressSink(0.9).activeStyle,
      };
    },
    get focusVisibleStyle(): ViewStyle {
      return feedback.focusRing();
    },
  };
}

function SheetFrame(props: { side: "bottom" | "right"; children: unknown }) {
  const bottom = props.side === "bottom";
  return (
    <View
      style={{
        width: 220,
        height: bottom ? 132 : 116,
        backgroundColor: colors.mutedForeground,
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
        <View class={tooltipClass()} style={box}>
          <Text class="text-xs">Saved</Text>
        </View>
      </Row>
      <Row label="rich">
        <View class={tooltipClass(true)} style={box}>
          <Text class="text-xs">Share</Text>
          <Text style={tooltipNote()}>Anyone with the link</Text>
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
        <View style={[dialogFace(220), box, { margin: 0, maxWidth: 220, gap: 12 }]}>
          <Text style={dialogTitle()}>Delete file?</Text>
          <Text style={dialogText()}>This cannot be undone.</Text>
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
            <Button size="sm" variant="secondary" disabled>
              Cancel
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </View>
        </View>
      </Row>
      <Row label="bottom">
        <SheetFrame side="bottom">
          <View style={sheetPanel("bottom") as ViewStyle}>
            <View style={sheetGrabberFace()} />
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
            <Text style={toastTitleFace()}>Deleted</Text>
            <Text style={toastTextFace()}>Undo to restore.</Text>
          </View>
          <Button {...toastActionFace()}>
            <Text style={toastActionLabelFace()}>Undo</Text>
          </Button>
          <View {...toastCloseFace()} accessibilityLabel="Dismiss">
            <Text style={{ fontSize: 14 }}>×</Text>
          </View>
        </Toast>
      </Row>
    </Panel>
  </Page>
));
