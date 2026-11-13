// The demo audit's probe: what an app inside the docs preview believes about itself. Package it
// with `bun scripts/audit/audit.ts probe` and it prints the same `windowSize()` and
// `platform.desktop` the docs demos get, at whatever size and idiom the frame runs it.
// Not a demo (not in the catalog): it exists for `docs/specs/demo-audit.md` only.
import { colors } from "@shadcn-nsh/theme";
import { mount, platform, Text, View, windowSize } from "nsh";

function Row(props: { name: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
      <Text style={{ width: 190, fontSize: 14, color: colors.muted }}>{props.name}</Text>
      <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: colors.text }}>
        {props.value}
      </Text>
    </View>
  );
}

function App() {
  const size = windowSize();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>Canvas probe</Text>
      <Row name="windowSize()" value={`${size.width} × ${size.height}`} />
      <Row name="platform.desktop" value={String(platform.desktop)} />
      <Row name="platform.idiom" value={String(platform.idiom)} />
      <Row name="platform.os" value={String(platform.os)} />
    </View>
  );
}

mount(App);
