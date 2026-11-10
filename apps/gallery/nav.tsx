// Family 7: tabs, accordion, collapsible, link, pagination — states and density.
// The shot window is 390×844, so this page stays inside that first screen.
import { colors } from "@shadcn-nsh/theme";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Link,
  Pagination,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@shadcn-nsh/ui";
import { mount, signal, Text, View } from "nsh";

import { Flow, Page, Panel, Row } from "./demo-kit";

/** The row's remainder, so a control shares one width instead of hugging its text. */
const fill = { flex: 1, alignSelf: "stretch" as const };

function Label(props: { children: string }) {
  return <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.children}</Text>;
}

function NavPage() {
  const tab = signal("one");
  const open = signal(["ship"]);
  const shown = signal(true);
  return (
    <Page>
      <Panel title="Tabs">
        <Row label="pill">
          <Tabs style={fill} value={tab()} onValueChange={(value) => tab.set(value)}>
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three" disabled>
                Three
              </TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Label>Panel one</Label>
            </TabsContent>
            <TabsContent value="two">
              <Label>Panel two</Label>
            </TabsContent>
          </Tabs>
        </Row>
        <Row label="line">
          <Tabs style={fill} defaultValue="a">
            <TabsList variant="line">
              <TabsTrigger value="a">Line A</TabsTrigger>
              <TabsTrigger value="b">Line B</TabsTrigger>
            </TabsList>
          </Tabs>
        </Row>
      </Panel>
      <Panel title="Accordion">
        <Row label="single">
          <Accordion style={fill} value={open()} onChange={({ value }) => open.set(value)}>
            <AccordionItem value="ship">
              <AccordionHeader>
                <AccordionTrigger>Shipping</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <Label>Ships in two days</Label>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem value="lock" disabled>
              <AccordionHeader>
                <AccordionTrigger>Locked</AccordionTrigger>
              </AccordionHeader>
              <AccordionPanel>
                <Label>Unavailable</Label>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Row>
      </Panel>
      <Panel title="Collapsible">
        <Row label="open">
          <View style={fill}>
            <Collapsible open={shown()} onOpenChange={({ open: next }) => shown.set(next)}>
              <CollapsibleTrigger>Details</CollapsibleTrigger>
              <CollapsibleContent>
                <Label>More about this row</Label>
              </CollapsibleContent>
            </Collapsible>
          </View>
        </Row>
      </Panel>
      <Panel title="Link and pages">
        <Row label="link">
          <Flow>
            <Link href="https://nsh.dev">Docs</Link>
            <Link href="https://nsh.dev" variant="quiet">
              Quiet
            </Link>
            <Link href="https://nsh.dev" current>
              Current
            </Link>
            <Link href="https://nsh.dev" disabled>
              Disabled
            </Link>
          </Flow>
        </Row>
        <View style={{ gap: 4 }}>
          <Label>Page 1: current, previous disabled</Label>
          <Pagination page={1} totalPages={5} onChange={() => {}} />
        </View>
        <View style={{ gap: 4 }}>
          <Label>Last page: current, next disabled</Label>
          <Pagination page={5} totalPages={5} onChange={() => {}} />
        </View>
      </Panel>
    </Page>
  );
}

mount(NavPage);
