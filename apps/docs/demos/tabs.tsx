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
        gap: 16,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Tabs</Text>
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
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Selected: {() => tab()}</Text>
    </View>
  );
}

mount(App);
