/* oxlint-disable react/jsx-no-undef -- <Each> is an NSH global */
// Pilot S: the button and the switch, every kind, size and state, on the page and on a card.
import { colors, radius } from "@shadcn-nsh/theme";
import { Button, Switch } from "@shadcn-nsh/ui";
import { mount, Scroll, Text, View } from "nsh";

const variants = ["default", "secondary", "outline", "ghost", "destructive"] as const;
const sizes = ["xs", "sm", "default", "lg"] as const;

function Label(props: { children: string }) {
  return (
    <Text style={{ fontSize: 12, color: colors.mutedForeground, width: 84 }}>{props.children}</Text>
  );
}

function Row(props: { label: string; children: unknown }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Label>{props.label}</Label>
      {props.children as never}
    </View>
  );
}

function Panel(props: { title: string; children: unknown }) {
  return (
    <View
      style={{
        gap: 12,
        padding: 16,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        {props.title}
      </Text>
      {props.children as never}
    </View>
  );
}

function Page() {
  return (
    <View style={{ gap: 16, padding: 20, backgroundColor: colors.background }}>
      <Panel title="Button — kinds">
        <Row label="rest">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 }}>
            <Each of={[...variants]}>{(v) => <Button variant={v()}>{v()}</Button>}</Each>
          </View>
        </Row>
        <Row label="disabled">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 }}>
            <Each of={[...variants]}>
              {(v) => (
                <Button variant={v()} disabled>
                  {v()}
                </Button>
              )}
            </Each>
          </View>
        </Row>
        <Row label="selected">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, flex: 1 }}>
            <Each of={[...variants]}>
              {(v) => (
                <Button variant={v()} selected>
                  {v()}
                </Button>
              )}
            </Each>
          </View>
        </Row>
      </Panel>
      <Panel title="Button — sizes">
        <Row label="sizes">
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              flex: 1,
            }}
          >
            <Each of={[...sizes]}>
              {(s) => (
                <Button size={s()} variant="secondary">
                  {s()}
                </Button>
              )}
            </Each>
          </View>
        </Row>
        <Row label="icon">
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              flex: 1,
            }}
          >
            <Button size="icon-xs" variant="outline">
              +
            </Button>
            <Button size="icon-sm" variant="outline">
              +
            </Button>
            <Button size="icon" variant="outline">
              +
            </Button>
            <Button size="icon-lg" variant="outline">
              +
            </Button>
          </View>
        </Row>
      </Panel>
      <Panel title="Switch">
        <Row label="off / on">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Switch checked={false} />
            <Switch checked />
            <Switch checked={false} disabled />
            <Switch checked disabled />
          </View>
        </Row>
        <Row label="sm">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Switch size="sm" checked={false} />
            <Switch size="sm" checked />
          </View>
        </Row>
      </Panel>
    </View>
  );
}

mount(() => (
  <Scroll style={{ flex: 1, backgroundColor: colors.background }}>
    <Page />
  </Scroll>
));
