import { mount, Scroll, signal, Text, View } from "nsh";

import { colors } from "../../packages/theme";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  Radio,
  RadioGroup,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toast,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../packages/ui";

function Section(props: { title: string; children: unknown }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{props.title}</Text>
      {props.children as never}
    </View>
  );
}

function App() {
  const count = signal(0);
  const name = signal("");
  const checked = signal(true);
  const radio = signal("a");
  const on = signal(true);
  const progress = signal(42);
  const volume = signal(40);
  const tab = signal("one");
  const bold = signal(false);
  const language = signal<string | null>("en");
  const langOpen = signal(false);
  const frames = signal<string[]>(["react"]);
  const comboOpen = signal(false);

  return (
    <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 24, gap: 22, paddingBottom: 48 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: colors.text }}>shadcn-nsh</Text>
        <Text style={{ fontSize: 14, color: colors.muted }}>
          Styled wrappers smoke · presses {() => count()}
        </Text>

        <Section title="Button">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            <Button onPress={() => count.set(count() + 1)}>Primary</Button>
            <Button variant="default" onPress={() => count.set(count() + 1)}>
              Accent
            </Button>
            <Button variant="secondary" onPress={() => count.set(count() + 1)}>
              Secondary
            </Button>
            <Button variant="ghost" onPress={() => count.set(count() + 1)}>
              Ghost
            </Button>
            <Button variant="destructive" onPress={() => count.set(count() + 1)}>
              Danger
            </Button>
            <Button size="sm" onPress={() => count.set(count() + 1)}>
              Small
            </Button>
            <Button size="lg" onPress={() => count.set(count() + 1)}>
              Large
            </Button>
            <Button selected={bold()} variant="secondary" onPress={() => bold.set(!bold())}>
              Selected
            </Button>
          </View>
        </Section>

        <Section title="Badge · Avatar">
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Badge label="Neutral" />
            <Badge label="Info" tone="info" />
            <Badge label="Outline" tone="warn" outline />
            <Avatar name="Ada Lovelace" style={{ width: 36, height: 36 }} />
            <Avatar name="Grace Hopper" style={{ width: 36, height: 36 }} />
          </View>
        </Section>

        <Section title="Fields">
          <View style={{ gap: 10, maxWidth: 320 }}>
            <Input
              placeholder="Your name"
              value={name()}
              onChange={({ value: v }) => name.set(v)}
            />
            <View style={{ flexDirection: "row", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <Checkbox checked={checked()} onChange={({ checked: c }) => checked.set(c)} />
              <Text style={{ fontSize: 13, color: colors.text }}>Remember me</Text>
              <Switch checked={on()} onChange={({ checked: c }) => on.set(c)} />
            </View>
            <RadioGroup>
              <View style={{ flexDirection: "row", gap: 16 }}>
                <Radio
                  checked={radio() === "a"}
                  onChange={({ checked }) => checked && radio.set("a")}
                >
                  Plan A
                </Radio>
                <Radio
                  checked={radio() === "b"}
                  onChange={({ checked }) => checked && radio.set("b")}
                >
                  Plan B
                </Radio>
              </View>
            </RadioGroup>
            <Progress value={progress()} />
            <Slider
              value={volume()}
              onChange={({ value }) => volume.set(value as number)}
              showValue
            />
          </View>
        </Section>

        <Section title="Tabs · Toggle">
          <View style={{ gap: 12 }}>
            <Tabs value={tab()} onValueChange={(v) => tab.set(v)}>
              <TabsList>
                <TabsTrigger value="one">One</TabsTrigger>
                <TabsTrigger value="two">Two</TabsTrigger>
              </TabsList>
              <TabsContent value="one">
                <Text style={{ fontSize: 13, color: colors.muted }}>Panel one</Text>
              </TabsContent>
              <TabsContent value="two">
                <Text style={{ fontSize: 13, color: colors.muted }}>Panel two</Text>
              </TabsContent>
            </Tabs>
            <Toggle pressed={bold()} onChange={({ pressed }) => bold.set(pressed)}>
              Bold
            </Toggle>
          </View>
        </Section>

        <Section title="Overlays">
          <View style={{ gap: 14, minHeight: 120 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <Popover>
                <PopoverTrigger>Popover</PopoverTrigger>
                <PopoverContent placement="bottom" width={220}>
                  <Text style={{ fontSize: 13, color: colors.text }}>Floating panel content.</Text>
                </PopoverContent>
              </Popover>
              <Tooltip placement="top">
                <TooltipTrigger>Tooltip host</TooltipTrigger>
                <TooltipContent>Shortcut hint</TooltipContent>
              </Tooltip>
              <HoverCard>
                <HoverCardTrigger variant="ghost">Hover card</HoverCardTrigger>
                <HoverCardContent placement="bottom" width={200}>
                  <Text style={{ fontSize: 13, color: colors.muted }}>
                    Opens on hover or focus.
                  </Text>
                </HoverCardContent>
              </HoverCard>
            </View>
            <View style={{ width: 200 }}>
              <Menu>
                <MenuTrigger>Menu</MenuTrigger>
                <MenuContent>
                  <MenuLabel text="Actions" />
                  <MenuItem onSelect={() => count.set(count() + 1)}>
                    <Text>Increment</Text>
                  </MenuItem>
                  <MenuSeparator />
                  <MenuCheckboxItem
                    checked={checked()}
                    closeOnSelect={false}
                    onSelect={() => checked.set(!checked())}
                  >
                    <Text>Toggle flag</Text>
                  </MenuCheckboxItem>
                </MenuContent>
              </Menu>
            </View>
          </View>
        </Section>

        <Section title="Select · Combobox">
          <View style={{ gap: 12, maxWidth: 280 }}>
            <Select
              value={language()}
              open={langOpen()}
              placeholder="Choose language"
              onChange={({ value: next }) => language.set(next)}
              onOpenChange={({ open }) => langOpen.set(open)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent accessibilityLabel="Language">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
              </SelectContent>
            </Select>
            <Combobox
              value={frames()}
              open={comboOpen()}
              placeholder="Framework"
              onChange={({ value: next }) => frames.set(next)}
              onOpenChange={({ open }) => comboOpen.set(open)}
            >
              <ComboboxTrigger />
              <ComboboxContent accessibilityLabel="Framework">
                <ComboboxItem value="react">React</ComboboxItem>
                <ComboboxItem value="vue">Vue</ComboboxItem>
              </ComboboxContent>
            </Combobox>
          </View>
        </Section>

        <Section title="Dialog · Sheet">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            <Dialog>
              <DialogTrigger>Dialog</DialogTrigger>
              <DialogContent>
                <DialogTitle>Confirm</DialogTitle>
                <DialogDescription>This uses the ported dialog parts.</DialogDescription>
                <DialogFooter>
                  <DialogClose variant="secondary">Cancel</DialogClose>
                  <DialogClose variant="default">OK</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger>Open sheet</SheetTrigger>
              <SheetContent side="bottom">
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>Sheet</Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>
                  Slides from the bottom edge.
                </Text>
                <SheetClose>Done</SheetClose>
              </SheetContent>
            </Sheet>
          </View>
        </Section>

        <Section title="Toast">
          <Toast title="Saved" description="Static toast specimen — no toaster queue." />
        </Section>
      </View>
    </Scroll>
  );
}

mount(App);
