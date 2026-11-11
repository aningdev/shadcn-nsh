import { mount, signal } from "nsh";

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
} from "../ui/button";
import { Icon } from "../ui/lib/icons";
import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const presses = signal(0);
  const pinned = signal(true);
  const starred = signal(false);
  const menuOpen = signal(false);
  const saving = signal(false);
  const press = () => presses.update((n) => n + 1);
  const save = () => {
    saving.set(true);
    setTimeout(() => saving.set(false), 1200);
  };

  return (
    <DemoPage title="Button" note={() => `Pressed ${presses()}× · pinned ${String(pinned())}`}>
      <DemoCard>
        <DemoSection title="Kinds">
          <Button variant="primary" onPress={press}>
            Primary
          </Button>
          <Button variant="secondary" onPress={press}>
            Secondary
          </Button>
          <Button variant="ghost" onPress={press}>
            Ghost
          </Button>
          <Button variant="danger" onPress={press}>
            Delete
          </Button>
        </DemoSection>
        <DemoSection title="Sizes">
          <Button variant="secondary" size="small" onPress={press}>
            Small
          </Button>
          <Button variant="secondary" onPress={press}>
            Regular
          </Button>
          <Button variant="secondary" size="large" onPress={press}>
            Large
          </Button>
        </DemoSection>
        <DemoSection title="States">
          <Button variant="secondary" selected={pinned()} onPress={() => pinned.set(!pinned())}>
            Pinned
          </Button>
          <Button variant="primary" busy={saving()} onPress={save}>
            Save
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </DemoSection>
        <DemoSection title="Icon">
          <IconButton accessibilityLabel="Search" onPress={press} on={starred()}>
            <Icon name="search" {...iconButtonGlyph({ on: () => starred() })} />
          </IconButton>
          <IconButton
            accessibilityLabel="Star"
            variant="secondary"
            on={starred()}
            onPress={() => starred.set(!starred())}
          >
            <Icon name="star" {...iconButtonGlyph({ variant: "secondary", on: () => starred() })} />
          </IconButton>
          <IconButton accessibilityLabel="Delete" tone="danger" onPress={press}>
            <Icon name="trash" {...iconButtonGlyph({ tone: "danger" })} />
          </IconButton>
          <RoundButton accessibilityLabel="Play" onPress={press}>
            <Icon name="play" {...roundButtonGlyph("primary")} />
          </RoundButton>
          <RoundButton accessibilityLabel="Plus" variant="secondary" onPress={press}>
            <Icon name="plus" {...roundButtonGlyph("secondary")} />
          </RoundButton>
        </DemoSection>
        <DemoSection title="Split">
          <SplitButton variant="primary">
            <SplitButtonSegment onPress={press}>Save</SplitButtonSegment>
            <SplitButtonDivider />
            <SplitButtonSegment
              accessibilityLabel="More save options"
              selected={menuOpen()}
              onPress={() => menuOpen.set(!menuOpen())}
            >
              <Icon name="chevron-down" {...buttonGlyph("primary")} />
            </SplitButtonSegment>
          </SplitButton>
          <SplitButton variant="secondary">
            <SplitButtonSegment onPress={press}>Export</SplitButtonSegment>
            <SplitButtonDivider />
            <SplitButtonSegment accessibilityLabel="More export options" onPress={press}>
              <Icon name="chevron-down" {...buttonGlyph("secondary")} />
            </SplitButtonSegment>
          </SplitButton>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
