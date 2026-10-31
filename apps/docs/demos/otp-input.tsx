import { colors } from "@shadcn-nsh/theme";
import { OtpInput } from "../../../packages/ui/otp-input";
import { mount, signal, Text, View } from "nsh";

function App() {
  const code = signal("");
  const done = signal(false);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>OTP Input</Text>
      <OtpInput
        length={6}
        value={code()}
        onChange={({ value }) => {
          code.set(value);
          done.set(false);
        }}
        onComplete={({ value }) => {
          code.set(value);
          done.set(true);
        }}
      />
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {() => (done() ? `Complete: ${code()}` : `Code: ${code() || "—"}`)}
      </Text>
    </View>
  );
}

mount(App);
