import { colors } from "@shadcn-nsh/theme";
import { Collapsible } from "../../../packages/ui/collapsible";
import { mount, Text, View } from "nsh";

function App() {
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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Collapsible</Text>
      <Collapsible
        content={
          <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingVertical: 8 }}>
            Hidden until open — shipping leaves before 2 pm.
          </Text>
        }
      >
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
          Shipping details
        </Text>
      </Collapsible>
    </View>
  );
}

mount(App);
