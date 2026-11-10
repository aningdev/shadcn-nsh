import { colors } from "@shadcn-nsh/theme";
import { Scroll, Text, View, mount, type ScrollRef } from "nsh";

import { Scrollbar } from "@/packages/ui/scrollbar";

const messages = [
  "Ada · Shipped the build",
  "Grace · Review when you can",
  "Linus · Tests are green",
  "Ken · Moved the meeting",
  "Nia · Draft is ready",
  "Ida · Notes attached",
];

function App() {
  let inbox: ScrollRef | undefined;
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Scrollbar</Text>
      <View style={{ width: 280, height: 180, position: "relative" }}>
        <Scroll
          ref={inbox}
          scrollbar={false}
          style={{ width: 280, height: 180 }}
          accessibilityLabel="Inbox"
        >
          {messages.map((line) => (
            <Text
              style={{
                width: 260,
                fontSize: 14,
                color: colors.foreground,
                padding: 8,
                numberOfLines: 1,
              }}
            >
              {line}
            </Text>
          ))}
        </Scroll>
        <Scrollbar scroll={inbox} mode="always" accessibilityLabel="Messages" />
      </View>
    </View>
  );
}

mount(App);
