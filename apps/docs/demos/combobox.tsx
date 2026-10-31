import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
} from "../../../packages/ui/combobox";

function App() {
  const tags = signal<string[]>(["react"]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Combobox</Text>
      <Combobox multiple value={tags()} onChange={({ value }) => tags.set(value)}>
        <ComboboxTrigger>
          <ComboboxValue placeholder="Frameworks" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxItem value="react">React</ComboboxItem>
          <ComboboxItem value="vue">Vue</ComboboxItem>
          <ComboboxItem value="svelte">Svelte</ComboboxItem>
        </ComboboxContent>
      </Combobox>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Value: {() => tags().join(", ") || "—"}
      </Text>
    </View>
  );
}

mount(App);
