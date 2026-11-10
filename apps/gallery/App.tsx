import { colors } from "@shadcn-nsh/theme";
import {
  Accordion,
  AccordionPanel,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
  Input,
  Link,
  NumberInput,
  OtpInput,
  Pagination,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  Slider,
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
  Toggle,
  ToggleGroup,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
  Toaster,
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
  const popoverOpen = signal(false);
  const tipOpen = signal(false);
  const sheetOpen = signal(false);
  const dialogOpen = signal(false);
  const collapsibleOpen = signal(false);
  const accordionOpen = signal(["section-1"]);
  const fruit = signal<string | null>("apple");
  const tags = signal<string[]>(["react"]);
  const page = signal(1);
  const volume = signal(40);
  const quantity = signal(2);
  const otp = signal("");
  const textAlign = signal("left");

  return (
    <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 24, gap: 24, paddingBottom: 48 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: colors.foreground }}>
          shadcn-nsh
        </Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          Phase-1 styled wrappers on store nsh/base (0.4.0). Clicks: {() => count()}
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
            <Input
              placeholder="Your name"
              value={name()}
              onChange={({ value: v }) => name.set(v)}
            />
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
          <Checkbox checked={checked()} onChange={({ checked: v }) => checked.set(v)}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Accept terms</Text>
          </Checkbox>
          <Checkbox
            checked={checked()}
            onChange={({ checked: v }) => checked.set(v)}
            style={{ gap: 12 }}
            indicatorStyle={{ width: 20, height: 20 }}
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>Style merge</Text>
          </Checkbox>
          <Switch checked={on()} onChange={({ checked: v }) => on.set(v)}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Notifications</Text>
          </Switch>
          <Switch size="sm" checked={on()} onChange={({ checked: v }) => on.set(v)}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Small switch</Text>
          </Switch>
          <Switch
            checked={on()}
            onChange={({ checked: v }) => on.set(v)}
            style={{ gap: 12 }}
            trackStyle={{ width: 44 }}
            thumbClass="checked:translate-x-5"
          >
            <Text style={{ fontSize: 14, color: colors.foreground }}>Switch style merge</Text>
          </Switch>
          <RadioGroup>
            <RadioGroupItem
              checked={radio() === "a"}
              onChange={({ checked }) => checked && radio.set("a")}
            >
              <Text style={{ fontSize: 14, color: colors.foreground }}>Option A</Text>
            </RadioGroupItem>
            <RadioGroupItem
              checked={radio() === "b"}
              onChange={({ checked }) => checked && radio.set("b")}
            >
              <Text style={{ fontSize: 14, color: colors.foreground }}>Option B</Text>
            </RadioGroupItem>
          </RadioGroup>
          <RadioGroup style={{ gap: 16 }}>
            <RadioGroupItem
              checked={radio() === "a"}
              onChange={({ checked }) => checked && radio.set("a")}
              style={{ gap: 12 }}
            >
              <Text style={{ fontSize: 14, color: colors.foreground }}>Radio style merge</Text>
            </RadioGroupItem>
          </RadioGroup>
        </Section>

        <Section title="Progress">
          <Progress value={progress()} accessibilityLabel="Upload" />
          <Progress indeterminate accessibilityLabel="Connecting" />
          <Progress
            value={progress()}
            style={{ gap: 8 }}
            trackStyle={{ height: 8 }}
            indicatorStyle={{ backgroundColor: colors.destructive }}
          >
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Progress style merge
            </Text>
          </Progress>
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
              <TabsTrigger value="three" disabled>
                Disabled
              </TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel one</Text>
            </TabsContent>
            <TabsContent value="two">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel two</Text>
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="a">
            <TabsList variant="line">
              <TabsTrigger value="a">Line A</TabsTrigger>
              <TabsTrigger value="b">Line B</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Line panel A</Text>
            </TabsContent>
            <TabsContent value="b">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Line panel B</Text>
            </TabsContent>
          </Tabs>
          <Tabs value={tab()} onValueChange={(v) => tab.set(v)} style={{ gap: 16 }}>
            <TabsList style={{ gap: 8 }}>
              <TabsTrigger value="one" style={{ paddingHorizontal: 16 }}>
                Style merge
              </TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Merged chrome</Text>
            </TabsContent>
            <TabsContent value="two">
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel two</Text>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Popover">
          <Popover open={popoverOpen()} onOpenChange={({ open: next }) => popoverOpen.set(next)}>
            <PopoverTrigger>Open popover</PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Quick tip</PopoverTitle>
                <PopoverDescription>
                  Trigger / Content with surface chrome. Outside press or Escape closes.
                </PopoverDescription>
              </PopoverHeader>
              <Button variant="outline" onPress={() => popoverOpen.set(false)}>
                Close
              </Button>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger>Style merge</PopoverTrigger>
            <PopoverContent popupStyle={{ padding: 20, minWidth: 320 }}>
              <PopoverTitle style={{ fontSize: 16 }}>Merged chrome</PopoverTitle>
              <PopoverDescription>Consumer popupStyle wins per key</PopoverDescription>
            </PopoverContent>
          </Popover>
        </Section>

        <Section title="Tooltip">
          <Tooltip>
            <TooltipTrigger>Hover me</TooltipTrigger>
            <TooltipContent>Add item</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>Bottom</TooltipTrigger>
            <TooltipContent placement="bottom" align="start">
              Below the trigger
            </TooltipContent>
          </Tooltip>
          <TooltipProvider delay={0}>
            <Tooltip>
              <TooltipTrigger>Instant</TooltipTrigger>
              <TooltipContent>Shows at once</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Tooltip open={tipOpen()} onOpenChange={({ open: next }) => tipOpen.set(next)}>
            <TooltipTrigger>Pinned</TooltipTrigger>
            <TooltipContent style={{ paddingHorizontal: 14 }}>
              Controlled — useful on touch
            </TooltipContent>
          </Tooltip>
          <View tooltip={<TooltipContent>Host bubble</TooltipContent>}>
            <Text style={{ fontSize: 14, color: colors.foreground }}>Host tooltip=</Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Tip open: {() => (tipOpen() ? "yes" : "no")}
          </Text>
        </Section>

        <Section title="Sheet">
          <Sheet open={sheetOpen()} onOpenChange={({ open: next }) => sheetOpen.set(next)}>
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

        <Section title="Collapsible">
          <Collapsible
            open={collapsibleOpen()}
            onOpenChange={({ open: next }) => collapsibleOpen.set(next)}
          >
            <CollapsibleTrigger>Toggle</CollapsibleTrigger>
            <CollapsibleContent>
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                Controlled panel — Hidden until open.
              </Text>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible defaultOpen>
            <CollapsibleTrigger>Style merge</CollapsibleTrigger>
            <CollapsibleContent style={{ gap: 12 }}>
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                Consumer style wins per key over region chrome.
              </Text>
            </CollapsibleContent>
          </Collapsible>
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

        <Section title="Menu">
          <Menu open={menuOpen()} onOpenChange={({ open: next }) => menuOpen.set(next)}>
            <MenuTrigger>Open menu</MenuTrigger>
            <MenuContent>
              <MenuLabel>Account</MenuLabel>
              <MenuItem onSelect={() => menuLast.set("Profile")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Profile</Text>
              </MenuItem>
              <MenuItem onSelect={() => menuLast.set("Settings")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Settings</Text>
              </MenuItem>
              <MenuSeparator />
              <MenuCheckboxItem
                checked={menuSidebar()}
                closeOnSelect={false}
                onSelect={() => menuSidebar.set(!menuSidebar())}
              >
                <Text style={{ fontSize: 14, color: colors.foreground }}>Show sidebar</Text>
              </MenuCheckboxItem>
              <MenuSeparator />
              <MenuItem onSelect={() => menuLast.set("Log out")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Log out</Text>
              </MenuItem>
            </MenuContent>
          </Menu>
          <Menu>
            <MenuTrigger>Style merge</MenuTrigger>
            <MenuContent popupStyle={{ minWidth: 220, padding: 8 }}>
              <MenuItem style={{ height: 36 }} onSelect={() => menuLast.set("Merged")}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Merged chrome</Text>
              </MenuItem>
            </MenuContent>
          </Menu>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Menu open: {() => (menuOpen() ? "yes" : "no")} · Last: {() => menuLast()}
          </Text>
        </Section>

        <Section title="Context Menu">
          <ContextMenu open={ctxOpen()} onOpenChange={({ open: next }) => ctxOpen.set(next)}>
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

        <Section title="Dialog">
          <Dialog open={dialogOpen()} onOpenChange={({ open: next }) => dialogOpen.set(next)}>
            <DialogTrigger>Open dialog</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>
                  Trigger / Content with card chrome. Backdrop, Escape, or Close dismisses.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose>Cancel</DialogClose>
                <DialogClose variant="default">Confirm</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger>Style merge</DialogTrigger>
            <DialogContent style={{ padding: 32, maxWidth: 480 }}>
              <DialogTitle style={{ fontSize: 18 }}>Merged chrome</DialogTitle>
              <DialogDescription>Consumer style wins per key</DialogDescription>
              <DialogFooter>
                <DialogClose>Close</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            Dialog open: {() => (dialogOpen() ? "yes" : "no")}
          </Text>
        </Section>

        <Section title="Accordion / Avatar / Link">
          <Accordion value={accordionOpen()} onChange={({ value }) => accordionOpen.set(value)}>
            <AccordionItem value="section-1">
              <AccordionTrigger>
                <Text style={{ fontSize: 14, color: colors.foreground }}>Section 1</Text>
              </AccordionTrigger>
              <AccordionPanel>
                <Text style={{ fontSize: 13, color: colors.mutedForeground, paddingBottom: 8 }}>
                  Accordion panel content.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Avatar name="Ada Lovelace" />
            <AvatarGroup limit={2} total={4}>
              <Avatar name="A" size={36} />
              <Avatar name="B" size={36} />
              <Avatar name="C" size={36} />
            </AvatarGroup>
          </View>
          <Link href="https://nsh.dev">nsh.dev</Link>
        </Section>

        <Section title="Select / Combobox / Slider / Inputs">
          <Select value={fruit()} onChange={({ value }) => fruit.set(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectContent>
          </Select>
          <Combobox multiple value={tags()} onChange={({ value }) => tags.set(value)}>
            <ComboboxTrigger>
              <ComboboxValue placeholder="Tags" />
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxItem value="react">React</ComboboxItem>
              <ComboboxItem value="vue">Vue</ComboboxItem>
            </ComboboxContent>
          </Combobox>
          <Slider value={volume()} onChange={({ value }) => volume.set(value as number)} />
          <NumberInput
            value={quantity()}
            min={0}
            max={20}
            onChange={({ value }) => value != null && quantity.set(value)}
          />
          <OtpInput length={4} value={otp()} onChange={({ value }) => otp.set(value)} />
          <Pagination page={page()} totalPages={5} onChange={({ page: p }) => page.set(p)} />
        </Section>

        <Section title="Toggle group">
          <ToggleGroup>
            <Toggle
              pressed={textAlign() === "left"}
              onChange={({ pressed }) => pressed && textAlign.set("left")}
            >
              <Text style={{ fontSize: 13, color: colors.foreground }}>L</Text>
            </Toggle>
            <Toggle
              pressed={textAlign() === "center"}
              onChange={({ pressed }) => pressed && textAlign.set("center")}
            >
              <Text style={{ fontSize: 13, color: colors.foreground }}>C</Text>
            </Toggle>
            <Toggle
              pressed={textAlign() === "right"}
              onChange={({ pressed }) => pressed && textAlign.set("right")}
            >
              <Text style={{ fontSize: 13, color: colors.foreground }}>R</Text>
            </Toggle>
          </ToggleGroup>
        </Section>

        <Section title="Toast">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Button onPress={() => toast("Copied", { description: "Link on clipboard" })}>
              Show toast
            </Button>
            <Button
              variant="secondary"
              onPress={() => toast("Merged chrome", { description: "stackStyle wins per key" })}
            >
              Style merge
            </Button>
            <Button variant="outline" onPress={() => toast.dismiss()}>
              Dismiss all
            </Button>
          </View>
        </Section>
      </View>
      <Toaster placement="topRight" stackStyle={{ maxWidth: 360 }} />
    </Scroll>
  );
}

mount(App);
