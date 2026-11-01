import { colors, focusRing } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text } from "nsh";
import {
  Accordion as BaseAccordion,
  AccordionHeader as BaseAccordionHeader,
  AccordionItem as BaseAccordionItem,
  AccordionPanel as BaseAccordionPanel,
  AccordionTrigger as BaseAccordionTrigger,
} from "nsh/base";

export function Accordion(props: {
  value?: string[];
  multiple?: boolean;
  disabled?: boolean;
  children?: JSX.Element;
  onChange?: (event: { value: string[] }) => void;
}) {
  return (
    <BaseAccordion
      value={props.value}
      multiple={props.multiple}
      disabled={props.disabled}
      onChange={props.onChange}
      style={{ opacity: props.disabled ? 0.5 : 1 }}
    >
      {props.children}
    </BaseAccordion>
  );
}

export function AccordionItem(props: {
  value: string;
  disabled?: boolean;
  children?: JSX.Element;
}) {
  return (
    <BaseAccordionItem
      value={props.value}
      disabled={props.disabled}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      {props.children}
    </BaseAccordionItem>
  );
}

export function AccordionHeader(props: { level?: number; children?: JSX.Element }) {
  return <BaseAccordionHeader level={props.level}>{props.children}</BaseAccordionHeader>;
}

export function AccordionTrigger(props: {
  accessibilityLabel?: string | null;
  children?: JSX.Element;
}) {
  return (
    <BaseAccordionTrigger
      accessibilityLabel={props.accessibilityLabel}
      focusStyle={focusRing()}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        gap: 8,
      }}
    >
      {props.children ?? (
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>Section</Text>
      )}
    </BaseAccordionTrigger>
  );
}

export function AccordionPanel(props: {
  reveal?: boolean;
  keepMounted?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
}) {
  return (
    <BaseAccordionPanel
      reveal={props.reveal ?? true}
      keepMounted={props.keepMounted}
      accessibilityLabel={props.accessibilityLabel}
    >
      {props.children}
    </BaseAccordionPanel>
  );
}

/** shadcn-shaped alias for `AccordionPanel`. */
export function AccordionContent(props: {
  reveal?: boolean;
  keepMounted?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
}) {
  return <AccordionPanel {...props} />;
}
