import { mount, signal, Text, View } from "nsh";

import { Button } from "../../../packages/ui/button";
import { toast, Toaster } from "../../../packages/ui/toast";

function App() {
  const status = signal("idle");
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>{`status=${status()}`}</Text>
      <Button
        onPress={() => {
          const id = toast("Hello", {
            id: "a",
            duration: Infinity,
            onDismiss: (reason) => status.set(`dismissed ${reason ?? "null"}`),
          });
          status.set(`raised ${id}`);
        }}
      >
        Raise
      </Button>
      <Button
        onPress={() => status.set(toast.update("a", { title: "Updated" }) ? "updated" : "missing")}
      >
        Update
      </Button>
      <Button
        onPress={() => {
          toast("Gone", {
            id: "b",
            duration: Infinity,
            action: { label: "Undo" },
            onDismiss: (reason) => status.set(`dismissed ${reason ?? "null"}`),
          });
        }}
      >
        With undo
      </Button>
      <Button onPress={() => toast.dismiss("a")}>Dismiss</Button>
      <Button onPress={() => status.set(toast.update("missing", { title: "x" }) ? "yes" : "no")}>
        Missing
      </Button>
      <Toaster />
    </View>
  );
}

mount(App);
