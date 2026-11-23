// What a theme switch redraws in the parts that read their sizes where they are drawn: a palette's
// row, an item's icon tile, a refresh indicator's chip, the corners kbd and a drawer's grabber get
// from `rounded`, and a code block's title weight.

import { selectTheme } from "@shadcn-nsh/theme";
import type { Bounds, Signal } from "nsh";
import { createAnimatedValue, mount, signal, Text, View } from "nsh";

import appleTheme from "../../../packages/theme/themes/apple/index";
import materialTheme from "../../../packages/theme/themes/material/index";
import winuiTheme from "../../../packages/theme/themes/winui/index";
import {
  Button,
  codeBlockLook,
  CommandRow,
  drawerGrabber,
  ItemMedia,
  Kbd,
  kbdLook,
  REFRESH_INDICATOR_HEIGHT,
  refreshIndicatorLook,
} from "../../../packages/ui";

function App() {
  const row = signal(-1);
  const tile = signal(-1);
  const chip = signal(-1);
  const pull = createAnimatedValue(0);
  /** A size reported once the app laid it out (a signal set to the same number loops). */
  const watch =
    (target: Signal<number>, size: "width" | "height") => (event: { bounds: Bounds }) => {
      const next = Math.round(event.bounds.size[size]);
      if (next !== target()) target.set(next);
    };
  return (
    <View style={{ gap: 8, padding: 12 }}>
      <Text>{`row=${row()}`}</Text>
      <Text>{`tile=${tile()}`}</Text>
      <Text>{`chip=${chip()}`}</Text>
      <Text>{`kbd-curve=${String(kbdLook().kbd.borderCurve)}`}</Text>
      <Text>{`grabber-curve=${String(drawerGrabber().borderCurve)}`}</Text>
      <Text>{`title-weight=${String(codeBlockLook().title("default").fontWeight)}`}</Text>

      <Button onPress={() => selectTheme(materialTheme)}>Apply Material</Button>
      <Button onPress={() => selectTheme(winuiTheme)}>Apply WinUI</Button>
      <Button onPress={() => selectTheme(appleTheme)}>Apply Apple</Button>
      <Button onPress={() => selectTheme(null)}>Apply Default</Button>

      <View style={{ flexShrink: 0 }} onLayout={watch(row, "height")}>
        <CommandRow
          entry={{ id: "new", label: "New File", keywords: [], disabled: false, checked: false }}
          detail="Creates an empty file"
        />
      </View>
      <View style={{ alignSelf: "flex-start", flexShrink: 0 }} onLayout={watch(tile, "width")}>
        <ItemMedia variant="icon" />
      </View>
      <View
        style={{ ...refreshIndicatorLook().chip(pull, REFRESH_INDICATOR_HEIGHT), flexShrink: 0 }}
        onLayout={watch(chip, "width")}
      />
      <Kbd>K</Kbd>
    </View>
  );
}

mount(App);
