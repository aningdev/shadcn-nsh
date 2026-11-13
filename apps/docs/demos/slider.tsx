import { mount, signal, Text, View } from "nsh";

import { Slider, sliderValueClass, sliderValueStyle } from "@/packages/ui/slider";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const strength = signal(64);
  const muted = signal(40);

  return (
    <DemoPage title="Slider" note={() => `${strength()}% · ${muted()}%`}>
      <DemoCard>
        <DemoSection title="Value" axis="block">
          <Slider
            value={strength()}
            showValue
            onChange={({ value }) => strength.set(value as number)}
            accessibilityLabel="Strength"
          >
            <Text class={sliderValueClass} style={sliderValueStyle()}>{`${strength()}%`}</Text>
          </Slider>
        </DemoSection>
        <DemoSection title="Default">
          <View style={{ width: 240 }}>
            <Slider
              value={muted()}
              onChange={({ value }) => muted.set(value as number)}
              accessibilityLabel="Volume"
            />
          </View>
        </DemoSection>
        <DemoSection title="States">
          <View style={{ width: 240, opacity: 0.5 }}>
            <Slider value={72} disabled accessibilityLabel="Locked" />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
