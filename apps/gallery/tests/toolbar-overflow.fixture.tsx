import { mount, signal, Text, View } from "nsh";

import {
  Button,
  MenuCheckboxItem,
  MenuItem,
  MenuRadioItem,
  Toggle,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarOverflow,
} from "../../../packages/ui";

function App() {
  const barWidth = signal(520);
  const bold = signal(true);
  const underline = signal(false);
  const align = signal<"left" | "center" | "right">("left");
  const undoCount = signal(0);
  const redoCount = signal(0);

  const soloWidth = signal(220);
  const soloActive = signal(false);

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text>{() => `underline ${underline() ? "on" : "off"}`}</Text>
      <Text>{() => `align ${align()}`}</Text>
      <Text>{() => `undo ${undoCount()}`}</Text>
      <Text>{() => `redo ${redoCount()}`}</Text>
      <Text>{() => `solo ${soloActive() ? "on" : "off"}`}</Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <Button onPress={() => barWidth.set(520)}>Width 520</Button>
        <Button onPress={() => barWidth.set(260)}>Width 260</Button>
        <Button onPress={() => barWidth.set(180)}>Width 180</Button>
        <Button onPress={() => soloWidth.set(50)}>Shrink solo</Button>
      </View>

      <View style={{ width: barWidth() }}>
        <Toolbar accessibilityLabel="Overflowing" style={{ alignSelf: "stretch" }}>
          <ToolbarGroup accessibilityLabel="History" fold="none">
            <ToolbarButton
              priority={4}
              menu={<MenuItem onSelect={() => undoCount.set(undoCount() + 1)}>Undo</MenuItem>}
            >
              <Button
                accessibilityLabel="Undo"
                variant="ghost"
                onPress={() => undoCount.set(undoCount() + 1)}
              >
                Undo
              </Button>
            </ToolbarButton>
            <ToolbarButton
              priority={3}
              menu={<MenuItem onSelect={() => redoCount.set(redoCount() + 1)}>Redo</MenuItem>}
            >
              <Button
                accessibilityLabel="Redo"
                variant="ghost"
                onPress={() => redoCount.set(redoCount() + 1)}
              >
                Redo
              </Button>
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarGroup accessibilityLabel="Marks" fold="none">
            <ToolbarButton foldable={false}>
              <Toggle
                accessibilityLabel="Bold"
                pressed={bold()}
                onChange={({ pressed }) => bold.set(pressed)}
              >
                B
              </Toggle>
            </ToolbarButton>
            <ToolbarButton
              priority={1}
              menu={
                <MenuCheckboxItem
                  checked={underline()}
                  onSelect={() => underline.set(!underline())}
                >
                  Underline
                </MenuCheckboxItem>
              }
            >
              <Toggle
                accessibilityLabel="Underline"
                pressed={underline()}
                onChange={({ pressed }) => underline.set(pressed)}
              >
                U
              </Toggle>
            </ToolbarButton>
          </ToolbarGroup>
          <ToolbarGroup accessibilityLabel="Alignment" priority={2} fold="unit">
            <Each of={["left", "center", "right"] as const}>
              {(a) => (
                <ToolbarButton
                  menu={
                    <MenuRadioItem checked={align() === a()} onSelect={() => align.set(a())}>
                      {`Align ${a()}`}
                    </MenuRadioItem>
                  }
                >
                  <Toggle
                    accessibilityLabel={`Align ${a()}`}
                    pressed={align() === a()}
                    onChange={({ pressed }) => pressed && align.set(a())}
                  >
                    {a()[0]!.toUpperCase()}
                  </Toggle>
                </ToolbarButton>
              )}
            </Each>
          </ToolbarGroup>
          <ToolbarOverflow accessibilityLabel="More tools" />
        </Toolbar>
      </View>

      <Button onPress={() => {}}>After overflow</Button>

      {/* Unmeasured item (never laid out): must not block folding of measured items (risk 5). */}
      <View style={{ width: 170 }}>
        <Toolbar accessibilityLabel="Unmeasured guard" style={{ alignSelf: "stretch" }}>
          <ToolbarButton
            priority={10}
            menu={<MenuItem onSelect={() => {}}>Never laid out</MenuItem>}
          >
            <View style={{ display: "none" }} />
          </ToolbarButton>
          <ToolbarButton priority={5} menu={<MenuItem onSelect={() => {}}>Keep me</MenuItem>}>
            <Button accessibilityLabel="Keep tool" variant="ghost" onPress={() => {}}>
              Keep tool
            </Button>
          </ToolbarButton>
          <ToolbarButton priority={0} menu={<MenuItem onSelect={() => {}}>Fold me first</MenuItem>}>
            <Button accessibilityLabel="Fold tool" variant="ghost" onPress={() => {}}>
              Fold tool
            </Button>
          </ToolbarButton>
          <ToolbarOverflow accessibilityLabel="Guard more" />
        </Toolbar>
      </View>

      <View style={{ width: soloWidth() }}>
        <Toolbar accessibilityLabel="Solo overflow" style={{ alignSelf: "stretch" }}>
          <ToolbarButton
            priority={0}
            menu={
              <MenuCheckboxItem
                checked={soloActive()}
                onSelect={() => soloActive.set(!soloActive())}
              >
                Solo item
              </MenuCheckboxItem>
            }
          >
            <Toggle
              accessibilityLabel="Solo tool"
              pressed={soloActive()}
              onChange={({ pressed }) => soloActive.set(pressed)}
            >
              Solo
            </Toggle>
          </ToolbarButton>
          <ToolbarOverflow accessibilityLabel="Solo more" />
        </Toolbar>
      </View>
    </View>
  );
}

mount(App);
