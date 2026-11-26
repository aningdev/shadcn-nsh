import { alpha, colors, toneColor, type Tone } from "@shadcn-nsh/theme";
// Input: the official gallery's form scenes (`references/nsh/examples/gallery/demos/Form.tsx`,
// `Form`, `Search`, `SelectionDemo`) with this library's parts — a field that checks itself as it is
// typed, input groups with a prefix and a suffix, a search that waits for the typing to stop, and
// the text a field carries (uppercased, read-only, disabled, a growing message).
import { Check, CircleX, Eye, EyeOff, Lock, Mail, Search } from "lucide";
import type { InputRef, JSX } from "nsh";
import { cleanup, computed, platform, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/packages/ui/input-group";
import { Icon } from "@/packages/ui/lib/icons";
import { createRejectShake } from "@/packages/ui/lib/motion";
import { controlSize, narrowWindow } from "@/packages/ui/lib/surface";
import { Progress } from "@/packages/ui/progress";

import { Caption, DemoCard, DemoPage } from "../kit";

const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** What a strong password has, each checked on its own. */
/** The four segments of the strength bar. */
const SEGMENTS = [0, 1, 2, 3];

const rules: { label: string; test: (p: string) => boolean }[] = [
  { label: "8 or more characters", test: (p) => p.length >= 8 },
  { label: "Upper and lower case", test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "A number", test: (p) => /\d/.test(p) },
  { label: "A symbol", test: (p) => /[^\w\s]/.test(p) },
];
const strength = (p: string) => (p.length === 0 ? 0 : rules.filter((r) => r.test(p)).length);
const strengthLabel = ["Empty", "Weak", "Fair", "Good", "Strong"];
const strengthTones: Tone[] = ["neutral", "destructive", "warning", "info", "success"];

const places = [
  { name: "Amsterdam", country: "Netherlands", zone: "UTC+1" },
  { name: "Berlin", country: "Germany", zone: "UTC+1" },
  { name: "Hong Kong", country: "China", zone: "UTC+8" },
  { name: "Lisbon", country: "Portugal", zone: "UTC±0" },
  { name: "London", country: "United Kingdom", zone: "UTC±0" },
  { name: "Long Beach", country: "United States", zone: "UTC−8" },
  { name: "Los Angeles", country: "United States", zone: "UTC−8" },
  { name: "Melbourne", country: "Australia", zone: "UTC+11" },
  { name: "Montréal", country: "Canada", zone: "UTC−5" },
  { name: "New York", country: "United States", zone: "UTC−5" },
  { name: "Oslo", country: "Norway", zone: "UTC+1" },
  { name: "Paris", country: "France", zone: "UTC+1" },
  { name: "Seoul", country: "South Korea", zone: "UTC+9" },
  { name: "Singapore", country: "Singapore", zone: "UTC+8" },
  { name: "Tokyo", country: "Japan", zone: "UTC+9" },
];
const DEBOUNCE = 300;

/** A field's label above it, what describes it below: a hint, an error, or its count. */
function Field(props: {
  label: string;
  /** A count on the label's row, at its end (a field nearing its limit). */
  side?: string;
  sideColor?: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  note?: string;
  children: JSX.Element;
}) {
  const tone = props.error ? toneColor("destructive") : colors.mutedForeground;
  return (
    <View style={{ gap: 6, flex: 1, minWidth: 0 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: 12.5, fontWeight: "500", color: colors.foreground }}>
          {props.label}
        </Text>
        {props.side ? (
          <Text
            style={{
              fontSize: 12,
              color: props.sideColor ?? colors.mutedForeground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {props.side}
          </Text>
        ) : null}
      </View>
      {props.children}
      {props.error ? (
        <Text style={{ fontSize: 12, color: tone }}>{props.error}</Text>
      ) : props.hint || props.valid ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          {props.valid ? <Icon icon={Check} size={12} tint={toneColor("success")} /> : null}
          <Text
            style={{
              fontSize: 12,
              color: props.valid ? toneColor("success") : colors.mutedForeground,
            }}
          >
            {props.hint ?? "Looks good"}
          </Text>
        </View>
      ) : props.note ? (
        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{props.note}</Text>
      ) : null}
    </View>
  );
}

/** Two fields side by side, equal widths; one above the other when the window is narrow. */
function Pair(props: { children: JSX.Element }) {
  return (
    <View style={{ flexDirection: narrowWindow() ? "column" : "row", gap: 8 }}>
      {props.children}
    </View>
  );
}

/** A password's strength: four segments that fill in turn, its word, and the rules ticking as met. */
function Strength(props: { password: string }) {
  const score = computed(() => strength(props.password));
  const tone = computed(() => (score() ? toneColor(strengthTones[score()]) : colors.faint));
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, flexDirection: "row", gap: 4 }}>
          <Each of={SEGMENTS} key="index">
            {(i) => (
              <View
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: score() > i() ? tone() : alpha(colors.foreground, 0.1),
                }}
              />
            )}
          </Each>
        </View>
        <Text
          style={{
            width: 52,
            textAlign: "end",
            fontSize: 12,
            fontWeight: "500",
            color: tone(),
          }}
        >
          {strengthLabel[score()]}
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 6, columnGap: 14 }}>
        <Each of={rules}>
          {(rule) => {
            const met = rule().test(props.password);
            return (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View
                  style={{ width: 14, height: 14, alignItems: "center", justifyContent: "center" }}
                >
                  {met ? (
                    <Icon icon={Check} size={13} tint={toneColor("success")} />
                  ) : (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: colors.faint,
                      }}
                    />
                  )}
                </View>
                <Text
                  style={{ fontSize: 12, color: met ? colors.foreground : colors.mutedForeground }}
                >
                  {rule().label}
                </Text>
              </View>
            );
          }}
        </Each>
      </View>
    </View>
  );
}

