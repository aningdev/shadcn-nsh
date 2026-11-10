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
  linkVariants,
  Pagination,
  paginationVariants,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsMetrics,
} from "@shadcn-nsh/ui";
import { mount, platform, signal, Text, View } from "nsh";

function App() {
  const tab = signal("one");
  const open = signal<string[]>([]);
  const many = signal<string[]>([]);
  const shown = signal(false);
  const page = signal(1);
  const opened = signal(false);
  const tabs = tabsMetrics();
  const link = linkVariants();
  const pages = paginationVariants(false);
  const compact = paginationVariants(true);
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Tabs value={tab()} onValueChange={(value) => tab.set(value)}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three" disabled>
            Three
          </TabsTrigger>
        </TabsList>
        <TabsContent value="two">
          <Text>Panel two</Text>
        </TabsContent>
      </Tabs>
      <Accordion value={open()} onChange={({ value }) => open.set(value)}>
        <AccordionItem value="ship">
          <AccordionHeader>
            <AccordionTrigger>Shipping</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Ships in two days</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="lock" disabled>
          <AccordionHeader>
            <AccordionTrigger>Locked</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Unavailable</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Accordion multiple value={many()} onChange={({ value }) => many.set(value)}>
        <AccordionItem value="a">
          <AccordionHeader>
            <AccordionTrigger>Alpha</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>First</Text>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionHeader>
            <AccordionTrigger>Beta</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>Second</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Collapsible open={shown()} onOpenChange={({ open: next }) => shown.set(next)}>
        <CollapsibleTrigger>Details</CollapsibleTrigger>
        <CollapsibleContent>
          <Text>More about this row</Text>
        </CollapsibleContent>
      </Collapsible>
      <Link href="https://nsh.dev" openWith="app" onOpen={() => opened.set(true)}>
        Docs
      </Link>
      <Pagination page={page()} totalPages={5} onChange={({ page: next }) => page.set(next)} />
      <Text>{`tab=${tab()}`}</Text>
      <Text>{`open=${open().join(",")}`}</Text>
      <Text>{`multi=${many().join(",")}`}</Text>
      <Text>{`shown=${shown()}`}</Text>
      <Text>{`page=${page()}`}</Text>
      <Text>{`opened=${opened()}`}</Text>
      <Text>{`desktop=${platform.desktop}`}</Text>
      <Text>{`tabs=${tabs.minHeight}`}</Text>
      <Text>{`link=${link.style.minHeight}|${link.hitSlop}`}</Text>
      <Text>{`pages=${pages.itemStyle.minHeight}|${compact.itemStyle.minHeight}`}</Text>
    </View>
  );
}

mount(App);
