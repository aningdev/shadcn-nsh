import { mount, signal, Text, View } from "nsh";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "../../../packages/ui";

/** The edges as the hook reads them, for the test to watch. */
function Edges() {
  const api = useMessageScroller();
  return (
    <View>
      <Text>{`atStart=${api.atStart}`}</Text>
      <Text>{`atEnd=${api.atEnd}`}</Text>
    </View>
  );
}

function App() {
  const offset = signal(0);
  const turns = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, text: `Turn ${i + 1}` }));
  return (
    <MessageScrollerProvider>
      <View style={{ gap: 8 }}>
        <MessageScroller initialScroll="start" style={{ width: 320, height: 240 }}>
          <MessageScrollerViewport
            each={turns}
            keyExtractor={(turn) => String(turn.id)}
            accessibilityLabel="Conversation"
            estimatedItemSize={60}
            onScroll={(e) => offset.set(Math.round(e.offset.y))}
          >
            {(item) => (
              <MessageScrollerItem>
                <View style={{ height: 60 }}>
                  <Text>{item().text}</Text>
                </View>
              </MessageScrollerItem>
            )}
          </MessageScrollerViewport>
          <MessageScrollerButton direction="end" />
        </MessageScroller>
        <Edges />
        <Text>{`offset=${offset()}`}</Text>
      </View>
    </MessageScrollerProvider>
  );
}

mount(App);
