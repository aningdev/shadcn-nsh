/**
 * P5: every shell keeps the base props it claims to pass through. A missing base prop is a
 * type error here, caught by `nsh check next/demos`.
 */
import type {
  ButtonProps as BaseButtonProps,
  CheckboxProps as BaseCheckboxProps,
  DialogProps as BaseDialogProps,
  InputProps as BaseInputProps,
  NumberInputProps as BaseNumberInputProps,
  RadioProps as BaseRadioProps,
  SwitchProps as BaseSwitchProps,
  ToggleGroupProps as BaseToggleGroupProps,
  ToggleProps as BaseToggleProps,
  ToolbarProps as BaseToolbarProps,
} from "nsh/base";

import type { AlertDialogContentProps } from "@/packages/ui/alert-dialog";
import type {
  ButtonProps,
  IconButtonProps,
  RoundButtonProps,
  SplitButtonSegmentProps,
} from "@/packages/ui/button";
import type { CheckboxProps } from "@/packages/ui/checkbox";
import type { DialogContentProps } from "@/packages/ui/dialog";
import type { InputProps } from "@/packages/ui/input";
import type { NumberInputProps } from "@/packages/ui/number-input";
import type { RadioProps } from "@/packages/ui/radio-group";
import type { SwitchProps } from "@/packages/ui/switch";
import type { ToggleProps } from "@/packages/ui/toggle";
import type { ToggleGroupProps } from "@/packages/ui/toggle-group";
import type { ToolbarProps } from "@/packages/ui/toolbar";

type Assert<T extends true> = T;

/**
 * After dropping the axes the shell adds (and any base keys it deliberately omits), what remains
 * of `Base` is still assignable to what remains of `Shell`.
 */
type KeepsBase<Base, Shell, Dropped extends PropertyKey> =
  Omit<Base, Dropped> extends Omit<Shell, Dropped> ? true : false;

type _button = Assert<
  KeepsBase<BaseButtonProps, ButtonProps, "children" | "variant" | "size" | "busy">
>;
type _iconButton = Assert<
  KeepsBase<BaseButtonProps, IconButtonProps, "children" | "variant" | "tone" | "on">
>;
type _roundButton = Assert<
  KeepsBase<BaseButtonProps, RoundButtonProps, "children" | "variant" | "size">
>;
type _splitSegment = Assert<KeepsBase<BaseButtonProps, SplitButtonSegmentProps, "children">>;
type _switch = Assert<KeepsBase<BaseSwitchProps, SwitchProps, "size">>;
type _toggle = Assert<KeepsBase<BaseToggleProps, ToggleProps, "children" | "variant" | "size">>;
type _checkbox = Assert<
  KeepsBase<BaseCheckboxProps, CheckboxProps, "children" | "scale" | "round">
>;
type _radio = Assert<KeepsBase<BaseRadioProps, RadioProps, "children" | "variant" | "scale">>;
type _toggleGroup = Assert<KeepsBase<BaseToggleGroupProps, ToggleGroupProps, "vertical" | "inset">>;
type _toolbar = Assert<KeepsBase<BaseToolbarProps, ToolbarProps, never>>;
type _input = Assert<KeepsBase<BaseInputProps, InputProps, "invalid">>;
type _numberInput = Assert<KeepsBase<BaseNumberInputProps, NumberInputProps, "steps">>;
type _dialogContent = Assert<
  KeepsBase<
    BaseDialogProps,
    DialogContentProps,
    "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "width"
  >
>;
type _alertDialogContent = Assert<
  KeepsBase<
    BaseDialogProps,
    AlertDialogContentProps,
    "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "width"
  >
>;

export type {
  _button,
  _iconButton,
  _roundButton,
  _splitSegment,
  _switch,
  _toggle,
  _checkbox,
  _radio,
  _toggleGroup,
  _toolbar,
  _input,
  _numberInput,
  _dialogContent,
  _alertDialogContent,
};
