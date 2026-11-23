// The reference of `marker.tsx`: the same page, the look spread on `nsh`'s own View and Text
// instead of worn by the components. The render check requires the two to draw the same pixels.
import type { IconNode } from "lucide";
import { ExternalLink, FileText, GitBranch, Search } from "lucide";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Icon } from "@/packages/ui/lib/icons";
import { markerLook, type MarkerVariant } from "@/packages/ui/marker";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

/** A marker as the look draws it: the row, the rule on each side of a separator, the parts. */
function Mark(props: {
  variant?: MarkerVariant;
  children: JSX.Element;
  /** A marker that acts: the hand over it and an underlined line. */
  action?: () => void;
  /** Announced as it changes (NSH has no `status` role: `alert` is the one it has for this). */
  announce?: boolean;
}) {
  const variant = () => props.variant ?? "default";
  return (
    <View
      role={props.action ? "button" : props.announce ? "alert" : undefined}
      onPress={props.action}
      style={[markerLook().root(variant()), props.action ? markerLook().pressable : null]}
    >
      <If when={variant() === "separator"}>
        <View style={markerLook().rule} />
      </If>
      {props.children}
      <If when={variant() === "separator"}>
        <View style={markerLook().rule} />
      </If>
    </View>
  );
}

/** A marker's icon box. */
function MarkIcon(props: { icon?: IconNode; children?: JSX.Element }) {
  return (
    <View style={markerLook().icon}>
      {props.icon ? <Icon icon={props.icon} {...markerLook().glyph} /> : props.children}
    </View>
  );
}

/** A marker's line. */
function MarkText(props: { children: string; variant?: MarkerVariant; interactive?: boolean }) {
  return (
    <Text
      style={[
        markerLook().content(props.variant ?? "default"),
        props.interactive ? { textDecorationLine: "underline" } : null,
      ]}
    >
      {props.children}
    </Text>
  );
}

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  return (
    <DemoPage title="Marker">
      <Text style={{ color: ui().muted }}>
        {"A line in a conversation that is not a message: a status, a note, one step of a run."}
      </Text>

      <Split gap={14} inspector={<Log title="onPress" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="A run" axis="block">
            <Mark variant="default">
              <MarkIcon icon={Search} />
              <MarkText variant="default">Explored 4 files</MarkText>
            </Mark>
            <Mark>
              <MarkIcon icon={GitBranch} />
              <MarkText>Switched to a new branch</MarkText>
            </Mark>
            <Mark>
              <MarkIcon icon={FileText} />
              <MarkText>Opened implementation notes</MarkText>
            </Mark>
            <Mark action={() => log("View the pull request")}>
              <MarkIcon icon={ExternalLink} />
              <MarkText interactive>View the pull request</MarkText>
            </Mark>
          </DemoSection>

          <DemoSection title="Status" axis="block">
            <Mark announce>
              <MarkIcon>
                <Spinner size="sm" tint={ui().muted} />
              </MarkIcon>
              <MarkText>Thinking…</MarkText>
            </Mark>
            <Mark variant="separator" announce>
              <MarkIcon>
                <Spinner size="sm" tint={ui().muted} />
              </MarkIcon>
              <MarkText variant="separator">Running tests</MarkText>
            </Mark>
          </DemoSection>

          <DemoSection title="Separator" axis="block">
            <Mark variant="separator">
              <MarkText variant="separator">Today</MarkText>
            </Mark>
            <Mark variant="separator">
              <MarkText variant="separator">Worked for 42s</MarkText>
            </Mark>
            <Mark variant="separator">
              <MarkText variant="separator">Conversation compacted</MarkText>
            </Mark>
          </DemoSection>

          <DemoSection title="Border" axis="block">
            <Mark variant="border">
              <MarkIcon icon={GitBranch} />
              <MarkText variant="border">Switched to release-candidate</MarkText>
            </Mark>
            <Mark variant="border">
              <MarkIcon icon={Search} />
              <MarkText variant="border">Reviewed 8 related files</MarkText>
            </Mark>
            <Mark variant="border">
              <MarkIcon icon={FileText} />
              <MarkText variant="border">Opened implementation notes</MarkText>
            </Mark>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
