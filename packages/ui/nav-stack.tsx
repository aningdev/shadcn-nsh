// No reference look. The desktop bar is the card surface; the system header takes the same colors.
import { colors } from "@shadcn-nsh/theme";
import type { JSX, TextStyle, ViewStyle } from "nsh";
import { computed, split, Text, View } from "nsh";
import {
  NavPage as BaseNavPage,
  NavStack as BaseNavStack,
  type HeaderStyle,
  type NavPageProps as BaseNavPageProps,
  type NavStackProps as BaseNavStackProps,
} from "nsh/base";

import { mergeClass, mergeStyle } from "./lib/part-style";

export { createNavStack } from "nsh/base";

/**
 * Theme layer on `nsh/base` NavStack. Navigation stays in base.
 * The stack and each page take the theme background.
 */
export type NavStackProps<R> = BaseNavStackProps<R>;

/** Theme layer on `nsh/base` NavPage, plus the system header's colors. */
export type NavPageProps = BaseNavPageProps;

/** The bar placed in a page's `header` on the desktops and the web. */
export type NavHeaderProps = {
  /** The page name. One line. */
  title: string;
  /** Draws Back and pops when pressed. Omit it on the first page. */
  onBack?: () => void;
};

/** Stack and page chrome, and the system header colors. */
export type NavStackChrome = {
  /** Host classes. */
  className: string;
  /** The page fill. */
  style: ViewStyle;
  /** iOS and Android system header. Ignored on the desktops and the web. */
  headerStyle: HeaderStyle;
  /** Desktop bar: background, hairline, a 44-point row. */
  bar: ViewStyle;
  /** The title on that bar. */
  title: TextStyle;
};

function look(): NavStackChrome {
  return {
    className: "",
    style: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerStyle: {
      backgroundColor: colors.card,
      color: colors.foreground,
      tintColor: colors.primary,
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      minHeight: 44,
      paddingHorizontal: 8,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderStyle: "solid",
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
      numberOfLines: 1,
    },
  };
}

/** The stack's fill and the system header's colors. Call it where the theme is read. */
export function navStackVariants(): NavStackChrome {
  return look();
}

/** A native stack. `flex: 1` is the default so a parent with a height can give it one. */
export function NavStack<R>(props: NavStackProps<R>) {
  const [, rest] = split(props, ["class", "style"]);
  const chrome = computed(look);
  return (
    <BaseNavStack
      {...rest}
      class={props.class ? mergeClass(chrome().className, props.class) : props.class}
      style={mergeStyle(chrome().style, props.style)}
    />
  );
}

/** One page. The system header uses the theme; pass `header` for the desktops and the web. */
export function NavPage(props: NavPageProps) {
  const [, rest] = split(props, ["class", "style", "headerStyle"]);
  const chrome = computed(look);
  const header = (): HeaderStyle =>
    props.headerStyle ? { ...chrome().headerStyle, ...props.headerStyle } : chrome().headerStyle;
  return (
    <BaseNavPage
      {...rest}
      class={props.class ? mergeClass(chrome().className, props.class) : props.class}
      style={mergeStyle(chrome().style, props.style)}
      headerStyle={header()}
    />
  );
}

/**
 * Desktop and web bar for `NavPage`'s `header`. Base draws no title and no back button there.
 * iOS and Android keep the system header and ignore this slot.
 */
export function NavHeader(props: NavHeaderProps) {
  const chrome = computed(look);
  const back = (): JSX.Element | null =>
    props.onBack ? (
      <View
        role="button"
        accessibilityLabel="Back"
        onPress={props.onBack}
        style={{ minHeight: 32, justifyContent: "center", paddingHorizontal: 8 }}
      >
        <Text style={{ fontSize: 13, color: colors.foreground, numberOfLines: 1 }}>Back</Text>
      </View>
    ) : null;
  return (
    <View style={chrome().bar}>
      {back()}
      <Text style={chrome().title}>{props.title}</Text>
    </View>
  );
}
