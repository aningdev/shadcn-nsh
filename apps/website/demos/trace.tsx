// shadcn's trace scenes with this library's parts: an agent's streaming turn — a reasoning line
// that counts and then opens onto its text, a tool call that goes from queued to running to done
// and opens onto its code, a row of sources — and a step that failed.
import { colors } from "@shadcn-nsh/theme";
import { Brain, CircleAlert, FileText, Terminal } from "lucide";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockActions,
} from "@/packages/ui/code-block";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/packages/ui/trace";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";
import { createTurn, failure, reasoning, sources, toolCode } from "./trace-data";

const turn = createTurn();

function App() {
  const opened = signal("Nothing opened yet");
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
          <Trace>
            <TraceCollapsible
              open={turn.reasoningOpen()}
              onOpenChange={(event) => turn.setReasoningOpen(event.open)}
            >
              <TraceCollapsibleTrigger>
                <TraceLine status={thinking() ? "running" : undefined}>
                  <TraceIcon>
                    <Icon icon={Brain} size={16} tint={colors.mutedForeground} />
                  </TraceIcon>
                  <TraceTitle>{thinking() ? "Thinking…" : "Thought for"}</TraceTitle>
                  <TraceDescription>{turn.seconds()} s</TraceDescription>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>{reasoning}</TraceCollapsibleContent>
            </TraceCollapsible>
          </Trace>
        </DemoSection>

        <DemoSection title="A tool call" axis="block">
          <Trace>
            <TraceCollapsible
              open={turn.toolOpen() && toolReady()}
              onOpenChange={(event) => turn.setToolOpen(event.open)}
            >
              <TraceCollapsibleTrigger disabled={!toolReady()}>
                <TraceLine status={toolStatus()}>
                  <TraceIcon>
                    <Icon icon={Terminal} size={16} tint={colors.mutedForeground} />
                  </TraceIcon>
                  <TraceTitle>Run code</TraceTitle>
                  <TraceDescription>{toolNote()}</TraceDescription>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <CodeBlock size="sm">
                  <CodeBlockHeader>
                    <CodeBlockTitle>python</CodeBlockTitle>
                    <CodeBlockActions>
                      <CodeBlockCopyButton value={toolCode} />
                    </CodeBlockActions>
                  </CodeBlockHeader>
                  <CodeBlockContent>{toolCode}</CodeBlockContent>
                </CodeBlock>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          </Trace>
        </DemoSection>

        <DemoSection title="Sources" axis="block">
          <Trace>
            {sources.map((source) => (
              <TraceLine onPress={() => opened.set(`Opened ${source.site}`)}>
                <TraceIcon>
                  <Icon icon={FileText} size={16} tint={colors.mutedForeground} />
                </TraceIcon>
                <TraceTitle>{source.title}</TraceTitle>
                <TraceDescription>{source.site}</TraceDescription>
              </TraceLine>
            ))}
          </Trace>
          <Text style={{ color: ui().faint }}>{opened()}</Text>
        </DemoSection>

        <DemoSection title="A failed step" axis="block">
          <Trace>
            <TraceCollapsible defaultOpen>
              <TraceCollapsibleTrigger>
                <TraceLine status="error">
                  <TraceIcon>
                    <Icon icon={CircleAlert} size={16} tint={colors.destructive} />
                  </TraceIcon>
                  <TraceTitle>Run code failed</TraceTitle>
                  <TraceDescription>exit 1</TraceDescription>
                </TraceLine>
              </TraceCollapsibleTrigger>
              <TraceCollapsibleContent>
                <CodeBlock size="sm" variant="destructive">
                  <CodeBlockContent wrap>{failure}</CodeBlockContent>
                </CodeBlock>
              </TraceCollapsibleContent>
            </TraceCollapsible>
          </Trace>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
