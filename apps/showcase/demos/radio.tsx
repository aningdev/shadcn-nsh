import { colors } from "@shadcn-nsh/theme";
// Radio: the official gallery's three scenes (`references/nsh/examples/gallery/demos/Controls.tsx`,
// `Plans`, `Delivery`, `Reading`) with this library's parts — a plan picker of rows, delivery options
// as choice cards whose whole surface is the radio, and a reading size that a preview follows.
import { signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  controlSize,
  insetSurface,
  listRow,
  narrowWindow,
  RowDivider,
  RowLabel,
} from "@/packages/ui/lib/surface";
import { Radio, RadioGroup, RadioRing } from "@/packages/ui/radio-group";

import { Caption, DemoCard, DemoPage } from "../kit";

const PLANS = [
  { name: "Free", detail: "One device, 5 GB", price: "$0" },
  { name: "Plus", detail: "Three devices, 200 GB", price: "$3 / mo" },
  { name: "Team", detail: "A shared library, 2 TB", price: "$12 / mo" },
  { name: "Enterprise", detail: "Set up by your organization", price: "—", disabled: true },
];

const SPEEDS: { name: string; detail: string; price: string; disabled?: boolean }[] = [
  { name: "Standard", detail: "In 3 to 5 days", price: "Included" },
  { name: "Express", detail: "Tomorrow", price: "$9" },
  { name: "Same day", detail: "Not in your area", price: "$19", disabled: true },
];

const TEXT_SIZES: {
  name: string;
  scale: number;
  text: number;
  disabled?: boolean;
}[] = [
  { name: "Small", scale: 0.8, text: 13 },
  { name: "Medium", scale: 1, text: 15 },
  { name: "Large", scale: 1.25, text: 18 },
  { name: "Huge", scale: 1.25, text: 22, disabled: true },
];

export function RadioDemo() {
  const last = signal("—");
  const plan = signal("Plus");
  const speed = signal("Standard");
  const reading = signal("Medium");
  const chosen = () => PLANS.find((p) => p.name === plan())!;
  const textOf = () => TEXT_SIZES.find((t) => t.name === reading())!;

  return (
    <DemoPage title="Radio" note={() => last()}>
      <DemoCard title="Plans" subtitle="A plan picker: one of a small set, all in view">
        <RadioGroup accessibilityLabel="Plan">
          <Each of={PLANS} key="index">
            {(p, i) => (
              <Radio
                checked={plan() === p().name}
                disabled={p().disabled}
                onChange={() => {
                  plan.set(p().name);
                  last.set(`Plan: ${p().name}`);
                }}
                // The ring at the first line of the label, as the consent rows' boxes are.
                {...listRow({
                  first: i() === 0,
                  disabled: () => !!p().disabled,
                  style: { alignItems: "flex-start" },
                })}
              >
                <RowDivider show={i() !== 0} />
                <RowLabel label={p().name} detail={p().detail} />
                <Text
                  style={{
                    fontSize: controlSize.label,
                    color: plan() === p().name ? colors.foreground : colors.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {p().price}
                </Text>
              </Radio>
            )}
          </Each>
        </RadioGroup>
        <View style={{ alignItems: "flex-end" }}>
          <Button
            size="sm"
            onPress={() => last.set(`Continue: ${chosen().name}, ${chosen().price}`)}
          >
            {`Continue with ${plan()}`}
          </Button>
        </View>
      </DemoCard>

      <DemoCard title="Choice cards" subtitle="The whole card is the radio">
        <RadioGroup
          accessibilityLabel="Delivery"
          style={{
            flexDirection: narrowWindow() ? "column" : "row",
            gap: 8,
            alignItems: "stretch",
          }}
        >
          <Each of={SPEEDS}>
            {(d) => (
              <Radio
                variant="tile"
                indicator={false}
                checked={speed() === d().name}
                disabled={d().disabled}
                onChange={() => {
                  speed.set(d().name);
                  last.set(`Delivery: ${d().name}`);
                }}
                style={{ gap: 2 }}
              >
                {/* In the card's corner, level with the title's line. */}
                <View style={{ position: "absolute", top: 12, right: 11 }}>
                  <RadioRing on={speed() === d().name} scale={0.8} disabled={d().disabled} />
                </View>
                <Text
                  style={{
                    marginRight: 20,
                    fontSize: controlSize.label,
                    fontWeight: "600",
                    color: colors.foreground,
                  }}
                >
                  {d().name}
                </Text>
                <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                  {d().detail}
                </Text>
                {/* At the tile's foot, so the prices line up across tiles whatever the details' lines. */}
                <Text
                  style={{
                    marginTop: "auto",
                    paddingTop: 8,
                    fontSize: controlSize.label,
                    color: speed() === d().name ? colors.brand : colors.foreground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {d().price}
                </Text>
              </Radio>
            )}
          </Each>
        </RadioGroup>
        <Caption>
          {speed() === "Same day"
            ? "Not in your area: that option takes no press"
            : `${speed()} arrives ${SPEEDS.find((s) => s.name === speed())!.detail.toLowerCase()}`}
        </Caption>
      </DemoCard>

      <DemoCard title="Sizes" subtitle="Three sizes, one locked; the preview follows">
        <RadioGroup
          accessibilityLabel="Text size"
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 20,
            rowGap: 6,
          }}
        >
          <Each of={TEXT_SIZES}>
            {(t) => (
              <Radio
                indicator={false}
                checked={reading() === t().name}
                disabled={t().disabled}
                onChange={() => {
                  reading.set(t().name);
                  last.set(`Text size: ${t().name}`);
                }}
                style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 }}
              >
                <RadioRing on={reading() === t().name} scale={t().scale} disabled={t().disabled} />
                <Text style={{ fontSize: controlSize.label, color: colors.foreground }}>
                  {t().name}
                </Text>
              </Radio>
            )}
          </Each>
        </RadioGroup>
        <View style={{ ...insetSurface(), padding: 12 }}>
          <Text
            style={{
              fontSize: textOf().text,
              lineHeight: Math.round(textOf().text * 1.45),
              color: colors.foreground,
            }}
          >
            Native views, styled by the app: every state and every motion is the gallery's own.
          </Text>
        </View>
      </DemoCard>
    </DemoPage>
  );
}
