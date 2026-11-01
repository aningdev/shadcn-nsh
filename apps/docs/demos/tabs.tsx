import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../packages/ui/tabs";

function App() {
  const tab = signal("one");

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Tabs</Text>
      <Tabs value={tab()} onValueChange={(v) => tab.set(v)}>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
          <TabsTrigger value="three">Three</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel one</Text>
        </TabsContent>
        <TabsContent value="two">
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel two</Text>
        </TabsContent>
        <TabsContent value="three">
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Panel three</Text>
        </TabsContent>
      </Tabs>
    </View>
  );
}

mount(App);
