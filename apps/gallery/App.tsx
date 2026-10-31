import { colors } from "@shadcn-nsh/theme";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
  Avatar,
  Button,
  Checkbox,
  Input,
  Pagination,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  ToggleGroup,
} from "@shadcn-nsh/ui";
import { mount, Scroll, signal, Text, View } from "nsh";

function Section(props: { title: string; children: unknown }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        {props.title}
      </Text>
      {props.children as never}
    </View>
  );
}

function App() {
  const count = signal(0);
  const checked = signal(true);
  const radio = signal("a");
  const on = signal(true);
  const volume = signal(40);
  const fruit = signal<string | null>("apple");
  const tab = signal("one");
  const bold = signal(false);
  const page = signal(1);
  const open = signal(["shipping"]);

  return (
    <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 24, gap: 24, paddingBottom: 48 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: colors.foreground }}>
          shadcn-nsh
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          Phase-1 styled wrappers on nsh/base. Clicks: {() => count()}
        </Text>

        <Section title="Button">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Button onPress={() => count.set(count() + 1)}>Default</Button>
            <Button variant="secondary" onPress={() => count.set(count() + 1)}>
              Secondary
            </Button>
            <Button variant="outline" onPress={() => count.set(count() + 1)}>
              Outline
            </Button>
            <Button variant="ghost" onPress={() => count.set(count() + 1)}>
              Ghost
            </Button>
            <Button variant="destructive" onPress={() => count.set(count() + 1)}>
              Destructive
            </Button>
          </View>
        </Section>

        <Section title="Input">
          <Input placeholder="Your name" />
        </Section>

        <Section title="Checkbox / Switch / Radio">
          <Checkbox checked={checked()} onChange={({ checked: v }) => checked.set(v)}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Accept terms</Text>
          </Checkbox>
          <Switch checked={on()} onChange={({ checked: v }) => on.set(v)}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Notifications</Text>
          </Switch>
          <RadioGroup>
            <Radio checked={radio() === "a"} onChange={({ checked: v }) => v && radio.set("a")}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Option A</Text>
            </Radio>
            <Radio checked={radio() === "b"} onChange={({ checked: v }) => v && radio.set("b")}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Option B</Text>
            </Radio>
          </RadioGroup>
        </Section>

        <Section title="Slider / Progress">
          <Slider value={volume()} onChange={({ value }) => volume.set(value as number)} />
          <Progress value={volume()} />
        </Section>

        <Section title="Select">
          <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        <Section title="Tabs / Toggle">
          <Tabs value={tab()} onValueChange={(v) => tab.set(v)}>
            <TabsList>
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel one</Text>
            </TabsContent>
            <TabsContent value="two">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel two</Text>
            </TabsContent>
          </Tabs>
          <ToggleGroup>
            <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
              <Text style={{ fontSize: 13, color: colors.foreground }}>Bold</Text>
            </Toggle>
          </ToggleGroup>
        </Section>

        <Section title="Pagination">
          <Pagination page={page()} totalPages={8} onChange={({ page: p }) => page.set(p)} />
        </Section>

        <Section title="Accordion">
          <Accordion value={open()} onChange={({ value }) => open.set(value)}>
            <AccordionItem value="shipping">
              <AccordionHeader>
                <AccordionTrigger>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                    Shipping
                  </Text>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingBottom: 12 }}>
                  Orders leave the same day before 2 pm.
                </Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionHeader>
                <AccordionTrigger>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                    Returns
                  </Text>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingBottom: 12 }}>
                  Print the label within 30 days.
                </Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Section>

        <Section title="Avatar">
          <Avatar name="Ada Lovelace" />
        </Section>

        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
                    Name
                  </Text>
                </TableHead>
                <TableHead>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
                    Role
                  </Text>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Ada</Text>
                </TableCell>
                <TableCell>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Engineer</Text>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>
      </View>
    </Scroll>
  );
}

mount(App);
