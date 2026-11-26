// EmojiPicker: the official gallery's emoji scene (`references/nsh/examples/gallery/demos/EmojiPickerDemo.tsx`)
// with this library's parts — `PickerFrom` opens `EmojiPanel` in a `Popover` anchored on the smile button
// with a pointer (or a bottom `Sheet` on touch), a composer field with the smile button inside it, and a
// message with toggleable reaction chips and a quick-reactions bar.
import { alpha, colors, shape } from "@shadcn-nsh/theme";
import { Smile } from "lucide";
import type { JSX } from "nsh";
import { platform, signal, Text, View } from "nsh";

import { EmojiPanel } from "@/packages/ui/emoji-picker";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/packages/ui/input-group";
import { Icon } from "@/packages/ui/lib/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/packages/ui/popover";
import { Sheet, SheetContent } from "@/packages/ui/sheet";

import { DemoCard, DemoPage } from "../kit";

/** A pointer and a keyboard: the picker pops over its button; a phone opens it in a sheet. */
const pointer = platform.desktop;

/** The most recent first, each once, at most `max`. */
const remember = (list: string[], emoji: string, max = 18) =>
  [emoji, ...list.filter((e) => e !== emoji)].slice(0, max);

/**
 * Where the picker opens from: over its button with a pointer (`Popover` anchored on the trigger),
 * in a bottom `Sheet` on a phone (`EmojiPanel` `fill`ing its width). A choice closes it.
 */
function PickerFrom(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: JSX.Element;
  recent: string[];
  onSelect: (e: { emoji: string; base: string }) => void;
  placement?: "top" | "bottom";
}) {
  const choose = (e: { emoji: string; base: string }) => {
    props.onOpenChange(false);
    props.onSelect(e);
  };
  if (pointer) {
    return (
      <Popover open={props.open} onOpenChange={({ open }) => props.onOpenChange(open)}>
        <PopoverTrigger>{props.trigger}</PopoverTrigger>
        <PopoverContent
          placement={props.placement ?? "top"}
          align="start"
          offset={8}
          margin={8}
          style={{ padding: 0, overflow: "hidden" }}
        >
          <EmojiPanel
            testID="emoji-panel"
            recent={props.recent}
            onSelect={choose}
            onCancel={() => props.onOpenChange(false)}
          />
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <>
      {props.trigger}
      <Sheet open={props.open} onOpenChange={({ open }) => props.onOpenChange(open)}>
        <SheetContent side="bottom">
          <View style={{ height: 420, marginHorizontal: -16 }}>
            <EmojiPanel testID="emoji-panel" fill recent={props.recent} onSelect={choose} />
          </View>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** The icon button the picker opens from: a rounded square at the controls' radius, as icon buttons are. */
function SmileButton(props: { open: boolean; onPress?: () => void; label: string }) {
  return (
    <View
      role="button"
      accessibilityLabel={props.label}
      tooltip={pointer ? props.label : undefined}
      onPress={props.onPress}
      class="hover:bg-accent items-center justify-center transition duration-100 active:scale-95 motion-reduce:transition-none"
      style={{
        width: pointer ? 32 : 40,
        height: pointer ? 32 : 40,
        borderRadius: shape.control,
        backgroundColor: props.open ? alpha(colors.foreground, 0.08) : undefined,
      }}
    >
      <Icon
        icon={Smile}
        size={pointer ? 18 : 22}
        tint={props.open ? colors.foreground : colors.mutedForeground}
      />
    </View>
  );
}

/** A message's field with an emoji button: a choice goes in at the end, and leads the recent ones. */
function Composer() {
  const text = signal("Lunch at the new ramen place? ");
  const open = signal(false);
  const recent = signal<string[]>(["👍", "😂", "❤️", "🎉", "🙏", "🔥"]);
  return (
    <DemoCard
      title="Message composer"
      subtitle={
        pointer
          ? "Tabs, search, skin tones, the name below"
          : "A sheet across the screen, the tabs at its foot"
      }
    >
      <InputGroup style={{ borderRadius: 16, minHeight: pointer ? 40 : 48 }}>
        <InputGroupAddon style={{ paddingLeft: 4 }}>
          <PickerFrom
            open={open()}
            onOpenChange={(next) => open.set(next)}
            recent={recent()}
            onSelect={({ emoji, base }) => {
              text.set(text() + emoji);
              recent.set(remember(recent(), base));
            }}
            trigger={
              <SmileButton
                open={open()}
                onPress={pointer ? undefined : () => open.set(true)}
                label="Emoji"
              />
            }
          />
        </InputGroupAddon>
        <InputGroupInput
          value={text()}
          onChange={({ value }) => text.set(value)}
          placeholder="Message"
          accessibilityLabel="Message"
        />
      </InputGroup>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: 12, color: colors.mutedForeground }}>
          {`Recent: ${recent().slice(0, 9).join(" ")}`}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: colors.mutedForeground,
            fontVariant: ["tabular-nums"],
          }}
        >
          {`${recent().length} kept`}
        </Text>
      </View>
    </DemoCard>
  );
}

