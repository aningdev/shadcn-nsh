var e=`// The reference of \`message.tsx\`: the same page, the look spread on \`nsh\`'s own View and Text
// (and the avatar it composes) instead of worn by the components. The render check requires the
// two to draw the same pixels.
import { AlertCircle, Bot, Check, Copy, RefreshCcw, Square, ThumbsDown, ThumbsUp } from "lucide";
import type { JSX } from "nsh";
import { cleanup, Clipboard, mount, signal, Text, View } from "nsh";
import { TextView } from "nsh/base";

import { Alert, ALERT_ICON, AlertDescription, AlertTitle } from "@/packages/ui/alert";
import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Bubble, BubbleContent, BubbleReactions } from "@/packages/ui/bubble";
import { Button, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { messageLook, type MessageAlign } from "@/packages/ui/message";
import { Spinner } from "@/packages/ui/spinner";
import { textViewCaretClass, textViewLinkClasses } from "@/packages/ui/text-view";

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

/** The row a message is. */
function Row(props: { align?: MessageAlign; children: JSX.Element }) {
  const align = () => props.align ?? "start";
  return <View style={messageLook().row(align())}>{props.children}</View>;
}

/** The sender's avatar, as the look places it: the identity, or the slot when it holds a mark. */
function MsgAvatar(props: { name?: string; children?: JSX.Element; accessibilityLabel?: string }) {
  if (props.children != null) {
    return (
      <View accessibilityLabel={props.accessibilityLabel} style={messageLook().avatarSlot}>
        {props.children}
      </View>
    );
  }
  return <Avatar name={props.name} style={messageLook().avatar} />;
}

/** The column a message holds. */
function Column(props: { align?: MessageAlign; children: JSX.Element }) {
  const align = () => props.align ?? "start";
  return <View style={messageLook().content(align())}>{props.children}</View>;
}

/** Who sent it, or a mark beside the turn. */
function Head(props: { children: string | JSX.Element }) {
  return (
    <View style={messageLook().header}>
      {typeof props.children === "string" ? (
        <Text style={messageLook().headerText}>{props.children}</Text>
      ) : (
        props.children
      )}
    </View>
  );
}

/** What is under the turn. */
function Foot(props: { align?: MessageAlign; children: string | JSX.Element }) {
  const align = () => props.align ?? "start";
  return (
    <View style={messageLook().footer(align())}>
      {typeof props.children === "string" ? (
        <Text style={messageLook().footerText}>{props.children}</Text>
      ) : (
        props.children
      )}
    </View>
  );
}

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
            <Row align="end">
              <MsgAvatar name="Mia Chen" />
              <Column align="end">
                <Bubble variant="default">
                  <BubbleContent>Deploying to prod real quick.</BubbleContent>
                </Bubble>
              </Column>
            </Row>
            <Row>
              <MsgAvatar name="Oliver Reed" />
              <Column>
                <Bubble variant="muted">
                  <BubbleContent>It's 4:55 PM. On a Friday.</BubbleContent>
                </Bubble>
              </Column>
            </Row>
            <Row align="end">
              <MsgAvatar name="Mia Chen" />
              <Column align="end">
                <Bubble variant="default">
                  <BubbleContent>It's a one-line change.</BubbleContent>
                </Bubble>
                <Foot align="end">Delivered</Foot>
              </Column>
            </Row>
          </DemoSection>

          <DemoSection title="Group under a name" axis="block">
            <View style={messageLook().group}>
              <Row>
                <MsgAvatar />
                <Column>
                  <Head>Olivia</Head>
                  <Bubble variant="muted">
                    <BubbleContent>I checked the registry addresses.</BubbleContent>
                  </Bubble>
                </Column>
              </Row>
              <Row>
                <MsgAvatar name="Oliver Reed" />
                <Column>
                  <Bubble variant="muted">
                    <BubbleContent>
                      The component and example JSON now live under the UI registry.
                    </BubbleContent>
                    <BubbleReactions role="image" accessibilityLabel="Reaction: thumbs up">
                      👍
                    </BubbleReactions>
                  </Bubble>
                </Column>
              </Row>
            </View>
          </DemoSection>

          <DemoSection title="A reply that is still arriving" axis="block">
            <Row>
              <MsgAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MsgAvatar>
              <Column>
                <If when={phase() === "stopped"} else={<Head>Assistant</Head>}>
                  <Head>
                    <Badge tone="warning" size="sm">
                      Stopped
                    </Badge>
                  </Head>
                </If>
                <If when={phase() === "waiting"}>
                  <View style={{ flexDirection: "row", alignItems: "center", height: 22 }}>
                    <View class={textViewCaretClass} />
                  </View>
                </If>
                <If when={phase() !== "waiting"}>
                  <TextView
                    markdown={reply()}
                    classes={textViewLinkClasses}
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
                <Foot>
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
                </Foot>
              </Column>
            </Row>
          </DemoSection>

          <DemoSection title="A failed turn" axis="block">
            <Row align="end">
              <MsgAvatar name="Mia Chen" />
              <Column align="end">
                <Bubble variant="default">
                  <BubbleContent>Run the migration on staging.</BubbleContent>
                </Bubble>
                <If when={turn() === "waiting"}>
                  <Foot align="end">
                    <Spinner size="sm" tint={ui().warn} />
                    <Text style={{ fontSize: 12, color: ui().muted }}>
                      Waiting for a connection
                    </Text>
                  </Foot>
                </If>
                <If when={turn() === "answered"}>
                  <Foot align="end">Delivered</Foot>
                </If>
              </Column>
            </Row>
            <Row>
              <MsgAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MsgAvatar>
              <Column>
                <Head>Assistant</Head>
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
                    classes={textViewLinkClasses}
                    styles={{ root: REPLY_STYLE }}
                  />
                </If>
              </Column>
            </Row>
          </DemoSection>

          <DemoSection title="Rating a reply" axis="block">
            <Row>
              <MsgAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MsgAvatar>
              <Column>
                <TextView
                  markdown="The install failure came from the workspace package. Pinning it to the registry version fixes the build."
                  classes={textViewLinkClasses}
                  styles={{ root: REPLY_STYLE }}
                />
                <Foot>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    selected={copied()}
                    accessibilityLabel={copied() ? "Copied" : "Copy reply"}
                    onPress={copyReply}
                  >
                    <Icon
                      icon={copied() ? Check : Copy}
                      {...iconButtonGlyph({ variant: "ghost", size: "sm", selected: copied() })}
                    />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    selected={rating() === "up"}
                    accessibilityLabel="Good reply"
                    onPress={() => rate("up")}
                  >
                    <Icon
                      icon={ThumbsUp}
                      {...iconButtonGlyph({
                        variant: "ghost",
                        size: "sm",
                        selected: rating() === "up",
                      })}
                    />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    selected={rating() === "down"}
                    accessibilityLabel="Bad reply"
                    onPress={() => rate("down")}
                  >
                    <Icon
                      icon={ThumbsDown}
                      {...iconButtonGlyph({
                        variant: "ghost",
                        size: "sm",
                        selected: rating() === "down",
                      })}
                    />
                  </IconButton>
                  <If when={rating() !== null}>
                    <Text style={{ fontSize: 12, color: ui().muted }}>
                      {rating() === "up" ? "Thanks for the rating" : "We'll use this to improve"}
                    </Text>
                  </If>
                </Foot>
              </Column>
            </Row>
          </DemoSection>

          <DemoSection title="Actions" axis="block">
            <Row>
              <MsgAvatar name="Oliver Reed" />
              <Column>
                <Bubble variant="muted">
                  <BubbleContent>
                    The install failure is coming from the workspace package.
                  </BubbleContent>
                </Bubble>
                <Foot>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Copy"
                    onPress={() => log("Copy")}
                  >
                    <Icon icon={Copy} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
                  </IconButton>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Like"
                    onPress={() => log("Like")}
                  >
                    <Icon icon={ThumbsUp} {...iconButtonGlyph({ variant: "ghost", size: "sm" })} />
                  </IconButton>
                </Foot>
              </Column>
            </Row>
            <Row align="end">
              <MsgAvatar name="Mia Chen" />
              <Column align="end">
                <Bubble variant="default">
                  <BubbleContent>Okay drop me a link.</BubbleContent>
                </Bubble>
                <Foot align="end">
                  <Text style={{ fontSize: 12, color: ui().danger }}>Failed to send</Text>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    accessibilityLabel="Retry"
                    onPress={() => log("Retry")}
                  >
                    <Icon
                      icon={RefreshCcw}
                      {...iconButtonGlyph({ variant: "ghost", size: "sm" })}
                    />
                  </IconButton>
                </Foot>
              </Column>
            </Row>
          </DemoSection>

          <DemoSection title="A mark" axis="block">
            <Row>
              <MsgAvatar accessibilityLabel="Assistant">
                <Icon icon={Bot} size={16} tint={ui().muted} />
              </MsgAvatar>
              <Column>
                <Bubble variant="muted">
                  <BubbleContent>The build failed during dependency installation.</BubbleContent>
                </Bubble>
              </Column>
            </Row>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};