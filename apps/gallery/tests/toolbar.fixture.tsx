import { computed, mount, signal, Text, View } from "nsh";

import { colors } from "../../../packages/theme";
import {
  Button,
  Link,
  Toggle,
  ToggleGroup,
  Toolbar,
  ToolbarGroup,
  ToolbarButton,
  ToolbarSeparator,
  toolbarTrack,
} from "../../../packages/ui";

function App() {
  const bold = signal(0);
  const docs = signal(0);
  const italic = signal(false);
  const locked = signal(false);
  const share = signal(0);
  const marks = signal(false);
  const track = computed(() => {
    const value = toolbarTrack().backgroundColor;
    return typeof value === "string" ? value : "gone";
  });
  const ink = computed(() => colors.foreground);
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text>{() => `bold ${bold()}`}</Text>
      <Text>{() => `docs ${docs()}`}</Text>
      <Text>{() => `italic ${italic() ? "on" : "off"}`}</Text>
      <Text>{() => `locked ${locked() ? "yes" : "no"}`}</Text>
      <Text>{() => `share ${share()}`}</Text>
      <Text>{() => `marks ${marks() ? "on" : "off"}`}</Text>
      <Text style={{ backgroundColor: colors.mutedForeground, color: ink() }}>
        {() => `track ${track()}`}
      </Text>
      <Toolbar accessibilityLabel="Formatting">
        <ToolbarGroup accessibilityLabel="Marks">
          <Button accessibilityLabel="Bold" variant="ghost" onPress={() => bold.set(bold() + 1)}>
            Bold
          </Button>
          <Toggle
            accessibilityLabel="Italic"
            pressed={italic()}
            onChange={({ pressed }) => italic.set(pressed)}
          >
            Italic
          </Toggle>
        </ToolbarGroup>
        <ToolbarSeparator />
        <Link
          accessibilityLabel="Docs"
          href="https://nsh.dev"
          openWith="app"
          onPress={() => docs.set(docs() + 1)}
        >
          Docs
        </Link>
        <Button accessibilityLabel="Off" disabled>
          Off
        </Button>
      </Toolbar>
      <Button onPress={() => locked.set(true)}>Lock</Button>
      <Toolbar accessibilityLabel="Review" disabled={locked()}>
        <Button accessibilityLabel="Approve" onPress={() => docs.set(docs() + 1)}>
          Approve
        </Button>
      </Toolbar>
      {/* One run of this bar is locked on its own: the group hands its lock down to its items. */}
      <Toolbar accessibilityLabel="Share">
        <Button
          accessibilityLabel="Copy link"
          variant="ghost"
          onPress={() => share.set(share() + 1)}
        >
          Copy link
        </Button>
        <ToolbarGroup accessibilityLabel="Delivery" disabled>
          <Button accessibilityLabel="Send" variant="ghost" onPress={() => share.set(share() + 1)}>
            Send
          </Button>
        </ToolbarGroup>
      </Toolbar>
      {/* A group's own `disabled` reaches its toggles: none of them carries one. */}
      <ToggleGroup disabled>
        <Toggle pressed={marks()} onChange={({ pressed }) => marks.set(pressed)}>
          B
        </Toggle>
        <Toggle>I</Toggle>
      </ToggleGroup>
      {/* A `ToolbarButton`'s own `class` and `style` land on the box it stands in. */}
      <Toolbar accessibilityLabel="Sizing">
        <ToolbarButton class="opacity-50">
          <Button accessibilityLabel="Classed">Classed</Button>
        </ToolbarButton>
        <ToolbarButton style={{ opacity: 0.25 }}>
          <Button accessibilityLabel="Styled">Styled</Button>
        </ToolbarButton>
      </Toolbar>
    </View>
  );
}

mount(App);
