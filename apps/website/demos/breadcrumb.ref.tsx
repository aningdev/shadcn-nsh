// The reference of `breadcrumb.tsx`: the same page, the look spread on `nsh`'s View and Text (and
// `nsh/base`'s Link) instead of worn by the component. The render check requires the two to draw
// the same pixels.
import { ChevronRight, Ellipsis } from "lucide";
import type { JSX } from "nsh";
import { mount, signal, Text, View } from "nsh";
import { Link as BaseLink } from "nsh/base";

import { breadcrumbLook } from "@/packages/ui/breadcrumb";
import { Icon } from "@/packages/ui/lib/icons";

import { DemoCard, DemoPage, DemoSection } from "./kit";
import { desktop, ui } from "./stage";

/** The trail the page shows. */
const TRAIL = [
  { name: "Home", route: "/" },
  { name: "Components", route: "/components" },
  { name: "Breadcrumb", route: "/components/breadcrumb" },
];

/** The slash a caller passes as a separator of their own. */
const slash = () => <Text style={{ fontSize: 13, color: ui().muted }}>/</Text>;

function App() {
  const look = breadcrumbLook();
  const opened = signal<string | null>(null);
  const open = (route: string) => opened.set(route);
  const separator = (children?: JSX.Element) => (
    <View
      role="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[look.separator]}
    >
      {children ?? (
        <Icon icon={ChevronRight} size={look.separatorIcon.size} tint={look.separatorIcon.tint} />
      )}
    </View>
  );
  const link = (name: string, route: string) => (
    <BaseLink
      accessibilityLabel={name}
      onPress={() => open(route)}
      class={look.linkClass}
      style={[look.link]}
      focusVisibleStyle={[look.focusVisible]}
    >
      <Text class={look.linkTextClass} style={look.linkText}>
        {name}
      </Text>
    </BaseLink>
  );
  return (
    <DemoPage
      title="Breadcrumb"
      note={() =>
        opened() === null
          ? `${desktop ? "Click" : "Tap"} a step: it opens its route.`
          : `Opened ${opened()}`
      }
    >
      <Text style={{ color: ui().muted }}>
        {"Where the page sits: a row of quiet links, the page itself last."}
      </Text>

      <DemoCard>
        <DemoSection title="A trail" axis="block">
          <View role="navigation" accessibilityLabel="Breadcrumb" style={[look.root]}>
            <View style={[look.list]}>
              {TRAIL.map((step, i) => (
                <View style={[look.item]}>
                  {i === TRAIL.length - 1 ? (
                    <Text accessibilityState={{ current: "page" }} style={[look.page]}>
                      {step.name}
                    </Text>
                  ) : (
                    <>
                      {link(step.name, step.route)}
                      {separator()}
                    </>
                  )}
                </View>
              ))}
            </View>
          </View>
        </DemoSection>

        <DemoSection title="Steps left out" axis="block">
          <View role="navigation" accessibilityLabel="Breadcrumb" style={[look.root]}>
            <View style={[look.list]}>
              <View style={[look.item]}>
                {link("Home", "/")}
                {separator()}
              </View>
              <View style={[look.item]}>
                <View accessible accessibilityLabel="More" style={[look.ellipsis]}>
                  <Icon
                    icon={Ellipsis}
                    size={look.ellipsisIcon.size}
                    tint={look.ellipsisIcon.tint}
                  />
                </View>
                {separator()}
              </View>
              <View style={[look.item]}>
                {link("Components", "/components")}
                {separator()}
              </View>
              <View style={[look.item]}>
                <Text accessibilityState={{ current: "page" }} style={[look.page]}>
                  Breadcrumb
                </Text>
              </View>
            </View>
          </View>
        </DemoSection>

        <DemoSection title="A separator of your own" axis="block">
          <View role="navigation" accessibilityLabel="Breadcrumb" style={[look.root]}>
            <View style={[look.list]}>
              <View style={[look.item]}>
                {link("Home", "/")}
                {separator(slash())}
              </View>
              <View style={[look.item]}>
                {link("Components", "/components")}
                {separator(slash())}
              </View>
              <View style={[look.item]}>
                <Text accessibilityState={{ current: "page" }} style={[look.page]}>
                  Breadcrumb
                </Text>
              </View>
            </View>
          </View>
        </DemoSection>
      </DemoCard>
    </DemoPage>
  );
}

mount(App);
