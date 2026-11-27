// The reference of `alert.tsx`. `alertLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// shadcn's alert scenes with this library's parts: a notice that says what was saved, the same
// notice with a title and no note, and the destructive one — an icon at the leading edge, the
// title beside it, the note under it.
import { AlertCircle, CheckCircle2 } from "lucide";
import { mount, Text, View } from "nsh";

import { ALERT_ICON, Alert, AlertDescription, AlertTitle } from "@/packages/ui/alert";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

function App() {
  return (
    <DemoPage title="Alert">
      <Text style={{ color: ui().muted }}>
        {"A notice of the whole page or form, read out when it appears."}
      </Text>

      <DemoCard>
        <DemoSection title="Default" axis="block">
          <Alert variant="default">
            <Icon icon={CheckCircle2} size={ALERT_ICON} tint={ui().text} />
            <AlertTitle>Changes saved</AlertTitle>
            <AlertDescription>Your changes have been saved.</AlertDescription>
          </Alert>

          <Alert>
            <Icon icon={CheckCircle2} size={ALERT_ICON} tint={ui().text} />
            <AlertTitle>A title and an icon, and no note at all.</AlertTitle>
          </Alert>
        </DemoSection>

        <DemoSection title="Destructive" axis="block">
          <Alert variant="destructive">
            <Icon icon={AlertCircle} size={ALERT_ICON} tint={ui().danger} />
            <AlertTitle>Unable to process your payment.</AlertTitle>
            <AlertDescription>
              Please verify your billing information and try again.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <Icon icon={AlertCircle} size={ALERT_ICON} tint={ui().danger} />
            <AlertDescription>
              The connection was lost before the reply finished. Check the network and try again.
            </AlertDescription>
          </Alert>
        </DemoSection>

        <DemoSection title="A note of the app's own" axis="block">
          <Alert>
            <Icon icon={AlertCircle} size={ALERT_ICON} tint={ui().text} />
            <AlertTitle>Three checks failed</AlertTitle>
            {/* The note is a frame: the app's own lines, in the ink it gives them. */}
            <AlertDescription>
              <View style={{ gap: 4 }}>
                {["The card's number is not valid", "The card has expired"].map((line) => (
                  <Text style={{ fontSize: 13, color: ui().muted }}>{`· ${line}`}</Text>
                ))}
              </View>
            </AlertDescription>
          </Alert>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
