// The reference of `text-view.tsx`: the same scenes with `textViewLinkClasses` on `nsh/base`'s
// TextView, the way the official examples (`references/nsh/website/demos/text-view.tsx`,
// `el-text-selection.tsx`) write it. It differs from the component page only in the parts it
// names.
import { cleanup, mount, signal, Text, View } from "nsh";
import { TextView } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { textViewCaretClass, textViewLinkClasses } from "@/packages/ui/text-view";

import { DemoCard, DemoPage } from "./kit";
import { desktop, ui } from "./stage";

const REPLY = `## Moving to offline sync

Sync now runs **in the background**, and conflicts merge *per field*:

1. Export with \`nsh export\`
2. Check the dry run
3. Switch over

| Step   | Time  |
|--------|------:|
| Export | 2 min |
| Check  | 5 min |

\`\`\`sh
nsh export --out backup.json
\`\`\`

> [!TIP]
> ${desktop ? "Drag across the paragraphs to select them, then copy." : "Long-press a paragraph to copy it."}`;

const NOTES = "- Sync runs **in the background**\n- Conflicts merge *per field*";

function App() {
  const text = signal(REPLY);
  const streaming = signal(false);
  const pasted = signal("");
  let timer: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
    streaming.set(false);
  };
  cleanup(stop);
  // Replays the reply a few characters at a time, as a model streams it.
  const play = () => {
    stop();
    const tokens = REPLY.match(/\s*\S{1,4}|\s+/g) ?? [];
    let i = 0;
    text.set("");
    streaming.set(true);
    timer = setInterval(() => (i < tokens.length ? text.set(text() + tokens[i++]) : stop()), 40);
  };
  return (
    <DemoPage title="Text view">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Select across the paragraphs: one selection runs over them, Ctrl / Cmd+C copies."
          : "Long press a word, then drag the handles across the texts."}
      </Text>

      {/* The website centers a document at 680 points: so does this page. */}
      <View style={{ width: "100%", maxWidth: 680, alignSelf: "center", gap: 14 }}>
        <DemoCard>
          <TextView
            markdown={text()}
            options={{ streaming: streaming() }}
            streamingCaret={streaming() ? <View class={textViewCaretClass} /> : undefined}
            selectable
            classes={textViewLinkClasses}
          />
          <View style={{ flexDirection: "row" }}>
            <Button variant="secondary" disabled={streaming()} onPress={play}>
              {streaming() ? "Streaming…" : "Stream it again"}
            </Button>
          </View>
        </DemoCard>

        <DemoCard>
          <View selectable style={{ gap: 10 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: ui().text }}>Release notes</Text>
            <Text style={{ color: ui().text, lineHeight: 22 }}>
              Version 2.4 moves the app to offline sync.
            </Text>
            <TextView markdown={NOTES} classes={textViewLinkClasses} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ userSelect: "none", color: ui().faint }}>
                Updated (userSelect none)
              </Text>
              <Text style={{ color: ui().text }}>October 21</Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: ui().muted }}>
            Paste what you copied: the label marked userSelect none stays out of it.
          </Text>
          <Input
            multiline
            value={pasted()}
            onChange={({ value }) => pasted.set(value)}
            placeholder="Paste here"
            style={{ height: 110 }}
          />
          <Text style={{ fontSize: 12, color: ui().muted, fontVariant: ["tabular-nums"] }}>
            {`${pasted().length} characters, ${pasted() ? pasted().split("\n").length : 0} lines`}
          </Text>
        </DemoCard>
      </View>
    </DemoPage>
  );
}

mount(App);
