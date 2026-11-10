import { colors } from "@shadcn-nsh/theme";
import { Text, View, mount } from "nsh";

import { Button } from "@/packages/ui/button";
import { NavHeader, NavPage, NavStack, createNavStack } from "@/packages/ui/nav-stack";

const nav = createNavStack<string>(["Inbox"]);

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavStack state={nav} style={{ flex: 1 }}>
        {(page) => (
          <NavPage
            title={page}
            header={
              <NavHeader
                title={page}
                onBack={nav.routes().length > 1 ? () => nav.pop() : undefined}
              />
            }
          >
            <View style={{ padding: 16, gap: 12 }}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>{page}</Text>
              {page === "Inbox" ? (
                <Button size="sm" onPress={() => nav.push("Note")}>
                  Open
                </Button>
              ) : null}
            </View>
          </NavPage>
        )}
      </NavStack>
    </View>
  );
}

mount(App);
