import { colors } from "@shadcn-nsh/theme";
// Switch: the official gallery's scene (`references/nsh/examples/gallery/demos/Controls.tsx`)
// with this library's parts — settings that take effect at once, two of them needing another on,
// the settings row shadcn composes (a Field in a row with the control), and the two sizes.
import { signal, Text, View } from "nsh";

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/packages/ui/field";
import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { Caption, DemoCard, DemoPage, DemoSection } from "../kit";

/**
 * A settings row at the call site, as shadcn composes it: a `Field` in a row, its title and its
 * description in `FieldContent` (which takes the room the control leaves), the switch after them.
 * The switch is the control, so it carries the row's title as its name.
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

export function SwitchDemo() {
  const notifications = signal(true);
  const badges = signal(true);
  const previews = signal(false);
  const extract = signal(true);
  const usage = signal(false);
  const last = signal("—");

  const change =
    (name: string, set: (next: boolean) => void) =>
    ({ checked }: { checked: boolean }) => {
      set(checked);
      last.set(`${name}: ${checked ? "on" : "off"}`);
    };
  const off = "Turn on notifications first";

  return (
    <DemoPage title="Switch" note={() => `Last event: ${last()}`}>
      <DemoCard title="Settings" subtitle="Two groups; two settings need another on">
        {/* The row is the switch itself, its track at the trailing edge (`listRow`: the hover
            fill reaching past the content, the keyboard's focus ring, a press that dims). */}
        <View style={sectionSurface()}>
          <Group first title="Alerts" />
          <Switch
            checked={notifications()}
            onChange={change("Notifications", (next) => notifications.set(next))}
            {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
          >
            <RowDivider show={false} />
            <RowLabel
              label="Notifications"
              detail={notifications() ? "Banners, sounds and badges" : "Off"}
            />
          </Switch>
          <Switch
            checked={badges()}
            disabled={!notifications()}
            onChange={change("Badges", (next) => badges.set(next))}
            {...listRow({
              disabled: () => !notifications(),
              style: { flexDirection: "row-reverse" },
            })}
          >
            <RowDivider show />
            <RowLabel
              label="Badges"
              detail={notifications() ? "The unread count on the icon" : off}
            />
          </Switch>
          <Switch
            checked={previews()}
            disabled={!notifications()}
            onChange={change("Previews", (next) => previews.set(next))}
            {...listRow({
              disabled: () => !notifications(),
              style: { flexDirection: "row-reverse" },
            })}
          >
            <RowDivider show />
            <RowLabel
              label="Previews"
              detail={
                notifications()
                  ? previews()
                    ? "The message's text in banners"
                    : "Only who wrote"
                  : off
              }
            />
          </Switch>
          <Group title="Device" />
          <Switch
            checked={usage()}
            onChange={change("Low data mode", (next) => usage.set(next))}
            {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
          >
            <RowDivider show={false} />
            <RowLabel
              label="Low data mode"
              detail={usage() ? "Images load at a lower quality" : "Images load in full"}
            />
          </Switch>
        </View>
        <Caption>
          The settings take effect at once; Badges and Previews need Notifications on
        </Caption>
      </DemoCard>

      <DemoCard
        title="Settings rows"
        subtitle="A field in a row, the control after its description"
      >
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
      </DemoCard>

      <DemoCard title="Size" subtitle="sm and default, the track all of the switch">
        <DemoSection title="Size">
          <Switch
            accessibilityLabel="Notifications, small"
            size="sm"
            checked={extract()}
            onChange={change("Notifications", (next) => extract.set(next))}
          />
          <Switch
            accessibilityLabel="Notifications"
            checked={extract()}
            onChange={change("Notifications", (next) => extract.set(next))}
          />
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            {`Notifications ${extract() ? "on" : "off"}`}
          </Text>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

/** A group's heading in the settings list. */
function Group(props: { title: string; first?: boolean }) {
  return (
    <Text
      style={{
        marginTop: props.first ? 0 : 12,
        marginBottom: 2,
        fontSize: 12,
        fontWeight: "600",
        color: colors.mutedForeground,
      }}
    >
      {props.title}
    </Text>
  );
}
