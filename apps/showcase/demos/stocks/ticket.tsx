import {
  alpha,
  colors,
  finish,
  TERMINAL_COLUMN,
  TERMINAL_GAP,
  TERMINAL_ROW,
  terminal,
  tints,
  shape,
} from "@shadcn-nsh/theme";
import { Check, Minus, Plus } from "lucide";
// The order ticket: side, a limit price stepper, quantity chips, the estimated cost, then the
// review that places it — and the banner that confirms it, which drops in and leaves by itself.
// Ported from `stocks/Ticket.tsx`. Nothing is sent anywhere.
import {
  Animated,
  createAnimatedValue,
  Easing,
  effect,
  LayoutAnimation,
  signal,
  Text,
  untracked,
  View,
} from "nsh";

import { Button } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Pressable } from "@/packages/ui/pressable";
import { Segmented, SegmentedItem, SegmentedList } from "@/packages/ui/segmented";

import { grouped, price, type Stock } from "./market";

export type Side = "buy" | "sell";

/** Simulated buying power. */
const POWER = 250_000;
const quantities = [100, 500, 1000, 5000];
const sides = [
  { value: "buy" as const, label: "Buy" },
  { value: "sell" as const, label: "Sell" },
];

/** A confirmation that drops in from the top and leaves by itself. */
export function createBanner() {
  const t = createAnimatedValue(0);
  const message = signal({ title: "", detail: "", side: "buy" as Side });
  const show = (title: string, detail: string, side: Side) => {
    message.set({ title, detail, side });
    void Animated.sequence([
      Animated.spring(t, { toValue: 1, stiffness: 260, damping: 22 }),
      Animated.delay(2200),
      Animated.timing(t, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic) }),
    ]).start();
  };
  const view = (
    <View
      style={{
        pointerEvents: "none",
        position: "absolute",
        top: terminal ? TERMINAL_ROW : 10,
        left: terminal ? TERMINAL_COLUMN : 16,
        right: terminal ? TERMINAL_COLUMN : 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: terminal ? 0 : 14,
        paddingHorizontal: terminal ? TERMINAL_COLUMN : 14,
        borderRadius: shape.container,
        backgroundColor: colors.primary,
        opacity: t.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 1, 1] }),
        translate: [0, t.interpolate({ inputRange: [0, 1], outputRange: [-90, 0] })],
        // Whole Cells in the terminal: it does not grow in.
        scale: terminal ? 1 : t.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }),
      }}
    >
      <View
        style={{
          display: terminal ? "none" : "flex",
          width: 34,
          height: 34,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: message().side === "buy" ? colors.up : colors.destructive,
          borderRadius: 17,
        }}
      >
        <Icon icon={Check} size={18} tint={colors.background} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: colors.primaryForeground }}>
          {message().title}
        </Text>
        <Text
          style={{
            numberOfLines: 1,
            fontSize: 13,
            color: alpha(colors.primaryForeground, 0.72),
          }}
        >
          {message().detail}
        </Text>
      </View>
    </View>
  );
  return { show, view };
}

/** A square 44 pt stepper button; a text button in the terminal. */
function Step(props: { plus: boolean; label: string; onPress: () => void }) {
  if (terminal) {
    return (
      <Button accessibilityLabel={props.label} variant="secondary" onPress={props.onPress}>
        {props.plus ? "Raise" : "Lower"}
      </Button>
    );
  }
  return (
    <Pressable onPress={props.onPress} accessibilityLabel={props.label}>
      <View
        style={{
          width: 44,
          height: 44,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: shape.control,
          ...finish.pill,
          borderWidth: 1,
        }}
      >
        <Icon icon={props.plus ? Plus : Minus} size={18} tint={colors.foreground} />
      </View>
    </Pressable>
  );
}

/** A line of the review: a label and a value. */
function Line(props: { label: string; value: string; strong?: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "baseline",
        minHeight: terminal ? TERMINAL_ROW : 24,
      }}
    >
      <Text style={{ flex: 1, fontSize: 14, color: colors.mutedForeground }}>{props.label}</Text>
      <Text
        style={{
          fontSize: props.strong ? 17 : 14,
          fontWeight: props.strong ? "600" : "400",
          color: colors.foreground,
          fontVariant: ["tabular-nums"],
        }}
      >
        {props.value}
      </Text>
    </View>
  );
}

/**
 * The order ticket (the content of a sheet): side, a limit price stepper, quantity chips and the
 * estimated cost; reviewing expands the ticket (a layout animation) and placing calls `onPlaced`.
 */
