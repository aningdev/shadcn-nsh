import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX, Placement } from "nsh";
import { Tooltip as BaseTooltip } from "nsh/base";

/** Put on any element's `tooltip={...}` prop. */
export function Tooltip(props: {
  open?: boolean | null;
  defaultOpen?: boolean;
  placement?: Placement;
  delay?: number;
  disabled?: boolean;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  return (
    <BaseTooltip
      open={props.open}
      defaultOpen={props.defaultOpen}
      placement={props.placement ?? "top"}
      delay={props.delay}
      disabled={props.disabled}
      offset={6}
      onOpenChange={props.onOpenChange as never}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: radius.control,
        backgroundColor: colors.foreground,
      }}
    >
      {props.children}
    </BaseTooltip>
  );
}
