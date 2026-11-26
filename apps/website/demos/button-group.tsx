// shadcn's button-group scenes with this library's parts: a row of outline buttons joined into
// one control, a column of them, a row of filled buttons divided by separators, and a text addon.
import { ArrowLeft, ArrowRight } from "lucide";
import { mount, Text } from "nsh";

import { Button, buttonGlyph, buttonLabel } from "@/packages/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupLook,
} from "@/packages/ui/button-group";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { ui } from "./stage";

function App() {
  return (
    <DemoPage title="Button group">
      <Text style={{ color: ui().muted }}>
        {"Buttons joined into one control, in a row or a column."}
      </Text>

      <DemoCard>
        <DemoSection title="A row">
          <ButtonGroup>
            <Button
              variant="outline"
              icon={ArrowLeft}
              style={buttonGroupLook().item("horizontal", "first")}
            >
              Back
            </Button>
            <Button variant="outline" style={buttonGroupLook().item("horizontal", "middle")}>
              Archive
            </Button>
            <Button variant="outline" style={buttonGroupLook().item("horizontal", "last")}>
              <Text style={buttonLabel("outline")}>Next</Text>
              <Icon icon={ArrowRight} {...buttonGlyph("outline")} />
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="A column">
          <ButtonGroup orientation="vertical">
            <Button variant="outline" style={buttonGroupLook().item("vertical", "first")}>
              Copy the path
            </Button>
            <Button variant="outline" style={buttonGroupLook().item("vertical", "middle")}>
              Open in a new window
            </Button>
            <Button variant="outline" style={buttonGroupLook().item("vertical", "last")}>
              Reveal in the file manager
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="With a separator">
          <ButtonGroup>
            <Button variant="secondary" style={buttonGroupLook().item("horizontal", "first")}>
              Cut
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary" style={buttonGroupLook().item("horizontal", "middle")}>
              Copy
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary" style={buttonGroupLook().item("horizontal", "last")}>
              Paste
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="With a text addon">
          <ButtonGroup>
            <ButtonGroupText style={buttonGroupLook().item("horizontal", "first")}>
              Path
            </ButtonGroupText>
            <Button variant="outline" style={buttonGroupLook().item("horizontal", "last")}>
              Copy
            </Button>
          </ButtonGroup>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
