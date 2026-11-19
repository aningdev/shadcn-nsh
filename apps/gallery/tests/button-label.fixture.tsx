import { mount, signal, Text } from "nsh";

import { Button } from "../../../packages/ui";

function App() {
  const presses = signal(0);
  return (
    <>
      {/* A string child is a text label, and what the button draws is its name. */}
      <Button onPress={() => presses.set(presses() + 1)}>Retry</Button>
      {/* Anything else is drawn as given: the texts inside it are the button's name too. */}
      <Button onPress={() => presses.set(presses() + 1)}>
        <Text>Drawn as given</Text>
      </Button>
      <Text>{`pressed ${presses()}`}</Text>
    </>
  );
}

mount(App);
