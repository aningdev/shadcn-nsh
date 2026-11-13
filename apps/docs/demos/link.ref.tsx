// The reference of `link.tsx`: the same scene with `linkLook` and `LinkText` on `nsh/base`'s
// Link, the way the official example (`references/nsh/website/demos/el-link.tsx`) writes it. It
// differs from the component page only in the parts it names.
import { colors } from "@shadcn-nsh/theme";
import { mount, signal, Text, View } from "nsh";
import { Link } from "nsh/base";

import { sectionSurface } from "@/packages/ui/lib/surface";
import { LinkText, linkColor, linkLook, linkSize } from "@/packages/ui/link";

import { DemoPage } from "./kit";
import { desktop, Log, Panel, Split } from "./stage";

const visited = signal(new Set<string>());
const events = signal<string[]>([]);
const route = signal("/docs/link");

const opened = ({ href }: { href: string }) => {
  visited.set(new Set(visited()).add(href));
  events.set([`onOpen ${href}`, ...events()].slice(0, 4));
};

function DocLink(props: {
  href: string;
  label: string;
  openWith?: "system" | "app";
  disabled?: boolean;
  current?: boolean;
  icon?: boolean;
  inline?: boolean;
}) {
  const look = linkLook({ inline: props.inline });
  // Read in the JSX, so the color follows the route, what was opened and the appearance.
  const color = () =>
    linkColor({
      disabled: props.disabled,
      current: props.current,
      visited: visited().has(props.href),
    });
  return (
    <Link
      href={props.href}
      openWith={props.openWith ?? "app"}
      disabled={props.disabled}
      class={look.class}
      focusVisibleStyle={look.focusVisibleStyle}
      onOpen={(e: { href: string }) => {
        opened(e);
        if ((props.openWith ?? "app") === "app") route.set(e.href);
      }}
    >
      <LinkText
        label={props.label}
        color={color()}
        current={props.current}
        disabled={props.disabled}
        icon={props.icon}
      />
    </Link>
  );
}

function App() {
  const crumb = (href: string, label: string) => (
    <DocLink href={href} label={label} current={route() === href} />
  );
  const slash = () => <Text style={{ color: colors.faint, fontSize: linkSize }}>/</Text>;
  return (
    <DemoPage title="Link">
      <Text style={{ color: colors.muted }}>
        {desktop ? "Click a link, or Tab to one and press Return" : "Tap a link"}
      </Text>

      <Split
        gap={14}
        inspector={
          <>
            <Panel title="route · visited">
              <Text style={{ fontSize: 13, color: colors.text }}>
                {route()} · {visited().size} visited
              </Text>
            </Panel>
            <Log title="onOpen({ href })" lines={events()} minHeight={110} />
          </>
        }
      >
        <View style={{ ...sectionSurface({ padded: true }), gap: 14 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {crumb("/docs", "Docs")}
            {slash()}
            {crumb("/docs/elements", "Elements")}
            {slash()}
            {crumb("/docs/link", "Link")}
          </View>
          <Text style={{ fontSize: 15, lineHeight: 22, color: colors.text }}>
            {"Read the "}
            <DocLink href="/docs/release-notes" label="release notes" inline />
            {" and the "}
            <DocLink href="/docs/migration" label="migration guide" inline />
            {" before you update."}
          </Text>
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ gap: 10 }}>
            <DocLink href="https://example.com/" label="example.com" openWith="system" icon />
            <DocLink href="/docs/archive" label="Archived docs" disabled />
          </View>
        </View>
      </Split>
    </DemoPage>
  );
}

mount(App);
