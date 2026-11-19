// shadcn/ui's message scroller page has no example in this repo, so this page is the library's own:
// a conversation long enough that no viewport could hold it, opening on its newest message and
// following new ones while you are there — only the turns near the screen exist, so four hundred of
// them cost what four do — and a second copy that opens at the oldest so its button has somewhere to
// go. Send appends a turn; scroll up first and watch the new turn arrive without the view moving.
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
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
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
      // Near the newest turn, so it is on screen when the conversation opens at its end.
      file: i === count - 3 ? "build.log" : undefined,
    };
  });
}

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

/** One turn as the list draws it: read `item()` where the turn is used, since a cell is reused. */
function turnRow(item: () => Turn) {
  return (
    <MessageScrollerItem>
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
    </MessageScrollerItem>
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
            <MessageScrollerProvider>
              <View style={{ gap: 8 }}>
                <MessageScroller
                  initialScroll="end"
                  style={{ height: 300, borderRadius: 10, backgroundColor: ui().page }}
                >
                  <MessageScrollerViewport
                    each={turns()}
                    keyExtractor={(turn) => String(turn.id)}
                    estimatedItemSize={68}
                  >
                    {turnRow}
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
            <MessageScroller initialScroll="start" style={{ height: 184 }}>
              <MessageScrollerViewport
                each={turns()}
                keyExtractor={(turn) => String(turn.id)}
                estimatedItemSize={68}
              >
                {turnRow}
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
