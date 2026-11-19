import { mount, Text, View } from "nsh";

import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "../../../packages/ui";

interface Turn {
  id: number;
  text: string;
}

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
  const turns = Array.from({ length: 2 }, (_, i) => ({ id: i + 1, text: `Turn ${i + 1}` }));
  return (
    <MessageScrollerProvider>
      <View style={{ gap: 8 }}>
        <MessageScroller initialScroll="start" style={{ width: 320, height: 240 }}>
          <MessageScrollerViewport
            each={turns}
            keyExtractor={(turn) => String(turn.id)}
            accessibilityLabel="Conversation"
            estimatedItemSize={60}
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
      </View>
    </MessageScrollerProvider>
  );
}

mount(App);
