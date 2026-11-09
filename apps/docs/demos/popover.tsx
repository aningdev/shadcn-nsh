import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/packages/ui/popover";

function App() {
  const open = signal(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Popover</Text>
      <Popover open={open()} onOpenChange={({ open: next }) => open.set(next)}>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>Quick tip</PopoverTitle>
            <PopoverDescription>
              Trigger / Content composition with surface chrome. Outside press or Escape closes.
            </PopoverDescription>
          </PopoverHeader>
          <Button variant="outline" onPress={() => open.set(false)}>
            Close
          </Button>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>Top placement</PopoverTrigger>
        <PopoverContent placement="top" align="start">
          <PopoverTitle>Above the trigger</PopoverTitle>
          <PopoverDescription>placement top, align start</PopoverDescription>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger>Style merge</PopoverTrigger>
        <PopoverContent popupStyle={{ padding: 20, minWidth: 320 }}>
          <PopoverTitle style={{ fontSize: 16 }}>Merged chrome</PopoverTitle>
          <PopoverDescription>Consumer popupStyle wins per key</PopoverDescription>
        </PopoverContent>
      </Popover>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Open: {() => (open() ? "yes" : "no")}
      </Text>
    </View>
  );
}

mount(App);
