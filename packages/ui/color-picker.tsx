// No reference look. The field edge, control radius and focus ring are the vocabulary.
import { alpha, colors, disabledOpacity, focusRing, hovered, radius } from "@shadcn-nsh/theme";
import type { InputStyle, ViewStyle } from "nsh";
import { computed, split } from "nsh";
import {
  ColorArea as BaseColorArea,
  ColorEyeDropper as BaseColorEyeDropper,
  ColorField as BaseColorField,
  ColorPicker as BaseColorPicker,
  ColorSlider as BaseColorSlider,
  ColorSwatch as BaseColorSwatch,
  type ColorAreaProps as BaseColorAreaProps,
  type ColorEyeDropperProps as BaseColorEyeDropperProps,
  type ColorFieldProps as BaseColorFieldProps,
  type ColorPickerProps as BaseColorPickerProps,
  type ColorSliderProps as BaseColorSliderProps,
  type ColorSwatchProps as BaseColorSwatchProps,
} from "nsh/base";

import { isPointer } from "./lib/density";
import {
  fieldDisabledStyle,
  fieldFocusStyle,
  fieldHoverStyle,
  fieldTransitionClass,
  fieldWell,
} from "./lib/field";
import { mergeClass, mergeStyle } from "./lib/part-style";

/**
 * Theme layer on `nsh/base` ColorPicker. The parts draw the channel colors;
 * this file paints the well, the thumb ring, the swatch and the eyedropper.
 * Every base prop passes through.
 */
export type ColorPickerProps = BaseColorPickerProps;

/** Theme layer on `nsh/base` ColorArea. */
export type ColorAreaProps = BaseColorAreaProps;

/** Theme layer on `nsh/base` ColorSlider. */
export type ColorSliderProps = BaseColorSliderProps;

/** Theme layer on `nsh/base` ColorField. */
export type ColorFieldProps = BaseColorFieldProps;

/** Theme layer on `nsh/base` ColorSwatch. */
export type ColorSwatchProps = BaseColorSwatchProps;

/** Theme layer on `nsh/base` ColorEyeDropper. */
export type ColorEyeDropperProps = BaseColorEyeDropperProps;

/** Chrome for one part. Call `colorPickerVariants` where the theme is read. */
export type ColorPickerChrome = {
  /** Column gap for the picker root. The app still lays the parts out. */
  picker: ViewStyle;
  /** Saturation / brightness plane. */
  area: {
    style: ViewStyle;
    panelStyle: ViewStyle;
    thumbStyle: ViewStyle;
    focusWithinStyle: ViewStyle;
    disabledStyle: ViewStyle;
  };
  /** One channel, including alpha. */
  slider: {
    style: ViewStyle;
    trackStyle: ViewStyle;
    thumbStyle: ViewStyle;
    focusWithinStyle: ViewStyle;
    disabledStyle: ViewStyle;
    /** Squares under a translucent track. */
    checkerboardColor: string;
  };
  /** Text of the whole color or one channel. */
  field: {
    className: string;
    style: InputStyle;
    hoverStyle?: ViewStyle;
    focusStyle: ViewStyle;
    disabledStyle: ViewStyle;
  };
  /** A preset chip, or the current color when `color` is omitted. */
  swatch: {
    style: ViewStyle;
    selectedStyle: ViewStyle;
    focusStyle: ViewStyle;
    disabledStyle: ViewStyle;
    checkerboardColor: string;
  };
  /** The screen sampler. Hidden only if the app's class says `disabled:hidden`. */
  dropper: {
    className: string;
    style: ViewStyle;
    hoverStyle?: ViewStyle;
    focusStyle: ViewStyle;
    disabledStyle: ViewStyle;
  };
};

/** A circle. The side is fixed so the ring stays round, as a slider thumb is. */
function thumbBox(size: number): ViewStyle {
  return {
    width: size,
    height: size,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.background,
    outlineWidth: 1,
    outlineStyle: "solid",
    outlineColor: alpha(colors.foreground, 0.45),
  };
}

