// The reference of `toast.tsx`: the same scene with the toast's look (`toastLook`, `toastTitle`,
// `toastText`, `toastActionLook`, `toastActionLabel`) spread on `nsh/base`'s Toast, in the
// manager's stack, the way the official example (`references/nsh/website/demos/el-toast.tsx`)
// writes it. It differs from the component page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, Overlay, safeArea, signal, Text, View } from "nsh";
import { Toast as BaseToast, ToastManager, ToastStack, type ToastEntry } from "nsh/base";

import { Button } from "@/packages/ui/button";
import {
  toastActionLabel,
  toastActionLook,
  toastLook,
  toastText,
  toastTitle,
} from "@/packages/ui/toast";

import { DemoPage } from "./kit";
import { desktop, Log, wide } from "./stage";

/** What the demo's toasts show. */
type Content = { title: string; description?: string; undo?: boolean };

function App() {
  const manager = new ToastManager();
  const shown = signal<ToastEntry[]>([]);
  const expanded = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 6));
  const sync = () => shown.set(manager.visible(3));
  // The lifecycle advances on the app's timer, paused while the stack is expanded.
  setInterval(() => {
    const advanced = manager.advance(expanded());
    for (const id of advanced.presented) log(`presented · ${id}`);
    for (const id of advanced.ending) log(`ending · ${id}`);
    for (const removed of advanced.removed) log(`removed · ${removed.id}`);
    if (advanced.changed) sync();
  }, 50);
  let count = 0;
  const push = (content: Content) => {
    const id = `toast-${++count}`;
    manager.push(id, content, { timeout: 5000 });
    log(`push · ${id}`);
    sync();
  };
  const dismiss = (id: string) => {
    manager.dismiss(id);
    sync();
  };

  return (
    <DemoPage title="Toast">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Show a few; rest the pointer on the stack to expand it and stop their time"
          : "Show a few; touch the stack to expand it, swipe one right to dismiss it"}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button
          variant="secondary"
          onPress={() => push({ title: "Copied", description: "The link is on the clipboard" })}
        >
          Copy the link
        </Button>
        <Button variant="secondary" onPress={() => push({ title: "Draft deleted", undo: true })}>
          Delete the draft
        </Button>
        <Button
          variant="secondary"
          onPress={() => {
            manager.dismissAll();
            sync();
          }}
        >
          Dismiss all
        </Button>
      </View>
      <Log
        title="ToastManager.advance · onExpandedChange"
        lines={events()}
        minHeight={130}
        grow={false}
      />

      <Overlay
        style={{
          pointerEvents: "box-none",
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          paddingBottom: safeArea().bottom + 16,
          alignItems: wide() ? "flex-end" : "center",
        }}
      >
        <ToastStack
          placement={wide() ? "bottomRight" : "bottomCenter"}
          style={{ width: 340, maxWidth: "100%" }}
          onExpandedChange={({ expanded: open }) => {
            expanded.set(open);
            log(`onExpandedChange · ${open}`);
          }}
          onCancel={() => {
            const newest = shown()
              .filter((entry) => entry.status !== "ending")
              .at(-1);
            if (newest) dismiss(newest.id);
          }}
        >
          {shown().map((entry) => {
            const content = entry.value as Content;
            return (
              <BaseToast
                style={toastLook()}
                transitionStatus={entry.status}
                accessibilityLabel={content.title}
                onDismissRequest={() => dismiss(entry.id)}
                class="transition-all duration-200 ease-out"
                startingClass="opacity-0 translate-y-4"
                endingClass="opacity-0 scale-95"
                swipingClass="transition-none"
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={toastTitle()}>{content.title}</Text>
                  <If when={content.description}>
                    <Text style={toastText()}>{content.description}</Text>
                  </If>
                </View>
                <If when={content.undo}>
                  <Button
                    {...toastActionLook()}
                    onPress={() => dismiss(entry.id)}
                    accessibilityLabel="Undo"
                  >
                    <Text style={toastActionLabel()}>Undo</Text>
                  </Button>
                </If>
              </BaseToast>
            );
          })}
        </ToastStack>
      </Overlay>
    </DemoPage>
  );
}

mount(App);
