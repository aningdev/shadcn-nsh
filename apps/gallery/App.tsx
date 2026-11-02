import { colors } from "@shadcn-nsh/theme";
import {
  Button,
  Checkbox,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Progress,
  Radio,
  RadioGroup,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
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
  const name = signal("");
  const menuOpen = signal(false);
  const menuLast = signal("—");
  const menuSidebar = signal(true);
  const ctxOpen = signal(false);
  const ctxLast = signal("—");
  const ctxSidebar = signal(true);

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
            <Button
              onPress={() => count.set(count() + 1)}
              style={{ paddingHorizontal: 24 }}
              hoverStyle={{ opacity: 0.75 }}
            >
              Style merge
            </Button>
          </View>
        </Section>

        <Section title="Input">
          <View style={{ gap: 8 }}>
            <Input placeholder="Your name" value={name()} onChange={(v) => name.set(v)} />
            <Input placeholder="Disabled" disabled />
            <Input
              placeholder="Style merge"
              style={{ paddingHorizontal: 16 }}
              focusStyle={{ borderColor: colors.primary }}
            />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Value: {() => name() || "—"}
            </Text>
          </View>
        </Section>

        <Section title="Checkbox / Switch / Radio">
          <Checkbox checked={checked()} onChange={(v) => checked.set(v)}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Accept terms</Text>
          </Checkbox>
          <Checkbox
            checked={checked()}
            onChange={(v) => checked.set(v)}
            style={{ gap: 12 }}
            indicatorStyle={{ width: 20, height: 20 }}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>Style merge</Text>
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

        <Section title="Table">
          <Table accessibilityLabel="Team roster">
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
              <TableRow>
                <TableCell>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Grace</Text>
                </TableCell>
                <TableCell>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Admiral</Text>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                    Total
                  </Text>
                </TableCell>
                <TableCell>
                  <Text style={{ fontSize: 13, color: colors.foreground }}>2</Text>
                </TableCell>
              </TableRow>
            </TableFooter>
            <TableCaption>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Team snapshot</Text>
            </TableCaption>
          </Table>
          <Table accessibilityLabel="Style merge" style={{ borderRadius: 12 }}>
            <TableHeader style={{ backgroundColor: "transparent" }}>
              <TableRow>
                <TableHead style={{ flex: 2, paddingHorizontal: 16 }}>
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
              <TableRow hoverStyle={{ backgroundColor: "transparent" }}>
                <TableCell style={{ flex: 2, paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Style merge</Text>
                </TableCell>
                <TableCell>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Consumer wins</Text>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Dropdown Menu">
          <DropdownMenu open={menuOpen()} onOpenChange={(next) => menuOpen.set(next)}>
            <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem onSelect={() => menuLast.set("Profile")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Profile</Text>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => menuLast.set("Settings")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Settings</Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={menuSidebar()}
                closeOnSelect={false}
                onSelect={() => menuSidebar.set(!menuSidebar())}
              >
                <Text style={{ fontSize: 14, color: colors.foreground }}>Show sidebar</Text>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => menuLast.set("Log out")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Log out</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger>Style merge</DropdownMenuTrigger>
            <DropdownMenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
              <DropdownMenuItem style={{ height: 36 }} onSelect={() => menuLast.set("Merged")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Merged chrome</Text>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Menu open: {() => (menuOpen() ? "yes" : "no")} · Last: {() => menuLast()}
          </Text>
        </Section>

        <Section title="Context Menu">
          <ContextMenu open={ctxOpen()} onOpenChange={(next) => ctxOpen.set(next)}>
            <ContextMenuTrigger>
              <View
                style={{
                  width: 180,
                  height: 80,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.muted,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                  Right-click / long-press
                </Text>
              </View>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Edit</ContextMenuLabel>
              <ContextMenuItem onSelect={() => ctxLast.set("Copy")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Copy</Text>
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => ctxLast.set("Paste")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Paste</Text>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem
                checked={ctxSidebar()}
                closeOnSelect={false}
                onSelect={() => ctxSidebar.set(!ctxSidebar())}
              >
                <Text style={{ fontSize: 14, color: colors.foreground }}>Show sidebar</Text>
              </ContextMenuCheckboxItem>
            </ContextMenuContent>
          </ContextMenu>
          <ContextMenu>
            <ContextMenuTrigger>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.foreground }}>Style merge target</Text>
              </View>
            </ContextMenuTrigger>
            <ContextMenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
              <ContextMenuItem style={{ height: 36 }} onSelect={() => ctxLast.set("Merged")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Merged chrome</Text>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Ctx open: {() => (ctxOpen() ? "yes" : "no")} · Last: {() => ctxLast()} · Sidebar:{" "}
            {() => (ctxSidebar() ? "on" : "off")}
          </Text>
        </Section>
      </View>
    </Scroll>
  );
}

mount(App);
