// The reference of `switch.tsx`: the look spread on `nsh/base`'s Switch, as upstream writes it.
import { colors, radius } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Switch } from "nsh/base";

import { switchHitSlop, switchLook } from "../ui/switch";

function App() {
  const wifi = signal(true);
  const bluetooth = signal(false);
  const ask = signal(true);
  // Read in the JSX, so the color follows the appearance.
  const label = () => ({ flex: 1, fontSize: 15, color: colors.text }) as const;
  const row = { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 } as const;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Switch</Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.card,
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}
      >
        <Switch
          checked={wifi()}
          onChange={({ checked }) => wifi.set(checked)}
          style={{ ...row, flexDirection: "row-reverse" }}
          {...switchLook(() => wifi())}
        >
          <Text style={label()}>Wi-Fi</Text>
        </Switch>
        <Switch
          checked={ask()}
          disabled={!wifi()}
          onChange={({ checked }) => ask.set(checked)}
          style={{ ...row, flexDirection: "row-reverse" }}
          {...switchLook(() => ask())}
        >
          <Text style={label()}>Ask to join networks</Text>
        </Switch>
      </View>
      <View style={row}>
        <Switch
          accessibilityLabel="Bluetooth"
          checked={bluetooth()}
          onChange={({ checked }) => bluetooth.set(checked)}
          hitSlop={switchHitSlop()}
          {...switchLook(() => bluetooth())}
        />
        <Switch
          accessibilityLabel="Bluetooth, small"
          checked={bluetooth()}
          onChange={({ checked }) => bluetooth.set(checked)}
          hitSlop={switchHitSlop("small")}
          {...switchLook(() => bluetooth(), "small")}
        />
        <Text style={{ fontSize: 13, color: colors.muted }}>
          Bluetooth {bluetooth() ? "on" : "off"}
        </Text>
      </View>
    </View>
  );
}

mount(App);
