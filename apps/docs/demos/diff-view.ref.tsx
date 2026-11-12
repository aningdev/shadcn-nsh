// The reference of `diff-view.tsx`: `diffViewStyles` on `nsh/base`'s DiffView.
import { mount } from "nsh";
import { DiffView } from "nsh/base";

import { DiffHunkActions, diffViewStyles } from "@/packages/ui/diff-view";

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
            styles={diffViewStyles()}
            style={{ height: 140 }}
          />
        </DemoSection>
      </DemoCard>
      <DemoCard>
        <DemoSection title="Hunk actions">
          <DiffHunkActions index={0} tone="up" onRevert={() => {}} onKeep={() => {}} />
          <DiffHunkActions index={1} tone="down" onRevert={() => {}} onKeep={() => {}} />
          <DiffHunkActions index={2} iconOnly onRevert={() => {}} onKeep={() => {}} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
