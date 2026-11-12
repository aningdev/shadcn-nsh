// The reference of `alert-dialog.tsx`: the dialog look on `nsh/base`'s Dialog, as an alert waits
// for an action (no backdrop / Escape close).
import { mount, platform, signal, Text, View } from "nsh";
import { Button, Dialog } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { dialogCard, dialogText, dialogTitle } from "@/packages/ui/dialog";
import { backdrop } from "@/packages/ui/lib/overlay";

import { DemoPage } from "./kit";

const desktop = platform.desktop;

function App() {
  const open = signal(false);
  const last = signal("–");

  return (
    <DemoPage title="Alert Dialog" note={() => last()}>
      <View style={{ flexDirection: "row" }}>
        <Button
          onPress={() => {
            open.set(true);
            last.set("open: triggerPress");
          }}
          {...buttonLook("danger")}
        >
          <Text style={buttonLabel("danger")}>Delete file…</Text>
        </Button>
      </View>

      <Dialog
        open={open()}
        animation="fade"
        closeOnEscape={false}
        closeOnBackdropPress={false}
        closeOnSwipe={false}
        onOpenChange={(event) => {
          open.set(event.open);
          last.set(`${event.open ? "open" : "closed"}: ${event.reason}`);
        }}
        backdropStyle={backdrop()}
        style={dialogCard(desktop ? 360 : 320)}
      >
        <View style={{ gap: 4 }}>
          <Text style={dialogTitle()}>Delete file?</Text>
          <Text style={dialogText()}>This cannot be undone.</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingTop: 4,
            justifyContent: desktop ? "flex-end" : undefined,
            flexWrap: "wrap",
          }}
        >
          <Button
            onPress={() => {
              open.set(false);
              last.set("cancel");
            }}
            {...buttonLook("secondary")}
          >
            <Text style={buttonLabel("secondary")}>Cancel</Text>
          </Button>
          <Button
            onPress={() => {
              open.set(false);
              last.set("delete");
            }}
            {...buttonLook("danger")}
          >
            <Text style={buttonLabel("danger")}>Delete</Text>
          </Button>
        </View>
      </Dialog>
    </DemoPage>
  );
}

mount(App);
