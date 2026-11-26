var e=`import { colors, stroke } from "@shadcn-nsh/theme";
// The official item scenes (shadcn's \`item-demo\`, \`item-variant\`, \`item-size\`, \`item-group\`,
// \`item-header\` and \`item-footer\`) with this library's parts: a list of rows split by hairlines —
// an icon's tile, an avatar, a clipping frame — then the three variants and the two sizes, each
// row's header naming its axis and its footer holding its controls. Every row is layout only;
// what a row does when pressed is the container's call (\`Item\` takes no presses).
import { Bell, Image as ImageIcon } from "lucide";
import { List, mount, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/packages/ui/item";
import { Icon } from "@/packages/ui/lib/icons";
import { sectionSurface } from "@/packages/ui/lib/surface";

import { type Contact, type ContactHeading, contactRows } from "./contacts";
import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

const { rows: contacts, headings } = contactRows();

/** A section heading: opaque, so the rows scroll under it while it sticks. */
function Heading(props: { heading: ContactHeading }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        height: 34,
        paddingHorizontal: 12,
        backgroundColor: colors.card,
        borderBottomWidth: stroke.hairline,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "700", color: colors.brand }}>
        {props.heading.heading}
      </Text>
      <View style={{ flex: 1 }} />
      <Text style={{ fontSize: 13, color: colors.faint, fontVariant: ["tabular-nums"] }}>
        {props.heading.count}
      </Text>
    </View>
  );
}

function ContactItem(props: { contact: Contact }) {
  return (
    <Item>
      <ItemMedia>
        <Avatar name={props.contact.name} style={{ width: 36, height: 36 }} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{props.contact.name}</ItemTitle>
        <ItemDescription>{props.contact.note}</ItemDescription>
      </ItemContent>
    </Item>
  );
}

/** A long list: contacts as \`ItemGroup\` rows inside a \`List\`, with the letters' headings sticking. */
function Contacts() {
  return (
    <View style={{ height: 320, ...sectionSurface({ padded: false }), overflow: "hidden" }}>
      <ItemGroup style={{ flex: 1 }}>
        <List
          each={contacts}
          stickyHeaderIndices={headings}
          estimatedItemSize={60}
          style={{ flex: 1 }}
        >
          {(row) => (
            <If when={"heading" in row()} else={<ContactItem contact={row() as Contact} />}>
              <Heading heading={row() as ContactHeading} />
            </If>
          )}
        </List>
      </ItemGroup>
    </View>
  );
}

function App() {
  return (
    <DemoPage title="Item">
      <DemoCard padded={false} style={{ padding: 8 }}>
        <ItemGroup>
          <Item variant="default">
            <ItemMedia variant="icon">
              <Icon icon={Bell} size={18} tint={ui().muted} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>New comment</ItemTitle>
              <ItemDescription>Mira replied to your post in #design.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" variant="ghost">
                Open
              </Button>
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemMedia>
              <Avatar name="Mira Lund" style={{ width: 36, height: 36 }} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Mira joined the team</ItemTitle>
              <ItemDescription>Designer, shipping the settings screens.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge tone="success">New</Badge>
            </ItemActions>
          </Item>
          <ItemSeparator />
          <Item>
            <ItemMedia variant="image">
              <Icon icon={ImageIcon} size={18} tint={ui().faint} />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Cover art</ItemTitle>
              <ItemDescription>1920 × 1080, ready to publish.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" variant="ghost">
                Replace
              </Button>
              <Button size="sm" variant="secondary">
                Use
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </DemoCard>

      <DemoCard padded={false} style={{ padding: 8 }}>
        <ItemGroup>
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Outline</ItemTitle>
              <Badge variant="outline">variant</Badge>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>A hairline edge, for a row that stands alone.</ItemDescription>
            </ItemContent>
            <ItemFooter>
              <ItemDescription>Updated 2 hours ago</ItemDescription>
              <Button size="sm" variant="ghost">
                Details
              </Button>
            </ItemFooter>
          </Item>
          <Item variant="muted">
            <ItemHeader>
              <ItemTitle>Muted</ItemTitle>
              <Badge variant="outline">variant</Badge>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>The well a section's content sits in.</ItemDescription>
            </ItemContent>
          </Item>
          <Item size="sm">
            <ItemContent>
              <ItemTitle>Small</ItemTitle>
              <ItemDescription>One line tighter: a title and a note.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge variant="outline">size</Badge>
            </ItemActions>
          </Item>
        </ItemGroup>
      </DemoCard>

      <DemoCard>
        <DemoSection title="A long list" axis="block">
          <Contacts />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};