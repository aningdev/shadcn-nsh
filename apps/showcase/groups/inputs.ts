// The Inputs group: what the user answers a question with — typed, picked, slid, chosen.
import {
  Calendar,
  ChevronsUpDown,
  CircleDot,
  Combine,
  Hash,
  KeyRound,
  Pipette,
  SlidersHorizontal,
  Smile,
  SquareCheck,
  TextCursorInput,
  ToggleRight,
} from "lucide";

import { lazy, type DemoEntry } from "./entry";

/** The Inputs demos, in the index's order. */
export const inputs: DemoEntry[] = [
  {
    name: "Input",
    detail: "Live validation, passwords, search, input groups, the keyboard over the content",
    icon: TextCursorInput,
    screen: lazy(() => import("../demos/input").then((m) => m.InputDemo)),
  },
  {
    name: "NumberInput",
    detail: "Quantities typed or stepped, within a range, in steps",
    icon: Hash,
    screen: lazy(() => import("../demos/number-input").then((m) => m.NumberInputDemo)),
  },
  {
    name: "OtpInput",
    detail: "A one-time code typed into one field, pasted or filled by the system",
    icon: KeyRound,
    screen: lazy(() => import("../demos/otp-input").then((m) => m.OtpInputDemo)),
  },
  {
    name: "Checkbox",
    detail: "A filter with “Select all”, a checklist, consent, choice cards, sizes",
    icon: SquareCheck,
    screen: lazy(() => import("../demos/checkbox").then((m) => m.CheckboxDemo)),
  },
  {
    name: "Radio",
    detail: "Plans, delivery options as cards, a reading preference",
    icon: CircleDot,
    screen: lazy(() => import("../demos/radio").then((m) => m.RadioDemo)),
  },
  {
    name: "Switch",
    detail: "Settings that take effect at once, one that needs another on",
    icon: ToggleRight,
    screen: lazy(() => import("../demos/switch").then((m) => m.SwitchDemo)),
  },
  {
    name: "Slider",
    detail: "A level and a price range the app owns",
    icon: SlidersHorizontal,
    screen: lazy(() => import("../demos/slider").then((m) => m.SliderDemo)),
  },
  {
    name: "Select",
    detail: "A sort order, fonts in sections with search, a disabled language",
    icon: ChevronsUpDown,
    screen: lazy(() => import("../demos/select").then((m) => m.SelectDemo)),
  },
  {
    name: "Combobox",
    detail: "Topics picked several at once with search, a reviewer picked alone",
    icon: Combine,
    screen: lazy(() => import("../demos/combobox").then((m) => m.ComboboxDemo)),
  },
  {
    name: "DatePicker",
    detail: "A due date on weekdays, a trip's range with presets, a meeting's day and time",
    icon: Calendar,
    screen: lazy(() => import("../demos/date-picker").then((m) => m.DatePickerDemo)),
  },
  {
    name: "ColorPicker",
    detail: "An area, sliders of RGB, HSL, HSB or OKLCH, a field and swatches",
    icon: Pipette,
    screen: lazy(() => import("../demos/color-picker").then((m) => m.ColorPickerDemo)),
  },
  {
    name: "EmojiPicker",
    detail:
      "A composer's emoji button and a message's reactions: search, skin tones, every group, recent ones first",
    icon: Smile,
    screen: lazy(() => import("../demos/emoji-picker").then((m) => m.EmojiPickerDemo)),
  },
];
