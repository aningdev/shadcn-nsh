import { colors } from "@shadcn-nsh/theme";
// Switch: the official gallery's scene (`references/nsh/examples/gallery/demos/Controls.tsx`)
// with this library's parts — settings that take effect at once, two of them needing another on,
// the settings row shadcn composes (a Field in a row with the control), and the two sizes.
import { Bell, Hand, HardDrive, type IconNode, MessageCircle, Sparkles } from "lucide";
import { platform, signal, Text, View } from "nsh";

import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/packages/ui/field";
import { listRow, RowDivider, RowLabel } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { Caption, DemoCard, DemoPage, DemoSection } from "../kit";
import { IconTile } from "./apps-shared";

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
  const haptics = signal(false);
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
        {/* Each row is the switch itself (`listRow`), straight in the card's padding, which the
            hover fill reaches into: its icon leads, its track at the trailing edge. */}
        <View>
          <Group first title="Alerts" />
          <Setting
            first
            label="Notifications"
            icon={Bell}
            detail={notifications() ? "Banners, sounds and badges" : "Off"}
            on={notifications()}
            onChange={change("Notifications", (next) => notifications.set(next))}
          />
          <Setting
            label="Badges"
            icon={Sparkles}
            detail={notifications() ? "The unread count on the icon" : off}
            on={badges()}
            disabled={!notifications()}
            onChange={change("Badges", (next) => badges.set(next))}
          />
          <Setting
            label="Previews"
            icon={MessageCircle}
            detail={
              notifications()
                ? previews()
                  ? "The message's text in banners"
                  : "Only who wrote"
                : off
            }
            on={previews()}
            disabled={!notifications()}
            onChange={change("Previews", (next) => previews.set(next))}
          />
          <Group title="Device" />
          <Setting
            first
            label="Haptics"
            icon={Hand}
            detail="A tap under the finger as values change"
            on={haptics()}
            onChange={change("Haptics", (next) => haptics.set(next))}
          />
          <Setting
            label="Low data mode"
            icon={HardDrive}
            detail={usage() ? "Images load at a lower quality" : "Images load in full"}
            on={usage()}
            onChange={change("Low data mode", (next) => usage.set(next))}
          />
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

/**
 * A setting that takes effect at once: the row is the switch (`listRow`), its icon tile leading
 * (lit in the brand while on), its label and detail, the track at the trailing edge; a hairline
 * above all but a group's first row.
 */
function Setting(props: {
  label: string;
  detail: string;
  icon: IconNode;
  on: boolean;
  disabled?: boolean;
  first?: boolean;
  onChange: (event: { checked: boolean }) => void;
}) {
  return (
    <Switch
      checked={props.on}
      disabled={props.disabled}
      onChange={props.onChange}
      {...listRow({
        first: props.first,
        disabled: () => props.disabled,
        style: { flexDirection: "row-reverse" },
      })}
    >
      <RowDivider show={!props.first} />
      <RowLabel label={props.label} detail={props.detail} />
      <IconTile
        icon={props.icon}
        size={platform.desktop ? 26 : 32}
        tint={props.on ? colors.brand : colors.mutedForeground}
      />
    </Switch>
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
