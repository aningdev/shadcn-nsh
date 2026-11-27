// A text field: `Input`, wearing the shared field well (`fieldLook` and `fieldText` in
// `lib/field-look`) as `inputLook`.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import type { InputStyle, ViewStyle } from "nsh";
import { signal, split } from "nsh";
import { Input as BaseInput, type InputProps as BaseInputProps } from "nsh/base";

import {
  fieldFrame,
  fieldLook,
  fieldText,
  grownFieldHeight,
  type FieldLookOptions,
  type InputVariant,
} from "./lib/field-look";
import { createRejectShake } from "./lib/motion";
import { joinClass, read } from "./lib/utils";

/**
 * A lone `<Input>`'s props (`<Input {...inputLook()} />`): the well and its
 * states (`fieldLook`) and the text in it (`fieldText`) on the input itself.
 */
export function inputLook(o?: FieldLookOptions) {
  const look = fieldLook(o);
  return {
    get class(): string {
      return look.class;
    },
    get style(): InputStyle {
      const text = fieldText({
        readonly: !!read(o?.readonly),
        disabled: !!read(o?.disabled),
        multiline: !!read(o?.multiline),
      });
      // A lone input is its own well: the text takes no `flex`, which a field's text has for the
      // parts beside it.
      return { ...fieldFrame(o), ...text, flex: undefined, ...read(o?.style) } as InputStyle;
    },
    get hoverStyle(): ViewStyle | undefined {
      return look.hoverStyle;
    },
    get focusStyle(): ViewStyle {
      return look.focusStyle;
    },
    get focusWithinStyle(): ViewStyle {
      return look.focusWithinStyle;
    },
    get disabledStyle(): ViewStyle {
      return look.disabledStyle;
    },
  };
}

/**
 * `nsh/base`'s Input in the look of `inputLook`. Every base prop passes through; `class`, `style`,
 * `hoverStyle`, `focusStyle`, `focusWithinStyle` and `disabledStyle` go over the look's.
 *
 * One field, one line or several: with `multiline` the content starts at the top of a box at least
 * one line tall, and Return writes a line break. `grow` sizes that box from `onContentSizeChange`
 * (`grownFieldHeight`); without it, `fieldText` keeps only a least height and the app sets the rest.
 */
export type InputProps = BaseInputProps & {
  /** Default `default`: the field's fill and edge. `ghost`: nothing at rest, the focus ring kept. */
  variant?: InputVariant;
  /** Edged in the danger tone, its focus edge too. */
  invalid?: boolean;
  /**
   * Multiline only. `true` grows with the text up to five lines; a number is that cap. The height
   * is set as the text reports it, with no transition, so reduced motion has nothing to turn off.
   * A `style` `height` still wins.
   */
  grow?: boolean | number;
  /**
   * Shakes the field each time this becomes a new number (a submit the value failed). `invalid`
   * only recolours the edge, so a second rejection has to change this. Less motion plays nothing.
   */
  reject?: number;
};

/** A text field. The well and the text are `inputLook`. */
export function Input(props: InputProps) {
  const [, rest] = split(props, [
    "variant",
    "invalid",
    "class",
    "style",
    "hoverStyle",
    "focusStyle",
    "focusWithinStyle",
    "disabledStyle",
    "grow",
    "reject",
    "onContentSizeChange",
    "onFocus",
    "onBlur",
  ]);
  const focused = signal(false);
  const look = inputLook({
    variant: () => props.variant,
    invalid: () => !!props.invalid,
    readonly: () => !!props.readonly,
    disabled: () => !!props.disabled,
    focused: () => focused(),
    multiline: () => !!props.multiline,
  });
  const contentHeight = signal(0);
  const shake = createRejectShake(() => props.reject);
  const grown = (): InputStyle | null => {
    const lines = props.grow === true ? 5 : props.grow;
    if (!props.multiline || lines === undefined || lines === false || contentHeight() === 0)
      return null;
    return { height: grownFieldHeight(contentHeight(), lines) };
  };
  return (
    <BaseInput
      {...rest}
      onFocus={() => {
        focused.set(true);
        props.onFocus?.();
      }}
      onBlur={() => {
        focused.set(false);
        props.onBlur?.();
      }}
      onContentSizeChange={(event) => {
        if (props.grow && props.multiline) contentHeight.set(event.size.height);
        props.onContentSizeChange?.(event);
      }}
      class={joinClass(look.class, props.class)}
      style={[look.style, grown(), shake.style(), props.style ?? null]}
      hoverStyle={[look.hoverStyle ?? null, props.hoverStyle ?? null]}
      focusStyle={[look.focusStyle, props.focusStyle ?? null]}
      focusWithinStyle={[look.focusWithinStyle, props.focusWithinStyle ?? null]}
      disabledStyle={[look.disabledStyle, props.disabledStyle ?? null]}
    />
  );
}
