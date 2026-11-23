import { colors, control, finish, selectTheme, type AppTheme } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";

import { defaultTheme } from "../../../packages/theme/themes/default/index";
import materialTheme from "../../../packages/theme/themes/material/index";
import winuiTheme from "../../../packages/theme/themes/winui/index";
import {
  Button,
  fieldCorners,
  inputLook,
  navBarStyle,
  SidebarMenuButton,
  SidebarProvider,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../packages/ui";
import { fieldLook } from "../../../packages/ui/lib/look";

/** A WinUI-dimension theme with distinct inverse and modal roles. */
const marked: AppTheme = {
  ...winuiTheme,
  id: "marked",
  label: "marked",
  semantics: {
    ...winuiTheme.semantics,
    finishes: {
      ...winuiTheme.semantics.finishes,
      shared: {
        ...winuiTheme.semantics.finishes.shared,
        modal: { ...defaultTheme.semantics.finishes.shared.modal, "border-color": "{brand}" },
        inverse: { ...defaultTheme.semantics.finishes.shared.inverse, background: "{brand}" },
      },
    },
  },
  theme: {
    ...defaultTheme.theme,
    cssVars: {
      ...defaultTheme.theme.cssVars,
      light: { ...defaultTheme.theme.cssVars.light, "inverse-foreground": "oklch(0.5 0.1 120)" },
      dark: { ...defaultTheme.theme.cssVars.dark, "inverse-foreground": "oklch(0.5 0.1 120)" },
    },
  },
};

function App() {
  const shown = signal(true);
  return (
    <View>
      <Text testID="nav-width">{`nav-width:${navBarStyle().width}`}</Text>
      <Text testID="inverse">{`inverse:${colors.inverseForeground}`}</Text>
      <Text testID="modal">{`modal:${finish.modal.borderColor}`}</Text>
      <Text testID="tooltip">{`tooltip:${finish.inverse.backgroundColor}`}</Text>
      <Text testID="inverse-fill">{`inverse-fill:${finish.inverse.backgroundColor}`}</Text>
      <Text testID="field">{`field:${inputLook().style.borderBottomWidth ?? inputLook().style.borderWidth}|${inputLook().style.borderTopWidth ?? inputLook().style.borderWidth}`}</Text>
      <Text testID="frame">{`frame:${inputLook().class}`}</Text>
      <Text testID="corners">{`corners:${fieldCorners(fieldLook(control().field)).borderBottomLeftRadius}|${fieldCorners(fieldLook(control().field)).borderTopLeftRadius}`}</Text>
      <If when={shown()}>
        <Tabs defaultValue="a">
          <TabsList>
            <TabsTrigger value="a">Alpha</TabsTrigger>
            <TabsTrigger value="b">Beta</TabsTrigger>
          </TabsList>
        </Tabs>
      </If>
      <Button onPress={() => shown.set(false)}>Hide tabs</Button>
      <Button onPress={() => shown.set(true)}>Show tabs</Button>
      <SidebarProvider>
        <SidebarMenuButton isActive>Home</SidebarMenuButton>
      </SidebarProvider>
      <Button onPress={() => selectTheme(materialTheme)}>Material</Button>
      <Button onPress={() => selectTheme(marked)}>Marked</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
