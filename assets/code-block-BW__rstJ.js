var e=`// shadcn's code-block scenes with this library's parts: a titled snippet with line numbers and a
// copy button, a tool's result in the small size with a footer, an error log in the destructive
// variant, and lines of the app's own (called out, added, removed).
import { font } from "@shadcn-nsh/theme";
import { mount, Text } from "nsh";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFooter,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "@/packages/ui/code-block";
import { density } from "@/packages/ui/lib/surface";

import { failure, output, route } from "./code-block-data";
import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

function App() {
  return (
    <DemoPage title="CodeBlock">
      <Text style={{ color: ui().muted }}>
        {"Code, a command's output or a log: a title, a copy button, line numbers and a footer."}
      </Text>

      <DemoCard>
        <DemoSection title="Header and copy" axis="block">
          <CodeBlock variant="default" size="default">
            <CodeBlockHeader>
              <CodeBlockTitle>app/api/chat/route.ts</CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={route} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent lineNumbers>{route}</CodeBlockContent>
          </CodeBlock>
        </DemoSection>

        <DemoSection title="Footer" axis="block">
          <CodeBlock size="sm">
            <CodeBlockHeader>
              <CodeBlockTitle>Run tests</CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={output} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent wrap>{output}</CodeBlockContent>
            <CodeBlockFooter>
              Output
              <Text
                style={{
                  fontSize: density.note,
                  flexGrow: 1,
                  fontFamily: font.mono,
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
            </CodeBlockFooter>
          </CodeBlock>
        </DemoSection>

        <DemoSection title="Destructive" axis="block">
          <CodeBlock variant="destructive">
            <CodeBlockHeader>
              <CodeBlockTitle>Build failed</CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={failure} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent>{failure}</CodeBlockContent>
          </CodeBlock>
        </DemoSection>

        <DemoSection title="Lines of your own" axis="block">
          <CodeBlock>
            <CodeBlockContent lineNumbers startLine={12}>
              <CodeBlockLine>{"export function greet(name: string) {"}</CodeBlockLine>
              <CodeBlockLine variant="removed">{'  return "Hello " + name;'}</CodeBlockLine>
              <CodeBlockLine variant="added">{"  return \`Hello, \${name}!\`;"}</CodeBlockLine>
              <CodeBlockLine variant="highlighted">{"}"}</CodeBlockLine>
            </CodeBlockContent>
          </CodeBlock>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};