import { colors } from "@shadcn-nsh/theme";
// Collapsible: the official gallery's scene (`references/nsh/examples/gallery/demos/Controls.tsx`,
// the Collapsible demo) with this library's parts — details under a summary, kept while
// collapsed: what storage holds, a switch among the advanced options, and questions whose one
// answer open at a time makes them an accordion.
import { signal, Text, View } from "nsh";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible";
import { controlSize, listRow, RowDivider, RowLabel } from "@/packages/ui/lib/surface";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage } from "../kit";
import { settle, settleOn } from "./navigation-shared";

/** The page's sizes, as the controls' tier gives them. */
const size = controlSize;

const FAQ = [
  {
    q: "Can I change my plan later?",
    a: "Yes. A new plan starts at once, and what is left of the old one is credited to your next invoice.",
  },
  {
    q: "What happens to my photos if I cancel?",
    a: "They stay yours: you can download them for 30 days, then the library is deleted for good.",
  },
  {
    q: "Do you offer a discount for teams?",
    a: "Teams of ten or more pay 20% less per seat, billed once a year.",
  },
];

const USAGE: [string, string][] = [
  ["Photos", "120 GB"],
  ["Apps", "54 GB"],
  ["System", "38 GB"],
];

/** A summary row: its label, a quieter line, and the chevron the trigger draws, which turns as
 * it opens. */
function Summary(props: { label: string; detail?: string; first?: boolean }) {
  return (
    <CollapsibleTrigger first={props.first} accessibilityLabel={props.label}>
      <View style={{ flexDirection: "row", alignItems: "center", flexGrow: 1 }}>
        <RowDivider show={!props.first} />
        <RowLabel label={props.label} detail={props.detail} />
      </View>
    </CollapsibleTrigger>
  );
}

/** Details under a summary, kept while collapsed: what storage holds, and a switch among the
 * advanced options. */
function Disclosure(props: { log: (text: string) => void }) {
  const storage = signal(false);
  const advanced = signal(false);
  const originals = signal(false);
  // The content settles in as a section opens (the collapsible adds it
  // then, and takes it out at once as it closes).
  const storageIn = settleOn(storage);
  const advancedIn = settleOn(advanced);
  return (
    <DemoCard title="Collapsible" subtitle="Details under a summary, kept while collapsed">
      <Collapsible
        open={storage()}
        onOpenChange={({ open }) => {
          storage.set(open);
          props.log(`Storage: ${open ? "expanded" : "collapsed"}`);
        }}
      >
        <Summary first label="Storage" detail="212 GB of 256 GB used" />
        <CollapsibleContent>
          <View style={{ ...settle(storageIn), paddingStart: size.gap, gap: size.padding }}>
            <Each of={USAGE}>
              {(u) => (
                <View style={{ flexDirection: "row", alignItems: "center", minHeight: size.line }}>
                  <Text style={{ flex: 1, fontSize: size.label, color: colors.mutedForeground }}>
                    {u()[0]}
                  </Text>
                  <Text
                    style={{
                      fontSize: size.label,
                      color: colors.mutedForeground,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    {u()[1]}
                  </Text>
                </View>
              )}
            </Each>
          </View>
        </CollapsibleContent>
      </Collapsible>
      <Collapsible
        open={advanced()}
        onOpenChange={({ open }) => {
          advanced.set(open);
          props.log(`Advanced: ${open ? "expanded" : "collapsed"}`);
        }}
      >
        <Summary label="Advanced" detail="Options most people leave alone" />
        <CollapsibleContent>
          <View style={settle(advancedIn)}>
            <Switch
              checked={originals()}
              onChange={({ checked: on }) => {
                originals.set(on);
                props.log(`Keep originals: ${on ? "on" : "off"}`);
              }}
              accessibilityLabel="Keep originals"
              {...listRow({ start: size.gap, style: { flexDirection: "row-reverse" } })}
            >
              <RowDivider show />
              <RowLabel
                label="Keep originals"
                detail={originals() ? "Edits are saved as copies" : "Edits replace the photo"}
              />
            </Switch>
          </View>
        </CollapsibleContent>
      </Collapsible>
    </DemoCard>
  );
}

/** Questions: one answer open at a time, as an accordion. */
function Faq(props: { log: (text: string) => void }) {
  const open = signal<string | null>(FAQ[0]!.q);
  function Item(props: { q: string; a: string; first: boolean; log: (text: string) => void }) {
    const t = settleOn(() => open() === props.q);
    return (
      <Collapsible
        open={open() === props.q}
        onOpenChange={({ open: next }) => {
          open.set(next ? props.q : null);
          props.log(next ? `${props.q}: expanded` : `${props.q}: collapsed`);
        }}
      >
        <Summary first={props.first} label={props.q} />
        <CollapsibleContent>
          <View style={{ ...settle(t), paddingBottom: size.padding + 4, paddingEnd: 24 }}>
            <Text
              style={{
                fontSize: size.label,
                lineHeight: Math.round(size.label * 1.5),
                color: colors.mutedForeground,
              }}
            >
              {props.a}
            </Text>
          </View>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return (
    <DemoCard title="Accordion" subtitle="Questions: one answer open at a time">
      <Each of={FAQ}>
        {(f, i) => <Item q={f().q} a={f().a} first={i() === 0} log={props.log} />}
      </Each>
    </DemoCard>
  );
}

export function CollapsibleDemo() {
  const last = signal("—");
  const log = (text: string) => last.set(text);
  return (
    <DemoPage title="Collapsible" note={() => `Last event: ${last()}`}>
      <Disclosure log={log} />
      <Faq log={log} />
    </DemoPage>
  );
}