export function InputDemo() {
  const last = signal("—");

  const name = signal("");
  const email = signal("");
  const password = signal("");
  const reveal = signal(false);
  const touched = signal<Record<string, boolean>>({});
  const touch = (key: string) => () => touched.update((t) => ({ ...t, [key]: true }));
  const nameError = computed(() =>
    touched().name && !name().trim() ? "Enter your name" : undefined,
  );
  const emailError = computed(() =>
    touched().email && !emailPattern.test(email())
      ? email()
        ? "That address needs an @ and a domain"
        : "Enter your e-mail"
      : undefined,
  );
  const passwordError = computed(() =>
    touched().password && password().length < 8 ? "Use at least 8 characters" : undefined,
  );
  const creating = signal(false);
  const created = signal<string | null>(null);
  // A submit the fields refuse shakes each one that failed. The name is an `Input`; the e-mail and
  // the password sit in groups, which draw `nsh/base`'s field, so they shake through the same helper.
  const refused = signal(0);
  const emailShake = createRejectShake(() => (emailError() ? refused() : undefined));
  const passwordShake = createRejectShake(() => (passwordError() ? refused() : undefined));
  // The timers live in signals: they are written after render, which a `let` would not allow.
  const pending = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  cleanup(() => clearTimeout(pending()));
  const submit = () => {
    touched.set({ name: true, email: true, password: true });
    const issues = [nameError(), emailError(), passwordError()].filter(Boolean).length;
    if (issues) {
      created.set(`${issues} ${issues === 1 ? "field needs" : "fields need"} attention`);
      last.set(`${issues} fields need attention`);
      refused.update((n) => n + 1);
      return;
    }
    created.set(null);
    creating.set(true);
    pending.set(
      setTimeout(() => {
        creating.set(false);
        created.set(`Account created for ${name()} <${email()}>`);
        last.set(`Account created for ${name()}`);
      }, 700),
    );
  };

  // Numbers: what each keyboard is for.
  const age = signal("");
  const amount = signal("");
  const offset = signal("");
  const code = signal("");

  // Selection: what is selected and what was pressed, reported by the input itself.
  const passage = signal("Select part of this text");
  const range = signal({ start: 0, end: 0 });
  const keys = signal<string[]>([]);
  const chosen = signal<{ start: number; end?: number } | undefined>(undefined);
  const caret = signal<InputRef | undefined>(undefined);

  const site = signal("");
  const price = signal("");
  const discount = signal("");
  const handle = signal("");

  const query = signal("");
  const settled = signal("");
  const pendingSearch = signal(false);
  const timer = signal<ReturnType<typeof setTimeout> | undefined>(undefined);
  cleanup(() => clearTimeout(timer()));
  const queryRef = signal<InputRef | undefined>(undefined);
  const change = (value: string) => {
    query.set(value);
    clearTimeout(timer());
    if (!value.trim()) {
      settled.set("");
      pendingSearch.set(false);
      return;
    }
    pendingSearch.set(true);
    timer.set(
      setTimeout(() => {
        settled.set(value.trim());
        pendingSearch.set(false);
      }, DEBOUNCE),
    );
  };
  const results = computed(() => {
    const q = settled().toLowerCase();
    return q
      ? places
          .filter((p) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q))
          .slice(0, 6)
      : [];
  });
  const marked = (city: string) => {
    const at = city.toLowerCase().indexOf(settled().toLowerCase());
    if (at < 0) return <Text>{city}</Text>;
    const end = at + settled().length;
    return (
      <Text>
        {city.slice(0, at)}
        <Text style={{ fontWeight: "700", color: colors.brand }}>{city.slice(at, end)}</Text>
        {city.slice(end)}
      </Text>
    );
  };

  const shout = signal("");
  const notes = signal("");
  const grown = signal("–");

  return (
    <DemoPage title="Input" note={() => last()}>
      <DemoCard title="Account" subtitle="Each field checks itself as it is typed">
        <View style={{ gap: 12 }}>
          <Field
            label="Name"
            error={nameError()}
            valid={name().trim().length > 1}
            hint="At least two characters"
          >
            <Input
              value={name()}
              accessibilityLabel="Name"
              autoCapitalize="words"
              placeholder="Ada Lovelace"
              onChange={({ value }) => name.set(value)}
              onBlur={touch("name")}
              invalid={!!nameError()}
              reject={nameError() ? refused() : undefined}
            />
          </Field>
          <Field
            label="E-mail"
            error={emailError()}
            valid={emailPattern.test(email())}
            hint="ada@example.com"
          >
            <View style={emailShake.style()}>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <Icon icon={Mail} size={14} tint={colors.faint} />
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  value={email()}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="ada@example.com"
                  accessibilityLabel="E-mail"
                  onChange={({ value }) => {
                    email.set(value);
                    touched.update((t) => ({ ...t, email: true }));
                  }}
                />
              </InputGroup>
            </View>
          </Field>
          <View style={{ gap: 8 }}>
            <Field label="Password" error={passwordError()} hint="8 characters or more">
              <View style={passwordShake.style()}>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>
                      <Icon icon={Lock} size={14} tint={colors.faint} />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    value={password()}
                    masked={!reveal()}
                    accessibilityLabel="Password"
                    placeholder="At least 8 characters"
                    onChange={({ value }) => {
                      password.set(value);
                      touched.update((t) => ({ ...t, password: true }));
                    }}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      accessibilityLabel={reveal() ? "Hide the password" : "Show the password"}
                      onPress={() => reveal.set(!reveal())}
                    >
                      <Icon
                        icon={reveal() ? EyeOff : Eye}
                        size={14}
                        tint={colors.mutedForeground}
                      />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </View>
            </Field>
            <Strength password={password()} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Button busy={creating()} onPress={submit}>
              {creating() ? "Creating…" : "Create account"}
            </Button>
            {created() ? (
              <Text
                style={{
                  flex: 1,
                  fontSize: controlSize.detail,
                  color: created()!.includes("created")
                    ? toneColor("success")
                    : toneColor("destructive"),
                }}
              >
                {created()!}
              </Text>
            ) : (
              <Caption>Submitting checks every field</Caption>
            )}
          </View>
        </View>
      </DemoCard>

      <DemoCard title="Input groups" subtitle="A prefix and a suffix: they belong to the field">
        <View style={{ gap: 12 }}>
          <Field label="Site address" hint="https://my-team.nsh.dev">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>https://</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                value={site()}
                autoCapitalize="none"
                placeholder="my-team"
                accessibilityLabel="Site address"
                onChange={({ value }) => {
                  site.set(value);
                  last.set(`Site address: ${value || "empty"}`);
                }}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>.nsh.dev</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <Pair>
            <Field label="Price">
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  value={price()}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  accessibilityLabel="Price"
                  onChange={({ value }) => price.set(value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>USD</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field label="Discount">
              <InputGroup>
                <InputGroupInput
                  value={discount()}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="15"
                  accessibilityLabel="Discount"
                  onChange={({ value }) => discount.set(value)}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>%</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </Pair>
          <Field label="Handle" hint="@ada on the community">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>@</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                value={handle()}
                autoCapitalize="none"
                placeholder="ada"
                accessibilityLabel="Handle"
                onChange={({ value }) => handle.set(value)}
              />
            </InputGroup>
          </Field>
        </View>
      </DemoCard>

      <DemoCard title="Search" subtitle={`Results ${DEBOUNCE} ms after the typing stops`}>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <Icon icon={Search} size={14} tint={colors.faint} />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            ref={(node) => queryRef.set(node)}
            value={query()}
            autoCapitalize="none"
            placeholder="Search cities or countries"
            accessibilityLabel="Search cities"
            onChange={({ value }) => change(value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              accessibilityLabel="Clear the search"
              disabled={query().length === 0}
              onPress={() => {
                change("");
                queryRef()?.focus();
              }}
            >
              <Icon icon={CircleX} size={14} tint={colors.mutedForeground} />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <View style={{ gap: 6, marginTop: 8 }}>
          {pendingSearch() ? (
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Searching…</Text>
          ) : null}
          {settled() === "" ? (
            <Caption>Try “lon”, “united” or “o”</Caption>
          ) : results().length === 0 ? (
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {`No city or country matches “${settled()}”.`}
            </Text>
          ) : (
            <Each of={results()} key="index">
              {(place, i) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    minHeight: platform.desktop ? 32 : 44,
                    borderTopWidth: i() === 0 ? 0 : 1,
                    borderColor: colors.line,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: controlSize.label, color: colors.foreground }}>
                    {marked(place().name)}
                    <Text style={{ color: colors.mutedForeground }}> · </Text>
                    <Text style={{ color: colors.mutedForeground }}>{place().country}</Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.faint,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {place().zone}
                  </Text>
                </View>
              )}
            </Each>
          )}
        </View>
      </DemoCard>

      <DemoCard title="Numbers" subtitle="Each field asks the keyboard it needs">
        <View style={{ gap: 12 }}>
          <Pair>
            <Field label="Age" hint="3 digits">
              <Input
                value={age()}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="36"
                accessibilityLabel="Age"
                onChange={({ value }) => {
                  age.set(value);
                  last.set(`Age: ${value || "empty"}`);
                }}
              />
            </Field>
            <Field label="Amount" hint="Decimals">
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>$</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  value={amount()}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  accessibilityLabel="Amount"
                  onChange={({ value }) => amount.set(value)}
                />
              </InputGroup>
            </Field>
          </Pair>
          <Field label="Offset" hint="Negative values, punctuation">
            <Input
              value={offset()}
              keyboardType="numbers-and-punctuation"
              placeholder="-12.5"
              accessibilityLabel="Offset"
              onChange={({ value }) => offset.set(value)}
            />
          </Field>
          <Field label="Verification code" hint={`${code().length}/6`}>
            <Input
              value={code()}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="······"
              accessibilityLabel="Code"
              style={{
                letterSpacing: 10,
                fontSize: 22,
                fontWeight: "500",
                fontVariant: ["tabular-nums"],
                textAlign: "center",
              }}
              onChange={({ value }) => {
                code.set(value);
                last.set(`Code: ${value.length} of 6`);
              }}
            />
          </Field>
        </View>
      </DemoCard>

      <DemoCard title="Selection" subtitle="What the caret and the keys report, as they happen">
        <View style={{ gap: 12 }}>
          <Field label="Passage" hint={`${range().start}–${range().end}`}>
            <Input
              ref={(node) => caret.set(node)}
              value={passage()}
              selectedRange={chosen()}
              autoComplete="off"
              accessibilityLabel="Passage"
              onChange={({ value }) => {
                passage.set(value);
                chosen.set(undefined);
              }}
              onSelectionChange={({ start, end }) => range.set({ start, end })}
              onKeyPress={({ key }) => keys.set([...keys(), key].slice(-8))}
            />
          </Field>
          <Caption>
            {range().end > range().start
              ? `Selected: “${passage().slice(range().start, range().end)}”`
              : "Select part of the passage"}
          </Caption>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            {keys().length === 0 ? (
              <Text style={{ fontSize: controlSize.detail, color: colors.faint }}>
                Keys you press show here
              </Text>
            ) : (
              <Each of={keys()}>
                {(key) => (
                  <View
                    style={{
                      minWidth: 24,
                      height: 24,
                      paddingHorizontal: 7,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.foreground }}>
                      {key() === " " ? "␣" : key()}
                    </Text>
                  </View>
                )}
              </Each>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              variant="secondary"
              onPress={() => {
                chosen.set({ start: 0, end: passage().length });
                last.set("Selected all of it");
              }}
            >
              Select all
            </Button>
            <Button
              variant="secondary"
              onPress={() => {
                caret()?.setSelection(0, 0);
                last.set("Caret to the start");
              }}
            >
              Caret to start
            </Button>
          </View>
        </View>
      </DemoCard>

      <DemoCard title="Text" subtitle="Uppercased, read only, disabled, a message that grows">
        <View style={{ gap: 12 }}>
          <Field label="Controlled" hint="Uppercased as you type">
            <Input
              value={shout()}
              accessibilityLabel="Controlled"
              placeholder="TYPE IN LOWER CASE"
              onChange={({ value }) => {
                shout.set(value.toUpperCase());
                last.set(`Shout: ${value.toUpperCase() || "empty"}`);
              }}
            />
          </Field>
          <Pair>
            <Field label="Read only">
              <Input value="Selectable, not editable" readonly accessibilityLabel="Read only" />
            </Field>
            <Field label="Disabled">
              <Input value="Set by your admin" disabled accessibilityLabel="Disabled" />
            </Field>
          </Pair>
          <View style={{ gap: 10 }}>
            <Field
              label="Message"
              side={`${notes().length}/280`}
              sideColor={
                notes().length >= 280
                  ? toneColor("destructive")
                  : notes().length > 250
                    ? toneColor("warning")
                    : undefined
              }
            >
              <Input
                value={notes()}
                multiline
                maxLength={280}
                placeholder="Return adds a line"
                accessibilityLabel="Message"
                style={{ minHeight: 88 }}
                onChange={({ value }) => notes.set(value)}
              />
            </Field>
            {/* The bar's end is the field's 280: no limit to stand on it. */}
            <Progress
              value={(notes().length / 280) * 100}
              tone={
                notes().length >= 280 ? "destructive" : notes().length > 250 ? "warning" : "accent"
              }
            />
          </View>
          <Field label="Grows with its text" hint={grown()}>
            <Input
              multiline
              grow
              placeholder="Type several lines"
              onContentSizeChange={(e) => {
                grown.set(`${Math.round(e.size.width)}×${Math.round(e.size.height)}`);
              }}
            />
          </Field>
        </View>
      </DemoCard>
    </DemoPage>
  );
}
