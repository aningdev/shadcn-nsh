import { colors, toneColor, type Tone } from "@shadcn-nsh/theme";
// One-time code: the official gallery's three scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Verify`, `SignIn`, `Pin`) with this library's parts — six cells in two groups with a verdict, a code sent
// on request with a countdown and three tries, and a PIN chosen then confirmed.
import { Check, Clock } from "lucide";
import { cleanup, computed, platform, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { controlSize } from "@/packages/ui/lib/surface";
import { OtpInput, otpCells } from "@/packages/ui/otp-input";

import { Caption, DemoCard, DemoPage } from "../kit";

const CODE = "246810";
const SIGN_IN_CODE = "135790";

/** The code's message: a verdict in its tone once complete, the count so far before. */
function Message(props: { text: string; tone?: Tone }) {
  return (
    <Text
      style={{
        fontSize: controlSize.detail,
        color: props.tone ? toneColor(props.tone) : colors.mutedForeground,
      }}
    >
      {props.text}
    </Text>
  );
}

/** A secondary action that fills the width on a phone. */
function Action(props: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Button
      variant="secondary"
      disabled={props.disabled}
      onPress={props.onPress}
      style={platform.desktop ? undefined : { flex: 1 }}
    >
      {props.label}
    </Button>
  );
}

