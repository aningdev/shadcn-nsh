import { colors } from "@shadcn-nsh/theme";
// Toast: the official gallery's scene (`references/nsh/examples/gallery/demos/Toasts.tsx`).
// Kinds, a loading toast that becomes its result, an undo, and a stack. The host is
// `overlays-shared`'s, on `nsh/base`'s manager: the library's `Toast` is the banner, not the queue.
import { Archive, ArrowUp } from "lucide";
import { LayoutAnimation, signal, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
import { Button, buttonLabel } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Switch } from "@/packages/ui/switch";

import { Caption, DemoCard, DemoPage, DemoRow } from "../kit";
import { createEvents, createToaster, pointer, type ToastContent } from "./overlays-shared";

type Log = (line: string) => void;
type ShowToast = (content: ToastContent) => Promise<string | null>;
type UpdateToast = (id: string, change: Partial<ToastContent>) => boolean;
type DismissToast = (id?: string) => void;

type Message = { id: number; from: string; subject: string };

export function ToastDemo() {
  const { log, Events } = createEvents("Show a toast");
  const { toast, updateToast, dismissToast, Toaster } = createToaster();

  return (
    <DemoPage title="Toast">
      <Kinds log={log} toast={toast} updateToast={updateToast} />
      <Upload log={log} toast={toast} updateToast={updateToast} />
      <Undo log={log} toast={toast} />
      <Burst toast={toast} dismissToast={dismissToast} />
      <Events />
      <Toaster />
    </DemoPage>
  );
}

function Kinds(props: { log: Log; toast: ShowToast; updateToast: UpdateToast }) {
  const { log, toast, updateToast } = props;
  const send = async () => {
    const answer = await toast({
      id: "send",
      kind: "error",
      title: "Couldn't send the message",
      description: "You're offline",
      action: "Retry",
      duration: 8000,
    });
    log(`error toast: ${answer ?? "gone"}`);
    if (answer !== "Retry") return;
    void toast({ id: "send", kind: "loading", title: "Sending…", duration: Infinity });
    setTimeout(
      () =>
        updateToast("send", {
          kind: "success",
          title: "Message sent",
          description: "To Mira Chen",
          duration: 3000,
        }),
      1200,
    );
  };
  return (
    <DemoCard title="Kinds" subtitle="Each kind, with what to do next">
      <DemoRow>
        <Button
          variant="secondary"
          onPress={() =>
            void toast({
              kind: "success",
              title: "Changes saved",
              description: "Q3 roadmap.md · just now",
            })
          }
        >
          Save changes
        </Button>
        <Button
          variant="secondary"
          onPress={async () =>
            log(
              `update toast: ${(await toast({ id: "update", kind: "info", title: "Version 2.4 is ready", description: "Restart to finish updating", action: "Restart" })) ?? "gone"}`,
            )
          }
        >
          Check for updates
        </Button>
        <Button
          variant="secondary"
          onPress={() =>
            void toast({
              id: "disk",
              kind: "warning",
              title: "Storage almost full",
              description: "14.2 of 15 GB used",
              action: "Manage",
            })
          }
        >
          Fill the disk
        </Button>
        <Button variant="secondary" onPress={() => void send()}>
          Send a message
        </Button>
      </DemoRow>
      <Caption>Retry turns the error into a loading toast, then its result</Caption>
    </DemoCard>
  );
}

