import { mount } from "nsh";
import { createRichEditor, StarterKit } from "nsh/base";

import { RichEditor } from "@/packages/ui/editor";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const editor = createRichEditor({
  extensions: [StarterKit],
  content: "# Notes\n\nEdit **bold** and `code` in place.",
  format: "markdown",
});

function App() {
  return (
    <DemoPage title="Editor">
      <DemoCard padded={false}>
        <DemoSection title="Rich document">
          <RichEditor editor={editor} accessibilityLabel="Notes" style={{ height: 180 }} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
