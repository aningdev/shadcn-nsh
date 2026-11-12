import { colors } from "@shadcn-nsh/theme";
import { mount, Text } from "nsh";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Collapsible">
      <DemoCard>
        <DemoSection title="Default">
          <Collapsible defaultOpen>
            <CollapsibleTrigger first>Shipping details</CollapsibleTrigger>
            <CollapsibleContent>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>
                Orders leave within a day and arrive in two to five working days.
              </Text>
            </CollapsibleContent>
          </Collapsible>
        </DemoSection>
        <DemoSection title="Closed">
          <Collapsible>
            <CollapsibleTrigger>Returns</CollapsibleTrigger>
            <CollapsibleContent>
              <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>
                Within 30 days, unused and in its box.
              </Text>
            </CollapsibleContent>
          </Collapsible>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
