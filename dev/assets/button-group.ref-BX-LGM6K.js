var e=`// The reference of \`button-group.tsx\`: the same page, the look spread on \`nsh\`'s own View and Text
// instead of worn by the parts. The render check requires the two to draw the same pixels.
import { ArrowLeft, ArrowRight } from "lucide";
import { mount, Text, View } from "nsh";

import { Button, buttonGlyph, buttonLabel } from "@/packages/ui/button";
import { buttonGroupLook } from "@/packages/ui/button-group";
import { Icon } from "@/packages/ui/lib/icons";
import { Separator } from "@/packages/ui/separator";

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
          <View role="group" style={[buttonGroupLook().root("horizontal")]}>
            <Button
              variant="outline"
              icon={ArrowLeft}
              style={[buttonGroupLook().item("horizontal", "first")]}
            >
              Back
            </Button>
            <Button variant="outline" style={[buttonGroupLook().item("horizontal", "middle")]}>
              Archive
            </Button>
            <Button variant="outline" style={[buttonGroupLook().item("horizontal", "last")]}>
              <Text style={buttonLabel("outline")}>Next</Text>
              <Icon icon={ArrowRight} {...buttonGlyph("outline")} />
            </Button>
          </View>
        </DemoSection>

        <DemoSection title="A column">
          <View role="group" style={[buttonGroupLook().root("vertical")]}>
            <Button variant="outline" style={[buttonGroupLook().item("vertical", "first")]}>
              Copy the path
            </Button>
            <Button variant="outline" style={[buttonGroupLook().item("vertical", "middle")]}>
              Open in a new window
            </Button>
            <Button variant="outline" style={[buttonGroupLook().item("vertical", "last")]}>
              Reveal in the file manager
            </Button>
          </View>
        </DemoSection>

        <DemoSection title="With a separator">
          <View role="group" style={[buttonGroupLook().root("horizontal")]}>
            <Button variant="secondary" style={[buttonGroupLook().item("horizontal", "first")]}>
              Cut
            </Button>
            <Separator orientation="vertical" style={buttonGroupLook().separator()} />
            <Button variant="secondary" style={[buttonGroupLook().item("horizontal", "middle")]}>
              Copy
            </Button>
            <Separator orientation="vertical" style={buttonGroupLook().separator()} />
            <Button variant="secondary" style={[buttonGroupLook().item("horizontal", "last")]}>
              Paste
            </Button>
          </View>
        </DemoSection>

        <DemoSection title="With a text addon">
          <View role="group" style={[buttonGroupLook().root("horizontal")]}>
            <View
              style={[buttonGroupLook().textFrame(), buttonGroupLook().item("horizontal", "first")]}
            >
              <Text style={[buttonGroupLook().text()]}>Path</Text>
            </View>
            <Button variant="outline" style={[buttonGroupLook().item("horizontal", "last")]}>
              Copy
            </Button>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};