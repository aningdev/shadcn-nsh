import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { TabTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const section = signal("overview");
  const folder = signal("inbox");

  return (
    <DemoPage title="Tabs" note={() => `${section()} · ${folder()}`}>
      <DemoCard>
        <DemoSection title="Pill">
          <Tabs value={section()} onValueChange={(v) => section.set(v)} defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">
                <TabTitle name="Overview" selected={section() === "overview"} />
              </TabsTrigger>
              <TabsTrigger value="activity">
                <TabTitle name="Activity" selected={section() === "activity"} />
              </TabsTrigger>
              <TabsTrigger value="settings">
                <TabTitle name="Settings" selected={section() === "settings"} />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Text style={{ fontSize: 14, color: colors.text }}>Content for overview.</Text>
            </TabsContent>
            <TabsContent value="activity">
              <Text style={{ fontSize: 14, color: colors.text }}>Content for activity.</Text>
            </TabsContent>
            <TabsContent value="settings">
              <Text style={{ fontSize: 14, color: colors.text }}>Content for settings.</Text>
            </TabsContent>
          </Tabs>
        </DemoSection>
      </DemoCard>
      <DemoCard>
        <DemoSection title="Underline">
          <Tabs value={folder()} onValueChange={(v) => folder.set(v)} defaultValue="inbox">
            <TabsList variant="line">
              <TabsTrigger value="inbox">
                <TabTitle name="Inbox" count={12} selected={folder() === "inbox"} underline />
              </TabsTrigger>
              <TabsTrigger value="archive">
                <TabTitle name="Archive" selected={folder() === "archive"} underline />
              </TabsTrigger>
              <TabsTrigger value="spam" disabled>
                <TabTitle name="Spam" count={3} selected={folder() === "spam"} underline />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox">
              <View>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  Spam is disabled on the strip.
                </Text>
              </View>
            </TabsContent>
          </Tabs>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
