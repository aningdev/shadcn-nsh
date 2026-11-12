import { mount } from "nsh";

import { TextView } from "@/packages/ui/text-view";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Text view">
      <DemoCard>
        <DemoSection title="Markdown">
          <TextView
            markdown={"See the [guide](https://example.com).\n\n> A short note."}
            style={{ width: 320 }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
