// Tree: expanded, collapsed, selected, disabled row, and a disabled tree.
// The shot window is 390 wide, so each tree has a fixed width and labels stay one line.
import { colors } from "@shadcn-nsh/theme";
import { Tree } from "@shadcn-nsh/ui";
import { mount, Text, View } from "nsh";
import type { TreeItem } from "nsh/base";

import { Page, Panel } from "./demo-kit";

const files: TreeItem[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "main", label: "main.rs" },
      { id: "skip", label: "skip.rs", disabled: true },
      { id: "lib", label: "lib.rs" },
    ],
  },
  {
    id: "assets",
    label: "assets",
    children: [{ id: "logo", label: "logo.png" }],
  },
  { id: "notes", label: "notes.txt" },
];

const box = { width: 300 };

function Caption(props: { children: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.mutedForeground, numberOfLines: 1 }}>
      {props.children}
    </Text>
  );
}

function TreePage() {
  return (
    <Page>
      <Panel title="Tree">
        <View style={{ gap: 8 }}>
          <Caption>Expanded, selected, disabled row, collapsed</Caption>
          <Tree
            style={{ ...box, height: 220 }}
            items={files}
            defaultExpanded={["src"]}
            defaultSelected="main"
            accessibilityLabel="Files"
          />
        </View>
        <View style={{ gap: 8 }}>
          <Caption>Disabled tree</Caption>
          <Tree
            style={{ ...box, height: 64 }}
            items={[
              { id: "lock", label: "Locked folder", children: [{ id: "x", label: "Hidden" }] },
            ]}
            disabled
            accessibilityLabel="Locked files"
          />
        </View>
      </Panel>
    </Page>
  );
}

mount(TreePage);
