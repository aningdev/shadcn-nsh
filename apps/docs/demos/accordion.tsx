import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import {
  Accordion,
  AccordionPanel,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/packages/ui/accordion";

function App() {
  const open = signal(["shipping"]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Accordion</Text>
      <Accordion value={open()} onChange={({ value }) => open.set(value)}>
        <AccordionItem value="shipping">
          <AccordionHeader>
            <AccordionTrigger>
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                Shipping
              </Text>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingBottom: 12 }}>
              Ships in 2–3 days.
            </Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="returns">
          <AccordionHeader>
            <AccordionTrigger>
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                Returns
              </Text>
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingBottom: 12 }}>
              30-day return window.
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </View>
  );
}

mount(App);
