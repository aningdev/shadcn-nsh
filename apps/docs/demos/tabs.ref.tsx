// The reference of `tabs.tsx`: the same page with the look spread on `nsh/base`'s Tabs.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Tab, Tabs } from "nsh/base";

import { TabTitle, tabsLook, underlineTabsLook } from "@/packages/ui/tabs";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const section = signal("overview");
  const folder = signal("inbox");
  const strip = tabsLook();
  const underline = underlineTabsLook();

  return (
    <DemoPage title="Tabs" note={() => `${section()} · ${folder()}`}>
      <DemoCard>
        <DemoSection title="Pill">
          <View
            style={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: 8,
            }}
          >
            <Tabs style={strip.style} indicatorStyle={strip.indicatorStyle}>
              {(
                [
                  ["overview", "Overview"],
                  ["activity", "Activity"],
                  ["settings", "Settings"],
                ] as const
              ).map(([value, name]) => (
                <Tab
                  selected={section() === value}
                  onPress={() => section.set(value)}
                  {...strip.tab({ selected: () => section() === value })}
                >
                  <TabTitle name={name} selected={section() === value} />
                </Tab>
              ))}
            </Tabs>
            <View style={{ display: section() === "overview" ? "flex" : "none" }}>
              <Text style={{ fontSize: 14, color: colors.text }}>Content for overview.</Text>
            </View>
            <View style={{ display: section() === "activity" ? "flex" : "none" }}>
              <Text style={{ fontSize: 14, color: colors.text }}>Content for activity.</Text>
            </View>
            <View style={{ display: section() === "settings" ? "flex" : "none" }}>
              <Text style={{ fontSize: 14, color: colors.text }}>Content for settings.</Text>
            </View>
          </View>
        </DemoSection>
      </DemoCard>
      <DemoCard>
        <DemoSection title="Underline">
          <View
            style={{
              flexDirection: "column",
              alignItems: "stretch",
              gap: 8,
            }}
          >
            <View style={{ alignSelf: "stretch" }}>
              <View style={underline.rule} />
              <Tabs style={underline.style} indicatorStyle={underline.indicatorStyle}>
                <Tab
                  selected={folder() === "inbox"}
                  onPress={() => folder.set("inbox")}
                  {...underline.tab({ selected: () => folder() === "inbox" })}
                >
                  <TabTitle name="Inbox" count={12} selected={folder() === "inbox"} underline />
                </Tab>
                <Tab
                  selected={folder() === "archive"}
                  onPress={() => folder.set("archive")}
                  {...underline.tab({ selected: () => folder() === "archive" })}
                >
                  <TabTitle name="Archive" selected={folder() === "archive"} underline />
                </Tab>
                <Tab
                  selected={folder() === "spam"}
                  disabled
                  {...underline.tab({
                    selected: () => folder() === "spam",
                    disabled: true,
                  })}
                >
                  <TabTitle name="Spam" count={3} selected={folder() === "spam"} underline />
                </Tab>
              </Tabs>
            </View>
            <View style={{ display: folder() === "inbox" ? "flex" : "none" }}>
              <View>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  Spam is disabled on the strip.
                </Text>
              </View>
            </View>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
