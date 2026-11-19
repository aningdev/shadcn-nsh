// shadcn/ui's message scroller page has no example in this repo, so this page is the library's own:
// a conversation that opens on its newest message and follows new ones while you are there, and a
// second one that opens at the oldest so its button has somewhere to go. Send appends a turn;
// scroll up first and watch the new turn arrive without the view moving.
import { FileText } from "lucide";
import { mount, signal, Text, View } from "nsh";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  attachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
} from "@/packages/ui/attachment";
import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Marker, MarkerContent } from "@/packages/ui/marker";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@/packages/ui/message-scroller";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

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

/** A control beside the transcript: the same commands `useMessageScroller` gives its parts. */
function Controls(props: { onSend: () => void; onJump: () => void }) {
  const { scrollToMessage } = useMessageScroller();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      <Button variant="secondary" onPress={props.onSend}>
        Send
      </Button>
      <Button
        variant="secondary"
        onPress={() => {
          scrollToMessage("3", { align: "center" });
          props.onJump();
        }}
      >
        Jump to message 3
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
    <MessageScrollerItem messageId={String(t.id)}>
      <Message align={t.mine ? "end" : "start"}>
        <MessageAvatar name={t.from} />
        <MessageContent>
          <Bubble variant={t.mine ? "default" : "muted"}>
            <BubbleContent>{t.text}</BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    </MessageScrollerItem>
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
            <MessageScrollerProvider>
              <View style={{ gap: 8 }}>
                <MessageScroller
                  initialScroll="end"
                  style={{ height: 300, borderRadius: 10, backgroundColor: ui().page }}
                >
                  <MessageScrollerViewport>
                    <MessageScrollerContent>
                      {turns().map((t) => turn(t))}
                      <MessageScrollerItem messageId="build-log">
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
                      </MessageScrollerItem>
                    </MessageScrollerContent>
                  </MessageScrollerViewport>
                  <MessageScrollerButton
                    direction="start"
                    onPress={() => log("Scrolled to start")}
                  />
                </MessageScroller>
                <Controls onSend={send} onJump={() => log("Jumped to message 3")} />
              </View>
            </MessageScrollerProvider>
          </DemoSection>

          <DemoSection title="Opened at the oldest" axis="block">
            <MessageScroller initialScroll="start" style={{ height: 220 }}>
              <MessageScrollerViewport>
                <MessageScrollerContent>
                  <MessageScrollerItem>
                    <Marker variant="separator">
                      <MarkerContent>Earlier this morning</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>
                  {turns()
                    .slice(0, 4)
                    .map((t) => turn(t))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton direction="end" />
            </MessageScroller>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
