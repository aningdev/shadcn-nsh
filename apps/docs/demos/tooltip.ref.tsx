// The reference of `tooltip.tsx`: the look on `nsh/base`'s Tooltip.
import { mount, signal, Text, View } from "nsh";
import { Button, Tooltip } from "nsh/base";

import { buttonLabel, buttonLook } from "@/packages/ui/button";
import { tooltipLook, tooltipNote, tooltipText } from "@/packages/ui/tooltip";

import { DemoCard, DemoPage, DemoSection } from "./kit";

/** The host view a tooltip root puts around its trigger. */
const host = { alignSelf: "flex-start" as const };

function App() {
  const last = signal("open");

  return (
    <DemoPage title="Tooltip" note={() => last()}>
      <DemoCard>
        <DemoSection title="Placement">
          <View style={{ flexDirection: "row", gap: 48, paddingVertical: 40 }}>
            <View style={{ gap: 0 }}>
              <View
                style={host}
                tooltip={
                  <Tooltip
                    open
                    placement="top"
                    class={tooltipLook().class}
                    onOpenChange={({ open, reason }) =>
                      last.set(`${open ? "shown" : "hidden"} · ${reason}`)
                    }
                  >
                    <Text class={tooltipText}>Add to favorites</Text>
                  </Tooltip>
                }
              >
                <Button {...buttonLook("secondary")}>
                  <Text style={buttonLabel("secondary")}>Top</Text>
                </Button>
              </View>
            </View>
            <View style={{ gap: 0 }}>
              <View
                style={host}
                tooltip={
                  <Tooltip open placement="bottom" class={tooltipLook().class}>
                    <Text class={tooltipText}>Share with your team</Text>
                  </Tooltip>
                }
              >
                <Button {...buttonLook("secondary")}>
                  <Text style={buttonLabel("secondary")}>Bottom</Text>
                </Button>
              </View>
            </View>
          </View>
        </DemoSection>
        <DemoSection title="Rich">
          <View style={{ paddingVertical: 40 }}>
            <View style={{ gap: 0 }}>
              <View
                style={host}
                tooltip={
                  <Tooltip open class={tooltipLook({ rich: true }).class}>
                    <Text class={tooltipText}>Delete forever</Text>
                    <Text class={tooltipNote}>⌘⌫</Text>
                  </Tooltip>
                }
              >
                <Button {...buttonLook("secondary")}>
                  <Text style={buttonLabel("secondary")}>Rich</Text>
                </Button>
              </View>
            </View>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
