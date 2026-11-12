// The reference of `otp-input.tsx`: the look on `nsh/base`'s OtpInput.
import { mount, signal } from "nsh";
import { OtpInput } from "nsh/base";

import { otpCellLook } from "@/packages/ui/otp-input";

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
            {...otpCellLook()}
          />
        </DemoSection>
        <DemoSection title="Tone">
          <OtpInput
            length={6}
            value="123456"
            accessibilityLabel="Accepted"
            {...otpCellLook({ tone: "up" })}
          />
          <OtpInput
            length={6}
            value="000000"
            accessibilityLabel="Rejected"
            {...otpCellLook({ tone: "danger" })}
          />
        </DemoSection>
        <DemoSection title="States">
          <OtpInput
            length={6}
            value="12"
            disabled
            accessibilityLabel="Disabled"
            {...otpCellLook()}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
