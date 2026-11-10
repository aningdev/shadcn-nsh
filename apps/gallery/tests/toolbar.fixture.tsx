import { colors } from "@shadcn-nsh/theme";
import {
  Button,
  Link,
  Toggle,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  toolbarTrackStyle,
} from "@shadcn-nsh/ui";
import { computed, mount, signal, Text, View } from "nsh";

function App() {
  const bold = signal(0);
  const docs = signal(0);
  const italic = signal(false);
  const locked = signal(false);
  const track = computed(() => toolbarTrackStyle().backgroundColor);
  const ink = computed(() => colors.foreground);
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text>{() => `bold ${bold()}`}</Text>
      <Text>{() => `docs ${docs()}`}</Text>
      <Text>{() => `italic ${italic() ? "on" : "off"}`}</Text>
      <Text>{() => `locked ${locked() ? "yes" : "no"}`}</Text>
      <Text style={{ backgroundColor: colors.muted, color: ink() }}>
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
    </View>
  );
}

mount(App);
