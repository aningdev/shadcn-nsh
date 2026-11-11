import { mount, signal } from "nsh";

import { Button } from "../ui/button";
import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const presses = signal(0);
  const pinned = signal(true);
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
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