function areaLook(): ColorPickerChrome["area"] {
  const pointer = isPointer();
  return {
    style: {
      minWidth: 160,
      minHeight: pointer ? 72 : 96,
    },
    panelStyle: {
      borderRadius: radius.control,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: colors.border,
    },
    thumbStyle: thumbBox(pointer ? 14 : 18),
    focusWithinStyle: focusRing(),
    disabledStyle: { opacity: disabledOpacity() },
  };
}

function sliderLook(): ColorPickerChrome["slider"] {
  const pointer = isPointer();
  const thumb = pointer ? 16 : 20;
  return {
    style: {
      minHeight: pointer ? 24 : 44,
      justifyContent: "center",
      // Half a thumb, so the thumb stays inside the track at either end.
      paddingHorizontal: thumb / 2,
    },
    trackStyle: {
      height: pointer ? 8 : 10,
      borderRadius: 999,
    },
    thumbStyle: thumbBox(thumb),
    focusWithinStyle: focusRing(),
    disabledStyle: { opacity: disabledOpacity() },
    checkerboardColor: colors.muted,
  };
}

function fieldLook(disabled?: boolean): ColorPickerChrome["field"] {
  const pointer = isPointer();
  const state = { disabled: !!disabled };
  return {
    className: `text-foreground ${fieldTransitionClass}`,
    style: {
      minHeight: pointer ? 28 : 44,
      paddingHorizontal: pointer ? 8 : 12,
      fontSize: pointer ? 13 : 15,
      color: colors.foreground,
      ...fieldWell(state),
    },
    hoverStyle: fieldHoverStyle(state),
    focusStyle: fieldFocusStyle(false),
    disabledStyle: fieldDisabledStyle(),
  };
}

function swatchLook(): ColorPickerChrome["swatch"] {
  // A color chip is a square, not a text box, so the side is fixed.
  const side = isPointer() ? 28 : 44;
  return {
    style: {
      width: side,
      height: side,
      borderRadius: radius.control,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    selectedStyle: {
      borderColor: colors.ring,
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: colors.ring,
      outlineOffset: 2,
    },
    focusStyle: focusRing(),
    disabledStyle: { opacity: disabledOpacity() },
    checkerboardColor: colors.muted,
  };
}

function dropperLook(): ColorPickerChrome["dropper"] {
  const pointer = isPointer();
  return {
    className: fieldTransitionClass,
    style: {
      minHeight: pointer ? 28 : 44,
      paddingHorizontal: pointer ? 10 : 14,
      borderRadius: radius.control,
      borderCurve: "continuous",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
    },
    hoverStyle: hovered(),
    focusStyle: focusRing(),
    disabledStyle: { opacity: disabledOpacity() },
  };
}

/** Every part's default chrome. Call it where the theme is read. */
export function colorPickerVariants(): ColorPickerChrome {
  return {
    picker: { gap: 12 },
    area: areaLook(),
    slider: sliderLook(),
    field: fieldLook(false),
    swatch: swatchLook(),
    dropper: dropperLook(),
  };
}

/** The color its parts share. Layout is the app's; the gap is this package's. */
export function ColorPicker(props: ColorPickerProps) {
  const [, rest] = split(props, ["class", "style"]);
  const chrome = computed(() => colorPickerVariants().picker);
  return (
    <BaseColorPicker {...rest} class={props.class} style={mergeStyle(chrome(), props.style)} />
  );
}

/** Saturation across, brightness up. The thumb fills with the color. */
export function ColorArea(props: ColorAreaProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "panelClass",
    "panelStyle",
    "thumbClass",
    "thumbStyle",
    "focusWithinStyle",
    "disabledStyle",
    "fillThumb",
  ]);
  const chrome = computed(() => areaLook());
  return (
    <BaseColorArea
      {...rest}
      fillThumb={props.fillThumb ?? true}
      class={props.class}
      style={mergeStyle(chrome().style, props.style)}
      panelClass={props.panelClass}
      panelStyle={mergeStyle(chrome().panelStyle, props.panelStyle)}
      thumbClass={props.thumbClass}
      thumbStyle={mergeStyle(chrome().thumbStyle, props.thumbStyle)}
      focusWithinStyle={mergeStyle(chrome().focusWithinStyle, props.focusWithinStyle)}
      disabledStyle={mergeStyle(chrome().disabledStyle, props.disabledStyle)}
    />
  );
}

