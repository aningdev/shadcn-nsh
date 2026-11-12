// The reference of `slider.tsx`: `sliderLook` / `sliderFill` on `nsh/base`'s Slider.
import { mount, signal, Text, View } from "nsh";
import { Slider } from "nsh/base";

import { sliderFill, sliderLook, sliderValueClass, sliderValueStyle } from "@/packages/ui/slider";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const strength = signal(64);
  const muted = signal(40);
  const withValue = sliderLook({ value: true });
  const plain = sliderLook();

  return (
    <DemoPage title="Slider" note={() => `${strength()}% · ${muted()}%`}>
      <DemoCard>
        <DemoSection title="Value">
          <Slider
            value={strength()}
            onChange={({ value }) => strength.set(value as number)}
            accessibilityLabel="Strength"
            class={withValue.class}
            trackClass={withValue.trackClass}
            indicatorClass={withValue.indicatorClass}
            indicatorStyle={withValue.indicatorStyle}
            rangeClass={withValue.rangeClass}
            rangeStyle={sliderFill(0, strength() / 100)}
            thumbClass={withValue.thumbClass}
            thumbStyle={withValue.thumbStyle}
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
              class={plain.class}
              trackClass={plain.trackClass}
              indicatorClass={plain.indicatorClass}
              indicatorStyle={plain.indicatorStyle}
              rangeClass={plain.rangeClass}
              rangeStyle={sliderFill(0, muted() / 100)}
              thumbClass={plain.thumbClass}
              thumbStyle={plain.thumbStyle}
            />
          </View>
        </DemoSection>
        <DemoSection title="States">
          <View style={{ width: 240, opacity: 0.5 }}>
            <Slider
              value={72}
              disabled
              accessibilityLabel="Locked"
              class={plain.class}
              trackClass={plain.trackClass}
              indicatorClass={plain.indicatorClass}
              indicatorStyle={plain.indicatorStyle}
              rangeClass={plain.rangeClass}
              rangeStyle={sliderFill(0, 0.72)}
              thumbClass={plain.thumbClass}
              thumbStyle={plain.thumbStyle}
            />
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
