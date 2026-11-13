import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  emojiGroups,
  EmojiHeading,
  emojiPickerClasses,
  EmojiPanel,
  EmojiPreview,
  EmojiTabs,
} from "@/packages/ui/emoji-picker";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const picked = signal<string | null>(null);
  return (
    <DemoPage
      title="Emoji picker"
      note={() => (picked() ? `Picked ${picked()}` : "Pick an emoji…")}
    >
      <DemoCard>
        <DemoSection title="Chrome" axis="block">
          <View
            style={{
              width: "100%",
              maxWidth: 342,
              alignSelf: "center",
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              overflow: "hidden",
              backgroundColor: colors.surface,
            }}
          >
            <EmojiTabs group="smileysEmotion" groups={emojiGroups} onPress={() => {}} />
            <View class={emojiPickerClasses.searchBar}>
              <Text class={emojiPickerClasses.search} style={{ color: colors.muted }}>
                Search emoji
              </Text>
            </View>
            <View class={emojiPickerClasses.list}>
              <View class={emojiPickerClasses.group}>
                <EmojiHeading
                  group={{ id: "smileysEmotion", label: "Smileys & emotion", first: "😀" }}
                />
              </View>
              <View
                class={emojiPickerClasses.row}
                style={{ flexDirection: "row", gap: 4, padding: 8 }}
              >
                <View class={emojiPickerClasses.item}>
                  <Text>😀</Text>
                </View>
                <View class={emojiPickerClasses.item}>
                  <Text>🎉</Text>
                </View>
              </View>
            </View>
            <EmojiPreview entry={null} hint="Pick an emoji…" />
          </View>
        </DemoSection>
      </DemoCard>
      <DemoCard>
        <DemoSection title="Picker" axis="block">
          {/* The panel is 342 points wide by default (a desktop window's width); a phone's card is
              narrower, so it fills the box instead and keeps its own height. */}
          <View style={{ width: "100%", maxWidth: 342, height: 392, alignSelf: "center" }}>
            <EmojiPanel
              class="flex-1"
              recent={["😀", "🎉", "👍"]}
              onSelect={({ emoji }) => picked.set(emoji)}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
