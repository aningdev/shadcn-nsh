// The reference of `text-view.tsx`: `textViewLinkClasses` on `nsh/base`'s TextView.
import { mount } from "nsh";
import { TextView } from "nsh/base";

import { textViewLinkClasses } from "@/packages/ui/text-view";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Text view">
      <DemoCard>
        <DemoSection title="Markdown">
          <TextView
            markdown={"See the [guide](https://example.com).\n\n> A short note."}
            classes={textViewLinkClasses}
            style={{ width: 320 }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
