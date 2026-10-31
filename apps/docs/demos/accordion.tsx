import { colors } from "@shadcn-nsh/theme";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "../../../packages/ui/accordion";
import { mount, signal, Text, View } from "nsh";

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
              Orders leave the same day before 2 pm.
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
              Print the label within 30 days.
            </Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </View>
  );
}

mount(App);
