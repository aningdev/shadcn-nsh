// The official dialog scene (`references/nsh/website/demos/el-dialog.tsx`) with this library's
// parts: a card opened from a button and a page sheet opened from another, a switch for whether
// the backdrop closes the card, and an inspector holding both open flags, the cancel count and
// the last lifecycle line.
import { mount, signal, Text, View, type ViewStyle } from "nsh";

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

/** The page sheet's own panel: a card in the middle with a pointer, a sheet along the bottom edge
 * on a touch screen (the dialog's look is a card, so the app gives this one its place). */
const sheetPanel = (): ViewStyle =>
  desktop
    ? { margin: "auto", width: 480, maxWidth: "90%", maxHeight: "90%" }
    : {
        marginTop: "auto",
        marginBottom: 0,
        width: "100%",
        maxWidth: 560,
        maxHeight: "90%",
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: 24,
      };

function App() {
  const card = signal(false);
  const sheet = signal(false);
  const backdropCloses = signal(true);
  const cancels = signal(0);
  const log = signal("–");
  const hint = desktop
    ? "Close with Escape or a click on the backdrop."
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
              variant="primary"
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
                  variant="danger"
                  onPress={closedByApp("Delete")}
                  style={desktop ? undefined : { flex: 1 }}
                >
                  Delete
                </DialogClose>
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
            <DialogContent presentation="pageSheet" style={sheetPanel()}>
              <DialogTitle>A sheet</DialogTitle>
              <DialogDescription>
                presentation="pageSheet": a system sheet on iOS that follows the finger when swiped
                down. Elsewhere the dialog is a layer over the window, and this panel is the app's
                own style.
              </DialogDescription>
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                <DialogClose variant="primary">Close</DialogClose>
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
