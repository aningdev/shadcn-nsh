import { mount, signal, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../packages/ui";

function App() {
  const action = signal("none");
  const value = signal("none");
  // A controlled root: the app keeps the flag and mirrors what the component reports.
  const open = signal(false);
  const off = signal(false);
  return (
    <View>
      <Text>{() => `action ${action()}`}</Text>
      <Text>{() => `open ${String(open())}`}</Text>
      <Text>{() => `value ${value()}`}</Text>
      <BaseButton onPress={() => off.set(true)}>
        <Text>Flip</Text>
      </BaseButton>
      <BaseButton onPress={() => open.set(true)}>
        <Text>Show B</Text>
      </BaseButton>

      {/* A: every part, the cancel one included, in the order they are written. */}
      <AlertDialog onAction={(event) => action.set(event.action ?? "null")}>
        <AlertDialogTrigger testID="open-a">Open A</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete the photo?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction id="delete" role="destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* B: opened by the app, not by a trigger, and closable with Escape. */}
      <AlertDialog
        open={open()}
        onOpenChange={({ open: next }) => open.set(next)}
        onAction={(event) => action.set(event.action ?? "null")}
      >
        <AlertDialogContent closeOnEscape>
          <AlertDialogHeader>
            <AlertDialogTitle>Save changes?</AlertDialogTitle>
            <AlertDialogDescription>Your edits are not saved yet.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction id="save">Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* D: an alert with a text field, its text reported with the action. */}
      <AlertDialog
        onAction={(event) => {
          action.set(event.action ?? "null");
          value.set(event.value ?? "null");
        }}
      >
        <AlertDialogTrigger>Open D</AlertDialogTrigger>
        <AlertDialogContent input={{ defaultValue: "Untitled", placeholder: "Name" }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename the photo</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction id="rename">Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* C: a trigger that is disabled until the app flips it. */}
      <AlertDialog>
        <AlertDialogTrigger disabled={off()}>Open C</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Body C</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction id="ok">OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}

mount(App);
