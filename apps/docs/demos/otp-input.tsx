import { mount, signal, View } from "nsh";

import { OtpInput } from "@/packages/ui/otp-input";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const code = signal("");

  return (
    <DemoPage title="OTP Input" note={() => code() || "—"}>
      <DemoCard>
        <DemoSection title="Code">
          <OtpInput
            length={6}
            value={code()}
            onChange={({ value }) => code.set(value)}
            accessibilityLabel="One-time code"
            class="flex-row items-center gap-2"
            groupClass="flex-row gap-2"
          />
        </DemoSection>
        <DemoSection title="Tone">
          <View style={{ flexDirection: "row", gap: 8 }}>
            <OtpInput
              length={1}
              value="7"
              tone="neutral"
              accessibilityLabel="Neutral tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
            <OtpInput
              length={1}
              value="7"
              tone="accent"
              accessibilityLabel="Accent tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
            <OtpInput
              length={1}
              value="7"
              tone="info"
              accessibilityLabel="Info tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
            <OtpInput
              length={1}
              value="7"
              tone="warn"
              accessibilityLabel="Warn tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
            <OtpInput
              length={1}
              value="7"
              tone="danger"
              accessibilityLabel="Danger tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
            <OtpInput
              length={1}
              value="7"
              tone="up"
              accessibilityLabel="Up tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
            <OtpInput
              length={1}
              value="7"
              tone="down"
              accessibilityLabel="Down tone"
              cells="w-9 h-11 text-lg"
              class="flex-row"
              groupClass="flex-row"
            />
          </View>
        </DemoSection>
        <DemoSection title="States">
          <OtpInput
            length={6}
            value="12"
            disabled
            accessibilityLabel="Disabled"
            class="flex-row items-center gap-2"
            groupClass="flex-row gap-2"
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
