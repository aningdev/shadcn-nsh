// The reference of `code-block.tsx`: the same page, the look spread on `nsh`'s own View, Text and
// Scroll instead of worn by the parts. The render check requires the two to draw the same pixels.

import { Copy } from "lucide";
import { mount, Scroll, Text, View } from "nsh";

import { IconButton, iconButtonGlyph } from "@/packages/ui/button";
import {
  codeBlockLook,
  type CodeBlockLineVariant,
  type CodeBlockSize,
  type CodeBlockVariant,
} from "@/packages/ui/code-block";
import { IconLabel } from "@/packages/ui/lib/icons";
import { density } from "@/packages/ui/lib/surface";

import { failure, output, route } from "./code-block-data";
import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

/** The block's surface, as the look draws it. */
function Frame(props: { variant?: CodeBlockVariant; children: unknown }) {
  return (
    <View style={[codeBlockLook().root(props.variant ?? "default")]}>
      {props.children as never}
    </View>
  );
}

/** A header: the title, and the copy button at the end. */
function Header(props: { title: string; variant?: CodeBlockVariant; size?: CodeBlockSize }) {
  const variant = props.variant ?? "default";
  const size = props.size ?? "default";
  const glyph = iconButtonGlyph({ size: "sm" });
  return (
    <View style={[codeBlockLook().header(variant, size)]}>
      <Text style={[codeBlockLook().title(variant)]}>{props.title}</Text>
      <View style={[codeBlockLook().actions()]}>
        <IconButton variant="ghost" size="sm" accessibilityLabel="Copy">
          <IconLabel
            label="Copy"
            icon={Copy}
            size={glyph.size}
            tint={variant === "destructive" ? ui().danger : glyph.tint}
          />
        </IconButton>
      </View>
    </View>
  );
}

/** The code that scrolls sideways, or wraps. */
function Code(props: {
  variant?: CodeBlockVariant;
  size?: CodeBlockSize;
  wrap?: boolean;
  children: unknown;
}) {
  const size = props.size ?? "default";
  return (
    <Scroll
      horizontal={!props.wrap}
      scrollbar={false}
      contentStyle={[
        codeBlockLook().content(size),
        { flexDirection: "column" },
        props.wrap ? { alignSelf: "stretch" } : { minWidth: "100%" },
      ]}
    >
      {props.children as never}
    </Scroll>
  );
}

/** A line of the numbered kind. */
function Line(props: {
  number: number;
  digits: number;
  variant?: CodeBlockLineVariant;
  text: string;
}) {
  const variant = props.variant ?? "default";
  const marked = variant === "added" || variant === "removed";
  return (
    <View style={[codeBlockLook().line(variant, "default")]}>
      <Text style={[codeBlockLook().gutter("default", "default", props.digits)]}>
        {props.number}
      </Text>
      {marked ? (
        <Text style={[codeBlockLook().marker(variant, "default")]}>
          {variant === "added" ? "+" : "−"}
        </Text>
      ) : null}
      <Text style={[codeBlockLook().code("default", "default")]}>{props.text}</Text>
    </View>
  );
}

const routeLines = route.split("\n");

function App() {
  return (
    <DemoPage title="CodeBlock">
      <Text style={{ color: ui().muted }}>
        {"Code, a command's output or a log: a title, a copy button, line numbers and a footer."}
      </Text>

      <DemoCard>
        <DemoSection title="Header and copy" axis="block">
          <Frame>
            <Header title="app/api/chat/route.ts" />
            <Code>
              {routeLines.map((text, i) => (
                <Line number={i + 1} digits={1} text={text} />
              ))}
            </Code>
          </Frame>
        </DemoSection>

        <DemoSection title="Footer" axis="block">
          <Frame>
            <Header title="Run tests" size="sm" />
            <Code size="sm" wrap>
              <Text style={[codeBlockLook().code("default", "sm")]}>{output}</Text>
            </Code>
            <View style={[codeBlockLook().footer("default", "sm")]}>
              <Text style={[codeBlockLook().footerText("default")]}>Output</Text>
              <Text
                style={{
                  fontSize: density.note,
                  flexGrow: 1,
                  fontFamily: "monospace",
                  color: ui().up,
                }}
              >
                2 pass, 0 fail
              </Text>
              <Text
                style={{ fontSize: density.note, color: ui().faint, fontVariant: ["tabular-nums"] }}
              >
                exit 0 · 12 ms
              </Text>
            </View>
          </Frame>
        </DemoSection>

        <DemoSection title="Destructive" axis="block">
          <Frame variant="destructive">
            <Header title="Build failed" variant="destructive" />
            <Code>
              <Text style={[codeBlockLook().code("destructive", "default")]}>{failure}</Text>
            </Code>
          </Frame>
        </DemoSection>

        <DemoSection title="Lines of your own" axis="block">
          <Frame>
            <Code>
              <View>
                <Line number={12} digits={2} text={"export function greet(name: string) {"} />
                <Line number={13} digits={2} variant="removed" text={'  return "Hello " + name;'} />
                <Line number={14} digits={2} variant="added" text={"  return `Hello, ${name}!`;"} />
                <Line number={15} digits={2} variant="highlighted" text={"}"} />
              </View>
            </Code>
          </Frame>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
