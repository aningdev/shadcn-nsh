// The reference of `switch.tsx`: the same scene as upstream writes it, `switchLook` spread on
// `nsh/base`'s Switch, and the settings row's `fieldFamilyLook`s on its views and texts. The
// render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Switch } from "nsh/base";

import { fieldFamilyLook } from "@/packages/ui/field";
import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { switchFocusStyle, switchHitSlop, switchLook, type SwitchSize } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

/** A switch standing alone: its track is all of it, with the touch screen's hit slop. */
function Alone(props: {
  label: string;
  size: SwitchSize;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: { checked: boolean }) => void;
}) {
  const look = switchLook(() => props.checked, {
    size: () => props.size,
    disabled: () => !!props.disabled,
  });
  return (
    <Switch
      accessibilityLabel={props.label}
      checked={props.checked}
      disabled={props.disabled}
      onChange={props.onChange}
      hitSlop={switchHitSlop(props.size)}
      focusVisibleStyle={switchFocusStyle(props.size)}
      {...look}
    />
  );
}

/**
 * A family's looks, read where they are drawn: `fieldFamilyLook` makes its label's color once, when
 * it is called, so a look kept in the component body would keep the appearance the page opened in.
 */
const fields = () => fieldFamilyLook();

/** A settings row, as `switch.tsx` composes it: `fieldFamilyLook`'s row (the content taking the
 * room the control leaves), its label and description, and the switch after them. */
function SettingRow(props: {
  label: string;
  detail: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: { checked: boolean }) => void;
}) {
  return (
    <View role="group" style={fields().field(true)}>
      <View style={fields().content}>
        <Text style={fields().title}>{props.label}</Text>
        <Text style={fields().description}>{props.detail}</Text>
      </View>
      <Alone
        label={props.label}
        size="default"
        checked={props.checked}
        disabled={props.disabled}
        onChange={props.onChange}
      />
    </View>
  );
}

function App() {
  const wifi = signal(true);
  const bluetooth = signal(false);
  const ask = signal(true);
  const extract = signal(true);
  const usage = signal(false);
  const events = signal<string[]>([]);
  const change =
    (name: string, set: (next: boolean) => void) =>
    ({ checked }: { checked: boolean }) => {
      set(checked);
      events.set([`${name} → ${checked}`, ...events()].slice(0, 3));
    };

  return (
    <DemoPage title="Switch">
      <Text style={{ color: colors.mutedForeground }}>
        {desktop
          ? "Click a row, or Tab to a switch and press Space"
          : "Tap a row: the label toggles it too"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="checked · disabled">
              <Text style={{ fontSize: 13, color: colors.foreground }}>
                {`Wi-Fi ${wifi() ? "on" : "off"} · ask ${ask() ? "on" : "off"}`}
                {wifi() ? "" : " (disabled)"}
                {` · Bluetooth ${bluetooth() ? "on" : "off"}`}
              </Text>
              <Text style={{ fontSize: 13, color: colors.foreground }}>
                {`extract ${extract() ? "on" : "off"} · usage ${usage() ? "on" : "off"}`}
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
            {...switchLook(() => wifi(), { disabledSurface: false })}
            {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
          >
            <RowDivider show={false} />
            <RowLabel label="Wi-Fi" detail={wifi() ? "Connected to Studio" : "Off"} />
          </Switch>
          <Switch
            checked={ask()}
            disabled={!wifi()}
            onChange={change("Ask to join", (next) => ask.set(next))}
            {...switchLook(() => ask(), {
              disabled: () => !wifi(),
              disabledSurface: false,
            })}
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
            {...switchLook(() => bluetooth(), { disabledSurface: false })}
            {...listRow({ style: { flexDirection: "row-reverse" } })}
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
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Bluetooth {bluetooth() ? "on" : "off"}
          </Text>
        </DemoSection>

        <DemoSection title="Settings rows" axis="block">
          <View style={fieldFamilyLook().group}>
            <SettingRow
              label="Extract text from images"
              detail="Read the text in a screenshot you paste or open."
              checked={extract()}
              onChange={change("Extract text", (next) => extract.set(next))}
            />
            <SettingRow
              label="Send usage data"
              detail="What you open and for how long. Never what you type."
              checked={usage()}
              onChange={change("Usage data", (next) => usage.set(next))}
            />
            <SettingRow
              label="Automatic updates"
              detail="Installs a new version while the app is closed."
              checked={false}
              disabled
              onChange={() => {}}
            />
          </View>
        </DemoSection>

        <DemoSection title="Right to left" axis="block">
          <View style={{ direction: "rtl" }}>
            <SettingRow
              label="Extract text from images"
              detail="Read the text in a screenshot you paste or open."
              checked={extract()}
              onChange={change("Extract text", (next) => extract.set(next))}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
