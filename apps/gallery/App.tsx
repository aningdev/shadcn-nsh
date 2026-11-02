import { colors } from "@shadcn-nsh/theme";
import {
  Button,
  Checkbox,
  Input,
  Progress,
  Radio,
  RadioGroup,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
  const progress = signal(40);
  const tab = signal("one");
  const bold = signal(false);
  const sheetOpen = signal(false);

  return (
    <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 24, gap: 24, paddingBottom: 48 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: colors.foreground }}>
          shadcn-nsh
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          Phase-1 styled wrappers on store nsh/base (0.3.x). Clicks: {() => count()}
        </Text>

        <Section title="Button">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
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
            <Button size="sm" onPress={() => count.set(count() + 1)}>
              SM
            </Button>
            <Button size="lg" onPress={() => count.set(count() + 1)}>
              LG
            </Button>
            <Button size="icon" accessibilityLabel="Add" onPress={() => count.set(count() + 1)}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primaryForeground }}>
                +
              </Text>
            </Button>
            <Button selected={bold()} variant="outline" onPress={() => bold.set(!bold())}>
              Selected
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

        <Section title="Progress">
          <Progress value={progress()} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button size="sm" onPress={() => progress.set(Math.max(0, progress() - 10))}>
              −10
            </Button>
            <Button size="sm" onPress={() => progress.set(Math.min(100, progress() + 10))}>
              +10
            </Button>
          </View>
        </Section>

        <Section title="Tabs">
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
        </Section>

        <Section title="Sheet">
          <Sheet open={sheetOpen()} onOpenChange={(next) => sheetOpen.set(next)}>
            <SheetTrigger>Open sheet</SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Bottom sheet</SheetTitle>
                <SheetDescription>
                  Trigger / Content with edge chrome. Backdrop, Escape, or Close dismisses.
                </SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose>Close</SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger>Right side</SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Side drawer</SheetTitle>
                <SheetDescription>side right</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose>Done</SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger>Style merge</SheetTrigger>
            <SheetContent side="bottom" popupStyle={{ padding: 24, minHeight: 200 }}>
              <SheetTitle style={{ fontSize: 18 }}>Merged chrome</SheetTitle>
              <SheetDescription>Consumer popupStyle wins per key</SheetDescription>
              <SheetFooter>
                <SheetClose>Close</SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Sheet open: {() => (sheetOpen() ? "yes" : "no")}
          </Text>
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
