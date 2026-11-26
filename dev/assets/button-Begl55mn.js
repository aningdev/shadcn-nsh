var e=`// The official button scene (\`references/nsh/website/demos/el-button.tsx\`) with this library's
// parts: a counter that reports each press (down, up, press), a switch that disables it, two
// formatting toggles, and an inspector with what the page heard; a second card lists the kinds,
// the sizes and the icon buttons.
import { ChevronDown, Play, Plus, Save, Search, Star, Trash } from "lucide";
import { mount, signal, Text, View } from "nsh";

import {
  Button,
  buttonGlyph,
  IconButton,
  iconButtonGlyph,
  RoundButton,
  roundButtonGlyph,
  SplitButton,
  SplitButtonDivider,
  SplitButtonSegment,
} from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { Switch } from "@/packages/ui/switch";
import { toggleLabel } from "@/packages/ui/toggle";
import { Toggle } from "@/packages/ui/toggle";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split, ui } from "./stage";

/** A caption over a cluster of controls. */
function Caption(props: { children: string }) {
  return <Text style={{ fontSize: 12, color: ui().muted }}>{props.children}</Text>;
}

function App() {
  const presses = signal(0);
  const pressing = signal(false);
  const disabled = signal(false);
  const bold = signal(true);
  const italic = signal(false);
  const starred = signal(false);
  const pinned = signal(true);
  const saving = signal(false);
  const last = signal("—");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const press = (what: string) => {
    presses.update((n) => n + 1);
    last.set(what);
    log(what);
  };
  const label = () => ({
    color: ui().text,
    fontSize: desktop ? 13 : 15,
    fontWeight: "600" as const,
  });
  const pressState = () =>
    \`\${pressing() ? "onPressDown: pressing…" : "onPressUp: released"} · disabled \${String(disabled())}\`;

  return (
    <DemoPage title="Button">
      <Text style={{ color: ui().muted }}>
        {desktop
          ? "Click, hover, or Tab to a button and press Space"
          : "Tap; move your finger away to cancel"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="press · disabled">
              <Text style={{ fontSize: 13, color: ui().text }}>{pressState()}</Text>
            </Panel>
            <Panel title="Toggle pressed">
              <Text style={{ fontSize: 13, color: ui().text }}>
                bold {String(bold())} · italic {String(italic())}
              </Text>
            </Panel>
            <Panel title="last onPress">
              <Text style={{ fontSize: 13, color: ui().accent }}>{last()}</Text>
            </Panel>
            <Log title="onChange({ pressed })" lines={events()} minHeight={62} />
          </>
        }
      >
        <View style={{ gap: 24 }}>
          <View style={{ gap: 8 }}>
            <Caption>onPress, onPressDown, onPressUp</Caption>
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
              <Button
                variant="default"
                disabled={disabled()}
                onPress={() => press(\`counter \${presses() + 1}\`)}
                onPressDown={() => pressing.set(true)}
                onPressUp={() => pressing.set(false)}
              >
                {\`Pressed \${presses()}×\`}
              </Button>
              <Switch
                checked={disabled()}
                onChange={({ checked }) => disabled.set(checked)}
                class="flex-row items-center gap-2 active:opacity-70"
              >
                <Text style={label()}>{disabled() ? "Enable it" : "Disable it"}</Text>
              </Switch>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Caption>on / off: Toggle</Caption>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* On / off formatting is a \`Toggle\` (a button is an action), in the toggles'
                  look: on a field's edge while off, the on fill while on. */}
              <Toggle
                variant="outline"
                pressed={bold()}
                onChange={({ pressed }) => {
                  bold.set(pressed);
                  log(\`Bold: \${pressed}\`);
                }}
                accessibilityLabel="Bold"
              >
                <Text style={{ ...toggleLabel(bold), fontWeight: "800" }}>B</Text>
              </Toggle>
              <Toggle
                variant="outline"
                pressed={italic()}
                onChange={({ pressed }) => {
                  italic.set(pressed);
                  log(\`Italic: \${pressed}\`);
                }}
                accessibilityLabel="Italic"
              >
                <Text style={{ ...toggleLabel(italic), fontStyle: "italic" }}>I</Text>
              </Toggle>
            </View>
          </View>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Kinds">
          <Button variant="default" onPress={() => press("primary")}>
            Primary
          </Button>
          <Button variant="default" onPress={() => press("accent")}>
            Accent
          </Button>
          <Button variant="secondary" onPress={() => press("secondary")}>
            Secondary
          </Button>
          <Button variant="outline" onPress={() => press("outline")}>
            Outline
          </Button>
          <Button variant="ghost" onPress={() => press("ghost")}>
            Ghost
          </Button>
          <Button variant="destructive" onPress={() => press("delete")}>
            Delete
          </Button>
        </DemoSection>
        <DemoSection title="Sizes">
          <Button variant="secondary" size="sm" onPress={() => press("small")}>
            Small
          </Button>
          <Button variant="secondary" size="default" onPress={() => press("regular")}>
            Regular
          </Button>
          <Button variant="secondary" size="lg" onPress={() => press("large")}>
            Large
          </Button>
        </DemoSection>
        {/* \`icon\` is the glyph before the label, drawn in the button's size and tint; \`busy\` puts the
            spinner in its place and takes no second press. */}
        <DemoSection title="With an icon">
          <Button variant="secondary" icon={Plus} onPress={() => press("add")}>
            Add
          </Button>
          <Button
            icon={Save}
            busy={saving()}
            onPress={() => {
              saving.set(true);
              press("save");
              setTimeout(() => saving.set(false), 1200);
            }}
          >
            {saving() ? "Saving…" : "Save"}
          </Button>
          <Button variant="destructive" icon={Trash} onPress={() => press("delete")}>
            Delete
          </Button>
        </DemoSection>
        {/* The icon button's own scale: 20, 24, 28 and 32 points across. */}
        <DemoSection title="Icon sizes">
          <IconButton
            accessibilityLabel="Search, smallest"
            size="xs"
            onPress={() => press("xs")}
            icon={Search}
          />
          <IconButton
            accessibilityLabel="Search, small"
            size="sm"
            onPress={() => press("sm")}
            icon={Search}
          />
          <IconButton
            accessibilityLabel="Search"
            size="default"
            onPress={() => press("search")}
            icon={Search}
          />
          <IconButton
            accessibilityLabel="Search, large"
            size="lg"
            onPress={() => press("lg")}
            icon={Search}
          />
        </DemoSection>
        <DemoSection title="States">
          <Button
            variant="secondary"
            selected={pinned()}
            onPress={() => {
              pinned.set(!pinned());
              press("pinned");
            }}
          >
            Pinned
          </Button>
          <Button variant="default" disabled>
            Disabled
          </Button>
        </DemoSection>
        <DemoSection title="Icon">
          <IconButton accessibilityLabel="Search" onPress={() => press("search")} icon={Search} />
          <IconButton
            accessibilityLabel="Star"
            variant="secondary"
            selected={starred()}
            onPress={() => {
              starred.set(!starred());
              press("star");
            }}
            icon={Star}
          />
          <IconButton
            accessibilityLabel="Delete"
            variant="destructive"
            onPress={() => press("delete")}
            icon={Trash}
          />
          <RoundButton accessibilityLabel="Play" onPress={() => press("play")}>
            <Icon icon={Play} fill {...roundButtonGlyph("default")} />
          </RoundButton>
          <RoundButton accessibilityLabel="Plus" variant="secondary" onPress={() => press("plus")}>
            <Icon icon={Plus} {...roundButtonGlyph("secondary")} />
          </RoundButton>
        </DemoSection>
        <DemoSection title="Split">
          <SplitButton variant="default">
            <SplitButtonSegment onPress={() => press("save")}>Save</SplitButtonSegment>
            <SplitButtonDivider />
            <SplitButtonSegment
              accessibilityLabel="More save options"
              selected={starred()}
              onPress={() => {
                starred.set(!starred());
                press("save options");
              }}
            >
              <Icon icon={ChevronDown} {...buttonGlyph("default")} />
            </SplitButtonSegment>
          </SplitButton>
          <SplitButton variant="secondary">
            <SplitButtonSegment onPress={() => press("export")}>Export</SplitButtonSegment>
            <SplitButtonDivider />
            <SplitButtonSegment
              accessibilityLabel="More export options"
              onPress={() => press("export options")}
            >
              <Icon icon={ChevronDown} {...buttonGlyph("secondary")} />
            </SplitButtonSegment>
          </SplitButton>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
`;export{e as default};