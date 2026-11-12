import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../../packages/ui";

function App() {
  const off = signal(false);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" disabled={off()}>
            Hover A
          </Button>
        </TooltipTrigger>
        <TooltipContent>Tip A</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>Hover B</TooltipTrigger>
        <TooltipContent>Tip B</TooltipContent>
      </Tooltip>
    </View>
  );
}

mount(App);
