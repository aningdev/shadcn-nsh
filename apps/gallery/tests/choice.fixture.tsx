import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Toggle,
  ToggleGroup,
} from "../../../packages/ui";

function App() {
  const pressed = signal(false);
  const checked = signal(false);
  const option = signal("a");
  const wifi = signal(false);
  const left = signal(false);
  return (
    <View>
      <Toggle pressed={pressed()} onChange={(e) => pressed.set(e.pressed)}>
        Bold
      </Toggle>
      <Checkbox checked={checked()} onChange={(e) => checked.set(e.checked)}>
        <Text>Agree</Text>
      </Checkbox>
      <RadioGroup>
        <RadioGroupItem checked={option() === "a"} onChange={() => option.set("a")}>
          <Text>Option A</Text>
        </RadioGroupItem>
        <RadioGroupItem checked={option() === "b"} onChange={() => option.set("b")}>
          <Text>Option B</Text>
        </RadioGroupItem>
      </RadioGroup>
      <Switch checked={wifi()} onChange={(e) => wifi.set(e.checked)}>
        <Text>Wi-Fi</Text>
      </Switch>
      <ToggleGroup>
        <Toggle pressed={left()} onChange={(e) => left.set(e.pressed)}>
          Left
        </Toggle>
        <Toggle pressed={false}>Right</Toggle>
      </ToggleGroup>
      <BaseButton onPress={() => pressed.set(true)}>
        <Text>Press it</Text>
      </BaseButton>
      <Text>{`pressed=${pressed()}`}</Text>
      <Text>{`checked=${checked()}`}</Text>
      <Text>{`option=${option()}`}</Text>
      <Text>{`wifi=${wifi()}`}</Text>
      <Text>{`left=${left()}`}</Text>
    </View>
  );
}

mount(App);
