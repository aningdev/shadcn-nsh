import { colors, finish, rounded } from "@shadcn-nsh/theme";
// Accordion: the official gallery's scene (`references/nsh/examples/gallery/demos/AccordionDemo.tsx`)
// with this library's parts — an FAQ that opens one answer at a time (gift wrap coming later), and
// a settings page whose sections open together, with switches, a radio group and a nested accordion
// inside. `nsh/base`'s Accordion owns the expanded state screen readers hear and the panels'
// reveal; the app owns `value` (the open items) and every look.
import { ArrowDown, ArrowUp, Bell, Star, type IconNode } from "lucide";
import type { JSX } from "nsh";
import { platform, signal, Text, View } from "nsh";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/packages/ui/accordion";
import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { controlSize, insetSurface, listRow, RowLabel } from "@/packages/ui/lib/surface";
import { Radio, RadioGroup, RadioRing } from "@/packages/ui/radio-group";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage } from "../kit";

const pointer = platform.desktop;
/** The sizes of the page: a pointer's compact tier, a touch screen's roomier one. */
const size = controlSize;

/** The hairline between two items. */
function Divider(props: { show: boolean }) {
  return <View style={{ height: props.show ? 1 : 0, backgroundColor: colors.line }} />;
}

/**
 * An item's heading: its trigger is the row, the title and a summary, then the chevron, which
 * turns as the item opens. A disabled one dims.
 */
function Heading(props: {
  title: string;
  detail?: string;
  leading?: JSX.Element;
  disabled?: boolean;
  level?: number;
}) {
  return (
    <AccordionHeader level={props.level}>
      <AccordionTrigger first>
        <View
          style={{ flexDirection: "row", alignItems: "center", flexGrow: 1, gap: controlSize.gap }}
        >
          {props.leading}
          <RowLabel label={props.title} detail={props.detail} />
        </View>
      </AccordionTrigger>
    </AccordionHeader>
  );
}

const FAQ: {
  value: string;
  icon: IconNode;
  question: string;
  answer: string[];
  disabled?: boolean;
}[] = [
  {
    value: "shipping",
    icon: ArrowUp,
    question: "When will my order ship?",
    answer: [
      "Orders placed before 2 pm leave the warehouse the same day.",
      "Standard delivery takes two to five working days; express arrives the next day.",
    ],
  },
  {
    value: "returns",
    icon: ArrowDown,
    question: "How do I return an item?",
    answer: [
      "Open the order, choose Return and print the label.",
      "Drop the parcel at any carrier point within 30 days: the refund lands in three to five days.",
    ],
  },
  {
    value: "warranty",
    icon: Star,
    question: "What does the warranty cover?",
    answer: [
      "Two years against defects in materials and workmanship.",
      "Repairs, parts and labour are included; accidental damage is not.",
    ],
  },
  {
    value: "gift",
    icon: Bell,
    question: "Can I add gift wrapping?",
    answer: ["Gift wrapping opens with the holiday season."],
    disabled: true,
  },
];

