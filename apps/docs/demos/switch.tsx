import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { listRow, RowDivider, RowLabel } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage } from "./kit";

function App() {
  const wifi = signal(true);
  const bluetooth = signal(false);
  const ask = signal(true);

  return (
    <DemoPage title="Switch">
      <DemoCard style={{ gap: 0 }}>
        {/* A row with its label: the whole row is the switch, and the target. */}
        <Switch
          checked={wifi()}
          onChange={({ checked }) => wifi.set(checked)}
          {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
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
        >
          <RowDivider show />
          <RowLabel label="Ask to join networks" />
        </Switch>
      </DemoCard>
      {/* Alone: its track is all of it, with a hit slop on a touch screen. */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Switch
          accessibilityLabel="Bluetooth"
          size="regular"
          checked={bluetooth()}
          onChange={({ checked }) => bluetooth.set(checked)}
        />
        <Switch
          accessibilityLabel="Bluetooth, small"
          size="small"
          checked={bluetooth()}
          onChange={({ checked }) => bluetooth.set(checked)}
        />
        <Text style={{ fontSize: 13, color: colors.muted }}>
          Bluetooth {bluetooth() ? "on" : "off"}
        </Text>
      </View>
    </DemoPage>
  );
}

mount(App);
