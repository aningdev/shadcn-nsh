import { colors } from "@shadcn-nsh/theme";
// Tooltip: the official gallery's scene (`references/nsh/examples/gallery/demos/Tooltips.tsx`)
// with this library's parts. A toolbar, delays, sides, a rich card of reviewers, and one the app
// pins open. Touch screens show a tooltip only when the app opens it.
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Hand,
  Image as ImageIcon,
  MessageCircle,
  Pencil,
  Redo2,
  Type,
  Undo2,
  type IconNode,
} from "lucide";
import { keymap, signal, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button, IconButton } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Separator } from "@/packages/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  tooltipNote,
  tooltipText,
} from "@/packages/ui/tooltip";

import { Caption, DemoCard, DemoPage, DemoRow } from "../kit";
import { createEvents, pointer } from "./overlays-shared";

type Tool = { id: string; icon: IconNode; label: string; key: string; hint: string };

const tools: Tool[] = [
  { id: "move", icon: Hand, label: "Move", key: "v", hint: "Drag to move what is selected" },
  { id: "text", icon: Type, label: "Text", key: "t", hint: "Click to add a text box" },
  { id: "pen", icon: Pencil, label: "Pen", key: "p", hint: "Draw a path, point by point" },
  { id: "image", icon: ImageIcon, label: "Image", key: "i", hint: "Place a picture" },
  {
    id: "comment",
    icon: MessageCircle,
    label: "Comment",
    key: "c",
    hint: "Leave a note for the team",
  },
];

const reviewers = ["Mira Chen", "Ravi Patel", "Ana Silva"];

function TipLabel(props: { label: string; shortcut?: string }) {
  return (
    <>
      <Text class={tooltipText}>{props.label}</Text>
      <If when={props.shortcut}>
        <Text class={tooltipNote}>{props.shortcut}</Text>
      </If>
    </>
  );
}

export function TooltipDemo() {
  const { log, Events } = createEvents(
    pointer ? "Rest the pointer on a button" : "Pin the tooltip",
  );

  return (
    <DemoPage title="Tooltip">
      <Toolbar log={log} />
      <Delays log={log} />
      <Sides log={log} />
      <Rich />
      <Pinned log={log} />
      <Events />
    </DemoPage>
  );
}

function ToolButton(props: {
  label: string;
  icon: IconNode;
  selected?: boolean;
  disabled?: boolean;
  shortcut?: string;
  onPress: () => void;
}) {
  return (
    <Tooltip placement="bottom" disabled={!pointer}>
      <TooltipTrigger>
        <IconButton
          selected={props.selected}
          disabled={props.disabled}
          accessibilityLabel={props.label}
          onPress={props.onPress}
          icon={props.icon}
        />
      </TooltipTrigger>
      <TooltipContent>
        <TipLabel label={props.label} shortcut={props.shortcut} />
      </TooltipContent>
    </Tooltip>
  );
}

function Toolbar(props: { log: (line: string) => void }) {
  const { log } = props;
  const tool = signal("move");
  const history = signal<string[]>([]);
  const undone = signal<string[]>([]);
  const pick = (id: string) => {
    if (id === tool()) return;
    history.set([...history(), tool()]);
    undone.set([]);
    tool.set(id);
    log(`tool ${id}`);
  };
  const undo = () => {
    const last = history().at(-1);
    if (last === undefined) return;
    history.set(history().slice(0, -1));
    undone.set([...undone(), tool()]);
    tool.set(last);
  };
  const redo = () => {
    const next = undone().at(-1);
    if (next === undefined) return;
    undone.set(undone().slice(0, -1));
    history.set([...history(), tool()]);
    tool.set(next);
  };
  keymap.bind({
    ...Object.fromEntries(tools.map((item) => [item.key, () => pick(item.id)])),
    "mod+z": undo,
    "mod+shift+z": redo,
  });
  const key = (binding: string) => (pointer ? keymap.label(binding) : undefined);
  const current = () => tools.find((item) => item.id === tool())!;
  return (
    <DemoCard
      title="On a toolbar"
      subtitle={
        pointer
          ? "Rest the pointer on a tool; its key works too"
          : "Touch screens show none: names are labels"
      }
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
          alignSelf: "flex-start",
          padding: 3,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.inset,
          flexWrap: "wrap",
        }}
      >
        <Each of={tools}>
          {(item) => (
            <ToolButton
              label={item().label}
              icon={item().icon}
              selected={tool() === item().id}
              shortcut={key(item().key)}
              onPress={() => pick(item().id)}
            />
          )}
        </Each>
        <Separator
          orientation="vertical"
          style={{ height: pointer ? 16 : 22, marginHorizontal: 4 }}
        />
        <ToolButton
          label="Undo"
          icon={Undo2}
          disabled={history().length === 0}
          shortcut={key("mod+z")}
          onPress={undo}
        />
        <ToolButton
          label="Redo"
          icon={Redo2}
          disabled={undone().length === 0}
          shortcut={key("mod+shift+z")}
          onPress={redo}
        />
      </View>
      <Caption>{`${current().label}: ${current().hint}`}</Caption>
    </DemoCard>
  );
}

