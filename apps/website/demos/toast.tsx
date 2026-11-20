// The official toast scene (`references/nsh/website/demos/el-toast.tsx`) with this library's
// parts: three buttons that raise a toast with a title, a description or an undo, the toast stack
// at the foot (bottom-right in a wide window, bottom-centre otherwise), and a log of what the
// queue's lifecycle did.
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import { onToastEvent, toast, Toaster } from "@/packages/ui/toast";

import { DemoPage } from "./kit";
import { desktop, Log, ui } from "./stage";

const events = signal<string[]>([]);
const log = (line: string) => events.set([line, ...events()].slice(0, 6));
onToastEvent((event) => {
  if (event.phase === "push" && event.id) log(`push · ${event.id}`);
  if (event.phase === "presented" && event.id) log(`presented · ${event.id}`);
  if (event.phase === "ending" && event.id) log(`ending · ${event.id}`);
  if (event.phase === "removed" && event.id) log(`removed · ${event.id}`);
  if (event.phase === "expanded") log(`onExpandedChange · ${event.expanded}`);
});

function App() {
  return (
    <DemoPage title="Toast">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Show a few; rest the pointer on the stack to expand it and stop their time"
          : "Show a few; touch the stack to expand it, swipe one right to dismiss it"}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          variant="secondary"
          onPress={() =>
            toast("Copied", {
              description: "The link is on the clipboard",
              duration: 5000,
            })
          }
        >
          Copy the link
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            toast("Draft deleted", {
              duration: 5000,
              action: { label: "Undo" },
            })
          }
        >
          Delete the draft
        </Button>
        <Button variant="secondary" onPress={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </View>
      <Log title="ToastManager.advance · onExpandedChange" lines={events()} minHeight={130} />
      <Toaster />
    </DemoPage>
  );
}

mount(App);
