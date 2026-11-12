// The reference of `avatar.tsx`: identity helpers on `nsh/base`'s Avatar.
import { mount } from "nsh";
import { Avatar } from "nsh/base";

import { AVATAR_BROKEN, avatarIdentity, MAINTAINERS } from "@/packages/ui/avatar";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function Person(props: { name: string; src?: string; side: number }) {
  // Read in the JSX, so the identity colors follow the appearance.
  const id = () => avatarIdentity(props.name);
  return (
    <Avatar
      name={props.name}
      src={props.src}
      style={{ width: props.side, height: props.side }}
      imageClass="rounded-full overflow-hidden"
      fallbackClass={`rounded-full overflow-hidden items-center justify-center font-semibold text-[${id().foreground}]`}
      fallbackStyle={{
        backgroundColor: id().background,
        borderWidth: 1,
        borderColor: id().border,
      }}
    />
  );
}

function App() {
  const side = 36;
  return (
    <DemoPage title="Avatar">
      <DemoCard>
        <DemoSection title="Identity">
          {MAINTAINERS.map((person) => (
            <Person name={person.name} side={side} />
          ))}
          <Person name="Alan Turing" side={side} />
        </DemoSection>
        <DemoSection title="Fallback">
          <Person name="Broken" src={AVATAR_BROKEN} side={side} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
