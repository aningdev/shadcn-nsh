# Emoji picker (/dev/docs/components/emoji-picker)

## Installation [#installation]

```npm
npx shadcn-nsh@latest add emoji-picker
```

As a TSX module, added once per app — nothing is copied into it:

```sh
nsh add github:aningdev/shadcn-nsh
```

```tsx
import { EmojiPanel } from "shadcn-nsh/emoji-picker";
```

## Usage [#usage]

```tsx
import { EmojiPanel } from "@/components/ui/emoji-picker";
```

```tsx
<EmojiPanel onSelect={({ emoji }) => send(emoji)} />
```

## Examples [#examples]

### Recent emoji [#recent-emoji]

```tsx
<EmojiPanel recent={["👍", "🎉"]} onSelect={onPick} />
```

### In a composer [#in-a-composer]

A composer keeps the panel behind a `Popover` on the field's leading addon. Choosing closes the
panel and puts the emoji at the end of the draft; `base` (the emoji without its skin tone) is what
leads the recents, so the tab that holds it opens first the next time.

```tsx
const recent = signal<string[]>([]);
const draft = signal("");
const picking = signal(false);

const put = (emoji: string, base: string) => {
  draft.set(draft() + emoji);
  recent.set([base, ...recent().filter((e) => e !== base)].slice(0, 18));
  picking.set(false);
};

<InputGroup>
  <InputGroupAddon align="inline-start">
    <Popover open={picking()} onOpenChange={({ open }) => picking.set(open)}>
      <PopoverTrigger>
        <InputGroupButton size="icon-sm" variant="ghost" accessibilityLabel="Emoji">
          <Icon icon={Smile} size={16} tint={colors.mutedForeground} />
        </InputGroupButton>
      </PopoverTrigger>
      <PopoverContent placement="top" width={342} compact>
        <EmojiPanel
          class="h-[392px] w-full"
          recent={recent()}
          onSelect={({ emoji, base }) => put(emoji, base)}
        />
      </PopoverContent>
    </Popover>
  </InputGroupAddon>
  <InputGroupInput
    value={draft()}
    onChange={({ value }) => draft.set(value)}
    placeholder="Message"
  />
</InputGroup>;
```

The popover goes in the addon, where the smile goes: `PopoverContent` is what mounts the popover,
and it draws the trigger in its own place — a `PopoverContent` written outside the group leaves the
smile under the field. `placement="top"` puts the panel over the field, where a composer at the
bottom of a window has room; on a narrow frame give the panel a narrower `class` and the popover
the same `width`.

### Reactions [#reactions]

The counted chips are a row of pressables under the bubble: one tap adds yours or takes it back
off, and a count that reaches zero drops the chip. `BubbleReactions` draws a row of emoji alone —
its children are text, and the room it keeps is a line of it — so counted chips go in the
`MessageContent` below the bubble.

```tsx
type Reaction = { emoji: string; count: number; mine: boolean };

const reactions = signal<Reaction[]>([{ emoji: "🎉", count: 4, mine: false }]);

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
};

<Message align="start">
  <MessageAvatar name="Ada Lovelace" />
  <MessageContent>
    <Bubble variant="muted">
      <BubbleContent>Ship it?</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
<View style={{ flexDirection: "row", gap: 6, paddingLeft: 42 }}>
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
        borderColor: reaction.mine ? alpha(colors.brand, 0.45) : colors.line,
        backgroundColor: reaction.mine ? alpha(colors.brand, 0.12) : colors.card,
      }}
    >
      <Text style={{ fontSize: 14 }}>{reaction.emoji}</Text>
      <Text
        style={{
          fontSize: 12,
          fontWeight: 600,
          fontVariant: ["tabular-nums"],
          color: reaction.mine ? colors.brand : colors.mutedForeground,
        }}
      >
        {reaction.count}
      </Text>
    </Pressable>
  ))}
</View>;
```

A row of quick emoji beside the picker is the same pressables in a pill: six of them, a divider,
then a `Popover` whose trigger is a plus, with the same `EmojiPanel` inside it and `react` as its
`onSelect`.

## API [#api]

| Part           | Props                                                                                                                                                           | Description                                                  |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `EmojiPanel`   | `onSelect` (required, `(e: { emoji: string; base: string })`), `onCancel`, `recent` (`string[]`, default `[]`), `fill`, `class`, `testID`, `accessibilityLabel` | The whole picker: tabs, search, skin tones, grid and preview |
| `EmojiHeading` | `group`                                                                                                                                                         | A group's heading                                            |
| `EmojiTabs`    | `group`, `groups`, `onPress`                                                                                                                                    | The group tabs                                               |
| `EmojiTones`   | `tone`, `onChange`                                                                                                                                              | The skin tone hand beside the search field                   |
| `EmojiPreview` | `entry`, `hint`                                                                                                                                                 | The emoji under the pointer, named                           |

`EmojiPanel` wraps [`nsh/base` EmojiPicker](https://nsh.dev/elements/emoji-picker) with gallery classes and chrome. Pass through any base picker prop via extending the shell later; today only the upstream panel props are supported.