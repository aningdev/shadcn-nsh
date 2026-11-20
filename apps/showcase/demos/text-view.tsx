import { colors, mono, motion, rounded, tints, shape } from "@shadcn-nsh/theme";
// TextView: the official gallery's scene (`references/nsh/examples/gallery/demos/TextViewDemo.tsx`)
// with this library's text view — Markdown, HTML, extensions, a streaming reply, and a selection
// that crosses views. The image viewer is this library's dialog as a page (`dialogPage`), its body
// given whole (`scroll={false}`): the lightbox takes the pinch and the swipe itself.
import { Code, Play, X } from "lucide";
import {
  cleanup,
  createAnimatedValue,
  effect,
  Image,
  keymap,
  safeArea,
  signal,
  Text,
  untracked,
  View,
} from "nsh";
import type { TextViewCustomNode, TextViewImage } from "nsh/base";

import { Button, buttonGlyph, IconButton } from "@/packages/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card";
import { Dialog, DialogContent, dialogPage } from "@/packages/ui/dialog";
import { Icon } from "@/packages/ui/lib/icons";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { TextView, textViewCaretClass, type TextViewRef } from "@/packages/ui/text-view";

import { DemoPage } from "../kit";

const MARKDOWN = `# Native Shell

**NSH** loads apps written in *TSX* into native apps at run time and renders them with each platform's ~~web views~~ own views. Press <kbd>${keymap.label("mod+k")}</kbd> to search the docs, or read [the guide](https://github.com/longbridge/nsh).

## How it works

1. The bundler compiles TSX to QuickJS bytecode
2. The runtime runs it on a native core
   - the reactive graph and the renderer are Rust
   - layout is Taffy (flex and grid)

- [x] Signed packages, checked before they run
- [x] Hot reload on save
- [ ] A styled component library (that one is yours)

| Platform | Views | Text |
|:---------|:------|-----:|
| iOS      | UIKit | CoreText |
| Android  | Android views | StaticLayout |
| Linux    | GTK 4 | Pango |

\`\`\`tsx
import { mount, Text } from "nsh";

mount(() => <Text class="text-lg font-semibold">Hello, NSH</Text>);
\`\`\`

> Only the app's code is JS: everything else is native.

![Starship between its towers at sunrise](https://pbs.twimg.com/media/HS8AAMSWwAEg-aG?format=jpg&name=medium)

> [!TIP]
> Long-press any paragraph to select and copy it.

> [!WARNING]
> Apps are never rebuilt once delivered, so nothing that reached \`main\` is removed.

A list stays smooth at $60$ frames a second, $16.7\\,\\text{ms}$ each.

$$
t_{\\text{frame}} = \\tfrac{1000}{60}\\,\\text{ms}
$$

The roots of $ax^2 + bx + c = 0$ are $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, and

$$
\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}, \\qquad \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}
$$

$$
f(x) = \\begin{cases} x^2 & x \\geq 0 \\\\ -x & \\text{otherwise} \\end{cases} \\qquad A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}
$$

<details>
<summary>Why QuickJS</summary>

It is small, starts fast and runs **bytecode** delivered with the app, so nothing is parsed on the device.

</details>

---

Numbers come from the gallery's benchmarks.[^1]

[^1]: Release builds on a mid-range phone and a 2021 laptop.
`;

