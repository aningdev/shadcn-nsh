import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

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

function App() {
  const action = signal("none");
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        Alert dialog
      </Text>
      <AlertDialog onAction={(event) => action.set(event.action ?? "dismissed")}>
        <AlertDialogTrigger>Delete file</AlertDialogTrigger>
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
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        {() => `Action: ${action()}`}
      </Text>
    </View>
  );
}

mount(App);
