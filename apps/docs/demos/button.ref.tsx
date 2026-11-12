// The reference of `button.tsx`: the same page as upstream writes a button, the look spread
// on `nsh/base`'s Button. The render check requires the two to draw the same pixels.
import { mount, signal, Text, View } from "nsh";
import { Button } from "nsh/base";

import {
  type ButtonKind,
  buttonGlyph,
  buttonLabel,
  buttonLook,
  type ButtonLookOptions,
  type ButtonSize,
  iconButtonGlyph,
  iconButtonLook,
  type IconButtonLookOptions,
  roundButtonGlyph,
  roundButtonLook,
  splitButtonLook,
} from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Plain(props: {
  label: string;
  kind?: ButtonKind;
  size?: ButtonSize;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const kind = () => props.kind ?? "secondary";
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
      {...buttonLook(kind, options)}
    >
      <Text style={buttonLabel(kind, options)}>{props.label}</Text>
    </Button>
  );
}

function IconPlain(props: {
  name: "search" | "star" | "trash";
  label: string;
  variant?: "ghost" | "secondary";
  tone?: "danger";
  on?: boolean;
  onPress?: () => void;
}) {
  const options: IconButtonLookOptions = {
    on: () => props.on,
    tone: props.tone,
    variant: props.variant,
  };
  return (
    <Button
      accessibilityLabel={props.label}
      onPress={props.onPress}
      selected={props.on}
      {...iconButtonLook(options)}
    >
      <Icon name={props.name} {...iconButtonGlyph(options)} />
    </Button>
  );
}

function App() {
  const presses = signal(0);
  const pinned = signal(true);
  const starred = signal(false);
  const menuOpen = signal(false);
  const press = () => presses.update((n) => n + 1);

  const primarySplit = splitButtonLook("primary");
  const secondarySplit = splitButtonLook("secondary");

  return (
    <DemoPage title="Button" note={() => `Pressed ${presses()}× · pinned ${String(pinned())}`}>
      <DemoCard>
        <DemoSection title="Kinds">
          <Plain label="Primary" kind="primary" onPress={press} />
          <Plain label="Secondary" onPress={press} />
          <Plain label="Ghost" kind="ghost" onPress={press} />
          <Plain label="Delete" kind="danger" onPress={press} />
        </DemoSection>
        <DemoSection title="Sizes">
          <Plain label="Small" size="small" onPress={press} />
          <Plain label="Regular" onPress={press} />
          <Plain label="Large" size="large" onPress={press} />
        </DemoSection>
        <DemoSection title="States">
          <Plain label="Pinned" selected={pinned()} onPress={() => pinned.set(!pinned())} />
          <Plain label="Save" kind="primary" onPress={press} />
          <Plain label="Disabled" kind="primary" disabled />
          <Plain label="Disabled" disabled />
        </DemoSection>
        <DemoSection title="Icon">
          <IconPlain name="search" label="Search" on={starred()} onPress={press} />
          <IconPlain
            name="star"
            label="Star"
            variant="secondary"
            on={starred()}
            onPress={() => starred.set(!starred())}
          />
          <IconPlain name="trash" label="Delete" tone="danger" onPress={press} />
          <Button accessibilityLabel="Play" onPress={press} {...roundButtonLook("primary")}>
            <Icon name="play" {...roundButtonGlyph("primary")} />
          </Button>
          <Button accessibilityLabel="Plus" onPress={press} {...roundButtonLook("secondary")}>
            <Icon name="plus" {...roundButtonGlyph("secondary")} />
          </Button>
        </DemoSection>
        <DemoSection title="Split">
          <View style={primarySplit.frame.style}>
            <Button onPress={press} {...primarySplit.segment()}>
              <Text style={buttonLabel("primary")}>Save</Text>
            </Button>
            <View style={primarySplit.divider} />
            <Button
              accessibilityLabel="More save options"
              selected={menuOpen()}
              onPress={() => menuOpen.set(!menuOpen())}
              {...primarySplit.segment({ selected: () => menuOpen() })}
            >
              <Icon name="chevron-down" {...buttonGlyph("primary")} />
            </Button>
          </View>
          <View style={secondarySplit.frame.style}>
            <Button onPress={press} {...secondarySplit.segment()}>
              <Text style={buttonLabel("secondary")}>Export</Text>
            </Button>
            <View style={secondarySplit.divider} />
            <Button
              accessibilityLabel="More export options"
              onPress={press}
              {...secondarySplit.segment()}
            >
              <Icon name="chevron-down" {...buttonGlyph("secondary")} />
            </Button>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
