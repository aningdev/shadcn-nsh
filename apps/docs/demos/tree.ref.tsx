// The reference of `tree.tsx`: `treeItemClass` / `TreeRow` on `nsh/base`'s Tree.
import { terminal } from "@shadcn-nsh/theme";
import { mount } from "nsh";
import { Tree, type TreeItem } from "nsh/base";

import { TreeRow, treeItemClass } from "@/packages/ui/tree";

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
          <Tree
            items={items}
            defaultExpanded={["src"]}
            reveal
            class="border-border bg-card overflow-hidden rounded-lg border"
            listClass={terminal ? "" : "p-1.5"}
            itemClass={treeItemClass}
            renderItem={(entry) => <TreeRow entry={entry} />}
            style={{ width: 280, maxHeight: 220 }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
