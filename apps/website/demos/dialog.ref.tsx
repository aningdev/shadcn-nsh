// The reference of `dialog.tsx`. `dialogCard` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
import { mount, Scroll, signal, Text, View } from "nsh";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/packages/ui/dialog";
import { listRow, RowLabel } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { desktop, Panel, Split, ui, wide } from "./stage";

function App() {
  const card = signal(false);
  const long = signal(false);
  const sheet = signal(false);
  const backdropCloses = signal(true);
  const cancels = signal(0);
  const log = signal("–");
  const hint = desktop
    ? "Close with Escape or a click on the backdrop; a body taller than the window scrolls."
    : "Close with a tap on the backdrop, a swipe down or the back button. On iOS the sheet is a system pageSheet.";
  const state = () =>
    `open: card ${String(card())} · sheet ${String(sheet())} · onCancel ${cancels()}×`;
  // The app's own close: the base reports it as the user's, so the app's line stays.
  const closedByApp = (what: string) => () => log.set(`closed by the app: ${what}`);
  const heard = (open: boolean, reason: string) => {
    if (!open && reason === "closePress") return;
    log.set(`onOpenChange({ open: ${String(open)}, reason: "${reason}" })`);
  };

  return (
    <DemoPage title="Dialog">
      <Text style={{ color: ui().muted }}>{hint}</Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open · onCancel">
              <Text style={{ fontSize: 13, color: ui().text }}>{state()}</Text>
            </Panel>
            <Panel title="onOpenChange({ open, reason }) · onOpen" grow>
              <Text style={{ fontSize: 13, fontWeight: "600", color: ui().accent }}>{log()}</Text>
            </Panel>
          </>
        }
      >
        <View
          style={{
            flexDirection: wide() ? "row" : "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Dialog
            open={card()}
            onOpenChange={({ open, reason }) => {
              card.set(open);
              heard(open, reason);
            }}
            onOpen={() => log.set("onOpen: card")}
            onCancel={() => cancels.update((n) => n + 1)}
          >
            <DialogTrigger
              variant="default"
              style={wide() ? undefined : { flex: 1, alignSelf: "stretch" }}
            >
              Open a card
            </DialogTrigger>
            <DialogContent width={desktop ? 360 : 320} closeOnBackdropPress={backdropCloses()}>
              <DialogTitle>Delete this item?</DialogTitle>
              <DialogDescription>
                {backdropCloses()
                  ? "A press on the dimmed backdrop closes it."
                  : "The backdrop only calls onCancel: close with a button."}
              </DialogDescription>
              <DialogFooter>
                <DialogClose
                  onPress={closedByApp("Keep")}
                  style={desktop ? undefined : { flex: 1 }}
                >
                  Keep
                </DialogClose>
                <DialogClose
                  variant="destructive"
                  onPress={closedByApp("Delete")}
                  style={desktop ? undefined : { flex: 1 }}
                >
                  Delete
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={long()} onOpenChange={({ open }) => long.set(open)}>
            <DialogTrigger style={wide() ? undefined : { flex: 1, alignSelf: "stretch" }}>
              Open a long one
            </DialogTrigger>
            <DialogContent width={desktop ? 360 : 320}>
              <DialogTitle>Release notes</DialogTitle>
              <DialogDescription>
                The card is never taller than the window holds, 24 points clear of either edge: the
                body scrolls and the actions stay at the end.
              </DialogDescription>
              <View style={{ gap: 8 }}>
                {Array.from({ length: 9 }, (_, i) => (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      paddingVertical: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: ui().line,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 13, color: ui().text }}>
                      {`Line ${i + 1}: a part of a long body`}
                    </Text>
                    <Text style={{ fontSize: 12, color: ui().muted }}>{`${i + 1}/9`}</Text>
                  </View>
                ))}
              </View>
              <DialogFooter>
                <DialogClose>Close</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={sheet()}
            onOpenChange={({ open, reason }) => {
              sheet.set(open);
              heard(open, reason);
            }}
            onOpen={() => log.set("onOpen: sheet")}
            onCancel={() => cancels.update((n) => n + 1)}
          >
            <DialogTrigger style={wide() ? undefined : { flex: 1, alignSelf: "stretch" }}>
              Open as a page sheet
            </DialogTrigger>
            <DialogContent presentation="pageSheet">
              <DialogTitle>A sheet</DialogTitle>
              <DialogDescription>
                presentation="pageSheet": a system sheet on iOS that follows the finger when swiped
                down, drawn by the system (no card of the library's). Elsewhere the dialog is a
                layer over the window, and the card stands.
              </DialogDescription>
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <DialogClose variant="default">Close</DialogClose>
              </View>
            </DialogContent>
          </Dialog>
        </View>

        <Switch
          checked={backdropCloses()}
          onChange={({ checked }) => backdropCloses.set(checked)}
          {...listRow({
            style: { alignSelf: wide() ? "center" : undefined },
          })}
        >
          <RowLabel label={`closeOnBackdropPress ${String(backdropCloses())}`} />
        </Switch>
      </Split>
    </DemoPage>
  );
}

mount(App);
