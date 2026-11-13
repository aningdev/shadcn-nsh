// The reference of `accordion.tsx`: the same scene with the disclosure look spread on `nsh/base`'s
// Accordion, the way the official example (`references/nsh/website/demos/el-accordion.tsx`) writes
// it. It differs from the component page only in the parts it names.
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
import { controlSize, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Segmented, Split } from "./stage";

const FAQ: { value: string; question: string; answer: string; disabled?: boolean }[] = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer: "Orders leave the warehouse within a day and arrive in two to five working days.",
  },
  {
    value: "returns",
    question: "Can I return an item?",
    answer:
      "Within 30 days, unused and in its box: print the label from your order and drop it off.",
  },
  {
    value: "warranty",
    question: "What does the warranty cover?",
    answer: "Two years against defects in materials and workmanship, parts and labour included.",
  },
  {
    value: "gift",
    question: "Can I send it as a gift?",
    answer: "Gift wrapping opens with the holiday season.",
    disabled: true,
  },
];

const MODES = ["one at a time", "several"] as const;

function App() {
  const open = signal<string[]>(["shipping"]);
  const mode = signal<(typeof MODES)[number]>("one at a time");
  const events = signal<string[]>([]);
  return (
    <DemoPage title="Accordion">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a question, or Tab to it and press Space"
          : "Tap a question to read its answer"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="multiple">
              <Segmented
                options={MODES}
                value={mode()}
                onChange={(value) => {
                  mode.set(value);
                  // One at a time keeps the item opened last.
                  if (value === "one at a time") open.set(open().slice(-1));
                }}
              />
            </Panel>
            <Panel title="value">
              <Text style={{ fontSize: 13, color: colors.text }}>
                {open().length ? open().join(", ") : "none open"}
              </Text>
            </Panel>
            <Log title="onChange({ value })" lines={events()} minHeight={92} />
          </>
        }
      >
        <Accordion
          value={open()}
          multiple={mode() === "several"}
          onChange={({ value }) => {
            open.set(value);
            events.set([`[${value.join(", ")}]`, ...events()].slice(0, 4));
          }}
          style={sectionSurface({ padded: true })}
        >
          {FAQ.map((item, i) => (
            <AccordionItem value={item.value} disabled={item.disabled}>
              <View style={{ height: i === 0 ? 0 : 1, backgroundColor: colors.line }} />
              <AccordionHeader>
                <AccordionTrigger
                  {...disclosureTriggerLook({ first: true, disabled: item.disabled })}
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
                  <Text
                    style={{
                      fontSize: controlSize.label,
                      lineHeight: Math.round(controlSize.label * 1.45),
                      color: colors.muted,
                    }}
                  >
                    {item.answer}
                  </Text>
                </View>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Split>
    </DemoPage>
  );
}

mount(App);
