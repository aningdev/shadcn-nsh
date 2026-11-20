import { colors, finish, mono, rounded, shape } from "@shadcn-nsh/theme";
// Button: the official gallery's scene (`references/nsh/examples/gallery/demos/ButtonDemo.tsx`)
// with this library's parts — the kinds a decision area uses and their sizes, icon buttons, work
// that takes a while shown on the button, a copy row, and a disabled button with its reason.
import { Check, Copy, Download, Link as LinkIcon, Play, Plus, Share, Star, Trash } from "lucide";
import { Clipboard, signal, Text, View } from "nsh";

import { Button, IconButton, RoundButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Switch } from "@/packages/ui/switch";

import { Caption, DemoCard, DemoPage, DemoRow, SizeRow } from "../kit";

/** A command and what it names, for the copy rows. */
const LINES = [
  { what: "command", text: "nsh init my-app --template ts" },
  { what: "key", text: "sk_live_9f3ab2c4d8e1f0a2" },
];

export function ButtonDemo() {
  const presses = signal(0);
  const pressing = signal(false);
  const disabled = signal(false);
  const starred = signal(true);
  const off = signal(false);
  const terms = signal(false);
  const save = signal<"idle" | "busy" | "done">("idle");
  const copied = signal<string | null>(null);
  const last = signal("—");

  const press = (what: string) => last.set(what);
  const runSave = () => {
    if (save() !== "idle") return;
    save.set("busy");
    last.set("Save: started");
    setTimeout(() => {
      save.set("done");
      last.set("Save: done");
      setTimeout(() => save.set("idle"), 1800);
    }, 1200);
  };
  const copy = (what: string, text: string) => {
    void Clipboard.writeText(text);
    copied.set(what);
    last.set(`copied ${what}`);
    setTimeout(() => copied() === what && copied.set(null), 1600);
  };
  const reason = () => (!terms() ? "Accept the terms to publish" : null);

  return (
    <DemoPage title="Button" note={() => `Last event: ${last()}`}>
      <DemoCard title="onPress" subtitle="A press reports itself; a switch disables it">
        <DemoRow>
          <Button
            disabled={disabled()}
            onPress={() => {
              presses.update((n) => n + 1);
              press(`counter ${presses()}`);
            }}
            onPressDown={() => pressing.set(true)}
            onPressUp={() => pressing.set(false)}
          >
            {`Pressed ${presses()}×`}
          </Button>
          <Switch
            checked={disabled()}
            onChange={({ checked }) => {
              disabled.set(checked);
              press(checked ? "disabled the counter" : "enabled the counter");
            }}
            class="flex-row items-center gap-2"
          >
            <Text style={{ fontSize: 13, color: colors.foreground }}>
              {disabled() ? "Enable it" : "Disable it"}
            </Text>
          </Switch>
        </DemoRow>
        <Caption>{`onPressDown ${pressing() ? "pressing…" : "released"} · disabled ${String(disabled())}`}</Caption>
      </DemoCard>

      <DemoCard title="Kinds" subtitle="One main action; the others quieter">
        <DemoRow>
          <Button onPress={() => press("pressed Save")}>Save</Button>
          <Button variant="secondary" onPress={() => press("pressed Duplicate")}>
            Duplicate
          </Button>
          <Button variant="ghost" onPress={() => press("pressed Cancel")}>
            Cancel
          </Button>
          <Button variant="destructive" onPress={() => press("pressed Delete")}>
            Delete
          </Button>
        </DemoRow>
      </DemoCard>

      <DemoCard title="Sizes" subtitle="sm, default and lg, with an icon">
        <SizeRow label="sm">
          <Button size="sm" onPress={() => press("pressed small Continue")}>
            Continue
          </Button>
          <Button size="sm" variant="secondary" onPress={() => press("pressed small Add")}>
            <Icon icon={Plus} size={13} tint={colors.foreground} />
            Add
          </Button>
        </SizeRow>
        <SizeRow label="default">
          <Button onPress={() => press("pressed Continue")}>Continue</Button>
        </SizeRow>
        <SizeRow label="lg">
          <Button size="lg" onPress={() => press("pressed large Continue")}>
            Continue
          </Button>
        </SizeRow>
      </DemoCard>

      <DemoCard title="Icon buttons" subtitle="Each has a name for screen readers">
        <DemoRow>
          <IconButton
            accessibilityLabel={starred() ? "Remove from favorites" : "Add to favorites"}
            selected={starred()}
            onPress={() => {
              starred.set(!starred());
              press(starred() ? "added to favorites" : "removed from favorites");
            }}
          >
            <Icon icon={Star} size={15} tint={starred() ? colors.brand : colors.mutedForeground} />
          </IconButton>
          <IconButton
            accessibilityLabel="Share"
            variant="secondary"
            onPress={() => press("pressed Share")}
          >
            <Icon icon={Share} size={15} tint={colors.foreground} />
          </IconButton>
          <IconButton accessibilityLabel="Download" onPress={() => press("pressed Download")}>
            <Icon icon={Download} size={15} tint={colors.mutedForeground} />
          </IconButton>
          <IconButton
            accessibilityLabel="Move to the trash"
            variant="destructive"
            onPress={() => press("pressed Move to the trash")}
          >
            <Icon icon={Trash} size={15} tint={colors.destructive} />
          </IconButton>
          <RoundButton accessibilityLabel="Play" onPress={() => press("pressed Play")}>
            <Icon icon={Play} size={15} tint={colors.primaryForeground} fill />
          </RoundButton>
        </DemoRow>
      </DemoCard>

      <DemoCard
        title="Work that takes a while"
        subtitle="A spinner while it runs, the result on the button"
      >
        <DemoRow>
          <Button busy={save() === "busy"} onPress={runSave}>
            {save() === "busy" ? "Saving…" : save() === "done" ? "Saved" : "Save changes"}
          </Button>
        </DemoRow>
        <Caption>One press while it runs; the result arrives on the button</Caption>
      </DemoCard>

      <DemoCard title="Copy" subtitle="The icon turns into a check for a moment">
        <Each of={LINES}>
          {(line) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                height: 36,
                paddingLeft: 12,
                paddingRight: 4,
                ...rounded(shape.control),
                borderWidth: 1,
                backgroundColor: colors.field,
                ...finish.field,
                borderColor: colors.input,
              }}
            >
              <Text style={{ flex: 1, fontSize: 12, color: colors.foreground, fontFamily: mono() }}>
                {line().text}
              </Text>
              <IconButton
                accessibilityLabel={copied() === line().what ? "Copied" : `Copy the ${line().what}`}
                onPress={() => copy(line().what, line().text)}
              >
                <Icon
                  icon={copied() === line().what ? Check : Copy}
                  size={15}
                  tint={copied() === line().what ? colors.brand : colors.mutedForeground}
                />
              </IconButton>
            </View>
          )}
        </Each>
        <Button
          variant="secondary"
          onPress={() => copy("link", "https://nsh.dev/join/7f3a")}
          class="flex-row items-center gap-2"
        >
          <Icon
            icon={copied() === "link" ? Check : LinkIcon}
            size={13}
            tint={copied() === "link" ? colors.brand : colors.foreground}
          />
          {copied() === "link" ? "Copied" : "Copy invite link"}
        </Button>
      </DemoCard>

      <DemoCard title="Disabled, with its reason" subtitle="Say what to do, next to the button">
        <View style={{ gap: 2 }}>
          <Row label="I accept the terms" value={terms()} onChange={(v) => terms.set(v)} />
          <Row label="Turn every button off" value={off()} onChange={(v) => off.set(v)} />
        </View>
        <DemoRow>
          <Button
            disabled={off() || !terms()}
            onPress={() => {
              press("published");
              setTimeout(() => press("—"), 2000);
            }}
          >
            Publish
          </Button>
          <Button variant="secondary" disabled={off()} onPress={() => press("pressed Archive")}>
            Archive
          </Button>
          <If when={reason()}>
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{reason()}</Text>
          </If>
        </DemoRow>
      </DemoCard>
    </DemoPage>
  );
}

/** A label and its switch, as the disabled demo's rows. */
function Row(props: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <Switch
      class="flex-row items-center gap-2"
      checked={props.value}
      onChange={({ checked }) => props.onChange(checked)}
    >
      <Text style={{ fontSize: 13, color: colors.foreground }}>{props.label}</Text>
    </Switch>
  );
}
