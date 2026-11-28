# TextView (/dev/docs/components/text-view)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add text-view
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { TextView } from "shadcn-nsh/text-view";
```

## Usage [#usage]

```tsx
import { TextView, textViewCaretClass, textViewClasses } from "@/components/ui/text-view";
```

```tsx
<TextView markdown={doc} />

<TextView
  markdown={streamingDoc}
  streamingCaret={<View class={textViewCaretClass} />}
/>
```

`TextView` merges `textViewClasses` into `classes` by default.

## Examples [#examples]

### Markdown [#markdown]

```tsx
<TextView markdown={"See the [guide](https://example.com).\n\n> A short note."} />
```

### Streaming [#streaming]

`streamingCaret` marks the end of text still arriving; `textViewCaretClass` is the caret's look.

```tsx
<TextView markdown={streamingDoc} streamingCaret={<View class={textViewCaretClass} />} />
```

### Copy on code blocks [#copy-on-code-blocks]

`codeBlockActions` puts buttons over each code block's top-right corner: ghost buttons that show
while a pointer hovers the block on a desktop and always on a touch screen. The `copy` action is
built in — it copies the block's code and shows a check for a moment — so a reply with a command
needs nothing more. Other ids are the app's: they are drawn with `renderCodeBlockAction`'s icon and
their press arrives at `onCodeBlockAction`.

````tsx
const GIT = "```sh\nnsh export --out backup.json\n```";

<TextView markdown={GIT} codeBlockActions={[{ id: "copy", label: "Copy code" }]} />;
````

The built-in copy's accessibility label is the action's `label`; give an app action its own
`renderCodeBlockAction` and handle `id` in `onCodeBlockAction`.

### A block of your own [#a-block-of-your-own]

An extension claims a Markdown shape for the app. A `language` claims a fence; `renderCustom`
receives the node, with `node.text` the fence's source, and returns the view to draw in its place.
Here a `chart` fence lists `label value` lines and becomes bars in the theme's brand color.

````tsx
const CHART_EXTENSIONS = [{ name: "chart", language: "chart" }];

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
        borderWidth: 1,
        borderColor: colors.line,
        borderRadius: 12,
        backgroundColor: colors.inset,
      }}
    >
      <Each of={bars} key={(bar) => bar.label}>
        {(bar) => (
          <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 11, color: colors.faint }}>{bar().value}</Text>
            <View
              style={{
                width: "100%",
                height: Math.max(4, Math.round((bar().value / max) * 64)),
                borderRadius: 6,
                backgroundColor: colors.brand,
              }}
            />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{bar().label}</Text>
          </View>
        )}
      </Each>
    </View>
  );
}

<TextView
  markdown={"```chart\nInstall 12\nBuild 34\nTest 21\nShip 8\n```"}
  extensions={CHART_EXTENSIONS}
  renderCustom={(node) => <Chart source={node.text ?? ""} />}
/>;
````

A `pattern` claims inline text instead (the next example), and `tag` and `container` claim a tag
or a wrapping block. `renderCustom` is called for every custom node in the document, so branch on
`node.name` when the app claims more than one shape.

### Inline chips [#inline-chips]

An inline extension replaces each match of its `pattern` with the node the app draws. Keep the
chip's `verticalAlign` at `middle` and its height under the line height, so the paragraph's lines
keep their spacing; `styles.root.lineHeight` gives the chip the room it needs.

```tsx
const CHIPS =
  "The install broke on T-0089 after nsh#810 and both were fixed in nsh#812 before T-0091 followed.";
const CHIP_EXTENSIONS = [
  { name: "task", pattern: "\\bT-\\d{4}\\b" },
  { name: "pr", pattern: "\\b[a-z-]+#\\d+\\b" },
];

<TextView
  markdown={CHIPS}
  extensions={CHIP_EXTENSIONS}
  styles={{ root: { fontSize: 17, lineHeight: 26 } }}
  renderCustom={(node) => (
    <View class="border-border bg-muted h-5 flex-row items-center gap-1.5 rounded-full border px-2 align-middle">
      <View
        class={
          node.name === "task"
            ? "bg-info size-1.5 rounded-full"
            : "bg-success size-1.5 rounded-full"
        }
      />
      <Text class="font-mono text-[13px] leading-4">{node.text}</Text>
    </View>
  )}
/>;
```

### Images that open [#images-that-open]

`onImagePress` reports the image that was pressed as `{ src, alt }`: the shape [`ImageViewer`](./image-viewer) takes. Hold it in a signal, and the viewer is open while it is set.

```tsx
const viewing = signal<ImageViewerImage | null>(null);

<TextView markdown={markdown} onImagePress={({ image }) => viewing.set(image)} />
<ImageViewer image={viewing()} onClose={() => viewing.set(null)} />;
```

## API [#api]

`TextView.parse`, `parseHtml`, and `plainText` are re-exported from base. Every prop of [`nsh/base` TextView](https://nsh.dev/elements/text-view) passes through.

| Part                                       | Props                                     | Description                                                                       |
| ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------- |
| `TextView`                                 | every `nsh/base` TextView prop; `classes` | A Markdown, HTML or block document; `classes` merges over `textViewClasses`       |
| `TextView.parse`, `parseHtml`, `plainText` | base's parsers                            | A document, parsed ahead of drawing                                               |
| `textViewClasses`                          | `{ link, tableGrid }`                     | Default classes merged into `classes`: brand underlined links and bordered tables |
| `textViewCaretClass`                       | —                                         | The streaming caret: a brand block a line high, pulsing                           |