const HTML = `<article>
  <header>
    <h1 id="nsh-0-1-0">NSH 0.1.0: native UI from TSX</h1>
    <p><small>Posted by the NSH team &middot; 6 min read &middot; <a href="https://github.com/longbridge/nsh" title="Repository">GitHub</a></small></p>
  </header>

  <section>
    <h2 id="highlights">Highlights</h2>
    <p>
      NSH    0.1.0 is our <b>first</b> release:   apps written in TSX load
      <i>at run time</i> into native apps, render with <u>each platform's own views</u>, and the
      <s>Node.js</s> <mark>pure Rust</mark> toolchain needs nothing else. Hot reload is
      <mark color="yellow">about 120 ms</mark>, and every bundle is checked before it
      <mark style="background-color: #fecaca">runs</mark>.
    </p>
    <p>
      Styles mean what they mean in a browser: <code>w-1/2</code> or <code>bg-sky-500/15</code>, spacing in
      steps of 2<sup>2</sup> pt, and text sets H<sub>2</sub>O as you would expect. Press <kbd>Ctrl</kbd> + <kbd>B</kbd>
      to fold the gallery's sidebar, or run <code>nsh run examples/gallery</code> to try it. Our first rule says it
      best: <q>QuickJS is the slowest link: JS does as little as possible</q>. The <abbr title="Just-in-time">JIT</abbr>-free
      runtime behind it is open source.
    </p>
    <figure>
      <a href="https://pbs.twimg.com/media/HTpJzwHWMAAIOgb?format=jpg&name=medium"><img src="https://pbs.twimg.com/media/HTpJzwHWMAAIOgb?format=jpg&name=small" alt="A booster under the arc of a launch" width="320" height="160"></a>
      <figcaption>The gallery on a phone, a desktop and the web, one app. <em>Tap to open it full size.</em></figcaption>
    </figure>
    <figure>
      <img src="https://pbs.twimg.com/media/HQ6i3NMW0AAA-TS?format=jpg&name=medium" alt="A Falcon Heavy on the pad under the moon" width="320" height="200">
      <figcaption>Where the renderer was written. <em>Press it to zoom in.</em></figcaption>
    </figure>
  </section>

  <section>
    <h2 id="getting-started">Getting started</h2>
    <h3>Step by step</h3>
    <ol start="3">
      <li>Create an app (steps 1 and 2 were installing Rust and building the CLI)</li>
      <li>Run <b>nsh run</b> and choose a target:
        <ul>
          <li><i>Desktop</i>: AppKit, Win32 or GTK 4, the default</li>
          <li><i>Mobile</i>: a simulator or a device
            <ol>
              <li>iOS with UIKit views</li>
              <li>or Android with Android views</li>
            </ol>
          </li>
        </ul>
      </li>
      <li>Edit, save, and watch it reload</li>
    </ol>

    <h3>Checklist</h3>
    <ul>
      <li><input type="checkbox" checked> Write the app in TSX</li>
      <li><input type="checkbox" checked> Test it headless with nsh test</li>
      <li><input type="checkbox"> Sign and publish the package</li>
    </ul>

    <h4>Terms</h4>
    <dl>
      <dt>Host</dt>
      <dd>The native app that embeds NSH and loads modules.</dd>
      <dt>Package</dt>
      <dd>A signed <code>.nshpkg</code>: an app's bundle, checked before it runs.</dd>
    </dl>
  </section>

  <section>
    <h2 id="components">Components</h2>
    <blockquote>
      <p>Nothing NSH ships has a look of its own: the app's classes and styles draw everything.</p>
      <p>&mdash; <cite>NSH's design rules</cite></p>
    </blockquote>
    <p>An app is a module that mounts a component:</p>
    <pre><code class="language-tsx">import { mount, signal, Text, View } from "nsh";

function Counter() {
  const count = signal(0);
  return (
    &lt;View class="p-4" onPress={() =&gt; count.set(count() + 1)}&gt;
      &lt;Text&gt;{\`Pressed \${count()} times\`}&lt;/Text&gt;
    &lt;/View&gt;
  );
}

mount(Counter);</code></pre>
  </section>

  <section>
    <h2 id="performance">Performance</h2>
    <table>
      <thead>
        <tr><th align="left">Operation</th><th align="right">Platform</th><th align="right">Time</th><th style="text-align: center">Items</th></tr>
      </thead>
      <tbody>
        <tr><td>Counter, first frame</td><td align="right">headless</td><td align="right">0.6 ms</td><td align="center">49</td></tr>
        <tr><td>Counter, one tap</td><td align="right">headless</td><td align="right">0.15 ms</td><td align="center">8</td></tr>
        <tr><td>List row while scrolling</td><td align="right">Android</td><td align="right">0.35 ms</td><td align="center">4</td></tr>
      </tbody>
      <tfoot>
        <tr><td colspan="3">Baselines from docs/dev/performance.md</td><td align="center">&#10003;</td></tr>
      </tfoot>
    </table>
  </section>

  <details>
    <summary>Known issues</summary>
    <p>Zooming scroll views run on iOS and Android only for now. The desktops follow in a later release.</p>
  </details>
  <details open>
    <summary>Thanks</summary>
    <p>
      NSH is created by <a href="https://github.com/sunli829"><img src="https://avatars.githubusercontent.com/u/20092316?s=48" alt="sunli829" style="width: 20px; height: 20px"></a> <a href="https://github.com/sunli829">@sunli829</a>
      and <a href="https://github.com/huacnlee"><img src="https://avatars.githubusercontent.com/u/5518?s=48" alt="huacnlee" width="20" height="20"></a> <a href="https://github.com/huacnlee">@huacnlee</a>,
      with&nbsp;&hearts;.
    </p>
  </details>
</article>`;

