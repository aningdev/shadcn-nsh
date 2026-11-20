// The emoji picker's scenes with this library's parts: the panel on its own (342 points wide in a
// wide window, the card's width on a phone), a composer whose smile opens the panel in a popover
// and puts the choice at the end of the message, and a message with quick reactions and a picker
// that adds one. The inspector says what is typed, what was chosen and who reacted.
import { alpha, colors } from "@shadcn-nsh/theme";
import { Plus, Smile } from "lucide";
import { mount, signal, Text, View } from "nsh";

import { Bubble, BubbleContent, BubbleReactions } from "@/packages/ui/bubble";
import { EmojiPanel } from "@/packages/ui/emoji-picker";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/packages/ui/input-group";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";
import { Message, MessageAvatar, MessageContent } from "@/packages/ui/message";
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover";
import { Pressable } from "@/packages/ui/pressable";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

/** What is typed in the composer, and in the message the panel under inspection appends to. */
const message = signal("Lunch at the new ramen place? ");

const draft = signal("");

const recent = signal<string[]>(["👍", "😂", "❤️", "🎉", "🙏", "🔥"]);

const events = signal<string[]>([]);

const log = (line: string) => events.set([line, ...events()].slice(0, 4));

/** Most recent first, kept to 18: a choice leads the recents and the tab that holds it. */
const remember = (list: string[], emoji: string) =>
  [emoji, ...list.filter((e) => e !== emoji)].slice(0, 18);

/** One reaction on the message: how many, and whether one of them is yours. */
type Reaction = { emoji: string; count: number; mine: boolean };

const reactions = signal<Reaction[]>([
  { emoji: "🎉", count: 4, mine: false },
  { emoji: "🚀", count: 2, mine: true },
  { emoji: "👀", count: 1, mine: false },
]);

const quick = ["👍", "❤️", "😂", "🎉", "👀", "🙏"];

/** Which popover is open: the composer's smile (`draft`), or the reaction row's `reactions`. */
const picking = signal<"draft" | "reactions" | null>(null);

