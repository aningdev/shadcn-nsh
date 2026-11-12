import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import {
  emojiGroups,
  EmojiHeading,
  emojiPickerClasses,
  EmojiPreview,
  EmojiTabs,
} from "@/packages/ui/emoji-picker";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Emoji picker">
      <DemoCard>
        <DemoSection title="Chrome">
          <View
            style={{
              width: 342,
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
    </DemoPage>
  );
}

mount(App);
