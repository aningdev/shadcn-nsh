import type { JSX } from "nsh";
import { Collapsible as BaseCollapsible } from "nsh/base";

export function Collapsible(props: {
  open?: boolean;
  reveal?: boolean;
  content?: JSX.Element;
  children?: JSX.Element;
}) {
  return (
    <BaseCollapsible
      open={props.open}
      reveal={props.reveal ?? true}
      content={props.content}
      style={{ gap: 0 }}
    >
      {props.children}
    </BaseCollapsible>
  );
}
