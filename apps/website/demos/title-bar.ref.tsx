// The reference of `title-bar.tsx`: the same page, the look spread on `nsh`'s own View instead of
// worn by the component. The render check requires the two to draw the same pixels.
import { colors, stroke, windowControls } from "@shadcn-nsh/theme";
import { Plus, X } from "lucide";
import { mount, Text, View } from "nsh";
import type { WindowControl } from "nsh/desktop";

import { Icon } from "@/packages/ui/lib/icons";
import {
  TITLE_BAR_HEIGHT,
  titleBarLook,
  type WindowControlsVariant,
} from "@/packages/ui/title-bar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

/** A window as a page can draw one: a bar over a document, the shell a window's parts sit in. */
function Window(props: { variant: WindowControlsVariant; title: string; lines: [string, string] }) {
  return (
    <View
      style={{
        borderWidth: stroke.hairline,
        borderColor: colors.border,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: colors.card,
      }}
    >
      <View
        style={{
          height: TITLE_BAR_HEIGHT,
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingStart: 12,
          // Caption buttons sit flush against the window's corner, as the platform draws them.
          paddingEnd: props.variant === "caption" ? 0 : 12,
          backgroundColor: colors.inset,
          borderBottomWidth: stroke.hairline,
          borderBottomColor: colors.line,
        }}
      >
        <If when={props.variant === "traffic-lights"}>
          <View style={[titleBarLook().controls("traffic-lights")]}>
            <Light control="close" />
            <Light control="minimize" />
            <Light control="maximize" />
          </View>
        </If>
        <Text
          style={{
            flex: 1,
            minWidth: 0,
            numberOfLines: 1,
            fontSize: 13,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          {props.title}
        </Text>
        <If when={props.variant === "caption"}>
          <View style={[titleBarLook().controls("caption")]}>
            <Cell control="minimize" />
            <Cell control="maximize" />
            <Cell control="close" />
          </View>
        </If>
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Text style={{ fontSize: 13, color: colors.foreground }}>{props.lines[0]}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.lines[1]}</Text>
      </View>
    </View>
  );
}

/** A traffic light, its window in front: the disc's look and the glyph's box. */
function Light(props: { control: WindowControl }) {
  return (
    <View style={[titleBarLook().light(props.control, true)]}>
      <View style={[titleBarLook().glyph(false)]}>
        <If when={props.control === "close"}>
          <Icon icon={X} size={8} tint={windowControls.ink} weight={2} />
        </If>
        <If when={props.control === "minimize"}>
          <View
            style={{
              width: 6,
              height: 1.5,
              borderRadius: 1,
              backgroundColor: windowControls.ink,
            }}
          />
        </If>
        <If when={props.control === "maximize"}>
          <Icon icon={Plus} size={8} tint={windowControls.ink} weight={2} />
        </If>
      </View>
    </View>
  );
}

/** A caption button: the cell's look and its glyph in the bar's ink. */
function Cell(props: { control: WindowControl }) {
  return (
    <View style={[titleBarLook().cell()]}>
      <If when={props.control === "close"}>
        <Icon icon={X} size={12} tint={colors.foreground} weight={1.25} />
      </If>
      <If when={props.control === "minimize"}>
        <View style={{ width: 10, height: 1, backgroundColor: colors.foreground }} />
      </If>
      <If when={props.control === "maximize"}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 1.5,
            borderWidth: stroke.hairline,
            borderColor: colors.foreground,
          }}
        />
      </If>
    </View>
  );
}

function App() {
  return (
    <DemoPage
      title="TitleBar"
      note="A title bar belongs to a window: TitleBar draws nothing in this preview, which has no window of the app's own. Run the page in an app (nsh run) and the bar is above the sections; the window controls below are parts, in windows this page draws."
    >
      <DemoCard>
        <DemoSection title="Traffic lights" axis="block">
          <Window
            variant="traffic-lights"
            title="Time sheet.nsh"
            lines={["Two days, 14 entries", "Saved a minute ago"]}
          />
        </DemoSection>
      </DemoCard>
      <DemoCard>
        <DemoSection title="Caption buttons" axis="block">
          <Window variant="caption" title="Notes.nsh" lines={["Three notes", "Edited today"]} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
