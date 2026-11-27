import { colors } from "@shadcn-nsh/theme";
// Checkbox: the official gallery's five scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Filter`, `Checklist`, `Consent`, `Channels`, `BoxStates`) with this library's parts — a filter whose
// "Select all" shows a partial selection, a checklist that fades the tasks done, consent rows where
// the necessary one stays on, choice cards whose whole surface is the box, and the sizes and states.
import { Bell, FileText, MessageSquare } from "lucide";
import type { JSX } from "nsh";
import { computed, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Checkbox } from "@/packages/ui/checkbox";
import { choiceTileLook as tileLook } from "@/packages/ui/lib/choice";
import { Icon } from "@/packages/ui/lib/icons";
import {
  controlSize,
  listRow,
  narrowWindow,
  RowDivider,
  RowLabel,
} from "@/packages/ui/lib/surface";
import { Progress } from "@/packages/ui/progress";

import { Caption, DemoCard, DemoPage } from "../kit";

const KINDS = [
  { name: "Photos", count: 1204 },
  { name: "Videos", count: 86 },
  { name: "Screenshots", count: 312 },
  { name: "Live Photos", count: 48 },
];

const TASKS = [
  "Freeze the API",
  "Write the release notes",
  "Record the compatibility baseline",
  "Tag the release",
  "Announce it",
];

const COOKIES = [
  { name: "Necessary", detail: "Signing in, security and your settings", required: true },
  { name: "Analytics", detail: "Which pages are visited, counted without who visited them" },
  { name: "Personalization", detail: "Remembers your region and the layout you chose" },
  { name: "Marketing", detail: "Shows our offers on other sites" },
];

const CHANNELS: { name: string; detail: string; icon: typeof Bell; disabled?: boolean }[] = [
  { name: "Push", detail: "As it happens", icon: Bell },
  { name: "Email", detail: "A daily digest", icon: FileText },
  { name: "SMS", detail: "Add a number first", icon: MessageSquare, disabled: true },
];

const SIZES = [
  { name: "Small", size: "sm" as const, scale: 0.8 },
  { name: "Regular", size: "default" as const, scale: 1 },
  { name: "Large", size: "lg" as const, scale: 1.25 },
];

const count = (n: number) => n.toLocaleString("en-US");

