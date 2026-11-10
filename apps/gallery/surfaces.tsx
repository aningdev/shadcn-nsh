// Alert dialog, hover card, toolbar — open chrome in the first screen, nothing floating over it.
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  alertDialogCardStyle,
  Button,
  HoverCardDescription,
  HoverCardTitle,
  hoverCardSurface,
  Link,
  Toggle,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@shadcn-nsh/ui";
import { View, mount } from "nsh";

import { Page, Panel, Row } from "./demo-kit";

/** Fixed card width: the row's label takes 84, and a 390-wide page leaves about 224. */
const box = { width: 220, flexShrink: 0, margin: 0, maxWidth: 220 };

mount(() => (
  <Page>
    <Panel title="Surfaces">
      <Row label="alert">
        <View style={[alertDialogCardStyle(), box]}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </AlertDialogFooter>
        </View>
      </Row>
      <Row label="hover">
        <View style={[hoverCardSurface(), box]}>
          <HoverCardTitle>Ada Lovelace</HoverCardTitle>
          <HoverCardDescription>First programmer.</HoverCardDescription>
        </View>
      </Row>
      <Row label="tools">
        <Toolbar accessibilityLabel="Formatting" style={{ alignSelf: "flex-start", flexShrink: 0 }}>
          <ToolbarGroup accessibilityLabel="Marks">
            <Button variant="ghost" size="sm" accessibilityLabel="Bold">
              Bold
            </Button>
            <Toggle pressed accessibilityLabel="Italic">
              Italic
            </Toggle>
          </ToolbarGroup>
          <ToolbarSeparator />
          <Link href="https://nsh.dev" openWith="app">
            Site
          </Link>
          <Button variant="ghost" size="sm" disabled accessibilityLabel="Off">
            Off
          </Button>
        </Toolbar>
      </Row>
    </Panel>
  </Page>
));
