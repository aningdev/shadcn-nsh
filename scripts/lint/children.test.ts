import { describe, expect, test } from "bun:test";

import { violations } from "./children";

const scan = (source: string) => violations(source, "probe.tsx");
const kinds = (source: string) => scan(source).map((v) => [v.kind, v.where, v.reads]);

describe("children rules", () => {
  test("one read is enough", () => {
    expect(
      scan(`export function Button(props: P) {
        const kids = props.children;
        return <View a={typeof kids === "string" ? kids : undefined}><AsText>{kids}</AsText></View>;
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
        return <View a={props.accessibilityLabel ?? props.children}>
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
            const kids = props.children;
            return typeof kids === "string" ? <Text style={look.label}>{kids}</Text> : kids;
          })()}
        </MarkerContext.Provider>;
      }`),
    ).toEqual([]);
  });

  test("a forward to AsText in the child position is the component's one read", () => {
    expect(
      scan(`export function Button(props: P) {
        return (
          <BaseButton>
            <AsText style={buttonLabel()}>{props.children}</AsText>
          </BaseButton>
        );
      }`),
    ).toEqual([]);
  });

  test("AsText itself reads once, in its own child position", () => {
    expect(
      scan(`export function AsText(props: P) {
        return (
          <>
            {(() => {
              const kids = props.children;
              return typeof kids === "string" ? <Text>{kids}</Text> : kids;
            })()}
          </>
        );
      }`),
    ).toEqual([]);
  });

  test("a read in a callback kept for later is reported", () => {
    expect(
      kinds(`export function Button(props: P) {
        return <View onPress={() => draw(props.children)} />;
      }`),
    ).toEqual([["nested", "Button", 1]]);
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

  test("children of something else are not the component's children", () => {
    expect(
      scan(`export function Group(props: P) {
        return <View>{props.items.map((item) => item.children)}</View>;
      }`),
    ).toEqual([]);
  });
});
