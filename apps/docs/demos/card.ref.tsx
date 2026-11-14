// The reference of `card.tsx`: the same page with the card's look spread on plain views and
// texts, the way shadcn writes a card (`cardLook`). The render check requires the two pages to
// draw the same pixels, so this is what proves the seven parts change nothing.
import type { JSX } from "nsh";
import { mount, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { cardLook } from "@/packages/ui/card";
import { Input } from "@/packages/ui/input";
import { density } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { ui } from "./stage";

/** A card's width: two side by side in a wide window, one across a phone. */
const cardStyle = { flexGrow: 1, flexBasis: 300, maxWidth: 440 } as const;

/** A label over its control, inside a card's body. */
function Labeled(props: { label: string; children: JSX.Element }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: density.note, color: ui().muted }}>{props.label}</Text>
      {props.children}
    </View>
  );
}

const environments = [
  { name: "Production", state: "Healthy", tone: "up" },
  { name: "Staging", state: "Healthy", tone: "up" },
  { name: "Preview", state: "Building", tone: "warn" },
] as const;

function App() {
  return (
    <DemoPage title="Card">
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
        <View style={[cardLook().card, cardStyle]} accessibilityLabel="Login">
          <View style={cardLook().header}>
            <Text style={cardLook().title}>Login to your account</Text>
            <Text style={cardLook().description}>
              Enter your email below to login to your account.
            </Text>
            <View style={cardLook().action}>
              <Button variant="ghost" size="sm">
                Sign up
              </Button>
            </View>
          </View>
          <View style={cardLook().content}>
            <View style={{ gap: 10 }}>
              <Labeled label="Email">
                <Input placeholder="m@example.com" />
              </Labeled>
              <Labeled label="Password">
                <Input masked placeholder="••••••••" />
              </Labeled>
            </View>
          </View>
          <View style={cardLook().footer}>
            <Button variant="secondary" style={{ flexGrow: 1 }}>
              Login
            </Button>
            <Button variant="ghost" style={{ flexGrow: 1 }}>
              Google
            </Button>
          </View>
        </View>

        <View style={[cardLook().card, cardStyle]} accessibilityLabel="Deployments">
          <View style={cardLook().header}>
            <Text style={cardLook().title}>Deployments</Text>
            <Text style={cardLook().description}>Three environments, one still building.</Text>
            <View style={cardLook().action}>
              <Badge tone="info">Live</Badge>
            </View>
          </View>
          <View style={cardLook().content}>
            <View style={{ gap: 8 }}>
              {environments.map((env) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text style={{ fontSize: density.body, color: ui().text }}>{env.name}</Text>
                  <Badge tone={env.tone} variant="outline">
                    {env.state}
                  </Badge>
                </View>
              ))}
            </View>
          </View>
          <View style={cardLook().footer}>
            <Button variant="secondary">View all</Button>
            <Text style={{ fontSize: density.note, color: ui().faint }}>Updated 2 hours ago</Text>
          </View>
        </View>
      </View>
    </DemoPage>
  );
}

mount(App);
