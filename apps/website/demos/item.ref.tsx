import { colors, stroke } from "@shadcn-nsh/theme";
// The reference of `item.tsx`: the same page with the item family's look spread on plain views and
// texts (`itemLook`), each row drawn at the variant and size it names. The render check requires
// the two pages to draw the same pixels, so this is what proves the ten parts change nothing.
import { Bell, Image as ImageIcon } from "lucide";
import { List, mount, Text, View } from "nsh";

import { Avatar } from "@/packages/ui/avatar";
import { Badge } from "@/packages/ui/badge";
import { Button } from "@/packages/ui/button";
import { itemLook } from "@/packages/ui/item";
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
    <View style={itemLook().item("default", "default")}>
      <View style={itemLook().media("default")}>
        <Avatar name={props.contact.name} style={{ width: 36, height: 36 }} />
      </View>
      <View style={itemLook().content}>
        <Text style={itemLook().title}>{props.contact.name}</Text>
        <Text style={itemLook().description}>{props.contact.note}</Text>
      </View>
    </View>
  );
}

/** A long list: contacts as `ItemGroup` rows inside a `List`, with the letters' headings sticking. */
function Contacts() {
  return (
    <View style={{ height: 320, ...sectionSurface({ padded: false }), overflow: "hidden" }}>
      <View role="list" style={[itemLook().group, { flex: 1 }]}>
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
      </View>
    </View>
  );
}

function App() {
  return (
    <DemoPage title="Item">
      <DemoCard padded={false} style={{ padding: 8 }}>
        <View role="list" style={itemLook().group}>
          <View style={itemLook().item("default", "default")}>
            <View style={itemLook().media("icon")}>
              <Icon icon={Bell} size={18} tint={ui().muted} />
            </View>
            <View style={itemLook().content}>
              <Text style={itemLook().title}>New comment</Text>
              <Text style={itemLook().description}>Mira replied to your post in #design.</Text>
            </View>
            <View style={itemLook().actions}>
              <Button size="sm" variant="ghost">
                Open
              </Button>
            </View>
          </View>
          <View style={itemLook().separator} />
          <View style={itemLook().item("default", "default")}>
            <View style={itemLook().media("default")}>
              <Avatar name="Mira Lund" style={{ width: 36, height: 36 }} />
            </View>
            <View style={itemLook().content}>
              <Text style={itemLook().title}>Mira joined the team</Text>
              <Text style={itemLook().description}>Designer, shipping the settings screens.</Text>
            </View>
            <View style={itemLook().actions}>
              <Badge tone="success">New</Badge>
            </View>
          </View>
          <View style={itemLook().separator} />
          <View style={itemLook().item("default", "default")}>
            <View style={itemLook().media("image")}>
              <Icon icon={ImageIcon} size={18} tint={ui().faint} />
            </View>
            <View style={itemLook().content}>
              <Text style={itemLook().title}>Cover art</Text>
              <Text style={itemLook().description}>1920 × 1080, ready to publish.</Text>
            </View>
            <View style={itemLook().actions}>
              <Button size="sm" variant="ghost">
                Replace
              </Button>
              <Button size="sm" variant="secondary">
                Use
              </Button>
            </View>
          </View>
        </View>
      </DemoCard>

      <DemoCard padded={false} style={{ padding: 8 }}>
        <View role="list" style={itemLook().group}>
          <View style={itemLook().item("outline", "default")}>
            <View style={itemLook().full}>
              <Text style={itemLook().title}>Outline</Text>
              <Badge variant="outline">variant</Badge>
            </View>
            <View style={itemLook().content}>
              <Text style={itemLook().description}>
                A hairline edge, for a row that stands alone.
              </Text>
            </View>
            <View style={itemLook().full}>
              <Text style={itemLook().description}>Updated 2 hours ago</Text>
              <Button size="sm" variant="ghost">
                Details
              </Button>
            </View>
          </View>
          <View style={itemLook().item("muted", "default")}>
            <View style={itemLook().full}>
              <Text style={itemLook().title}>Muted</Text>
              <Badge variant="outline">variant</Badge>
            </View>
            <View style={itemLook().content}>
              <Text style={itemLook().description}>The well a section's content sits in.</Text>
            </View>
          </View>
          <View style={itemLook().item("default", "sm")}>
            <View style={itemLook().content}>
              <Text style={itemLook().title}>Small</Text>
              <Text style={itemLook().description}>One line tighter: a title and a note.</Text>
            </View>
            <View style={itemLook().actions}>
              <Badge variant="outline">size</Badge>
            </View>
          </View>
        </View>
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
