import { colors } from "@shadcn-nsh/theme";
import { Checkbox } from "../../../packages/ui/checkbox";
import { mount, signal, Text, View } from "nsh";

function App() {
  const checked = signal(true);
  const mixed = signal(true);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Checkbox</Text>
      <Checkbox checked={checked()} onChange={({ checked: v }) => checked.set(v)}>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Accept terms</Text>
      </Checkbox>
      <Checkbox
        indeterminate={mixed()}
        checked={false}
        onChange={({ checked: v }) => {
          mixed.set(false);
          checked.set(v);
        }}
      >
        <Text style={{ fontSize: 14, color: colors.foreground }}>Indeterminate → checked</Text>
      </Checkbox>
      <Checkbox disabled checked>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Disabled</Text>
      </Checkbox>
    </View>
  );
}

mount(App);
