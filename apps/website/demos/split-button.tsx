// A split button: one silhouette, a main action and the menu of its variants.
import { ChevronDown } from "lucide";
import { mount, signal } from "nsh";

import { buttonGlyph, type ButtonSize, type ButtonVariant } from "@/packages/ui/button";
import { Icon } from "@/packages/ui/lib/icons";
import { SplitButton, SplitButtonDivider, SplitButtonSegment } from "@/packages/ui/split-button";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Pair(props: {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  selected?: boolean;
  onPress?: () => void;
}) {
  const variant = props.variant ?? "default";
  const options = { size: props.size, disabled: props.disabled };
  return (
    <SplitButton variant={variant} size={props.size} disabled={props.disabled}>
      <SplitButtonSegment disabled={props.disabled} onPress={props.onPress}>
        {props.label}
      </SplitButtonSegment>
      <SplitButtonDivider />
      <SplitButtonSegment
        accessibilityLabel={`More ${props.label} options`}
        disabled={props.disabled}
        selected={props.selected}
        onPress={props.onPress}
      >
        <Icon icon={ChevronDown} {...buttonGlyph(variant, options)} />
      </SplitButtonSegment>
    </SplitButton>
  );
}

function App() {
  const menu = signal(false);
  const press = () => menu.set(!menu());
  return (
    <DemoPage title="Split Button">
      <DemoCard>
        <DemoSection title="Variant">
          <Pair label="Save" variant="default" onPress={press} />
          <Pair label="Export" variant="secondary" onPress={press} />
          <Pair label="Outline" variant="outline" onPress={press} />
          <Pair label="Quiet" variant="ghost" onPress={press} />
          <Pair label="Delete" variant="destructive" onPress={press} />
        </DemoSection>
        <DemoSection title="Size">
          <Pair label="Small" size="sm" onPress={press} />
          <Pair label="Default" size="default" onPress={press} />
          <Pair label="Large" size="lg" onPress={press} />
        </DemoSection>
        <DemoSection title="Disabled">
          <Pair label="Save" disabled onPress={press} />
        </DemoSection>
        <DemoSection title="Selected">
          <Pair label="Save" selected={menu()} onPress={press} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