function Upload(props: { log: Log; toast: ShowToast; updateToast: UpdateToast }) {
  const { log, toast, updateToast } = props;
  const failing = signal(false);
  const running = signal(false);
  const photos = 3;
  const start = () => {
    running.set(true);
    log("upload started");
    void toast({
      id: "upload",
      kind: "loading",
      title: `Uploading ${photos} photos`,
      description: `0 of ${photos}`,
      progress: 0,
      close: "Cancel the upload",
      duration: Infinity,
    }).then((answer) => {
      running.set(false);
      log(`upload toast: ${answer ?? "gone"}`);
      if (answer === "Retry") start();
    });
    let done = 0;
    const step = () => {
      done += 1;
      if (failing() && done === photos) {
        updateToast("upload", {
          kind: "error",
          title: "Upload failed",
          description: `${done - 1} of ${photos} uploaded`,
          action: "Retry",
          progress: undefined,
          duration: 8000,
        });
        return;
      }
      if (
        !updateToast("upload", { description: `${done} of ${photos}`, progress: done / photos })
      ) {
        log("upload cancelled");
        return;
      }
      if (done < photos) setTimeout(step, 700);
      else
        setTimeout(
          () =>
            updateToast("upload", {
              kind: "success",
              title: `${photos} photos uploaded`,
              description: "Added to Trip photos",
              action: "View",
              duration: 4000,
            }),
          300,
        );
    };
    setTimeout(step, 700);
  };
  return (
    <DemoCard
      title="Loading, then its result"
      subtitle="Counts its progress, then says what happened"
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Text style={{ flex: 1, fontSize: pointer ? 13 : 15, color: colors.foreground }}>
          Fail the last one
        </Text>
        <Switch
          accessibilityLabel="Fail the last one"
          checked={failing()}
          onChange={({ checked }) => failing.set(checked)}
        />
      </View>
      <Button disabled={running()} onPress={start}>
        <>
          <Icon icon={ArrowUp} size={pointer ? 14 : 16} tint={colors.primaryForeground} />
          <Text style={buttonLabel("default", { disabled: () => running() })}>
            {running() ? "Uploading…" : `Upload ${photos} photos`}
          </Text>
        </>
      </Button>
    </DemoCard>
  );
}

function Undo(props: { log: Log; toast: ShowToast }) {
  const { log, toast } = props;
  const inbox = signal<Message[]>([
    { id: 1, from: "Mira Chen", subject: "Motion review notes" },
    { id: 2, from: "Ravi Patel", subject: "Invoice for October" },
    { id: 3, from: "Ana Silva", subject: "Lunch on Friday?" },
  ]);
  const archive = async (message: Message) => {
    const at = inbox().findIndex((item) => item.id === message.id);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    inbox.set(inbox().filter((item) => item.id !== message.id));
    const answer = await toast({
      id: `archived-${message.id}`,
      title: "Conversation archived",
      description: message.subject,
      action: "Undo",
      close: "Dismiss",
      duration: 6000,
    });
    log(`archive ${message.subject}: ${answer === "Undo" ? "undone" : "kept"}`);
    if (answer !== "Undo") return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    const list = inbox();
    inbox.set([...list.slice(0, at), message, ...list.slice(at)]);
  };
  return (
    <DemoCard title="Undo" subtitle="What was just done, with a way back">
      <If when={inbox().length > 0} else={<Caption>Inbox zero</Caption>}>
        <View>
          <Each of={inbox()} key={(message) => message.id}>
            {(message, index) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 8,
                  borderTopWidth: index() === 0 ? 0 : 1,
                  borderTopColor: colors.line,
                }}
              >
                <Avatar
                  name={message().from}
                  style={{ width: pointer ? 28 : 36, height: pointer ? 28 : 36 }}
                />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      numberOfLines: 1,
                      fontSize: pointer ? 13 : 15,
                      fontWeight: "500",
                      color: colors.foreground,
                    }}
                  >
                    {message().from}
                  </Text>
                  <Text
                    style={{
                      numberOfLines: 1,
                      fontSize: pointer ? 12 : 13,
                      color: colors.mutedForeground,
                    }}
                  >
                    {message().subject}
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  size="sm"
                  accessibilityLabel={`Archive ${message().subject}`}
                  onPress={() => void archive(message())}
                  style={{ width: pointer ? 28 : 40, paddingHorizontal: 0 }}
                >
                  <Icon icon={Archive} size={pointer ? 15 : 18} tint={colors.mutedForeground} />
                </Button>
              </View>
            )}
          </Each>
        </View>
      </If>
    </DemoCard>
  );
}

function Burst(props: { toast: ShowToast; dismissToast: DismissToast }) {
  const { toast, dismissToast } = props;
  const count = signal(0);
  return (
    <DemoCard title="A stack" subtitle="Three show at once; the others wait their turn">
      <DemoRow>
        <Button
          variant="secondary"
          onPress={() => {
            count.set(count() + 1);
            void toast({
              kind: "success",
              title: "Copied",
              description: `The link is on the clipboard (${count()})`,
            });
          }}
        >
          Copy the link
        </Button>
        <Button variant="ghost" onPress={() => dismissToast()}>
          Dismiss all
        </Button>
      </DemoRow>
      <Caption>
        {pointer
          ? "The pointer on the stack spreads it and stops their time; swipe one away"
          : "Touch the stack to spread it; swipe one away"}
      </Caption>
    </DemoCard>
  );
}