const EXTENDED = `Thanks @huacnlee and @sunli829 for the review! Fixed in #775 and #799.

\`\`\`chart
Mon 12
Tue 18
Wed 9
Thu 22
Fri 15
\`\`\`

<Callout kind="tip">

Extensions turn the app's own syntax into **custom nodes**.

</Callout>

:::note[Heads up]
Containers wrap Markdown, like *this*.
:::
`;

const extensions = [
  { name: "mention", pattern: "@(\\w+)" },
  { name: "issue", pattern: "#(\\d+)" },
  { name: "chart", language: "chart" },
  { name: "callout", tag: "callout" },
  { name: "note", container: "note" },
];

const REPLY = `Here is how to put **an NSH app** in your iOS app:

1. Build the SDK with \`cargo xtask ios-embed\`
2. Add *NativeShell.xcframework* to the project
3. Show the app in an \`NshAppView\`

| Step | Where |
|------|------:|
| SDK | your Mac |
| View | your app |

\`\`\`sh
nsh package my-app --target ios-simulator --run
\`\`\`

That's it. Ping me if anything looks off.`;

/** Task and PR ids in a chat message (`T-0042`, `nsh#810`): chips in the
 * middle of the text (`align-middle`) that keep its lines evenly spaced. */
const CHIPS = `Picked up T-0089 after the review of nsh#810: each chip sits in the middle of the text, and a line holding one is as tall as the others. T-0096 follows up on iOS and macOS, with gpui-kit#3766 next in the queue. 中文段落里的 T-0101 也一样，和文字居中对齐，行距保持一致。`;

const CHIP_EXTENSIONS = [
  { name: "task", pattern: "\\bT-\\d{4}\\b" },
  { name: "pr", pattern: "\\b[a-z-]+#\\d+\\b" },
];

/** The deepest zoom, and where a double tap zooms in to. */
const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
/** Two taps this close in time (ms) are a double tap. */
const DOUBLE_TAP_MS = 300;
/** A drag this far down (points) at 1× closes the viewer. */
const SWIPE_CLOSE = 120;

const clamp = (value: number, bound: number) => Math.max(-bound, Math.min(bound, value));

/**
 * A full-screen viewer for an image a `TextView` reports: the library's dialog as a page
 * (`dialogPage`), the lightbox on the page's own background.
 */
