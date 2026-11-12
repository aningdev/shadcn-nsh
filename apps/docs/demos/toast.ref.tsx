// The reference of `toast.tsx`: the look on `nsh/base`'s Toast.
import { mount, Text, View } from "nsh";
import { Button, Toast } from "nsh/base";

import {
  toastActionLabel,
  toastActionLook,
  toastCloseLook,
  toastLook,
  toastText,
  toastTitle,
} from "@/packages/ui/toast";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Toast">
      <DemoCard>
        <DemoSection title="Message">
          <Toast style={toastLook()}>
            <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
              <Text style={toastTitle()}>Copied</Text>
              <Text style={toastText()}>The link is on the clipboard.</Text>
            </View>
          </Toast>
        </DemoSection>
        <DemoSection title="Action">
          <Toast style={toastLook()}>
            <View style={{ flex: 1, gap: 2, minWidth: 0 }}>
              <Text style={toastTitle()}>Deleted</Text>
              <Text style={toastText()}>Move to trash</Text>
            </View>
            <Button {...toastActionLook()}>
              <Text style={toastActionLabel()}>Undo</Text>
            </Button>
            <View {...toastCloseLook()} accessibilityLabel="Dismiss">
              <Text style={{ fontSize: 14 }}>×</Text>
            </View>
          </Toast>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
