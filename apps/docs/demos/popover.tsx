// The official popover scene (`references/nsh/website/demos/el-popover.tsx`) with this library's
// parts: one panel over a trigger, its side and offset chosen in the inspector, a button below
// that counts the presses a press outside costs it, and the last four lifecycle lines.
import { mount, signal, Text, View } from "nsh";

import { Button } from "@/packages/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/packages/ui/popover";

import { DemoPage } from "./kit";
import { desktop, Log, Segmented, Split, ui, wide } from "./stage";

type Placement = "top" | "bottom" | "left" | "right";

function App() {
  const placement = signal<Placement>("bottom");
  const offset = signal(8);
  const presses = signal(0);
  const events = signal<string[]>([]);

  return (
    <DemoPage title="Popover">
      <Text style={{ color: ui().muted }}>
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
            onOpenChange={({ open, reason }) =>
              events.set([`${open ? "opened" : "closed"} · ${reason}`, ...events()].slice(0, 4))
            }
          >
            <PopoverTrigger variant="default">Order 1024</PopoverTrigger>
            <PopoverContent placement={placement()} offset={offset()} margin={12} width={260}>
              <PopoverHeader style={{ gap: 2 }}>
                <PopoverTitle
                  style={{
                    fontSize: desktop ? 14 : 16,
                    fontWeight: "600",
                    color: ui().text,
                  }}
                >
                  Shipped yesterday
                </PopoverTitle>
                <PopoverDescription style={{ fontSize: desktop ? 12 : 13, color: ui().muted }}>
                  Arriving Friday. The trigger, a press outside and Escape close this.
                </PopoverDescription>
              </PopoverHeader>
              <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ui().up }} />
                <Text style={{ fontSize: 12, color: ui().up }}>In transit</Text>
              </View>
            </PopoverContent>
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
