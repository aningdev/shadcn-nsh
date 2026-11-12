import { mount, platform, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  Input,
  NumberInput,
  OtpInput,
  fieldLook,
  fieldSize,
  numberInputClasses,
  otpCellLook,
} from "../../../packages/ui";

function App() {
  const text = signal("");
  const quiet = signal(false);
  const qty = signal(1);
  const code = signal("");
  const done = signal("");
  const input = fieldLook();
  const numberH = numberInputClasses.frame.includes("h-8") ? 32 : 88;
  const otp = otpCellLook();
  return (
    <View>
      <Input
        testID="name"
        placeholder="Your name"
        value={text()}
        onChange={(e) => text.set(e.value)}
      />
      <Input testID="quiet" value="Name" readonly={quiet()} />
      <Text testID="ink" style={{ fontSize: 14 }}>
        Ink
      </Text>
      <BaseButton onPress={() => quiet.set(true)}>
        <Text>Quiet</Text>
      </BaseButton>
      <NumberInput
        testID="qty"
        accessibilityLabel="Quantity"
        value={qty()}
        min={0}
        max={9}
        onChange={(e) => {
          if (e.value != null) qty.set(e.value);
        }}
      />
      <OtpInput
        testID="code"
        length={4}
        accessibilityLabel="Code"
        value={code()}
        onChange={(e) => code.set(e.value)}
        onComplete={(e) => done.set(e.value)}
      />
      <Text>{`value=${text()}`}</Text>
      <Text>{`quiet=${quiet()}`}</Text>
      <Text>{`qty=${qty()}`}</Text>
      <Text>{`code=${code()}`}</Text>
      <Text>{`done=${done()}`}</Text>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`input=${input.style.minHeight ?? fieldSize.height}`}</Text>
      <Text>{`number=${numberH}`}</Text>
      <Text>{`otp=${platform.desktop ? "36|44|18" : "44|52|20"}`}</Text>
    </View>
  );
}

mount(App);