function ImageViewer(props: { image: TextViewImage | null; onClose: () => void }) {
  const shown = signal<TextViewImage | null>(null);
  const natural = signal<{ width: number; height: number } | null>(null);
  const viewport = signal({ width: 0, height: 0 });
  const scale = createAnimatedValue(1);
  const x = createAnimatedValue(0);
  const y = createAnimatedValue(0);
  const enter = createAnimatedValue(0);
  // Where the animated values settle. Signals, so a handler can write them after render.
  const atScale = signal(1);
  const atX = signal(0);
  const atY = signal(0);
  const lastTap = signal(0);
  const tapX = signal(0);
  const tapY = signal(0);
  const tapAt = signal(0);
  const src = signal("");

  effect(() => {
    const image = props.image;
    if (!image) return;
    if (image.src !== untracked(src)) natural.set(null);
    src.set(image.src);
    shown.set(image);
    atScale.set(1);
    atX.set(0);
    atY.set(0);
    scale.set(1);
    x.set(0);
    y.set(0);
    enter.set(0);
    void enter.spring(1, motion.settle);
  });

  const box = () => {
    const v = viewport();
    const n = natural();
    if (!n || !n.width || !n.height || !v.width) return v;
    const k = Math.min(v.width / n.width, v.height / n.height);
    return { width: n.width * k, height: n.height * k };
  };

  const settle = (next: { scale: number; x: number; y: number }) => {
    const s = Math.max(1, Math.min(MAX_ZOOM, next.scale));
    const b = box();
    const v = viewport();
    const nextX = clamp(next.x, Math.max(0, (b.width * s - v.width) / 2));
    const nextY = clamp(next.y, Math.max(0, (b.height * s - v.height) / 2));
    atScale.set(s);
    atX.set(nextX);
    atY.set(nextY);
    void scale.spring(s, motion.settle);
    void x.spring(nextX, motion.settle);
    void y.spring(nextY, motion.settle);
  };

  return (
    <Dialog open={!!props.image} onOpenChange={({ open }) => !open && props.onClose()}>
      <DialogContent animation="fade" scroll={false} style={dialogPage()}>
        <View
          testID="image-viewer"
          focusable={false}
          onPress={props.onClose}
          onLayout={({ bounds }) =>
            viewport.set({ width: bounds.size.width, height: bounds.size.height })
          }
          pinch={{ scale }}
          pan={{ x, y }}
          onPinchEnd={async () => settle({ scale: await scale.getValue(), x: atX(), y: atY() })}
          onPanEnd={(e) => {
            const dy = (e.value?.y ?? atY()) - atY();
            if (atScale() <= 1.01 && (dy > SWIPE_CLOSE || e.velocity.y > 1200))
              return props.onClose();
            settle({ scale: atScale(), x: e.value?.x ?? atX(), y: e.value?.y ?? atY() });
          }}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
          }}
        >
          <View
            accessibilityLabel={shown()?.alt || "Image"}
            role="image"
            onTouchStart={(e) => {
              tapX.set(e.locationX);
              tapY.set(e.locationY);
              tapAt.set(e.timestamp);
            }}
            onPress={(e) => {
              const now = tapAt();
              const previous = lastTap();
              const doubled =
                e.clickCount >= 2 || (previous > 0 && now - previous <= DOUBLE_TAP_MS);
              if (!doubled) {
                if (now > 0) lastTap.set(now);
                return;
              }
              lastTap.set(0);
              if (atScale() > 1.01) return settle({ scale: 1, x: 0, y: 0 });
              const b = box();
              const dx = tapX() - b.width / 2;
              const dy = tapY() - b.height / 2;
              settle({
                scale: DOUBLE_TAP_ZOOM,
                x: atX() + (atScale() - DOUBLE_TAP_ZOOM) * dx,
                y: atY() + (atScale() - DOUBLE_TAP_ZOOM) * dy,
              });
            }}
            style={{
              width: box().width,
              height: box().height,
              opacity: enter,
              translate: [x, y],
              scale: scale.mul(enter.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] })),
            }}
          >
            <Image
              src={shown()?.src ?? ""}
              onLoad={({ size }) => natural.set({ width: size.width, height: size.height })}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </View>
          <If when={shown()?.alt}>
            <View
              style={{
                pointerEvents: "none",
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                paddingHorizontal: 24,
                paddingTop: 32,
                paddingBottom: safeArea().bottom + 20,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  textAlign: "center",
                  color: colors.foreground,
                }}
              >
                {shown()?.alt}
              </Text>
            </View>
          </If>
          <View
            style={{ position: "absolute", top: safeArea().top + 12, right: safeArea().right + 12 }}
          >
            <IconButton accessibilityLabel="Close" size="sm" onPress={props.onClose}>
              <Icon icon={X} size={16} tint={colors.foreground} />
            </IconButton>
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}

function MarkdownDoc() {
  const pressed = signal("nothing yet");
  const viewing = signal<TextViewImage | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Markdown</CardTitle>
        <CardDescription>CommonMark and GitHub's: tables, tasks, math, HTML</CardDescription>
      </CardHeader>
      <CardContent>
        <TextView
          markdown={MARKDOWN}
          selectable
          codeBlockActions={[{ id: "copy", label: "Copy code" }]}
          onLinkPress={({ url }) => pressed.set(url)}
          onImagePress={({ image }) => viewing.set(image)}
        />
        <Text
          style={{ fontSize: 12, color: colors.mutedForeground }}
        >{`Link pressed: ${pressed()}`}</Text>
        <ImageViewer image={viewing()} onClose={() => viewing.set(null)} />
      </CardContent>
    </Card>
  );
}

function HtmlDoc() {
  const viewing = signal<TextViewImage | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>HTML</CardTitle>
        <CardDescription>An article page: sections, figures, lists, tables, code</CardDescription>
      </CardHeader>
      <CardContent>
        <TextView html={HTML} selectable onImagePress={({ image }) => viewing.set(image)} />
        <ImageViewer image={viewing()} onClose={() => viewing.set(null)} />
      </CardContent>
    </Card>
  );
}

