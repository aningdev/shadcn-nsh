// The reference of `switch.tsx`: the same scene as upstream writes it, `switchLook` spread on
// `nsh/base`'s Switch. The render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Switch } from "nsh/base";

import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { switchHitSlop, switchLook, type SwitchSize } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

/** A switch standing alone: its track is all of it, with the touch screen's hit slop. */
function Alone(props: {
  label: string;
  size: SwitchSize;
  checked: boolean;
  onChange: (event: { checked: boolean }) => void;
}) {
  return (
    <Switch
      accessibilityLabel={props.label}
      checked={props.checked}
      onChange={props.onChange}
      hitSlop={switchHitSlop(props.size)}
      {...switchLook(() => props.checked, props.size)}
    />
  );
}

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
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a row, or Tab to a switch and press Space"
          : "Tap a row: the label toggles it too"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="checked · disabled">
              <Text style={{ fontSize: 13, color: colors.text }}>
                {`Wi-Fi ${wifi() ? "on" : "off"} · ask ${ask() ? "on" : "off"}`}
                {wifi() ? "" : " (disabled)"}
                {` · Bluetooth ${bluetooth() ? "on" : "off"}`}
              </Text>
            </Panel>
            <Log title="onChange({ checked })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Switch
            checked={wifi()}
            onChange={change("Wi-Fi", (next) => wifi.set(next))}
            {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
            {...switchLook(() => wifi())}
          >
            <RowDivider show={false} />
            <RowLabel label="Wi-Fi" detail={wifi() ? "Connected to Studio" : "Off"} />
          </Switch>
          <Switch
            checked={ask()}
            disabled={!wifi()}
            onChange={change("Ask to join", (next) => ask.set(next))}
            {...listRow({ disabled: () => !wifi(), style: { flexDirection: "row-reverse" } })}
            {...switchLook(() => ask())}
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
            {...switchLook(() => bluetooth())}
          >
            <RowDivider show />
            <RowLabel label="Bluetooth" detail={bluetooth() ? "Discoverable as “Desk”" : "Off"} />
          </Switch>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Size">
          <Alone
            label="Bluetooth, small"
            size="sm"
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
          />
          <Alone
            label="Bluetooth"
            size="default"
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
          />
          <Text style={{ fontSize: 13, color: colors.muted }}>
            Bluetooth {bluetooth() ? "on" : "off"}
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
