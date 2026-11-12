// The reference of `progress.tsx`: progressLook on `nsh/base`'s Progress.
import { mount } from "nsh";
import { Progress } from "nsh/base";

import { progressLook } from "@/packages/ui/progress";

import { DemoCard, DemoPage, DemoSection } from "./kit";

function App() {
  const a = progressLook(35);
  const b = progressLook(100, { tone: "up" });
  const c = progressLook(60, { height: 4 });

  return (
    <DemoPage title="Progress">
      <DemoCard>
        <DemoSection title="Determinate">
          <Progress
            value={35}
            style={{ width: 240 }}
            trackStyle={a.trackStyle}
            indicatorClass={a.indicatorClass}
            indicatorStyle={a.indicatorStyle}
          />
          <Progress
            value={100}
            style={{ width: 240 }}
            trackStyle={b.trackStyle}
            indicatorClass={b.indicatorClass}
            indicatorStyle={b.indicatorStyle}
          />
        </DemoSection>
        <DemoSection title="Thin">
          <Progress
            value={60}
            style={{ width: 240 }}
            trackStyle={c.trackStyle}
            indicatorClass={c.indicatorClass}
            indicatorStyle={c.indicatorStyle}
          />
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