/** A tiny bar chart of a ```chart block's lines ("Mon 12"). */
function Chart(props: { source: string }) {
  const bars = () =>
    props.source
      .split("\n")
      .map((line) => line.trim().split(/\s+/))
      .filter((parts) => parts.length === 2)
      .map(([label, value]) => ({ label, value: Number(value) || 0 }));
  const max = () => Math.max(1, ...bars().map((bar) => bar.value));
  return (
    <View
      style={{
        height: 112,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        ...rounded(shape.inset),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.inset,
        padding: 12,
      }}
    >
      <Each of={bars()}>
        {(bar) => (
          <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
            <View
              style={{
                width: "100%",
                borderRadius: 6,
                backgroundColor: colors.brand,
                height: (bar().value / max()) * 64,
              }}
            />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{bar().label}</Text>
          </View>
        )}
      </Each>
    </View>
  );
}

function renderExtension(node: TextViewCustomNode) {
  switch (node.name) {
    case "mention":
      return (
        <View
          style={{
            verticalAlign: "middle",
            borderRadius: 999,
            backgroundColor: tints.info,
            paddingHorizontal: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "500", color: colors.info }}>
            {`@${node.attributes?.["1"]}`}
          </Text>
        </View>
      );
    case "issue":
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 6,
            verticalAlign: "middle",
            height: 20,
          }}
        >
          <Icon icon={Code} size={14} tint={colors.foreground} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
            {`#${node.attributes?.["1"]}`}
          </Text>
        </View>
      );
    case "chart":
      return <Chart source={node.text ?? ""} />;
    case "callout":
      return (
        <View
          style={{
            flexDirection: "row",
            gap: 12,
            ...rounded(shape.inset),
            backgroundColor: tints.up,
            padding: 12,
          }}
        >
          <Text style={{ color: colors.up }}>✦</Text>
          <TextView document={{ blocks: node.children ?? [] }} style={{ flex: 1 }} />
        </View>
      );
    default:
      return (
        <View
          style={{
            gap: 4,
            ...rounded(shape.inset),
            borderWidth: 1,
            borderColor: colors.info,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 0.6,
              color: colors.info,
            }}
          >
            {node.attributes?.label ?? node.name}
          </Text>
          <TextView document={{ blocks: node.children ?? [] }} />
        </View>
      );
  }
}

function InlineChips() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inline chips</CardTitle>
        <CardDescription>Chips in the text; lines stay evenly spaced</CardDescription>
      </CardHeader>
      <CardContent>
        <TextView
          markdown={CHIPS}
          extensions={CHIP_EXTENSIONS}
          styles={{ root: { fontSize: 17, lineHeight: 26 } }}
          renderCustom={(node) => (
            <View
              style={{
                verticalAlign: "middle",
                height: 20,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.inset,
                paddingHorizontal: 8,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: node.name === "task" ? colors.info : colors.up,
                }}
              />
              <Text
                style={{
                  fontFamily: mono(),
                  fontSize: 13,
                  lineHeight: 16,
                  color: colors.foreground,
                }}
              >
                {node.text}
              </Text>
            </View>
          )}
        />
      </CardContent>
    </Card>
  );
}

function Mentions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extensions</CardTitle>
        <CardDescription>
          Mentions, issue chips with an icon, a chart block, a Callout tag, a note container
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TextView markdown={EXTENDED} extensions={extensions} renderCustom={renderExtension} />
      </CardContent>
    </Card>
  );
}

function ExtensionsDoc() {
  return (
    <View style={{ gap: 16 }}>
      <InlineChips />
      <Mentions />
    </View>
  );
}

function Caret() {
  return <View class={textViewCaretClass} />;
}