/** One channel. An alpha track sits on a `muted` checkerboard. */
export function ColorSlider(props: ColorSliderProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "trackClass",
    "trackStyle",
    "thumbClass",
    "thumbStyle",
    "focusWithinStyle",
    "disabledStyle",
    "fillThumb",
    "checkerboardColor",
  ]);
  const chrome = computed(() => sliderLook());
  return (
    <BaseColorSlider
      {...rest}
      fillThumb={props.fillThumb ?? true}
      checkerboardColor={
        props.checkerboardColor === undefined ? chrome().checkerboardColor : props.checkerboardColor
      }
      class={props.class}
      style={mergeStyle(chrome().style, props.style)}
      trackClass={props.trackClass}
      trackStyle={mergeStyle(chrome().trackStyle, props.trackStyle)}
      thumbClass={props.thumbClass}
      thumbStyle={mergeStyle(chrome().thumbStyle, props.thumbStyle)}
      focusWithinStyle={mergeStyle(chrome().focusWithinStyle, props.focusWithinStyle)}
      disabledStyle={mergeStyle(chrome().disabledStyle, props.disabledStyle)}
    />
  );
}

/** The color as text, or one channel as a number. The well matches Input. */
export function ColorField(props: ColorFieldProps) {
  const [, rest] = split(props, ["class", "style", "hoverStyle", "focusStyle", "disabledStyle"]);
  const chrome = computed(() => fieldLook(props.disabled));
  return (
    <BaseColorField
      {...rest}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      hoverStyle={mergeStyle(chrome().hoverStyle, props.hoverStyle)}
      focusStyle={mergeStyle(chrome().focusStyle, props.focusStyle)}
      disabledStyle={mergeStyle(chrome().disabledStyle, props.disabledStyle)}
    />
  );
}

/** A preset, or the picker's color when `color` is omitted. */
export function ColorSwatch(props: ColorSwatchProps) {
  const [, rest] = split(props, [
    "class",
    "style",
    "selectedStyle",
    "focusStyle",
    "disabledStyle",
    "checkerboardColor",
  ]);
  const chrome = computed(() => swatchLook());
  return (
    <BaseColorSwatch
      {...rest}
      checkerboardColor={
        props.checkerboardColor === undefined ? chrome().checkerboardColor : props.checkerboardColor
      }
      class={props.class}
      style={mergeStyle(chrome().style, props.style)}
      selectedStyle={mergeStyle(chrome().selectedStyle, props.selectedStyle)}
      focusStyle={mergeStyle(chrome().focusStyle, props.focusStyle)}
      disabledStyle={mergeStyle(chrome().disabledStyle, props.disabledStyle)}
    />
  );
}

/**
 * Picks a color on the screen. Where the platform has no sampler, base disables it;
 * pass `disabled:hidden` to remove it there.
 */
export function ColorEyeDropper(props: ColorEyeDropperProps) {
  const [, rest] = split(props, ["class", "style", "hoverStyle", "focusStyle", "disabledStyle"]);
  const chrome = computed(() => dropperLook());
  return (
    <BaseColorEyeDropper
      {...rest}
      class={mergeClass(chrome().className, props.class)}
      style={mergeStyle(chrome().style, props.style)}
      hoverStyle={mergeStyle(chrome().hoverStyle, props.hoverStyle)}
      focusStyle={mergeStyle(chrome().focusStyle, props.focusStyle)}
      disabledStyle={mergeStyle(chrome().disabledStyle, props.disabledStyle)}
    />
  );
}
