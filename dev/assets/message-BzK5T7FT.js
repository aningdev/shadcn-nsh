var e=`// shadcn/ui's message page has no example in this repo, so this page is the library's own: a
// conversation with avatars, a group from one sender under a name, a reply that streams and can be
// stopped, a turn that fails and is retried, the rating a reply carries, and the actions under it.
// Pressing an action writes to the log beside it.
import { AlertCircle, Bot, Check, Copy, RefreshCcw, Square, ThumbsDown, ThumbsUp } from "lucide";
import { cleanup, Clipboard, mount, signal, Text, View } from "nsh";

import { Alert, ALERT_ICON, AlertDescription, AlertTitle } from "@/packages/ui/alert";
import { Badge } from "@/packages/ui/badge";
import { Bubble, BubbleContent, BubbleReactions } from "@/packages/ui/bubble";
import { Button, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/packages/ui/message";
import { Spinner } from "@/packages/ui/spinner";
import { TextView, textViewCaretClass } from "@/packages/ui/text-view";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

/** The reply "A reply that is still arriving" streams, a few characters at a time. */
const REPLY =
  "The registry addresses still pointed at the old paths. I moved both under the UI registry and rebuilt; the install is green again.";

/** How long a reply takes to start, and then between its words, in milliseconds. */
const REPLY_START_MS = 700;
const REPLY_WORD_MS = 90;

/** The reply split into the chunks the demo appends, the way a streaming model's tokens arrive. */
const REPLY_WORDS = REPLY.match(/\\s*\\S{1,4}|\\s+/g) ?? [];

/** The type of a reply, the way a chat draws its turns: the body's size on a turn's leading. */
const REPLY_STYLE = { fontSize: 15, lineHeight: 22 };

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));

  // A reply that is still arriving: \`waiting\` before its first word, \`streaming\` as it lands,
  // then \`done\` or \`stopped\`. It starts on its own, as a live reply does.
  const reply = signal("");
  const phase = signal<"waiting" | "streaming" | "done" | "stopped">("waiting");
  let cursor = 0;
  let stream: ReturnType<typeof setTimeout> | undefined;
  const halt = () => {
    if (stream !== undefined) clearTimeout(stream);
    stream = undefined;
  };
  cleanup(halt);
  // One chunk per timer, so a stop keeps the text already received and a resume picks the rest
  // up from the same cursor.
  const tick = () => {
    if (cursor < REPLY_WORDS.length) {
      reply.set(reply() + REPLY_WORDS[cursor]);
      cursor += 1;
      stream = setTimeout(tick, REPLY_WORD_MS);
      return;
    }
    halt();
    phase.set("done");
    log("Reply finished");
  };
  const play = () => {
    halt();
    cursor = 0;
    reply.set("");
    phase.set("waiting");
    log("Reply requested");
    stream = setTimeout(() => {
      phase.set("streaming");
      tick();
    }, REPLY_START_MS);
  };
  const stopReply = () => {
    halt();
    phase.set("stopped");
    log("Stopped");
  };
  const resume = () => {
    halt();
    phase.set("streaming");
    log("Resumed");
    tick();
  };
  play();

  // A turn that fails: the sent turn waits, the reply is lost, and Retry tries it again. The data
  // is scripted; the wait and the retry run on real timers.
  const turn = signal<"waiting" | "failed" | "answered">("waiting");
  let failure: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => {
    if (failure !== undefined) clearTimeout(failure);
  });
  const fail = () => {
    if (failure !== undefined) clearTimeout(failure);
    failure = setTimeout(() => {
      turn.set("failed");
      log("Reply failed");
    }, 1500);
  };
  const retry = () => {
    if (failure !== undefined) clearTimeout(failure);
    turn.set("waiting");
    log("Retry");
    failure = setTimeout(() => {
      turn.set("answered");
      log("Delivered");
    }, 1200);
  };
  fail();

  // Rating a reply: copy, thumbs up and thumbs down are footer toggles; copying shows a check for
  // a moment, and a thumb pressed again takes the rating back.
  const copied = signal(false);
  const rating = signal<"up" | "down" | null>(null);
  let copyTick: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => {
    if (copyTick !== undefined) clearTimeout(copyTick);
  });
  const copyReply = () => {
    copied.set(true);
    void Clipboard.writeText(REPLY);
    log("Copied reply");
    if (copyTick !== undefined) clearTimeout(copyTick);
    copyTick = setTimeout(() => copied.set(false), 1600);
  };
  const rate = (next: "up" | "down") => {
    const value = rating() === next ? null : next;
    rating.set(value);
    log(value === "up" ? "Rated up" : value === "down" ? "Rated down" : "Rating cleared");
  };

  return (
    <DemoPage title="Message">
      <Text style={{ color: ui().muted }}>
        {
          "One row of a conversation: the sender's avatar, who they are, the turn, and what is under it."
        }
      </Text>

      <Split gap={14} inspector={<Log title="onPress" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="A conversation" axis="block">
            <Message align="end">
              <MessageAvatar name="Mia Chen" />
              <MessageContent>
                <Bubble variant="default">
                  <BubbleContent>Deploying to prod real quick.</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
            <Message>
              <MessageAvatar name="Oliver Reed" />
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent>It's 4:55 PM. On a Friday.</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
            <Message align="end">
              <MessageAvatar name="Mia Chen" />
              <MessageContent>
                <Bubble variant="default">
                  <BubbleContent>It's a one-line change.</BubbleContent>
                </Bubble>
                <MessageFooter>Delivered</MessageFooter>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="Group under a name" axis="block">
            <MessageGroup>
              <Message>
                <MessageAvatar />
                <MessageContent>
                  <MessageHeader>Olivia</MessageHeader>
                  <Bubble variant="muted">
                    <BubbleContent>I checked the registry addresses.</BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
              <Message>
                <MessageAvatar name="Oliver Reed" />
                <MessageContent>
                  <Bubble variant="muted">
                    <BubbleContent>
                      The component and example JSON now live under the UI registry.
                    </BubbleContent>
                    <BubbleReactions role="image" accessibilityLabel="Reaction: thumbs up">
                      👍
                    </BubbleReactions>
                  </Bubble>
                </MessageContent>
              </Message>
            </MessageGroup>
          </DemoSection>

          <DemoSection title="A reply that is still arriving" axis="block">
            <Message>
              <MessageAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MessageAvatar>
              <MessageContent>
                <If when={phase() === "stopped"} else={<MessageHeader>Assistant</MessageHeader>}>
                  <MessageHeader>
                    <Badge tone="warning" size="sm">
                      Stopped
                    </Badge>
                  </MessageHeader>
                </If>
                <If when={phase() === "waiting"}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 22 }}>
                    <View class={textViewCaretClass} />
                  </View>
                </If>
                <If when={phase() !== "waiting"}>
                  <TextView
                    markdown={reply()}
                    styles={{ root: REPLY_STYLE }}
                    options={{ streaming: phase() === "streaming" }}
                    streamingCaret={
                      phase() === "streaming" ? <View class={textViewCaretClass} /> : undefined
                    }
                  />
                </If>
                <If when={phase() === "stopped"}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Icon icon={Square} size={12} tint={ui().faint} />
                    <Text style={{ fontSize: 13, color: ui().faint }}>You stopped this reply</Text>
                  </View>
                </If>
                <MessageFooter>
                  <If when={phase() === "waiting" || phase() === "streaming"}>
                    <Button variant="secondary" size="sm" onPress={stopReply}>
                      Stop
                    </Button>
                  </If>
                  <If when={phase() === "done" || phase() === "stopped"}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={phase() === "done" ? play : resume}
                    >
                      {phase() === "done" ? "Stream it again" : "Resume"}
                    </Button>
                  </If>
                </MessageFooter>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="A failed turn" axis="block">
            <Message align="end">
              <MessageAvatar name="Mia Chen" />
              <MessageContent>
                <Bubble variant="default">
                  <BubbleContent>Run the migration on staging.</BubbleContent>
                </Bubble>
                <If when={turn() === "waiting"}>
                  <MessageFooter>
                    <Spinner size="sm" tint={ui().warn} />
                    <Text style={{ fontSize: 12, color: ui().muted }}>
                      Waiting for a connection
                    </Text>
                  </MessageFooter>
                </If>
                <If when={turn() === "answered"}>
                  <MessageFooter>Delivered</MessageFooter>
                </If>
              </MessageContent>
            </Message>
            <Message>
              <MessageAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>Assistant</MessageHeader>
                <If when={turn() === "waiting"}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 22 }}>
                    <View class={textViewCaretClass} />
                  </View>
                </If>
                <If when={turn() === "failed"}>
                  <Alert variant="destructive" style={{ width: "100%" }}>
                    <Icon icon={AlertCircle} size={ALERT_ICON} tint={ui().danger} />
                    <AlertTitle>The reply failed</AlertTitle>
                    <AlertDescription>
                      <View style={{ alignItems: "flex-start", gap: 10 }}>
                        <Text style={{ fontSize: 14, color: ui().danger }}>
                          The connection dropped before the first word. Your turn is safe.
                        </Text>
                        <Button variant="secondary" size="sm" onPress={retry}>
                          Retry
                        </Button>
                      </View>
                    </AlertDescription>
                  </Alert>
                </If>
                <If when={turn() === "answered"}>
                  <TextView
                    markdown="The migration ran on staging: 14 files, no failures."
                    styles={{ root: REPLY_STYLE }}
                  />
                </If>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="Rating a reply" axis="block">
            <Message>
              <MessageAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MessageAvatar>
              <MessageContent>
                <TextView
                  markdown="The install failure came from the workspace package. Pinning it to the registry version fixes the build."
                  styles={{ root: REPLY_STYLE }}
                />
                <MessageFooter>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    selected={copied()}
                    accessibilityLabel={copied() ? "Copied" : "Copy reply"}
                    onPress={copyReply}
                    icon={copied() ? Check : Copy}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    selected={rating() === "up"}
                    accessibilityLabel="Good reply"
                    onPress={() => rate("up")}
                    icon={ThumbsUp}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    selected={rating() === "down"}
                    accessibilityLabel="Bad reply"
                    onPress={() => rate("down")}
                    icon={ThumbsDown}
                  />
                  <If when={rating() !== null}>
                    <Text style={{ fontSize: 12, color: ui().muted }}>
                      {rating() === "up" ? "Thanks for the rating" : "We'll use this to improve"}
                    </Text>
                  </If>
                </MessageFooter>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="Actions" axis="block">
            <Message>
              <MessageAvatar name="Oliver Reed" />
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent>
                    The install failure is coming from the workspace package.
                  </BubbleContent>
                </Bubble>
                <MessageFooter>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Copy"
                    onPress={() => log("Copy")}
                    icon={Copy}
                  />
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Like"
                    onPress={() => log("Like")}
                    icon={ThumbsUp}
                  />
                </MessageFooter>
              </MessageContent>
            </Message>
            <Message align="end">
              <MessageAvatar name="Mia Chen" />
              <MessageContent>
                <Bubble variant="default">
                  <BubbleContent>Okay drop me a link.</BubbleContent>
                </Bubble>
                <MessageFooter>
                  <Text style={{ fontSize: 12, color: ui().danger }}>Failed to send</Text>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Retry"
                    onPress={() => log("Retry")}
                    icon={RefreshCcw}
                  />
                </MessageFooter>
              </MessageContent>
            </Message>
          </DemoSection>

          <DemoSection title="A mark" axis="block">
            <Message>
              <MessageAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MessageAvatar>
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent>The build failed during dependency installation.</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};