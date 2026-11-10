import { toast, Toast, Toaster, toastCloseActive } from "@shadcn-nsh/ui";
import { mount, Text, View } from "nsh";
import { Button as BaseButton } from "nsh/base";

function App() {
  const active = toastCloseActive();
  return (
    <View>
      <Toaster />
      <Text>{`close=${active.transform ? "sink" : "still"}`}</Text>
      <BaseButton onPress={() => toast("Hello", { description: "There" })}>
        <Text>Show</Text>
      </BaseButton>
      <BaseButton onPress={() => toast.dismiss()}>
        <Text>Dismiss</Text>
      </BaseButton>
      <Toast transitionStatus="present" title="Pinned" description="Stays" />
    </View>
  );
}

mount(App);
