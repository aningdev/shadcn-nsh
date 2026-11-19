// shadcn/ui's bubble page has no example in this repo, so this page is the library's own: a short
// conversation, every fill a bubble can wear, reactions hanging off either edge, and a quick reply
// that acts. Pressing the quick reply writes to the log beside it.
import { mount, signal, Text, View } from "nsh";

import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
  BubbleText,
} from "@/packages/ui/bubble";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

function App() {
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  return (
    <DemoPage title="Bubble">
      <Text style={{ color: ui().muted }}>
        {
          "The framed surface of one turn: a fill per role, on the sender's side, reactions hanging off it."
        }
      </Text>

      <Split gap={14} inspector={<Log title="onPress" lines={events()} minHeight={92} />}>
        <DemoCard>
          <DemoSection title="A conversation" axis="block">
            <BubbleGroup>
              <Bubble variant="muted">
                <BubbleContent>Hey! Want to see chat bubbles?</BubbleContent>
              </Bubble>
              <Bubble variant="muted">
                <BubbleContent>
                  I can group messages, switch sides, and keep the whole thread easy to scan.
                </BubbleContent>
                <BubbleReactions role="image" accessibilityLabel="Reaction: thumbs up">
                  👍
                </BubbleReactions>
              </Bubble>
            </BubbleGroup>
            <Bubble variant="default" align="end">
              <BubbleContent>Sure. Hit me with your best demo.</BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>
                Yes. You are reading a demo that is demoing itself. Very meta.
              </BubbleContent>
            </Bubble>
          </DemoSection>

          <DemoSection title="Variants" axis="block">
            <Bubble variant="default" align="end">
              <BubbleContent>This is the default primary bubble.</BubbleContent>
            </Bubble>
            <Bubble variant="secondary">
              <BubbleContent>This is the raised neutral bubble.</BubbleContent>
            </Bubble>
            <Bubble variant="muted">
              <BubbleContent>This one is muted, for a turn that should read quietly.</BubbleContent>
            </Bubble>
            <Bubble variant="tinted" align="end">
              <BubbleContent>Tinted: the accent as a soft wash.</BubbleContent>
            </Bubble>
            <Bubble variant="outline">
              <BubbleContent>Outlined: a hairline around the page's fill.</BubbleContent>
            </Bubble>
            <Bubble variant="ghost">
              <BubbleContent>
                Ghost bubbles hold assistant text and rich content with no frame at all: they take
                the full width of the column, so a paragraph reads as the thread's own voice.
              </BubbleContent>
            </Bubble>
            <Bubble variant="destructive" align="end">
              <BubbleContent>Failed to send. Check the connection and try again.</BubbleContent>
            </Bubble>
          </DemoSection>

          <DemoSection title="Rich content" axis="block">
            <Bubble variant="default" align="end">
              <BubbleContent>
                <View style={{ gap: 6 }}>
                  <BubbleText>Here is a reply in more than one paragraph.</BubbleText>
                  <BubbleText>
                    A string child would do for one line, but a list like this needs BubbleText: it
                    wears the variant's ink without being told which variant it is under.
                  </BubbleText>
                  <BubbleText>A last, shorter line.</BubbleText>
                </View>
              </BubbleContent>
            </Bubble>
            <Bubble variant="ghost">
              <BubbleContent>
                <View style={{ gap: 6 }}>
                  <BubbleText>Assistant text can do the same with no frame at all.</BubbleText>
                  <BubbleText>Each paragraph sits in the thread's own ink.</BubbleText>
                </View>
              </BubbleContent>
            </Bubble>
          </DemoSection>

          <DemoSection title="Reactions" axis="block">
            {/* Reactions hang off the edge, so the rows leave room for them (shadcn/ui's gap-12). */}
            <View style={{ gap: 48, paddingBottom: 24 }}>
              <Bubble variant="muted" align="end">
                <BubbleContent>I don't need tests, I know my code works.</BubbleContent>
                <BubbleReactions
                  align="start"
                  role="image"
                  accessibilityLabel="Reactions: thumbs up, surprised"
                >
                  👍 😮
                </BubbleReactions>
              </Bubble>
              <Bubble variant="default" align="end">
                <BubbleContent>Tests passed on the first try. All 142 of them.</BubbleContent>
                <BubbleReactions
                  side="top"
                  align="start"
                  role="image"
                  accessibilityLabel="Reactions: party popper, clapping hands"
                >
                  🎉 👏
                </BubbleReactions>
              </Bubble>
              <Bubble variant="muted">
                <BubbleContent>Bold. Fine, I'll add some tests.</BubbleContent>
                <BubbleReactions
                  role="image"
                  accessibilityLabel="Reactions: eyes, rocket, and 2 more"
                >
                  👀 🚀 +2
                </BubbleReactions>
              </Bubble>
            </View>
          </DemoSection>

          <DemoSection title="A quick reply" axis="block">
            <Bubble variant="muted" align="end">
              <BubbleContent onPress={() => log("Replied: I forgot my password")}>
                I forgot my password
              </BubbleContent>
            </Bubble>
          </DemoSection>

          <DemoSection title="Right to left" axis="block">
            {/* In an RTL column the start is the right and the end the left: the turns and their reactions swap sides. */}
            <View style={{ direction: "rtl", width: "100%", gap: 8 }}>
              <BubbleGroup>
                <Bubble variant="muted">
                  <BubbleContent>Incoming: the start, on the right.</BubbleContent>
                </Bubble>
                <Bubble variant="muted">
                  <BubbleContent>A second incoming turn.</BubbleContent>
                  <BubbleReactions role="image" accessibilityLabel="Reaction: thumbs up">
                    👍
                  </BubbleReactions>
                </Bubble>
              </BubbleGroup>
              <Bubble variant="default" align="end">
                <BubbleContent>Outgoing: the end, on the left.</BubbleContent>
              </Bubble>
            </View>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
