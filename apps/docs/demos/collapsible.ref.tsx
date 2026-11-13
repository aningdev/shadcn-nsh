// The reference of `collapsible.tsx`: disclosure look on `nsh/base`'s Collapsible.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Collapsible } from "nsh/base";

import { DisclosureChevron, disclosurePanel, disclosureTriggerLook } from "@/packages/ui/accordion";
import { RowLabel } from "@/packages/ui/lib/surface";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Plain(props: {
  first?: boolean;
  open: boolean;
  title: string;
  body: string;
  onToggle: () => void;
}) {
  const look = disclosureTriggerLook({ first: props.first });
  return (
    <Collapsible
      open={props.open}
      reveal
      style={{ alignItems: "stretch" }}
      content={
        <View style={disclosurePanel()}>
          <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>{props.body}</Text>
        </View>
      }
    >
      <View
        role="button"
        accessibilityLabel={props.title}
        accessibilityState={{ expanded: props.open }}
        class={look.class}
        onPress={props.onToggle}
        style={look.style}
        hoverStyle={look.hoverStyle}
        activeStyle={look.activeStyle}
        focusVisibleStyle={look.focusVisibleStyle}
        disabledStyle={look.disabledStyle}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}>
          <RowLabel label={props.title} strong />
          <DisclosureChevron open={props.open} />
        </View>
      </View>
    </Collapsible>
  );
}

function App() {
  const a = signal(true);
  const b = signal(false);
  return (
    <DemoPage title="Collapsible">
      <DemoCard>
        <DemoSection title="Default" axis="block">
          <Plain
            first
            open={a()}
            title="Shipping details"
            body="Orders leave within a day and arrive in two to five working days."
            onToggle={() => a.set(!a())}
          />
        </DemoSection>
        <DemoSection title="Closed" axis="block">
          <Plain
            open={b()}
            title="Returns"
            body="Within 30 days, unused and in its box."
            onToggle={() => b.set(!b())}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
