// The reference of `switch.tsx`: the look spread on `nsh/base`'s Switch, as upstream writes it.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Switch } from "nsh/base";

import { listRow, RowDivider, RowLabel } from "@/packages/ui/lib/surface";
import { switchHitSlop, switchLook } from "@/packages/ui/switch";

import { DemoCard, DemoPage } from "./kit";

function App() {
  const wifi = signal(true);
  const bluetooth = signal(false);
  const ask = signal(true);

  return (
    <DemoPage title="Switch">
      <DemoCard style={{ gap: 0 }}>
        <Switch
          checked={wifi()}
          onChange={({ checked }) => wifi.set(checked)}
          {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
          {...switchLook(() => wifi())}
        >
          <RowDivider show={false} />
          <RowLabel label="Wi-Fi" />
        </Switch>
        <Switch
          checked={ask()}
          disabled={!wifi()}
          onChange={({ checked }) => ask.set(checked)}
          {...listRow({
            disabled: () => !wifi(),
            style: { flexDirection: "row-reverse" },
          })}
          {...switchLook(() => ask())}
        >
          <RowDivider show />
          <RowLabel label="Ask to join networks" />
        </Switch>
      </DemoCard>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Switch
          accessibilityLabel="Bluetooth"
          checked={bluetooth()}
          onChange={({ checked }) => bluetooth.set(checked)}
          hitSlop={switchHitSlop("regular")}
          {...switchLook(() => bluetooth(), "regular")}
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
    </DemoPage>
  );
}

mount(App);
