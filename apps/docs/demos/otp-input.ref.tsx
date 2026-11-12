// The reference of `otp-input.tsx`: the look on `nsh/base`'s OtpInput.
import type { Tone } from "@shadcn-nsh/theme";
import { mount, signal, View } from "nsh";
import { OtpInput } from "nsh/base";

import { otpCellLook } from "@/packages/ui/otp-input";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const TONES: Tone[] = ["neutral", "accent", "info", "warn", "danger", "up", "down"];

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
            {...otpCellLook()}
          />
        </DemoSection>
        <DemoSection title="Tone">
          <View style={{ flexDirection: "row", gap: 8 }}>
            {TONES.map((tone) => (
              <OtpInput
                length={1}
                value="7"
                accessibilityLabel={`${tone} tone`}
                {...otpCellLook({ cells: "w-9 h-11 text-lg", tone })}
              />
            ))}
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
            {...otpCellLook()}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