/** An FAQ, one answer open at a time; gift wrap comes later. */
function Faq(props: { log: (text: string) => void }) {
  const open = signal<string[]>(["shipping"]);
  const question = () => FAQ.find((q) => q.value === open()[0])?.question;
  return (
    <DemoCard title="FAQ" subtitle="One open at a time; gift wrap comes later" style={{ gap: 10 }}>
      <View style={{ flexDirection: "row" }}>
        <Badge tone={open().length ? "accent" : "neutral"}>
          {open().length ? "1 open" : "All closed"}
        </Badge>
      </View>
      <Accordion
        value={open()}
        onChange={({ value }) => {
          open.set(value);
          props.log(value.length ? `FAQ: ${value.join(", ")}` : "FAQ: all closed");
        }}
      >
        <Each of={FAQ}>
          {(q, i) => (
            <AccordionItem value={q().value} disabled={q().disabled}>
              <Divider show={i() !== 0} />
              <Heading
                title={q().question}
                disabled={q().disabled}
                leading={
                  <View
                    style={{
                      width: size.control + 6,
                      height: size.control + 6,
                      ...rounded(7),
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: open().includes(q().value)
                        ? colors.brandFill
                        : colors.raised,
                      boxShadow: open().includes(q().value)
                        ? finish.light.boxShadow
                        : finish.chip.boxShadow,
                    }}
                    class="transition-colors duration-200 motion-reduce:transition-none"
                  >
                    <Icon
                      icon={q().icon}
                      size={size.check}
                      tint={open().includes(q().value) ? colors.onBrand : colors.mutedForeground}
                    />
                  </View>
                }
              />
              <AccordionPanel
                reveal
                accessibilityLabel={q().question}
                start={size.control + 6 + size.gap}
              >
                <Each of={q().answer}>
                  {(line) => (
                    <Text
                      style={{
                        fontSize: size.label,
                        lineHeight: Math.round(size.label * 1.45),
                        color: colors.mutedForeground,
                      }}
                    >
                      {line()}
                    </Text>
                  )}
                </Each>
              </AccordionPanel>
            </AccordionItem>
          )}
        </Each>
      </Accordion>
      <Text style={{ fontSize: size.detail, color: colors.faint }}>
        {question() ? `Reading: ${question()}` : "Pick a question to read its answer"}
      </Text>
    </DemoCard>
  );
}

