// The reference of `alert-dialog.tsx`: the same scene with `nsh/base`'s `AlertDialog.show` called
// where the component's parts would be, the way the official example
// (`references/nsh/website/demos/el-alert-dialog.tsx`) writes it: the box is the system's, so there
// is no look to expand — its options are the page's own. It differs from the component page only in
// the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { AlertDialog as BaseAlertDialog, type AlertDialogOptions } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { controlSize, listRow, RowDivider, sectionSurface } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { desktop, Panel, Split, ui, wide } from "./stage";

type Role = "cancel" | "destructive" | undefined;

/** One alert: what it asks, the buttons it offers, and whether a press outside it dismisses it. */
type Alert = {
  id: string;
  label: string;
  detail: string;
  title: string;
  description: string;
  danger?: boolean;
  dismissable?: boolean;
  presentation?: "alert" | "actionSheet";
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
    presentation: "actionSheet",
    actions: [
      { id: "copy", label: "Copy link" },
      { id: "save", label: "Save" },
      { id: "delete", label: "Delete", role: "destructive" },
      { id: "cancel", label: "Cancel", role: "cancel" },
    ],
  },
];

/** What the component's parts register, as `AlertDialogOptions`: the same box, written out. */
const options = (alert: Alert): AlertDialogOptions => ({
  title: alert.title,
  description: alert.description,
  actions: alert.actions.map((action) => ({
    id: action.id,
    label: action.label,
    role: action.role,
  })),
  presentation: alert.presentation,
  closeOnEscape: alert.dismissable,
  closeOnBackdropPress: alert.dismissable,
});

function App() {
  const answer = signal("–");
  const shown = signal(0);
  const hint = desktop
    ? "Escape or a click outside the action sheet closes it with { action: null }."
    : "A tap outside the action sheet closes it with { action: null }.";
  const chose = (action: string | null) =>
    answer.set(
      action === null
        ? "{ action: null } (closed without an action)"
        : `{ action: ${JSON.stringify(action)} }`,
    );
  const show = (alert: Alert) => {
    shown.update((n) => n + 1);
    BaseAlertDialog.show(options(alert)).then(({ action }) => chose(action ?? null));
  };

  return (
    <DemoPage title="Alert Dialog">
      <Text style={{ color: colors.mutedForeground }}>
        The platform's own alert; every label comes from the app.
      </Text>

      <Split
        gap={14}
        width={400}
        inspector={
          <>
            <Panel title={`AlertDialog.show resolved with (${shown()} shown)`}>
              <Text style={{ color: colors.brand, fontSize: 14, fontWeight: "600" }}>
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
                  <Text style={{ flex: 1, fontSize: 13, color: colors.mutedForeground }}>
                    {alert.detail}
                  </Text>
                  <Button
                    variant={alert.danger ? "destructive" : "secondary"}
                    onPress={() => show(alert)}
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
              <View role="button" onPress={() => show(alert)} {...listRow({ first: i === 0 })}>
                <If when={i > 0}>
                  <RowDivider show />
                </If>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    style={{
                      fontSize: controlSize.label,
                      fontWeight: "600",
                      color: alert.danger ? colors.destructive : colors.foreground,
                    }}
                  >
                    {alert.label}
                  </Text>
                  <Text style={{ fontSize: controlSize.detail, color: colors.mutedForeground }}>
                    {alert.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </If>
      </Split>
    </DemoPage>
  );
}

mount(App);
