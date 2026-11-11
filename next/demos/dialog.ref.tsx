// The reference of `dialog.tsx`: the looks spread on `nsh/base`'s Dialog and Button, as
// upstream's dialog demo (`el-dialog`) writes them.
import { colors } from "@shadcn-nsh/theme";
import { mount, platform, signal, Text, View } from "nsh";
import { Button, Dialog } from "nsh/base";

import { buttonLabel, buttonLook } from "../ui/button";
import { dialogCard, dialogText, dialogTitle } from "../ui/dialog";
import { backdrop } from "../ui/lib/overlay";

const desktop = platform.desktop;

function App() {
  const open = signal(false);
  const last = signal("–");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 14 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Dialog</Text>
      <View style={{ flexDirection: "row" }}>
        <Button
          onPress={() => {
            open.set(true);
            last.set("open: triggerPress");
          }}
          {...buttonLook("primary")}
        >
          <Text style={buttonLabel("primary")}>Delete item…</Text>
        </Button>
      </View>
      <Text style={{ fontSize: 13, color: colors.muted }}>{last()}</Text>

      <Dialog
        open={open()}
        animation="fade"
        onOpenChange={(event) => {
          open.set(event.open);
          last.set(`${event.open ? "open" : "closed"}: ${event.reason}`);
        }}
        backdropStyle={backdrop()}
        style={dialogCard(desktop ? 360 : 320)}
      >
        <Text style={dialogTitle()}>Delete this item?</Text>
        <Text style={dialogText()}>A press on the dimmed backdrop closes it.</Text>
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            paddingTop: 4,
            justifyContent: desktop ? "flex-end" : undefined,
          }}
        >
          <Button onPress={() => open.set(false)} {...buttonLook("secondary")}>
            <Text style={buttonLabel("secondary")}>Keep</Text>
          </Button>
          <Button onPress={() => open.set(false)} {...buttonLook("danger")}>
            <Text style={buttonLabel("danger")}>Delete</Text>
          </Button>
        </View>
      </Dialog>
    </View>
  );
}

mount(App);
