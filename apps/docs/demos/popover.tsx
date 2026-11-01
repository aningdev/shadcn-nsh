import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "../../../packages/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../../../packages/ui/popover";

function App() {
  const open = signal(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Popover</Text>
      <Popover open={open()} onOpenChange={({ open: v }) => open.set(v)}>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Quick tip</PopoverTitle>
            <PopoverDescription>
              Popover Trigger / Content composition with fixed surface chrome.
            </PopoverDescription>
          </PopoverHeader>
          <Button variant="outline" onPress={() => open.set(false)}>
            Close
          </Button>
        </PopoverContent>
      </Popover>
    </View>
  );
}

mount(App);
