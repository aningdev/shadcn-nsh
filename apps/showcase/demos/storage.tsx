// nsh/storage: a count of this demo's openings, a note saved as it is typed, and every key the app
// keeps, all still there after a restart. The scenes follow the official gallery's Storage demo.
import { colors } from "@shadcn-nsh/theme";
import { Check } from "lucide";
import { type Accessor, signal } from "nsh";
import { Storage } from "nsh";
import { Text, View } from "nsh";
import { AlertDialog } from "nsh/base";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { Input } from "@/packages/ui/input";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoPage } from "../kit";
import { Caption, Card, Figure, Note as Footnote, Row, count, monoText } from "./platform-shared";

const LAUNCHES = "launches";
const NOTE = "note";

type Entry = { key: string; length: number };

/** How the note's last write stands: what its row under the field says. */
type Saved = "idle" | "saving" | "saved" | "failed";

/** The launch count this demo wrote, and the call that wrote it. */
function Launches(props: { launches: Accessor<number | null> }) {
  return (
    <Card
      title="Launches"
      subtitle="Counted each time this demo opens"
      right={<Badge tone="up">Kept</Badge>}
    >
      <Figure
        value={props.launches() === null ? "–" : String(props.launches())}
        unit={props.launches() === 1 ? "opening" : "openings"}
      />
      <Text style={monoText()}>{`setItem("${LAUNCHES}", "${props.launches() ?? ""}")`}</Text>
    </Card>
  );
}

/** The note, saved as it is typed, and how its last write stands. */
function NoteCard(props: {
  note: Accessor<string>;
  saved: Accessor<Saved>;
  onWrite: (event: { value: string }) => void;
}) {
  const hint = () =>
    ({ idle: "", saving: "Saving…", saved: "Saved", failed: "Not saved" })[props.saved()];
  const hintTint = () =>
    props.saved() === "failed"
      ? colors.destructive
      : props.saved() === "saved"
        ? colors.up
        : colors.faint;
  return (
    <Card title="Note" subtitle="Saved as you type, back when the demo opens again">
      <Input
        multiline
        value={props.note()}
        onChange={props.onWrite}
        placeholder="Write something, then come back to it"
        accessibilityLabel="Note"
        style={{ height: 120 }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 16 }}>
        <If when={props.saved() === "saved"}>
          <Icon icon={Check} size={14} tint={colors.up} />
        </If>
        <Text style={{ flex: 1, fontSize: 12, color: hintTint() }}>{hint()}</Text>
        <Text style={{ fontSize: 12, color: colors.faint, fontVariant: ["tabular-nums"] }}>
          {count(props.note().length, "char")}
        </Text>
      </View>
    </Card>
  );
}

/** Every key the app keeps, with its value's length, and the way to clear them all. */
function Keys(props: { entries: Accessor<Entry[]>; onClear: () => void }) {
  const total = () =>
    props.entries().reduce((sum, entry) => sum + entry.key.length + entry.length, 0);
  return (
    <Card title="Stored keys" subtitle="keys() and each value's length">
      <If when={props.entries().length > 0} else={<Caption label="Nothing stored" />}>
        <View>
          <Each of={props.entries()}>
            {(entry, i) => (
              <Row first={i() === 0}>
                <Text style={[monoText(14), { flex: 1, numberOfLines: 1 }]}>{entry().key}</Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.mutedForeground,
                    fontVariant: ["tabular-nums"],
                  }}
                >
                  {count(entry().length, "char")}
                </Text>
              </Row>
            )}
          </Each>
        </View>
      </If>
      <Caption label={count(props.entries().length, "key")} note={`${total()} chars of 5 MB`} />
      <Button variant="secondary" disabled={props.entries().length === 0} onPress={props.onClear}>
        Clear all
      </Button>
      <Footnote>
        The data stays on this device and survives restarts, under the app's id from nsh.json.
      </Footnote>
    </Card>
  );
}

/**
 * `Storage` of `nsh`: a count of this demo's openings, a note saved as it is typed, and the keys
 * the app keeps (the showcase's own last screens among them), all still there after a restart.
 */
export function StorageDemo() {
  const launches = signal<number | null>(null);
  const note = signal("");
  const saved = signal<Saved>("idle");
  const entries = signal<Entry[]>([]);

  const refresh = async () => {
    try {
      const keys = await Storage.keys();
      const rows = await Promise.all(
        keys.map(async (key) => ({ key, length: (await Storage.getItem(key))?.length ?? 0 })),
      );
      entries.set(rows);
    } catch {
      // A host without the storage capability keeps nothing: the scene still draws.
      entries.set([]);
    }
  };

  // Calls run in order: the read sees what earlier writes left, and the write reaches the disk in
  // the background while it is in memory at once.
  const open = async () => {
    try {
      const stored = Number.parseInt((await Storage.getItem(LAUNCHES)) ?? "", 10) || 0;
      const next = stored + 1;
      launches.set(next);
      await Storage.setItem(LAUNCHES, String(next));
      note.set((await Storage.getItem(NOTE)) ?? "");
    } catch {
      launches.set(null);
    }
    await refresh();
  };
  void open();

  const write = ({ value: text }: { value: string }) => {
    note.set(text);
    saved.set("saving");
    (text ? Storage.setItem(NOTE, text) : Storage.removeItem(NOTE)).then(
      async () => {
        saved.set("saved");
        await refresh();
      },
      () => saved.set("failed"),
    );
  };

  const clearAll = async () => {
    const { action } = await AlertDialog.show({
      title: "Clear the storage?",
      description: "Removes every key the app keeps, the launch count and the note among them.",
      actions: [
        { label: "Cancel", role: "cancel", id: "cancel" },
        { label: "Clear", role: "destructive", id: "clear" },
      ],
      closeOnEscape: true,
      closeOnBackdropPress: true,
    });
    if (action !== "clear") return;
    try {
      await Storage.clear();
    } catch {
      // Nothing to clear on a host without storage.
    }
    launches.set(0);
    note.set("");
    saved.set("idle");
    await refresh();
  };

  return (
    <DemoPage title="Storage">
      <Launches launches={launches} />
      <NoteCard note={note} saved={saved} onWrite={write} />
      <Keys entries={entries} onClear={() => void clearAll()} />
    </DemoPage>
  );
}