/** A choice card: the whole surface is the box, in its corner. */
function Tile(props: {
  name: string;
  detail: string;
  on: boolean;
  disabled?: boolean;
  icon?: JSX.Element;
  onChange: (checked: boolean) => void;
}) {
  const look = tileLook(() => props.on, { disabled: () => props.disabled });
  return (
    <Checkbox
      checked={props.on}
      disabled={props.disabled}
      onChange={({ checked }) => props.onChange(checked)}
      class="group"
      style={[
        look.style,
        {
          flexDirection: "row-reverse",
          alignItems: "flex-start",
          gap: 8,
          justifyContent: "space-between",
        },
      ]}
      hoverStyle={look.hoverStyle}
      activeStyle={look.activeStyle}
      focusVisibleStyle={look.focusVisibleStyle}
      disabledStyle={look.disabledStyle}
    >
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        {props.icon}
        <Text
          style={{
            marginTop: props.icon ? 6 : 0,
            fontSize: controlSize.label,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          {props.name}
        </Text>
        <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
          {props.detail}
        </Text>
      </View>
    </Checkbox>
  );
}

/** A checkbox of the sizes card: its label beside the box, no row of its own. */
function Inline(props: {
  label: string;
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  onChange?: (checked: boolean) => void;
}) {
  return (
    <Checkbox
      checked={props.checked}
      indeterminate={props.indeterminate}
      disabled={props.disabled}
      size={props.size}
      onChange={({ checked }) => props.onChange?.(checked)}
      style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}
      hoverStyle={{ opacity: 0.85 }}
    >
      <Text style={{ fontSize: controlSize.label, color: colors.foreground }}>{props.label}</Text>
    </Checkbox>
  );
}

export function CheckboxDemo() {
  const last = signal("—");
  const shown = signal<string[]>(["Photos", "Videos", "Live Photos"]);
  const done = signal<string[]>(["Freeze the API", "Write the release notes"]);
  const allowed = signal<string[]>(["Analytics"]);
  const saved = signal(false);
  const channels = signal<string[]>(["Push"]);
  const sizes = signal<string[]>(["Regular"]);

  const hasKind = (name: string) => shown().includes(name);
  const allKinds = () => shown().length === KINDS.length;
  const someKinds = () => shown().length > 0 && !allKinds();
  const total = computed(() =>
    KINDS.filter((k) => hasKind(k.name)).reduce((n, k) => n + k.count, 0),
  );

  const hasTask = (task: string) => done().includes(task);
  const left = () => TASKS.length - done().length;

  const hasCookie = (name: string) => allowed().includes(name);
  const setAllowed = (next: string[]) => {
    allowed.set(next);
    saved.set(false);
  };

  const hasChannel = (name: string) => channels().includes(name);
  const hasSize = (name: string) => sizes().includes(name);

  return (
    <DemoPage title="Checkbox" note={() => last()}>
      <DemoCard title="Filter" subtitle="“Select all” shows a partial selection">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ flex: 1, fontSize: controlSize.detail, color: colors.mutedForeground }}>
            Which kinds of items to show
          </Text>
          <Badge>{`${shown().length} of ${KINDS.length}`}</Badge>
        </View>
        <View>
          <Checkbox
            checked={allKinds()}
            indeterminate={someKinds()}
            onChange={({ checked }) => {
              shown.set(checked ? KINDS.map((k) => k.name) : []);
              last.set(`Select all: ${checked}`);
            }}
            {...listRow({ first: true })}
          >
            <RowLabel label="Select all" strong />
          </Checkbox>
          <Each of={KINDS}>
            {(kind) => (
              <Checkbox
                checked={hasKind(kind().name)}
                onChange={({ checked }) => {
                  shown.set(
                    checked
                      ? KINDS.map((k) => k.name).filter((n) => n === kind().name || hasKind(n))
                      : shown().filter((n) => n !== kind().name),
                  );
                  last.set(`${kind().name}: ${checked}`);
                }}
                // One level under "Select all": the boxes line up with its label.
                {...listRow({ start: controlSize.control + controlSize.gap })}
              >
                <RowDivider show />
                <Text style={{ flex: 1, fontSize: controlSize.label, color: colors.foreground }}>
                  {kind().name}
                </Text>
                <Text
                  style={{
                    fontSize: controlSize.detail,
                    color: colors.faint,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {count(kind().count)}
                </Text>
              </Checkbox>
            )}
          </Each>
        </View>
        <Caption>{shown().length ? `Showing ${count(total())} items` : "Nothing to show"}</Caption>
      </DemoCard>

      <DemoCard title="Checklist" subtitle="A task done fades back; the bar fills">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ flex: 1, fontSize: controlSize.detail, color: colors.mutedForeground }}>
            What the release needs
          </Text>
          <Badge
            tone={left() === 0 ? "success" : "neutral"}
          >{`${done().length} of ${TASKS.length}`}</Badge>
        </View>
        <View>
          <Each of={TASKS} key="index">
            {(task, i) => (
              <Checkbox
                round
                checked={hasTask(task())}
                onChange={({ checked }) => {
                  done.set(checked ? [...done(), task()] : done().filter((t) => t !== task()));
                  last.set(`${task()}: ${checked ? "done" : "to do"}`);
                }}
                {...listRow({ first: i() === 0 })}
              >
                <RowDivider show={i() !== 0} />
                <Text
                  style={{
                    flex: 1,
                    fontSize: controlSize.label,
                    color: hasTask(task()) ? colors.faint : colors.foreground,
                    textDecorationLine: hasTask(task()) ? "line-through" : "none",
                  }}
                >
                  {task()}
                </Text>
              </Checkbox>
            )}
          </Each>
        </View>
        <Progress
          value={(done().length / TASKS.length) * 100}
          height={4}
          accessibilityLabel="Release readiness"
        />
        <Caption>{left() === 0 ? "Ready to ship" : `${left()} to go before the release`}</Caption>
      </DemoCard>

      <DemoCard title="Consent" subtitle="A description each; the necessary one stays on">
        <View>
          <Each of={COOKIES} key="index">
            {(cookie, i) => (
              <Checkbox
                checked={cookie().required || hasCookie(cookie().name)}
                disabled={cookie().required}
                onChange={({ checked }) => {
                  setAllowed(
                    checked
                      ? [...allowed(), cookie().name]
                      : allowed().filter((n) => n !== cookie().name),
                  );
                  last.set(`${cookie().name}: ${checked}`);
                }}
                // The box at the first line of the label, not its middle.
                {...listRow({
                  first: i() === 0,
                  disabled: () => !!cookie().required,
                  style: { alignItems: "flex-start" },
                })}
              >
                <RowDivider show={i() !== 0} />
                <RowLabel
                  label={cookie().required ? `${cookie().name} (always on)` : cookie().name}
                  detail={cookie().detail}
                />
              </Checkbox>
            )}
          </Each>
        </View>
        <View style={{ flexDirection: "row", gap: controlSize.gap }}>
          <Button
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onPress={() => {
              setAllowed(COOKIES.filter((c) => !c.required).map((c) => c.name));
              last.set("Consent: all accepted");
            }}
          >
            Accept all
          </Button>
          <Button
            size="sm"
            style={{ flex: 1 }}
            disabled={saved()}
            onPress={() => {
              saved.set(true);
              last.set(`Consent: ${allowed().join(", ") || "necessary only"}`);
            }}
          >
            {saved() ? "Saved" : "Save choices"}
          </Button>
        </View>
      </DemoCard>

      <DemoCard title="Choice cards" subtitle="The whole card is the checkbox">
        <View style={{ flexDirection: narrowWindow() ? "column" : "row", gap: 8 }}>
          <Each of={CHANNELS}>
            {(channel) => (
              <Tile
                name={channel().name}
                detail={channel().detail}
                on={hasChannel(channel().name)}
                disabled={channel().disabled}
                icon={
                  <Icon
                    icon={channel().icon}
                    size={18}
                    tint={hasChannel(channel().name) ? colors.brand : colors.mutedForeground}
                  />
                }
                onChange={(checked) => {
                  channels.set(
                    checked
                      ? [...channels(), channel().name]
                      : channels().filter((n) => n !== channel().name),
                  );
                  last.set(`${channel().name}: ${checked}`);
                }}
              />
            )}
          </Each>
        </View>
        <Caption>
          {channels().length
            ? `Notifying you by ${channels().join(" and ").toLowerCase()}`
            : "No notifications"}
        </Caption>
      </DemoCard>

      <DemoCard title="Sizes and states" subtitle="Three sizes; disabled in every state">
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 20,
            rowGap: 6,
          }}
        >
          <Each of={SIZES}>
            {(z) => (
              <Inline
                label={z().name}
                size={z().size}
                checked={hasSize(z().name)}
                onChange={(checked) => {
                  sizes.set(
                    checked ? [...sizes(), z().name] : sizes().filter((n) => n !== z().name),
                  );
                  last.set(`${z().name}: ${checked}`);
                }}
              />
            )}
          </Each>
        </View>
        <View style={{ height: 1, backgroundColor: colors.line }} />
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 20,
            rowGap: 6,
          }}
        >
          <Inline label="Unavailable" checked={false} disabled />
          <Inline label="Required" checked disabled />
          <Inline label="Partly set" checked={false} indeterminate disabled />
        </View>
        <Caption>Hover and Tab to each: the disabled ones take neither</Caption>
      </DemoCard>
    </DemoPage>
  );
}
