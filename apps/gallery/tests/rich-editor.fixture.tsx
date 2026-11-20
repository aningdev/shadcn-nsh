import { mount, Text, View } from "nsh";

import { createRichEditor, RichEditor, StarterKit } from "../../../packages/ui";

// A level-2 heading and a plain paragraph: the look's `text-2xl font-semibold` heading, and a
// paragraph the app's `text-xl` should restyle without taking the heading's classes with it.
const DOC = `## A heading

A plain paragraph.
`;

function App() {
  const session = createRichEditor({ extensions: [StarterKit], content: DOC, format: "markdown" });
  return (
    <View style={{ padding: 12 }}>
      <RichEditor
        editor={session}
        accessibilityLabel="Document"
        classes={{ nodes: { paragraph: "text-xl" } }}
        style={{ width: 480, height: 200 }}
      />
      <Text>done</Text>
    </View>
  );
}

mount(App);