function Delays(props: { log: (line: string) => void }) {
  const { log } = props;
  const one = (label: string, tip: string, delay: number) => (
    <Tooltip delay={delay} disabled={!pointer}>
      <TooltipTrigger>
        <Button variant="secondary" onPress={() => log(`pressed ${label}`)}>
          {label}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
  return (
    <DemoCard title="When it shows" subtitle="The pointer rests for the tooltip's delay first">
      <DemoRow>
        {one("Instant", "Shows at once", 0)}
        {one("Default", "After half a second", 500)}
        {one("Patient", "After 1.2 seconds", 1200)}
      </DemoRow>
      <Caption>A press hides it; leaving hides it at once</Caption>
    </DemoCard>
  );
}

function Sides(props: { log: (line: string) => void }) {
  const { log } = props;
  const side = (placement: "top" | "bottom" | "left" | "right", icon: IconNode) => (
    <View style={{ alignSelf: "center" }}>
      <Tooltip placement={placement} delay={200} disabled={!pointer}>
        <TooltipTrigger>
          <Button
            variant="secondary"
            accessibilityLabel={`Tooltip ${placement}`}
            onPress={() => log(`pressed ${placement}`)}
            style={{ width: pointer ? 28 : 40, height: pointer ? 28 : 40, paddingHorizontal: 0 }}
          >
            <Icon icon={icon} size={pointer ? 15 : 18} tint={colors.foreground} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{`On the ${placement}`}</TooltipContent>
      </Tooltip>
    </View>
  );
  return (
    <DemoCard title="Its side" subtitle="Each from its side; it flips without room">
      <View style={{ alignItems: "center", gap: 6, paddingVertical: 8 }}>
        {side("top", ArrowUp)}
        <View style={{ flexDirection: "row", gap: pointer ? 46 : 60 }}>
          {side("left", ChevronLeft)}
          {side("right", ChevronRight)}
        </View>
        {side("bottom", ArrowDown)}
      </View>
    </DemoCard>
  );
}

function Rich() {
  return (
    <DemoCard title="More than a line" subtitle="Who approved, on an avatar stack">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Tooltip delay={300} disabled={!pointer}>
          <TooltipTrigger>
            <View
              accessibilityLabel={`Approved by ${reviewers.join(", ")}`}
              style={{ flexDirection: "row" }}
            >
              <Each of={reviewers}>
                {(name, i) => (
                  <View
                    style={{
                      marginLeft: i() === 0 ? 0 : -8,
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: colors.card,
                    }}
                  >
                    <Avatar name={name()} style={{ width: 28, height: 28 }} />
                  </View>
                )}
              </Each>
            </View>
          </TooltipTrigger>
          <TooltipContent rich>
            <View style={{ width: 210, gap: 8 }}>
              <Text class={tooltipText} style={{ fontWeight: "600" }}>
                Approved by 3 reviewers
              </Text>
              <Each of={reviewers}>
                {(name) => (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Avatar name={name()} style={{ width: 20, height: 20 }} />
                    <Text class={tooltipText} style={{ flex: 1 }}>
                      {name()}
                    </Text>
                    <Text class={tooltipNote}>2h ago</Text>
                  </View>
                )}
              </Each>
            </View>
          </TooltipContent>
        </Tooltip>
        <Badge tone="up">Approved</Badge>
      </View>
    </DemoCard>
  );
}

function Pinned(props: { log: (line: string) => void }) {
  const { log } = props;
  const hovered = signal(false);
  const pinned = signal(false);
  return (
    <DemoCard title="Opened by the app" subtitle="Shown while pinned or while the pointer rests">
      <Tooltip
        open={pinned() || hovered()}
        placement="bottom"
        delay={300}
        onOpenChange={({ open, reason }) => {
          hovered.set(open);
          log(`tooltip ${open ? "shown" : "hidden"} (${reason})`);
        }}
      >
        <TooltipTrigger>
          <Button variant="secondary" selected={pinned()} onPress={() => pinned.set(!pinned())}>
            {pinned() ? "Unpin the tooltip" : "Pin the tooltip"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Shown while pinned or hovered</TooltipContent>
      </Tooltip>
      <Caption>Touch screens show a tooltip only this way</Caption>
    </DemoCard>
  );
}
