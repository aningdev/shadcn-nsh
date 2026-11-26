// `nsh/base`'s `DiffView` lays the two texts out, highlights what changed within lines and
// collapses what did not; the texts are the app's: a change reverted or kept is reported
// (`onChange`) and set back here. The actions on each change and the navigator above are the
// app's, calling the ref.
//
// The gallery's `DiffDemo`, rebuilt on this library's `DiffView` (the same `nsh/base` view wearing
// `diffViewStyles()`), its `DiffHunkActions` (two chips over a fading row, tones from
// `diffHunkTone`), its `Segmented` for the source and the layout, and its `Button` for the tools.
import { colors, terminal } from "@shadcn-nsh/theme";
import { fontScale, platform, signal, Text, View } from "nsh";
import { type DiffStats, type DiffViewRef } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { DiffHunkActions, DiffView, diffHunkTone, diffViewStyles } from "@/packages/ui/diff-view";

import { Choice } from "./data-shared";

const OLD = `import { signal, Text, View } from "nsh";

/** A counter that starts at zero. */
export function Counter() {
  const count = signal(0);
  const label = () => "Count: " + count();
  return (
    <View onPress={() => count.set(count() + 1)}>
      <Text>{label()}</Text>
    </View>
  );
}

/** Formats a number for the badge. */
function badge(n: number) {
  return n > 99 ? "99+" : String(n);
}

/** The step of each press. */
const STEP = 1;

export default Counter;
`;

const NEW = `import { computed, signal, Text, View } from "nsh";

/** A counter that starts at \`initial\`. */
export function Counter(props: { initial?: number }) {
  const count = signal(props.initial ?? 0);
  const label = computed(() => \`Count: \${count()}\`);
  return (
    <View onPress={() => count.set(count() + STEP)} class="p-4">
      <Text>{label()}</Text>
    </View>
  );
}

/** Formats a number for the badge. */
function badge(n: number) {
  return n > 999 ? "999+" : String(n);
}

/** The step of each press. */
const STEP = 2;

export default Counter;
`;

/** How many lines `text` has. */
const lineCount = (text: string) => text.split("\n").length;

// Long, unwrapped lines: at a larger system text size (`fontScale`) each must stay on its own
// row, never wrap over the next (#1803).
const LONG_OLD = Array.from(
  { length: 24 },
  (_, i) => `export const value${i} = ${i}; // a long unwrapped filler line number ${i}`,
).join("\n");
const LONG_NEW = LONG_OLD.replace("value9 = 9;", "value9 = 9090;");

/** `git diff` of one file: shown as its hunks, each under its header. */
const PATCH = `diff --git a/src/layout.rs b/src/layout.rs
--- a/src/layout.rs
+++ b/src/layout.rs
@@ -12,6 +12,7 @@ impl Layout {
     pub fn measure(&mut self, node: NodeId, available: Size) -> Size {
         let style = self.style(node);
-        let size = taffy::compute(style, available);
+        let size = taffy::compute(style, available)
+            .max(style.min_size);
         self.cache.insert(node, size);
         size
     }
@@ -40,5 +41,5 @@ impl Layout {
     fn invalidate(&mut self, node: NodeId) {
-        self.cache.remove(&node);
+        self.cache.retain(|id, _| *id != node);
         for child in self.children(node) {
             self.invalidate(child);
         }
`;

/** A small secondary button (the library's `Button`, `buttonLook`). */
function Tool(props: { label: string; name: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Button
      accessibilityLabel={props.label}
      variant="secondary"
      size="sm"
      disabled={props.disabled}
      onPress={props.onPress}
    >
      {props.name}
    </Button>
  );
}

/**
 * DiffView: `nsh/base`'s `DiffView` of an edited component, split or unified, with a navigator
 * between the changes, Revert and Keep on each change, and a `git diff` patch shown as its hunks.
 */
