import { mount, signal, Text, View } from "nsh";

import { Button, createNavStack, NavPage, NavStack } from "../../../packages/ui";
import type { NavPageSlot } from "../../../packages/ui/nav-stack";

/**
 * A header of the app's own, with a back button and the depth: `NavPage`'s `header` hands it the
 * page's slot, so it answers Back without the page's `onBackPress` and the stack being passed down.
 */
function CustomHeader(props: { page: NavPageSlot; title: string }) {
  const page = props.page;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }}>
      <If when={page != null && page.pages() > 1}>
        <Button accessibilityLabel="Custom back" onPress={() => page?.back()}>
          Back
        </Button>
      </If>
      <Text>{props.title}</Text>
      <Text testID="depth">{() => `depth ${page?.pages() ?? 0}`}</Text>
    </View>
  );
}

/** Three pages pushed one on another; each says where the stack is, and how many backs it heard. */
type Route = { id: "first" | "second" | "custom" | "third" };

function App() {
  const nav = createNavStack<Route>([{ id: "first" }]);
  const backs = signal(0);
  return (
    <View style={{ flex: 1 }}>
      <Text testID="routes">
        {() =>
          `routes ${nav
            .routes()
            .map((route) => route.id)
            .join(",")}`
        }
      </Text>
      <Text testID="backs">{() => `backs ${backs()}`}</Text>
      <NavStack state={nav}>
        {(route) =>
          route.id === "first" ? (
            <NavPage testID="page-first" title="First">
              <View style={{ padding: 12 }}>
                <Button onPress={() => nav.push({ id: "second" })}>Go to second</Button>
              </View>
            </NavPage>
          ) : route.id === "second" ? (
            <NavPage testID="page-second" title="Second" onBackPress={() => backs.set(backs() + 1)}>
              <View style={{ padding: 12 }}>
                <Button onPress={() => nav.push({ id: "third" })}>Go to third</Button>
                <Button onPress={() => nav.push({ id: "custom" })}>Go to custom</Button>
              </View>
            </NavPage>
          ) : route.id === "custom" ? (
            <NavPage
              testID="page-custom"
              header={(page) => <CustomHeader page={page} title="Custom" />}
              onBackPress={() => backs.set(backs() + 1)}
            >
              <View style={{ padding: 12 }} />
            </NavPage>
          ) : (
            <NavPage
              testID="page-third"
              title="Third"
              popOnBack={false}
              onBackPress={() => backs.set(backs() + 1)}
            >
              <View style={{ padding: 12 }}>
                <Button onPress={() => nav.pop()}>Pop by hand</Button>
              </View>
            </NavPage>
          )
        }
      </NavStack>
    </View>
  );
}

mount(App);
