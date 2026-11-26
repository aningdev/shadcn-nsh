// `GlobalShortcut` of nsh/desktop: one shortcut the app listens for while another app has the
// focus. The system may refuse one another app holds; the caption says which happened.
import { cleanup, signal } from "nsh";
import { GlobalShortcut, isAvailable } from "nsh/desktop";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";

import { DemoPage } from "../kit";
import { Caption, Card, Row } from "./platform-shared";

const ACCELERATOR = "ctrl+alt+k";

/** `GlobalShortcut.register` and `unregister`. */
export function GlobalShortcutDemo() {
  const presses = signal(0);
  const status = signal<"off" | "on" | "refused">("off");
  const register = () =>
    GlobalShortcut.register(ACCELERATOR, () => presses.set(presses() + 1)).then(
      () => status.set("on"),
      () => status.set("refused"),
    );
  const unregister = () => {
    GlobalShortcut.unregister(ACCELERATOR);
    status.set("off");
  };
  cleanup(() => GlobalShortcut.unregisterAll());
  return (
    <DemoPage title="Global shortcut">
      <Card
        title="Ctrl+Alt+K"
        subtitle={isAvailable ? "Pressed from any app" : "Desktops only"}
        right={
          <Badge
            tone={status() === "on" ? "success" : status() === "refused" ? "warning" : undefined}
          >
            {{ off: "Not registered", on: "Registered", refused: "Refused" }[status()]}
          </Badge>
        }
      >
        <Row first>
          <Button disabled={!isAvailable || status() === "on"} onPress={() => void register()}>
            Register
          </Button>
          <Button variant="ghost" disabled={status() !== "on"} onPress={unregister}>
            Unregister
          </Button>
        </Row>
        <Caption label={`Pressed ${presses()} times`} />
      </Card>
    </DemoPage>
  );
}
