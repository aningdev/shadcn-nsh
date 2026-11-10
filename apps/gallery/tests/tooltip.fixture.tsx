import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn-nsh/ui";
import { mount, signal, Text } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const off = signal(false);
  return (
    <TooltipProvider delay={0}>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <Tooltip>
        <TooltipTrigger disabled={off()}>Hover A</TooltipTrigger>
        <TooltipContent>Tip A</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Text>Hover B</Text>
        </TooltipTrigger>
        <TooltipContent>Tip B</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

mount(App);
