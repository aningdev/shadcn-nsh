// The official field scenes (shadcn's `field-demo`, `field-checkbox`, `field-switch` and
// `field-responsive`) with this library's parts: a payment method under a legend, a separator
// with a word, a field in error; the checkboxes under a `variant="label"` legend (each one
// carrying its own label, so the whole row is the target); a switch beside its description
// (`horizontal`); and a field that stacks on a phone and sits in a row on the desktop
// (`responsive`). A wide window holds the two halves side by side.
import type { JSX } from "nsh";
import { mount, View } from "nsh";

import { Checkbox } from "@/packages/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/packages/ui/field";
import { Input } from "@/packages/ui/input";
import { listRow } from "@/packages/ui/lib/surface";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/packages/ui/select";
import { Switch } from "@/packages/ui/switch";

import { DemoPage } from "./kit";
import { wide } from "./stage";

const MONTHS = ["01", "02", "03", "04", "05", "06"];
const YEARS = ["2026", "2027", "2028", "2029"];

/** One half of the page: a column of its own in a wide window, the whole width on a phone. */
function Column(props: { children: JSX.Element }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: wide() ? 300 : "auto", gap: 12 }}>{props.children}</View>
  );
}

function App() {
  return (
    <DemoPage title="Field">
      <View
        style={{
          flexDirection: wide() ? "row" : "column",
          alignItems: "stretch",
          gap: 24,
        }}
      >
        <Column>
          <FieldSet>
            <FieldLegend variant="legend">Payment method</FieldLegend>
            <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Name on card</FieldLabel>
                <Input placeholder="Evil Rabbit" />
              </Field>
              <Field>
                <FieldLabel>Card number</FieldLabel>
                <Input placeholder="1234 5678 9012 3456" />
              </Field>
              <Field>
                <FieldLabel>Expiry</FieldLabel>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Select placeholder="MM">
                    <SelectTrigger style={{ flexGrow: 1 }} />
                    <SelectContent accessibilityLabel="Month">
                      {MONTHS.map((month) => (
                        <SelectItem value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select placeholder="YYYY">
                    <SelectTrigger style={{ flexGrow: 1 }} />
                    <SelectContent accessibilityLabel="Year">
                      {YEARS.map((year) => (
                        <SelectItem value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </View>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator>Billing address</FieldSeparator>
          <Field orientation="horizontal">
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input value="evil@rabbit" invalid />
              <FieldError errors={[{ message: "Enter an email address like name@example.com." }]} />
            </FieldContent>
          </Field>
        </Column>

        <Column>
          <FieldSet>
            <FieldLegend variant="label">Show these items on the desktop</FieldLegend>
            <FieldDescription>Select the items you want to see there.</FieldDescription>
            <FieldGroup style={{ gap: 0 }}>
              <Checkbox {...listRow({ first: true })}>Hard disks</Checkbox>
              <Checkbox checked {...listRow()}>
                External disks
              </Checkbox>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel>Multi-factor authentication</FieldLabel>
              <FieldDescription>Ask for a one-time code on a new device.</FieldDescription>
            </FieldContent>
            <Switch />
          </Field>
          <FieldSeparator />
          <Field orientation="responsive">
            <FieldContent>
              <FieldTitle>Full name</FieldTitle>
              <FieldDescription>Provide your full name for identification.</FieldDescription>
            </FieldContent>
            <Input placeholder="Evil Rabbit" />
          </Field>
        </Column>
      </View>
    </DemoPage>
  );
}

mount(App);