function StreamingDoc() {
  const text = signal("");
  const streaming = signal(false);
  const timer = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  const stop = () => {
    const running = timer();
    if (running !== undefined) clearInterval(running);
    timer.set(undefined);
    streaming.set(false);
  };
  cleanup(stop);
  const play = () => {
    stop();
    const tokens = REPLY.match(/\s*\S{1,4}|\s+/g) ?? [];
    let i = 0;
    text.set("");
    streaming.set(true);
    timer.set(
      setInterval(() => {
        if (i >= tokens.length) return stop();
        text.set(text() + tokens[i]);
        i += 1;
      }, 40),
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streaming</CardTitle>
        <CardDescription>A reply as an AI model writes it, with a caret</CardDescription>
      </CardHeader>
      <CardContent>
        <TextView
          markdown={text()}
          options={{ streaming: streaming() }}
          streamingCaret={streaming() ? <Caret /> : undefined}
          selectable
          codeBlockActions={[{ id: "copy", label: "Copy code" }]}
        />
        <Button
          variant="secondary"
          disabled={streaming()}
          accessibilityLabel={streaming() ? "Streaming…" : "Stream it"}
          onPress={play}
        >
          <>
            <Icon icon={Play} {...buttonGlyph("secondary", { disabled: () => streaming() })} />
            {streaming() ? "Streaming…" : "Stream it"}
          </>
        </Button>
      </CardContent>
    </Card>
  );
}

const QUESTION = "Which **platforms** does NSH run on?";

const ANSWER = `Every one with a native backend:

- iOS and Android: UIKit and Android views
- macOS, Windows and Linux: AppKit, Win32 and GTK 4`;

function SelectionAcross() {
  const selected = signal("");
  const chosen = signal("");
  const act = (action: string) => () => chosen.set(`${action} “${selected()}”`);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selectable view</CardTitle>
        <CardDescription>One selection across texts and TextViews</CardDescription>
      </CardHeader>
      <CardContent>
        <View
          selectable
          style={{ gap: 12 }}
          onSelectionChange={({ text }) => selected.set(text)}
          selectionMenu={[
            { label: "Highlight", onSelect: act("Highlight") },
            { type: "separator" },
            { label: "Define", onSelect: act("Define") },
          ]}
        >
          <TextView markdown={QUESTION} />
          <TextView markdown={ANSWER} />
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
            <Text style={{ userSelect: "none", fontSize: 13, color: colors.faint }}>
              Not selectable
            </Text>
            <Text style={{ fontSize: 15, color: colors.foreground }}>
              A plain Text joins the selection too.
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
          Drag from the question into the answer, or long press and move the handles
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
          {`Selected: ${selected() || "nothing"}`}
        </Text>
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
          {`Chosen from the selection menu: ${chosen() || "nothing yet"}`}
        </Text>
      </CardContent>
    </Card>
  );
}

const FORMATS = [
  { value: "plain", label: "Text" },
  { value: "markdown", label: "Markdown" },
  { value: "html", label: "HTML" },
] as const;

type Format = (typeof FORMATS)[number]["value"];

function SelectionRead() {
  const view = signal<TextViewRef | undefined>(undefined);
  const format = signal<Format>("markdown");
  const out = signal("");
  const read = async () => out.set((await view()?.selectedText({ format: format() })) ?? "");
  return (
    <Card>
      <CardHeader>
        <CardTitle>Read the selection</CardTitle>
        <CardDescription>selectedText of a TextView ref</CardDescription>
      </CardHeader>
      <CardContent>
        <TextView
          ref={(r) => view.set(r)}
          selectable
          markdown={ANSWER}
          onSelectionChange={() => void read()}
        />
        <Segmented
          value={format()}
          onValueChange={(next) => {
            format.set(next as Format);
            void read();
          }}
        >
          <SegmentedList>
            <Each of={FORMATS}>
              {(item) => <SegmentedItem value={item().value}>{item().label}</SegmentedItem>}
            </Each>
          </SegmentedList>
        </Segmented>
        <View style={{ ...rounded(shape.control), backgroundColor: colors.inset, padding: 12 }}>
          <Text
            style={{
              fontFamily: mono(),
              fontSize: 12,
              userSelect: "text",
              color: colors.foreground,
            }}
          >
            {out() || "Select part of the answer"}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}

function SelectionDoc() {
  return (
    <View style={{ gap: 16 }}>
      <SelectionAcross />
      <SelectionRead />
    </View>
  );
}

const TABS = [
  { value: "Markdown", label: "Markdown", body: MarkdownDoc },
  { value: "HTML", label: "HTML", body: HtmlDoc },
  { value: "Extensions", label: "Extensions", body: ExtensionsDoc },
  { value: "Streaming", label: "Streaming", body: StreamingDoc },
  { value: "Selection", label: "Selection", body: SelectionDoc },
] as const;

type Tab = (typeof TABS)[number]["value"];

/** One document at a time: a document wants the page's width. */
export function TextViewDemo() {
  const tab = signal<Tab>("Markdown");
  return (
    <DemoPage title="TextView">
      <View style={{ gap: 16 }}>
        <Segmented value={tab()} onValueChange={(next) => tab.set(next as Tab)}>
          <SegmentedList fill>
            <Each of={TABS}>
              {(item) => <SegmentedItem value={item().value}>{item().label}</SegmentedItem>}
            </Each>
          </SegmentedList>
        </Segmented>
        <Each of={TABS.filter((item) => item.value === tab())}>{(item) => item().body()}</Each>
      </View>
    </DemoPage>
  );
}
