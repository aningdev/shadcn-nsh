import { mount, signal, Text, View } from "nsh";
import type { EditorRef, EditorSearch, EditorSearchResult } from "nsh/base";

import { Editor, EditorFindBar } from "../../../packages/ui";

const TYPESCRIPT = `const answer = 42;
`;
const JSON_SOURCE = `{ "answer": 42 }
`;
const FOUND = `const a = 1;
const b = 2;
`;

type Language = "typescript" | "json";

function App() {
  const language = signal<Language>("typescript");
  const typescript = signal(TYPESCRIPT);
  const json = signal(JSON_SOURCE);
  const value = () => (language() === "typescript" ? typescript() : json());
  const focus = signal("none");
  const locked = signal("keep");
  const found = signal<string>(FOUND);
  const finding = signal(true);
  const search = signal<EditorSearch>({ query: "" });
  const result = signal<EditorSearchResult | null>(null);
  const findEditor = signal<EditorRef | null>(null);
  return (
    <View style={{ padding: 12, gap: 8 }}>
      <Editor
        testID="code"
        accessibilityLabel="Code sample"
        value={value()}
        language={language()}
        onChange={({ value: next }) => (language() === "typescript" ? typescript : json).set(next)}
        onFocus={() => focus.set(language())}
        style={{ width: 320, height: 120 }}
      />
      <Text>{`value=${value()}`}</Text>
      <Text>{`typescript=${typescript()}`}</Text>
      <Text>{`json=${json()}`}</Text>
      <Text>{`focus=${focus()}`}</Text>
      <Editor
        testID="locked"
        accessibilityLabel="Locked source"
        readOnly
        value={locked()}
        onChange={({ value: next }) => locked.set(next)}
        style={{ width: 320, height: 64 }}
      />
      <Text>{`locked=${locked()}`}</Text>
      <Text
        accessibilityLabel="Switch language"
        onPress={() => language.set(language() === "typescript" ? "json" : "typescript")}
      >
        Switch language
      </Text>
      <Text accessibilityLabel="Load a file" onPress={() => typescript.set("const answer = 43;\n")}>
        Load a file
      </Text>
      <Editor
        testID="found"
        accessibilityLabel="Found source"
        value={found()}
        language="typescript"
        onChange={({ value: next }) => found.set(next)}
        search={finding() ? search() : null}
        onSearchChange={({ result: next }) => result.set(next)}
        ref={(node) => findEditor.set(node)}
        style={{ width: 320, height: 96 }}
      />
      {finding() && findEditor() ? (
        <EditorFindBar
          editor={findEditor()}
          search={search()}
          onSearchChange={(next) => search.set(next)}
          result={result()}
          onClose={() => finding.set(false)}
          style={{ width: 320 }}
        />
      ) : null}
      <Text>{`found=${found()}`}</Text>
      <Text>{`count=${result()?.count ?? 0}`}</Text>
      <Text>{`finding=${finding() ? "yes" : "no"}`}</Text>
    </View>
  );
}

mount(App);
