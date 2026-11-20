// The reference of `message-scroller.tsx`: the same page, the look spread on `nsh`'s own List, View
// and Text instead of worn by the components, and the chat's empty state, composer and older-turn
// fetch drawn by hand. The render check requires the two to draw the same pixels, so the scroller
// that opens at the end reveals it here too.
import { alpha, colors } from "@shadcn-nsh/theme";
import { ArrowDown, ArrowUp, FileText, GitPullRequest, Sparkles } from "lucide";
import type { JSX } from "nsh";
import { cleanup, List, mount, signal, Text, View } from "nsh";
import { Button, Input } from "nsh/base";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  attachmentGlyph,
  AttachmentMedia,
  AttachmentTitle,
} from "@/packages/ui/attachment";
import { Bubble, BubbleContent } from "@/packages/ui/bubble";
import {
  Button as UiButton,
  buttonGlyph,
  buttonLook,
  roundButtonGlyph,
  roundButtonLook,
} from "@/packages/ui/button";
import { inputLook } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { type MessageScrollerDirection, messageScrollerLook } from "@/packages/ui/message-scroller";
import { pressableLook } from "@/packages/ui/pressable";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Split, ui } from "./stage";

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

const chatReplies = [
  "Four merges since 2.3: the marker entry, the scroller's follow threshold, two doc pages.",
  "One check is failing: the marker entry's imports. It is green once it declares lucide.",
];

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

const older = conversation(24);
const excerpt = conversation(4);

/** A scroller's frame and viewport: a list that opens where the component's would, revealing its
 * end from the first frame. Its follow threshold is the component's 16 points. */
function Frame(props: {
  height: number;
  initial: "start" | "end";
  page?: boolean;
  selectable?: boolean;
  each: readonly Turn[];
  onLoadMoreAtStart?: () => void;
  empty?: JSX.Element;
  overlay?: JSX.Element;
  children: (item: () => Turn) => JSX.Element;
}) {
  return (
    <View
      selectable={props.selectable}
      style={[
        look.root,
        { height: props.height },
        props.page ? { borderRadius: 10, backgroundColor: colors.background } : null,
      ]}
    >
      {props.each.length === 0 && props.empty ? (
        props.empty
      ) : (
        <List
          each={props.each}
          keyExtractor={(turn) => String(turn.id)}
          estimatedItemSize={68}
          initialScrollAtEnd={props.initial === "end"}
          maintainVisibleContentPosition={{ autoscrollToBottomThreshold: 16 }}
          onLoadMoreAtStart={props.onLoadMoreAtStart}
          style={look.viewport}
          contentStyle={look.content}
        >
          {props.children}
        </List>
      )}
      {props.each.length > 0 ? props.overlay : null}
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
        accessibilityLabel={props.label}
        {...buttonLook("secondary", { size: "sm", style: look.button })}
      >
        <Icon
          icon={props.direction === "end" ? ArrowDown : ArrowUp}
          {...buttonGlyph("secondary", { size: "sm" })}
        />
      </Button>
    </View>
  );
}

/** The chat before its first turn: a greeting, and two cards that are a press each. */
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
            backgroundColor: alpha(colors.brand, 0.12),
          }}
        >
          <Icon icon={Sparkles} size={24} tint={colors.brand} />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "600", color: colors.foreground }}>
          How can I help?
        </Text>
        <Text
          style={{
            fontSize: 14,
            lineHeight: 20,
            color: colors.mutedForeground,
            textAlign: "center",
          }}
        >
          Ask about the release, the failing check, or what changed this week.
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Each of={suggestions}>
          {(suggestion) => (
            <View
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
              <Icon icon={suggestion().icon} size={18} tint={colors.brand} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                {suggestion().title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                {suggestion().note}
              </Text>
            </View>
          )}
        </Each>
      </View>
    </View>
  );
}

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

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
            <Frame
              height={380}
              initial="end"
              page
              each={chat()}
              empty={<EmptyChat onPick={send} />}
              overlay={<Float direction="start" label="Scroll to start" />}
            >
              {turnRow}
            </Frame>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Input
                value={draft()}
                onChange={({ value }) => draft.set(value)}
                placeholder="Message"
                accessibilityLabel="Message"
                submitBehavior={desktop ? "submit" : "newline"}
                onSubmit={() => send()}
                {...inputLook({ style: { flex: 1, height: 40, borderRadius: 20 } })}
              />
              <Button
                accessibilityLabel="Send"
                disabled={draft().trim().length === 0}
                onPress={() => send()}
                {...roundButtonLook("default", {
                  side: 40,
                  disabled: () => draft().trim().length === 0,
                })}
              >
                <Icon icon={ArrowUp} {...roundButtonGlyph("default", { side: 40 })} />
              </Button>
            </View>
          </DemoSection>

          <DemoSection title="Older turns" axis="block">
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {`${history().length} turns · ${pages() === 1 ? "1 older page" : `${pages()} older pages`} loaded above`}
            </Text>
            <Frame
              height={200}
              initial="end"
              page
              each={history()}
              onLoadMoreAtStart={loadOlder}
              overlay={<Float direction="start" label="Scroll to start" />}
            >
              {turnRow}
            </Frame>
          </DemoSection>

          <DemoSection title="Selecting across turns" axis="block">
            <Frame height={200} initial="end" page selectable each={excerpt}>
              {turnRow}
            </Frame>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              Drag from one turn to the next: the frame is selectable, so a drag is one selection
              over the rows that are mounted, not one per bubble.
            </Text>
          </DemoSection>

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
              <UiButton variant="secondary" onPress={sendTurn}>
                Send
              </UiButton>
              <UiButton variant="secondary">Jump to message 3</UiButton>
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
