import { mount, signal, Text, View } from "nsh";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  Button,
  Checkbox,
  Link,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../packages/ui";

// None of these has an `accessibilityLabel`: each is named by its texts, which is what screen
// readers read and what `role:<role>[<text>]` finds (the premise of dropping the derived label).
function App() {
  const saved = signal(false);
  const agreed = signal(false);
  const followed = signal(false);
  const section = signal("profile");
  const answer = signal(false);
  const archived = signal(false);
  return (
    <View style={{ padding: 20, gap: 8 }}>
      <Button onPress={() => saved.set(true)}>Save</Button>
      <Checkbox onChange={({ checked }) => agreed.set(checked)}>Accept the terms</Checkbox>
      <Link href="https://nsh.dev" onOpen={() => followed.set(true)}>
        Follow the docs
      </Link>
      <Menu>
        <MenuTrigger>Open the menu</MenuTrigger>
        <MenuContent>
          <MenuItem closeOnSelect={false} onSelect={() => archived.set(true)}>
            Archive it
          </MenuItem>
        </MenuContent>
      </Menu>
      <Tabs value={section()} onValueChange={(value) => section.set(value)}>
        <TabsList variant="default">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
      </Tabs>
      <Accordion
        value={answer() ? ["answer"] : []}
        onChange={({ value }) => answer.set(value.includes("answer"))}
      >
        <AccordionItem value="answer">
          <AccordionHeader>
            <AccordionTrigger first>What it is called</AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel>
            <Text>The name screen readers say</Text>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Text>
        {[
          saved() ? "saved" : "",
          agreed() ? "agreed" : "",
          followed() ? "followed" : "",
          archived() ? "archived" : "",
          section(),
          answer() ? "answered" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      </Text>
    </View>
  );
}

mount(App);
