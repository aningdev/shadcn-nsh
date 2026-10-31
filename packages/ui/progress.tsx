import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Progress as BaseProgress } from "nsh/base";

export function Progress(props: {
  value?: number;
  indeterminate?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
}) {
  const pct = () => Math.max(0, Math.min(100, props.value ?? 0));

  return (
    <BaseProgress
      value={props.value}
      indeterminate={props.indeterminate}
      accessibilityLabel={props.accessibilityLabel}
      style={{ gap: 8 }}
      trackStyle={{
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: colors.muted,
      }}
      indicatorStyle={
        props.indeterminate
          ? {
              height: "100%",
              width: "33%",
              borderRadius: 3,
              backgroundColor: colors.primary,
            }
          : {
              height: "100%",
              width: `${pct()}%`,
              borderRadius: 3,
              backgroundColor: colors.primary,
            }
      }
    >
      {props.children}
    </BaseProgress>
  );
}
