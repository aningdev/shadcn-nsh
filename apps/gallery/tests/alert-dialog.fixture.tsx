import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const action = signal("none");
  const off = signal(false);
  return (
    <View>
      <Text>{() => `action ${action()}`}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <AlertDialog onAction={(event) => action.set(event.action ?? "null")}>
        <AlertDialogTrigger>Open A</AlertDialogTrigger>
        <AlertDialogContent animation="none">
          <AlertDialogDescription>Body A</AlertDialogDescription>
          <AlertDialogAction id="cancel" role="cancel">
            Keep
          </AlertDialogAction>
          <AlertDialogAction id="delete" role="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog onAction={(event) => action.set(event.action ?? "null")}>
        <AlertDialogTrigger>
          <Text>Open B</Text>
        </AlertDialogTrigger>
        <AlertDialogContent animation="none" closeOnEscape>
          <Text>Body B</Text>
          <AlertDialogAction id="ok">OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog>
        <AlertDialogTrigger disabled={off()}>Open C</AlertDialogTrigger>
        <AlertDialogContent animation="none">
          <Text>Body C</Text>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

mount(App);
