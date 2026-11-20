// Notifications of nsh: the permission asked for when the user wants notifications, one shown and
// replaced under its id, its press, and the badge on the app's icon.
import { cleanup, signal } from "nsh";
import { Notifications } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";

import { DemoPage } from "../kit";
import { Caption, Card, Note, Row } from "./platform-shared";

/** The message of a failure, for the scene's caption. */
function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** `Notifications` of `nsh`: permission, a message, the badge. */
export function NotificationsDemo() {
  const permission = signal("…");
  const last = signal("Nothing pressed yet");
  const badge = signal(0);
  const asked = async (value: Promise<string>) => {
    try {
      permission.set(await value);
    } catch (error) {
      permission.set(message(error));
    }
  };
  // A host without the notifications capability refuses the listener too.
  try {
    cleanup(Notifications.on("press", ({ id }) => last.set(`Pressed ${id}`)));
  } catch (error) {
    last.set(message(error));
  }
  void asked(Notifications.permission());

  const setBadge = (count: number) => {
    badge.set(count);
    void Notifications.setBadge(count).catch((error) => last.set(message(error)));
  };
  const show = (id: string, title: string, body: string) =>
    void Notifications.show({ id, title, body }).then(
      (shown) => {
        if (!shown) last.set("Not shown: allow notifications first");
      },
      (error) => last.set(message(error)),
    );

  return (
    <DemoPage title="Notifications">
      <Card title="Permission" subtitle="Asked once, when the user wants them">
        <Row first>
          <Button onPress={() => asked(Notifications.requestPermission())}>
            Allow notifications
          </Button>
          <Badge>{permission()}</Badge>
        </Row>
      </Card>
      <Card title="A message" subtitle="The same id replaces it; a press reports it">
        <Row first>
          <Button onPress={() => show("chat:ada", "Ada", "Are you coming tonight?")}>Show</Button>
          <Button
            variant="secondary"
            onPress={() => show("chat:ada", "Ada", "I saved you a seat.")}
          >
            Replace
          </Button>
          <Button
            variant="ghost"
            onPress={() =>
              void Notifications.close("chat:ada").catch((error) => last.set(message(error)))
            }
          >
            Remove
          </Button>
        </Row>
        <Caption label={last()} />
      </Card>
      <Card title="Badge" subtitle="The count on the app's icon, in the Dock on macOS">
        <Row first>
          <Button onPress={() => setBadge(badge() + 1)}>Add one</Button>
          <Button variant="ghost" onPress={() => setBadge(0)}>
            Clear
          </Button>
          <Badge>{String(badge())}</Badge>
        </Row>
        <Note>
          Notifications need the host's permission and show outside the window; the caption reports
          what the system answered.
        </Note>
      </Card>
    </DemoPage>
  );
}
