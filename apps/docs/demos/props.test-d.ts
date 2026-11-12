/**
 * P5: every shell keeps the base props it claims to pass through. A missing base prop is a
 * type error here, caught by `nsh check next/demos`.
 */
import type {
  ButtonProps as BaseButtonProps,
  CheckboxProps as BaseCheckboxProps,
  ComboboxProps as BaseComboboxProps,
  DatePickerProps as BaseDatePickerProps,
  DialogProps as BaseDialogProps,
  HoverCardProps as BaseHoverCardProps,
  InputProps as BaseInputProps,
  NumberInputProps as BaseNumberInputProps,
  PopoverProps as BasePopoverProps,
  RadioProps as BaseRadioProps,
  SelectProps as BaseSelectProps,
  SwitchProps as BaseSwitchProps,
  ToggleGroupProps as BaseToggleGroupProps,
  ToggleProps as BaseToggleProps,
  ToolbarProps as BaseToolbarProps,
  TooltipProps as BaseTooltipProps,
} from "nsh/base";

import type { AlertDialogContentProps } from "@/packages/ui/alert-dialog";
import type {
  ButtonProps,
  IconButtonProps,
  RoundButtonProps,
  SplitButtonSegmentProps,
} from "@/packages/ui/button";
import type { CheckboxProps } from "@/packages/ui/checkbox";
import type { ComboboxContentProps } from "@/packages/ui/combobox";
import type { DatePickerContentProps } from "@/packages/ui/date-picker";
import type { DialogContentProps } from "@/packages/ui/dialog";
import type { HoverCardContentProps } from "@/packages/ui/hover-card";
import type { InputProps } from "@/packages/ui/input";
import type { NumberInputProps } from "@/packages/ui/number-input";
import type { PopoverContentProps } from "@/packages/ui/popover";
import type { RadioProps } from "@/packages/ui/radio-group";
import type { SelectContentProps } from "@/packages/ui/select";
import type { SwitchProps } from "@/packages/ui/switch";
import type { ToggleProps } from "@/packages/ui/toggle";
import type { ToggleGroupProps } from "@/packages/ui/toggle-group";
import type { ToolbarProps } from "@/packages/ui/toolbar";
import type { TooltipContentProps } from "@/packages/ui/tooltip";

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

type _selectContent = Assert<
  KeepsBase<
    BaseSelectProps,
    SelectContentProps,
    | "items"
    | "value"
    | "defaultValue"
    | "open"
    | "defaultOpen"
    | "placeholder"
    | "cleanable"
    | "disabled"
    | "trigger"
    | "onChange"
    | "onOpenChange"
    | "onOpen"
    | "onClose"
    | "onCancel"
    | "children"
    | "minWidth"
  >
>;
type _comboboxContent = Assert<
  KeepsBase<
    BaseComboboxProps,
    ComboboxContentProps,
    | "items"
    | "multiple"
    | "value"
    | "defaultValue"
    | "open"
    | "defaultOpen"
    | "placeholder"
    | "cleanable"
    | "disabled"
    | "triggerButton"
    | "onChange"
    | "onOpenChange"
    | "onOpen"
    | "onClose"
    | "onCancel"
    | "children"
    | "minWidth"
  >
>;
type _datePickerContent = Assert<
  KeepsBase<
    BaseDatePickerProps,
    DatePickerContentProps,
    | "value"
    | "defaultValue"
    | "open"
    | "defaultOpen"
    | "disabled"
    | "cleanable"
    | "trigger"
    | "onChange"
    | "onOpenChange"
    | "onOpen"
    | "onClose"
    | "onCancel"
    | "children"
  >
>;
type _popoverContent = Assert<
  KeepsBase<
    BasePopoverProps,
    PopoverContentProps,
    | "trigger"
    | "open"
    | "defaultOpen"
    | "onOpenChange"
    | "onOpen"
    | "onClose"
    | "onCancel"
    | "children"
    | "compact"
    | "width"
  >
>;
type _hoverCardContent = Assert<
  KeepsBase<
    BaseHoverCardProps,
    HoverCardContentProps,
    | "trigger"
    | "open"
    | "defaultOpen"
    | "onOpenChange"
    | "onOpen"
    | "onClose"
    | "children"
    | "compact"
    | "width"
  >
>;
type _tooltipContent = Assert<
  KeepsBase<BaseTooltipProps, TooltipContentProps, "children" | "rich">
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
  _selectContent,
  _comboboxContent,
  _datePickerContent,
  _popoverContent,
  _hoverCardContent,
  _tooltipContent,
};