export function DiffViewDemo() {
  const source = signal<"texts" | "long" | "patch">("texts");
  // Split while both sides have room; a narrow window starts unified, its lines as wide as the
  // view, so a change's actions cover less of them.
  const layout = signal<"split" | "unified">(platform.desktop ? "split" : "unified");
  const oldValue = signal(OLD);
  const newValue = signal(NEW);
  const stats = signal<DiffStats>({ added: 0, deleted: 0, hunks: 0 });
  const current = signal(0);
  const last = signal("");
  // Written after render, so a signal.
  const diff = signal<DiffViewRef | undefined>(undefined);

  // The counts follow the texts: the view reports them as it diffs.
  const counted = ({ stats: s }: { stats: DiffStats }) => {
    stats.set(s);
    current.set(Math.min(current(), Math.max(0, s.hunks - 1)));
  };

  const go = (index: number) => {
    current.set(index);
    diff()?.goToHunk(index);
  };

  return (
    <View class="flex-1 gap-3 p-4">
      <View class="flex-row flex-wrap items-center gap-3">
        <Choice
          options={[
            { value: "texts", label: "Texts" },
            { value: "long", label: "Long lines" },
            { value: "patch", label: "Patch" },
          ]}
          value={source()}
          onChange={(value) => source.set(value)}
          size="small"
        />
        <Choice
          options={[
            { value: "split", label: "Split" },
            { value: "unified", label: "Unified" },
          ]}
          value={layout()}
          onChange={(value) => layout.set(value)}
          size="small"
        />
      </View>

      <If when={source() === "texts"}>
        <View class="flex-row flex-wrap items-center gap-2">
          <Text class="text-muted-foreground text-xs tabular-nums">
            <Text style={{ color: colors.success }}>{`+${stats().added}`}</Text>{" "}
            <Text style={{ color: colors.destructive }}>{`−${stats().deleted}`}</Text>
            {` · ${stats().hunks === 0 ? "No changes" : `Change ${current() + 1} of ${stats().hunks}`}`}
          </Text>
          <View class="flex-1" />
          <Tool
            label="Previous change"
            name="↑"
            disabled={current() <= 0}
            onPress={() => go(current() - 1)}
          />
          <Tool
            label="Next change"
            name="↓"
            disabled={current() >= stats().hunks - 1}
            onPress={() => go(current() + 1)}
          />
          <Tool label="Expand all" name="Expand" onPress={() => diff()?.expandAll()} />
          <Tool label="Collapse all" name="Collapse" onPress={() => diff()?.collapseAll()} />
          <Tool
            label="Reset"
            name="Reset"
            onPress={() => {
              oldValue.set(OLD);
              newValue.set(NEW);
              last.set("Reset");
            }}
          />
        </View>
      </If>

      {/* As tall as the room, but no taller than the diff's rows (20 points each, and its border),
          so a short diff leaves no empty frame under its last line: a texts' diff split pairs its
          deleted lines with its added ones (as many rows as the longer text), unified lists both
          (its new lines and the deleted ones); a patch at most its own lines. */}
      <View
        class="border-border bg-card flex-1 overflow-hidden rounded-lg border"
        style={
          terminal
            ? undefined
            : {
                maxHeight:
                  2 +
                  20 *
                    fontScale() *
                    (source() === "long"
                      ? lineCount(LONG_NEW)
                      : source() === "patch"
                        ? lineCount(PATCH)
                        : layout() === "split"
                          ? Math.max(lineCount(oldValue()), lineCount(newValue()))
                          : lineCount(newValue()) + stats().deleted),
              }
        }
      >
        {() =>
          source() === "long" ? (
            <DiffView
              oldValue={LONG_OLD}
              newValue={LONG_NEW}
              language="util.ts"
              layout={layout()}
              styles={diffViewStyles()}
              onStatsChange={counted}
              expandAll
              class="flex-1"
            />
          ) : source() === "texts" ? (
            <DiffView
              ref={(r) => diff.set(r)}
              onStatsChange={counted}
              oldValue={oldValue()}
              newValue={newValue()}
              language="tsx"
              layout={layout()}
              styles={diffViewStyles()}
              renderHunkActions={(hunk) => (
                <DiffHunkActions
                  index={hunk.index}
                  iconOnly={!platform.desktop}
                  tone={diffHunkTone(hunk, layout())}
                  onRevert={() => diff()?.revertHunk(hunk.index)}
                  onKeep={() => diff()?.acceptHunk(hunk.index)}
                />
              )}
              onChange={({ change }) => {
                oldValue.set(change.oldValue);
                newValue.set(change.newValue);
                last.set("Changed");
              }}
              onLineNumberPress={({ line }) =>
                last.set(`Comment on ${line.side} line ${line.line + 1}`)
              }
              class="flex-1"
            />
          ) : (
            <DiffView
              patch={PATCH}
              onStatsChange={counted}
              layout={layout()}
              styles={diffViewStyles()}
              indicators="classic"
              renderSeparator={(sep) => (
                <View class="bg-muted flex-1 flex-row items-center gap-2 px-3">
                  <Text class="text-muted-foreground font-mono text-[11px]">
                    {sep.header ? `@@ ${sep.header.trim()}` : `${sep.lines} lines`}
                  </Text>
                </View>
              )}
              onLineNumberPress={({ line }) =>
                last.set(`Comment on ${line.side} line ${line.line + 1}`)
              }
              class="flex-1"
            />
          )
        }
      </View>

      <If when={source() === "long"}>
        <Text class="text-muted-foreground text-xs">
          {`Text size ${fontScale().toFixed(2)}× · raise the system text size: every line stays on its own row`}
        </Text>
      </If>

      {/* What the last action did; nothing until there is one. */}
      <If when={last()}>
        <Text class="text-muted-foreground text-xs">{last()}</Text>
      </If>
    </View>
  );
}
