import { Scrollbar, scrollbarVariants } from "@shadcn-nsh/ui";
import { mount, platform, signal, Scroll, Text, View, type ScrollRef } from "nsh";

function App() {
  const offset = signal(0);
  // NSH fills this binding through `ref={inbox}`.
  // eslint-disable-next-line no-unassigned-vars
  let inbox: ScrollRef | undefined;
  const chrome = () => scrollbarVariants();
  const across = () => scrollbarVariants({ axis: "horizontal" });
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
      <Text>{`thumb=${chrome().thumbClass}`}</Text>
      <Text>{`across=${across().thumbClass}`}</Text>
      <Text>{`motion=${chrome().motion.enter}|${chrome().motion.exit}`}</Text>
      <Text>{`mode=${chrome().mode}`}</Text>
    </View>
  );
}

mount(App);
