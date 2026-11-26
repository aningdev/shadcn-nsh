import { mount, signal, Text, View } from "nsh";

import { Button } from "../../../packages/ui/button";
import { Input } from "../../../packages/ui/input";
import { createRejectShake, Roll } from "../../../packages/ui/lib/motion";
import { OtpInput } from "../../../packages/ui/otp-input";

// The motion an input takes: a rejected field shakes, a figure rolls, and less motion plays neither.
// `playing` is the helper's own state, which a screenshot cannot time: the transform a shake sets
// lands back at rest before the next frame is drawn. A test cannot time it either — the shake can
// start and end inside the press step — so `plays` counts what it played, which is the one fact
// that does not depend on when a frame is looked at.
function App() {
  const reject = signal(0);
  const amount = signal(10);
  const shake = createRejectShake(() => reject());
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Input testID="field" reject={reject()} />
      <OtpInput testID="code" length={4} reject={reject()} />
      <Roll value={amount()}>{`${amount()} €`}</Roll>
      <Button testID="reject" onPress={() => reject.update((n) => n + 1)}>
        Reject
      </Button>
      <Button testID="grow" onPress={() => amount.update((n) => n + 10)}>
        Grow
      </Button>
      <Text>{`plays=${shake.plays()} playing=${shake.playing() ? "yes" : "no"}`}</Text>
      <Text>{`reject=${reject()} amount=${amount()}`}</Text>
    </View>
  );
}

mount(App);
