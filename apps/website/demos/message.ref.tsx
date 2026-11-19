// The reference of `message.tsx`: the same page, the look spread on `nsh`'s own View and Text
// (and the avatar it composes) instead of worn by the components. The render check requires the
// two to draw the same pixels.
import { Bot, Copy, RefreshCcw, ThumbsUp } from "lucide";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
import { Bubble, BubbleContent, BubbleReactions } from "@/packages/ui/bubble";
import { IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { messageLook, type MessageAlign } from "@/packages/ui/message";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

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

/** Who sent it. */
function Head(props: { children: string }) {
  return (
    <View style={messageLook().header}>
      <Text style={messageLook().headerText}>{props.children}</Text>
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
