import { colors } from "@shadcn-nsh/theme";
import { Pagination } from "../../../packages/ui/pagination";
import { mount, signal, Text, View } from "nsh";

function App() {
  const page = signal(1);

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        Pagination · page {() => page()}
      </Text>
      <Pagination page={page()} totalPages={8} onChange={({ page: p }) => page.set(p)} />
      <Pagination page={2} totalPages={5} compact disabled />
    </View>
  );
}

mount(App);
