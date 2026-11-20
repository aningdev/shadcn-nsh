import { mount, signal, Text, View } from "nsh";
import type { EmojiSkinTone } from "nsh/base";

import { EmojiTones } from "../../../packages/ui";

// The tone hand of the emoji picker: one hand, a press lays the six tones out beside it.
function App() {
  const tone = signal<EmojiSkinTone>("none");
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <EmojiTones tone={tone()} onChange={(next) => tone.set(next)} />
      <Text>{`tone=${tone()}`}</Text>
    </View>
  );
}

mount(App);
