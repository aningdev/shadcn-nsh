// The reference of `emoji-picker.tsx`: the same scene. The picker is upstream's own component
// (`EmojiPanel` in `packages/ui/emoji-picker.tsx`), so this page draws it too: the case declares
// itself a self-reference.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { EmojiPanel } from "@/packages/ui/emoji-picker";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

const message = signal("Lunch at the new ramen place? ");

const recent = signal<string[]>(["👍", "😂", "❤️", "🎉", "🙏", "🔥"]);

const events = signal<string[]>([]);

const log = (line: string) => events.set([line, ...events()].slice(0, 4));

function App() {
  return (
    <DemoPage title="Emoji picker">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Type to search, the arrows to move, Return to choose; a tab scrolls to its group"
          : "Search, or tap a tab to scroll to its group; tap an emoji to choose it"}
      </Text>
      <Split
        gap={14}
        inspector={
          <>
            <Panel title="message">
              <Text style={{ fontSize: 14, color: colors.text }}>{message()}</Text>
            </Panel>
            <Log title="events" lines={events()} minHeight={92} />
          </>
        }
      >
        <View
          style={{
            ...sectionSurface(),
            width: wide() ? 342 : undefined,
            height: desktop ? 400 : 440,
            alignSelf: wide() ? "center" : "stretch",
            overflow: "hidden",
          }}
        >
          <EmojiPanel
            class="flex-1"
            fill={!desktop}
            recent={recent()}
            onSelect={({ emoji, base }) => {
              message.set(message() + emoji);
              recent.set([base, ...recent().filter((e) => e !== base)].slice(0, 18));
              log(`onSelect({ emoji: "${emoji}", base: "${base}" })`);
            }}
            onCancel={() => log("onCancel()")}
          />
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
