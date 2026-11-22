// A radio group: the look (`RadioRing`) and the `Radio` / `RadioGroup` that wear it.
// From NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE): yours to change.
import { colors, follow, radioGeometry, terminal, TERMINAL_ROW } from "@shadcn-nsh/theme";
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
} from "./checkbox";
import { AsText } from "./lib/as-text";
import { PILL_RADIUS } from "./lib/surface";

// @port look/choice.tsx
/**
 * A radio's ring, among the `Radio`'s children (give the radio `class="group"`, so the ring
 * responds to row hover/press): outer diameter, dot diameter, stroke, interior well, checked style
 * (`"fill"` vs `"ring"`), state-layer target, and dot hover/press scaling come from `dimension.radio[tier]`.
 */
export function RadioRing(props: { on: boolean; scale?: number; disabled?: boolean }) {
  const scale = props.scale ?? 1;
  const g = () => radioGeometry();
  const size = () => Math.round(g().size * scale);
  const height = () => (terminal ? TERMINAL_ROW : size());
  const dot = () => Math.round(g().dot * scale);
  const dotHover = () => Math.round(g()["dot-hover"] * scale);
  const dotPressed = () => Math.round(g()["dot-pressed"] * scale);
  const border = () => g().border;
  const wellStyle = () => choiceWell({ well: g().well, disabled: props.disabled });
  const ringBorderColor = () =>
    g()["checked-style"] === "ring" && props.on ? colors.brand : wellStyle().borderColor;
  const on = follow(() => (props.on ? 1 : 0));
  const dotClass = () =>
    g()["dot-feedback"] === "scale"
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
      {g()["has-target"] ? (
        <ChoiceTarget
          target={Math.round(g().target * scale)}
          innerW={size() - 2 * border()}
          innerH={height() - 2 * border()}
          checked={props.on}
        />
      ) : null}
      {g()["checked-style"] === "fill" ? (
        <ChoiceLight on={on} radius={size() / 2} border={border()} />
      ) : null}
      <View
        class={dotClass()}
        style={{
          ...(g()["dot-feedback"] === "scale"
            ? { borderRadius: PILL_RADIUS }
            : { width: dot(), height: dot(), borderRadius: dot() / 2 }),
          backgroundColor: g()["checked-style"] === "ring" ? colors.brand : colors.onBrand,
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
