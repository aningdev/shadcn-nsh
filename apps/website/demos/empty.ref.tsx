// The reference of `empty.tsx`. `emptyLook` is private to the component, so this
// page draws the component itself. The two pages match because they are the same composition.
// shadcn's empty scenes with this library's parts: the empty state of a search, the `icon` variant
// over a list that has nothing in it, and a state that is the app's own art and nothing else.
import { Inbox, Plus, Search } from "lucide";
import { mount, Text, View } from "nsh";

import { Button, buttonLabel } from "@/packages/ui/button";
import {
  EMPTY_ICON,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/packages/ui/empty";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

function App() {
  return (
    <DemoPage title="Empty">
      <Text style={{ color: ui().muted }}>
        {"A centered block that says there is nothing here yet, and what to do about it."}
      </Text>

      <DemoCard>
        <DemoSection title="Icon media" axis="block">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon={Inbox} size={EMPTY_ICON} tint={ui().text} />
              </EmptyMedia>
              <EmptyTitle>No messages yet</EmptyTitle>
              <EmptyDescription>
                Messages you receive will show up here. Start a conversation to see one.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button>
                <Icon icon={Plus} size={16} tint={ui().onPrimary} />
                <Text style={buttonLabel("default")}>New message</Text>
              </Button>
            </EmptyContent>
          </Empty>
        </DemoSection>

        <DemoSection title="Default media" axis="block">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="default">
                <Icon icon={Search} size={32} tint={ui().faint} />
              </EmptyMedia>
              <EmptyTitle>Nothing matched that search</EmptyTitle>
              <EmptyDescription>
                Every field is required unless it is marked optional.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Button variant="secondary">
                  <Text style={buttonLabel("secondary")}>Clear filters</Text>
                </Button>
                <Button variant="ghost">
                  <Text style={buttonLabel("ghost")}>Save this search</Text>
                </Button>
              </View>
            </EmptyContent>
          </Empty>
        </DemoSection>

        <DemoSection title="The block itself" axis="block">
          <Empty>
            <EmptyDescription>
              An empty state with nothing in it but a line: the block centers whatever it is given.
            </EmptyDescription>
          </Empty>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
