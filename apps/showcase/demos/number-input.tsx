import { colors, toneColor } from "@shadcn-nsh/theme";
// Number input: the official gallery's three scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Quantities`, `Cart`, `Units`) with this library's parts — seats typed or stepped inside a range, a cart
// held to its stock with totals that follow, and the awkward units a number carries.
import { Check } from "lucide";
import type { JSX } from "nsh";
import { computed, platform, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Roll } from "@/packages/ui/lib/motion";
import { controlSize, narrowWindow, RowLabel } from "@/packages/ui/lib/surface";
import { NumberInput } from "@/packages/ui/number-input";
import { Progress } from "@/packages/ui/progress";

import { DemoCard, DemoPage } from "../kit";

const CART = [
  { name: "Linen shirt", detail: "Sand, M", price: 48, stock: 10 },
  { name: "Canvas tote", detail: "Natural", price: 22, stock: 3 },
  { name: "Wool socks", detail: "Pack of 3", price: 14, stock: 20 },
];
const FREE_SHIPPING = 150;
const SHIPPING = 8;

/** A price as money: `$48`, `$24.50`. */
const money = (n: number) => `$${Number.isInteger(n) ? n.toLocaleString("en-US") : n.toFixed(2)}`;
const show = (v: number | null) => (v === null ? "none" : `${v}`);

/** A label and its field on one line, a hairline between the rows. */
function Row(props: { label: string; detail: string; first?: boolean; children: JSX.Element }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        borderTopWidth: props.first ? 0 : 1,
        borderColor: colors.line,
      }}
    >
      <RowLabel label={props.label} detail={props.detail} />
      {props.children}
    </View>
  );
}

/** A number field's width: its steppers need room beside a row's label. */
const fieldWidth = () => (narrowWindow() ? 148 : 120);
/** The transfer's field: a currency sign before the field and a unit after it leave the number its own room. */
const transferWidth = () => (narrowWindow() ? 168 : 156);

