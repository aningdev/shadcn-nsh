import { mount, signal, Text, View } from "nsh";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../packages/ui/collapsible";
import { RowLabel } from "../../../packages/ui/lib/surface";

function App() {
  const open = signal(false);
  return (
    <View>
      <Collapsible>
        <CollapsibleTrigger first chevron="down">
          <Text>★</Text>
          <RowLabel label="Trash" detail="Emptied after 30 days" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Text>Nothing in it.</Text>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <CollapsibleTrigger disabled>Locked</CollapsibleTrigger>
        <CollapsibleContent>
          <Text>Locked body</Text>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible>
        <CollapsibleTrigger chevron="along">Along</CollapsibleTrigger>
        <CollapsibleContent>
          <Text>Along body</Text>
        </CollapsibleContent>
      </Collapsible>
    </View>
  );
}

mount(App);
