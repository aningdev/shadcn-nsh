// The reference of `message-scroller.tsx`: the same page, the look spread on `nsh`'s own Scroll,
// View and Text instead of worn by the components. The render check requires the two to draw the
// same pixels, so the scroller that opens at the end reveals it here too.
import { colors } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp, FileText } from "lucide";
import type { JSX, ScrollRef } from "nsh";
import { mount, Scroll, signal, Text, View } from "nsh";

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
import { Marker, MarkerContent } from "@/packages/ui/marker";
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
}

const conversation: Turn[] = [
  { id: 1, from: "Mia Chen", text: "Morning. The registry build is red again.", mine: false },
  {
    id: 2,
    from: "Oliver Reed",
    text: "It's the marker entry: it imports lucide and never said so.",
    mine: true,
  },
  { id: 3, from: "Mia Chen", text: "Honest dependencies. What a concept.", mine: false },
  { id: 4, from: "Oliver Reed", text: "I declared it. Rebuilding now.", mine: true },
  { id: 5, from: "Mia Chen", text: "And the screenshots?", mine: false },
  {
    id: 6,
    from: "Oliver Reed",
    text: "Four per component, light and dark, looked at with my own eyes.",
    mine: true,
  },
];

const replies = [
  "Still red on CI. Different error this time.",
  "That was the old output. It is green now.",
  "Ship it.",
];

/** A scroller's frame and viewport, its content revealed to the end when it opens there. */
function Frame(props: {
  height: number;
  initial: "start" | "end";
  page?: boolean;
  overlay?: JSX.Element;
  children: JSX.Element;
}) {
  let scroller: ScrollRef | undefined;
  return (
    <View
      style={[
        look.root,
        { height: props.height },
        props.page ? { borderRadius: 10, backgroundColor: colors.background } : null,
      ]}
    >
      <Scroll ref={(node) => (scroller = node)} style={look.viewport}>
        <View
          onLayout={() => {
            if (props.initial === "end") {
              scroller?.scrollToEnd({ animated: false });
            }
          }}
          style={look.content}
        >
          {props.children}
        </View>
      </Scroll>
      {props.overlay}
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
  const turns = signal<Turn[]>(conversation);
  const sent = signal(0);
  const send = () => {
    const text = replies[sent() % replies.length]!;
    sent.set(sent() + 1);
    turns.set([...turns(), { id: 100 + sent(), from: "Oliver Reed", text, mine: true }]);
    log("Sent");
  };

  const turn = (t: Turn) => (
    <View style={look.item}>
      <Message align={t.mine ? "end" : "start"}>
        <MessageAvatar name={t.from} />
        <MessageContent>
          <Bubble variant={t.mine ? "default" : "muted"}>
            <BubbleContent>{t.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </View>
  );

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
              overlay={<Float direction="start" label="Scroll to start" />}
            >
              {turns().map((t) => turn(t))}
              <View style={look.item}>
                <Attachment>
                  <AttachmentMedia>
                    <Icon
                      icon={FileText}
                      size={attachmentGlyph("default", "horizontal")}
                      tint={ui().muted}
                    />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>build.log</AttachmentTitle>
                    <AttachmentDescription>124 KB · 2 min ago</AttachmentDescription>
                  </AttachmentContent>
                </Attachment>
              </View>
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
              height={220}
              initial="start"
              overlay={<Float direction="end" label="Scroll to end" />}
            >
              <View style={look.item}>
                <Marker variant="separator">
                  <MarkerContent>Earlier this morning</MarkerContent>
                </Marker>
              </View>
              {turns()
                .slice(0, 4)
                .map((t) => turn(t))}
            </Frame>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
