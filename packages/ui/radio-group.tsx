// A radio group: the look (`RadioRing`) and the `Radio` / `RadioGroup` that wear it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import {
  colors,
  controls,
  type Controls,
  follow,
  terminal,
  TERMINAL_ROW,
  tier,
  type Tiered,
} from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { split, View } from "nsh";
import {
  Radio as BaseRadio,
  RadioGroup as BaseRadioGroup,
  type RadioGroupProps as BaseRadioGroupProps,
  type RadioProps as BaseRadioProps,
} from "nsh/base";

import {
  ChoiceLight,
  choiceScales,
  choiceSink,
  ChoiceTarget,
  choiceTileLook,
  choiceWell,
  type ChoiceSize,
  type ChoiceWell,
} from "./checkbox";
import { AsText } from "./lib/as-text";
import { PILL_RADIUS } from "./lib/surface";

interface RadioPreset {
  size: number;
  dot: number;
  dotHover: number;
  dotPressed: number;
  border: number;
  target: number;
  well: ChoiceWell;
  checkedStyle: "fill" | "ring";
  hasTarget: boolean;
  dotFeedback: "none" | "scale";
}

// M3 RadioButton 20dp ring (2dp stroke), 10dp inner dot, 40dp state-layer target (_md-comp-radio-button.scss:26,28 v34.0.21 / RadioButtonTokens.kt).
const m3RadioPreset: RadioPreset = {
  size: 20,
  dot: 10,
  dotHover: 10,
  dotPressed: 10,
  border: 2,
  target: 40,
  well: "outline",
  checkedStyle: "ring",
  hasTarget: true,
  dotFeedback: "none",
};

// WinUI 3 RadioButton 20px outer circle with 12px inner dot scaling 14px hover / 10px pressed (RadioButton_themeresources.xaml:68-80,147,179-180 in winui3/release/2.7.0).
const winuiRadioPreset: RadioPreset = {
  size: 20,
  dot: 12,
  dotHover: 14,
  dotPressed: 10,
  border: 1,
  target: 0,
  well: "inset",
  checkedStyle: "fill",
  hasTarget: false,
  dotFeedback: "scale",
};

const radioPresets: Record<Controls, Tiered<RadioPreset>> = {
  base: {
    pointer: {
      size: 16,
      dot: 6,
      dotHover: 6,
      dotPressed: 6,
      border: 1,
      target: 0,
      well: "well",
      checkedStyle: "fill",
      hasTarget: false,
      dotFeedback: "none",
    },
    touch: {
      size: 22,
      dot: 8,
      dotHover: 8,
      dotPressed: 8,
      border: 1,
      target: 0,
      well: "well",
      checkedStyle: "fill",
      hasTarget: false,
      dotFeedback: "none",
    },
  },
  material: { pointer: m3RadioPreset, touch: m3RadioPreset },
  winui: { pointer: winuiRadioPreset, touch: winuiRadioPreset },
};

// @port look/choice.tsx
/**
 * A radio's ring, among the `Radio`'s children (give the radio `class="group"`, so the ring
 * responds to row hover/press): outer diameter, dot diameter, stroke, interior well, checked style
 * (`"fill"` vs `"ring"`), state-layer target, and dot hover/press scaling come from `radioPresets[controls()][tier]`.
 */
