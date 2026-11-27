// The reference of `skeleton.tsx`. `skeletonLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// A skeleton has no official example here, so this page is the library's own: a profile row, a
// list of rows and a card, each in the blocks the content will fill. Sizes are the caller's
// `style`, as shadcn's `className` is.
import { mount, View } from "nsh";

import { Skeleton } from "@/packages/ui/skeleton";

import { DemoCard, DemoPage, DemoSection } from "./kit";

/**
 * A line of text that is still coming: as tall as the type it will hold, as wide as it runs, and
 * no wider than its column (a narrow phone's).
 */
const line = (width: number) => ({ width, maxWidth: "100%" as const, height: 14 });

function App() {
  return (
    <DemoPage title="Skeleton">
      <DemoCard>
        <DemoSection title="Profile" axis="block">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Skeleton style={{ width: 48, height: 48, borderRadius: 24 }} />
            <View style={{ flexShrink: 1, minWidth: 0, gap: 8 }}>
              <Skeleton style={line(250)} />
              <Skeleton style={line(200)} />
            </View>
          </View>
        </DemoSection>

        <DemoSection title="List" axis="block">
          {[0, 1, 2].map(() => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Skeleton style={{ width: 32, height: 32, borderRadius: 16 }} />
              <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 6 }}>
                <Skeleton style={{ ...line(160), height: 12 }} />
                <Skeleton style={line(220)} />
              </View>
            </View>
          ))}
        </DemoSection>

        <DemoSection title="Card" axis="block">
          <View style={{ gap: 10 }}>
            <Skeleton style={{ ...line(180), height: 16 }} />
            <Skeleton style={line(320)} />
            <Skeleton style={line(260)} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Skeleton style={{ width: 72, height: 28 }} />
              <Skeleton style={{ width: 72, height: 28 }} />
            </View>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