/** A bill's line: what it is on the left, what it costs on the right. The amount rolls (`Roll`). */
function BillLine(props: { label: string; amount: number; total?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <Text
        style={{
          fontSize: controlSize.label,
          fontWeight: props.total ? "600" : "400",
          color: props.total ? colors.foreground : colors.mutedForeground,
        }}
      >
        {props.label}
      </Text>
      <Roll
        value={props.amount}
        style={{
          fontSize: controlSize.label,
          fontWeight: props.total ? "600" : "400",
          color: colors.foreground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.amount === 0 ? "Free" : money(props.amount)}
      </Roll>
    </View>
  );
}

export function NumberInputDemo() {
  const last = signal("—");
  const seats = signal<number | null>(2);
  const price = signal<number | null>(24.5);
  const locked = signal(false);

  const qty = signal<(number | null)[]>([1, 2, 3]);
  const subtotal = computed(() => CART.reduce((n, c, i) => n + c.price * (qty()[i] ?? 0), 0));
  const toFree = computed(() => Math.max(0, FREE_SHIPPING - subtotal()));
  const shipping = computed(() => (toFree() === 0 ? 0 : SHIPPING));
  const reached = computed(() => Math.min(100, (subtotal() / FREE_SHIPPING) * 100));
  const items = computed(() => qty().reduce<number>((n, q) => n + (q ?? 0), 0));

  const tip = signal<number | null>(15);
  const transfer = signal<number | null>(250);
  const temperature = signal<number | null>(21.5);
  const BILL = 84;
  const BALANCE = 1200;
  const overBalance = computed(() => transfer() !== null && transfer()! > BALANCE);
  const feel = computed(() => {
    const t = temperature();
    if (t === null) return { label: "Not set", tone: "neutral" as const };
    if (t < 19) return { label: "Cool", tone: "info" as const };
    if (t > 23) return { label: "Warm", tone: "warning" as const };
    return { label: "Comfortable", tone: "success" as const };
  });

  return (
    <DemoPage title="Number input" note={() => last()}>
      <DemoCard title="Number input" subtitle="Typed or stepped: the app owns the value">
        <View>
          <Row first label="Seats" detail="1 to 8 per booking">
            <View style={{ width: fieldWidth() }}>
              <NumberInput
                steps="split"
                value={seats()}
                min={1}
                max={8}
                disabled={locked()}
                accessibilityLabel="Seats"
                inputStyle={{ textAlign: "center", paddingHorizontal: 4 }}
                onChange={({ value }) => {
                  seats.set(value);
                  last.set(`Seats: ${show(value)}`);
                }}
              />
            </View>
          </Row>
          <Row label="Price" detail="Steps of 0.5">
            <View style={{ width: fieldWidth() }}>
              <NumberInput
                value={price()}
                min={0}
                step={0.5}
                placeholder="Free"
                accessibilityLabel="Price"
                prefix={
                  <Text
                    style={{
                      alignSelf: "center",
                      paddingLeft: 8,
                      fontSize: controlSize.label,
                      color: colors.mutedForeground,
                    }}
                  >
                    $
                  </Text>
                }
                onChange={({ value }) => {
                  price.set(value);
                  last.set(`Price: ${show(value)}`);
                }}
              />
            </View>
          </Row>
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
          <Button
            variant="secondary"
            style={platform.desktop ? undefined : { flex: 1 }}
            onPress={() => {
              locked.set(!locked());
              last.set(locked() ? "Seats: locked" : "Seats: unlocked");
            }}
          >
            {locked() ? "Unlock seats" : "Lock seats"}
          </Button>
        </View>
      </DemoCard>

      <DemoCard title="Cart" subtitle="Held to the stock; totals roll to new values">
        <View>
          <Each of={CART} key="index">
            {(item, i) => {
              const n = () => qty()[i()];
              const atStock = () => n() !== null && n()! >= item().stock;
              return (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 8,
                    borderTopWidth: i() === 0 ? 0 : 1,
                    borderColor: colors.line,
                  }}
                >
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text
                      style={{
                        numberOfLines: 1,
                        fontSize: controlSize.label,
                        color: colors.foreground,
                      }}
                    >
                      {item().name}
                    </Text>
                    <Text
                      style={{
                        fontSize: controlSize.detail,
                        color: atStock() ? toneColor("warning") : colors.mutedForeground,
                      }}
                    >
                      {atStock()
                        ? `Only ${item().stock} left`
                        : `${item().detail} · ${money(item().price)}`}
                    </Text>
                  </View>
                  <View style={{ width: platform.desktop ? 104 : 136 }}>
                    <NumberInput
                      steps="split"
                      value={n()}
                      min={1}
                      max={item().stock}
                      accessibilityLabel={`Quantity of ${item().name}`}
                      inputStyle={{ textAlign: "center", paddingHorizontal: 4 }}
                      onChange={({ value }) => {
                        const next = qty().slice();
                        next[i()] = value;
                        qty.set(next);
                        last.set(`${item().name}: ${value ?? "none"}`);
                      }}
                    />
                  </View>
                  <View style={{ width: platform.desktop ? 64 : 56, alignItems: "flex-end" }}>
                    <Roll
                      value={item().price * (n() ?? 0)}
                      style={{
                        fontSize: controlSize.label,
                        color: colors.foreground,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {money(item().price * (n() ?? 0))}
                    </Roll>
                  </View>
                </View>
              );
            }}
          </Each>
        </View>
        <View style={{ gap: 6, marginTop: 6 }}>
          <Progress
            value={reached()}
            height={4}
            tone={toFree() === 0 ? "success" : undefined}
            accessibilityLabel="Toward free shipping"
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {toFree() === 0 ? <Icon icon={Check} size={14} tint={toneColor("success")} /> : null}
            <Text
              style={{
                fontSize: controlSize.detail,
                color: toFree() === 0 ? toneColor("success") : colors.mutedForeground,
              }}
            >
              {toFree() === 0
                ? "Free shipping unlocked"
                : `Add ${money(toFree())} more for free shipping`}
            </Text>
          </View>
        </View>
        <View style={{ gap: 6, paddingTop: 10, borderTopWidth: 1, borderColor: colors.line }}>
          <BillLine label={`Subtotal (${items()} items)`} amount={subtotal()} />
          <BillLine label="Shipping" amount={shipping()} />
          <BillLine label="Total" amount={subtotal() + shipping()} total />
        </View>
      </DemoCard>

      <DemoCard title="Units and limits" subtitle="A percentage, a currency, half degrees, a rate">
        <View>
          <Row
            first
            label="Tip"
            detail={`${money(Math.round((BILL * (tip() ?? 0)) / 100))} on a ${money(BILL)} bill`}
          >
            <View style={{ width: fieldWidth() }}>
              <NumberInput
                value={tip()}
                min={0}
                max={30}
                step={5}
                accessibilityLabel="Tip"
                suffix={
                  <Text
                    style={{
                      alignSelf: "center",
                      paddingRight: 8,
                      fontSize: controlSize.label,
                      color: colors.mutedForeground,
                    }}
                  >
                    %
                  </Text>
                }
                onChange={({ value }) => {
                  tip.set(value);
                  last.set(`Tip: ${value === null ? "none" : `${value}%`}`);
                }}
              />
            </View>
          </Row>
          <Row
            label="Transfer"
            detail={
              overBalance()
                ? `More than the balance of ${money(BALANCE)}`
                : "$10 to $5,000, in steps of $50"
            }
          >
            <View style={{ width: transferWidth() }}>
              <NumberInput
                value={transfer()}
                min={10}
                max={5000}
                step={50}
                accessibilityLabel="Transfer"
                class={overBalance() ? "border-destructive" : undefined}
                prefix={
                  <Text
                    style={{
                      alignSelf: "center",
                      paddingLeft: 8,
                      fontSize: controlSize.label,
                      color: colors.mutedForeground,
                    }}
                  >
                    $
                  </Text>
                }
                suffix={
                  <Text
                    style={{
                      alignSelf: "center",
                      paddingRight: 8,
                      fontSize: 12,
                      color: colors.mutedForeground,
                    }}
                  >
                    USD
                  </Text>
                }
                onChange={({ value }) => {
                  transfer.set(value);
                  last.set(`Transfer: ${show(value)}`);
                }}
              />
            </View>
          </Row>
          <Row label="Thermostat" detail="Halves of a degree">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: toneColor(feel().tone),
                }}
              />
              <Text
                style={{
                  fontSize: controlSize.detail,
                  color: toneColor(feel().tone),
                  width: narrowWindow() ? undefined : 84,
                }}
              >
                {feel().label}
              </Text>
              <View style={{ width: fieldWidth() }}>
                <NumberInput
                  value={temperature()}
                  min={16}
                  max={28}
                  step={0.5}
                  accessibilityLabel="Thermostat"
                  suffix={
                    <Text
                      style={{
                        alignSelf: "center",
                        paddingRight: 8,
                        fontSize: controlSize.label,
                        color: colors.mutedForeground,
                      }}
                    >
                      °C
                    </Text>
                  }
                  onChange={({ value }) => {
                    temperature.set(value);
                    last.set(`Thermostat: ${value === null ? "none" : `${value}°C`}`);
                  }}
                />
              </View>
            </View>
          </Row>
          <Row label="Interest rate" detail="Set by the bank">
            <View style={{ width: fieldWidth() }}>
              <NumberInput
                value={4.5}
                readonly
                accessibilityLabel="Interest rate"
                suffix={
                  <Text
                    style={{
                      alignSelf: "center",
                      paddingRight: 8,
                      fontSize: controlSize.label,
                      color: colors.mutedForeground,
                    }}
                  >
                    %
                  </Text>
                }
              />
            </View>
          </Row>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Badge tone={overBalance() ? "destructive" : "neutral"}>
            {overBalance() ? "Over the balance" : "Within the balance"}
          </Badge>
          <Text style={{ flex: 1, fontSize: controlSize.detail, color: colors.mutedForeground }}>
            {overBalance()
              ? `The most you can send is ${money(BALANCE)}`
              : `A fee of ${money(0)} applies to transfers over ${money(1000)}`}
          </Text>
        </View>
      </DemoCard>
    </DemoPage>
  );
}
