import { createAnimatedValue, mount, Scroll, signal, Text, View } from "nsh";

import {
  CollapsingHeader,
  CollapsingHeaderBackdrop,
  CollapsingHeaderBar,
  CollapsingHeaderDescription,
  CollapsingHeaderTitle,
} from "../../../packages/ui/collapsing-header";

const OPEN = 168;
const BAR = 44;
const ROW = 36;

const rows = Array.from({ length: 60 }, (_, i) => `Entry ${i + 1}`);

function App() {
  const scroll = createAnimatedValue(0);
  const offset = signal(0);
  return (
    <View style={{ width: 320, height: 480 }}>
      <Text>{`offset=${offset()}`}</Text>
      <Scroll
        testID="page"
        accessibilityLabel="Page"
        scrollValue={scroll}
        onScroll={(event) => offset.set(Math.round(event.offset.y))}
        style={{ flex: 1 }}
      >
        <CollapsingHeader
          testID="header"
          scroll={scroll}
          expandedHeight={OPEN}
          collapsedHeight={BAR}
        >
          <CollapsingHeaderBackdrop testID="backdrop">
            <View testID="picture" style={{ width: 40, height: 40 }} />
          </CollapsingHeaderBackdrop>
          <CollapsingHeaderDescription testID="description">18 entries</CollapsingHeaderDescription>
          <CollapsingHeaderBar testID="bar">
            <CollapsingHeaderTitle testID="title">Recent</CollapsingHeaderTitle>
          </CollapsingHeaderBar>
        </CollapsingHeader>
        <View>
          <Each of={rows}>
            {(row) => (
              <View style={{ height: ROW, justifyContent: "center" }}>
                <Text>{row()}</Text>
              </View>
            )}
          </Each>
        </View>
      </Scroll>
    </View>
  );
}

mount(App);
