// The reference of `message-scroller.tsx`: the same page, the look spread on `nsh`'s own List, View
// and Text instead of worn by the components. The render check requires the two to draw the same
// pixels, so the scroller that opens at the end reveals it here too.
import { colors } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp, FileText } from "lucide";
import type { JSX } from "nsh";
import { List, mount, signal, Text, View } from "nsh";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  attachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
} from "@/packages/ui/attachment";
import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import { Button, buttonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { type MessageScrollerDirection, messageScrollerLook } from "@/packages/ui/message-scroller";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

const look = messageScrollerLook();

interface Turn {
  id: number;
  from: string;
  text: string;
  mine: boolean;
  file?: string;
}

const names = ["Mia Chen", "Oliver Reed"] as const;

const opening: Turn[] = [
  { id: 1, from: names[0], text: "Morning. The registry build is red again.", mine: false },
  {
    id: 2,
    from: names[1],
    text: "It's the marker entry: it imports lucide and never said so.",
    mine: true,
  },
  { id: 3, from: names[0], text: "Honest dependencies. What a concept.", mine: false },
  { id: 4, from: names[1], text: "I declared it. Rebuilding now.", mine: true },
  { id: 5, from: names[0], text: "And the screenshots?", mine: false },
  {
    id: 6,
    from: names[1],
    text: "Four per component, light and dark, looked at with my own eyes.",
    mine: true,
  },
];

const lines = [
  "The list only mounts what is near the screen, so this costs almost nothing.",
  "Scroll up and it holds your place while new turns arrive below.",
  "Four hundred turns, and the frame does not know the difference.",
  "The attachment rides along in a row, keyed by the turn it belongs to.",
  "Send again; the view stays at the newest turn.",
  "Opening at the oldest is the same list with the other end first.",
  "A row is recycled: the turn it holds changes, the cell does not.",
  "That is the whole trick. The rest is spacing.",
  "Do the screenshots still line up?",
  "Down to the pixel, both themes.",
  "And the registry entry says what it imports now.",
  "Then it is done.",
];

/** A conversation that no viewport could hold: the opening turns, then a generated run of them. */
function conversation(count: number): Turn[] {
  return Array.from({ length: count }, (_, i) => {
    const first = opening[i];
    if (first) return first;
    return {
      id: i + 1,
      from: names[i % 2]!,
      text: lines[i % lines.length]!,
      mine: i % 2 === 1,
      file: i === count - 3 ? "build.log" : undefined,
    };
  });
}

const replies = [
  "Still red on CI. Different error this time.",
  "That was the old output. It is green now.",
  "Ship it.",
];

/** A scroller's frame and viewport: a list that opens where the component's would, revealing its
 * end from the first frame. Its follow threshold is the component's 16 points. */
function Frame(props: {
  height: number;
  initial: "start" | "end";
  page?: boolean;
  each: readonly Turn[];
  overlay?: JSX.Element;
  children: (item: () => Turn) => JSX.Element;
}) {
  return (
    <View
      style={[
        look.root,
        { height: props.height },
        props.page ? { borderRadius: 10, backgroundColor: colors.background } : null,
      ]}
    >
      <List
        each={props.each}
        keyExtractor={(turn) => String(turn.id)}
        estimatedItemSize={68}
        initialScrollAtEnd={props.initial === "end"}
        maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 16 }}
        style={look.viewport}
        contentStyle={look.content}
      >
        {props.children}
      </List>
      {props.overlay}
    </View>
  );
}

/** One turn as the list draws it: read `item()` where the turn is used, since a cell is reused. */
function turnRow(item: () => Turn) {
  return (
    <View style={look.item}>
      <View style={{ gap: 8 }}>
        <Message align={item().mine ? "end" : "start"}>
          <MessageAvatar name={item().from} />
          <MessageContent>
            <Bubble variant={item().mine ? "default" : "muted"}>
              <BubbleContent>{item().text}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        {item().file ? (
          <Attachment>
            <AttachmentMedia>
              <Icon
                icon={FileText}
                size={attachmentGlyph("default", "horizontal")}
                tint={ui().muted}
              />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{item().file}</AttachmentTitle>
              <AttachmentDescription>124 KB · 2 min ago</AttachmentDescription>
            </AttachmentContent>
          </Attachment>
        ) : null}
      </View>
    </View>
  );
}

/** A button floating over the viewport. */
function Float(props: { direction: MessageScrollerDirection; label: string }) {
  return (
    <View style={look.slot(props.direction)}>
      <Button
        variant="secondary"
        size="sm"
        accessibilityLabel={props.label}
        style={[look.button, { opacity: 1 }]}
      >
        <Icon
          icon={props.direction === "end" ? ArrowDown : ArrowUp}
          {...buttonGlyph("secondary", { size: "sm" })}
        />
      </Button>
    </View>
  );
}

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  const turns = signal<Turn[]>(conversation(400));
  const sent = signal(0);
  const send = () => {
    const text = replies[sent() % replies.length]!;
    sent.set(sent() + 1);
    turns.set([...turns(), { id: 1000 + sent(), from: names[1], text, mine: true }]);
    log("Sent");
  };

  return (
    <DemoPage title="Message scroller">
      <Text style={{ color: ui().muted }}>
        {
          "A conversation that keeps up with itself: new turns follow the newest message while you are at the end, and wait when you are not."
        }
      </Text>

      <Split gap={14} inspector={<Log title="onPress" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="A conversation" axis="block">
            <Frame
              height={300}
              initial="end"
              page
              each={turns()}
              overlay={<Float direction="start" label="Scroll to start" />}
            >
              {turnRow}
            </Frame>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Button variant="secondary" onPress={send}>
                Send
              </Button>
              <Button variant="secondary">Jump to message 3</Button>
            </View>
          </DemoSection>

          <DemoSection title="Opened at the oldest" axis="block">
            <Frame
              height={184}
              initial="start"
              each={turns()}
              overlay={<Float direction="end" label="Scroll to end" />}
            >
              {turnRow}
            </Frame>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
