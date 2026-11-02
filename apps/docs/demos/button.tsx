import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

// Avoid `@shadcn-nsh/ui` barrel: it pulls wrappers that need a newer `nsh/base`.
import { Button, buttonVariants } from "../../../packages/ui/button";
import { Link } from "../../../packages/ui/link";

function App() {
  const count = signal(0);
  const selected = signal(false);
  const bump = () => count.set(count() + 1);
  const outlineLink = buttonVariants({ variant: "outline", size: "sm" });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
        Button · clicks {() => count()}
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <Button onPress={bump}>Default</Button>
        <Button variant="secondary" onPress={bump}>
          Secondary
        </Button>
        <Button variant="outline" onPress={bump}>
          Outline
        </Button>
        <Button variant="ghost" onPress={bump}>
          Ghost
        </Button>
        <Button variant="destructive" onPress={bump}>
          Destructive
        </Button>
        <Button variant="link" onPress={bump}>
          Link
        </Button>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <Button size="xs" onPress={bump}>
          XS
        </Button>
        <Button size="sm" onPress={bump}>
          SM
        </Button>
        <Button size="default" onPress={bump}>
          Default
        </Button>
        <Button size="lg" onPress={bump}>
          LG
        </Button>
        <Button size="icon" accessibilityLabel="Add" onPress={bump}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primaryForeground }}>
            +
          </Text>
        </Button>
        <Button selected={selected()} onPress={() => selected.set(!selected())} variant="outline">
          Selected
        </Button>
        <Button disabled onPress={bump}>
          Disabled
        </Button>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <Button onPress={bump}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>+</Text>
            <Text style={{ color: colors.primaryForeground, fontWeight: "500", fontSize: 14 }}>
              With icon
            </Text>
          </View>
        </Button>
        <Link
          href="https://nsh.dev"
          style={outlineLink.style}
          hoverStyle={outlineLink.hoverStyle}
          activeStyle={outlineLink.activeStyle}
        >
          <Text style={outlineLink.label}>As Link</Text>
        </Link>
      </View>
    </View>
  );
}

mount(App);