export function RadioRing(props: { on: boolean; scale?: number; disabled?: boolean }) {
  const scale = props.scale ?? 1;
  const g = () => radioPresets[controls()][tier];
  const size = () => Math.round(g().size * scale);
  const height = () => (terminal ? TERMINAL_ROW : size());
  const dot = () => Math.round(g().dot * scale);
  const dotHover = () => Math.round(g().dotHover * scale);
  const dotPressed = () => Math.round(g().dotPressed * scale);
  const border = () => g().border;
  const wellStyle = () => choiceWell({ well: g().well, disabled: props.disabled });
  const ringBorderColor = () =>
    g().checkedStyle === "ring" && props.on ? colors.brand : wellStyle().borderColor;
  const on = follow(() => (props.on ? 1 : 0));
  const dotClass = () =>
    g().dotFeedback === "scale"
      ? `w-[${dot()}px] h-[${dot()}px] group-hover:w-[${dotHover()}px] group-hover:h-[${dotHover()}px] group-active:w-[${dotPressed()}px] group-active:h-[${dotPressed()}px] transition-all duration-100 motion-reduce:transition-none`
      : undefined;
  return (
    <View
      class={choiceSink}
      style={{
        width: size(),
        height: height(),
        borderRadius: size() / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: border(),
        ...wellStyle(),
        borderColor: ringBorderColor(),
      }}
    >
      {g().hasTarget ? (
        <ChoiceTarget
          target={Math.round(g().target * scale)}
          innerW={size() - 2 * border()}
          innerH={height() - 2 * border()}
          checked={props.on}
        />
      ) : null}
      {g().checkedStyle === "fill" ? (
        <ChoiceLight on={on} radius={size() / 2} border={border()} />
      ) : null}
      <View
        class={dotClass()}
        style={{
          ...(g().dotFeedback === "scale"
            ? { borderRadius: PILL_RADIUS }
            : { width: dot(), height: dot(), borderRadius: dot() / 2 }),
          backgroundColor: g().checkedStyle === "ring" ? colors.brand : colors.onBrand,
          opacity: on,
          transform: [{ scale: on.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }}
      />
    </View>
  );
}

// @port end

/**
 * `nsh/base`'s RadioGroup. Every base prop passes through.
 */
export type RadioGroupProps = BaseRadioGroupProps;

/** A radio group's root. The app owns which option is checked. */
export function RadioGroup(props: RadioGroupProps) {
  return <BaseRadioGroup {...props} />;
}

/** A radio's variants: `default` a sunk ring, `tile` the whole surface the control. */
export type RadioVariant = "default" | "tile";

/**
 * `nsh/base`'s Radio in the look of `RadioRing` (or `choiceTileLook` when `variant` is `tile`).
 * Every base prop passes through; the style props go over the look's. A string child is the label.
 */
export type RadioProps = Omit<BaseRadioProps, "children"> & {
  /** Default `default`: a sunk ring beside the label. `tile`: the whole surface is the control. */
  variant?: RadioVariant;
  /**
   * Its ring ahead of the label (the default). `false` draws only what the radio's props
   * and children give it: a segment of a `segmentedLook` track (`segmentedLook().segment`
   * for the radio, its `thumbStyle` as the checked style, its `label` for the text), where
   * the track and the thumb are the control.
   */
  indicator?: boolean;
  /** `sm` (0.8), `default` (1) or `lg` (1.25) times the page's control size. */
  size?: ChoiceSize;
  /** A string is the label; anything else is drawn as given. A string label is also the
   * radio's name for screen readers, unless `accessibilityLabel` says otherwise. */
  children?: string | JSX.Element;
};

/** One option in a `RadioGroup` (shadcn `RadioGroupItem`). The ring sits ahead of the label. */
export function Radio(props: RadioProps) {
  const [, rest] = split(props, [
    "variant",
    "indicator",
    "size",
    "children",
    "class",
    "style",
    "hoverStyle",
    "activeStyle",
    "focusVisibleStyle",
    "disabledStyle",
  ]);
  const tile = props.variant === "tile";
  const scale = choiceScales[props.size ?? "default"];
  const look = tile
    ? choiceTileLook(() => !!props.checked, { disabled: () => !!props.disabled })
    : undefined;
  return (
    <BaseRadio
      {...rest}
      class={props.class ? `group ${props.class}` : "group"}
      style={[look?.style ?? null, props.style ?? null]}
      hoverStyle={[look?.hoverStyle ?? null, props.hoverStyle ?? null]}
      activeStyle={[look?.activeStyle ?? null, props.activeStyle ?? null]}
      focusVisibleStyle={[look?.focusVisibleStyle ?? null, props.focusVisibleStyle ?? null]}
      disabledStyle={[look?.disabledStyle ?? null, props.disabledStyle ?? null]}
    >
      <If when={props.indicator ?? true}>
        <RadioRing on={!!props.checked} scale={scale} disabled={!!props.disabled} />
      </If>
      {/* The page's ink, read here so it follows the appearance: a bare Text is nsh's black. */}
      <AsText style={{ color: colors.foreground }}>{props.children}</AsText>
    </BaseRadio>
  );
}

/** shadcn name for {@link Radio}. */
export const RadioGroupItem = Radio;
