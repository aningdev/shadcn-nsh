// The reference of `aspect-ratio.tsx`. `aspectRatioLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// An aspect ratio has no official example here, so this page is the library's own: a 16 / 9 box and
// a square, a cover in the card that holds it, and the ratio a box keeps as its column narrows.
import { mount, Text, View } from "nsh";

import { AspectRatio } from "@/packages/ui/aspect-ratio";
import { insetSurface } from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

/** What fills a ratio box in this page: one block, its label centered. */
function Block(props: { label: string }) {
  return (
    <View style={[insetSurface(), { flex: 1, alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ fontSize: 13, color: ui().muted }}>{props.label}</Text>
    </View>
  );
}

function App() {
  return (
    <DemoPage title="Aspect ratio">
      <Text style={{ color: ui().muted }}>
        {"A box as wide as its column, as tall as its ratio says: pictures keep their shape."}
      </Text>

      <DemoCard>
        <DemoSection title="16 / 9" axis="block">
          <AspectRatio ratio={16 / 9}>
            <Block label="16 / 9" />
          </AspectRatio>
        </DemoSection>

        <DemoSection title="1 / 1" axis="block">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <AspectRatio ratio={1} style={{ width: 72 }}>
              <Block label="1 / 1" />
            </AspectRatio>
            <View style={{ flexShrink: 1, gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: "500", color: ui().text }}>Team photo</Text>
              <Text style={{ fontSize: 13, color: ui().muted }}>
                A square as wide as its own 72 points, not as wide as the column.
              </Text>
            </View>
          </View>
        </DemoSection>

        <DemoSection title="A cover in a card" axis="block">
          <View style={{ gap: 6 }}>
            <AspectRatio ratio={16 / 9}>
              <Block label="Weekly review" />
            </AspectRatio>
            <Text style={{ fontSize: 14, fontWeight: "500", color: ui().text }}>Weekly review</Text>
            <Text style={{ fontSize: 13, color: ui().muted }}>
              The cover keeps the card's shape whatever the window does.
            </Text>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
