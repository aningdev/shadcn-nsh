import { mount, platform, signal, Scroll, Text, View, type ScrollRef } from "nsh";

import { Scrollbar, scrollbarTheme } from "../../../packages/ui";

function App() {
  const offset = signal(0);
  // eslint-disable-next-line no-unassigned-vars
  let inbox: ScrollRef | undefined;
  const chrome = scrollbarTheme.vertical!;
  const across = scrollbarTheme.horizontal!;
  return (
    <View>
      <View style={{ width: 200, height: 120, position: "relative" }}>
        <Scroll
          ref={inbox}
          scrollbar={false}
          style={{ width: 200, height: 120 }}
          accessibilityLabel="Inbox"
          onScroll={(e) => offset.set(Math.round(e.offset.y))}
        >
          <View style={{ height: 560 }} />
        </Scroll>
        <Scrollbar scroll={inbox} mode="always" accessibilityLabel="Messages" />
      </View>
      <Text>{`offset=${offset()}`}</Text>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`thumb=${chrome.thumbClass}`}</Text>
      <Text>{`across=${across.thumbClass}`}</Text>
      <Text>{`motion=${scrollbarTheme.motion!.enter}|${scrollbarTheme.motion!.exit}`}</Text>
      <Text>{`mode=${scrollbarTheme.mode}`}</Text>
    </View>
  );
}

mount(App);
