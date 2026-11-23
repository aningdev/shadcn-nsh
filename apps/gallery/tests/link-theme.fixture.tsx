import { selectTheme } from "@shadcn-nsh/theme";
import { mount, View } from "nsh";

import { shadcn } from "../../../packages/theme/themes/shadcn/index";
import { Button, Link } from "../../../packages/ui";

// A link's ink is the theme's brand, and it is read where the label is drawn: a theme switch
// redraws no part, so a color computed once in the body would stay the old theme's.
function App() {
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Link href="https://nsh.dev">Ink</Link>
      <Button onPress={() => selectTheme(shadcn)}>Shadcn</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
      <Link href="https://nsh.dev" disabled>
        Dimmed
      </Link>
    </View>
  );
}

mount(App);
