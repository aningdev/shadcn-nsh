import { mount } from "nsh";

import { Link } from "@/packages/ui/link";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Link">
      <DemoCard>
        <DemoSection title="Default">
          <Link href="https://nsh.dev">Native Shell</Link>
          <Link href="#docs" quiet>
            Documentation
          </Link>
          <Link href="#here" current>
            Current page
          </Link>
          <Link href="https://example.com" icon>
            External
          </Link>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
