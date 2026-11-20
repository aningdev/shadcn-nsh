// EmojiPicker: the official gallery's emoji scene (`references/nsh/website/demos/el-emoji-picker.tsx`) with this
// library's parts — a composer's emoji button writing into the message beside it, and a message's reactions picked
// from the same panel: search, skin tones, every group, the recent ones first.
import { colors } from "@shadcn-nsh/theme";
import { Smile, X } from "lucide";
import { signal, Text, View } from "nsh";

import { Button, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { EmojiPanel } from "@/packages/ui/emoji-picker";
import { Icon } from "@/packages/ui/lib/icons";
import { controlSize, insetSurface } from "@/packages/ui/lib/surface";

import { Caption, DemoCard, DemoPage } from "../kit";

/** The picker in a card: the gallery's 342 points wide, 392 tall, cut to its corners. */
function Picker(props: {
  recent: string[];
  onSelect: (picked: { emoji: string; base: string }) => void;
  onCancel?: () => void;
}) {
  return (
    <View
      testID="emoji-panel"
      style={{
        width: 342,
        alignSelf: "center",
        height: 392,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <EmojiPanel
        class="flex-1"
        recent={props.recent}
        onSelect={props.onSelect}
        onCancel={props.onCancel}
      />
    </View>
  );
}

/** A reaction chip: the emoji, its count, lit while it is the user's. */
function Reaction(props: { emoji: string; count: number; mine: boolean; onPress: () => void }) {
  return (
    <View
      role="button"
      accessibilityLabel={`${props.emoji} ${props.count}`}
      accessibilityState={{ selected: props.mine }}
      onPress={props.onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 26,
        paddingHorizontal: 8,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: props.mine ? colors.brandEdge : colors.line,
        backgroundColor: props.mine ? colors.brandFill : colors.raised,
      }}
    >
      <Text style={{ fontSize: 14 }}>{props.emoji}</Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "500",
          fontVariant: ["tabular-nums"],
          color: props.mine ? colors.brand : colors.mutedForeground,
        }}
      >
        {props.count}
      </Text>
    </View>
  );
}

export function EmojiPickerDemo() {
  const last = signal("—");

  const message = signal("Lunch at the new ramen place? ");
  const recent = signal<string[]>(["👍", "😂", "❤️", "🎉", "🙏", "🔥"]);
  const composerOpen = signal(false);

  const reactions = signal<{ emoji: string; count: number; mine: boolean }[]>([
    { emoji: "👍", count: 4, mine: true },
    { emoji: "😂", count: 2, mine: false },
    { emoji: "🎉", count: 1, mine: false },
  ]);
  const reactionsOpen = signal(false);
  const remember = (base: string) =>
    recent.set([base, ...recent().filter((e) => e !== base)].slice(0, 18));

  return (
    <DemoPage title="Emoji Picker" note={() => last()}>
      <DemoCard title="Composer" subtitle="The smile sits in the field; the picker opens under it">
        <View style={{ gap: 10 }}>
          <View style={{ ...insetSurface(), padding: 12, gap: 10 }}>
            <Text style={{ fontSize: controlSize.label, color: colors.foreground }}>
              {message()}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <IconButton
                accessibilityLabel={composerOpen() ? "Close the emoji picker" : "Add an emoji"}
                onPress={() => composerOpen.set(!composerOpen())}
              >
                <Icon icon={composerOpen() ? X : Smile} {...iconButtonGlyph()} />
              </IconButton>
              <View style={{ flex: 1 }} />
              <Button
                size="sm"
                disabled={message().trim().length === 0}
                onPress={() => last.set(`Sent: ${message()}`)}
              >
                Send
              </Button>
            </View>
          </View>
          {composerOpen() ? (
            <Picker
              recent={recent()}
              onCancel={() => composerOpen.set(false)}
              onSelect={({ emoji, base }) => {
                message.set(`${message()}${emoji}`);
                remember(base);
                last.set(`Inserted ${emoji}`);
              }}
            />
          ) : (
            <Caption>
              Type to search, the arrows to move, Return to choose; a tab scrolls to its group
            </Caption>
          )}
        </View>
      </DemoCard>

      <DemoCard title="Reactions" subtitle="The same panel, adding to a message's reactions">
        <View style={{ gap: 10 }}>
          <View style={{ ...insetSurface(), padding: 12, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.brandFill,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.brand }}>A</Text>
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: "500", color: colors.foreground }}>
                  Ada <Text style={{ color: colors.faint, fontWeight: "400" }}>· 09:41</Text>
                </Text>
                <Text style={{ fontSize: controlSize.label, color: colors.foreground }}>
                  Shipping the new picker today. Thanks for the reviews {""}
                  {reactions()
                    .filter((r) => r.mine)
                    .map((r) => r.emoji)
                    .join("")}
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  <Each of={reactions()}>
                    {(reaction) => (
                      <Reaction
                        emoji={reaction().emoji}
                        count={reaction().count}
                        mine={reaction().mine}
                        onPress={() => {
                          reactions.update((list) =>
                            list.map((r) =>
                              r.emoji === reaction().emoji
                                ? {
                                    ...r,
                                    mine: !r.mine,
                                    count: r.count + (r.mine ? -1 : 1),
                                  }
                                : r,
                            ),
                          );
                          last.set(`${reaction().mine ? "Removed" : "Added"} ${reaction().emoji}`);
                        }}
                      />
                    )}
                  </Each>
                  <IconButton
                    size="sm"
                    variant="secondary"
                    accessibilityLabel="Add a reaction"
                    selected={reactionsOpen()}
                    onPress={() => reactionsOpen.set(!reactionsOpen())}
                  >
                    <Icon icon={Smile} {...iconButtonGlyph({ size: "sm" })} />
                  </IconButton>
                </View>
              </View>
            </View>
          </View>
          {reactionsOpen() ? (
            <Picker
              recent={recent()}
              onCancel={() => reactionsOpen.set(false)}
              onSelect={({ emoji, base }) => {
                remember(base);
                reactions.update((list) =>
                  list.some((r) => r.emoji === emoji)
                    ? list.map((r) =>
                        r.emoji === emoji
                          ? { ...r, mine: true, count: r.count + (r.mine ? 0 : 1) }
                          : r,
                      )
                    : [...list, { emoji, count: 1, mine: true }],
                );
                last.set(`Reacted with ${emoji}`);
                reactionsOpen.set(false);
              }}
            />
          ) : (
            <Caption>Press a chip to take your reaction back; the smile adds one</Caption>
          )}
        </View>
      </DemoCard>
    </DemoPage>
  );
}
