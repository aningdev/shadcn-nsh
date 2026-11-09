import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Slider as BaseSlider, type Axis, type SliderScale, type SliderValue } from "nsh/base";

export function Slider(props: {
  value?: SliderValue | null;
  defaultValue?: SliderValue;
  min?: number;
  max?: number;
  step?: number;
  scale?: SliderScale;
  axis?: Axis;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onChange?: (event: { value: SliderValue }) => void;
  onChangeEnd?: (event: { value: SliderValue }) => void;
}) {
  const vertical = () => props.axis === "vertical";

  return (
    <BaseSlider
      value={props.value}
      defaultValue={props.defaultValue}
      min={props.min}
      max={props.max}
      step={props.step}
      scale={props.scale}
      axis={props.axis}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      onChange={props.onChange}
      onChangeEnd={props.onChangeEnd}
      style={{
        opacity: props.disabled ? 0.5 : 1,
        ...(vertical()
          ? { height: 128, width: 20, alignItems: "center" }
          : { height: 20, justifyContent: "center" }),
      }}
      trackStyle={
        vertical()
          ? { width: 20, height: "100%", alignItems: "center", paddingVertical: 7 }
          : { height: 20, justifyContent: "center", paddingHorizontal: 7 }
      }
      indicatorStyle={{
        ...(vertical() ? { width: 6, height: "100%" } : { height: 6, width: "100%" }),
        borderRadius: 3,
        backgroundColor: colors.muted,
      }}
      rangeStyle={{
        borderRadius: 3,
        backgroundColor: colors.primary,
      }}
      thumbStyle={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1,
        borderColor: colors.primary,
        backgroundColor: colors.background,
        ...focusRing(),
      }}
    >
      {props.children}
    </BaseSlider>
  );
}
