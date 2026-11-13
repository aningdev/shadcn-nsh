// The official tooltip scene (`references/nsh/website/demos/el-tooltip.tsx`) with this library's
// parts: three icon buttons with hints above and below them, a pin that shows them all without a
// pointer, and an inspector holding the last press and the last six hint lines.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Button, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon, type IconName } from "@/packages/ui/lib/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/packages/ui/tooltip";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split, wide } from "./stage";

/** An icon button with a hint under or above it. */
function Tool(props: {
  icon: IconName;
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
        <TooltipTrigger>
          <IconButton variant="secondary" accessibilityLabel={props.label} onPress={props.onPress}>
            <Icon name={props.icon} {...iconButtonGlyph({ variant: "secondary" })} />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>{props.hint}</TooltipContent>
      </Tooltip>
      <Text style={{ fontSize: 11, color: colors.faint }}>{props.placement}</Text>
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

  return (
    <DemoPage title="Tooltip">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Rest the pointer on a button; a click still presses it"
          : "Tooltips follow a pointer: pin them to see them here"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="onPress">
              <Text style={{ fontSize: 13, color: colors.text }}>{pressed()}</Text>
            </Panel>
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={130} />
          </>
        }
      >
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 64 }}>
          <Tool
            icon="star"
            label="Star"
            hint="Add to favorites"
            placement="top"
            pinned={pinned()}
            onPress={() => pressed.set("Star")}
            onOpenChange={log("Star")}
          />
          <Tool
            icon="share"
            label="Share"
            hint="Share with your team"
            placement="bottom"
            pinned={pinned()}
            onPress={() => pressed.set("Share")}
            onOpenChange={log("Share")}
          />
          <Tool
            icon="trash"
            label="Delete"
            hint="Move to the trash"
            placement="top"
            pinned={pinned()}
            onPress={() => pressed.set("Delete")}
            onOpenChange={log("Delete")}
          />
        </View>
        {/* The `tooltip` prop of any element: a `Tooltip` with the app's look. */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Tooltip style={wide() ? undefined : { flex: 1 }}>
            <TooltipTrigger>
              <Button variant="secondary" onPress={() => pinned.set(!pinned())}>
                {wide()
                  ? pinned()
                    ? "Unpin the tooltips"
                    : "Pin the tooltips"
                  : pinned()
                    ? "Unpin"
                    : "Pin"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Shows every tooltip without a pointer</TooltipContent>
          </Tooltip>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
