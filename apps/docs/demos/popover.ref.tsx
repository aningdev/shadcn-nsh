// The reference of `popover.tsx`: the same scene with the panel's look (`popoverLook`) on a
// `PopIn` inside `nsh/base`'s Popover, the way the official example
// (`references/nsh/website/demos/el-popover.tsx`) writes it. It differs from the component page
// only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Popover } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { PopIn } from "@/packages/ui/lib/popup";
import { popoverLook } from "@/packages/ui/popover";

import { DemoPage } from "./kit";
import { desktop, Log, Segmented, Split, wide } from "./stage";

type Placement = "top" | "bottom" | "left" | "right";

function App() {
  const placement = signal<Placement>("bottom");
  const offset = signal(8);
  const presses = signal(0);
  const events = signal<string[]>([]);

  return (
    <DemoPage title="Popover">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Open it, then click “Count” below: one click closes it and presses the button"
          : "Open it, then tap “Count” below: the tap only closes it"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Segmented
              label="placement"
              options={["top", "bottom", "left", "right"] as Placement[]}
              value={placement()}
              onChange={(value) => placement.set(value)}
            />
            <Segmented
              label="offset"
              options={[0, 8, 16] as number[]}
              value={offset()}
              onChange={(value) => offset.set(value)}
            />
            <Log title="onOpenChange({ open, reason })" lines={events()} minHeight={92} />
          </>
        }
      >
        <View
          style={{
            height: wide() ? 280 : 200,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Popover
            placement={placement()}
            offset={offset()}
            margin={12}
            trigger={<Button variant="accent">Order 1024</Button>}
            onOpenChange={({ open, reason }) =>
              events.set([`${open ? "opened" : "closed"} · ${reason}`, ...events()].slice(0, 4))
            }
          >
            {() => (
              // The panel grows out of the trigger's side each time it opens.
              <PopIn side={placement()} style={popoverLook({ width: 260 })}>
                <View style={{ gap: 2 }}>
                  <Text
                    style={{
                      fontSize: desktop ? 14 : 16,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Shipped yesterday
                  </Text>
                  <Text style={{ fontSize: desktop ? 12 : 13, color: colors.muted }}>
                    Arriving Friday. The trigger, a press outside and Escape close this.
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <View
                    style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.up }}
                  />
                  <Text style={{ fontSize: 12, color: colors.up }}>In transit</Text>
                </View>
              </PopIn>
            )}
          </Popover>
        </View>
        <Button
          variant="secondary"
          onPress={() => presses.update((n) => n + 1)}
          style={{ justifyContent: "center" }}
        >
          {`Count · pressed ${presses()}×`}
        </Button>
      </Split>
    </DemoPage>
  );
}

mount(App);
