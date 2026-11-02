import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Switch } from "../../../packages/ui/switch";

function App() {
  const on = signal(true);

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
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Switch</Text>
      <Switch checked={on()} onChange={(v) => on.set(v)}>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Notifications</Text>
      </Switch>
      <Switch size="sm" checked={on()} onChange={(v) => on.set(v)}>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Small</Text>
      </Switch>
      <Switch disabled checked={false}>
        <Text style={{ fontSize: 14, color: colors.foreground }}>Disabled off</Text>
      </Switch>
      <Switch
        checked={on()}
        onChange={(v) => on.set(v)}
        style={{ gap: 12 }}
        trackStyle={{ width: 44 }}
        thumbClass="checked:translate-x-5"
      >
        <Text style={{ fontSize: 14, color: colors.foreground }}>Style merge</Text>
      </Switch>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {() => (on() ? "On" : "Off")}
      </Text>
    </View>
  );
}

mount(App);
