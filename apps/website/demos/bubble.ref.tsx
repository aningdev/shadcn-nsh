// The reference of `bubble.tsx`: the same page, the look spread on `nsh`'s own View and Text
// instead of worn by the components. The render check requires the two to draw the same pixels.
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import {
  bubbleLook,
  type BubbleAlign,
  type BubbleSide,
  type BubbleVariant,
} from "@/packages/ui/bubble";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { Log, Split, ui } from "./stage";

/** A bubble as the look draws it. */
function Bubbles(props: {
  variant?: BubbleVariant;
  align?: BubbleAlign;
  /** The edge a row of reactions hangs off: the bubble keeps the room there. */
  room?: BubbleSide;
  children: JSX.Element;
}) {
  const variant = () => props.variant ?? "default";
  const align = () => props.align ?? "start";
  return (
    <View
      style={[
        bubbleLook().root(variant(), align()),
        props.room ? bubbleLook().reactionsRoom(props.room) : null,
      ]}
    >
      {props.children}
    </View>
  );
}

/** The frame of a bubble, and the turn in it: a string wears the look's type, anything else is
 * drawn as given (a paragraph list wears it on each `Text`). */
function Turn(props: {
  variant?: BubbleVariant;
  children: unknown;
  /** A turn that acts: the hand over it. */
  action?: () => void;
}) {
  const variant = () => props.variant ?? "default";
  return (
    <View
      onPress={props.action}
      style={[bubbleLook().content(variant()), props.action ? bubbleLook().pressable : null]}
    >
      {typeof props.children === "string" ? (
        <Text style={bubbleLook().text(variant())}>{props.children}</Text>
      ) : (
        (props.children as never)
      )}
    </View>
  );
}

/** A row of reactions hung off a bubble's edge. */
function Reactions(props: {
  side?: BubbleSide;
  align?: BubbleAlign;
  label: string;
  children: string;
}) {
  return (
    <View
      role="image"
      accessibilityLabel={props.label}
      style={[bubbleLook().reactions(props.side ?? "bottom", props.align ?? "end")]}
    >
      <Text style={bubbleLook().reactionText}>{props.children}</Text>
    </View>
  );
}

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
            <View style={bubbleLook().group}>
              <Bubbles variant="muted">
                <Turn variant="muted">Hey! Want to see chat bubbles?</Turn>
              </Bubbles>
              <Bubbles room="bottom" variant="muted">
                <Turn variant="muted">
                  I can group messages, switch sides, and keep the whole thread easy to scan.
                </Turn>
                <Reactions label="Reaction: thumbs up">👍</Reactions>
              </Bubbles>
            </View>
            <Bubbles variant="default" align="end">
              <Turn variant="default">Sure. Hit me with your best demo.</Turn>
            </Bubbles>
            <Bubbles variant="muted">
              <Turn variant="muted">
                Yes. You are reading a demo that is demoing itself. Very meta.
              </Turn>
            </Bubbles>
          </DemoSection>

          <DemoSection title="Variants" axis="block">
            <Bubbles variant="default" align="end">
              <Turn variant="default">This is the default primary bubble.</Turn>
            </Bubbles>
            <Bubbles variant="secondary">
              <Turn variant="secondary">This is the raised neutral bubble.</Turn>
            </Bubbles>
            <Bubbles variant="muted">
              <Turn variant="muted">This one is muted, for a turn that should read quietly.</Turn>
            </Bubbles>
            <Bubbles variant="tinted" align="end">
              <Turn variant="tinted">Tinted: the accent as a soft wash.</Turn>
            </Bubbles>
            <Bubbles variant="outline">
              <Turn variant="outline">Outlined: a hairline around the page's fill.</Turn>
            </Bubbles>
            <Bubbles variant="ghost">
              <Turn variant="ghost">
                Ghost bubbles hold assistant text and rich content with no frame at all: they take
                the full width of the column, so a paragraph reads as the thread's own voice.
              </Turn>
            </Bubbles>
            <Bubbles variant="destructive" align="end">
              <Turn variant="destructive">Failed to send. Check the connection and try again.</Turn>
            </Bubbles>
          </DemoSection>

          <DemoSection title="Rich content" axis="block">
            <Bubbles variant="default" align="end">
              <Turn variant="default">
                <View style={{ gap: 6 }}>
                  <Text style={bubbleLook().text("default")}>
                    Here is a reply in more than one paragraph.
                  </Text>
                  <Text style={bubbleLook().text("default")}>
                    A string child would do for one line, but a list like this needs BubbleText: it
                    wears the variant's ink without being told which variant it is under.
                  </Text>
                  <Text style={bubbleLook().text("default")}>A last, shorter line.</Text>
                </View>
              </Turn>
            </Bubbles>
            <Bubbles variant="ghost">
              <Turn variant="ghost">
                <View style={{ gap: 6 }}>
                  <Text style={bubbleLook().text("ghost")}>
                    Assistant text can do the same with no frame at all.
                  </Text>
                  <Text style={bubbleLook().text("ghost")}>
                    Each paragraph sits in the thread's own ink.
                  </Text>
                </View>
              </Turn>
            </Bubbles>
          </DemoSection>

          <DemoSection title="Reactions" axis="block">
            {/* Reactions hang off the edge, so the rows leave room for them (shadcn/ui's gap-12). */}
            <View style={{ gap: 48, paddingBottom: 24 }}>
              <Bubbles room="bottom" variant="muted" align="end">
                <Turn variant="muted">I don't need tests, I know my code works.</Turn>
                <Reactions align="start" label="Reactions: thumbs up, surprised">
                  👍 😮
                </Reactions>
              </Bubbles>
              <Bubbles room="top" variant="default" align="end">
                <Turn variant="default">Tests passed on the first try. All 142 of them.</Turn>
                <Reactions side="top" align="start" label="Reactions: party popper, clapping hands">
                  🎉 👏
                </Reactions>
              </Bubbles>
              <Bubbles room="bottom" variant="muted">
                <Turn variant="muted">Bold. Fine, I'll add some tests.</Turn>
                <Reactions label="Reactions: eyes, rocket, and 2 more">👀 🚀 +2</Reactions>
              </Bubbles>
            </View>
          </DemoSection>

          <DemoSection title="A quick reply" axis="block">
            <Bubbles variant="muted" align="end">
              <Turn variant="muted" action={() => log("Replied: I forgot my password")}>
                I forgot my password
              </Turn>
            </Bubbles>
          </DemoSection>

          <DemoSection title="Right to left" axis="block">
            {/* In an RTL column the start is the right and the end the left: the turns and their reactions swap sides. */}
            <View style={{ direction: "rtl", width: "100%", gap: 8 }}>
              <View style={bubbleLook().group}>
                <Bubbles variant="muted">
                  <Turn variant="muted">Incoming: the start, on the right.</Turn>
                </Bubbles>
                <Bubbles room="bottom" variant="muted">
                  <Turn variant="muted">A second incoming turn.</Turn>
                  <Reactions label="Reaction: thumbs up">👍</Reactions>
                </Bubbles>
              </View>
              <Bubbles variant="default" align="end">
                <Turn variant="default">Outgoing: the end, on the left.</Turn>
              </Bubbles>
            </View>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
