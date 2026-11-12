import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { Radio, RadioGroup } from "@/packages/ui/radio-group";

import { DemoCard, DemoPage, DemoSection } from "./kit";

const plans = [
  { id: "starter", label: "Starter", detail: "1 project · 5 GB", price: "Free" },
  { id: "pro", label: "Pro", detail: "Unlimited projects · 100 GB", price: "$12" },
  { id: "team", label: "Team", detail: "Shared workspace · 1 TB", price: "$40", locked: true },
] as const;

function App() {
  const plan = signal("pro");
  const cycle = signal<"Monthly" | "Yearly">("Monthly");
  const tile = signal("a");

  return (
    <DemoPage title="Radio" note={() => `${plan()} · ${cycle()} · tile ${tile()}`}>
      <DemoCard style={{ gap: 0, ...sectionSurface({ padded: true }) }}>
        <RadioGroup>
          <Radio
            checked={plan() === "starter"}
            onChange={({ checked }) => checked && plan.set("starter")}
            {...listRow({ first: true })}
          >
            <RowDivider show={false} />
            <RowLabel label={plans[0].label} detail={plans[0].detail} />
            <Text
              style={{ fontSize: 14, color: plan() === "starter" ? colors.text : colors.muted }}
            >
              {plans[0].price}
            </Text>
          </Radio>
          <Radio
            checked={plan() === "pro"}
            onChange={({ checked }) => checked && plan.set("pro")}
            {...listRow()}
          >
            <RowDivider show />
            <RowLabel label={plans[1].label} detail={plans[1].detail} />
            <Text style={{ fontSize: 14, color: plan() === "pro" ? colors.text : colors.muted }}>
              {plans[1].price}
            </Text>
          </Radio>
          <Radio
            checked={plan() === "team"}
            disabled
            onChange={({ checked }) => checked && plan.set("team")}
            {...listRow({ disabled: true })}
          >
            <RowDivider show />
            <RowLabel label={plans[2].label} detail={plans[2].detail} />
            <Text style={{ fontSize: 14, color: colors.muted }}>{plans[2].price}</Text>
          </Radio>
        </RadioGroup>
      </DemoCard>

      <DemoCard>
        <DemoSection title="Scale">
          <RadioGroup>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Radio scale={0.8} checked accessibilityLabel="Small">
                Small
              </Radio>
              <Radio checked={cycle() === "Monthly"} onChange={() => cycle.set("Monthly")}>
                Regular
              </Radio>
              <Radio
                scale={1.25}
                checked={cycle() === "Yearly"}
                onChange={() => cycle.set("Yearly")}
              >
                Large
              </Radio>
            </View>
          </RadioGroup>
        </DemoSection>
        <DemoSection title="Tile">
          <RadioGroup>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Radio
                variant="tile"
                checked={tile() === "a"}
                onChange={({ checked }) => checked && tile.set("a")}
              >
                Option A
              </Radio>
              <Radio
                variant="tile"
                checked={tile() === "b"}
                onChange={({ checked }) => checked && tile.set("b")}
              >
                Option B
              </Radio>
            </View>
          </RadioGroup>
        </DemoSection>
        <DemoSection title="States">
          <RadioGroup>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Radio checked>On</Radio>
              <Radio>Off</Radio>
              <Radio checked disabled>
                Disabled
              </Radio>
            </View>
          </RadioGroup>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
