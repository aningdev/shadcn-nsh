/**
 * P5: every shell keeps the base props it claims to pass through. A missing base prop is a
 * type error here, caught by `nsh check next/demos`.
 */
import type {
  ButtonProps as BaseButtonProps,
  DialogProps as BaseDialogProps,
  SwitchProps as BaseSwitchProps,
  ToggleProps as BaseToggleProps,
} from "nsh/base";

import type { ButtonProps } from "../ui/button";
import type { DialogContentProps } from "../ui/dialog";
import type { SwitchProps } from "../ui/switch";
import type { ToggleProps } from "../ui/toggle";

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
type _switch = Assert<KeepsBase<BaseSwitchProps, SwitchProps, "size">>;
type _toggle = Assert<KeepsBase<BaseToggleProps, ToggleProps, "children" | "variant" | "size">>;
type _dialogContent = Assert<
  KeepsBase<
    BaseDialogProps,
    DialogContentProps,
    "open" | "onOpenChange" | "onOpen" | "onClose" | "onCancel" | "width"
  >
>;

export type { _button, _switch, _toggle, _dialogContent };