export function Ticket(props: {
  open: () => boolean;
  stock: Stock;
  side: () => Side;
  onSide: (side: Side) => void;
  onPlaced: (title: string, detail: string, side: Side) => void;
}) {
  const limit = signal(props.stock.quote().last);
  const quantity = signal(500);
  const review = signal(false);
  // Each opening starts from the last price, not reviewing.
  effect(() => {
    if (!props.open()) return;
    untracked(() => {
      limit.set(props.stock.quote().last);
      review.set(false);
    });
  });
  const p = (v: number) => price(v, props.stock);
  const cost = () => limit() * quantity();
  const fee = () => Math.max(1, cost() * 0.0003);
  const expand = (open: boolean) => {
    LayoutAnimation.configureNext({
      duration: 380,
      update: { type: "spring", springDamping: 0.86 },
      create: { type: "easeInEaseOut", property: "opacity" },
      delete: { type: "easeInEaseOut", property: "opacity" },
    });
    review.set(open);
  };
  const nudge = (steps: number) =>
    limit.set(
      Math.max(props.stock.tick, Math.round(limit() / props.stock.tick + steps) * props.stock.tick),
    );
  const tone = () => (props.side() === "buy" ? colors.up : colors.destructive);
  const verb = () => (props.side() === "buy" ? "Buy" : "Sell");
  return (
    <View style={{ gap: 16, paddingTop: terminal ? 0 : 4 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <Text style={{ flex: 1, fontSize: 20, fontWeight: "600", color: colors.foreground }}>
          {verb()} {props.stock.code}
        </Text>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          simulated · nothing is sent
        </Text>
      </View>
      <Segmented value={props.side()} onValueChange={(next) => props.onSide(next as Side)}>
        <SegmentedList>
          <Each of={sides}>
            {(option) => <SegmentedItem value={option().value}>{option().label}</SegmentedItem>}
          </Each>
        </SegmentedList>
      </Segmented>
      <View style={{ gap: terminal ? 0 : 8 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ flex: 1, fontSize: 14, color: colors.mutedForeground }}>Limit price</Text>
          <Text
            onPress={() => limit.set(props.stock.quote().last)}
            role="button"
            hitSlop={10}
            hoverStyle={{ opacity: 0.72 }}
            activeStyle={{ opacity: 0.5 }}
            style={{ fontSize: 13, color: colors.brand, fontVariant: ["tabular-nums"] }}
          >
            use last {p(props.stock.quote().last)}
          </Text>
        </View>
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: terminal ? TERMINAL_GAP : 10 }}
        >
          <Step plus={false} label="Lower the price" onPress={() => nudge(-1)} />
          <View
            style={{
              flex: 1,
              height: terminal ? TERMINAL_ROW : 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: shape.control,
              backgroundColor: colors.inset,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: colors.foreground,
                fontVariant: ["tabular-nums"],
              }}
            >
              {p(limit())}
            </Text>
          </View>
          <Step plus={true} label="Raise the price" onPress={() => nudge(1)} />
        </View>
      </View>
      <View style={{ gap: terminal ? 0 : 8 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ flex: 1, fontSize: 14, color: colors.mutedForeground }}>Quantity</Text>
          <Text style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}>
            {grouped(quantity(), 0)} sh
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: terminal ? TERMINAL_GAP : 8 }}>
          <Each of={quantities}>
            {(q) => (
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => quantity.set(q())}
                  accessibilityLabel={`${q()} shares`}
                  selected={quantity() === q()}
                >
                  <View
                    style={{
                      height: terminal ? TERMINAL_ROW : 44,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: shape.control,
                      backgroundColor: quantity() === q() ? tints.brand : colors.raised,
                      borderWidth: 1,
                      borderColor: quantity() === q() ? colors.brand : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        fontVariant: ["tabular-nums"],
                        color: quantity() === q() ? colors.brand : colors.foreground,
                      }}
                    >
                      {q() >= 1000 ? `${q() / 1000}K` : `${q()}`}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}
          </Each>
        </View>
      </View>
      <View style={terminal ? undefined : { gap: 6, paddingTop: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={{ flex: 1, fontSize: 14, color: colors.mutedForeground }}>
            Estimated {props.side() === "buy" ? "cost" : "proceeds"}
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "600",
              color: colors.foreground,
              fontVariant: ["tabular-nums"],
            }}
          >
            {grouped(cost())}
          </Text>
        </View>
        <If when={!terminal}>
          <View
            style={{
              height: 6,
              overflow: "hidden",
              borderRadius: 3,
              backgroundColor: colors.raised,
            }}
          >
            <View
              style={{
                width: `${Math.min(100, (cost() / POWER) * 100)}%`,
                height: 6,
                borderRadius: 3,
                backgroundColor: cost() > POWER ? colors.destructive : tone(),
              }}
            />
          </View>
        </If>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          {((cost() / POWER) * 100).toFixed(1)}% of {grouped(POWER, 0)} buying power
        </Text>
      </View>
      <If
        when={review()}
        else={<Button onPress={() => expand(true)}>{`Review ${verb().toLowerCase()}`}</Button>}
      >
        <View
          style={{
            gap: terminal ? 0 : 12,
            // The terminal's border takes a row and a column on each side: the rest of them is padding.
            paddingVertical: terminal ? TERMINAL_ROW - 1 : 14,
            paddingHorizontal: terminal ? 2 * TERMINAL_COLUMN - 1 : 14,
            borderRadius: shape.control,
            borderWidth: 1,
            borderColor: tone(),
            backgroundColor: props.side() === "buy" ? tints.up : tints.down,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: "600", color: tone() }}>
              {verb()} {grouped(quantity(), 0)} {props.stock.code}
            </Text>
            <Text
              style={{ fontSize: 12, color: colors.mutedForeground, fontVariant: ["tabular-nums"] }}
            >
              LIMIT · DAY
            </Text>
          </View>
          <View style={{ gap: terminal ? 0 : 2 }}>
            <Line label="Limit" value={p(limit())} />
            <Line label="Fees (est.)" value={grouped(fee())} />
            <Line
              label="Total"
              value={grouped(props.side() === "buy" ? cost() + fee() : cost() - fee())}
              strong
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: terminal ? TERMINAL_GAP : 10,
              marginTop: terminal ? TERMINAL_ROW : 0,
            }}
          >
            <View style={{ flex: 1 }}>
              <Button variant="secondary" onPress={() => expand(false)}>
                Edit
              </Button>
            </View>
            <View style={{ flex: 2 }}>
              <Button
                onPress={() => {
                  props.onPlaced(
                    `${verb()} order placed`,
                    `${grouped(quantity(), 0)} ${props.stock.code} at ${p(limit())} · simulated`,
                    props.side(),
                  );
                  expand(false);
                }}
              >
                {`Place ${verb().toLowerCase()} order`}
              </Button>
            </View>
          </View>
        </View>
      </If>
    </View>
  );
}
