// The reference of `trace.tsx`: the same page, the look spread on `nsh`'s own View and Text and
// `nsh/base`'s Collapsible instead of worn by the parts. The render check requires the two to draw
// the same pixels.
import { colors, iconSize } from "@shadcn-nsh/theme";
import { Brain, ChevronRight, CircleAlert, FileText, Terminal } from "lucide";
import { mount, signal, Text, View } from "nsh";
import { Collapsible } from "nsh/base";

import { Button } from "@/packages/ui/button";
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/packages/ui/code-block";
import { Icon } from "@/packages/ui/lib/icons";
import { Spinner } from "@/packages/ui/spinner";
import { traceLook, type TraceStatus } from "@/packages/ui/trace";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";
import { createTurn, failure, reasoning, sources, toolCode } from "./trace-data";

const turn = createTurn();

/** A line's icon box: the spinner while it runs. */
function Slot(props: { status?: TraceStatus; children: unknown }) {
  return (
    <View style={[traceLook().icon]}>
      {props.status === "running" ? (
        <Spinner side={iconSize.sm} tint={colors.mutedForeground} />
      ) : (
        (props.children as never)
      )}
    </View>
  );
}

/** A line's title and description. */
function Words(props: { status?: TraceStatus; title: string; note: string }) {
  return (
    <>
      <Text class={traceLook().titleClass(props.status)} style={[traceLook().title]}>
        {props.title}
      </Text>
      <Text style={[traceLook().description]}>{props.note}</Text>
    </>
  );
}

/** A collapsible line: the trigger row and its chevron, the panel under it. */
function Opens(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: TraceStatus;
  disabled?: boolean;
  icon: unknown;
  title: string;
  note: string;
  children: unknown;
}) {
  return (
    <View style={[traceLook().collapsible]}>
      <Collapsible
        open={props.open}
        reveal
        style={{ alignItems: "stretch" }}
        content={<View style={[traceLook().content]}>{props.children as never}</View>}
      >
        <View
          accessible
          role="button"
          accessibilityState={{ expanded: props.open, disabled: Boolean(props.disabled) }}
          class={traceLook().lineClass}
          onPress={props.disabled ? undefined : () => props.onOpenChange(!props.open)}
          style={[traceLook().trigger]}
          focusVisibleStyle={[traceLook().focusVisible]}
          disabledStyle={{ opacity: 0.5 }}
        >
          <View style={[traceLook().line(props.status)]}>
            <Slot status={props.status}>{props.icon}</Slot>
            <Words status={props.status} title={props.title} note={props.note} />
          </View>
          <View style={[traceLook().icon, traceLook().chevron(props.open)]}>
            <Icon
              icon={ChevronRight}
              size={iconSize.md}
              tint={props.status === "error" ? colors.destructive : colors.mutedForeground}
            />
          </View>
        </View>
      </Collapsible>
    </View>
  );
}

function App() {
  const opened = signal("Nothing opened yet");
  const failed = signal(true);
  const thinking = () => turn.phase() === "thinking";
  const toolStatus = () =>
    turn.phase() === "queued" ? "pending" : turn.phase() === "running" ? "running" : undefined;
  const toolNote = () =>
    turn.phase() === "queued" ? "Queued" : turn.phase() === "running" ? "Running" : "84 ms";
  const toolReady = () => turn.phase() === "done";
  return (
    <DemoPage title="Trace">
      <Text style={{ color: ui().muted }}>
        {
          "An agent's steps, one line each: reasoning, a tool call, sources. A line can open onto what it did."
        }
      </Text>
      <View style={{ flexDirection: "row" }}>
        <Button variant="secondary" size="sm" onPress={() => turn.replay()}>
          Replay the turn
        </Button>
      </View>

      <DemoCard>
        <DemoSection title="Reasoning" axis="block">
          <View style={[traceLook().root]}>
            <Opens
              open={turn.reasoningOpen()}
              onOpenChange={turn.setReasoningOpen}
              status={thinking() ? "running" : undefined}
              icon={<Icon icon={Brain} size={16} tint={colors.mutedForeground} />}
              title={thinking() ? "Thinking…" : "Thought for"}
              note={`${turn.seconds()} s`}
            >
              <Text style={[traceLook().contentText]}>{reasoning}</Text>
            </Opens>
          </View>
        </DemoSection>

        <DemoSection title="A tool call" axis="block">
          <View style={[traceLook().root]}>
            <Opens
              open={turn.toolOpen() && toolReady()}
              onOpenChange={turn.setToolOpen}
              status={toolStatus()}
              disabled={!toolReady()}
              icon={<Icon icon={Terminal} size={16} tint={colors.mutedForeground} />}
              title="Run code"
              note={toolNote()}
            >
              <CodeBlock size="sm">
                <CodeBlockHeader>
                  <CodeBlockTitle>python</CodeBlockTitle>
                  <CodeBlockActions>
                    <CodeBlockCopyButton value={toolCode} />
                  </CodeBlockActions>
                </CodeBlockHeader>
                <CodeBlockContent>{toolCode}</CodeBlockContent>
              </CodeBlock>
            </Opens>
          </View>
        </DemoSection>

        <DemoSection title="Sources" axis="block">
          <View style={[traceLook().root]}>
            {sources.map((source) => (
              <View
                accessible
                role="button"
                class={traceLook().lineClass}
                onPress={() => opened.set(`Opened ${source.site}`)}
                style={[traceLook().line(undefined)]}
                focusVisibleStyle={[traceLook().focusVisible]}
              >
                <Slot>
                  <Icon icon={FileText} size={16} tint={colors.mutedForeground} />
                </Slot>
                <Words title={source.title} note={source.site} />
              </View>
            ))}
          </View>
          <Text style={{ color: ui().faint }}>{opened()}</Text>
        </DemoSection>

        <DemoSection title="A failed step" axis="block">
          <View style={[traceLook().root]}>
            <Opens
              open={failed()}
              onOpenChange={(next) => failed.set(next)}
              status="error"
              icon={<Icon icon={CircleAlert} size={16} tint={colors.destructive} />}
              title="Run code failed"
              note="exit 1"
            >
              <CodeBlock size="sm" variant="destructive">
                <CodeBlockContent wrap>{failure}</CodeBlockContent>
              </CodeBlock>
            </Opens>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
