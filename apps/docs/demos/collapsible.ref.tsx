// The reference of `collapsible.tsx`: the same scene with the disclosure look
// (`disclosureTriggerLook`, `DisclosureChevron`, `disclosurePanel`) spread on `nsh/base`'s
// Collapsible, the way the official example
// (`references/nsh/website/demos/el-collapsible.tsx`) writes it. It differs from the component
// page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Collapsible } from "nsh/base";

import { DisclosureChevron, disclosurePanel, disclosureTriggerLook } from "@/packages/ui/accordion";
import {
  controlSize,
  listRow,
  RowDivider,
  RowLabel,
  sectionSurface,
} from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const USAGE: [string, string][] = [
  ["Photos", "120 GB"],
  ["Apps", "54 GB"],
  ["System", "38 GB"],
];

function App() {
  const storage = signal(true);
  const advanced = signal(false);
  const originals = signal(false);
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 4));
  return (
    <DemoPage title="Collapsible">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click a summary, or Tab to it and press Space"
          : "Tap a summary to show its details"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="open">
              <Text style={{ fontSize: 13, color: colors.text }}>
                Storage {storage() ? "open" : "closed"} · Advanced {advanced() ? "open" : "closed"}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                Keep originals {originals() ? "on" : "off"}: kept while collapsed
              </Text>
            </Panel>
            <Log title="onPress (trigger) → open" lines={events()} minHeight={92} />
          </>
        }
      >
        <View style={sectionSurface({ padded: true })}>
          <Collapsible
            open={storage()}
            reveal
            content={
              <View style={disclosurePanel({ start: controlSize.gap })}>
                {USAGE.map(([name, value]) => (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: controlSize.line,
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: controlSize.label, color: colors.muted }}>
                      {name}
                    </Text>
                    <Text
                      style={{
                        fontSize: controlSize.label,
                        color: colors.muted,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
            }
          >
            <View
              role="button"
              accessibilityState={{ expanded: storage() }}
              onPress={() => {
                storage.set(!storage());
                log(`Storage → ${storage() ? "open" : "closed"}`);
              }}
              {...disclosureTriggerLook({ first: true })}
            >
              <RowLabel label="Storage" detail="212 GB of 256 GB used" />
              <DisclosureChevron open={storage()} />
            </View>
          </Collapsible>

          <View style={{ height: 1, backgroundColor: colors.line }} />

          <Collapsible
            open={advanced()}
            reveal
            content={
              <View style={disclosurePanel({ start: controlSize.gap, gap: 0 })}>
                <Switch
                  checked={originals()}
                  onChange={({ checked }) => originals.set(checked)}
                  {...listRow({
                    start: controlSize.gap,
                    style: { flexDirection: "row-reverse" },
                  })}
                >
                  <RowDivider show />
                  <RowLabel
                    label="Keep originals"
                    detail={originals() ? "Edits are saved as copies" : "Edits replace the photo"}
                  />
                </Switch>
              </View>
            }
          >
            <View
              role="button"
              accessibilityState={{ expanded: advanced() }}
              onPress={() => {
                advanced.set(!advanced());
                log(`Advanced → ${advanced() ? "open" : "closed"}`);
              }}
              {...disclosureTriggerLook()}
            >
              <RowLabel label="Advanced" detail="Options most people leave alone" />
              <DisclosureChevron open={advanced()} />
            </View>
          </Collapsible>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
