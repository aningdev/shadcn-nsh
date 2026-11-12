import { mount, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  Toast,
  toastActionLabel,
  toastActionLook,
  toastCloseLook,
  toastText,
  toastTitle,
} from "@/packages/ui/toast";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Toast">
      <DemoCard>
        <DemoSection title="Message">
          <Toast title="Copied" description="The link is on the clipboard." />
        </DemoSection>
        <DemoSection title="Action">
          <Toast>
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
