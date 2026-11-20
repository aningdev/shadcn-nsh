import { mount, Text } from "nsh";

import { EmojiPanel } from "../../../packages/ui";

function App() {
  return (
    <>
      <EmojiPanel testID="emoji-panel" accessibilityLabel="Pick an emoji" onSelect={() => {}} />
      <Text>emoji panel</Text>
    </>
  );
}

mount(App);
