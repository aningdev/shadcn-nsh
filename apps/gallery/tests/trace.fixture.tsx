import { mount, signal, Text, View } from "nsh";

import { Button } from "../../../packages/ui/button";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceDescription,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "../../../packages/ui/trace";

function App() {
  const running = signal(true);
  const pressed = signal(0);
  return (
    <View>
      <Trace>
        <TraceCollapsible>
          <TraceCollapsibleTrigger>
            <TraceLine>
              <TraceIcon>
                <Text>◆</Text>
              </TraceIcon>
              <TraceTitle>Thought for</TraceTitle>
              <TraceDescription>3 s</TraceDescription>
            </TraceLine>
          </TraceCollapsibleTrigger>
          <TraceCollapsibleContent>The tide is low at noon.</TraceCollapsibleContent>
        </TraceCollapsible>
        <TraceLine status={running() ? "running" : undefined}>
          <TraceIcon>
            <Text>★</Text>
          </TraceIcon>
          <TraceTitle>Run code</TraceTitle>
        </TraceLine>
        <TraceLine status="pending" onPress={() => pressed.set(pressed() + 1)}>
          <TraceTitle>Queued call</TraceTitle>
        </TraceLine>
      </Trace>
      <Button onPress={() => running.set(false)}>Finish</Button>
      <Text>{`pressed ${pressed()}`}</Text>
    </View>
  );
}

mount(App);
