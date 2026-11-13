// The reference of `alert-dialog.tsx`: the same scene with the card's look (`dialogCard`,
// `dialogTitle`, `dialogText`, `backdrop`) spread on `nsh/base`'s Dialog, the way the official
// example (`references/nsh/website/demos/el-alert-dialog.tsx`) writes it. It differs from the
// component page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Dialog } from "nsh/base";

import { Button, type ButtonKind } from "@/packages/ui/button";
import { dialogCard, dialogText, dialogTitle } from "@/packages/ui/dialog";
import { backdrop } from "@/packages/ui/lib/overlay";
import { controlSize, listRow, RowDivider, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Panel, Split, wide } from "./stage";

type Role = "cancel" | "destructive" | undefined;

/** One alert: what it asks, the actions it offers, and whether a press outside it dismisses it. */
type Alert = {
  id: string;
  label: string;
  detail: string;
  title: string;
  description: string;
  danger?: boolean;
  dismissable?: boolean;
  actions: { id: string; label: string; role?: Role }[];
};

const alerts: Alert[] = [
  {
    id: "delete",
    label: "Delete…",
    detail: "cancel + destructive roles",
    title: "Delete the photo?",
    description: "This cannot be undone.",
    danger: true,
    actions: [
      { id: "cancel", label: "Cancel", role: "cancel" },
      { id: "delete", label: "Delete", role: "destructive" },
    ],
  },
  {
    id: "save",
    label: "Save changes…",
    detail: "three actions, closeOnEscape",
    title: "Save changes?",
    description: "Your edits to “Trip notes” are not saved yet.",
    dismissable: true,
    actions: [
      { id: "discard", label: "Don't save", role: "destructive" },
      { id: "cancel", label: "Cancel", role: "cancel" },
      { id: "save", label: "Save" },
    ],
  },
  {
    id: "share",
    label: "Share…",
    detail: 'presentation "actionSheet"',
    title: "Share the photo",
    description: "Every label comes from the app.",
    dismissable: true,
    actions: [
      { id: "copy", label: "Copy link" },
      { id: "save", label: "Save" },
      { id: "delete", label: "Delete", role: "destructive" },
      { id: "cancel", label: "Cancel", role: "cancel" },
    ],
  },
];

/** The button an action's role takes (`AlertDialogAction`). */
const actionVariant = (role?: Role): ButtonKind =>
  role === "destructive" ? "danger" : role === "cancel" ? "secondary" : "primary";

/** The row of a card's actions, as `AlertDialogFooter` lays it. */
const footer = {
  flexDirection: "row" as const,
  gap: 8,
  paddingTop: 4,
  justifyContent: desktop ? ("flex-end" as const) : undefined,
  flexWrap: "wrap" as const,
};

function App() {
  const answer = signal("–");
  const shown = signal(0);
  const open = signal<string | null>(null);
  const show = (id: string) => {
    shown.update((n) => n + 1);
    open.set(id);
  };
  const hint = desktop
    ? "Escape or a click outside the action sheet closes it with { action: null }."
    : "A tap outside the action sheet closes it with { action: null }.";
  const chose = (action: string | null) =>
    answer.set(
      action === null
        ? "{ action: null } (closed without an action)"
        : `{ action: ${JSON.stringify(action)} }`,
    );

  return (
    <DemoPage title="Alert Dialog">
      <Text style={{ color: colors.muted }}>
        The platform's own alert; every label comes from the app.
      </Text>

      <Split
        gap={14}
        width={400}
        inspector={
          <>
            <Panel title={`AlertDialog.show resolved with (${shown()} shown)`}>
              <Text style={{ color: colors.accent, fontSize: 14, fontWeight: "600" }}>
                {answer()}
              </Text>
            </Panel>
            <Text style={{ color: colors.faint, fontSize: 12 }}>{hint}</Text>
          </>
        }
      >
        <If when={wide()}>
          <View style={{ ...sectionSurface(), overflow: "hidden" }}>
            {alerts.map((alert, i) => (
              <>
                {i > 0 ? (
                  <View style={{ height: 1, marginLeft: 12, backgroundColor: colors.line }} />
                ) : null}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    height: controlSize.row + 4,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 13, color: colors.muted }}>{alert.detail}</Text>
                  <Button
                    variant={alert.danger ? "danger" : "secondary"}
                    onPress={() => show(alert.id)}
                  >
                    {alert.label}
                  </Button>
                </View>
              </>
            ))}
          </View>
        </If>
        {/* A phone: a row of the list per alert, its name and what it is about. */}
        <If when={!wide()}>
          <View style={sectionSurface({ padded: true })}>
            {alerts.map((alert, i) => (
              <View role="button" onPress={() => show(alert.id)} {...listRow({ first: i === 0 })}>
                <If when={i > 0}>
                  <RowDivider show />
                </If>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontSize: controlSize.label,
                      fontWeight: "600",
                      color: alert.danger ? colors.danger : colors.text,
                    }}
                  >
                    {alert.label}
                  </Text>
                  <Text style={{ fontSize: controlSize.detail, color: colors.muted }}>
                    {alert.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </If>
      </Split>

      {alerts.map((alert) => (
        <Dialog
          open={open() === alert.id}
          animation="fade"
          closeOnEscape={alert.dismissable}
          closeOnBackdropPress={alert.dismissable}
          backdropStyle={backdrop()}
          style={dialogCard(desktop ? 360 : 320)}
          onOpenChange={({ open: next }) => {
            if (next) return;
            open.set(null);
            chose(null);
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={dialogTitle()}>{alert.title}</Text>
            <Text style={dialogText()}>{alert.description}</Text>
          </View>
          <View style={footer}>
            {alert.actions.map((action) => (
              <Button
                variant={actionVariant(action.role)}
                onPress={() => {
                  open.set(null);
                  chose(action.id);
                }}
                style={desktop ? undefined : { flex: 1 }}
              >
                {action.label}
              </Button>
            ))}
          </View>
        </Dialog>
      ))}
    </DemoPage>
  );
}

mount(App);
