// shadcn/ui's message scroller page has no example in this repo, so this page is the library's own:
// a chat that starts empty — a greeting, two suggestions and a composer — then keeps up with
// itself, new turns following the newest message while you are at the end and waiting when you are
// not; a thread that loads older turns above the top without the rows on screen moving; a frame
// that is selected across as one; and a copy of a long conversation that opens at the oldest so its
// button has somewhere to go. Only the turns near the screen exist, so four hundred of them cost
// what four do.
import { alpha } from "@shadcn-nsh/theme";
import { ArrowUp, FileText, GitPullRequest, Sparkles } from "lucide";
import { cleanup, mount, signal, Text, View } from "nsh";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  attachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
} from "@/packages/ui/attachment";
import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import { Button, RoundButton, roundButtonGlyph } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
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
import { Pressable } from "@/packages/ui/pressable";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Split, ui } from "./stage";

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

/** The turns the chat starts with once a suggestion is picked; the reply is scripted. */
const chatReplies = [
  "Four merges since 2.3: the marker entry, the scroller's follow threshold, two doc pages.",
  "One check is failing: the marker entry's imports. It is green once it declares lucide.",
];

/** What a new chat offers: two ways in, each a turn of its own. */
const suggestions = [
  {
    icon: Sparkles,
    title: "Draft a release note",
    note: "From the merges this week",
    prompt: "Draft the release note for 2.4.",
  },
  {
    icon: GitPullRequest,
    title: "Look at a failing check",
    note: "and say what broke",
    prompt: "Why is the registry build red?",
  },
];

/** The turns "Older turns" starts with, and the ones each page above it adds. */
const older = conversation(24);
const excerpt = conversation(4);

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

