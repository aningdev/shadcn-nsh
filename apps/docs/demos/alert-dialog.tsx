import { mount, signal, View } from "nsh";

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

import { DemoPage } from "./kit";

function App() {
  const last = signal("–");

  return (
    <DemoPage title="Alert Dialog" note={() => last()}>
      <View style={{ flexDirection: "row" }}>
        <AlertDialog
          onAction={(event) => last.set(event.action ?? "dismissed")}
          onOpenChange={({ open, reason }) => last.set(`${open ? "open" : "closed"}: ${reason}`)}
        >
          <AlertDialogTrigger variant="danger">Delete file…</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete file?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction id="cancel" role="cancel">
                Cancel
              </AlertDialogAction>
              <AlertDialogAction id="delete" role="destructive">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
    </DemoPage>
  );
}

mount(App);
