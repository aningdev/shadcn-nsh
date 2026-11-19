import { describe, expect, test } from "bun:test";

import { violations } from "./rules";

/** A component file: the helper is imported as the controls import it. */
const file = (body: string) => `import { childrenOf } from "./lib/children";\n${body}`;

const scan = (source: string) => violations(file(source), "probe.tsx");
const kinds = (source: string) => scan(source).map((v) => [v.kind, v.where, v.reads]);

describe("children rules", () => {
  test("one read is enough", () => {
    expect(
      scan(`export function Button(props: P) {
        const { text, content, label } = childrenOf(props);
        return <View a={label}>{text !== undefined ? <Text>{text}</Text> : content}</View>;
      }`),
    ).toEqual([]);
  });

  test("a single pass-through read passes", () => {
    expect(
      scan(`export function Card(props: P) { return <View>{props.children}</View>; }`),
    ).toEqual([]);
  });

  test("three reads are reported once, with the count", () => {
    expect(
      kinds(`export function Button(props: P) {
        return <View a={labelOf(props.accessibilityLabel, props.children)}>
          {typeof props.children === "string" ? <Text>{props.children}</Text> : props.children}
        </View>;
      }`),
    ).toEqual([["count", "Button", 4]]);
  });

  test("a read through a thunk is a second read in the making", () => {
    expect(
      kinds(`export function Button(props: P) {
        const children = () => props.children;
        return <View>{children()}</View>;
      }`),
    ).toEqual([["nested", "Button", 1]]);
  });

  test("a read in a function that runs where it is written is one read", () => {
    expect(
      scan(`export function Marker(props: P) {
        return <MarkerContext.Provider value={variant()}>
          {(() => {
            const { text, content } = childrenOf(props);
            return text !== undefined ? <Text>{text}</Text> : content;
          })()}
        </MarkerContext.Provider>;
      }`),
    ).toEqual([]);
  });

  test("the helper called twice is reported", () => {
    expect(
      kinds(`export function Button(props: P) {
        const { content } = childrenOf(props);
        const { label } = childrenOf(props);
        return <View a={label}>{content}</View>;
      }`),
    ).toEqual([["count", "Button", 2]]);
  });

  test("one use of the helper's result passes, bound or not", () => {
    expect(
      scan(`export function Button(props: P) {
        const label = childrenOf(props).label;
        return <View a={label} />;
      }`),
    ).toEqual([]);
  });

  test("the helper called inside a callback reads again on each call", () => {
    expect(
      kinds(`export function Button(props: P) {
        return <View onPress={() => childrenOf(props).label} />;
      }`),
    ).toEqual([["nested", "Button", 1]]);
  });

  test("an aliased helper is the same helper", () => {
    expect(
      kinds(`import { childrenOf as kids } from "./lib/children";
      export function Button(props: P) {
        const { content } = childrenOf(props);
        const { label } = kids(props);
        return <View a={label}>{content}</View>;
      }`),
    ).toEqual([["count", "Button", 2]]);
  });

  test("children of something else are not the component's children", () => {
    expect(
      scan(`export function Group(props: P) {
        return <View>{props.items.map((item) => item.children)}</View>;
      }`),
    ).toEqual([]);
  });
});
