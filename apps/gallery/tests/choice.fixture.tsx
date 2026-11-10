import { Checkbox, RadioGroup, RadioGroupItem, Toggle } from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const pressed = signal(false);
  const checked = signal(false);
  const option = signal("a");
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
      <BaseButton onPress={() => pressed.set(true)}>
        <Text>Press it</Text>
      </BaseButton>
      <Text>{`pressed=${pressed()}`}</Text>
      <Text>{`checked=${checked()}`}</Text>
      <Text>{`option=${option()}`}</Text>
    </View>
  );
}

mount(App);
