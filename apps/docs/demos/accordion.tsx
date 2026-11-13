import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text } from "nsh";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/packages/ui/accordion";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const FAQ = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer: "Orders leave within a day and arrive in two to five working days.",
  },
  {
    value: "returns",
    question: "Can I return an item?",
    answer: "Within 30 days, unused and in its box, with a prepaid label.",
  },
  {
    value: "gift",
    question: "Can I send it as a gift?",
    answer: "Gift wrapping opens with the holiday season.",
    disabled: true,
  },
] as const;

function App() {
  const open = signal<string[]>(["shipping"]);

  return (
    <DemoPage title="Accordion" note={() => (open().length ? open().join(", ") : "none")}>
      <DemoCard>
        <DemoSection title="Single" axis="block">
          <Accordion
            value={open()}
            onChange={({ value }) => open.set(value)}
            style={{ alignSelf: "stretch" }}
          >
            {FAQ.map((item, i) => (
              <AccordionItem value={item.value} disabled={"disabled" in item && item.disabled}>
                <AccordionHeader>
                  <AccordionTrigger first={i === 0}>{item.question}</AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel reveal accessibilityLabel={item.question}>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>
                    {item.answer}
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
