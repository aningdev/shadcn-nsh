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
        const kids = childrenOf(props);
        return (
          <View a={kids.label()}>
            {kids.text() !== undefined ? <Text>{kids.text()}</Text> : kids.content()}
          </View>
        );
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
            const kids = childrenOf(props);
            return kids.text() !== undefined ? <Text>{kids.text()}</Text> : kids.content();
          })()}
        </MarkerContext.Provider>;
      }`),
    ).toEqual([]);
  });

  test("the helper called twice is reported", () => {
    expect(
      kinds(`export function Button(props: P) {
        const kids = childrenOf(props);
        const other = childrenOf(props);
        return <View a={kids.label()}>{kids.content()}{other.content()}</View>;
      }`),
    ).toEqual([["count", "Button", 2]]);
  });

  test("one use of the helper's result passes, bound or not", () => {
    expect(
      scan(`export function Button(props: P) {
        const label = childrenOf(props).label;
        return <View a={label()} />;
      }`),
    ).toEqual([]);
  });

  test("the helper called inside a callback reads again on each call", () => {
    expect(
      kinds(`export function Button(props: P) {
        return <View onPress={() => childrenOf(props).label()} />;
      }`),
    ).toEqual([["nested", "Button", 1]]);
  });

  test("an aliased helper is the same helper", () => {
    expect(
      kinds(`import { childrenOf as kids } from "./lib/children";
      export function Button(props: P) {
        const one = childrenOf(props);
        const two = kids(props);
        return <View a={one.label()}>{one.content()}{two.content()}</View>;
      }`),
    ).toEqual([["count", "Button", 2]]);
  });

  test("a sanctioned read in a portal's content builder is one read", () => {
    expect(
      scan(`export function PopoverContent(props: P) {
        return <BasePopover>
          {() => (
            <PopIn>
              {/* children-lint: the panel's contents, built when it opens, not before. */}
              {props.children}
            </PopIn>
          )}
        </BasePopover>;
      }`),
    ).toEqual([]);
  });

  test("a sanctioned read is still the one read", () => {
    expect(
      kinds(
        `export function PopoverContent(props: P) {
        return <BasePopover>
          {() => (
            <PopIn>
              {/* children-lint: the panel's contents, built when it opens, not before. */}
              {props.children}
            </PopIn>
          )}
        </BasePopover>;
      }` +
          `
export function Other(props: P) { return <View>{props.children}</View>; }`,
      ),
    ).toEqual([]);
  });

  test("the comment does not make a second read fine", () => {
    expect(
      kinds(`export function PopoverContent(props: P) {
        const content = props.children;
        return <BasePopover>
          {() => (
            <PopIn>
              {/* children-lint: the panel's contents, built when it opens, not before. */}
              {props.children}
            </PopIn>
          )}
        </BasePopover>;
      }`),
    ).toEqual([["count", "PopoverContent", 2]]);
  });

  test("a file's components count their reads apart", () => {
    expect(
      scan(`export function First(props: P) {
        return <View>{props.children}</View>;
      }
      export function Second(props: P) {
        return <View>{props.children}</View>;
      }`),
    ).toEqual([]);
  });

  test("the helper's accessors are not reads, however often they are called", () => {
    expect(
      scan(`export function Item(props: P) {
        const kids = childrenOf(props);
        return <View a={kids.label()}>
          {kids.text() !== undefined ? <Text>{kids.text()}</Text> : kids.content()}
          {kids.content()}
          {kids.label()}
        </View>;
      }`),
    ).toEqual([]);
  });

  test("a second read beside the helper is still a violation", () => {
    expect(
      kinds(`export function Item(props: P) {
        const kids = childrenOf(props);
        return <View a={kids.label()}>{props.children}</View>;
      }`),
    ).toEqual([["count", "Item", 2]]);
  });

  test("children of something else are not the component's children", () => {
    expect(
      scan(`export function Group(props: P) {
        return <View>{props.items.map((item) => item.children)}</View>;
      }`),
    ).toEqual([]);
  });
});
