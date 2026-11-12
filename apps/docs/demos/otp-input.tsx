import { mount, signal } from "nsh";

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
          />
        </DemoSection>
        <DemoSection title="Tone">
          <OtpInput length={6} value="123456" tone="up" accessibilityLabel="Accepted" />
          <OtpInput length={6} value="000000" tone="danger" accessibilityLabel="Rejected" />
        </DemoSection>
        <DemoSection title="States">
          <OtpInput length={6} value="12" disabled accessibilityLabel="Disabled" />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
