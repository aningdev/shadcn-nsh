import { colors } from "@shadcn-nsh/theme";
import { Combobox } from "../../../packages/ui/combobox";
import { mount, signal, Text, View } from "nsh";

function App() {
  const picks = signal<string[]>([]);

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
      <Combobox
        value={picks()}
        onChange={({ value }) => picks.set(value)}
        items={[
          { value: "apple", title: "Apple" },
          { value: "banana", title: "Banana" },
          { value: "orange", title: "Orange" },
          { value: "mango", title: "Mango" },
        ]}
        placeholder="Choose fruit…"
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {() => (picks().length ? picks().join(", ") : "None selected")}
      </Text>
    </View>
  );
}

mount(App);
