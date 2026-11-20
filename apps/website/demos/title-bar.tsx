// A window's controls on the bar the app draws: macOS's traffic lights at the leading end, Windows'
// and Linux's caption buttons at the trailing end, each a window this page draws around them.
//
// `TitleBar` itself draws nothing here: it is the bar of a window the app owns (`nsh/desktop`), and
// this preview has no window of the app's own. Run the page in an app (`nsh run`) and its bar is
// above the sections.
import { colors, stroke } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import {
  TITLE_BAR_HEIGHT,
  WindowControls,
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
          <WindowControls />
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
          <WindowControls variant="caption" />
        </If>
      </View>
      <View style={{ padding: 12, gap: 4 }}>
        <Text style={{ fontSize: 13, color: colors.foreground }}>{props.lines[0]}</Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.lines[1]}</Text>
      </View>
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
