import { colors, mono } from "@shadcn-nsh/theme";
// The reference of `text-view.tsx`: the same scenes with `textViewLinkClasses` on `nsh/base`'s
// TextView, the way the official examples (`references/nsh/website/demos/text-view.tsx`,
// `el-text-selection.tsx`) write it. It differs from the component page only in the parts it
// names.
import { cleanup, Image, mount, signal, Text, View } from "nsh";
import { TextView } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { ImageViewer, type ImageViewerImage } from "@/packages/ui/image-viewer";
import { Input } from "@/packages/ui/input";
import { density, sectionSurface } from "@/packages/ui/lib/surface";
import { textViewCaretClass, textViewLinkClasses } from "@/packages/ui/text-view";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { photoUrl } from "./photos";
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

/** A fence whose language the app draws itself, with the extension that claims it. */
const CHART = "```chart\nInstall 12\nBuild 34\nTest 21\nShip 8\n```";
const CHART_EXTENSIONS = [{ name: "chart", language: "chart" }];

/** Draws a `chart` fence: one bar per `label value` line, in the theme's brand color. */
function Chart(props: { source: string }) {
  const bars = props.source
    .trim()
    .split("\n")
    .map((line) => {
      const [label, raw] = line.trim().split(/\s+/);
      return { label, value: Number(raw) || 0 };
    });
  const max = Math.max(1, ...bars.map((bar) => bar.value));
  return (
    <View
      style={{
        height: 132,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        padding: 12,
        borderRadius: 12,
        ...ui().inset,
      }}
    >
      <Each of={bars} key={(bar) => bar.label}>
        {(bar) => (
          <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 11, color: ui().faint }}>{bar().value}</Text>
            <View
              style={{
                width: "100%",
                height: Math.max(4, Math.round((bar().value / max) * 64)),
                borderRadius: 6,
                backgroundColor: ui().accent,
              }}
            />
            <Text style={{ fontSize: 11, color: ui().muted }}>{bar().label}</Text>
          </View>
        )}
      </Each>
    </View>
  );
}

/** Task ids and pull requests claimed by two inline patterns and drawn as chips. */
const CHIPS =
  "The install broke on T-0089 after nsh#810 and both were fixed in nsh#812 before T-0091 followed.";
const CHIP_EXTENSIONS = [
  { name: "task", pattern: "\\bT-\\d{4}\\b" },
  { name: "pr", pattern: "\\b[a-z-]+#\\d+\\b" },
];

const GIT = "```sh\nnsh export --out backup.json\n```";

/** A photograph in the text: the page fetches it first, so two pages draw it alike. */
const IMAGE_ALT = "Sunrise over the launch pad";
const IMAGE_MD = `![${IMAGE_ALT}](${photoUrl("sunrise")})`;
const warmed = signal(false);
Promise.allSettled([Image.prefetch(photoUrl("sunrise"))]).then(() => warmed.set(true));

function App() {
  const text = signal(REPLY);
  const viewing = signal<ImageViewerImage | null>(null);
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
      <View style={{ width: "100%", maxWidth: 680, alignSelf: "center", gap: density.gap + 2 }}>
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

        <DemoCard>
          <DemoSection title="Copy on code blocks" axis="block">
            <TextView
              markdown={GIT}
              classes={textViewLinkClasses}
              codeBlockActions={[{ id: "copy", label: "Copy code" }]}
            />
            <Text style={{ fontSize: 12, color: ui().muted }}>
              The button over the block copies the command; it shows a check while it is copied.
            </Text>
          </DemoSection>

          <DemoSection title="A block of your own" axis="block">
            <TextView
              markdown={CHART}
              classes={textViewLinkClasses}
              extensions={CHART_EXTENSIONS}
              renderCustom={(node) => <Chart source={node.text ?? ""} />}
            />
          </DemoSection>

          <DemoSection title="Inline chips" axis="block">
            <TextView
              markdown={CHIPS}
              classes={textViewLinkClasses}
              extensions={CHIP_EXTENSIONS}
              styles={{ root: { fontSize: 17, lineHeight: 26 } }}
              renderCustom={(node) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    height: 20,
                    paddingHorizontal: 8,
                    borderWidth: 1,
                    borderColor: ui().border,
                    borderRadius: 999,
                    backgroundColor: colors.inset,
                    verticalAlign: "middle",
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: node.name === "task" ? ui().info : ui().up,
                    }}
                  />
                  <Text
                    style={{ fontFamily: mono(), fontSize: 13, lineHeight: 16, color: ui().text }}
                  >
                    {node.text}
                  </Text>
                </View>
              )}
            />
          </DemoSection>
          <DemoSection title="Images that open" axis="block">
            <TextView
              markdown={IMAGE_MD}
              classes={textViewLinkClasses}
              onImagePress={({ image }) => viewing.set(image)}
            />
            <Text style={{ fontSize: 12, color: ui().muted }}>
              A press on the picture reports it; the app hands it to an `ImageViewer`.
            </Text>
            <ImageViewer image={viewing()} onClose={() => viewing.set(null)} />
          </DemoSection>
        </DemoCard>
      </View>
      {/* The render check's cue: the photograph is there (or failed), so two pages draw the same. */}
      {() =>
        warmed() ? (
          <View testID="images-ready" style={{ position: "absolute", width: 1, height: 1 }} />
        ) : null
      }
    </DemoPage>
  );
}

mount(App);
