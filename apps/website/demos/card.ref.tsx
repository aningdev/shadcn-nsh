// The reference of `card.tsx`. `cardLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
import type { JSX } from "nsh";
import { mount, Text, View } from "nsh";

import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card";
import { Input } from "@/packages/ui/input";
import { density } from "@/packages/ui/lib/surface";

import { DemoPage } from "./kit";
import { ui } from "./stage";

/** A card's width: two side by side in a wide window, one across a phone — and narrower than its
 * 300-point basis on a 320-point phone (`flexShrink`), where a fixed 300 would run past the page. */
const cardStyle = { flexGrow: 1, flexShrink: 1, flexBasis: 300, maxWidth: 440 } as const;

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
  { name: "Production", state: "Healthy", tone: "success" },
  { name: "Staging", state: "Healthy", tone: "success" },
  { name: "Preview", state: "Building", tone: "warning" },
] as const;

function App() {
  return (
    <DemoPage title="Card">
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 16 }}>
        <Card style={cardStyle} accessibilityLabel="Login">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>Enter your email below to login to your account.</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm">
                Sign up
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <View style={{ gap: 10 }}>
              <Labeled label="Email">
                <Input placeholder="m@example.com" />
              </Labeled>
              <Labeled label="Password">
                <Input masked placeholder="••••••••" />
              </Labeled>
            </View>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" style={{ flexGrow: 1 }}>
              Login
            </Button>
            <Button variant="ghost" style={{ flexGrow: 1 }}>
              Google
            </Button>
          </CardFooter>
        </Card>

        <Card style={cardStyle} accessibilityLabel="Deployments">
          <CardHeader>
            <CardTitle>Deployments</CardTitle>
            <CardDescription>Three environments, one still building.</CardDescription>
            <CardAction>
              <Badge tone="info">Live</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <Button variant="secondary">View all</Button>
            <Text style={{ fontSize: density.note, color: ui().faint }}>Updated 2 hours ago</Text>
          </CardFooter>
        </Card>

        <Card style={cardStyle} accessibilityLabel="Cover">
          <CardHeader>
            <CardTitle>Cover</CardTitle>
            <CardDescription>The picture meets the card's edges.</CardDescription>
          </CardHeader>
          <CardContent flush>
            <View style={{ height: 96, backgroundColor: ui().inset.backgroundColor }} />
          </CardContent>
        </Card>
      </View>
    </DemoPage>
  );
}

mount(App);
