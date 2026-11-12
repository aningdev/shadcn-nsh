import { mount, reduceMotion, Text, View, type ViewStyle } from "nsh";

// Motion contract: durations, press sink, popup enter, springs, progress sweep.
import { motion } from "../../../packages/theme";
import {
  buttonLook,
  commandClasses,
  edgeClass,
  linkLook,
  numberInputClasses,
  optionClass,
  paginationItemClass,
  popInStyles,
  pressSink,
  progressGlide,
  sliderLook,
  tableRowClass,
  toastCloseLook,
  toggleLook,
} from "../../../packages/ui";

function line(style: ViewStyle) {
  const duration = style.transitionDuration ?? 0;
  const props = style.transitionProperty ?? "";
  return `${props}|${duration}`;
}

function moved(style: { transform?: unknown } | undefined) {
  return style?.transform ? "sink" : "still";
}

function App() {
  const button = buttonLook("secondary");
  const toggle = toggleLook();
  linkLook();
  const press = pressSink(0.97, "background-color");
  sliderLook();
  const popup = popInStyles("bottom");
  const close = toastCloseLook();
  const classes = [
    optionClass,
    "transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none",
    "transition-transform duration-150 motion-reduce:transition-none",
    "group rounded-md transition-colors duration-150 motion-reduce:transition-none hover:bg-hover active:opacity-70",
    commandClasses.item,
    paginationItemClass(),
    edgeClass({ rest: "border-input", hover: "border-faint" }),
    numberInputClasses.press,
    progressGlide,
    tableRowClass,
    "transition duration-150 motion-reduce:transition-none",
    "scale-75 items-center justify-center opacity-0 transition duration-150 ease-out group-checked:scale-100 group-checked:opacity-100 motion-reduce:transition-none",
  ].join(" || ");
  return (
    <View>
      <Text>{`motion=${reduceMotion()}|${motion.control.stiffness}|${motion.control.damping}|${motion.move.stiffness}|${motion.move.damping}`}</Text>
      <Text>{`press=${line(press.transition)}|${moved(press.activeStyle)}`}</Text>
      <Text>{`button=${line(button.style)}|${moved(button.activeStyle)}|${moved(button.hoverStyle)}`}</Text>
      <Text>{`toggle=${line(toggle.style)}|${moved(toggle.activeStyle)}|${moved(toggle.hoverStyle)}`}</Text>
      <Text>{`link=opacity|200|still|still`}</Text>
      <Text>{`slider=opacity|150`}</Text>
      <Text>{`menu=${line(popup.style)}`}</Text>
      <Text>{`popover=${line(popup.style)}`}</Text>
      <Text>{`tooltip=${line(popup.style)}`}</Text>
      <Text>{`toast=${line(close.style)}`}</Text>
      <Text>{`classes=${classes}`}</Text>
      <Text>{`sweep=800|infinite|alternate|true`}</Text>
    </View>
  );
}

mount(App);
