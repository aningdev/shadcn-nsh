// A tooltip: the look (`tooltipLook`, `tooltipText`, `tooltipNote`) and the `Tooltip` that wears it.
// The look is ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE).
// Its region is filled by `bun run port:vendor`: change it upstream, or in `port-map.json`.
import type { JSX } from "nsh";
import { split, Text } from "nsh";
import { Tooltip as BaseTooltip, type TooltipProps as BaseTooltipProps } from "nsh/base";

// @port look/overlay.ts
/** Options of `tooltipLook`. */
export interface TooltipLookOptions {
  /** More than a line (a title, a list): 10 points of padding, its rows 8 apart, larger corners. */
  rich?: boolean;
}

/**
 * A tooltip's bubble (`class`, on the view inside `nsh/base`'s `Tooltip`):
 * the theme's `popover` surface with the border's edge, not the text's
 * color inverted, so it reads as the menus and popovers do in both
 * appearances. One line: a row 8 points apart, 8 by 4 points of padding,
 * 6-point corners; `rich`: a column, 10 points of padding, 8-point corners.
 * Its text takes `tooltipText`, a shortcut or a note `tooltipNote`.
 */
export function tooltipLook(o?: TooltipLookOptions) {
  return {
    class: o?.rich
      ? "gap-2 rounded-lg border border-border bg-popover p-2.5"
      : "flex-row items-center gap-2 rounded-md border border-border bg-popover px-2 py-1",
  };
}

/** A tooltip's text (`class`): 12 points in the popover's foreground. */
export const tooltipText = "text-xs text-popover-foreground";

/** A tooltip's quieter text (`class`): a shortcut's keys, a time. */
export const tooltipNote = "text-xs text-muted-foreground";
// @port end

/**
 * `nsh/base`'s Tooltip in the look of `tooltipLook`. Every base prop passes through; `class`
 * goes over the look's. Pass it as any element's `tooltip={…}` prop.
 */
export type TooltipProps = Omit<BaseTooltipProps, "children"> & {
  /** More than a line: a column with more padding. */
  rich?: boolean;
  /** A string is the label in `tooltipText`; anything else is drawn as given. */
  children?: string | JSX.Element;
};

/** A tooltip bubble. Use as `tooltip={<Tooltip>Hint</Tooltip>}` on a host. */
export function Tooltip(props: TooltipProps) {
  const [, rest] = split(props, ["rich", "children", "class"]);
  const look = tooltipLook({ rich: props.rich });
  return (
    <BaseTooltip {...rest} class={props.class ? `${look.class} ${props.class}` : look.class}>
      {typeof props.children === "string" ? (
        <Text class={tooltipText}>{props.children}</Text>
      ) : (
        props.children
      )}
    </BaseTooltip>
  );
}
