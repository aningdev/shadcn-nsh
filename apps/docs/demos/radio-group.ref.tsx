// The reference of `radio-group.tsx`: the look on `nsh/base`'s Radio, as upstream writes it.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Radio, RadioGroup } from "nsh/base";

import { listRow, RowDivider, RowLabel, sectionSurface } from "@/packages/ui/lib/surface";
import { choiceTileLook, RadioRing } from "@/packages/ui/radio-group";

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
            class="group"
            {...listRow({ first: true })}
          >
            <RowDivider show={false} />
            <RadioRing on={plan() === "starter"} />
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
            class="group"
            {...listRow()}
          >
            <RowDivider show />
            <RadioRing on={plan() === "pro"} />
            <RowLabel label={plans[1].label} detail={plans[1].detail} />
            <Text style={{ fontSize: 14, color: plan() === "pro" ? colors.text : colors.muted }}>
              {plans[1].price}
            </Text>
          </Radio>
          <Radio
            checked={plan() === "team"}
            disabled
            onChange={({ checked }) => checked && plan.set("team")}
            class="group"
            {...listRow({ disabled: true })}
          >
            <RowDivider show />
            <RadioRing on={false} disabled />
            <RowLabel label={plans[2].label} detail={plans[2].detail} />
            <Text style={{ fontSize: 14, color: colors.muted }}>{plans[2].price}</Text>
          </Radio>
        </RadioGroup>
      </DemoCard>

      <DemoCard>
        <DemoSection title="Scale">
          <RadioGroup>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Radio class="group" checked accessibilityLabel="Small">
                <RadioRing on scale={0.8} />
                <Text>Small</Text>
              </Radio>
              <Radio
                class="group"
                checked={cycle() === "Monthly"}
                onChange={() => cycle.set("Monthly")}
              >
                <RadioRing on={cycle() === "Monthly"} />
                <Text>Regular</Text>
              </Radio>
              <Radio
                class="group"
                checked={cycle() === "Yearly"}
                onChange={() => cycle.set("Yearly")}
              >
                <RadioRing on={cycle() === "Yearly"} scale={1.25} />
                <Text>Large</Text>
              </Radio>
            </View>
          </RadioGroup>
        </DemoSection>
        <DemoSection title="Tile">
          <RadioGroup>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Radio
                checked={tile() === "a"}
                onChange={({ checked }) => checked && tile.set("a")}
                class="group"
                {...choiceTileLook(() => tile() === "a")}
              >
                <RadioRing on={tile() === "a"} />
                <Text>Option A</Text>
              </Radio>
              <Radio
                checked={tile() === "b"}
                onChange={({ checked }) => checked && tile.set("b")}
                class="group"
                {...choiceTileLook(() => tile() === "b")}
              >
                <RadioRing on={tile() === "b"} />
                <Text>Option B</Text>
              </Radio>
            </View>
          </RadioGroup>
        </DemoSection>
        <DemoSection title="States">
          <RadioGroup>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Radio class="group" checked>
                <RadioRing on />
                <Text>On</Text>
              </Radio>
              <Radio class="group">
                <RadioRing on={false} />
                <Text>Off</Text>
              </Radio>
              <Radio class="group" checked disabled>
                <RadioRing on disabled />
                <Text>Disabled</Text>
              </Radio>
            </View>
          </RadioGroup>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
