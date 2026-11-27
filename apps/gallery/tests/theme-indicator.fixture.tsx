import { colors, control, defineTheme, selectTheme, surface } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import materialTheme from "../../../packages/theme/themes/material/index";
import { nshGallery } from "../../../packages/theme/themes/nsh-gallery/index";
import winuiTheme from "../../../packages/theme/themes/winui/index";
import { Button, fieldLook } from "../../../packages/ui";

/** The value as the string NSH writes: a style's colour keeps `{ animated }` in its type. */
const css = (value: unknown) => value as string;

/** A WinUI-dimension theme with distinct inverse and modal roles. */
const marked = defineTheme({
  extends: winuiTheme.spec,
  id: "marked",
  label: "marked",
  surfaces: {
    modal: { ...nshGallery.spec.surfaces.modal, border: "brand" },
    inverse: { ...nshGallery.spec.surfaces.inverse, background: "brand", foreground: "muted" },
  },
});

/** A field's box corners: an all-round edge keeps its radius, an underline field has flat bottoms. */
const fieldCorners = () => ({
  borderBottomLeftRadius: control("field").bottomRadius,
  borderTopLeftRadius: control("field").radius,
});

function frameLine() {
  const look = fieldLook();
  const s = look.style;
  const f = look.focusWithinStyle;
  return [
    `side-muted=${s.borderColor === colors.mutedForeground}`,
    `side-line=${s.borderColor === colors.line}`,
    `bottom-input=${s.borderBottomColor === colors.input}`,
    `hover=${look.hoverStyle !== undefined}`,
    `focus-bottom-brand=${f.borderBottomColor === colors.brand}`,
    `focus-bottom-width=${f.borderBottomWidth ?? 0}`,
    `ring=${(f.outlineWidth ?? 0) === 2 && !control("field").focusLine}`,
  ].join("|");
}

function App() {
  return (
    <View>
      <Text testID="inverse">{`inverse:${surface("inverse").ink}`}</Text>
      <Text testID="modal">{`modal:${css(surface("modal").style.borderColor)}`}</Text>
      <Text testID="tooltip">{`tooltip:${css(surface("inverse").style.backgroundColor)}`}</Text>
      <Text testID="inverse-fill">{`inverse-fill:${css(surface("inverse").style.backgroundColor)}`}</Text>
      <Text testID="field">{`field:${fieldLook().style.borderBottomWidth ?? fieldLook().style.borderWidth}|${fieldLook().style.borderTopWidth ?? fieldLook().style.borderWidth}`}</Text>
      <Text testID="stroke">{`stroke:${"borderBottomColor" in { ...surface("inset").style }}|${fieldLook().style.borderBottomColor === surface("inset").style.borderBottomColor}|${surface("inset").style.borderBottomColor !== surface("inset").style.borderColor}`}</Text>
      <Text testID="frame">{`frame:${frameLine()}`}</Text>
      <Text testID="corners">{`corners:${fieldCorners().borderBottomLeftRadius}|${fieldCorners().borderTopLeftRadius}`}</Text>
      <Button onPress={() => selectTheme(materialTheme)}>Material</Button>
      <Button onPress={() => selectTheme(marked)}>Marked</Button>
      <Button onPress={() => selectTheme(null)}>Build-time</Button>
    </View>
  );
}

mount(App);
