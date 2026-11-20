// The official alert dialog scene (`references/nsh/website/demos/el-alert-dialog.tsx`) with this
// library's parts: three alerts — a warning, one with Escape, one as an action sheet — each listed
// with what it is about and opened by its own card (a phone) or button, and an inspector holding
// what the last one resolved with. The parts register the text; `AlertDialogContent` shows the
// system's alert.
import { focusRing } from "@shadcn-nsh/theme";
import { mount, signal, Text, token, View } from "nsh";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/packages/ui/alert-dialog";
import { Button } from "@/packages/ui/button";
import { pressSink } from "@/packages/ui/lib/press";
import { controlSize, sectionSurface } from "@/packages/ui/lib/surface";

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

function App() {
  const answer = signal("–");
  const shown = signal(0);
  // The app's own copy of the open state: the component reports every change, the app follows.
  const open = signal<string | null>(null);
  // A card sinks while pressed, natively, as every button does.
  const sink = pressSink();
  const opened = (id: string) => {
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
      <Text style={{ color: ui().muted }}>
        The platform's own alert; every label comes from the app.
      </Text>

      <Split
        gap={14}
        width={400}
        inspector={
          <>
            <Panel title={`AlertDialog.show resolved with (${shown()} shown)`}>
              <Text style={{ color: ui().accent, fontSize: 14, fontWeight: "600" }}>
                {answer()}
              </Text>
            </Panel>
            <Text style={{ color: ui().faint, fontSize: 12 }}>{hint}</Text>
          </>
        }
      >
        <If when={wide()}>
          <View style={{ ...sectionSurface(), overflow: "hidden" }}>
            {alerts.map((alert, i) => (
              <>
                {i > 0 ? (
                  <View style={{ height: 1, marginLeft: 12, backgroundColor: ui().line }} />
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
                  <Text style={{ flex: 1, fontSize: 13, color: ui().muted }}>{alert.detail}</Text>
                  <AlertDialog
                    open={open() === alert.id}
                    onOpenChange={({ open: next }) => {
                      if (next) opened(alert.id);
                      else if (open() === alert.id) open.set(null);
                    }}
                    onAction={({ action }) => chose(action)}
                  >
                    <AlertDialogTrigger variant={alert.danger ? "destructive" : "secondary"}>
                      {alert.label}
                    </AlertDialogTrigger>
                    <TheAlert alert={alert} />
                  </AlertDialog>
                </View>
              </>
            ))}
          </View>
        </If>
        {/* A phone: a card per alert, its name and what it is about, the whole card pressable and
            sinking while pressed. The app opens the alert itself here, so a controlled `open` is
            what shows it. */}
        <If when={!wide()}>
          <View style={{ gap: 10 }}>
            {alerts.map((alert) => (
              <View
                role="button"
                onPress={() => opened(alert.id)}
                style={{ ...sectionSurface({ padded: true }), ...sink.transition }}
                hoverStyle={{ backgroundColor: token("accent") }}
                activeStyle={sink.activeStyle}
                focusVisibleStyle={focusRing()}
              >
                <View style={{ gap: 2 }}>
                  <Text
                    style={{
                      fontSize: controlSize.label,
                      fontWeight: "600",
                      color: alert.danger ? ui().danger : ui().text,
                    }}
                  >
                    {alert.label}
                  </Text>
                  <Text style={{ fontSize: controlSize.detail, color: ui().muted }}>
                    {alert.detail}
                  </Text>
                </View>
                <AlertDialog
                  open={open() === alert.id}
                  onOpenChange={({ open: next }) => {
                    if (next) opened(alert.id);
                    else if (open() === alert.id) open.set(null);
                  }}
                  onAction={({ action }) => chose(action)}
                >
                  <TheAlert alert={alert} />
                </AlertDialog>
              </View>
            ))}
          </View>
        </If>
      </Split>
    </DemoPage>
  );
}

/** One alert's box, from its parts: the title and message the system draws, and its buttons. */
function TheAlert(props: { alert: Alert }) {
  return (
    <AlertDialogContent
      presentation={props.alert.presentation}
      closeOnEscape={props.alert.dismissable}
      closeOnBackdropPress={props.alert.dismissable}
    >
      <AlertDialogHeader>
        <AlertDialogTitle>{props.alert.title}</AlertDialogTitle>
        <AlertDialogDescription>{props.alert.description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        {props.alert.actions.map((action) => (
          <AlertDialogAction id={action.id} role={action.role}>
            {action.label}
          </AlertDialogAction>
        ))}
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

mount(App);
