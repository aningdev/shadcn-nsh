// The reference of `accordion.tsx`: disclosure look on `nsh/base`'s Accordion.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "nsh/base";

import { DisclosureChevron, disclosurePanel, disclosureTriggerLook } from "@/packages/ui/accordion";
import { controlSize, RowLabel } from "@/packages/ui/lib/surface";

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
        <DemoSection title="Single">
          <Accordion
            value={open()}
            onChange={({ value }) => open.set(value)}
            style={{ alignSelf: "stretch" }}
          >
            {FAQ.map((item, i) => {
              const look = disclosureTriggerLook({ first: i === 0 });
              return (
                <AccordionItem
                  value={item.value}
                  disabled={"disabled" in item && item.disabled}
                  style={{ alignSelf: "stretch" }}
                >
                  <AccordionHeader>
                    <AccordionTrigger
                      class={look.class}
                      style={look.style}
                      hoverStyle={look.hoverStyle}
                      activeStyle={look.activeStyle}
                      focusVisibleStyle={look.focusVisibleStyle}
                      disabledStyle={look.disabledStyle}
                      accessibilityLabel={item.question}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flexGrow: 1,
                          gap: controlSize.gap,
                        }}
                      >
                        <RowLabel label={item.question} strong />
                        <DisclosureChevron accordion />
                      </View>
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionPanel reveal accessibilityLabel={item.question}>
                    <View style={disclosurePanel()}>
                      <Text style={{ fontSize: 14, lineHeight: 20, color: colors.muted }}>
                        {item.answer}
                      </Text>
                    </View>
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
