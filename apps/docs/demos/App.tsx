// The demos app's entry, which `nsh check` and `nsh test` need. Each demo is an entry of its
// own (`nsh run next/demos/button.tsx`); this page only names them.
import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

const demos = [
  "button",
  "switch",
  "dialog",
  "toggle",
  "checkbox",
  "radio-group",
  "toggle-group",
  "toolbar",
  "input",
  "number-input",
  "otp-input",
  "time-field",
  "tooltip",
  "popover",
  "hover-card",
  "sheet",
  "toast",
  "alert-dialog",
  "menu",
  "context-menu",
  "select",
  "combobox",
  "calendar",
  "date-picker",
  "tabs",
  "segmented",
  "accordion",
  "collapsible",
  "carousel",
  "link",
  "pagination",
  "progress",
  "slider",
  "avatar",
  "badge",
  "status",
  "stat",
  "meter",
  "emoji-picker",
  "data-table",
  "table",
  "tree",
  "command",
  "scrollbar",
  "plot",
  "resizable",
  "dock-area",
  "diff-view",
  "text-view",
  "editor",
  "color-picker",
];

function App() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 8 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Demos</Text>
      {demos.map((name) => (
        <Text style={{ fontSize: 15, color: colors.muted }}>{name}.tsx</Text>
      ))}
    </View>
  );
}

mount(App);
