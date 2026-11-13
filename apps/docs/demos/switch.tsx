// The official switch scene (`references/nsh/website/demos/el-switch.tsx`) with this library's
// parts: three settings, each row the switch itself, the second disabled while the first is off;
// an inspector says what is checked and logs every change. A second card shows the two sizes, a
// switch standing alone with its track all of it.
import { mount, signal, Text, View } from "nsh";

import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

function App() {
  const wifi = signal(true);
  const bluetooth = signal(false);
  const ask = signal(true);
  const events = signal<string[]>([]);
  const change =
    (name: string, set: (next: boolean) => void) =>
    ({ checked }: { checked: boolean }) => {
      set(checked);
      events.set([`${name} → ${checked}`, ...events()].slice(0, 3));
    };

  return (
    <DemoPage title="Switch">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click a row, or Tab to a switch and press Space"
          : "Tap a row: the label toggles it too"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="checked · disabled">
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`Wi-Fi ${wifi() ? "on" : "off"} · ask ${ask() ? "on" : "off"}`}
                {wifi() ? "" : " (disabled)"}
                {` · Bluetooth ${bluetooth() ? "on" : "off"}`}
              </Text>
            </Panel>
            <Log title="onChange({ checked })" lines={events()} minHeight={92} />
          </>
        }
      >
        {/* The row is the switch itself, its track at the trailing edge (`listRow`: the hover
            fill reaching past the content, the keyboard's focus ring, a press that dims). */}
        <View style={sectionSurface({ padded: true })}>
          <Switch
            checked={wifi()}
            onChange={change("Wi-Fi", (next) => wifi.set(next))}
            {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
          >
            <RowDivider show={false} />
            <RowLabel label="Wi-Fi" detail={wifi() ? "Connected to Studio" : "Off"} />
          </Switch>
          <Switch
            checked={ask()}
            disabled={!wifi()}
            onChange={change("Ask to join", (next) => ask.set(next))}
            {...listRow({ disabled: () => !wifi(), style: { flexDirection: "row-reverse" } })}
          >
            <RowDivider show />
            <RowLabel
              label="Ask to join networks"
              detail={wifi() ? "Known networks join on their own" : "Turn on Wi-Fi first"}
            />
          </Switch>
          <Switch
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
            {...listRow({ style: { flexDirection: "row-reverse" } })}
          >
            <RowDivider show />
            <RowLabel label="Bluetooth" detail={bluetooth() ? "Discoverable as “Desk”" : "Off"} />
          </Switch>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Size">
          <Switch
            accessibilityLabel="Bluetooth, small"
            size="small"
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
          />
          <Switch
            accessibilityLabel="Bluetooth"
            size="regular"
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
          />
          <Text style={{ fontSize: 13, color: ui().muted }}>
            Bluetooth {bluetooth() ? "on" : "off"}
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
