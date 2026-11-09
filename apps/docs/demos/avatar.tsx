import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import { Avatar, AvatarGroup } from "../../../packages/ui/avatar";

function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Avatar</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" size={32} />
        <Avatar name="Alan Turing" size={48} />
      </View>
      <AvatarGroup limit={3} total={4}>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
        <Avatar name="Katherine Johnson" />
      </AvatarGroup>
    </View>
  );
}

mount(App);
