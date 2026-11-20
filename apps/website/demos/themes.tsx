// The themes page's showcase: not a component's demo, but one page of the library's controls —
// buttons, badges, a card with fields, a switch, a slider and a progress bar — so a palette's colors,
// radii and finishes can be seen together. The palette is the docs site's choice (`kit.tsx`
// imports `apply-palette.ts`): a page switched to a theme draws it from its first frame.
import { colors } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card";
import { Input } from "@/packages/ui/input";
import { Progress } from "@/packages/ui/progress";
import { Slider } from "@/packages/ui/slider";
import { Switch } from "@/packages/ui/switch";

import { DemoCard, DemoPage, DemoSection } from "./kit";

/** A card beside its sibling in a wide window, across the whole of a phone. */
const cardStyle = { flexGrow: 1, flexBasis: 300, maxWidth: 440 } as const;

/** A label over its control. */
function Labeled(props: { label: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{props.label}</Text>
      {props.children}
    </View>
  );
}

function App() {
  const updates = signal(true);
  const used = signal(60);

  return (
    <DemoPage title="Themes">
      <Text style={{ color: colors.mutedForeground }}>
        The library's controls in the palette this page was loaded with: the docs site's Demo theme
        switch chooses it, and a demo reads it before it mounts.
      </Text>

      <DemoCard>
        <DemoSection title="Buttons">
          <Button>Save</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
        </DemoSection>
        <DemoSection title="Badges">
          <Badge>neutral</Badge>
          <Badge tone="accent">accent</Badge>
          <Badge tone="info">info</Badge>
          <Badge tone="warn">warn</Badge>
          <Badge tone="destructive">danger</Badge>
          <Badge tone="up">up</Badge>
        </DemoSection>
      </DemoCard>

      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
        <Card style={cardStyle} accessibilityLabel="Workspace">
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>A card's surface, its insets and its buttons.</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={{ gap: 10 }}>
              <Labeled label="Name">
                <Input placeholder="Acme Inc." />
              </Labeled>
              <Labeled label="Email">
                <Input placeholder="m@example.com" />
              </Labeled>
            </View>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" style={{ flexGrow: 1 }}>
              Save
            </Button>
            <Button variant="ghost" style={{ flexGrow: 1 }}>
              Cancel
            </Button>
          </CardFooter>
        </Card>

        <Card style={cardStyle} accessibilityLabel="Settings">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>The controls that change with a theme's finishes.</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={{ gap: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 14, color: colors.foreground }}>Automatic updates</Text>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                    Install in the background.
                  </Text>
                </View>
                <Switch
                  accessibilityLabel="Automatic updates"
                  checked={updates()}
                  onChange={(event) => updates.set(event.checked)}
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Storage used</Text>
                <Progress value={used()} />
              </View>
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Volume</Text>
                <Slider value={used()} onChange={({ value }) => used.set(value as number)} />
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </DemoPage>
  );
}

mount(App);
