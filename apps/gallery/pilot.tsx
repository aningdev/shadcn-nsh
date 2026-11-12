import { mount } from "nsh";

/* oxlint-disable react/jsx-no-undef -- <Each> is an NSH global */
// Pilot S: the button and the switch, every kind, size and state, on the page and on a card.
import { Button, IconButton, Switch } from "../../packages/ui";
import { Flow, Page, Panel, Row } from "./demo-kit";

const kinds = ["primary", "accent", "secondary", "ghost", "danger"] as const;
const sizes = ["small", "regular", "large"] as const;

mount(() => (
  <Page>
    <Panel title="Button — kinds">
      <Row label="rest">
        <Flow>
          <Each of={[...kinds]}>{(v) => <Button variant={v()}>{v()}</Button>}</Each>
        </Flow>
      </Row>
      <Row label="disabled">
        <Flow>
          <Each of={[...kinds]}>
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
          <Each of={[...kinds]}>
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
          <IconButton variant="secondary" accessibilityLabel="xs">
            +
          </IconButton>
          <IconButton variant="secondary" accessibilityLabel="sm">
            +
          </IconButton>
          <IconButton variant="secondary" accessibilityLabel="md">
            +
          </IconButton>
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
      <Row label="small">
        <Flow>
          <Switch size="small" checked={false} />
          <Switch size="small" checked />
        </Flow>
      </Row>
    </Panel>
  </Page>
));
