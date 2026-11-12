import { mount } from "nsh";

import { Progress } from "@/packages/ui/progress";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  return (
    <DemoPage title="Progress">
      <DemoCard>
        <DemoSection title="Determinate">
          <Progress value={35} style={{ width: 240 }} />
          <Progress value={100} tone="up" style={{ width: 240 }} />
        </DemoSection>
        <DemoSection title="Thin">
          <Progress value={60} height={4} style={{ width: 240 }} />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