/** A reaction on the message: its emoji, how many, whether one is the reader's. */
type Reaction = { emoji: string; count: number; mine: boolean };

/** A message with reactions: the quick ones, and any emoji from the picker. */
function Reactions() {
  const reactions = signal<Reaction[]>([
    { emoji: "🎉", count: 4, mine: false },
    { emoji: "🚀", count: 2, mine: true },
    { emoji: "👀", count: 1, mine: false },
  ]);
  const recent = signal<string[]>(["👍", "❤️", "😂", "🎉", "🚀", "👀"]);
  const open = signal(false);
  const react = (emoji: string) => {
    const found = reactions().find((r) => r.emoji === emoji);
    if (!found) reactions.set([...reactions(), { emoji, count: 1, mine: true }]);
    else
      reactions.set(
        reactions()
          .map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + (r.mine ? -1 : 1), mine: !r.mine } : r,
          )
          .filter((r) => r.count > 0),
      );
  };
  return (
    <DemoCard title="Reactions" subtitle="Recent ones first; any other from the picker">
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View
            class="items-center justify-center rounded-full"
            style={{ width: 32, height: 32, backgroundColor: colors.surface }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
              MC
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              Mira Chen <Text style={{ fontWeight: "400", color: colors.faint }}>· 10:42</Text>
            </Text>
            <Text style={{ fontSize: pointer ? 14 : 15, color: colors.foreground, lineHeight: 20 }}>
              The emoji picker is in: search, skin tones, every group, on every platform.
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingLeft: 42 }}>
          <Each of={reactions()} key={(r) => r.emoji}>
            {(r) => (
              <View
                role="button"
                accessibilityLabel={`${r().emoji} ${r().count}`}
                accessibilityState={{ selected: r().mine }}
                onPress={() => react(r().emoji)}
                class="flex-row items-center gap-1 rounded-full border px-2 active:opacity-70"
                style={{
                  height: 26,
                  borderColor: r().mine ? colors.brand : colors.border,
                  backgroundColor: r().mine ? colors.primary : colors.card,
                }}
              >
                <Text style={{ fontSize: 14 }}>{r().emoji}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: r().mine ? colors.brand : colors.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {r().count}
                </Text>
              </View>
            )}
          </Each>
        </View>
        <View
          class="border-border flex-row items-center gap-0.5 self-start rounded-full border"
          style={{ marginLeft: 42, padding: 3, backgroundColor: colors.card }}
        >
          <Each of={recent().slice(0, 6)} key={(emoji) => emoji}>
            {(emoji) => (
              <View
                role="button"
                accessibilityLabel={`React ${emoji()}`}
                onPress={() => react(emoji())}
                class="hover:bg-accent items-center justify-center active:scale-90"
                style={{
                  width: pointer ? 30 : 38,
                  height: pointer ? 30 : 38,
                  borderRadius: shape.control,
                }}
              >
                <Text style={{ fontSize: pointer ? 18 : 22 }}>{emoji()}</Text>
              </View>
            )}
          </Each>
          <View
            style={{ width: 1, height: 18, marginHorizontal: 3, backgroundColor: colors.border }}
          />
          <PickerFrom
            open={open()}
            onOpenChange={(next) => open.set(next)}
            placement="bottom"
            recent={recent()}
            onSelect={({ base }) => {
              react(base);
              recent.set(remember(recent(), base));
            }}
            trigger={
              <SmileButton
                open={open()}
                onPress={pointer ? undefined : () => open.set(true)}
                label="More reactions"
              />
            }
          />
        </View>
      </View>
    </DemoCard>
  );
}

/** `EmojiPicker` as a chat app has it: in a composer and for reactions. */
export function EmojiPickerDemo() {
  return (
    <DemoPage title="EmojiPicker">
      <Composer />
      <Reactions />
    </DemoPage>
  );
}
