import { mount, signal, Text, View } from "nsh";

import {
  Button,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "../../../packages/ui";

/** A control beside the transcript, as an app's would be: the commands of the scroller above it. */
function Controls() {
  const { scrollToMessage } = useMessageScroller();
  return (
    <Button variant="secondary" onPress={() => scrollToMessage("2", { align: "center" })}>
      Jump to 2
    </Button>
  );
}

function App() {
  const offset = signal(0);
  const content = signal(0);
  const count = signal(8);
  const turns = () =>
    Array.from({ length: count() }, (_, i) => ({ id: i + 1, text: `Turn ${i + 1}` }));
  return (
    <View style={{ gap: 8 }}>
      <MessageScrollerProvider>
        <View style={{ gap: 8 }}>
          <MessageScroller style={{ width: 320, height: 240 }}>
            <MessageScrollerViewport
              each={turns()}
              keyExtractor={(turn) => String(turn.id)}
              accessibilityLabel="Conversation"
              estimatedItemSize={60}
              onScroll={(e) => {
                offset.set(Math.round(e.offset.y));
                content.set(Math.round(e.contentSize.height));
              }}
            >
              {(item) => (
                <MessageScrollerItem>
                  <View style={{ height: 60 }}>
                    <Text>{item().text}</Text>
                  </View>
                </MessageScrollerItem>
              )}
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
          <Controls />
        </View>
      </MessageScrollerProvider>
      <Button onPress={() => count.set(count() + 1)}>Send</Button>
      <Text>{`offset=${offset()}`}</Text>
      <Text>{`content=${content()}`}</Text>
      <Text>{`turns=${count()}`}</Text>
    </View>
  );
}

mount(App);
