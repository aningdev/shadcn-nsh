import { Scroll, Text, View, mount, type ScrollRef } from "nsh";

// Scrollbar: the thumb visible (always) over a fixed list, nothing open over it.
import { colors } from "../../packages/theme";
import { Scrollbar } from "../../packages/ui";
import { Page, Panel } from "./demo-kit";

const messages = [
  "Ada · Shipped the build",
  "Grace · Review when you can",
  "Linus · Tests are green",
  "Ken · Moved the meeting",
  "Nia · Draft is ready",
  "Ida · Notes attached",
  "Omar · Shipping Friday",
  "Ruth · See you then",
];

function row(line: string) {
  return (
    <Text
      style={{
        width: 260,
        fontSize: 13,
        color: colors.text,
        padding: 8,
        numberOfLines: 1,
      }}
    >
      {line}
    </Text>
  );
}

mount(() => {
  // NSH fills this binding through `ref={inbox}`.
  // eslint-disable-next-line no-unassigned-vars
  let inbox: ScrollRef | undefined;
  return (
    <Page>
      <Panel title="Scrollbar">
        <Text style={{ fontSize: 12, color: colors.muted, numberOfLines: 1 }}>Always on</Text>
        <View style={{ width: 280, height: 180, position: "relative" }}>
          <Scroll
            ref={inbox}
            scrollbar={false}
            style={{ width: 280, height: 180 }}
            accessibilityLabel="Inbox"
          >
            {messages.map((line) => row(line))}
          </Scroll>
          <Scrollbar scroll={inbox} mode="always" accessibilityLabel="Messages" />
        </View>
      </Panel>
    </Page>
  );
});
