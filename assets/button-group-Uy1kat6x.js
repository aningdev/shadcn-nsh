var e=`// shadcn's button-group scenes with this library's parts: a row of outline buttons joined into
// one control, a column of them, a row of filled buttons divided by separators, a text addon,
// and a split button (a main action, a hairline, and the menu or icon button).
import { ArrowLeft, ArrowRight, ChevronDown, Plus } from "lucide";
import { mount, Text } from "nsh";

import { Button, buttonGlyph, buttonLabel } from "@/packages/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupItem,
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
            <Button variant="outline" icon={ArrowLeft} style={buttonGroupItem("first")}>
              Back
            </Button>
            <Button variant="outline" style={buttonGroupItem("middle")}>
              Archive
            </Button>
            <Button variant="outline" style={buttonGroupItem("last")}>
              <Text style={buttonLabel("outline")}>Next</Text>
              <Icon icon={ArrowRight} {...buttonGlyph("outline")} />
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="A column">
          <ButtonGroup orientation="vertical">
            <Button variant="outline" style={buttonGroupItem("first")}>
              Copy the path
            </Button>
            <Button variant="outline" style={buttonGroupItem("middle")}>
              Open in a new window
            </Button>
            <Button variant="outline" style={buttonGroupItem("last")}>
              Reveal in the file manager
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="With a separator">
          <ButtonGroup>
            <Button variant="secondary" style={buttonGroupItem("first")}>
              Cut
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary" style={buttonGroupItem("middle")}>
              Copy
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary" style={buttonGroupItem("last")}>
              Paste
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="With a text addon">
          <ButtonGroup>
            <ButtonGroupText style={buttonGroupItem("first")}>Path</ButtonGroupText>
            <Button variant="outline" style={buttonGroupItem("last")}>
              Copy
            </Button>
          </ButtonGroup>
        </DemoSection>

        <DemoSection title="Split button">
          <ButtonGroup>
            <Button variant="default" style={buttonGroupItem("first")}>
              Save
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="default"
              accessibilityLabel="More save options"
              style={buttonGroupItem("last")}
            >
              <Icon icon={ChevronDown} {...buttonGlyph("default")} />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="secondary" style={buttonGroupItem("first")}>
              Export
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="secondary"
              accessibilityLabel="More export options"
              style={buttonGroupItem("last")}
            >
              <Icon icon={Plus} {...buttonGlyph("secondary")} />
            </Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" style={buttonGroupItem("first")}>
              Follow
            </Button>
            <Button
              variant="outline"
              accessibilityLabel="More follow options"
              style={buttonGroupItem("last")}
            >
              <Icon icon={ChevronDown} {...buttonGlyph("outline")} />
            </Button>
          </ButtonGroup>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};