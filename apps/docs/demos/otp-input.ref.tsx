// The reference of `otp-input.tsx`: the same scene as upstream writes it, `otpCellLook` spread on
// `nsh/base`'s OtpInput. The render check requires the two to draw the same pixels.
import { colors } from "@shadcn-nsh/theme";
import { Clipboard, cleanup, mount, signal, Text, View } from "nsh";
import { Button, OtpInput, Switch } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { listRow, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { otpCells, otpCellLook } from "@/packages/ui/otp-input";
import { switchLook } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const CODE = "246810";
const TONES = ["neutral", "accent", "info", "warn", "danger", "up", "down"] as const;
type Tone = (typeof TONES)[number];

/** A switch with its label, the row reversed so the track trails. */
function Option(props: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <Switch
      checked={props.checked}
      onChange={({ checked }) => props.onChange(checked)}
      {...listRow({ first: true, style: { flexDirection: "row-reverse" } })}
      {...switchLook(() => props.checked)}
    >
      <RowLabel label={props.label} />
    </Switch>
  );
}

/** A secondary action beside the code (a sheet's pair on a phone). */
function Action(props: { label: string; disabled?: boolean; onPress: () => void }) {
  return (
    <Button
      disabled={props.disabled}
      onPress={props.onPress}
      {...buttonLook("secondary", {
        disabled: () => !!props.disabled,
        style: desktop ? undefined : { flex: 1 },
      })}
    >
      <Text style={buttonLabel("secondary", { disabled: () => !!props.disabled })}>
        {props.label}
      </Text>
    </Button>
  );
}

function App() {
  const code = signal("");
  const masked = signal(false);
  const disabled = signal(false);
  const status = signal<"typing" | "checking" | "right" | "wrong">("typing");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  // Checking the code takes a moment, as a server's answer does.
  let check: ReturnType<typeof setTimeout> | undefined;
  cleanup(() => clearTimeout(check));
  const verify = (value: string) => {
    status.set("checking");
    clearTimeout(check);
    check = setTimeout(() => status.set(value === CODE ? "right" : "wrong"), 600);
  };
  const message = () =>
    ({
      typing: { text: `${code().length} of 6 digits`, color: colors.muted },
      checking: { text: "Checking…", color: colors.muted },
      right: { text: "Verified", color: colors.up },
      wrong: { text: "That code is not right", color: colors.down },
    })[status()];
  const verdict = (): Tone | undefined =>
    status() === "wrong" ? "danger" : status() === "right" ? "up" : undefined;

  return (
    <DemoPage title="OTP Input">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click the code and type it, or paste it; Tab reaches it too"
          : "Tap the code to type it, or paste it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="value · masked · disabled">
              <Text style={{ fontSize: 13, color: colors.text, fontVariant: ["tabular-nums"] }}>
                {code()
                  ? `value “${masked() ? "•".repeat(code().length) : code()}”`
                  : "value “” (empty)"}
              </Text>
              <Option
                label="Masked"
                checked={masked()}
                onChange={(next) => {
                  masked.set(next);
                  log(next ? "masked: bullets, a secure field" : "masked off");
                }}
              />
              <Option
                label="Disabled"
                checked={disabled()}
                onChange={(next) => {
                  disabled.set(next);
                  log(next ? "disabled: no focus" : "enabled");
                }}
              />
            </Panel>
            <Log
              title="onChange · onComplete · onFocus · onBlur"
              lines={events()}
              minHeight={120}
            />
          </>
        }
      >
        <View
          style={{
            ...sectionSurface(),
            padding: desktop ? 20 : 16,
            gap: 16,
            alignItems: "center",
          }}
        >
          <View style={{ gap: 4, alignItems: "center" }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>
              Enter the code
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              {`We sent it to •••• 4821 (it is ${CODE})`}
            </Text>
          </View>
          <OtpInput
            length={6}
            groups={2}
            value={code()}
            masked={masked()}
            disabled={disabled()}
            onChange={({ value: next }) => {
              code.set(next);
              status.set("typing");
              log(`onChange “${next}”`);
            }}
            onComplete={({ value }) => {
              log(`onComplete “${value}”`);
              verify(value);
            }}
            onFocus={() => log("onFocus")}
            onBlur={() => log("onBlur")}
            accessibilityLabel="Verification code, 6 digits"
            class="flex-row items-center gap-3"
            groupClass="flex-row gap-1.5"
            {...otpCellLook({ tone: verdict })}
          />
          <Text style={{ fontSize: 12, color: message().color }}>{message().text}</Text>
          <View class={desktop ? "flex-row gap-2" : "flex-row gap-2 self-stretch"}>
            <Action
              label="Copy the code"
              onPress={() => {
                Clipboard.writeText(CODE);
                log("copied: paste it into the code");
              }}
            />
            <Action
              label="Clear"
              disabled={code() === ""}
              onPress={() => {
                code.set("");
                status.set("typing");
                log("value set to “”");
              }}
            />
          </View>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Tone">
          {TONES.map((tone) => (
            <OtpInput
              length={1}
              value="7"
              accessibilityLabel={`${tone} tone`}
              class="flex-row"
              groupClass="flex-row"
              {...otpCellLook({ cells: otpCells, tone })}
            />
          ))}
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
