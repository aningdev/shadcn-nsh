import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTitle,
  HoverCardTrigger,
} from "@/packages/ui/hover-card";

function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Hover card</Text>
      <HoverCard>
        <HoverCardTrigger>@ada</HoverCardTrigger>
        <HoverCardContent openDelay={200}>
          <HoverCardHeader>
            <HoverCardTitle>Ada Lovelace</HoverCardTitle>
            <HoverCardDescription>First programmer of the Analytical Engine.</HoverCardDescription>
          </HoverCardHeader>
        </HoverCardContent>
      </HoverCard>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Rest the pointer on the name. Escape closes the card.
      </Text>
    </View>
  );
}

mount(App);