/** What a chat says before its first turn: what it can do, and two ways to start it. */
function EmptyChat(props: { onPick: (prompt: string) => void }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 16, padding: 20 }}>
      <View style={{ alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(ui().accent, 0.12),
          }}
        >
          <Icon icon={Sparkles} size={24} tint={ui().accent} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "600", color: ui().text }}>How can I help?</Text>
        <Text style={{ fontSize: 14, lineHeight: 20, color: ui().muted, textAlign: "center" }}>
          Ask about the release, the failing check, or what changed this week.
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Each of={suggestions}>
          {(suggestion) => (
            <Pressable
              accessibilityLabel={suggestion().title}
              onPress={() => props.onPick(suggestion().prompt)}
              style={{
                width: "47%",
                flexGrow: 1,
                minHeight: 96,
                padding: 12,
                gap: 8,
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center",
                ...ui().card,
              }}
            >
              <Icon icon={suggestion().icon} size={18} tint={ui().accent} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: ui().text }}>
                {suggestion().title}
              </Text>
              <Text style={{ fontSize: 12, color: ui().muted }}>{suggestion().note}</Text>
            </Pressable>
          )}
        </Each>
      </View>
    </View>
  );
}

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  // The chat: empty until a prompt is sent, then the turns and a scripted reply.
  const chat = signal<Turn[]>([]);
  const draft = signal("");
  let ids = 1;
  let answer: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => {
    if (answer !== undefined) clearTimeout(answer);
  });
  const send = (text = draft().trim()) => {
    if (text === "") return;
    const reply = chatReplies[chat().filter((turn) => !turn.mine).length % chatReplies.length]!;
    chat.update((turns) => [...turns, { id: ids++, from: names[1], text, mine: true }]);
    draft.set("");
    log("Sent");
    answer = setTimeout(() => {
      chat.update((turns) => [...turns, { id: ids++, from: names[0], text: reply, mine: false }]);
      log("Replied");
    }, 600);
  };

  // Older turns: a thread that starts partway, and a fetch of ten more each time the top is near.
  const history = signal<Turn[]>(older);
  const pages = signal(0);
  const loading = signal(false);
  let fetch: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => {
    if (fetch !== undefined) clearTimeout(fetch);
  });
  const loadOlder = () => {
    if (loading()) return;
    loading.set(true);
    log("Loading older turns");
    fetch = setTimeout(() => {
      const page = pages() + 1;
      const before = history();
      const olderTurns = Array.from({ length: 10 }, (_, i) => ({
        id: -(page * 10 + i + 1),
        from: names[i % 2]!,
        text: lines[before.length + i] ?? lines[i % lines.length]!,
        mine: i % 2 === 1,
      }));
      history.set([...olderTurns, ...before]);
      pages.set(page);
      loading.set(false);
      log("Loaded 10 older turns");
    }, 300);
  };

  const turns = signal<Turn[]>(conversation(400));
  const sent = signal(0);
  const sendTurn = () => {
    const text = chatReplies[sent() % chatReplies.length]!;
    sent.set(sent() + 1);
    turns.set([...turns(), { id: 1000 + sent(), from: names[1], text, mine: true }]);
    log("Sent");
  };

  return (
    <DemoPage title="Message scroller">
      <Text style={{ color: ui().muted }}>
        {
          "A chat that starts empty and keeps up with itself: new turns follow the newest message while you are at the end, and wait when you are not."
        }
      </Text>

      <Split gap={14} inspector={<Log title="events" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="A chat" axis="block">
            <MessageScrollerProvider>
              <View style={{ gap: 8 }}>
                <MessageScroller
                  initialScroll="end"
                  style={{ height: 380, borderRadius: 10, backgroundColor: ui().page }}
                >
                  {chat().length === 0 ? (
                    <EmptyChat onPick={send} />
                  ) : (
                    <>
                      <MessageScrollerViewport
                        each={chat()}
                        keyExtractor={(turn) => String(turn.id)}
                        estimatedItemSize={68}
                      >
                        {turnRow}
                      </MessageScrollerViewport>
                      <MessageScrollerButton direction="start" />
                    </>
                  )}
                </MessageScroller>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Input
                    value={draft()}
                    onChange={({ value }) => draft.set(value)}
                    placeholder="Message"
                    accessibilityLabel="Message"
                    submitBehavior={desktop ? "submit" : "newline"}
                    onSubmit={() => send()}
                    style={{ flex: 1, height: 40, borderRadius: 20 }}
                  />
                  <RoundButton
                    side={40}
                    accessibilityLabel="Send"
                    disabled={draft().trim().length === 0}
                    onPress={() => send()}
                  >
                    <Icon icon={ArrowUp} {...roundButtonGlyph("default", { side: 40 })} />
                  </RoundButton>
                </View>
              </View>
            </MessageScrollerProvider>
          </DemoSection>

          <DemoSection title="Older turns" axis="block">
            <Text style={{ fontSize: 12, color: ui().muted }}>
              {`${history().length} turns · ${pages() === 1 ? "1 older page" : `${pages()} older pages`} loaded above`}
            </Text>
            <MessageScroller
              initialScroll="end"
              style={{ height: 200, borderRadius: 10, backgroundColor: ui().page }}
            >
              <MessageScrollerViewport
                each={history()}
                keyExtractor={(turn) => String(turn.id)}
                estimatedItemSize={68}
                onLoadMoreAtStart={loadOlder}
              >
                {turnRow}
              </MessageScrollerViewport>
              <MessageScrollerButton direction="start" />
            </MessageScroller>
          </DemoSection>

          <DemoSection title="Selecting across turns" axis="block">
            <MessageScroller
              selectable
              initialScroll="end"
              style={{ height: 200, borderRadius: 10, backgroundColor: ui().page }}
            >
              <MessageScrollerViewport
                each={excerpt}
                keyExtractor={(turn) => String(turn.id)}
                estimatedItemSize={68}
              >
                {turnRow}
              </MessageScrollerViewport>
            </MessageScroller>
            <Text style={{ fontSize: 12, color: ui().muted }}>
              Drag from one turn to the next: the frame is selectable, so a drag is one selection
              over the rows that are mounted, not one per bubble.
            </Text>
          </DemoSection>

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
                <Controls onSend={sendTurn} onJump={() => log("Jumped to message 3")} />
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
