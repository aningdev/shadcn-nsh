// The reference of `switch.tsx`. `switchLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
import { mount, signal, Text, View } from "nsh";

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/packages/ui/field";
import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

/**
 * A settings row at the call site, as shadcn composes it: a `Field` in a row, its title and its
 * description in `FieldContent` (which takes the room the control leaves), the switch after them.
 * The switch is the control, so it carries the row's title as its name and is read as a switch
 * that is on or off; nothing is pinned to a side, so a right-to-left app puts the switch first.
 */
function SettingRow(props: {
  label: string;
  detail: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: { checked: boolean }) => void;
}) {
  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel>{props.label}</FieldLabel>
        <FieldDescription>{props.detail}</FieldDescription>
      </FieldContent>
      <Switch
        accessibilityLabel={props.label}
        checked={props.checked}
        disabled={props.disabled}
        onChange={props.onChange}
      />
    </Field>
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
              <Text style={{ fontSize: 13, color: ui().text }}>
                {`extract ${extract() ? "on" : "off"} · usage ${usage() ? "on" : "off"}`}
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
            size="sm"
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
          />
          <Switch
            accessibilityLabel="Bluetooth"
            size="default"
            checked={bluetooth()}
            onChange={change("Bluetooth", (next) => bluetooth.set(next))}
          />
          <Text style={{ fontSize: 13, color: ui().muted }}>
            Bluetooth {bluetooth() ? "on" : "off"}
          </Text>
        </DemoSection>

        <DemoSection title="Settings rows" axis="block">
          <FieldGroup>
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
          </FieldGroup>
        </DemoSection>

        <DemoSection title="Right to left" axis="block">
          {/* The same row in a right-to-left app: the content is still written first and the switch
              after it, and the direction puts them the other way round. */}
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
