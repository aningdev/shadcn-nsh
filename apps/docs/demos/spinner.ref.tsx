// The reference of `spinner.tsx`: the gallery `Spinner` from index (same pixels as the component).
import { colors } from "@shadcn-nsh/theme";
import type { JSX, ViewStyle } from "nsh";
import { mount, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { insetSurface } from "@/packages/ui/lib/surface";
import { Spinner } from "@/packages/ui/spinner";

import { DemoCard, DemoPage, DemoSection } from "./kit";

/** A surface the ring sits on, its size fixed so the three read as one row. */
function Surface(props: { style?: ViewStyle; children: JSX.Element }) {
  return (
    <View
      style={{
        width: 88,
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        ...props.style,
      }}
    >
      {props.children}
    </View>
  );
}

function App() {
  return (
    <DemoPage title="Spinner">
      <DemoCard>
        <DemoSection title="Size">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
            <Spinner size={12} tint={colors.muted} />
            <Spinner size={16} tint={colors.accent} />
            <Spinner size={24} tint={colors.accent} />
          </View>
        </DemoSection>
        <DemoSection title="Surface">
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Surface style={{ backgroundColor: colors.raised }}>
              <Spinner size={16} tint={colors.text} />
            </Surface>
            <Surface style={insetSurface()}>
              <Spinner size={16} tint={colors.accent} />
            </Surface>
            <Surface style={{ backgroundColor: colors.accentFill }}>
              <Spinner size={16} tint={colors.onAccent} />
            </Surface>
          </View>
        </DemoSection>
        <DemoSection title="Busy button">
          <Button variant="primary" busy>
            Saving
          </Button>
          <Button variant="secondary" busy>
            Syncing
          </Button>
          <Button variant="danger" busy>
            Deleting
          </Button>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
