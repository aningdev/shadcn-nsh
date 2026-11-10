/* oxlint-disable react/jsx-no-undef -- <Each> is an NSH global */
// Pilot S: the button and the switch, every kind, size and state, on the page and on a card.
import { Button, Switch } from "@shadcn-nsh/ui";
import { mount } from "nsh";

import { Flow, Page, Panel, Row } from "./demo-kit";

const variants = ["default", "secondary", "outline", "ghost", "destructive"] as const;
const sizes = ["xs", "sm", "default", "lg"] as const;

mount(() => (
  <Page>
    <Panel title="Button — kinds">
      <Row label="rest">
        <Flow>
          <Each of={[...variants]}>{(v) => <Button variant={v()}>{v()}</Button>}</Each>
        </Flow>
      </Row>
      <Row label="disabled">
        <Flow>
          <Each of={[...variants]}>
            {(v) => (
              <Button variant={v()} disabled>
                {v()}
              </Button>
            )}
          </Each>
        </Flow>
      </Row>
      <Row label="selected">
        <Flow>
          <Each of={[...variants]}>
            {(v) => (
              <Button variant={v()} selected>
                {v()}
              </Button>
            )}
          </Each>
        </Flow>
      </Row>
    </Panel>
    <Panel title="Button — sizes">
      <Row label="sizes">
        <Flow>
          <Each of={[...sizes]}>
            {(s) => (
              <Button size={s()} variant="secondary">
                {s()}
              </Button>
            )}
          </Each>
        </Flow>
      </Row>
      <Row label="icon">
        <Flow>
          <Button size="icon-xs" variant="outline">
            +
          </Button>
          <Button size="icon-sm" variant="outline">
            +
          </Button>
          <Button size="icon" variant="outline">
            +
          </Button>
          <Button size="icon-lg" variant="outline">
            +
          </Button>
        </Flow>
      </Row>
    </Panel>
    <Panel title="Switch">
      <Row label="off / on">
        <Flow>
          <Switch checked={false} />
          <Switch checked />
          <Switch checked={false} disabled />
          <Switch checked disabled />
        </Flow>
      </Row>
      <Row label="sm">
        <Flow>
          <Switch size="sm" checked={false} />
          <Switch size="sm" checked />
        </Flow>
      </Row>
    </Panel>
  </Page>
));
