import { mount } from "nsh";
// The reference of `editor.tsx`: `richEditorClasses` on `nsh/base`'s RichEditor.
import { createRichEditor, RichEditor, StarterKit } from "nsh/base";

import { richEditorClasses } from "@/packages/ui/editor";

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
          <RichEditor
            editor={editor}
            accessibilityLabel="Notes"
            classes={richEditorClasses}
            style={{ height: 180 }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
