// Motion contract: durations, hover (no sink), chevrons, springs, and the progress loop.
// One line for the class list: `texts()` keeps a bounded set of nodes.
import {
  accordionChevronClass,
  avatarPictureClass,
  buttonVariants,
  collapsibleChevronClass,
  commandVariants,
  fieldTransitionClass,
  groupSink,
  linkVariants,
  menuPopupMotion,
  numberStepClass,
  optionClass,
  paginationVariants,
  popoverMotion,
  pressSink,
  progressSweep,
  progressVariants,
  scrollbarThumbMotion,
  sliderVariants,
  springs,
  tableRowClass,
  toastMotionClass,
  toggleVariants,
  tooltipMotion,
  treeChevronClass,
  treeVariants,
} from "@shadcn-nsh/ui";
import { mount, reduceMotion, Text, View, type ViewStyle } from "nsh";

function line(style: ViewStyle) {
  return `${String(style.transitionProperty)}|${String(style.transitionDuration)}`;
}

function moved(style: { transform?: unknown } | undefined) {
  return style?.transform ? "sink" : "still";
}

function App() {
  const button = buttonVariants();
  const toggle = toggleVariants();
  const link = linkVariants();
  const press = pressSink(0.97, "background-color");
  const slider = sliderVariants();
  const classes = [
    groupSink,
    accordionChevronClass,
    collapsibleChevronClass,
    treeChevronClass,
    treeVariants().itemClass,
    commandVariants().itemClass,
    optionClass,
    paginationVariants().itemClass,
    fieldTransitionClass,
    numberStepClass,
    progressVariants().indicatorClass,
    avatarPictureClass,
    tableRowClass,
    scrollbarThumbMotion,
  ].join(" || ");
  return (
    <View>
      <Text>{`motion=${reduceMotion()}|${springs.control.stiffness}|${springs.control.damping}|${springs.move.stiffness}|${springs.move.damping}`}</Text>
      <Text>{`press=${line(press.transition)}|${moved(press.activeStyle)}`}</Text>
      <Text>{`button=${line(button.style)}|${moved(button.activeStyle)}|${moved(button.hoverStyle)}`}</Text>
      <Text>{`toggle=${line(toggle.style)}|${moved(toggle.activeStyle)}|${moved(toggle.hoverStyle)}`}</Text>
      <Text>{`link=${line(link.style)}|${moved(link.active)}|${moved(link.hover)}`}</Text>
      <Text>{`slider=${line(slider.style)}`}</Text>
      <Text>{`menu=${line(menuPopupMotion())}`}</Text>
      <Text>{`popover=${line(popoverMotion())}`}</Text>
      <Text>{`tooltip=${line(tooltipMotion())}`}</Text>
      <Text>{`toast=${toastMotionClass()}`}</Text>
      <Text>{`classes=${classes}`}</Text>
      <Text>{`sweep=${progressSweep.duration}|${progressSweep.iterations}|${progressSweep.direction}|${progressSweep.ignoreReduceMotion}`}</Text>
    </View>
  );
}

mount(App);