export function OtpInputDemo() {
  const last = signal("—");

  // Verify: a code checked the moment it is complete.
  const code = signal("");
  const verdict = signal<"typing" | "checking" | "right" | "wrong">("typing");
  // The timer lives in a signal: it is written after render, which a `let` would not allow.
  const check = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  cleanup(() => clearTimeout(check()));
  // A code the check refuses shakes the cells, as upstream's does.
  const verifyReject = signal(0);
  const pinReject = signal(0);
  const verify = (value: string) => {
    verdict.set("checking");
    clearTimeout(check());
    check.set(
      setTimeout(() => {
        const right = value === CODE;
        verdict.set(right ? "right" : "wrong");
        last.set(right ? "Verified" : "That code is not right");
        if (!right) verifyReject.update((n) => n + 1);
      }, 500),
    );
  };
  const verifyTone = (): Tone | undefined =>
    verdict() === "wrong" ? "destructive" : verdict() === "right" ? "success" : undefined;
  const verifyMessage = () =>
    verdict() === "right"
      ? "Verified"
      : verdict() === "wrong"
        ? "That code is not right"
        : verdict() === "checking"
          ? "Checking…"
          : `${code().length} of 6 digits`;

  // Sign in: the code is sent on request, and three tries are allowed.
  const [idle, sent, signingIn, wrongSignIn, locked, done] = [
    "idle",
    "sent",
    "signing",
    "wrong",
    "locked",
    "done",
  ] as const;
  type Phase =
    | typeof idle
    | typeof sent
    | typeof signingIn
    | typeof wrongSignIn
    | typeof locked
    | typeof done;
  const phase = signal<Phase>(idle);
  const signInCode = signal("");
  const left = signal(0);
  const tries = signal(3);
  const tick = signal<ReturnType<typeof setInterval> | undefined>(undefined);
  cleanup(() => clearInterval(tick()));
  const send = () => {
    phase.set(sent);
    tries.set(3);
    signInCode.set("");
    left.set(30);
    clearInterval(tick());
    tick.set(
      setInterval(() => {
        left.set(Math.max(0, left() - 1));
        if (left() === 0) clearInterval(tick());
      }, 1000),
    );
    last.set("Code sent");
  };
  const clock = (s: number) => `0:${String(s).padStart(2, "0")}`;
  const signInMessage = () =>
    phase() === done
      ? "Signed in"
      : phase() === locked
        ? "Too many tries: request a new code"
        : phase() === wrongSignIn
          ? `That code is not right: ${tries()} ${tries() === 1 ? "try" : "tries"} left`
          : phase() === signingIn
            ? "Signing in…"
            : phase() === sent
              ? `We sent a code to •••• 4821 (it is ${SIGN_IN_CODE})`
              : "We will text a code to +1 555 010 2299";

  // PIN: chosen, then confirmed.
  const pin = signal("");
  const chosen = signal<string | null>(null);
  const mismatch = signal(false);
  const shown = signal(false);
  const setPin = signal<string | null>(null);
  const step = computed(() => (chosen() === null ? 1 : 2));
  const pinDone = computed(() => setPin() !== null);

  return (
    <DemoPage title="OTP input" note={() => last()}>
      <DemoCard title="Verify" subtitle="Six cells in two groups; a verdict when complete">
        <View style={{ alignItems: "center", gap: 12 }}>
          <View style={{ gap: 4, alignItems: "center" }}>
            <Text
              style={{ fontSize: controlSize.label, fontWeight: "600", color: colors.foreground }}
            >
              Enter the code
            </Text>
            <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
              {`We sent it to •••• 4821 (it is ${CODE})`}
            </Text>
          </View>
          <OtpInput
            length={6}
            groups={2}
            value={code()}
            onChange={({ value }) => {
              code.set(value);
              verdict.set("typing");
            }}
            onComplete={({ value }) => verify(value)}
            accessibilityLabel="Verification code, 6 digits"
            class="flex-row items-center gap-3"
            groupClass="flex-row gap-1.5"
            cells={otpCells}
            tone={verifyTone}
            reject={verifyReject()}
          />
          <Message text={verifyMessage()} tone={verifyTone()} />
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignSelf: platform.desktop ? "auto" : "stretch",
            }}
          >
            <Action
              label="Clear"
              disabled={code() === ""}
              onPress={() => {
                code.set("");
                verdict.set("typing");
                last.set("Code cleared");
              }}
            />
            <Action
              label="Fill the right one"
              onPress={() => {
                code.set(CODE);
                verify(CODE);
              }}
            />
          </View>
        </View>
      </DemoCard>

      <DemoCard title="Sign in" subtitle="Sent on request, three tries, a countdown to resend">
        <View style={{ alignItems: "center", gap: 12 }}>
          <OtpInput
            length={6}
            groups={2}
            value={signInCode()}
            disabled={phase() === idle || phase() === done || phase() === locked}
            onChange={({ value }) => {
              signInCode.set(value);
              if (phase() === wrongSignIn) phase.set(sent);
            }}
            onComplete={({ value }) => {
              phase.set(signingIn);
              last.set("Checking the code");
              setTimeout(() => {
                if (value === SIGN_IN_CODE) {
                  phase.set(done);
                  last.set("Signed in");
                  return;
                }
                const left = tries() - 1;
                tries.set(left);
                if (left === 0) {
                  phase.set(locked);
                  last.set("Locked: too many tries");
                } else {
                  phase.set(wrongSignIn);
                  last.set(`Wrong code: ${left} left`);
                }
                signInCode.set("");
              }, 500);
            }}
            accessibilityLabel="Sign-in code, 6 digits"
            class="flex-row items-center gap-3"
            groupClass="flex-row gap-1.5"
            cells={otpCells}
            tone={() =>
              phase() === locked ? "destructive" : phase() === done ? "success" : undefined
            }
          />
          <Message
            text={signInMessage()}
            tone={phase() === locked ? "destructive" : phase() === done ? "success" : undefined}
          />
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignSelf: platform.desktop ? "auto" : "stretch",
            }}
          >
            {phase() === done ? (
              <Action
                label="Sign out"
                onPress={() => {
                  phase.set(idle);
                  signInCode.set("");
                  last.set("Signed out");
                }}
              />
            ) : (
              <>
                <Action
                  label={left() > 0 ? `Resend in ${clock(left())}` : "Send code"}
                  disabled={left() > 0 || phase() === locked}
                  onPress={send}
                />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Icon icon={Clock} size={12} tint={colors.mutedForeground} />
                  <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                    {`${tries()} ${tries() === 1 ? "try" : "tries"}`}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </DemoCard>

      <DemoCard title="Pin" subtitle="Chosen, then confirmed">
        <View style={{ alignItems: "center", gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Badge tone={pinDone() ? "success" : "neutral"}>
              {pinDone() ? "Set" : `Step ${step()} of 2`}
            </Badge>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Each of={[1, 2]}>
                {(n) => (
                  <View
                    style={{
                      width: 28,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: step() >= n() ? colors.brand : colors.muted,
                    }}
                  />
                )}
              </Each>
            </View>
          </View>
          <OtpInput
            reject={pinReject()}
            length={4}
            value={pin()}
            masked={!shown()}
            onChange={({ value }) => {
              pin.set(value);
              mismatch.set(false);
            }}
            onComplete={({ value }) => {
              if (chosen() === null) {
                chosen.set(value);
                pin.set("");
                last.set("PIN chosen: confirm it");
                return;
              }
              if (value === chosen()) {
                setPin.set(value);
                last.set("PIN set");
                return;
              }
              mismatch.set(true);
              chosen.set(null);
              pin.set("");
              pinReject.update((n) => n + 1);
              last.set("The two did not match: start again");
            }}
            accessibilityLabel="PIN, 4 digits"
            class="flex-row items-center gap-3"
            groupClass="flex-row gap-1.5"
            cells={otpCells}
            tone={() => (mismatch() ? "destructive" : setPin() !== null ? "success" : undefined)}
          />
          <Message
            text={
              mismatch()
                ? "The two did not match"
                : setPin() !== null
                  ? "Your PIN is set"
                  : chosen() === null
                    ? "Choose four digits"
                    : "Enter them again to confirm"
            }
            tone={mismatch() ? "destructive" : setPin() !== null ? "success" : undefined}
          />
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              alignSelf: platform.desktop ? "auto" : "stretch",
            }}
          >
            <Action
              label={shown() ? "Hide digits" : "Show digits"}
              onPress={() => {
                shown.set(!shown());
                last.set(shown() ? "Digits shown" : "Digits hidden");
              }}
            />
            <Action
              label={pinDone() ? "Change PIN" : "Start over"}
              onPress={() => {
                chosen.set(null);
                setPin.set(null);
                pin.set("");
                mismatch.set(false);
                last.set("PIN reset");
              }}
            />
          </View>
          <Caption>
            {pinDone()
              ? "The PIN is held; changing it asks for it twice again."
              : "The PIN is masked unless you show it."}
          </Caption>
          {pinDone() ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Icon icon={Check} size={14} tint={toneColor("success")} />
              <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                Set on this device
              </Text>
            </View>
          ) : null}
        </View>
      </DemoCard>
    </DemoPage>
  );
}
