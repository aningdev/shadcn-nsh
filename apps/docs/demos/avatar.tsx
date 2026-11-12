import { mount } from "nsh";

import { AVATAR_BROKEN, Avatar, MAINTAINERS } from "@/packages/ui/avatar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const side = 36;
  return (
    <DemoPage title="Avatar">
      <DemoCard>
        <DemoSection title="Identity">
          {MAINTAINERS.map((person) => (
            <Avatar name={person.name} style={{ width: side, height: side }} />
          ))}
          <Avatar name="Alan Turing" style={{ width: side, height: side }} />
        </DemoSection>
        <DemoSection title="Fallback">
          <Avatar name="Broken" src={AVATAR_BROKEN} style={{ width: side, height: side }} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
