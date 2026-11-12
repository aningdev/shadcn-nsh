import { Text, View, mount } from "nsh";

// Alert dialog, hover card, toolbar — open chrome in the first screen, nothing floating over it.
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Link,
  Toggle,
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  dialogCard,
  dialogText,
  dialogTitle,
  popoverLook,
} from "../../packages/ui";
import { Page, Panel, Row } from "./demo-kit";

const box = { width: 220, flexShrink: 0, margin: 0, maxWidth: 220 };

mount(() => (
  <Page>
    <Panel title="Surfaces">
      <Row label="alert">
        <View style={[dialogCard(220), box]}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button size="small" variant="secondary">
              Cancel
            </Button>
            <Button size="small" variant="danger">
              Delete
            </Button>
          </AlertDialogFooter>
        </View>
      </Row>
      <Row label="hover">
        <View style={[popoverLook(), box]}>
          <Text style={dialogTitle()}>Ada Lovelace</Text>
          <Text style={dialogText()}>First programmer.</Text>
        </View>
      </Row>
      <Row label="tools">
        <Toolbar accessibilityLabel="Formatting" style={{ alignSelf: "flex-start", flexShrink: 0 }}>
          <ToolbarGroup accessibilityLabel="Marks">
            <Button variant="ghost" size="small" accessibilityLabel="Bold">
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
          <Button variant="ghost" size="small" disabled accessibilityLabel="Off">
            Off
          </Button>
        </Toolbar>
      </Row>
    </Panel>
  </Page>
));
