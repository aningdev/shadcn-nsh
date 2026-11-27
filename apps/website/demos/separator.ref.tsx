// The reference of `separator.tsx`. `separatorLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// A separator has no official example, so this page is the library's own: a heading parted from
// the note under it, a row of words parted from each other, and a separator a screen reader still
// reaches (`decorative={false}`).
import { mount, Text, View } from "nsh";

import { Separator } from "@/packages/ui/separator";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

const WORDS = ["Blog", "Docs", "Source"];

function App() {
  return (
    <DemoPage title="Separator">
      <Text style={{ color: ui().muted }}>
        {"One hairline, in the theme's edge color: across the content, or down a row."}
      </Text>

      <DemoCard>
        <DemoSection title="Horizontal" axis="block">
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: ui().text }}>
              Project settings
            </Text>
            <Text style={{ fontSize: 13, color: ui().muted }}>
              Who can see this project, and what they can change.
            </Text>
          </View>
          <Separator orientation="horizontal" style={{ marginVertical: 12 }} />
          <View style={{ gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: "500", color: ui().text }}>Members</Text>
            <Text style={{ fontSize: 13, color: ui().muted }}>
              Invite people, and say what each of them may do.
            </Text>
          </View>
        </DemoSection>

        <DemoSection title="Vertical">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, height: 20 }}>
            {WORDS.map((word, i) => (
              <>
                <Text style={{ fontSize: 13, color: ui().text }}>{word}</Text>
                {/* Between the words, not after the last one. */}
                {i < WORDS.length - 1 ? <Separator orientation="vertical" /> : null}
              </>
            ))}
          </View>
        </DemoSection>

        <DemoSection title="Still read out" axis="block">
          <Text style={{ fontSize: 13, color: ui().muted }}>
            A decorative separator is a line of the layout, which a screen reader walks past. This
            one is not decorative: it is a boundary in the accessibility tree too.
          </Text>
          <Separator
            decorative={false}
            accessibilityLabel="End of the separator examples"
            style={{ marginVertical: 4 }}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
