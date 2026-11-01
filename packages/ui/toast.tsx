import { colors, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Overlay, safeArea, signal, Text, View } from "nsh";
import {
  Toast as BaseToast,
  ToastManager,
  ToastStack as BaseToastStack,
  type Anchor,
  type ToastEntry,
  type ToastMotion,
  type ToastTransitionStatus,
} from "nsh/base";

export { ToastManager };
export type { ToastEntry, ToastMotion, ToastTransitionStatus };

type ToastContent = {
  title?: string;
  description?: string;
};

const defaultManager = new ToastManager();
const visible = signal<ToastEntry[]>([]);
const expanded = signal(false);
let tickStarted = false;
let toastSeq = 0;

function syncVisible() {
  visible.set(defaultManager.visible(3));
}

function ensureTick() {
  if (tickStarted) return;
  tickStarted = true;
  setInterval(() => {
    if (defaultManager.advance(expanded()).changed) syncVisible();
  }, 50);
}

/** Imperative helper (sonner-shaped). Requires `<Toaster />` in the tree. */
export function toast(message: string, opts?: { description?: string; timeout?: number }) {
  ensureTick();
  const id = `toast-${++toastSeq}`;
  defaultManager.push(
    id,
    { title: message, description: opts?.description } satisfies ToastContent,
    { timeout: opts?.timeout ?? 4000 },
  );
  syncVisible();
  return id;
}

toast.dismiss = (id?: string) => {
  if (id) defaultManager.dismiss(id);
  else defaultManager.dismissAll();
  syncVisible();
};

export function Toaster(props: { placement?: Anchor; motion?: ToastMotion }) {
  ensureTick();
  const placement = props.placement ?? "topRight";

  return (
    <Overlay
      style={{
        pointerEvents: "box-none",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        padding: 12,
        paddingTop: safeArea().top + 12,
        paddingBottom: safeArea().bottom + 12,
        alignItems: placement.toLowerCase().includes("left")
          ? "flex-start"
          : placement.toLowerCase().includes("center")
            ? "center"
            : "flex-end",
        justifyContent: placement.toLowerCase().includes("bottom") ? "flex-end" : "flex-start",
      }}
    >
      <ToastStack
        placement={placement}
        motion={props.motion}
        onExpandedChange={({ expanded: open }) => expanded.set(open)}
        onCancel={() => {
          const newest = visible()
            .filter((t) => t.status !== "ending")
            .at(-1);
          if (newest) {
            defaultManager.dismiss(newest.id);
            syncVisible();
          }
        }}
      >
        {/* nsh global `<Each>` — keyed toast rows */}
        {/* oxlint-disable-next-line react/jsx-no-undef */}
        <Each of={visible()} key={(t: ToastEntry) => t.id}>
          {(t) => {
            const content = () => t().value as ToastContent;
            return (
              <Toast
                transitionStatus={t().status}
                title={content().title}
                description={content().description}
                onDismissRequest={() => {
                  defaultManager.dismiss(t().id);
                  syncVisible();
                }}
              />
            );
          }}
        </Each>
      </ToastStack>
    </Overlay>
  );
}

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
