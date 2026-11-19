// shadcn/ui's message page has no example in this repo, so this page is the library's own: a
// conversation with avatars, a group from one sender under a name, and the actions a turn carries
// under it. Pressing an action writes to the log beside it.
import { Bot, Copy, RefreshCcw, ThumbsUp } from "lucide";
import { mount, signal, Text } from "nsh";

import { Bubble, BubbleContent, BubbleReactions } from "@/packages/ui/bubble";
import { IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/packages/ui/message";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

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
                  >
                    <Icon
                      icon={RefreshCcw}
                      {...iconButtonGlyph({ variant: "ghost", size: "sm" })}
                    />
                  </IconButton>
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
