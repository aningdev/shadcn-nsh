import { mount } from "nsh";

import { DiffView } from "@/packages/ui/diff-view";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Diff view">
      <DemoCard padded={false}>
        <DemoSection title="Unified">
          <DiffView
            layout="unified"
            oldValue={'fn main() {\n    println!("alpha");\n}'}
            newValue={'fn main() {\n    println!("gamma");\n}'}
            language="rust"
            style={{ height: 140 }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
