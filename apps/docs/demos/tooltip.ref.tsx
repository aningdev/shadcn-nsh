// The reference of `tooltip.tsx`: the same scene with the bubble's look (`tooltipLook`,
// `tooltipText`) on `nsh/base`'s Tooltip, hung on the host view's `tooltip` prop, the way the
// official example (`references/nsh/website/demos/el-tooltip.tsx`) writes it. It differs from the
// component page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Tooltip } from "nsh/base";

import { Button, IconButton, iconButtonGlyph } from "@/packages/ui/button";
import { Icon, type IconName } from "@/packages/ui/lib/icons";
import { tooltipLook, tooltipText } from "@/packages/ui/tooltip";

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
      <View style={{ gap: 0 }}>
        <View
          style={{ alignSelf: "flex-start" }}
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
            <Icon name={props.icon} {...iconButtonGlyph({ variant: "secondary" })} />
          </IconButton>
        </View>
      </View>
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
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
