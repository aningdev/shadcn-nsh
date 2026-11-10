import { colors } from "@shadcn-nsh/theme";
import { Button, NavHeader, NavPage, NavStack, createNavStack } from "@shadcn-nsh/ui";
import { Text, View, mount, signal } from "nsh";

const nav = createNavStack<string>(["Inbox"]);

function App() {
  const shown = signal("Inbox");
  return (
    <View style={{ padding: 12, gap: 8, backgroundColor: colors.background }}>
      <Text>{`top=${shown()}`}</Text>
      <View style={{ width: 260, height: 140 }}>
        <NavStack state={nav}>
          {(page) => (
            <NavPage
              title={page}
              header={
                <NavHeader
                  title={page}
                  onBack={
                    nav.routes().length > 1
                      ? () => {
                          nav.pop();
                          shown.set(String(nav.routes()[nav.routes().length - 1]));
                        }
                      : undefined
                  }
                />
              }
            >
              <View style={{ padding: 8, gap: 8 }}>
                <Text>{page}</Text>
                {page === "Inbox" ? (
                  <Button
                    size="sm"
                    onPress={() => {
                      nav.push("Note");
                      shown.set(String(nav.routes()[nav.routes().length - 1]));
                    }}
                  >
                    Open
                  </Button>
                ) : null}
              </View>
            </NavPage>
          )}
        </NavStack>
      </View>
    </View>
  );
}

mount(App);
