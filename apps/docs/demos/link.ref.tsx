// The reference of `link.tsx`: linkLook + LinkText on `nsh/base`'s Link.
import { mount } from "nsh";
import { Link } from "nsh/base";

import { LinkText, linkColor, linkLook } from "@/packages/ui/link";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Item(props: {
  href: string;
  label: string;
  quiet?: boolean;
  current?: boolean;
  icon?: boolean;
}) {
  const look = linkLook();

  return (
    <Link href={props.href} class={look.class} focusVisibleStyle={look.focusVisibleStyle}>
      <LinkText
        label={props.label}
        color={linkColor({ quiet: props.quiet, current: props.current })}
        quiet={props.quiet}
        current={props.current}
        icon={props.icon}
      />
    </Link>
  );
}

function App() {
  return (
    <DemoPage title="Link">
      <DemoCard>
        <DemoSection title="Default">
          <Item href="https://nsh.dev" label="Native Shell" />
          <Item href="#docs" label="Documentation" quiet />
          <Item href="#here" label="Current page" current />
          <Item href="https://example.com" label="External" icon />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
