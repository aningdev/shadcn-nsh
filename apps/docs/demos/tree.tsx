import { mount } from "nsh";
import type { TreeItem } from "nsh/base";

import { Tree } from "@/packages/ui/tree";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const items: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "app", label: "App.tsx" },
      { id: "kit", label: "kit.tsx" },
    ],
  },
  { id: "readme", label: "README.md" },
];

function App() {
  return (
    <DemoPage title="Tree">
      <DemoCard>
        <DemoSection title="Default">
          <Tree items={items} defaultExpanded={["src"]} style={{ width: 280, maxHeight: 220 }} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
