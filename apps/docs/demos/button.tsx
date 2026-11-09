import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

// Avoid `@shadcn-nsh/ui` barrel: it pulls wrappers that need a newer `nsh/base`.
import { Button } from "@/packages/ui/button";

function App() {
  const count = signal(0);
  const selected = signal(false);
  const saving = signal(false);
  const canPublish = signal(false);

  const bump = () => count.set(count() + 1);

  const save = () => {
    if (saving()) return;
    saving.set(true);
    setTimeout(() => saving.set(false), 1200);
  };

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
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <Button selected={selected()} onPress={() => selected.set(!selected())} variant="outline">
          <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
            {() => (selected() ? "Selected" : "Select")}
          </Text>
        </Button>

        <Button onPress={bump}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>+</Text>
            <Text style={{ color: colors.primaryForeground, fontWeight: "500", fontSize: 14 }}>
              With icon
            </Text>
          </View>
        </Button>

        <Button disabled={saving()} onPress={save}>
          <Text style={{ fontSize: 14, fontWeight: "500", color: colors.primaryForeground }}>
            {() => (saving() ? "Saving…" : "Save")}
          </Text>
        </Button>

        <Button
          variant="secondary"
          disabled={!canPublish()}
          onPress={bump}
          accessibilityLabel={
            canPublish() ? "Publish" : "Publish unavailable — turn on Ready first"
          }
        >
          Publish
        </Button>
        <Button
          size="sm"
          variant="outline"
          selected={canPublish()}
          onPress={() => canPublish.set(!canPublish())}
        >
          <Text style={{ fontSize: 13, fontWeight: "500", color: colors.foreground }}>
            {() => (canPublish() ? "Ready" : "Locked")}
          </Text>
        </Button>
      </View>

      <Button onPress={bump} style={{ paddingHorizontal: 24 }} hoverStyle={{ opacity: 0.75 }}>
        Style merge
      </Button>
    </View>
  );
}

mount(App);
