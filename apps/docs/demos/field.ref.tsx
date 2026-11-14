// The reference of `field.tsx`: the same page with the field family's look spread on plain views
// and texts (`fieldFamilyLook`), each label written in the style the `Field` around it would give
// it. The render check requires the two pages to draw the same pixels, so this is what proves the
// ten parts change nothing.
import type { JSX } from "nsh";
import { mount, Text, View } from "nsh";

import { Checkbox } from "@/packages/ui/checkbox";
import { fieldFamilyLook } from "@/packages/ui/field";
import { Input } from "@/packages/ui/input";
import { listRow, narrowWindow } from "@/packages/ui/lib/surface";
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
  // `responsive` reads the window the way `Field` does: horizontal above 600 points.
  const responsiveHorizontal = !narrowWindow();
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
          <View role="group" style={fieldFamilyLook().set}>
            <Text style={fieldFamilyLook().legend("legend")}>Payment method</Text>
            <Text style={fieldFamilyLook().description}>
              All transactions are secure and encrypted.
            </Text>
            <View style={fieldFamilyLook().group}>
              <View role="group" style={fieldFamilyLook().field(false)}>
                <Text style={fieldFamilyLook().title}>Name on card</Text>
                <Input placeholder="Evil Rabbit" />
              </View>
              <View role="group" style={fieldFamilyLook().field(false)}>
                <Text style={fieldFamilyLook().title}>Card number</Text>
                <Input placeholder="1234 5678 9012 3456" />
              </View>
              <View role="group" style={fieldFamilyLook().field(false)}>
                <Text style={fieldFamilyLook().title}>Expiry</Text>
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
              </View>
            </View>
          </View>
          <View style={fieldFamilyLook().separator}>
            <View style={fieldFamilyLook().separatorLine} />
            <Text style={fieldFamilyLook().separatorText}>Billing address</Text>
            <View style={fieldFamilyLook().separatorLine} />
          </View>
          <View role="group" style={fieldFamilyLook().field(true)}>
            <Text style={fieldFamilyLook().labelInRow}>Email</Text>
            <View style={fieldFamilyLook().content}>
              <Input value="evil@rabbit" invalid />
              <View role="alert" style={fieldFamilyLook().error}>
                <Text style={fieldFamilyLook().errorText}>
                  Enter an email address like name@example.com.
                </Text>
              </View>
            </View>
          </View>
        </Column>

        <Column>
          <View role="group" style={fieldFamilyLook().set}>
            <Text style={fieldFamilyLook().legend("label")}>Show these items on the desktop</Text>
            <Text style={fieldFamilyLook().description}>
              Select the items you want to see there.
            </Text>
            <View style={[fieldFamilyLook().group, { gap: 0 }]}>
              <Checkbox {...listRow({ first: true })}>Hard disks</Checkbox>
              <Checkbox checked {...listRow()}>
                External disks
              </Checkbox>
            </View>
          </View>
          <View style={fieldFamilyLook().separator}>
            <View style={fieldFamilyLook().separatorLine} />
          </View>
          <View role="group" style={fieldFamilyLook().field(true)}>
            <View style={fieldFamilyLook().content}>
              <Text style={fieldFamilyLook().title}>Multi-factor authentication</Text>
              <Text style={fieldFamilyLook().description}>
                Ask for a one-time code on a new device.
              </Text>
            </View>
            <Switch />
          </View>
          <View style={fieldFamilyLook().separator}>
            <View style={fieldFamilyLook().separatorLine} />
          </View>
          <View role="group" style={fieldFamilyLook().field(responsiveHorizontal)}>
            <View style={fieldFamilyLook().content}>
              <Text style={fieldFamilyLook().title}>Full name</Text>
              <Text style={fieldFamilyLook().description}>
                Provide your full name for identification.
              </Text>
            </View>
            <Input placeholder="Evil Rabbit" />
          </View>
        </Column>
      </View>
    </DemoPage>
  );
}

mount(App);
