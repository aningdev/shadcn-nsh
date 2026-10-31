import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text, View } from "nsh";
import {
  Toast as BaseToast,
  ToastStack as BaseToastStack,
  type Anchor,
  type ToastMotion,
  type ToastTransitionStatus,
} from "nsh/base";

export function ToastStack(props: {
  placement?: Anchor;
  motion?: ToastMotion;
  children?: JSX.Element;
  onExpandedChange?: (event: { expanded: boolean }) => void;
  onCancel?: () => void;
}) {
  return (
    <BaseToastStack
      placement={props.placement ?? "topRight"}
      motion={props.motion}
      onExpandedChange={props.onExpandedChange}
      onCancel={props.onCancel}
      style={{ gap: 8, padding: 12, maxWidth: 360 }}
    >
      {props.children}
    </BaseToastStack>
  );
}

export function Toast(props: {
  transitionStatus?: ToastTransitionStatus;
  title?: string;
  description?: string;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onDismissRequest?: () => void;
}) {
  return (
    <BaseToast
      transitionStatus={props.transitionStatus}
      accessibilityLabel={props.accessibilityLabel ?? props.title}
      onDismissRequest={props.onDismissRequest}
      style={{
        padding: 12,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: 4,
        minWidth: 240,
      }}
    >
      {props.children ?? (
        <View style={{ gap: 2 }}>
          {props.title ? (
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              {props.title}
            </Text>
          ) : null}
          {props.description ? (
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.description}</Text>
          ) : null}
        </View>
      )}
    </BaseToast>
  );
}
