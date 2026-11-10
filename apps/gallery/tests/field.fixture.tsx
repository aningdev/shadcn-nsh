import {
  Input,
  inputVariants,
  NumberInput,
  numberInputVariants,
  OtpInput,
  otpInputVariants,
} from "@shadcn-nsh/ui";
import { mount, platform, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const text = signal("");
  const quiet = signal(false);
  const qty = signal(1);
  const code = signal("");
  const done = signal("");
  const input = inputVariants();
  const number = numberInputVariants();
  const otp = otpInputVariants();
  return (
    <View>
      <Input
        testID="name"
        placeholder="Your name"
        value={text()}
        onChange={(e) => text.set(e.value)}
      />
      <Input testID="quiet" value="Name" readonly={quiet()} />
      <Text style={{ color: inputVariants({ readonly: quiet() }).style.color }}>Ink</Text>
      <BaseButton onPress={() => quiet.set(true)}>
        <Text>Quiet</Text>
      </BaseButton>
      <NumberInput
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
      <Text>{`input=${input.style.minHeight}`}</Text>
      <Text>{`number=${number.style.minHeight}`}</Text>
      <Text>{`otp=${otp.cellStyle.minWidth}|${otp.cellStyle.minHeight}|${otp.cellStyle.fontSize}`}</Text>
    </View>
  );
}

mount(App);
