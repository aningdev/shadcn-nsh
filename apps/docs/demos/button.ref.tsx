// The reference of `button.tsx`: the same scene as upstream writes it, the looks spread on
// `nsh/base`'s Button, Switch and Toggle. The render check requires the two to draw the same
// pixels.
import { colors } from "@shadcn-nsh/theme";
import { ChevronDown, Play, Plus, Search, Star, Trash, type IconNode } from "lucide";
import { mount, signal, Text, View } from "nsh";
import { Button, Switch, Toggle } from "nsh/base";

import {
  type ButtonVariant,
  type ButtonLookOptions,
  buttonGlyph,
  buttonLabel,
  buttonLook,
  iconButtonGlyph,
  iconButtonLook,
  type IconButtonLookOptions,
  roundButtonGlyph,
  roundButtonLook,
  splitButtonLook,
} from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { switchLook } from "@/packages/ui/switch";
import { toggleLabel, toggleLook } from "@/packages/ui/toggle";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

/** A caption over a cluster of controls. */
function Caption(props: { children: string }) {
  return <Text style={{ fontSize: 12, color: colors.muted }}>{props.children}</Text>;
}

/** A button of a variant and a size, its label in `buttonLabel`. */
function Plain(props: {
  label: string;
  variant?: ButtonVariant;
  size?: "sm" | "default" | "lg";
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const variant = () => props.variant ?? "secondary";
  const options: ButtonLookOptions = {
    size: () => props.size,
    selected: () => props.selected,
    disabled: () => props.disabled,
  };
  return (
    <Button
      onPress={props.onPress}
      selected={props.selected}
      disabled={props.disabled}
      {...buttonLook(variant, options)}
    >
      <Text style={buttonLabel(variant, options)}>{props.label}</Text>
    </Button>
  );
}

/** An icon button of the library's icon button look. */
function IconPlain(props: {
  icon: IconNode;
  label: string;
  variant?: "ghost" | "secondary" | "destructive";
  selected?: boolean;
  onPress?: () => void;
}) {
  const options: IconButtonLookOptions = {
    selected: () => props.selected,
    variant: props.variant,
  };
  return (
    <Button
      accessibilityLabel={props.label}
      onPress={props.onPress}
      selected={props.selected}
      {...iconButtonLook(options)}
    >
      <Icon icon={props.icon} {...iconButtonGlyph(options)} />
    </Button>
  );
}

function App() {
  const presses = signal(0);
  const pressing = signal(false);
  const disabled = signal(false);
  const bold = signal(true);
  const italic = signal(false);
  const starred = signal(false);
  const pinned = signal(true);
  const last = signal("—");
  const events = signal<string[]>([]);
  const log = (line: string) => events.set([line, ...events()].slice(0, 3));
  const press = (what: string) => {
    presses.update((n) => n + 1);
    last.set(what);
    log(what);
  };
  const label = () => ({
    color: colors.text,
    fontSize: desktop ? 13 : 15,
    fontWeight: "600" as const,
  });
  const pressState = () =>
    `${pressing() ? "onPressDown: pressing…" : "onPressUp: released"} · disabled ${String(disabled())}`;

  /** An on / off formatting toggle in the toggles' outline look, its glyph styled by the page. */
  const toggle = (
    name: string,
    on: () => boolean,
    set: (on: boolean) => void,
    mark: object,
    glyph: string,
  ) => (
    <Toggle
      pressed={on()}
      onChange={({ pressed }) => {
        set(pressed);
        log(`${name}: ${pressed}`);
      }}
      accessibilityLabel={name}
      {...toggleLook({ variant: "outline" })}
    >
      <Text style={{ ...toggleLabel(on), ...mark }}>{glyph}</Text>
    </Toggle>
  );

  const primarySplit = splitButtonLook("default");
  const secondarySplit = splitButtonLook("secondary");

  return (
    <DemoPage title="Button">
      <Text style={{ color: colors.muted }}>
        {desktop
          ? "Click, hover, or Tab to a button and press Space"
          : "Tap; move your finger away to cancel"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="press · disabled">
              <Text style={{ fontSize: 13, color: colors.text }}>{pressState()}</Text>
            </Panel>
            <Panel title="Toggle pressed">
              <Text style={{ fontSize: 13, color: colors.text }}>
                bold {String(bold())} · italic {String(italic())}
              </Text>
            </Panel>
            <Panel title="last onPress">
              <Text style={{ fontSize: 13, color: colors.accent }}>{last()}</Text>
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
                onPress={() => press(`counter ${presses() + 1}`)}
                onPressDown={() => pressing.set(true)}
                onPressUp={() => pressing.set(false)}
                disabled={disabled()}
                {...buttonLook("default", { disabled: () => disabled() })}
              >
                <Text style={buttonLabel("default", { disabled: () => disabled() })}>
                  {`Pressed ${presses()}×`}
                </Text>
              </Button>
              <Switch
                checked={disabled()}
                onChange={({ checked }) => disabled.set(checked)}
                class="flex-row items-center gap-2 active:opacity-70"
                {...switchLook(() => disabled())}
              >
                <Text style={label()}>{disabled() ? "Enable it" : "Disable it"}</Text>
              </Switch>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Caption>on / off: Toggle</Caption>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {toggle("Bold", bold, (on) => bold.set(on), { fontWeight: "800" }, "B")}
              {toggle("Italic", italic, (on) => italic.set(on), { fontStyle: "italic" }, "I")}
            </View>
          </View>
        </View>
      </Split>

      <DemoCard>
        <DemoSection title="Kinds">
          <Plain label="Primary" variant="default" onPress={() => press("primary")} />
          <Plain label="Accent" variant="default" onPress={() => press("accent")} />
          <Plain label="Secondary" onPress={() => press("secondary")} />
          <Plain label="Ghost" variant="ghost" onPress={() => press("ghost")} />
          <Plain label="Delete" variant="destructive" onPress={() => press("delete")} />
        </DemoSection>
        <DemoSection title="Sizes">
          <Plain label="Small" size="sm" onPress={() => press("small")} />
          <Plain label="Regular" size="default" onPress={() => press("regular")} />
          <Plain label="Large" size="lg" onPress={() => press("large")} />
        </DemoSection>
        <DemoSection title="States">
          <Plain
            label="Pinned"
            selected={pinned()}
            onPress={() => {
              pinned.set(!pinned());
              press("pinned");
            }}
          />
          <Plain label="Disabled" variant="default" disabled />
          <Plain label="Disabled" disabled />
        </DemoSection>
        <DemoSection title="Icon">
          <IconPlain icon={Search} label="Search" onPress={() => press("search")} />
          <IconPlain
            icon={Star}
            label="Star"
            variant="secondary"
            selected={starred()}
            onPress={() => {
              starred.set(!starred());
              press("star");
            }}
          />
          <IconPlain
            icon={Trash}
            label="Delete"
            variant="destructive"
            onPress={() => press("delete")}
          />
          <Button
            accessibilityLabel="Play"
            onPress={() => press("play")}
            {...roundButtonLook("default")}
          >
            <Icon icon={Play} fill {...roundButtonGlyph("default")} />
          </Button>
          <Button
            accessibilityLabel="Plus"
            onPress={() => press("plus")}
            {...roundButtonLook("secondary")}
          >
            <Icon icon={Plus} {...roundButtonGlyph("secondary")} />
          </Button>
        </DemoSection>
        <DemoSection title="Split">
          <View style={primarySplit.frame.style}>
            <Button onPress={() => press("save")} {...primarySplit.segment()}>
              <Text style={buttonLabel("default")}>Save</Text>
            </Button>
            <View style={primarySplit.divider} />
            <Button
              accessibilityLabel="More save options"
              selected={starred()}
              onPress={() => {
                starred.set(!starred());
                press("save options");
              }}
              {...primarySplit.segment({ selected: () => starred() })}
            >
              <Icon icon={ChevronDown} {...buttonGlyph("default")} />
            </Button>
          </View>
          <View style={secondarySplit.frame.style}>
            <Button onPress={() => press("export")} {...secondarySplit.segment()}>
              <Text style={buttonLabel("secondary")}>Export</Text>
            </Button>
            <View style={secondarySplit.divider} />
            <Button
              accessibilityLabel="More export options"
              onPress={() => press("export options")}
              {...secondarySplit.segment()}
            >
              <Icon icon={ChevronDown} {...buttonGlyph("secondary")} />
            </Button>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
