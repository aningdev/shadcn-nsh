import { mount, View } from "nsh";

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from "../../../packages/ui/code-block";

function App() {
  return (
    <View>
      <CodeBlock>
        <CodeBlockHeader>
          <CodeBlockTitle>route.ts</CodeBlockTitle>
          <CodeBlockActions>
            <CodeBlockCopyButton value={"const a = 1;\nconst b = 2;"} />
          </CodeBlockActions>
        </CodeBlockHeader>
        <CodeBlockContent lineNumbers startLine={8}>
          {"const a = 1;\nconst b = 2;\n"}
        </CodeBlockContent>
      </CodeBlock>
      <CodeBlock variant="destructive" size="sm">
        <CodeBlockContent lineNumbers>
          <CodeBlockLine>first</CodeBlockLine>
          <CodeBlockLine variant="added">second</CodeBlockLine>
        </CodeBlockContent>
      </CodeBlock>
    </View>
  );
}

mount(App);
