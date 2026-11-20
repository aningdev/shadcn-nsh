import { createAnimatedValue, mount, Scroll, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { RefreshIndicator } from "../../../packages/ui/refresh-indicator";

const HEIGHT = 72;

function App() {
  const refreshing = signal(false);
  const refreshed = signal(0);
  const pull = createAnimatedValue(0);
  const refresh = () => {
    if (refreshing()) return;
    refreshing.set(true);
    setTimeout(() => {
      refreshed.set(refreshed() + 1);
      refreshing.set(false);
    }, 300);
  };
  return (
    <View style={{ width: 300, height: 400 }}>
      <Text>refreshing {() => String(refreshing())}</Text>
      <Text>refreshed {() => refreshed()}</Text>
      <BaseButton onPress={refresh}>
        <Text>Reload</Text>
      </BaseButton>
      <View style={{ flex: 1 }}>
        <Scroll
          style={{ flex: 1 }}
          refreshing={refreshing()}
          onRefresh={refresh}
          pullValue={pull}
          refreshIndicator={{ height: HEIGHT }}
        >
          <View style={{ height: 800 }}>
            <Text>Rows</Text>
          </View>
        </Scroll>
        <RefreshIndicator
          testID="indicator"
          pull={pull}
          refreshing={refreshing()}
          height={HEIGHT}
        />
      </View>
    </View>
  );
}

mount(App);