function App() {
  const choose = (emoji: string, base: string) => {
    message.set(message() + emoji);
    recent.set(remember(recent(), base));
    log(`onSelect({ emoji: "${emoji}", base: "${base}" })`);
  };

  const put = (emoji: string, base: string) => {
    draft.set(draft() + emoji);
    recent.set(remember(recent(), base));
    log(`picked ${emoji}`);
  };

  /** Yours toggles: a new emoji starts at one, yours again takes it back off. */
  const react = (base: string) => {
    reactions.update((list) => {
      const found = list.find((r) => r.emoji === base);
      if (!found) return [...list, { emoji: base, count: 1, mine: true }];
      return list.flatMap((r) => {
        if (r.emoji !== base) return [r];
        if (r.mine) return r.count > 1 ? [{ ...r, count: r.count - 1, mine: false }] : [];
        return [{ ...r, count: r.count + 1, mine: true }];
      });
    });
    log(`react("${base}")`);
  };

  const dismiss = () => {
    picking.set(null);
    log("onCancel()");
  };

  const panel = (onSelect: (event: { emoji: string; base: string }) => void) => (
    <EmojiPanel
      class={desktop ? "h-[392px] w-full" : "h-[360px] w-full"}
      recent={recent()}
      onSelect={(event) => {
        onSelect(event);
        picking.set(null);
      }}
      onCancel={dismiss}
    />
  );

  return (
    <DemoPage title="Emoji picker">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Type to search, the arrows to move, Return to choose; a tab scrolls to its group"
          : "Search, or tap a tab to scroll to its group; tap an emoji to choose it"}
      </Text>
      <Split
        gap={14}
        inspector={
          <>
            <Panel title="message">
              <Text style={{ fontSize: 14, color: ui().text }}>{message()}</Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <DemoCard>
          <DemoSection title="The panel" axis="block">
            <View
              style={{
                ...sectionSurface(),
                width: 342,
                height: desktop ? 400 : 440,
                alignSelf: "center",
                overflow: "hidden",
              }}
            >
              <EmojiPanel
                class="flex-1"
                fill={!desktop}
                recent={recent()}
                onSelect={({ emoji, base }) => choose(emoji, base)}
                onCancel={() => log("onCancel()")}
              />
            </View>
          </DemoSection>

          <DemoSection title="In a composer" axis="block">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Popover
                  open={picking() === "draft"}
                  onOpenChange={({ open }) => {
                    picking.set(open ? "draft" : null);
                    log(open ? "Picker opened" : "Picker closed");
                  }}
                >
                  <PopoverTrigger>
                    <InputGroupButton size="icon-sm" variant="ghost" accessibilityLabel="Emoji">
                      <Icon
                        icon={Smile}
                        size={16}
                        tint={picking() === "draft" ? ui().text : ui().muted}
                      />
                    </InputGroupButton>
                  </PopoverTrigger>
                  <PopoverContent placement="top" width={desktop ? 342 : 300} compact>
                    {panel(({ emoji, base }) => put(emoji, base))}
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
              <InputGroupInput
                value={draft()}
                onChange={({ value }) => draft.set(value)}
                placeholder="Message"
                accessibilityLabel="Message"
                submitBehavior={desktop ? "submit" : "newline"}
                onSubmit={() => log(`sent “${draft()}”`)}
              />
            </InputGroup>
            <Text style={{ fontSize: 12, color: ui().muted }}>
              {draft().length === 0
                ? "Pick one: it goes in at the end of the message, and leads the recent emoji."
                : `“${draft()}”`}
            </Text>
          </DemoSection>

          <DemoSection title="Reactions" axis="block">
            <Message align="start">
              <MessageAvatar name="Ana Ribeiro" />
              <MessageContent>
                <Bubble variant="muted">
                  <BubbleContent>{"Pushed 2.4 to both stores. Ship it?"}</BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
            <View style={{ paddingLeft: 42 }}>
              <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
                {reactions().map((reaction) => (
                  <Pressable
                    accessibilityLabel={`${reaction.emoji} ${reaction.count}${reaction.mine ? ", yours" : ""}`}
                    onPress={() => react(reaction.emoji)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      height: 26,
                      paddingHorizontal: 8,
                      borderRadius: 13,
                      borderWidth: 1,
                      borderColor: reaction.mine ? alpha(colors.brand, 0.45) : ui().line,
                      backgroundColor: reaction.mine ? alpha(colors.brand, 0.12) : colors.card,
                    }}
                  >
                    <Text style={{ fontSize: 14 }}>{reaction.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        fontVariant: ["tabular-nums"],
                        color: reaction.mine ? colors.brand : ui().muted,
                      }}
                    >
                      {reaction.count}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 2,
                  padding: 3,
                  marginTop: 6,
                  alignSelf: "flex-start",
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: ui().line,
                  backgroundColor: colors.card,
                }}
              >
                {quick.map((emoji) => (
                  <Pressable
                    accessibilityLabel={`React with ${emoji}`}
                    onPress={() => react(emoji)}
                    style={{
                      width: desktop ? 30 : 38,
                      height: desktop ? 30 : 38,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{emoji}</Text>
                  </Pressable>
                ))}
                <View
                  style={{
                    width: 1,
                    height: 18,
                    marginHorizontal: 3,
                    backgroundColor: ui().line,
                  }}
                />
                <Popover
                  open={picking() === "reactions"}
                  onOpenChange={({ open }) => {
                    picking.set(open ? "reactions" : null);
                    log(open ? "Picker opened" : "Picker closed");
                  }}
                >
                  <PopoverTrigger>
                    <Pressable accessibilityLabel="More reactions">
                      <Icon icon={Plus} size={14} tint={ui().muted} />
                    </Pressable>
                  </PopoverTrigger>
                  <PopoverContent placement="top" width={desktop ? 342 : 300} compact>
                    {panel(({ base }) => react(base))}
                  </PopoverContent>
                </Popover>
              </View>
            </View>

            <Text style={{ fontSize: 12, color: ui().muted }}>
              {`${reactions().length} reactions · tap one to add yours or take it back`}
            </Text>
          </DemoSection>
        </DemoCard>
      </Split>
    </DemoPage>
  );
}

mount(App);
