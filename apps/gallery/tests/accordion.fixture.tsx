import { mount, signal, Text, View } from "nsh";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "../../../packages/ui/accordion";
import { RowLabel } from "../../../packages/ui/lib/surface";

function App() {
  // `nsh/base`'s accordion holds no state of its own: the app owns the open values and follows them.
  const open = signal<string[]>([]);
  return (
    <View>
      <Accordion value={open()} onChange={({ value }) => open.set(value)}>
        <AccordionItem value="rich">
          <AccordionHeader>
            <AccordionTrigger first>
              <Text>★</Text>
              <RowLabel label="Rich row" detail="an icon, the title, the chevron after them" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Rich body</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="plain">
          <AccordionHeader>
            <AccordionTrigger first>Plain row</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Plain body</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="off">
          <AccordionHeader>
            <AccordionTrigger first disabled>
              Broken row
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Broken body</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="item-off" disabled>
          <AccordionHeader>
            <AccordionTrigger first>Item off</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Item off body</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </View>
  );
}

mount(App);