/** A settings row with a switch, the label and its quieter line leading. */
function Toggle(props: {
  label: string;
  detail: string;
  on: boolean;
  set: (on: boolean) => void;
  log: (text: string) => void;
}) {
  return (
    <Switch
      checked={props.on}
      onChange={({ checked }) => {
        props.set(checked);
        props.log(`${props.label}: ${checked ? "on" : "off"}`);
      }}
      accessibilityLabel={props.label}
      {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
    >
      <RowLabel label={props.label} detail={props.detail} />
    </Switch>
  );
}

/** One row of the profile-visibility group: the ring is the group the row sinks with. */
function Choice(props: {
  label: string;
  detail: string;
  on: boolean;
  set: (label: string) => void;
  log: (text: string) => void;
}) {
  return (
    <Radio
      checked={props.on}
      onChange={() => {
        props.set(props.label);
        props.log(`Profile visible to: ${props.label}`);
      }}
      accessibilityLabel={props.label}
      class="group"
      {...listRow({ first: true })}
    >
      <RadioRing on={props.on} />
      <RowLabel label={props.label} detail={props.detail} />
    </Radio>
  );
}

/** A settings page: several sections open at once, one nested. */
function Settings(props: { log: (text: string) => void }) {
  const SECTIONS = ["notifications", "privacy", "display", "advanced"];
  const open = signal<string[]>(["notifications"]);
  const nested = signal<string[]>([]);
  const alerts = signal({ messages: true, mentions: true, digest: false });
  const visibility = signal("Contacts");
  const textSize = signal<"small" | "default" | "large">("default");
  const cellular = signal(true);
  const bounds = signal(false);
  const onCount = () => Object.values(alerts()).filter(Boolean).length;
  const change = (value: string[]) => {
    open.set(value);
    props.log(`Settings: ${value.length ? value.join(", ") : "all closed"}`);
  };

  return (
    <DemoCard title="Settings" subtitle="Several open at once, one nested" style={{ gap: 10 }}>
      <View style={{ alignSelf: "flex-end" }}>
        <Button
          variant="secondary"
          size="sm"
          onPress={() => change(open().length === SECTIONS.length ? [] : SECTIONS)}
        >
          {open().length === SECTIONS.length ? "Collapse all" : "Expand all"}
        </Button>
      </View>
      <Accordion multiple value={open()} onChange={({ value }) => change(value)}>
        <AccordionItem value="notifications">
          <Heading title="Notifications" detail={`${onCount()} of 3 on`} />
          <AccordionPanel reveal accessibilityLabel="Notifications" start={8}>
            <Toggle
              label="Messages"
              detail="A banner for every new message"
              on={alerts().messages}
              set={(on) => alerts.set({ ...alerts(), messages: on })}
              log={props.log}
            />
            <Toggle
              label="Mentions"
              detail="When someone writes your name"
              on={alerts().mentions}
              set={(on) => alerts.set({ ...alerts(), mentions: on })}
              log={props.log}
            />
            <Toggle
              label="Weekly digest"
              detail="A summary every Monday morning"
              on={alerts().digest}
              set={(on) => alerts.set({ ...alerts(), digest: on })}
              log={props.log}
            />
          </AccordionPanel>
        </AccordionItem>
        <Divider show />
        <AccordionItem value="privacy">
          <Heading title="Privacy" detail={`Profile visible to ${visibility().toLowerCase()}`} />
          <AccordionPanel reveal accessibilityLabel="Privacy" start={8}>
            <RadioGroup accessibilityLabel="Profile visibility">
              <Choice
                label="Everyone"
                detail="Anyone with the app can find you"
                on={visibility() === "Everyone"}
                set={(label) => visibility.set(label)}
                log={props.log}
              />
              <Choice
                label="Contacts"
                detail="Only people in your address book"
                on={visibility() === "Contacts"}
                set={(label) => visibility.set(label)}
                log={props.log}
              />
              <Choice
                label="Nobody"
                detail="Hidden from search and suggestions"
                on={visibility() === "Nobody"}
                set={(label) => visibility.set(label)}
                log={props.log}
              />
            </RadioGroup>
          </AccordionPanel>
        </AccordionItem>
        <Divider show />
        <AccordionItem value="display">
          <Heading title="Display" detail={`Text size: ${textSize()}`} />
          <AccordionPanel reveal accessibilityLabel="Display">
            <Segmented
              value={textSize()}
              onValueChange={(value) => {
                textSize.set(value as "small" | "default" | "large");
                props.log(`Text size: ${value}`);
              }}
            >
              <SegmentedList size={pointer ? "sm" : "default"} fill>
                <SegmentedItem value="small">Small</SegmentedItem>
                <SegmentedItem value="default">Default</SegmentedItem>
                <SegmentedItem value="large">Large</SegmentedItem>
              </SegmentedList>
            </Segmented>
            <View style={{ ...insetSurface(), padding: 12 }}>
              <Text
                style={{
                  fontSize: { small: 13, default: 15, large: 18 }[textSize()],
                  color: colors.foreground,
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </Text>
            </View>
          </AccordionPanel>
        </AccordionItem>
        <Divider show />
        <AccordionItem value="advanced">
          <Heading title="Advanced" detail="Options most people leave alone" />
          <AccordionPanel reveal accessibilityLabel="Advanced" start={size.gap}>
            {/* An accordion inside a panel: its own value, one section at a time, headings a
                  level down. */}
            <Accordion
              value={nested()}
              onChange={({ value }) => {
                nested.set(value);
                props.log(`Advanced: ${value.length ? value.join(", ") : "all closed"}`);
              }}
            >
              <AccordionItem value="network">
                <Heading
                  level={4}
                  title="Network"
                  detail={cellular() ? "Cellular data on" : "Wi-Fi only"}
                />
                <AccordionPanel reveal accessibilityLabel="Network" start={8}>
                  <Toggle
                    label="Use cellular data"
                    detail="Sync when Wi-Fi is not around"
                    on={cellular()}
                    set={(on) => cellular.set(on)}
                    log={props.log}
                  />
                </AccordionPanel>
              </AccordionItem>
              <Divider show />
              <AccordionItem value="developer">
                <Heading level={4} title="Developer" detail="Tools for building the app" />
                <AccordionPanel reveal accessibilityLabel="Developer" start={8}>
                  <Toggle
                    label="Show layout bounds"
                    detail="Outline every view on screen"
                    on={bounds()}
                    set={(on) => bounds.set(on)}
                    log={props.log}
                  />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </DemoCard>
  );
}

export function AccordionDemo() {
  const last = signal("—");
  const log = (text: string) => last.set(text);
  return (
    <DemoPage title="Accordion" note={() => `Last event: ${last()}`}>
      <Faq log={log} />
      <Settings log={log} />
    </DemoPage>
  );
}
