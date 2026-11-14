// The reference of `tooltip.tsx`: the same scene with the bubble's look (`tooltipLook`,
// `tooltipText`) on `nsh/base`'s Tooltip, hung on the host view's `tooltip` prop, the way the
// official example (`references/nsh/website/demos/el-tooltip.tsx`) writes it. It differs from the
// component page only in the parts it names.
import { Share, Star, Trash, type IconNode } from "lucide";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Tooltip } from "nsh/base";

import { Button, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { tooltipLook, tooltipText } from "@/packages/ui/tooltip";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, ui, wide } from "./stage";

/** An icon button with a hint under or above it. */
function Tool(props: {
  icon: IconNode;
  label: string;
  hint: string;
  placement: "top" | "bottom";
  pinned: boolean;
  onPress: () => void;
  onOpenChange: (event: { open: boolean; reason: string }) => void;
}) {
  const hovered = signal(false);
  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <View style={{ gap: 0 }}>
        <View
          tooltip={
            <Tooltip
              open={props.pinned || hovered()}
              placement={props.placement}
              offset={8}
              margin={8}
              delay={400}
              onOpenChange={(event) => {
                hovered.set(event.open);
                props.onOpenChange(event);
              }}
            >
              <View class={tooltipLook().class}>
                <Text class={tooltipText}>{props.hint}</Text>
              </View>
            </Tooltip>
          }
        >
          <IconButton variant="secondary" accessibilityLabel={props.label} onPress={props.onPress}>
            <Icon icon={props.icon} {...iconButtonGlyph({ variant: "secondary" })} />
          </IconButton>
        </View>
      </View>
      <Text style={{ fontSize: 11, color: ui().faint }}>{props.placement}</Text>
    </View>
  );
}

function App() {
  const events = signal<string[]>([]);
  const pressed = signal("—");
  const pinned = signal(false);
  const log = (name: string) => (event: { open: boolean; reason: string }) =>
    events.set(
      [`${name} ${event.open ? "shown" : "hidden"} · ${event.reason}`, ...events()].slice(0, 6),
    );

  const tools = (gap: number): JSX.Element => (
    <View style={{ flexDirection: "row", justifyContent: "center", gap }}>
      <Tool
        icon={Star}
        label="Star"
        hint="Add to favorites"
        placement="top"
        pinned={pinned()}
        onPress={() => pressed.set("Star")}
        onOpenChange={log("Star")}
      />
      <Tool
        icon={Share}
        label="Share"
        hint="Share with your team"
        placement="bottom"
        pinned={pinned()}
        onPress={() => pressed.set("Share")}
        onOpenChange={log("Share")}
      />
      <Tool
        icon={Trash}
        label="Delete"
        hint="Move to the trash"
        placement="top"
        pinned={pinned()}
        onPress={() => pressed.set("Delete")}
        onOpenChange={log("Delete")}
      />
    </View>
  );

  /** The `tooltip` prop of any element: a `Tooltip` with the app's look. */
  const pin = (): JSX.Element => (
    <View style={{ gap: 0, flex: wide() ? undefined : 1 }}>
      <View
        tooltip={
          <Tooltip>
            <View class={tooltipLook().class}>
              <Text class={tooltipText}>Shows every tooltip without a pointer</Text>
            </View>
          </Tooltip>
        }
      >
        <Button
          variant="secondary"
          onPress={() => pinned.set(!pinned())}
          style={wide() ? undefined : { flex: 1 }}
        >
          {wide()
            ? pinned()
              ? "Unpin the tooltips"
              : "Pin the tooltips"
            : pinned()
              ? "Unpin"
              : "Pin"}
        </Button>
      </View>
    </View>
  );

  const onPress = (): JSX.Element => (
    <Panel title="onPress">
      <Text style={{ fontSize: 13, color: ui().text }}>{pressed()}</Text>
    </Panel>
  );

  const changes = (): JSX.Element => (
    <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={130} />
  );

  return (
    <DemoPage title="Tooltip">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Rest the pointer on a button; a click still presses it"
          : "Tooltips follow a pointer: pin them to see them here"}
      </Text>

      {() =>
        wide() ? (
          <Split
            gap={14}
            inspector={
              <>
                {onPress()}
                {changes()}
              </>
            }
          >
            {tools(64)}
            <View style={{ flexDirection: "row", gap: 8 }}>{pin()}</View>
          </Split>
        ) : (
          <>
            {/* The official's phone frame: the tools take the room the page leaves, centered. */}
            <View
              style={{
                flex: 1,
                minHeight: 200,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 28,
              }}
            >
              {tools(28)}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>{pin()}</View>
            {onPress()}
            {changes()}
          </>
        )
      }
    </DemoPage>
  );
}

mount(App);
